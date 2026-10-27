import {
  copyFileSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync
} from "node:fs";
import { createHash } from "node:crypto";
import { homedir } from "node:os";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const AGENT_IDS = ["codex", "claude", "cursor", "antigravity"] as const;
export type AgentId = typeof AGENT_IDS[number];

export interface AgentAdapter {
  readonly id: AgentId;
  readonly skillDirectory: string;
  detect(projectRoot: string): boolean;
  planInstall(projectRoot: string, skillAssets: readonly SkillAsset[]): InstallPlan;
  verify(projectRoot: string): VerificationResult;
}

interface Ownership {
  format: "udi-installation";
  version: 2;
  runtimePath: string;
  runtimeVersion: string;
  managedFiles: Record<string, string>;
}

function digest(content: string | Buffer): string {
  return createHash("sha256").update(content).digest("hex");
}

function readInstallationManifest(root: string): Ownership | undefined {
  const path = safeDestination(root, installationManifestRelativePath);
  ensureNoSymlinkParents(root, path);
  if (!existsSync(path)) return undefined;
  if (lstatSync(path).isSymbolicLink() || !lstatSync(path).isFile()) {
    throw new Error("Existing UDI installation manifest is not a regular file");
  }
  const manifest = JSON.parse(readFileSync(path, "utf8")) as Ownership;
  if (manifest.format !== "udi-installation" || manifest.version !== 2 ||
    typeof manifest.runtimePath !== "string" || typeof manifest.runtimeVersion !== "string" ||
    !manifest.managedFiles || typeof manifest.managedFiles !== "object" ||
    !Object.entries(manifest.managedFiles).every(([path, hash]) =>
      isManagedPath(path) && typeof hash === "string" && /^[a-f0-9]{64}$/.test(hash))) {
    throw new Error("Existing UDI installation manifest is invalid; inspect it before proceeding.");
  }
  return manifest;
}

function isManagedPath(path: string): boolean {
  return !path.includes("\\") && !path.split("/").includes("..") &&
    (path.startsWith(".udi/") || /^(?:\.agents|\.claude|\.cursor)\/skills\/udi-design\//.test(path) ||
      path.startsWith(".gemini/config/skills/udi-design/"));
}

export interface SkillAsset {
  readonly relativePath: string;
  readonly sourcePath: string;
}

export interface InstallFile {
  readonly path: string;
  readonly sourcePath?: string;
  readonly content?: string;
  readonly previousHash?: string;
}

export interface InstallPlan {
  readonly agentIds: readonly AgentId[];
  readonly files: readonly InstallFile[];
  readonly forceablePaths: readonly string[];
  readonly allowedRoots?: readonly string[];
}

export interface VerificationResult {
  readonly agentId: AgentId;
  readonly skillPath: string;
  readonly installed: boolean;
  readonly valid: boolean;
  readonly issues: readonly string[];
}

export interface InstallResult {
  readonly projectRoot: string;
  readonly agentIds: readonly AgentId[];
  readonly written: readonly string[];
  readonly unchanged: readonly string[];
  readonly dryRun: boolean;
}

export interface DoctorReport {
  readonly version: string;
  readonly installationVerified: boolean;
  readonly scope: "global" | "project";
  readonly configurationConflicts: readonly string[];
  readonly remediation: readonly string[];
  readonly runtime: {
    readonly requiredNode: string;
    readonly currentNode: string;
    readonly compatible: boolean;
    readonly path: string | null;
  };
  readonly availableAdapters: readonly AgentId[];
  readonly installations: readonly VerificationResult[];
  readonly packageAssets: {
    readonly valid: boolean;
    readonly issues: readonly string[];
  };
  readonly runtimeDiscovery: {
    readonly staticDiscoveryVerified: boolean;
    readonly actualRuntimeDiscoveryVerified: false;
    readonly note: string;
  };
}

const skillName = "udi-design";
const cliEntryPath = fileURLToPath(import.meta.url);
const cliAssetsDirectory = resolve(dirname(cliEntryPath), "skills/udi-design");
const packageManifestPath = resolve(dirname(cliEntryPath), "../package.json");
const installationManifestRelativePath = ".udi/installation.json";

function isSymlink(path: string): boolean {
  try { return lstatSync(path).isSymbolicLink(); } catch { return false; }
}

function pathExists(path: string): boolean {
  return existsSync(resolve(path));
}

function toPosixPath(path: string): string {
  return path.split(sep).join("/");
}

function readSkillMetadata(path: string): { name: string; description: string } | undefined {
  if (!existsSync(path)) return undefined;
  const source = readFileSync(path, "utf8");
  const frontmatter = source.match(/^---\s*\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)?.[1];
  if (!frontmatter) return undefined;
  const name = frontmatter.match(/^name:\s*([^\r\n]+)\s*$/m)?.[1]?.trim();
  const description = frontmatter.match(/^description:\s*(.+)\s*$/m)?.[1]?.trim();
  return name && description ? { name, description } : undefined;
}

function safeDestination(root: string, relativePath: string): string {
  if (isAbsolute(relativePath)) throw new Error(`Unsafe absolute installation path: ${relativePath}`);
  const destination = resolve(root, relativePath);
  const fromRoot = relative(root, destination);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    throw new Error(`Unsafe installation path outside project root: ${relativePath}`);
  }
  return destination;
}

function ensureNoSymlinkParents(root: string, target: string): void {
  const rootRealPath = realpathSync(root);
  const fromRoot = relative(rootRealPath, target);
  if (fromRoot === ".." || fromRoot.startsWith(`..${sep}`) || isAbsolute(fromRoot)) {
    throw new Error(`Installation path escapes project root: ${target}`);
  }
  let current = rootRealPath;
  for (const segment of dirname(fromRoot).split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    if (!existsSync(current) && !isSymlink(current)) continue;
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to write through symbolic link: ${current}`);
    }
    if (!stat.isDirectory()) throw new Error(`Installation parent is not a directory: ${current}`);
  }
}

function hasSymlinkInPath(root: string, target: string): boolean {
  const rootRealPath = realpathSync(root);
  let current = rootRealPath;
  for (const segment of relative(rootRealPath, target).split(sep).filter(Boolean)) {
    current = resolve(current, segment);
    if (isSymlink(current)) return true;
  }
  return false;
}

function createAdapter(
  id: AgentId,
  skillDirectory: string,
  markers: readonly string[]
): AgentAdapter {
  const skillPath = `${skillDirectory}/${skillName}`;
  return {
    id,
    skillDirectory,
    detect(projectRoot) {
      return markers.some((marker) => pathExists(resolve(projectRoot, marker))) ||
        pathExists(resolve(projectRoot, skillPath));
    },
    planInstall(projectRoot, skillAssets) {
      const files = skillAssets.map((asset) => ({
        path: safeDestination(projectRoot, `${skillPath}/${asset.relativePath}`),
        sourcePath: asset.sourcePath
      }));
      return {
        agentIds: [id],
        files,
        forceablePaths: files.map(({ path }) => relative(projectRoot, path))
      };
    },
    verify(projectRoot) {
      const absoluteSkillPath = safeDestination(projectRoot, skillPath);
      const skillFile = resolve(absoluteSkillPath, "SKILL.md");
      if ([absoluteSkillPath, skillFile, resolve(absoluteSkillPath, "references/udi-cli.md"),
        resolve(absoluteSkillPath, "references/design-quality.md")].some((path) => hasSymlinkInPath(projectRoot, path))) {
        return {
          agentId: id,
          skillPath: toPosixPath(relative(projectRoot, absoluteSkillPath)) || ".",
          installed: true,
          valid: false,
          issues: ["Skill path contains a symbolic link; no linked files were read"]
        };
      }
      const metadata = readSkillMetadata(skillFile);
      const issues: string[] = [];
      if (!existsSync(skillFile)) {
        issues.push("SKILL.md is missing");
      } else if (!metadata) {
        issues.push("SKILL.md frontmatter is missing required name or description");
      } else if (metadata.name !== skillName) {
        issues.push(`Skill metadata name must be ${skillName}`);
      } else if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.name) ||
        metadata.name.length > 64 || metadata.description.length > 1024) {
        issues.push("Skill metadata does not satisfy Agent Skills name/description constraints");
      }
      for (const asset of ["references/udi-cli.md", "references/design-quality.md"]) {
        const installedPath = resolve(absoluteSkillPath, asset);
        if (!existsSync(installedPath)) {
          issues.push(`${asset} is missing`);
        } else if (existsSync(resolve(cliAssetsDirectory, asset)) &&
          !readFileSync(installedPath).equals(readFileSync(resolve(cliAssetsDirectory, asset)))) {
          issues.push(`${asset} differs from the packaged UDI asset`);
        }
      }
      if (existsSync(skillFile) && existsSync(resolve(cliAssetsDirectory, "SKILL.md")) &&
        !readFileSync(skillFile).equals(readFileSync(resolve(cliAssetsDirectory, "SKILL.md")))) {
        issues.push("SKILL.md differs from the packaged UDI asset");
      }
      return {
        agentId: id,
        skillPath: toPosixPath(relative(projectRoot, absoluteSkillPath)) || ".",
        installed: existsSync(absoluteSkillPath),
        valid: issues.length === 0,
        issues
      };
    }
  };
}

export const agentAdapters: readonly AgentAdapter[] = [
  createAdapter("codex", ".agents/skills", [".codex", ".agents/skills"]),
  createAdapter("claude", ".claude/skills", [".claude"]),
  createAdapter("cursor", ".cursor/skills", [".cursor"]),
  createAdapter("antigravity", ".agents/skills", [".gemini", ".antigravity", ".agents/skills"])
];

export function getSkillAssets(): SkillAsset[] {
  return ["SKILL.md", "references/udi-cli.md", "references/design-quality.md"].map((relativePath) => ({
    relativePath,
    sourcePath: resolve(cliAssetsDirectory, relativePath)
  }));
}

export function detectProjectRoot(startDirectory: string): string {
  let current = realpathSync(resolve(startDirectory));
  while (true) {
    if (["package.json", "pnpm-workspace.yaml", "AGENTS.md", ".git"].some((file) =>
      pathExists(resolve(current, file)))) return current;
    const parent = resolve(current, "..");
    if (parent === current) return realpathSync(resolve(startDirectory));
    current = parent;
  }
}

export function selectAgents(projectRoot: string, requested: string): AgentAdapter[] {
  if (requested === "all") return [...agentAdapters];
  if (requested !== "auto") {
    const selected = agentAdapters.find(({ id }) => id === requested);
    if (!selected) throw new Error(`Unsupported agent "${requested}". Choose ${AGENT_IDS.join(", ")}, or all.`);
    return [selected];
  }
  const detected = agentAdapters.filter((adapter) => adapter.detect(projectRoot));
  if (detected.length === 1) return detected;
  if (detected.length > 1) {
    throw new Error(
      `Multiple agent configurations were detected (${detected.map(({ id }) => id).join(", ")}). ` +
      "Choose one explicitly with --agent, or use --agent all."
    );
  }
  throw new Error(
    "No supported agent configuration was detected. Choose --agent codex, claude, cursor, antigravity, or all."
  );
}

export function userHome(): string { return realpathSync(homedir()); }
export function runtimeStore(): string { return resolve(process.env.UDI_HOME || resolve(userHome(), ".udi")); }
export function scopedAdapters(global = false): readonly AgentAdapter[] {
  return global ? agentAdapters.map((adapter) => adapter.id === "antigravity"
    ? createAdapter("antigravity", ".gemini/config/skills", [".gemini"])
    : adapter) : agentAdapters;
}

export interface InstallOptions {
  global?: boolean;
  portable?: boolean;
  installRuntime?: boolean;
}

function runtimeFiles(runtime: string): InstallFile[] {
  return [
    { path: resolve(runtime, "bin/index.js"), sourcePath: cliEntryPath },
    { path: resolve(runtime, "package.json"), content: JSON.stringify({ name: "udi-runtime", version: getCliVersion(), type: "module" }) + "\n" },
    ...["LICENSE", "THIRD_PARTY_NOTICES.md"].map((name) => ({ path: resolve(runtime, name), sourcePath: resolve(dirname(packageManifestPath), name) })),
    ...getSkillAssets().map((asset) => ({ path: resolve(runtime, "bin/skills/udi-design", asset.relativePath), sourcePath: asset.sourcePath }))
  ];
}

function existingAncestor(path: string): string {
  let current = path;
  while (!existsSync(current)) {
    if (isSymlink(current)) throw new Error(`Refusing symbolic link: ${current}`);
    current = dirname(current);
  }
  if (isSymlink(current)) throw new Error(`Refusing symbolic link: ${current}`);
  return realpathSync(current);
}

function runtimeIssues(runtime: string): string[] {
  const issues: string[] = [];
  const anchor = existingAncestor(runtime);
  for (const file of runtimeFiles(runtime)) {
    try {
      ensureNoSymlinkParents(anchor, file.path);
      if (isSymlink(file.path)) throw new Error("symbolic link");
      if (!existsSync(file.path)) { issues.push(`Missing runtime file: ${file.path}`); continue; }
      const expected = file.content !== undefined ? Buffer.from(file.content) : readFileSync(file.sourcePath!);
      if (!readFileSync(file.path).equals(expected)) issues.push(`Runtime version/integrity mismatch: ${file.path}`);
    } catch { issues.push(`Unsafe or unreadable runtime file: ${file.path}`); }
  }
  return issues;
}

export function planInstall(
  projectRoot: string,
  adapters: readonly AgentAdapter[],
  assets = getSkillAssets(),
  options: InstallOptions = {}
): InstallPlan {
  if (options.global && options.portable) throw new Error("--portable cannot be combined with --global");
  const runtime = options.portable
    ? resolve(projectRoot, ".udi/runtimes", getCliVersion())
    : resolve(runtimeStore(), "runtimes", getCliVersion());
  const mayCreateRuntime = options.global || options.portable || options.installRuntime;
  const issues = runtimeIssues(runtime);
  if (!mayCreateRuntime && issues.length) {
    throw new Error(`Compatible UDI runtime missing or invalid at ${runtime}. ` +
      "Choose --install-runtime to install the user runtime, or --portable for a self-contained offline project. " + issues.join("; "));
  }
  const fileMap = new Map<string, InstallFile>();
  for (const adapter of adapters) {
    for (const file of adapter.planInstall(projectRoot, assets).files) fileMap.set(file.path, file);
    const launcherPath = safeDestination(projectRoot, `${adapter.skillDirectory}/udi-design/scripts/udi.mjs`);
    const target = options.portable
      ? `new URL(${JSON.stringify(toPosixPath(relative(dirname(launcherPath), resolve(runtime, "bin/index.js"))))}, import.meta.url)`
      : JSON.stringify(pathToFileURL(resolve(runtime, "bin/index.js")).href);
    fileMap.set(launcherPath, { path: launcherPath, content:
      `// UDI ${getCliVersion()} runtime launcher; generated by udi init.\nimport { readFileSync } from "node:fs";\nconst entry = ${target};\ntry { if (JSON.parse(readFileSync(new URL("../package.json", entry), "utf8")).version !== ${JSON.stringify(getCliVersion())}) throw new Error("runtime version mismatch"); await import(entry); } catch (error) { console.error("UDI runtime unavailable or incompatible. Run udi doctor and reinstall with --install-runtime or --portable.", error.message); process.exitCode = 1; }\n` });
  }
  const prior = readInstallationManifest(projectRoot);
  // Preserve ownership for agents installed by previous invocations.
  const managedFiles: Record<string, string> = { ...prior?.managedFiles };
  for (const file of fileMap.values()) managedFiles[toPosixPath(relative(projectRoot, file.path))] = digest(file.content ?? readFileSync(file.sourcePath!));
  const manifestPath = safeDestination(projectRoot, installationManifestRelativePath);
  fileMap.set(manifestPath, { path: manifestPath, ...(prior ? { previousHash: digest(readFileSync(manifestPath)) } : {}), content: JSON.stringify({
    format: "udi-installation", version: 2, runtimePath: options.portable ? toPosixPath(relative(projectRoot, runtime)) : runtime,
    runtimeVersion: getCliVersion(), managedFiles
  }, null, 2) + "\n" });
  const forceablePaths = Object.keys(prior?.managedFiles ?? {}).map((path) => resolve(projectRoot, path));
  if (prior) forceablePaths.push(manifestPath);
  if (mayCreateRuntime) {
    // A versioned runtime is immutable: never overwrite different existing content, even with --force.
    for (const file of runtimeFiles(runtime)) fileMap.set(file.path, file);
  }
  return { agentIds: adapters.map(({ id }) => id), files: [...fileMap.values()],
    forceablePaths, allowedRoots: [projectRoot, ...(mayCreateRuntime ? [runtime] : [])] };
}

function getCliVersion(): string {
  return (JSON.parse(readFileSync(packageManifestPath, "utf8")) as { version: string }).version;
}

export function installPlan(plan: InstallPlan, dryRun = false, force = false, projectRoot = process.cwd()): InstallResult {
  const written: string[] = [];
  const unchanged: string[] = [];
  const root = realpathSync(projectRoot);
  const checks = plan.files.map((file) => {
    const absolute = resolve(file.path);
    const allowedRoot = (plan.allowedRoots ?? [root]).find((candidate) => {
      const rel = relative(candidate, absolute);
      return rel !== ".." && !rel.startsWith(`..${sep}`) && !isAbsolute(rel);
    });
    if (!allowedRoot) throw new Error(`Refusing to install outside project root: ${file.path}`);
    const nativeRelativePath = relative(allowedRoot, absolute);
    const relativePath = toPosixPath(nativeRelativePath);
    if (nativeRelativePath === ".." || nativeRelativePath.startsWith(`..${sep}`) || isAbsolute(nativeRelativePath)) {
      throw new Error(`Refusing to install outside project root: ${file.path}`);
    }
    ensureNoSymlinkParents(existingAncestor(allowedRoot), absolute);
    const expected = file.content !== undefined ? Buffer.from(file.content) : readFileSync(file.sourcePath!);
    if (existsSync(absolute) || isSymlink(absolute)) {
      const stat = lstatSync(absolute);
      if (stat.isSymbolicLink()) throw new Error(`Refusing to overwrite symbolic link: ${absolute}`);
      if (!stat.isFile()) throw new Error(`Installation target is not a regular file: ${absolute}`);
      const current = readFileSync(absolute);
      if (current.equals(expected)) return { file, absolute, unchanged: true };
      if (file.previousHash === digest(current)) return { file, absolute, unchanged: false };
      if (!force) throw new Error(`Refusing to overwrite modified file ${relativePath}; review it or rerun with --force.`);
      if (!plan.forceablePaths.includes(absolute)) {
        throw new Error(`Refusing to replace unowned file ${relativePath}; move it first or review the existing UDI installation manifest.`);
      }
    }
    return { file, absolute, unchanged: false };
  });
  if (!dryRun) {
    for (const { file, absolute, unchanged: isUnchanged } of checks) {
      if (isUnchanged) {
        unchanged.push(toPosixPath(relative(root, absolute)));
        continue;
      }
      mkdirSync(dirname(absolute), { recursive: true });
      if (file.content !== undefined) writeFileSync(absolute, file.content, { flag: "w" });
      else copyFileSync(file.sourcePath!, absolute);
      written.push(toPosixPath(relative(root, absolute)));
    }
  }
  return {
    projectRoot: root,
    agentIds: plan.agentIds,
    written: dryRun ? checks.filter(({ unchanged: same }) => !same).map(({ absolute }) => toPosixPath(relative(root, absolute))) : written,
    unchanged: dryRun ? checks.filter(({ unchanged: same }) => same).map(({ absolute }) => toPosixPath(relative(root, absolute))) : unchanged,
    dryRun
  };
}

export function getDoctorReport(projectRoot: string, global = false): DoctorReport {
  const installations = scopedAdapters(global).map((adapter) => adapter.verify(projectRoot));
  const installed = installations.filter((item) => item.installed);
  const assetIssues = getSkillAssets().filter((asset) => !existsSync(asset.sourcePath)).map((asset) => `Missing packaged asset: ${asset.relativePath}`);
  const conflicts: string[] = [];
  let runtimePath: string | null = null;
  try {
    const manifest = readInstallationManifest(projectRoot);
    if (!manifest) {
      if (installed.length) conflicts.push("UDI ownership manifest is missing");
    } else {
      if (manifest.runtimeVersion !== getCliVersion()) conflicts.push("Runtime version mismatch; reinstall with the matching CLI version");
      runtimePath = resolve(projectRoot, manifest.runtimePath);
      conflicts.push(...runtimeIssues(runtimePath));
      for (const [path, hash] of Object.entries(manifest.managedFiles)) {
        const target = safeDestination(projectRoot, path);
        if (hasSymlinkInPath(projectRoot, target) || !existsSync(target) ||
          digest(readFileSync(target)) !== hash) conflicts.push(`Owned file missing or modified: ${path}`);
      }
      for (const item of installed) {
        const expected = `${item.skillPath}/scripts/udi.mjs`;
        if (!manifest.managedFiles[expected]) conflicts.push(`Unowned skill launcher: ${expected}`);
      }
    }
  } catch (error) { conflicts.push(error instanceof Error ? error.message : String(error)); }
  const compatible = Number(process.versions.node.split(".")[0]) >= 22;
  return {
    version: getCliVersion(), scope: global ? "global" : "project",
    installationVerified: installed.length > 0 && installed.every((item) => item.valid) && conflicts.length === 0 && compatible && assetIssues.length === 0,
    configurationConflicts: conflicts,
    remediation: ["Review changed files; run udi init with the same scope and agent. Choose --install-runtime or --portable if the runtime is missing. Use --force only after reviewing owned file changes."],
    runtime: { requiredNode: ">=22", currentNode: process.version, compatible, path: runtimePath },
    availableAdapters: [...AGENT_IDS], installations,
    packageAssets: { valid: assetIssues.length === 0, issues: assetIssues },
    runtimeDiscovery: {
      staticDiscoveryVerified: installed.length > 0 && installed.every((item) => item.valid),
      actualRuntimeDiscoveryVerified: false,
      note: "UDI verifies skill files and documented discovery locations, not whether an AI host loaded the skill at runtime."
    }
  };
}

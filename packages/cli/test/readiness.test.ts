import { createHash } from "node:crypto";
import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const entry = join(packageRoot, "dist/index.js");
const fixture = fileURLToPath(new URL("../../../tests/mission008/commerce-admin.json", import.meta.url));
const v2 = ["recommend", "--schema-version", "2.0", "--context", fixture, "--json"];
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const baseline: Array<{ args: string[]; status: number; stdoutSha256: string; stderr: string }> = JSON.parse(readFileSync(new URL("../../../tests/mission008_1/compatibility-baseline.json", import.meta.url), "utf8"));
function run(binary: string, args: string[], cwd = process.cwd(), env = process.env) {
  const result = spawnSync(process.execPath, [binary, ...args], { cwd, env, encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
}
function inventory(root: string): Record<string, string> {
  const files: Record<string, string> = {};
  for (const path of readdirSync(root, { recursive: true, encoding: "utf8" }).sort()) {
    const absolute = join(root, path);
    // Our fixtures create only regular files/directories and known launchers.
    if (existsSync(absolute) && statSync(absolute).isFile()) files[path] = hash(readFileSync(absolute));
  }
  return files;
}
function copyPackage(root: string, version: string): string {
  mkdirSync(root, { recursive: true });
  cpSync(join(packageRoot, "dist"), join(root, "dist"), { recursive: true });
  for (const file of ["LICENSE", "THIRD_PARTY_NOTICES.md"]) cpSync(join(packageRoot, file), join(root, file));
  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));
  manifest.version = version;
  writeFileSync(join(root, "package.json"), JSON.stringify(manifest));
  return join(root, "dist/index.js");
}

describe("Mission 008.1 release readiness", () => {
  it.each(baseline)("preserves pre-optimization output/error behavior: $args", sample => {
    const result = run(entry, sample.args);
    expect(result.status, result.stderr).toBe(sample.status);
    expect(hash(result.stdout)).toBe(sample.stdoutSha256);
    expect(result.stderr).toBe(sample.stderr);
  });

  it.each([
    { args: ["--version"], legacy: 0, enhanced: 0 },
    { args: ["search", "keyboard focus", "--json"], legacy: 1, enhanced: 0 },
    { args: ["recommend", "--type", "dashboard", "--json"], legacy: 1, enhanced: 0 },
    { args: v2, legacy: 1, enhanced: 1 }
  ])("initializes only the selected command's schemas: $args", sample => {
    const root = mkdtempSync(join(tmpdir(), "udi-lazy-"));
    try {
      const result = run(entry, sample.args, process.cwd(), { ...process.env, NODE_V8_COVERAGE: root });
      expect(result.status, result.stderr).toBe(0);
      const scripts = readdirSync(root).filter(file => file.endsWith(".json")).flatMap(file => JSON.parse(readFileSync(join(root, file), "utf8")).result);
      const script = scripts.find(script => script.url === pathToFileURL(entry).href);
      expect(script).toBeDefined();
      const count = (suffix: string) => {
        const fn = script.functions.find((fn: { functionName: string }) => fn.functionName.endsWith(`/knowledge/src/${suffix}.ts`));
        expect(fn).toBeDefined();
        return fn.ranges[0].count;
      };
      expect(count("schemas")).toBe(sample.legacy);
      expect(count("catalog")).toBe(sample.legacy);
      expect(count("v2-schemas")).toBe(sample.enhanced);
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it("never overwrites an existing v0.1.0 runtime and preserves pinned launchers across versions", () => {
    const root = mkdtempSync(join(tmpdir(), "udi-version-boundary-"));
    try {
      const home = join(root, "home"); const store = join(root, "store"); const project = join(root, "project");
      for (const path of [home, project]) mkdirSync(path);
      const env = { ...process.env, HOME: home, USERPROFILE: home, UDI_HOME: store };
      expect(run(entry, ["init", "--global", "--agent", "codex"], project, env).status).toBe(0);
      expect(run(entry, ["init", "--agent", "codex"], project, env).status).toBe(0);
      const original = join(store, "runtimes/0.1.0/bin/index.js");
      // Stand in for different immutable bytes belonging to an earlier same-version distribution.
      writeFileSync(original, readFileSync(original, "utf8") + "\n// Earlier immutable v0.1.0 fixture bytes\n");
      const before = inventory(root);
      for (const args of [["init", "--global", "--agent", "codex", "--force"], ["init", "--agent", "codex", "--install-runtime", "--force"]]) {
        const result = run(entry, args, project, env);
        expect(result.status).toBe(1);
        expect(result.stderr).toContain("Refusing to replace unowned file");
        expect(inventory(root)).toEqual(before);
      }
      const next = copyPackage(join(root, "next-tool"), "0.1.1"); // Fixture only; no release/version change in the repository.
      const installedOld = inventory(join(store, "runtimes/0.1.0"));
      const beforeUpgrade = inventory(root);
      const previewRequired = run(next, ["init", "--global", "--agent", "codex"], project, env);
      expect(previewRequired.status).toBe(1);
      expect(previewRequired.stderr).toContain("review it or rerun with --force");
      expect(inventory(root)).toEqual(beforeUpgrade);
      const upgrade = run(next, ["init", "--global", "--agent", "codex", "--force"], project, env);
      expect(upgrade.status, upgrade.stderr).toBe(0);
      expect(inventory(join(store, "runtimes/0.1.0"))).toEqual(installedOld);
      expect(readdirSync(join(store, "runtimes")).sort()).toEqual(["0.1.0", "0.1.1"]);
      const launcher = join(project, ".agents/skills/udi-design/scripts/udi.mjs");
      expect(run(launcher, ["--version"], project, env).stdout.trim()).toBe("0.1.0");
      expect(run(join(home, ".agents/skills/udi-design/scripts/udi.mjs"), ["--version"], project, env).stdout.trim()).toBe("0.1.1");
      const oldManifest = join(store, "runtimes/0.1.0/package.json");
      const manifest = JSON.parse(readFileSync(oldManifest, "utf8")); manifest.version = "0.1.1";
      writeFileSync(oldManifest, JSON.stringify(manifest));
      const mismatch = run(launcher, ["--version"], project, env);
      expect(mismatch.status).toBe(1);
      expect(mismatch.stderr).toContain("runtime version mismatch");
    } finally { rmSync(root, { recursive: true, force: true }); }
  }, 30000);

  it("runs all retrieval paths from an offline tarball without workspace dependencies", () => {
    const root = mkdtempSync(join(tmpdir(), "udi-packed-ready-"));
    try {
      const packed = spawnSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", root], { cwd: packageRoot, encoding: "utf8" });
      expect(packed.error).toBeUndefined(); expect(packed.status, packed.stderr).toBe(0);
      const archive = join(root, JSON.parse(packed.stdout)[0].filename);
      const extracted = spawnSync("tar", ["-xf", archive, "-C", root], { encoding: "utf8" });
      expect(extracted.status, extracted.stderr).toBe(0);
      const runtime = join(root, "package/dist/index.js");
      const tripwire = fileURLToPath(new URL("../../../tests/mission008/deny-network.cjs", import.meta.url));
      for (const args of [["--version"], ["search", "keyboard focus", "--json"], ["recommend", "--type", "dashboard", "--json"], v2]) {
        const result = spawnSync(process.execPath, ["--require", tripwire, runtime, ...args], { cwd: root, encoding: "utf8", env: { ...process.env, NODE_PATH: "" } });
        expect(result.error).toBeUndefined(); expect(result.status, result.stderr).toBe(0);
        expect(result.stdout).toBe(run(entry, args).stdout);
      }
      expect(existsSync(resolve(root, "package/node_modules"))).toBe(false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }, 30000);
});

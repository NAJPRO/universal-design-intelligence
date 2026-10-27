import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const builtEntry = join(packageRoot, "dist/index.js");

function fixture(test: (f: { root: string; home: string; project: string; store: string; run: (args: string[], entry?: string) => ReturnType<typeof spawnSync<string>> }) => void) {
  const root = mkdtempSync(join(tmpdir(), "udi-decoupled-"));
  const home = join(root, "home");
  const project = join(root, "application");
  const store = join(root, "runtime store");
  mkdirSync(home); mkdirSync(project);
  const protectedFiles = ["package.json", "package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "node_modules/user-package/index.js"];
  for (const path of protectedFiles) {
    mkdirSync(resolve(project, path, ".."), { recursive: true });
    writeFileSync(join(project, path), path === "package.json" ? '{"name":"untouched-app"}\n' : `untouched ${path}\n`);
  }
  const before = protectedFiles.map((path) => readFileSync(join(project, path)));
  const run = (args: string[], entry = builtEntry) => spawnSync(process.execPath, [entry, ...args], {
    cwd: project, encoding: "utf8", env: { ...process.env, HOME: home, USERPROFILE: home, UDI_HOME: store }
  });
  try {
    test({ root, home, project, store, run });
    protectedFiles.forEach((path, i) => expect(readFileSync(join(project, path))).toEqual(before[i]));
    expect(readdirSync(join(project, "node_modules"))).toEqual(["user-package"]);
  } finally { rmSync(root, { recursive: true, force: true }); }
}

function succeeds(result: ReturnType<typeof spawnSync<string>>) {
  expect(result.stderr, result.stderr).toBe("");
  expect(result.status, result.stderr).toBe(0);
}

const launcher = ".agents/skills/udi-design/scripts/udi.mjs";

describe("decoupled installations", () => {
  it("requires an explicit runtime choice and keeps dry runs read-only", () => fixture(({ run, home, store, project }) => {
    const missing = run(["init", "--agent", "codex"]);
    expect(missing.status).toBe(1);
    expect(missing.stderr).toContain("--install-runtime");
    expect(missing.stderr).toContain("--portable");
    succeeds(run(["init", "--global", "--agent", "all", "--dry-run"]));
    succeeds(run(["init", "--agent", "all", "--install-runtime", "--dry-run"]));
    expect(readdirSync(home)).toEqual([]);
    expect(existsSync(store)).toBe(false);
    expect(existsSync(join(project, ".udi"))).toBe(false);
  }));

  it("installs all global agents sharing one runtime and reuses it in projects", () => fixture(({ run, home, project, store }) => {
    succeeds(run(["init", "--global", "--agent", "all"]));
    expect(readdirSync(join(store, "runtimes"))).toEqual(["0.1.0"]);
    for (const path of [".agents/skills", ".claude/skills", ".cursor/skills", ".gemini/config/skills"]) {
      expect(existsSync(join(home, path, "udi-design/SKILL.md"))).toBe(true);
    }
    succeeds(run(["search", "focus", "--json"], join(home, launcher)));
    succeeds(run(["doctor", "--global", "--json"]));
    const repeat = run(["init", "--global", "--agent", "all"]);
    succeeds(repeat); expect(repeat.stdout).not.toContain("Created/updated");
    succeeds(run(["init", "--agent", "codex"]));
    succeeds(run(["init", "--agent", "claude"]));
    succeeds(run(["init", "--agent", "all"]));
    expect(existsSync(join(project, ".udi/runtimes"))).toBe(false);
    succeeds(run(["doctor", "--json"]));
    succeeds(run(["recommend", "--type", "saas", "--json"], join(project, launcher)));
  }));

  it("supports global defaults and explicit user-runtime creation", () => fixture(({ run, project }) => {
    succeeds(run(["init", "--global"]));
    succeeds(run(["init", "--agent", "codex", "--install-runtime"]));
    succeeds(run(["search", "labels"], join(project, launcher)));
    expect(run(["init", "--global", "--portable"]).status).toBe(1);
  }));

  it("uses ~/.udi by default without requiring a published package", () => fixture(({ home, project }) => {
    const result = spawnSync(process.execPath, [builtEntry, "init", "--global", "--agent", "codex"], {
      cwd: project, encoding: "utf8", env: { ...process.env, HOME: home, USERPROFILE: home, UDI_HOME: "" }
    });
    succeeds(result);
    expect(existsSync(join(home, ".udi/runtimes/0.1.0/bin/index.js"))).toBe(true);
  }));

  it("keeps portable projects offline and movable without any user runtime", () => fixture(({ run, root, project, store, home }) => {
    succeeds(run(["init", "--portable", "--agent", "codex"]));
    succeeds(run(["doctor", "--json"]));
    expect(existsSync(store)).toBe(false); expect(readdirSync(home)).toEqual([]);
    const moved = join(root, "moved project");
    renameSync(project, moved);
    try {
      const result = spawnSync(process.execPath, [join(moved, launcher), "search", "labels", "--json"], { cwd: root, encoding: "utf8" });
      succeeds(result); expect(JSON.parse(result.stdout).length).toBeGreaterThan(0);
    } finally { renameSync(moved, project); }
  }));

  it("detects runtime version mismatch and missing runtime without executing either", () => fixture(({ run, project, store }) => {
    succeeds(run(["init", "--agent", "codex", "--install-runtime"]));
    writeFileSync(join(store, "runtimes/0.1.0/package.json"), '{"version":"99.0.0","type":"module"}');
    expect(run(["doctor", "--json"]).status).toBe(1);
    expect(run(["search", "labels"], join(project, launcher)).stderr).toContain("version mismatch");
    expect(run(["init", "--agent", "codex"]).status).toBe(1);
    expect(run(["init", "--agent", "codex", "--install-runtime", "--force"]).status).toBe(1);
    rmSync(store, { recursive: true });
    expect(run(["doctor", "--json"]).status).toBe(1);
    expect(run(["search", "labels"], join(project, launcher)).status).toBe(1);
  }));

  it("preserves modified and unowned skills, even with force for unowned files", () => fixture(({ run, project }) => {
    const path = join(project, ".agents/skills/udi-design/SKILL.md");
    mkdirSync(resolve(path, ".."), { recursive: true }); writeFileSync(path, "user skill");
    expect(run(["init", "--portable", "--agent", "codex", "--force"]).status).toBe(1);
    expect(existsSync(join(project, ".udi"))).toBe(false);
    rmSync(path);
    succeeds(run(["init", "--portable", "--agent", "codex"]));
    writeFileSync(path, "modified");
    expect(run(["init", "--portable", "--agent", "codex"]).status).toBe(1);
    expect(run(["doctor", "--json"]).status).toBe(1);
    succeeds(run(["init", "--portable", "--agent", "codex", "--force"]));
  }));

  it("runs an offline tarball outside the monorepo without installing application dependencies", () => fixture(({ run, root, project, store }) => {
    const packed = spawnSync("npm", ["pack", "--json", "--pack-destination", root], { cwd: packageRoot, encoding: "utf8" });
    succeeds({ ...packed, stderr: packed.status === 0 ? "" : packed.stderr });
    const filename = (JSON.parse(packed.stdout) as { filename: string }[])[0]!.filename;
    const toolPrefix = join(root, "tool installation");
    const npmArgs = ["--global", "--prefix", toolPrefix];
    const installedTool = spawnSync("npm", ["install", ...npmArgs, "--offline", "--ignore-scripts", "--no-audit", "--no-fund", join(root, filename)], { cwd: root, encoding: "utf8" });
    succeeds(installedTool);
    const npmRoot = spawnSync("npm", ["root", ...npmArgs], { cwd: root, encoding: "utf8" });
    succeeds(npmRoot);
    const entry = join(npmRoot.stdout.trim(), "universal-design-intelligence/dist/index.js");
    succeeds(run(["init", "--global", "--agent", "all"], entry));
    succeeds(run(["init", "--agent", "all"], entry));
    // Remove the extracted distribution: installed runtime must stand alone.
    rmSync(toolPrefix, { recursive: true });
    const installed = join(store, "runtimes/0.1.0/bin/index.js");
    succeeds(run(["doctor", "--json"], installed));
    succeeds(run(["doctor", "--global", "--json"], installed));
    succeeds(run(["recommend", "--type", "fintech", "--json"], join(project, launcher)));
    succeeds(run(["init", "--portable", "--agent", "all", "--force"], installed));
    rmSync(store, { recursive: true });
    succeeds(run(["search", "dashboard", "--json"], join(project, launcher)));
    succeeds(run(["doctor", "--json"], join(project, ".udi/runtimes/0.1.0/bin/index.js")));
  }), 30000);
});

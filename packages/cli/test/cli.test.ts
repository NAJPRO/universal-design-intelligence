import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, mkdirSync, readFileSync, rmSync, symlinkSync, unlinkSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { describe, expect, it } from "vitest";
import {
  agentAdapters,
  detectProjectRoot,
  getDoctorReport,
  installPlan,
  planInstall,
  selectAgents
} from "../src/agent-install.js";

const entryPoint = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const runCli = (cwd: string, ...args: string[]) =>
  spawnSync(process.execPath, [entryPoint, ...args, ...(args[0] === "init" ? ["--portable"] : [])], { cwd, encoding: "utf8" });

function withProject(test: (root: string) => void): void {
  const root = mkdtempSync(join(tmpdir(), "udi-init-test-"));
  try {
    writeFileSync(join(root, "package.json"), JSON.stringify({ name: "fixture" }));
    test(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

describe("UDI CLI", () => {
  it("prints its package version", () => {
    const result = runCli(process.cwd(), "--version");

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("0.1.0");
  });

  it("searches locally and prints structured results with filters", () => {
    const result = runCli(process.cwd(),
      "search", "form labels", "--category", "forms", "--type", "saas", "--framework", "react", "--json"
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    const results = JSON.parse(result.stdout) as Array<{ ruleId: string; sourceIds: string[] }>;
    expect(results.length).toBeGreaterThan(0);
    expect(results.every(({ ruleId }) => ruleId.startsWith("UDI-FOR-"))).toBe(true);
    expect(results[0]?.sourceIds).toContain("SRC-UDI-ORIGINAL");
  });

  it("prints readable search output and a useful empty-result message", () => {
    const matched = runCli(process.cwd(), "search", "keyboard focus", "--limit", "2");
    expect(matched.stdout).toContain("Search results for");
    expect(matched.stdout).toContain("UDI-ACC-002");

    const empty = runCli(process.cwd(), "search", "orbital volcano");
    expect(empty.status).toBe(0);
    expect(empty.stdout).toContain("No matching design rules");
  });

  it("recommends a context-aware direction and emits versioned JSON", () => {
    const result = runCli(process.cwd(),
      "recommend", "--type", "saas", "--style", "premium",
      "--audience", "enterprise operations teams", "--preserve-brand", "--json"
    );

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    const recommendation = JSON.parse(result.stdout) as {
      schemaVersion: string;
      engine: string;
      profile: { id: string };
      direction: { color: string };
      sourceRuleIds: string[];
    };
    expect(recommendation.schemaVersion).toBe("1.0");
    expect(recommendation.engine).toBe("udi-deterministic");
    expect(recommendation.profile.id).toBe("PRO-ENTERPRISE-DASHBOARD");
    expect(recommendation.direction.color).toContain("Preserve");
    expect(recommendation.sourceRuleIds.length).toBeGreaterThan(0);
  });

  it("rejects invalid filters and limits with actionable errors", () => {
    const invalidCategory = runCli(process.cwd(), "search", "forms", "--category", "invented-category");
    expect(invalidCategory.status).not.toBe(0);
    expect(invalidCategory.stderr).toContain("is invalid");

    const invalidLimit = runCli(process.cwd(), "search", "forms", "--limit", "0");
    expect(invalidLimit.status).not.toBe(0);
    expect(invalidLimit.stderr).toContain("limit must be a whole number between 1 and 100");
  });

  it("includes the canonical design skill as a runtime asset", () => {
    const skillPath = new URL("../dist/skills/udi-design/SKILL.md", import.meta.url);

    expect(readFileSync(skillPath, "utf8")).toContain("name: udi-design");
  });

  it("includes the project license in the distributable assets", () => {
    const licensePath = new URL("../LICENSE", import.meta.url);

    expect(readFileSync(licensePath, "utf8")).toContain("MIT License");
  });

  it("includes the executable and all progressive-disclosure assets in the npm tarball", () => {
    const result = spawnSync("npm", ["pack", "--dry-run", "--json"], { cwd: packageRoot, encoding: "utf8" });
    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    const packed = JSON.parse(result.stdout) as Array<{ files: Array<{ path: string }> }>;
    const paths = new Set(packed[0]?.files.map(({ path }) => path));
    expect(paths.has("dist/index.js")).toBe(true);
    expect(paths.has("dist/skills/udi-design/SKILL.md")).toBe(true);
    expect(paths.has("dist/skills/udi-design/references/udi-cli.md")).toBe(true);
    expect(paths.has("dist/skills/udi-design/references/design-quality.md")).toBe(true);
  }, 15_000);

  it("installs a project-local skill and the bundled CLI runtime", () => {
    withProject((root) => {
      const result = runCli(root, "init", "--agent", "claude");
      expect(result.status).toBe(0);
      expect(result.stdout).toContain(".claude/skills/udi-design/SKILL.md");
      expect(existsSync(join(root, ".claude/skills/udi-design/SKILL.md"))).toBe(true);
      expect(existsSync(join(root, ".udi/runtimes/0.1.0/bin/index.js"))).toBe(true);
      expect(existsSync(join(root, ".udi/runtimes/0.1.0/package.json"))).toBe(true);

      const search = spawnSync(process.execPath, [join(root, ".udi/runtimes/0.1.0/bin/index.js"), "search", "accessible form labels", "--json"], {
        cwd: root,
        encoding: "utf8"
      });
      expect(search.status).toBe(0);
      expect(JSON.parse(search.stdout).length).toBeGreaterThan(0);

      const doctor = runCli(root, "doctor", "--json");
      const report = JSON.parse(doctor.stdout) as {
        installationVerified: boolean;
        runtimeDiscovery: { staticDiscoveryVerified: boolean; actualRuntimeDiscoveryVerified: boolean };
        installations: Array<{ agentId: string; valid: boolean }>;
      };
      expect(report.installationVerified).toBe(true);
      expect(report.runtimeDiscovery.staticDiscoveryVerified).toBe(true);
      expect(report.runtimeDiscovery.actualRuntimeDiscoveryVerified).toBe(false);
      expect(report.installations.find(({ agentId }) => agentId === "claude")?.valid).toBe(true);
    });
  });

  it("keeps repeated installation idempotent and previews without writing", () => {
    withProject((root) => {
      const preview = runCli(root, "init", "--agent", "cursor", "--dry-run");
      expect(preview.status).toBe(0);
      expect(preview.stdout).toContain("Dry run: no files were written.");
      expect(existsSync(join(root, ".udi"))).toBe(false);
      expect(existsSync(join(root, ".cursor"))).toBe(false);

      expect(runCli(root, "init", "--agent", "cursor").status).toBe(0);
      const repeated = runCli(root, "init", "--agent", "cursor");
      expect(repeated.status).toBe(0);
      expect(repeated.stdout).toContain("Unchanged files:");
      expect(repeated.stdout).not.toContain("Created/updated files:");
    });
  });

  it("refuses modified skill files unless force is explicit", () => {
    withProject((root) => {
      expect(runCli(root, "init", "--agent", "codex").status).toBe(0);
      const target = join(root, ".agents/skills/udi-design/SKILL.md");
      writeFileSync(target, "user modification");
      const refused = runCli(root, "init", "--agent", "codex");
      expect(refused.status).not.toBe(0);
      expect(refused.stderr).toContain("Refusing to overwrite modified file");
      expect(readFileSync(target, "utf8")).toBe("user modification");

      const forced = runCli(root, "init", "--agent", "codex", "--force");
      expect(forced.status).toBe(0);
      expect(readFileSync(target, "utf8")).toContain("name: udi-design");

      writeFileSync(target, "---\nname: not-udi\n---\nBroken metadata\n");
      const doctor = runCli(root, "doctor", "--json");
      const report = JSON.parse(doctor.stdout) as {
        configurationConflicts: string[];
        installations: Array<{ agentId: string; valid: boolean; issues: string[] }>;
      };
      expect(doctor.status).not.toBe(0);
      expect(report.configurationConflicts.length).toBeGreaterThan(0);
      expect(report.installations.find(({ agentId }) => agentId === "codex")?.valid).toBe(false);
      expect(runCli(root, "init", "--agent", "codex", "--force").status).toBe(0);
    });
  });

  it("does not let force overwrite unowned files in the runtime directory", () => {
    withProject((root) => {
      const existing = join(root, ".udi/runtimes/0.1.0/bin/index.js");
      mkdirSync(join(root, ".udi/runtimes/0.1.0/bin"), { recursive: true });
      writeFileSync(existing, "user-owned file");
      const result = runCli(root, "init", "--agent", "claude", "--force");
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("Refusing to replace unowned file");
      expect(readFileSync(existing, "utf8")).toBe("user-owned file");
      expect(existsSync(join(root, ".claude/skills/udi-design/SKILL.md"))).toBe(false);
    });
  });

  it("installs multiple agents without duplicate shared files", () => {
    withProject((root) => {
      const result = runCli(root, "init", "--agent", "all");
      expect(result.status).toBe(0);
      expect(existsSync(join(root, ".agents/skills/udi-design/SKILL.md"))).toBe(true);
      expect(existsSync(join(root, ".claude/skills/udi-design/SKILL.md"))).toBe(true);
      expect(existsSync(join(root, ".cursor/skills/udi-design/SKILL.md"))).toBe(true);
      const created = result.stdout.match(/Created\/updated files:\n([\s\S]*?)(?:\nVerify|$)/)?.[1] ?? "";
      expect(created.match(/\.agents\/skills\/udi-design\/SKILL\.md/g)).toHaveLength(1);
    });
  });

  it("reports missing skill references and offers remediation", () => {
    withProject((root) => {
      expect(runCli(root, "init", "--agent", "cursor").status).toBe(0);
      unlinkSync(join(root, ".cursor/skills/udi-design/references/udi-cli.md"));
      const result = runCli(root, "doctor", "--json");
      const report = JSON.parse(result.stdout) as {
        remediation: string[];
        installations: Array<{ agentId: string; valid: boolean; issues: string[] }>;
      };
      expect(result.status).not.toBe(0);
      const cursor = report.installations.find(({ agentId }) => agentId === "cursor");
      expect(cursor?.valid).toBe(false);
      expect(cursor?.issues).toContain("references/udi-cli.md is missing");
      expect(report.remediation.length).toBeGreaterThan(0);
    });
  });

  it("requires an explicit agent when detection is absent or ambiguous", () => {
    withProject((root) => {
      expect(() => detectProjectRoot(join(root, "missing"))).toThrow();
      expect(() => selectAgents(root, "unsupported")).toThrow("Unsupported agent");
      expect(runCli(root, "init").stderr).toContain("No supported agent configuration was detected");
      mkdirSync(join(root, ".agents/skills"), { recursive: true });
      expect(runCli(root, "init").stderr).toContain("Multiple agent configurations were detected");
      expect(runCli(root, "init", "--agent", "unknown").stderr).toContain("is invalid");
    });
  });

  it("rejects symlinked installation parents and missing package assets before writing", () => {
    withProject((root) => {
      const outside = mkdtempSync(join(tmpdir(), "udi-outside-test-"));
      try {
        mkdirSync(join(root, ".claude"));
        let symlinkCreated = true;
        try {
          symlinkSync(outside, join(root, ".claude/skills"), "junction");
        } catch (error) {
          const code = (error as NodeJS.ErrnoException).code;
          if (code === "EPERM" || code === "EACCES" || code === "ENOSYS") symlinkCreated = false;
          else throw error;
        }
        if (symlinkCreated) {
          const claude = agentAdapters.find(({ id }) => id === "claude")!;
          const plan = planInstall(root, [claude], [{ relativePath: "SKILL.md", sourcePath: join(packageRoot, "dist/skills/udi-design/SKILL.md") }], { portable: true });
          expect(() => installPlan(plan, false, false, root)).toThrow("symbolic link");
          expect(existsSync(join(outside, "udi-design/SKILL.md"))).toBe(false);
          expect(getDoctorReport(root).installations.find(({ agentId }) => agentId === "claude")?.issues)
            .toContain("Skill path contains a symbolic link; no linked files were read");
        }

        const codex = agentAdapters.find(({ id }) => id === "codex")!;
        expect(() => {
        const missing = planInstall(root, [codex], [
          { relativePath: "SKILL.md", sourcePath: resolve(root, "does-not-exist/SKILL.md") }
        ], { portable: true });
        installPlan(missing, false, false, root);
        }).toThrow();
        expect(existsSync(join(root, ".udi"))).toBe(false);
      } finally {
        rmSync(outside, { recursive: true, force: true });
      }
    });
  });
});

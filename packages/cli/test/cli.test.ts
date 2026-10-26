import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const entryPoint = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const runCli = (...args: string[]) => spawnSync(process.execPath, [entryPoint, ...args], { encoding: "utf8" });

describe("UDI CLI", () => {
  it("prints its package version", () => {
    const result = runCli("--version");

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("0.1.0");
  });

  it("searches locally and prints structured results with filters", () => {
    const result = runCli(
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
    const matched = runCli("search", "keyboard focus", "--limit", "2");
    expect(matched.stdout).toContain("Search results for");
    expect(matched.stdout).toContain("UDI-ACC-002");

    const empty = runCli("search", "orbital volcano");
    expect(empty.status).toBe(0);
    expect(empty.stdout).toContain("No matching design rules");
  });

  it("recommends a context-aware direction and emits versioned JSON", () => {
    const result = runCli(
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
    const invalidCategory = runCli("search", "forms", "--category", "invented-category");
    expect(invalidCategory.status).not.toBe(0);
    expect(invalidCategory.stderr).toContain("is invalid");

    const invalidLimit = runCli("search", "forms", "--limit", "0");
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
});

import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { RecommendationV2Schema } from "../../knowledge/src/v2-schemas.js";

const cli = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const context = fileURLToPath(new URL("../../../tests/mission008/commerce-admin.json", import.meta.url));
const run = (args: string[]) => {
  const result = spawnSync(process.execPath, [cli, ...args], { encoding: "utf8" });
  if (result.error) throw result.error;
  return result;
};
const args = ["recommend", "--schema-version", "2.0", "--context", context, "--json"];
const legacyFixtures: Array<{ args: string[]; stdout: string }> = JSON.parse(readFileSync(new URL("./fixtures/v1-baseline.json", import.meta.url), "utf8"));

describe("v2 CLI and legacy compatibility", () => {
  it.each(legacyFixtures)("matches preimplementation v1 stdout byte-for-byte: $args", fixture => {
      const result = run(fixture.args);
      expect(result.status, result.stderr).toBe(0);
      expect(result.stdout).toBe(fixture.stdout);
      if (fixture.args[0] === "recommend") expect(run([...fixture.args, "--schema-version", "1.0"]).stdout).toBe(fixture.stdout);
  });

  it("runs v2 offline with schema-valid output, exact byte accounting and explanation", () => {
    const result = run(args);
    expect(result.status, result.stderr).toBe(0);
    expect(result.stderr).toBe("");
    const packet = RecommendationV2Schema.parse(JSON.parse(result.stdout));
    expect(packet.budget.usedBytes).toBe(Buffer.byteLength(result.stdout));
    expect(packet.profileCandidates).toHaveLength(3);
    expect(run(args).stdout).toBe(result.stdout);
    const text = run(args.filter(arg => arg !== "--json").concat("--explain"));
    expect(text.status, text.stderr).toBe(0);
    expect(text.stdout).toContain("Explanation");
    expect(text.stdout).toContain("unsupported");
  });

  it("runs the standalone bundle outside the workspace with network tripwires and no dependencies", () => {
    const root = mkdtempSync(join(tmpdir(), "udi-v2-offline-"));
    try {
      mkdirSync(join(root, "dist"));
      cpSync(cli, join(root, "dist/index.js"));
      cpSync(new URL("../package.json", import.meta.url), join(root, "package.json"));
      cpSync(context, join(root, "brief.json"));
      const guard = fileURLToPath(new URL("../../../tests/mission008/deny-network.cjs", import.meta.url));
      const result = spawnSync(process.execPath, ["--require", guard, join(root, "dist/index.js"), "recommend", "--schema-version", "2.0", "--context", "brief.json", "--json"], { cwd: root, encoding: "utf8", env: { ...process.env, NODE_PATH: "" } });
      expect(result.error).toBeUndefined();
      expect(result.status, result.stderr).toBe(0);
      expect(() => RecommendationV2Schema.parse(JSON.parse(result.stdout))).not.toThrow();
    } finally { rmSync(root, { recursive: true, force: true }); }
  });

  it.each([
      ["recommend", "--context", context, "--json"],
      ["recommend", "--schema-version", "2.0", "--json"],
      [...args, "--schema-version", "3.0"],
      [...args, "--audience", "shoppers"],
      [...args, "--budget-bytes", "64"],
      [...args, "--budget-bytes", "NaN"],
      [...args, "--entity-limit", "0"],
      [...args, "--type", "fintech"],
      [...args, "--framework", "vue"]
    ].map(invalid => ({ invalid })))("rejects mixed/invalid options without partial JSON: $invalid", ({ invalid }) => {
      const result = run(invalid);
      expect(result.status).not.toBe(0);
      expect(result.stdout).toBe("");
      expect(result.stderr.length).toBeGreaterThan(0);
  });

  it("expands a bounded packet with a context-bound cursor", () => {
    const first = run([...args, "--entity-limit", "3"]);
    expect(first.status, first.stderr).toBe(0);
    const packet = JSON.parse(first.stdout);
    const second = run([...args, "--entity-limit", "3", "--expand", packet.expansion.key]);
    expect(second.status, second.stderr).toBe(0);
    expect(second.stdout).not.toBe(first.stdout);
    expect(() => RecommendationV2Schema.parse(JSON.parse(second.stdout))).not.toThrow();
  });

  it("rejects malformed, oversized, non-file and symlink contexts", () => {
    const root = mkdtempSync(join(tmpdir(), "udi-context-"));
    try {
      const bad = join(root, "bad.json");
      const oversized = join(root, "large.json");
      const linked = join(root, "linked.json");
      writeFileSync(bad, "{oops");
      writeFileSync(oversized, " ".repeat(65_537));
      symlinkSync(context, linked);
      for (const file of [bad, oversized, root, linked]) {
        const result = run(["recommend", "--schema-version", "2.0", "--context", file, "--json"]);
        expect(result.status).not.toBe(0);
        expect(result.stdout).toBe("");
      }
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});

import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, rmSync, readFileSync, existsSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect } from "vitest";
const entry = fileURLToPath(new URL("../dist/index.js", import.meta.url));
const fixture = JSON.parse(readFileSync(new URL("../../../tests/mission009/evaluation.json", import.meta.url), "utf8"))[0].context;
const run = (args: string[]) => spawnSync(process.execPath, [entry, ...args], { encoding: "utf8" });

describe("component CLI", () => {
  it("runs enhanced recommendations and full inspection from a standalone offline tarball", () => {
    const root = mkdtempSync(join(tmpdir(), "udi009-offline-"));
    try {
      const packageRoot = fileURLToPath(new URL("..", import.meta.url));
      const packed = spawnSync("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", root], { cwd: packageRoot, encoding: "utf8" });
      expect(packed.error).toBeUndefined(); expect(packed.status, packed.stderr).toBe(0);
      expect(JSON.parse(packed.stdout)[0].files).toHaveLength(8);
      const extract = spawnSync("tar", ["-xf", join(root, JSON.parse(packed.stdout)[0].filename), "-C", root], { encoding: "utf8" });
      expect(extract.status, extract.stderr).toBe(0);
      const contextPath = join(root, "context.json"); writeFileSync(contextPath, JSON.stringify(fixture));
      const runtime = join(root, "package/dist/index.js");
      const tripwire = fileURLToPath(new URL("../../../tests/mission008/deny-network.cjs", import.meta.url));
      for (const args of [["inspect", "COM-OPERATIONAL-MANAGEMENT", "--json"], ["recommend", "--schema-version", "2.1", "--context", contextPath, "--json"]]) {
        const result = spawnSync(process.execPath, ["--require", tripwire, runtime, ...args], { cwd: root, env: { ...process.env, NODE_PATH: "" }, encoding: "utf8" });
        expect(result.error).toBeUndefined(); expect(result.status, result.stderr).toBe(0);
        expect(result.stdout).toBe(run(args).stdout);
      }
      expect(existsSync(join(root, "package/node_modules"))).toBe(false);
    } finally { rmSync(root, { recursive: true, force: true }); }
  }, 30000);

  it.each(["CMP-OPERATIONAL-TABLE", "CMP-FILTER-WORKSPACE", "CMP-RECOVERABLE-FORM", "COM-OPERATIONAL-MANAGEMENT"])("inspects complete local specification %s", id => {
    const result = run(["inspect", id, "--json"]);
    expect(result.error).toBeUndefined(); expect(result.status, result.stderr).toBe(0);
    const spec = JSON.parse(result.stdout);
    expect(spec.id).toBe(id); expect(spec.schemaVersion).toBe("1.0");
    expect(spec.visual.typography).toBeTruthy(); expect(spec.recovery.length).toBeGreaterThan(0);
  });
  it("rejects missing specifications with no partial JSON", () => {
    const result = run(["inspect", "CMP-CALENDAR", "--json"]);
    expect(result.status).toBe(1); expect(result.stdout).toBe(""); expect(result.stderr).toContain("Unknown component/composition");
  });
  it("uses opt-in output 2.1 with existing context 2.0, bounded expansion and readable explanations", () => {
    const root = mkdtempSync(join(tmpdir(), "udi009-cli-"));
    try {
      const path = join(root, "context.json"); writeFileSync(path, JSON.stringify(fixture));
      const args = ["recommend", "--schema-version", "2.1", "--context", path];
      const result = run([...args, "--json"]);
      expect(result.status, result.stderr).toBe(0);
      const packet = JSON.parse(result.stdout);
      expect(packet.schemaVersion).toBe("2.1"); expect(packet.context.schemaVersion).toBe("2.0");
      expect(packet.budget.usedBytes).toBe(Buffer.byteLength(result.stdout));
      expect(packet.entities.filter((e: { kind: string }) => e.kind === "component")).toHaveLength(3);
      expect(result.stdout).toBe(run([...args, "--json"]).stdout);
      const next = run([...args, "--json", "--expand", packet.expansion.key]);
      expect(next.status, next.stderr).toBe(0);
      const text = run([...args, "--explain"]);
      expect(text.status, text.stderr).toBe(0); expect(text.stdout).toContain("Task evidence:"); expect(text.stdout).toContain("udi inspect");
      const mixed = run([...args, "--audience", "operator", "--json"]);
      expect(mixed.status).toBe(1); expect(mixed.stdout).toBe(""); expect(mixed.stderr).toContain("cannot be combined");
    } finally { rmSync(root, { recursive: true, force: true }); }
  });
});

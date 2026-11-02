import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { DirectionPacketSchema } from "../../knowledge/src/experience.js";
const run = (...args: string[]) => spawnSync(process.execPath, ["packages/cli/dist/index.js", ...args], { encoding: "utf8" });
describe("Offline direction CLI", () => {
  it("exposes the refined focus contract through the existing inspect command", () => {
    const result = run("inspect", "MOT-FOCUS", "--json");
    expect(result.status, result.stderr).toBe(0);
    const record = JSON.parse(result.stdout);
    expect(record.id).toBe("MOT-FOCUS");
    expect(record.animate).toContain("External outlines remain valid");
    expect(record.stable).toContain("border width");
    expect(record.accessibility).toContain("browser defaults");
  });
  it("returns bounded direction JSON and inspectable original guidance", () => {
    const r = run("direct", "--context", "tests/mission008/commerce-admin.json", "--interactions", "feedback,press", "--json");
    expect(r.status, r.stderr).toBe(0);
    const packet = DirectionPacketSchema.parse(JSON.parse(r.stdout));
    expect(packet.budget.usedBytes).toBe(Buffer.byteLength(r.stdout));
    expect(Buffer.byteLength(r.stdout)).toBeLessThanOrEqual(8192);
    const detail = run("inspect", "MOT-PRESS", "--json");
    expect(detail.status, detail.stderr).toBe(0);
    expect(JSON.parse(detail.stdout).reducedMotion).toContain("instant");
  });
  it("rejects invalid preferences, missing context and impossible budgets without partial JSON", () => {
    for (const args of [
      ["direct", "--context", "tests/mission008/commerce-admin.json", "--character", "unknown", "--json"],
      ["direct", "--context", "tests/mission008/commerce-admin.json", "--budget-bytes", "64", "--json"],
      ["direct", "--context", "missing-file.json", "--json"]
    ]) { const r = run(...args); expect(r.status).not.toBe(0); expect(r.stdout).toBe(""); }
  });
});

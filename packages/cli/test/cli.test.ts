import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const entryPoint = fileURLToPath(new URL("../dist/index.js", import.meta.url));

describe("UDI CLI", () => {
  it("prints its package version", () => {
    const result = spawnSync(process.execPath, [entryPoint, "--version"], {
      encoding: "utf8"
    });

    expect(result.error).toBeUndefined();
    expect(result.status).toBe(0);
    expect(result.stdout.trim()).toBe("0.1.0");
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

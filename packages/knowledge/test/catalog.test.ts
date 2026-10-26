import { describe, expect, it } from "vitest";
import {
  antiPatterns,
  componentPatterns,
  designProfiles,
  designRules,
  validateCatalog
} from "../src/index.js";

const catalog = { rules: designRules, profiles: designProfiles, patterns: componentPatterns, antiPatterns };

describe("knowledge catalog", () => {
  it("validates every catalog entry and all cross-references", () => {
    expect(() => validateCatalog(catalog)).not.toThrow();
  });

  it("contains a substantive initial catalog", () => {
    expect(designRules.length).toBeGreaterThanOrEqual(60);
    expect(designRules.length).toBeLessThanOrEqual(100);
    expect(designProfiles.length).toBeGreaterThanOrEqual(12);
    expect(designProfiles.length).toBeLessThanOrEqual(20);
    expect(new Set(designRules.map(({ category }) => category)).size).toBe(15);
    expect(designRules.every(({ source }) => source.sourceId.length > 0)).toBe(true);
  });

  it("rejects duplicate identifiers", () => {
    expect(() => validateCatalog({
      ...catalog,
      rules: [...designRules, designRules[0]!]
    })).toThrow(/Duplicate catalog identifier/);
  });

  it("rejects broken profile references", () => {
    expect(() => validateCatalog({
      ...catalog,
      profiles: [{ ...designProfiles[0]!, ruleIds: ["UDI-VIS-999"] }]
    })).toThrow(/references unknown catalog identifier/);
  });
});

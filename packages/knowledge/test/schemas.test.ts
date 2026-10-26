import { describe, expect, it } from "vitest";
import {
  AntiPatternSchema,
  ComponentPatternSchema,
  DesignProfileSchema,
  DesignRecommendationSchema,
  DesignRuleSchema,
  KnowledgeProvenanceSchema,
  ProjectContextSchema,
  designProfiles,
  designRules,
  componentPatterns,
  antiPatterns
} from "../src/index.js";

describe("knowledge schemas", () => {
  it("accepts every catalog entity type", () => {
    expect(DesignRuleSchema.safeParse(designRules[0]).success).toBe(true);
    expect(DesignProfileSchema.safeParse(designProfiles[0]).success).toBe(true);
    expect(ComponentPatternSchema.safeParse(componentPatterns[0]).success).toBe(true);
    expect(AntiPatternSchema.safeParse(antiPatterns[0]).success).toBe(true);
    expect(KnowledgeProvenanceSchema.safeParse(designRules[0]?.source).success).toBe(true);
  });

  it("rejects unsupported categories and malformed identifiers", () => {
    expect(DesignRuleSchema.safeParse({
      ...designRules[0],
      category: "unsupported"
    }).success).toBe(false);
    expect(DesignRuleSchema.safeParse({
      ...designRules[0],
      id: "not-stable"
    }).success).toBe(false);
  });

  it("allows incomplete project context and applies safe structural defaults", () => {
    expect(ProjectContextSchema.parse({})).toEqual({
      goals: [],
      constraints: {
        preserveBrand: false,
        brandColorTokens: []
      }
    });
  });

  it("rejects invalid provenance and recommendation payloads", () => {
    expect(KnowledgeProvenanceSchema.safeParse({
      sourceId: "bad",
      sourceName: "X",
      organization: "X",
      license: "MIT",
      attribution: "X",
      reviewStatus: "pending"
    }).success).toBe(false);
    expect(DesignRecommendationSchema.safeParse({ schemaVersion: "9.0" }).success).toBe(false);
  });
});

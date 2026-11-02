import { describe, expect, it } from "vitest";
import { CHARACTERS, INTERACTIONS, DirectionSchema, MotionSchema, QualitySchema, designDirections, motionGuidance, experienceQuality, validateExperienceKnowledge } from "../src/experience.js";

describe("Original experience knowledge", () => {
  it("validates complete, unique structured vocabularies", () => {
    expect(() => validateExperienceKnowledge()).not.toThrow();
    expect(designDirections.map(d => d.character).sort()).toEqual([...CHARACTERS].sort());
    expect(motionGuidance.map(d => d.interaction).sort()).toEqual([...INTERACTIONS].sort());
    expect(designDirections.every(r => DirectionSchema.safeParse(r).success)).toBe(true);
    expect(motionGuidance.every(r => MotionSchema.safeParse(r).success)).toBe(true);
    expect(experienceQuality.every(r => QualitySchema.safeParse(r).success)).toBe(true);
    expect(experienceQuality).toHaveLength(11);
  });
  it("rejects incomplete directions and reversed motion ranges", () => {
    expect(DirectionSchema.safeParse({ ...designDirections[0], color: {} }).success).toBe(false);
    expect(MotionSchema.safeParse({ ...motionGuidance[0], durationMs: [500, 80] }).success).toBe(false);
    expect(experienceQuality.find(r => r.id === "QUA-DISTINCTIVENESS")!.measurableFailure).toBeNull();
  });
});

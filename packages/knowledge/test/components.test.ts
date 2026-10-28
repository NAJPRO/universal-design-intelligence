import { describe, expect, it } from "vitest";
import { professionalComponents, validateComponentCatalog } from "../src/components.js";
import { ComponentSpecSchema, CompositionSpecSchema } from "../src/component-schemas.js";
import { antiPatterns, componentPatterns, designProfiles, designRules } from "../src/catalog.js";
const legacy = { rules: designRules, profiles: designProfiles, patterns: componentPatterns, antiPatterns };
const copy = () => structuredClone(professionalComponents);

describe("professional component integrity", () => {
  it("validates all original families, composition and existing references", () => {
    expect(() => validateComponentCatalog(copy(), legacy)).not.toThrow();
    expect(professionalComponents.components).toHaveLength(3);
    expect(professionalComponents.compositions).toHaveLength(1);
  });
  it.each([
    ["unknown keys", (s: ReturnType<typeof copy>) => Object.assign(s.components[0]!, { unsupported: true })],
    ["required anatomy", (s: ReturnType<typeof copy>) => s.components[0]!.variants[0]!.partIds.shift()],
    ["unknown variant part", (s: ReturnType<typeof copy>) => s.components[0]!.variants[0]!.partIds.push("invented")],
    ["duplicate state", (s: ReturnType<typeof copy>) => s.components[0]!.states.push(s.components[0]!.states[0]!)],
    ["unreachable state", (s: ReturnType<typeof copy>) => s.components[0]!.states.push({ id: "unreachable", meaning: "Unknown branch", presentation: "No incoming event", announcement: null, availableActions: [] })],
    ["unknown target", (s: ReturnType<typeof copy>) => { s.components[0]!.transitions[0]!.to = "missing"; }],
    ["unavailable event", (s: ReturnType<typeof copy>) => { s.components[0]!.transitions[0]!.event = "missing"; }],
    ["unrecoverable failure", (s: ReturnType<typeof copy>) => { s.components[0]!.recovery = s.components[0]!.recovery.filter(r => r.stateId !== "error"); }],
    ["unknown rule", (s: ReturnType<typeof copy>) => s.components[0]!.ruleIds.push("UDI-DAT-999")],
    ["unknown anti-pattern", (s: ReturnType<typeof copy>) => s.components[0]!.antiPatternIds.push("UDI-ANTI-999")],
    ["duplicate ID", (s: ReturnType<typeof copy>) => s.components.push(s.components[0]!)],
    ["unknown dependency", (s: ReturnType<typeof copy>) => s.components[0]!.dependencies.push("CMP-MISSING")],
    ["cycle", (s: ReturnType<typeof copy>) => { s.components[0]!.dependencies.push(s.components[1]!.id); s.components[1]!.dependencies.push(s.components[0]!.id); }],
    ["incompatible dependency", (s: ReturnType<typeof copy>) => { s.compositions[0]!.incompatibleWith.push(s.components[0]!.id); }],
    ["unknown slot variant", (s: ReturnType<typeof copy>) => { s.compositions[0]!.slots[0]!.variantId = "missing"; }],
    ["incompatible slot variants", (s: ReturnType<typeof copy>) => s.compositions[0]!.slots.push({ id: "other-results", entityId: s.components[0]!.id, variantId: "read-only", required: false, priority: 4 })],
    ["unknown state owner", (s: ReturnType<typeof copy>) => { s.compositions[0]!.sharedState[0]!.owner = "missing"; }],
    ["incomplete layout", (s: ReturnType<typeof copy>) => { s.compositions[0]!.layoutModes[0]!.orderedSlots = []; }],
    ["unverified original license", (s: ReturnType<typeof copy>) => { s.components[0]!.evidence[0]!.licenseStatus = "reference-only"; }]
  ] as const)("rejects %s", (_name, mutate) => {
    const pack = copy(); mutate(pack);
    expect(() => validateComponentCatalog(pack, legacy)).toThrow();
  });
  it("keeps strict independently versioned specification schemas", () => {
    expect(ComponentSpecSchema.safeParse({ ...professionalComponents.components[0], schemaVersion: "2.0" }).success).toBe(false);
    expect(CompositionSpecSchema.safeParse(professionalComponents.components[0]).success).toBe(false);
  });
});

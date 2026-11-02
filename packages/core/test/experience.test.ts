import { describe, expect, it } from "vitest";
import { recommendDirection, inspectExperience } from "../src/experience.js";
import { DirectionPacketSchema } from "@udi/knowledge/experience";
import { recommendDesignV21 } from "../src/components.js";
import { recommendDesignV2 } from "../src/recommend-v2.js";
import type { ContextV2Input } from "@udi/knowledge";
const ev = (value: string) => ({ value, status: "explicit" as const });
const context: ContextV2Input = { schemaVersion: "2.0", applicationType: ev("operations-workspace"), tasks: { primary: ev("consult and compare inventory products table"), secondary: [ev("search and filter products"), ev("edit product form")] }, brand: { preserve: true, tokens: ["ink", "accent"] } };

describe("Design direction and progressive disclosure", () => {
  it("discovers and inspects the existing integrated-focus contract without adding a record", () => {
    const packet = recommendDirection({ schemaVersion: "2.0", tasks: { primary: ev("keyboard focus selection") } }, { query: "focus border outline" });
    expect(packet.motion.some(r => r.id === "MOT-FOCUS")).toBe(true);
    expect(packet.matches.some(r => r.id === "MOT-FOCUS")).toBe(true);
    const record = inspectExperience("MOT-FOCUS");
    expect("animate" in record && record.animate).toContain("integrated");
    expect("accessibility" in record && record.accessibility).toContain("light/dark");
    expect(packet.budget.usedBytes).toBeLessThanOrEqual(8192);
  });
  it.each([
    ["editorial", "editorial", "DIR-EDITORIAL"], ["operations-workspace", "compare inventory", "DIR-OPERATIONAL"],
    ["authoring", "developer code tool", "DIR-TECHNICAL"], ["scheduling", "calm appointment", "DIR-CALM"],
    ["storefront", "warm community craft", "DIR-WARM"], ["marketing", "bold expressive campaign", "DIR-EXPRESSIVE"]
  ] as const)("selects declared context-sensitive direction: %s/%s", (application, query, id) => {
    expect(recommendDirection({ schemaVersion: "2.0", applicationType: ev(application), query }).direction.id).toBe(id);
  });
  it("does not recommend gratuitous motion from query, role or industry", () => {
    const packet = recommendDirection({ schemaVersion: "2.0", applicationType: ev("marketing"), industry: ev("animation"), roles: [ev("designer")], query: "cinematic parallax scroll reveal" });
    expect(packet.motion).toEqual([]);
    expect(packet.matches.some(m => m.kind === "motion")).toBe(true);
    expect(recommendDirection(context, { interactions: ["scroll", "entrance"] }).motion.some(m => ["scroll", "entrance"].includes(m.interaction))).toBe(false);
  });
  it("selects meaningful interactions, limits disclosure and respects required motion constraints", () => {
    const packet = recommendDirection({ schemaVersion: "2.0", tasks: { primary: ev("choose and confirm") } }, { interactions: ["press", "feedback", "disclosure"] });
    expect(packet.motion).toHaveLength(2);
    expect(packet.omittedMotionIds).toHaveLength(1);
    expect(packet.motion.every(m => m.reducedMotion.includes("instant"))).toBe(true);
    expect(recommendDirection({ ...context, constraints: [{ id: "CTX-MOTION", dimension: "motion", value: "none", strength: "must" }] }, { interactions: ["modal"] }).motion).toEqual([]);
    expect(recommendDirection({ schemaVersion: "2.0", tasks: { primary: ev("avoid save") } }).motion).toEqual([]);
  });
  it("binds brand, typography, density and required color before editorial preference", () => {
    const packet = recommendDirection({ ...context, constraints: [{ id: "CTX-COLOR", dimension: "color", value: "existing monochrome", strength: "must" }, { id: "CTX-DENSITY", dimension: "density", value: "comfortable", strength: "must" }] }, { character: "expressive" });
    expect(packet.direction.id).toBe("DIR-EXPRESSIVE");
    expect(packet.direction.color.foundation).toContain("existing monochrome");
    expect(packet.direction.typography.display).toContain("Preserve");
    expect(packet.direction.composition.density).toContain("comfortable");
    expect(packet.binding.tokens).toEqual(["accent", "ink"]);
    expect(() => recommendDirection({ ...context, constraints: [{ id: "CTX-A", dimension: "motion", value: "none", strength: "must" }, { id: "CTX-B", dimension: "motion", value: "full", strength: "must" }] })).toThrow("Conflicting");
  });
  it("accounts for exact bytes, fails small budgets and returns isolated inspected copies", () => {
    const packet = recommendDirection(context);
    expect(DirectionPacketSchema.safeParse(packet).success).toBe(true);
    expect(packet.budget.usedBytes).toBe(Buffer.byteLength(JSON.stringify(packet) + "\n"));
    expect(packet.budget.usedBytes).toBeLessThanOrEqual(8192);
    expect(() => recommendDirection(context, { maxBytes: 64 })).toThrow("budget");
    const record = inspectExperience("DIR-EDITORIAL");
    if ("intent" in record) record.intent = "Caller modified this record";
    expect(JSON.stringify(inspectExperience("DIR-EDITORIAL"))).not.toContain("Caller modified");
    expect(() => inspectExperience("MOT-UNKNOWN")).toThrow("Unknown");
    expect(() => recommendDirection(context, { character: "unknown" } as never)).toThrow();
  });
  it("preserves deterministic results and unchanged 2.0 output across new calls", () => {
    const before = JSON.stringify(recommendDesignV2(context));
    const packet = recommendDirection(context);
    const reordered = structuredClone(context); reordered.tasks!.secondary!.reverse(); reordered.brand!.tokens!.reverse();
    expect(recommendDirection(reordered)).toEqual(packet);
    expect(recommendDirection(context)).toEqual(packet);
    expect(JSON.stringify(recommendDesignV2(context))).toBe(before);
  });
  it("surfaces the existing composition for both frozen Mission 012 task formulations", () => {
    for (const primary of ["consult and compare inventory products", "consult and compare inventory products table"]) {
      const packet = recommendDesignV21({ ...context, tasks: { primary: ev(primary), secondary: [ev(primary.endsWith("table") ? "search and filter products" : "search and filter products table"), ev("edit product form")] } });
      expect(packet.entities.some(e => e.id === "COM-OPERATIONAL-MANAGEMENT")).toBe(true);
    }
    for (const sample of [
      { schemaVersion: "2.0", applicationType: ev("operations-workspace"), components: [ev("operational workspace")] },
      { schemaVersion: "2.0", applicationType: ev("operations-workspace"), tasks: { primary: ev("consult record form") } },
      { ...context, applicationType: ev("marketing") }
    ] as ContextV2Input[]) expect(recommendDesignV21(sample).entities.some(e => e.kind === "composition")).toBe(false);
  });
});

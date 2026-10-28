import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import {
  adaptLegacyContext, ContextV2Schema, DesignRuleSchema, normalizeContextV2,
  recommendDesignV2, RecommendationV2Schema, resolveConflictsV2, retrieveKnowledgeV2,
  antiPatterns, componentPatterns, designProfiles, designRules, mergeLegacyContext
} from "../src/index.js";
import type { ContextV2Input, DesignRule, ScopedConstraint } from "../src/index.js";
import type { Catalog } from "@udi/knowledge";

const fixture = (name: string): ContextV2Input => JSON.parse(readFileSync(new URL(`../../../tests/mission008/${name}.json`, import.meta.url), "utf8"));
const ev = (value: string) => ({ value, status: "explicit" as const, evidenceRefs: ["test:brief"] });
const allCatalog: Catalog = { rules: designRules, profiles: designProfiles, patterns: componentPatterns, antiPatterns };
function rule(id: string, priority: DesignRule["priority"], choices: DesignRule["choices"]): DesignRule {
  return DesignRuleSchema.parse({ ...designRules[0], id, category: "design-systems", priority, choices, relatedAntiPatternIds: [] });
}
const constraint = (id: string, value: string, scope = "application"): ScopedConstraint => ({ id, value, scope, dimension: "color", strength: "must", evidenceRefs: [] });

describe("evidence-aware v2", () => {
  it("observes catalog changes on subsequent requests without a stale index cache", () => {
    const catalog = structuredClone(allCatalog);
    const context = fixture("commerce-admin");
    const first = retrieveKnowledgeV2(context, { query: "keyboard focus", limit: 100 }, catalog);
    const target = catalog.rules.find(rule => rule.id === "UDI-ACC-002")!;
    target.title = "Updated keyboard focus guidance for this fixture";
    const second = retrieveKnowledgeV2(context, { query: "keyboard focus", limit: 100 }, catalog);
    expect(second.find(entity => entity.id === target.id)?.title).toBe(target.title);
    expect(first.find(entity => entity.id === target.id)?.title).not.toBe(target.title);
  });

  it("discriminates storefront and product administration under the same industry", () => {
    const admin = recommendDesignV2(fixture("commerce-admin"));
    const store = recommendDesignV2(fixture("commerce-storefront"));
    expect(admin.profileCandidates).toHaveLength(3);
    expect(admin.profileCandidates.map(p => p.id)).not.toContain("PRO-ECOMMERCE-STOREFRONT");
    expect(store.profileCandidates[0]?.id).toBe("PRO-ECOMMERCE-STOREFRONT");
    expect(admin.entities.some(e => e.id === "PAT-RESPONSIVE-TABLE")).toBe(true);
    expect(store.coverage.map(item => item.requirement)).not.toContain("table-operations");
    expect(admin.entities.some(e => e.category === "marketing-landing-pages" || e.category === "pricing-pages")).toBe(false);
    expect(admin.coverage.find(item => item.requirement === "media-management")?.status).toBe("unsupported");
  });

  it("distinguishes healthcare public information from staff scheduling without claiming a clinical pack", () => {
    const publicInfo = recommendDesignV2(fixture("healthcare-public"));
    const staff = recommendDesignV2(fixture("healthcare-scheduling"));
    expect(publicInfo.profileCandidates.map(p => p.id)).not.toContain("PRO-HEALTH-TECH");
    expect(staff.profileCandidates[0]?.id).toBe("PRO-HEALTH-TECH");
    expect(staff.coverage.find(item => item.requirement === "schedule-collisions")?.status).toBe("unsupported");
    expect(staff.coverage.find(item => item.requirement === "domain-workflow")?.status).toBe("unsupported");
  });

  it("does not force an unknown industry into a known industry profile", () => {
    const result = recommendDesignV2(fixture("unknown-industry"));
    expect(result.context.industry.value).toBe("orbital-salvage");
    expect(result.profileCandidates.some(p => ["PRO-HEALTH-TECH", "PRO-FINTECH-PRODUCT", "PRO-ECOMMERCE-STOREFRONT"].includes(p.id))).toBe(false);
    expect(result.coverage.find(item => item.requirement === "domain-workflow")?.status).toBe("unsupported");
  });

  it("keeps application unknown regardless of industry and tasks", () => {
    const result = recommendDesignV2(fixture("missing-application"));
    expect(result.context.applicationType.value).toBeNull();
    expect(result.profileCandidates.map(p => p.id)).toEqual(["PRO-GENERAL-WEB"]);
    expect(result.evidenceLevel).toBe("sparse");
    expect(result.entities.some(entity => entity.id === "PAT-RESPONSIVE-TABLE")).toBe(false);
    for (const type of ["ecommerce", "fintech", "education", "dashboard", "saas", "web-app"] as const) {
      expect(normalizeContextV2(adaptLegacyContext(type)).applicationType.value).toBeNull();
    }
    expect(mergeLegacyContext({ schemaVersion: "2.0" }, "ecommerce").industry.value).toBe("ecommerce");
    expect(() => mergeLegacyContext({ schemaVersion: "2.0", industry: ev("healthcare") }, "ecommerce")).toThrow("conflicts");
  });

  it("rejects conflicting explicit context and preserves weaker contradictory observations", () => {
    expect(() => recommendDesignV2(fixture("conflicting-explicit"))).toThrow("Conflicting explicit");
    const context = normalizeContextV2({ schemaVersion: "2.0", applicationType: { value: "storefront", status: "explicit" },
      observations: [{ field: "applicationType", evidence: { value: "operations-workspace", status: "observed" } }] });
    expect(context.applicationType.value).toBe("storefront");
    expect(context.applicationType.alternatives).toContain("operations-workspace");
    expect(context.uncertainty.length).toBeGreaterThan(0);
    expect(() => normalizeContextV2({ schemaVersion: "2.0", observations: [{ field: "framework", evidence: ev("invented-framework") }] })).toThrow();
  });

  it("filters incompatible framework references from direct, profile, pattern and anti-pattern candidates", () => {
    const target = designRules.find(item => item.id === "UDI-DAT-001")!;
    const catalog: Catalog = { ...allCatalog, rules: designRules.map(item => item.id === target.id ? { ...item, frameworks: ["vue"] } : item) };
    const result = recommendDesignV2(fixture("commerce-admin"), { maxBytes: 100_000 }, catalog);
    expect(result.entities.map(e => e.id)).not.toContain(target.id);
    expect(result.entities.map(e => e.id)).not.toContain("PAT-RESPONSIVE-TABLE");
    expect(result.entities.every(e => !e.ruleIds.includes(target.id))).toBe(true);
    expect(RecommendationV2Schema.parse(result)).toEqual(result);
  });

  it("retrieves patterns and anti-patterns independently, and returns no irrelevant lexical results", () => {
    const context = fixture("commerce-admin");
    expect(retrieveKnowledgeV2(context, { query: "responsive table", kind: "pattern" }).some(e => e.id === "PAT-RESPONSIVE-TABLE")).toBe(true);
    expect(retrieveKnowledgeV2(context, { query: "placeholder labels", kind: "anti-pattern" }).some(e => e.id === "UDI-ANTI-001")).toBe(true);
    expect(retrieveKnowledgeV2(context, { query: "zzqxvv orbital quux" })).toEqual([]);
    expect(retrieveKnowledgeV2(context, { query: "the and" })).toEqual([]);
    expect(() => retrieveKnowledgeV2(context, { query: "focus", limit: 101 })).toThrow();
  });

  it("deduplicates dependencies, validates output references, and reports category coverage truthfully", () => {
    const result = recommendDesignV2(fixture("commerce-admin"), { maxBytes: 100_000 });
    expect(RecommendationV2Schema.parse(result)).toEqual(result);
    expect(new Set(result.entities.map(e => e.id)).size).toBe(result.entities.length);
    for (const entity of result.entities) for (const id of entity.ruleIds) expect(result.entities.some(e => e.kind === "rule" && e.id === id)).toBe(true);
    expect(result.entities.some(e => e.kind === "anti-pattern")).toBe(true);
    expect(result.entities.some(e => e.kind === "pattern")).toBe(true);
    expect(result.coverage.find(item => item.requirement === "accessibility")?.status).toBe("covered");
    expect(result.coverageComplete).toBe(false);
    const invalid = structuredClone(result);
    invalid.entities[0]!.ruleIds = ["UDI-ACC-999"];
    expect(() => RecommendationV2Schema.parse(invalid)).toThrow();
    const invalidWinner = structuredClone(result);
    invalidWinner.conflicts.push({ scope: "application", dimension: "color", status: "resolved", selectedEntityId: "UDI-COL-999", excludedEntityIds: [], constraintIds: [], explanation: "Invalid winner." });
    expect(() => RecommendationV2Schema.parse(invalidWinner)).toThrow();
  });

  it("packs task/accessibility coverage before optional guidance, measures exact bytes, and bounds expansion", () => {
    const context = fixture("commerce-admin");
    const packet = recommendDesignV2(context, { entityLimit: 2 });
    expect(packet.entities.map(e => e.category)).toEqual(["accessibility", "responsive-design"]);
    expect(packet.coverage.find(item => item.requirement === "validation")?.status).toBe("budget-omitted");
    expect(packet.budget.usedBytes).toBe(Buffer.byteLength(JSON.stringify(packet) + "\n"));
    expect(packet.budget.usedBytes).toBeLessThanOrEqual(packet.budget.maxBytes);
    expect(packet.expansion).not.toBeNull();
    const second = recommendDesignV2(context, { entityLimit: 2, expand: packet.expansion!.key });
    expect(second.entities[0]?.id).not.toBe(packet.entities[0]?.id);
    expect(() => recommendDesignV2(fixture("commerce-storefront"), { expand: packet.expansion!.key })).toThrow("Expansion key");
    expect(() => recommendDesignV2(context, { maxBytes: 64 })).toThrow("budget too small");
    expect(() => recommendDesignV2(context, { maxBytes: Number.NaN })).toThrow();
    const bounded = recommendDesignV2(context, { maxBytes: packet.budget.usedBytes + 50 });
    expect(bounded.budget.usedBytes).toBeLessThanOrEqual(bounded.budget.maxBytes);
  });

  it("returns byte-identical results for repeated and reordered equivalent input/catalogs", () => {
    const input = ContextV2Schema.parse(fixture("commerce-admin"));
    input.roles.push({ ...ev("reviewer"), evidenceRefs: ["b", "a"], alternatives: [] });
    input.components = [{ ...ev("table"), alternatives: [], evidenceRefs: ["x", "y"] }, { ...ev("form"), alternatives: [] }];
    const first = recommendDesignV2(input);
    input.roles.reverse(); input.components.reverse();
    input.roles.forEach(role => role.evidenceRefs.reverse());
    input.components.forEach(component => component.evidenceRefs.reverse());
    const reordered: Catalog = { rules: [...designRules].reverse(), profiles: [...designProfiles].reverse(), patterns: [...componentPatterns].reverse(), antiPatterns: [...antiPatterns].reverse() };
    expect(JSON.stringify(recommendDesignV2(input, {}, reordered))).toBe(JSON.stringify(first));
    expect(recommendDesignV2(input)).toEqual(recommendDesignV2(input));
  });
});

describe("v2 conflict correctness", () => {
  it("uses stable preferences and lets mandatory constraints override preferences", () => {
    const rules = [rule("UDI-SYS-011", "high", [{ dimension: "color", value: "dark" }]), rule("UDI-SYS-012", "high", [{ dimension: "color", value: "light" }])];
    const preferences: ScopedConstraint[] = [
      { ...constraint("CTX-A", "dark"), strength: "prefer" },
      { ...constraint("CTX-B", "light"), strength: "prefer" }
    ];
    expect(resolveConflictsV2(rules, preferences).selectedRules.map(item => item.id)).toEqual(["UDI-SYS-011"]);
    expect(resolveConflictsV2(rules, [...preferences, constraint("CTX-C", "light")]).selectedRules.map(item => item.id)).toEqual(["UDI-SYS-012"]);
  });
  it("accepts whole rules across dimensions, with every winner surviving", () => {
    const rules = [
      rule("UDI-SYS-011", "critical", [{ dimension: "density", value: "compact" }]),
      rule("UDI-SYS-012", "high", [{ dimension: "density", value: "spacious" }, { dimension: "color", value: "dark" }]),
      rule("UDI-SYS-013", "medium", [{ dimension: "color", value: "light" }])
    ];
    const resolution = resolveConflictsV2(rules);
    expect(resolution.selectedRules.map(r => r.id)).toEqual(["UDI-SYS-011", "UDI-SYS-013"]);
    for (const conflict of resolution.conflicts) expect(resolution.selectedRules.some(r => r.id === conflict.selectedEntityId)).toBe(true);
    expect(resolveConflictsV2([...rules].reverse())).toEqual(resolution);
  });

  it("reports mandatory conflicts, respects disjoint scopes, and exposes unresolved requirements", () => {
    const rules = [rule("UDI-SYS-011", "high", [{ dimension: "color", value: "dark" }])];
    const conflicting = [constraint("CTX-DARK", "dark"), constraint("CTX-LIGHT", "light")];
    const result = resolveConflictsV2(rules, conflicting);
    expect(result.selectedRules).toEqual([]);
    expect(result.conflicts[0]?.status).toBe("unresolved");
    const disjoint = resolveConflictsV2(rules, [constraint("CTX-DARK", "dark", "application/admin"), constraint("CTX-LIGHT", "light", "application/public")]);
    expect(disjoint.conflicts.some(c => c.status === "unresolved")).toBe(false);
    const packet = recommendDesignV2({ schemaVersion: "2.0", constraints: conflicting });
    expect(packet.coverage.some(item => item.status === "conflicting" && item.requirement.startsWith("constraint:"))).toBe(true);
    expect(packet.coverageComplete).toBe(false);
  });

  it("reports excluded coverage and keeps post-budget conflict winner references valid", () => {
    const base = rule("UDI-SYS-011", "high", [{ dimension: "brand", value: "preserve" }]);
    const catalog: Catalog = { rules: [base], profiles: [], patterns: [], antiPatterns: [] };
    const packet = recommendDesignV2({ schemaVersion: "2.0", constraints: [{ id: "CTX-REPLACE", dimension: "brand", value: "replace", strength: "must" }] }, {}, catalog);
    expect(packet.coverage.find(item => item.requirement === "brand-preservation")?.status).toBe("conflicting");
    expect(packet.conflicts[0]?.constraintIds).toContain("CTX-REPLACE");
    expect(RecommendationV2Schema.parse(packet)).toEqual(packet);
  });

  it("does not claim coverage of an unsupported mandatory value", () => {
    const packet = recommendDesignV2({ schemaVersion: "2.0", constraints: [constraint("CTX-UNKNOWN", "unknown-treatment")] });
    expect(packet.coverage.find(item => item.requirement === "constraint:CTX-UNKNOWN")?.status).toBe("unsupported");
    expect(packet.coverageComplete).toBe(false);
    const preserve = recommendDesignV2({ schemaVersion: "2.0", constraints: [{ ...constraint("CTX-PRESERVE", "preserve"), dimension: "brand" }] });
    expect(preserve.coverage.find(item => item.requirement === "constraint:CTX-PRESERVE")?.status).toBe("covered");
  });
});

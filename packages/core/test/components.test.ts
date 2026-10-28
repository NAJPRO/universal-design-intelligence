import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import type { ContextV2Input } from "@udi/knowledge";
import { RecommendationV2Schema } from "@udi/knowledge";
import { recommendDesignV21, inspectProfessionalSpec, retrieveComponentSpecs, professionalComponents, RecommendationV21Schema } from "../src/components.js";
import { defaultCatalogV2 } from "../src/knowledge-v2.js";
import { recommendDesignV2 } from "../src/recommend-v2.js";
const content = readFileSync(new URL("../../../tests/mission009/evaluation.json", import.meta.url), "utf8");
const cases: Array<{ id: string; context: ContextV2Input; expected: string[]; forbidden: string[]; unsupported?: string[] }> = JSON.parse(content);
const context = cases[0]!.context;
const ids = (packet: ReturnType<typeof recommendDesignV21>) => packet.entities.filter(e => e.kind === "component" || e.kind === "composition").map(e => e.id).sort();
const ev = (value: string) => ({ value, status: "explicit" as const, evidenceRefs: ["test"] });

describe("Mission 009 component selection", () => {
  it("retains the pre-content evaluation fixture hash", () => {
    expect(createHash("sha256").update(content).digest("hex")).toBe(readFileSync(new URL("../../../tests/mission009/evaluation.sha256", import.meta.url), "utf8").trim());
  });
  it.each(cases)("selects only labeled applicable knowledge: $id", sample => {
    const packet = recommendDesignV21(sample.context);
    expect(ids(packet)).toEqual([...sample.expected].sort());
    for (const forbidden of sample.forbidden) expect(ids(packet)).not.toContain(forbidden);
    for (const unsupported of sample.unsupported ?? []) expect(packet.coverage.find(c => c.requirement === unsupported)?.status).toBe("unsupported");
    expect(packet.budget.usedBytes).toBe(Buffer.byteLength(JSON.stringify(packet) + "\n"));
    expect(packet.budget.usedBytes).toBeLessThanOrEqual(24576);
    expect(packet.entities.every(e => e.ruleIds.every(ref => packet.entities.some(rule => rule.id === ref && rule.kind === "rule")))).toBe(true);
    for (const entity of packet.entities.filter(e => ["component", "composition"].includes(e.kind))) {
      expect(entity.reasons.some(reason => reason.includes("Application gate:"))).toBe(true);
      expect(entity.reasons.some(reason => reason.includes("Task evidence:") || reason.includes("Requested component:"))).toBe(true);
      expect(packet.coverage.find(c => c.requirement === `spec:${entity.id}`)?.status).toBe("covered");
    }
    expect(packet.coverageComplete).toBe(packet.coverage.every(c => c.status === "covered"));
  });
  it("preserves strict schema 2.0 and exact v2 output after enhanced calls", () => {
    const before = JSON.stringify(recommendDesignV2(context));
    recommendDesignV21(context);
    expect(JSON.stringify(recommendDesignV2(context))).toBe(before);
    expect(RecommendationV2Schema.safeParse(recommendDesignV21(context)).success).toBe(false);
  });
  it("keeps uncertainty and role contributions honest", () => {
    const explicit = recommendDesignV21(context);
    const inferred = recommendDesignV21({ ...context, roles: [ev("visitor")], tasks: { primary: { ...ev("Review product rows by stock"), status: "inferred" } } });
    expect(ids(inferred)).not.toContain("CMP-RECOVERABLE-FORM");
    expect(inferred.entities.find(e => e.id === "CMP-OPERATIONAL-TABLE")?.reasons.some(r => r.includes("Task evidence: inferred"))).toBe(true);
    expect(explicit.entities.find(e => e.id === "CMP-OPERATIONAL-TABLE")!.score).toBeGreaterThan(inferred.entities.find(e => e.id === "CMP-OPERATIONAL-TABLE")!.score);
  });
  it("does not elevate a named composition to a generic dashboard default", () => {
    const packet = recommendDesignV21({ schemaVersion: "2.0", applicationType: ev("operations-workspace"), components: [ev("operational workspace")] });
    expect(ids(packet)).toEqual([]);
    expect(packet.coverage.find(c => c.requirement === "component:operational workspace")?.status).toBe("unsupported");
  });
  it("resolves transitive component dependencies atomically", () => {
    const pack = structuredClone(professionalComponents);
    pack.components[0]!.dependencies = [pack.components[1]!.id];
    const packet = recommendDesignV21({ schemaVersion: "2.0", applicationType: ev("operations-workspace"), components: [ev("table")] }, {}, defaultCatalogV2, pack);
    expect(ids(packet)).toEqual(["CMP-FILTER-WORKSPACE", "CMP-OPERATIONAL-TABLE"]);
  });
  it("never returns specifications whose referenced rules fail framework or conflict gates", () => {
    const catalog = structuredClone(defaultCatalogV2);
    catalog.rules.find(r => r.id === "UDI-DAT-001")!.frameworks = ["vue"];
    const packet = recommendDesignV21(context, {}, catalog);
    expect(ids(packet)).not.toContain("CMP-OPERATIONAL-TABLE");
    expect(ids(packet)).not.toContain("COM-OPERATIONAL-MANAGEMENT");
    expect(packet.coverage.find(c => c.requirement === "spec:CMP-OPERATIONAL-TABLE")?.status).toBe("unsupported");
    const changed = structuredClone(defaultCatalogV2);
    changed.rules.find(r => r.id === "UDI-DAT-001")!.choices = [{ dimension: "density", value: "compact" }];
    const conflict = recommendDesignV21({ ...context, constraints: [{ id: "CTX-DENSITY", dimension: "density", value: "comfortable", strength: "must" }] }, {}, changed);
    expect(ids(conflict)).not.toContain("CMP-OPERATIONAL-TABLE");
    expect(RecommendationV21Schema.safeParse(conflict).success).toBe(true);
  });
  it("is deterministic for repeated and reordered catalogs/context arrays", () => {
    const catalog = structuredClone(defaultCatalogV2);
    for (const values of Object.values(catalog)) values.reverse();
    const pack = structuredClone(professionalComponents); pack.components.reverse(); pack.compositions.reverse();
    expect(recommendDesignV21(context, {}, catalog, pack)).toEqual(recommendDesignV21(context));
    expect(recommendDesignV21(context)).toEqual(recommendDesignV21(context));
  });
  it("inspects full records without exposing mutable singletons and invalidates stale expansion keys", () => {
    const spec = inspectProfessionalSpec("CMP-RECOVERABLE-FORM"); spec.name = "Caller edited copy";
    expect(inspectProfessionalSpec(spec.id).name).toBe("Recoverable Form");
    expect(() => inspectProfessionalSpec("CMP-NOT-INSTALLED")).toThrow("Unknown");
    const first = recommendDesignV21(context);
    expect(first.expansion).not.toBeNull();
    const pack = structuredClone(professionalComponents); pack.components[0]!.purpose += " Changed specification.";
    expect(() => recommendDesignV21(context, { expand: first.expansion!.key }, defaultCatalogV2, pack)).toThrow("Expansion key");
    expect(() => recommendDesignV21({ ...context, query: "changed context" }, { expand: first.expansion!.key })).toThrow("Expansion key");
  });
  it("bounds pages, accounts for omission and makes expansion progress", () => {
    const full = recommendDesignV21(context);
    let packet = full;
    const seen = new Set<string>();
    for (let page = 0; page < 100; page++) {
      packet.entities.forEach(e => seen.add(e.id));
      expect(packet.budget.usedBytes).toBeLessThanOrEqual(24576);
      if (!packet.expansion) break;
      packet = recommendDesignV21(context, { expand: packet.expansion.key });
      if (page === 99) throw new Error("Expansion did not terminate");
    }
    expect(seen.size).toBeGreaterThan(full.entities.length);
    const max = recommendDesignV21(context, { maxBytes: 100000 });
    expect(seen).toEqual(new Set(max.entities.map(e => e.id)));
    expect(() => recommendDesignV21(context, { maxBytes: 1 })).toThrow("budget");
    expect(() => recommendDesignV21(context, { entityLimit: 1 })).toThrow("dependencies");
  });
  it("observes modified supplied catalogs without stale results", () => {
    const pack = structuredClone(professionalComponents);
    const before = recommendDesignV21(context, {}, defaultCatalogV2, pack);
    pack.components[0]!.purpose = "Updated caller-supplied table purpose retained on the next request.";
    const after = recommendDesignV21(context, {}, defaultCatalogV2, pack);
    expect(after.entities.find(e => e.id === "CMP-OPERATIONAL-TABLE")!.guidance[0]).toBe(pack.components[0]!.purpose);
    expect(after.expansion!.key).not.toBe(before.expansion!.key);
  });
  it("gates transitive components against application evidence", () => {
    const pack = structuredClone(professionalComponents);
    pack.components[0]!.dependencies = [pack.components[2]!.id];
    pack.components[2]!.applicability.applicationTypes = ["authoring"];
    const packet = recommendDesignV21(context, {}, defaultCatalogV2, pack);
    expect(ids(packet)).not.toContain("CMP-OPERATIONAL-TABLE");
    expect(packet.coverage.find(c => c.requirement === "spec:CMP-OPERATIONAL-TABLE")?.status).toBe("unsupported");
  });
  it("rejects incompatible independent component selections deterministically", () => {
    const pack = structuredClone(professionalComponents); pack.compositions = [];
    pack.components[0]!.incompatibleWith = [pack.components[2]!.id];
    const packet = recommendDesignV21(context, {}, defaultCatalogV2, pack);
    expect(ids(packet)).toContain("CMP-OPERATIONAL-TABLE");
    expect(ids(packet)).not.toContain("CMP-RECOVERABLE-FORM");
    expect(packet.coverage.find(c => c.requirement === "spec:CMP-RECOVERABLE-FORM")?.status).toBe("conflicting");
  });
  it("handles maximal task evidence without overflowing bounded explanations", () => {
    const packet = recommendDesignV21({ schemaVersion: "2.0", applicationType: ev("operations-workspace"), tasks: { primary: ev("review rows " + "x".repeat(228)) } });
    expect(ids(packet)).toContain("CMP-OPERATIONAL-TABLE");
    expect(packet.entities.every(e => e.reasons.every(r => r.length <= 240))).toBe(true);
  });
  it("retrieves summaries independently and reports unsupported explicit component requirements", () => {
    expect(retrieveComponentSpecs(context).map(m => m.id).sort()).toEqual([...cases[0]!.expected].sort());
    const packet = recommendDesignV21({ ...context, components: [ev("editable spreadsheet"), ev("calendar")] });
    expect(packet.coverage.filter(c => c.requirement.startsWith("component:")).every(c => c.status === "unsupported")).toBe(true);
  });
});

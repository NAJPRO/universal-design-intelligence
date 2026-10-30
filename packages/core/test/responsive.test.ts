import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { recommendDesignV21, inspectProfessionalSpec, professionalComponents } from "../src/components.js";
import { recommendDesignV2 } from "../src/recommend-v2.js";
import { defaultCatalogV2 } from "../src/knowledge-v2.js";
import type { ComponentCatalog } from "@udi/knowledge/component-schemas";
import type { ContextV2Input } from "@udi/knowledge";
import { assess } from "../../../benchmarks/mission011/assess.mjs";
const before = JSON.parse(readFileSync(new URL("../../../benchmarks/mission011/baseline/components.json", import.meta.url), "utf8")) as ComponentCatalog;
const context = JSON.parse(readFileSync(new URL("../../../benchmarks/mission011/protocol/context.json", import.meta.url), "utf8")) as ContextV2Input;

describe("Mission 011 responsive retrieval compatibility", () => {
  it("preserves specification IDs, schema and selection while revising content", () => {
    const prior = recommendDesignV21(context, {}, defaultCatalogV2, before);
    const after = recommendDesignV21(context);
    const ids = (p: typeof after) => p.entities.filter(e => ["component", "composition"].includes(e.kind)).map(e => e.id).sort();
    expect(ids(after)).toEqual(ids(prior));
    expect(after.componentCatalogVersion).toBe("1.1.0");
    for (const id of ids(after)) {
      const spec = inspectProfessionalSpec(id);
      expect(spec.schemaVersion).toBe("1.0");
      expect(spec.revision).toBe(2);
      expect(spec.responsive.length).toBeGreaterThan(1);
    }
    expect(after.budget.usedBytes).toBeLessThanOrEqual(24576);
    expect(JSON.stringify(after)).toBe(JSON.stringify(recommendDesignV21(context)));
  });
  it("projects a bounded responsive decision from caller-supplied contracts", () => {
    const pack = structuredClone(professionalComponents);
    const table = pack.components.find(s => s.id === "CMP-OPERATIONAL-TABLE")!;
    table.responsive[0]!.restructure = "Caller task-specific comparison strategy.";
    const packet = recommendDesignV21(context, {}, defaultCatalogV2, pack);
    expect(packet.entities.find(e => e.id === table.id)!.guidance).toContain(table.responsive[0]!.restructure);
    expect(packet.budget.usedBytes).toBe(Buffer.byteLength(JSON.stringify(packet) + "\n"));
  });
  it("invalidates old content-bound expansion while leaving schema 2.0 independent", () => {
    const legacy = recommendDesignV2(context);
    const prior = recommendDesignV21(context, {}, defaultCatalogV2, before);
    expect(prior.expansion).not.toBeNull();
    expect(() => recommendDesignV21(context, { expand: prior.expansion!.key })).toThrow("Expansion key");
    expect(recommendDesignV2(context)).toEqual(legacy);
  });
});

describe("benchmark evidence certainty", () => {
  it("does not treat justified comparison scrolling or scrollbar absence as a defect", () => {
    expect(assess({pageOverflow:0,regions:[{id:"table",kind:"table",overflows:true,scrollbar:"auto",cue:true,keyboardVerified:true}]})).toEqual([]);
    expect(assess({pageOverflow:0,regions:[{id:"carousel",kind:"carousel",overflows:true,scrollbar:"hidden",cue:true,alternativeControls:true,keyboardVerified:true,touchVerified:true}]})).toEqual([]);
  });
  it("requires an identified ordinary-content offender to confirm page overflow", () => {
    expect(assess({pageOverflow:40})[0]!.certainty).toBe("warning");
    expect(assess({pageOverflow:40,ordinaryOverflowNodes:["oversized-image"]})[0]!.certainty).toBe("failure");
  });
  it("distinguishes priority travel, truncation and unrevealable actions from content with detail access", () => {
    const r = assess({actions:[{id:"edit",essential:true,visibleRepresentation:true,horizontalTravel:600},{id:"hidden-copy",essential:true,visibleRepresentation:false,horizontalTravel:600}],contents:[{id:"name",critical:true,clipped:true,fullContentAccess:false},{id:"secondary",critical:true,clipped:true,fullContentAccess:true}],dialogActions:[{id:"save",open:true,reachableAfterReveal:false}]});
    expect(r.map(f => f.id)).toEqual(["essential-action-travel","critical-truncation","dialog-action-unreachable"]);
    expect(r.every(f => f.certainty === "failure")).toBe(true);
  });
  it.each(["page","table","navigation","filters","carousel","dialog"])("flags unverified hidden %s scrolling for review", kind => {
    const r = assess({regions:[{id:kind,kind,overflows:true,scrollbar:"hidden",cue:false,alternativeControls:false,keyboardVerified:false,sameAxisNested:true}]});
    expect(r.map(f => f.id)).toEqual(["scroll-discovery","hidden-scrollbar-operation","nested-scroll"]);
    expect(r.every(f => f.certainty === "warning")).toBe(true);
  });
  it("does not approve concealed tracks from keyboard evidence alone", () => {
    expect(assess({regions:[{id:"nav",kind:"navigation",overflows:true,scrollbar:"hidden",cue:true,alternativeControls:true,keyboardVerified:true,touchVerified:false}]}).map(f => f.id)).toEqual(["hidden-scrollbar-operation"]);
  });
  it("keeps native-dialog BODY transitions and priority tradeoffs as warnings", () => {
    expect(assess({bodyFocusStop:true,priorityColumnsHidden:true}).every(f => f.certainty === "warning")).toBe(true);
    expect(assess({focusLostOnRestructure:true})[0]!.certainty).toBe("failure");
    expect(assess({regions:[{id:"overflow",kind:"accidental",overflows:true}]})[0]!.certainty).toBe("failure");
  });
});

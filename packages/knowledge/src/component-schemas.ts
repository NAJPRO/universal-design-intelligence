import { z } from "zod";
import { KnowledgeProvenanceSchema, RuleCategorySchema } from "./schemas.js";
import { ApplicationTypeSchema } from "./v2-schemas.js";

const text = z.string().trim().min(1).max(1600);
const id = z.string().regex(/^[a-z][a-z0-9-]*$/).max(80);
const list = z.array(text).min(1).max(64);
const ids = z.array(id).max(64);
const componentId = z.string().regex(/^CMP-[A-Z0-9-]+$/).max(100);
const entityId = z.string().regex(/^(CMP|COM)-[A-Z0-9-]+$/).max(100);
export const ComponentCheckSchema = z.object({
  id, requirement: text, method: z.enum(["static", "keyboard", "visual", "browser", "expert"]),
  severity: z.enum(["critical", "high", "medium", "low"]), passEvidence: text
}).strict();
const checks = z.array(ComponentCheckSchema).min(1).max(64);
const state = z.object({ id, meaning: text, presentation: text, announcement: text.nullable(), availableActions: ids }).strict();
const transition = z.object({ from: id, event: id, to: id, guard: text.nullable(), focus: text, failureState: id.nullable() }).strict();
const visual = z.object({
  hierarchy: text, alignment: text, spacing: text, typography: text, emphasis: text,
  surfaces: text, proportions: text, discoverability: text, states: text, brand: text, tokenRoles: list
}).strict();
const shared = {
  schemaVersion: z.literal("1.0"), revision: z.number().int().positive(), name: z.string().trim().min(1).max(240), purpose: text,
  useWhen: list, avoidWhen: list,
  applicability: z.object({ applicationTypes: z.array(ApplicationTypeSchema).min(1).max(9), taskTerms: list, roleTerms: list }).strict(),
  category: RuleCategorySchema,
  initialState: id, states: z.array(state).min(1).max(64), transitions: z.array(transition).min(1).max(128),
  visual,
  keyboard: z.array(z.object({ key: text, when: text, result: text, focus: text }).strict()).min(1).max(64),
  accessibility: z.object({ naming: text, semantics: text, checks }).strict(),
  responsive: z.array(z.object({ condition: text, restructure: text, preservedInformation: list, focusContinuity: text }).strict()).min(1).max(16),
  density: z.array(z.object({ mode: z.enum(["comfortable", "compact"]), useWhen: text, constraints: list }).strict()).min(1).max(2),
  motion: z.object({ purpose: text, trigger: text, reduced: text, interruption: text }).strict(),
  recovery: z.array(z.object({ stateId: id, explanation: text, action: id, preservedData: list }).strict()).min(1).max(32),
  dependencies: z.array(entityId).max(16), incompatibleWith: z.array(entityId).max(16),
  ruleIds: z.array(z.string().regex(/^UDI-[A-Z]{3}-\d{3}$/)).min(1).max(20),
  antiPatternIds: z.array(z.string().regex(/^UDI-ANTI-\d{3}$/)).min(1).max(16),
  checks, provenance: KnowledgeProvenanceSchema,
  evidence: z.array(z.object({ artifact: text, url: z.string().url().nullable(), accessedAt: z.iso.date(),
    relationship: z.enum(["original", "supports"]), licenseStatus: z.enum(["verified", "reference-only"]), licenseExpression: text.nullable()
  }).strict().superRefine((value, ctx) => {
    if (value.relationship === "original" && (value.licenseStatus !== "verified" || value.licenseExpression === null)) ctx.addIssue({ code: "custom", message: "Original content needs verified licensing." });
    if (value.licenseStatus === "reference-only" && value.licenseExpression !== null) ctx.addIssue({ code: "custom", message: "Reference-only documentation grants no incorporation license." });
  })).min(1).max(20)
};
const componentShape = z.object({
  ...shared, kind: z.literal("component"), id: componentId, family: z.enum(["operational-table", "filter-workspace", "recoverable-form"]),
  anatomy: z.array(z.object({ id, purpose: text, required: z.boolean(), semanticElement: text, tokenRoles: list }).strict()).min(1).max(32),
  variants: z.array(z.object({ id, useWhen: text, partIds: ids, incompatibleWith: ids, guidance: list }).strict()).min(1).max(16),
  composition: z.object({ provides: list, requires: list, focusOwner: text }).strict()
}).strict();
const compositionShape = z.object({
  ...shared, kind: z.literal("composition"), id: z.string().regex(/^COM-[A-Z0-9-]+$/).max(100),
  slots: z.array(z.object({ id, entityId: componentId, variantId: id, required: z.boolean(), priority: z.number().int().min(1).max(10) }).strict()).min(1).max(16),
  relationships: z.array(z.object({ from: id, to: id, type: z.enum(["filters", "edits", "summarizes"]), sharedState: ids }).strict()).min(1).max(32),
  sharedState: z.array(z.object({ id, owner: id, resetWhen: text }).strict()).min(1).max(32),
  actionPriority: list, extensionPoints: list, domainDefaults: list,
  layoutModes: z.array(z.object({ condition: text, orderedSlots: ids, restructuring: text }).strict()).min(1).max(8)
}).strict();

type Stateful = z.infer<typeof componentShape> | z.infer<typeof compositionShape>;
function validateStateGraph(spec: Stateful, ctx: z.RefinementCtx) {
  const issue = (message: string) => ctx.addIssue({ code: "custom", message });
  const unique = (values: string[], label: string) => { if (new Set(values).size !== values.length) issue(`Duplicate ${label}.`); };
  unique(spec.states.map(s => s.id), "state"); unique(spec.checks.map(c => c.id), "check");
  for (const [label, refs] of Object.entries({ dependency: spec.dependencies, incompatibility: spec.incompatibleWith, rule: spec.ruleIds, antiPattern: spec.antiPatternIds })) unique(refs, label);
  if (spec.dependencies.some(ref => spec.incompatibleWith.includes(ref))) issue("Required dependency is incompatible.");
  const states = new Map(spec.states.map(s => [s.id, s]));
  if (!states.has(spec.initialState)) issue("Unknown initial state.");
  const seenTransitions = new Set<string>();
  for (const t of spec.transitions) {
    if (!states.has(t.from) || !states.has(t.to) || (t.failureState !== null && !states.has(t.failureState))) issue("Unknown transition state.");
    if (!states.get(t.from)?.availableActions.includes(t.event)) issue("Transition event is not available in its source state.");
    const key = `${t.from}:${t.event}`;
    if (seenTransitions.has(key)) issue("Ambiguous transition event.");
    seenTransitions.add(key);
  }
  const reachable = new Set([spec.initialState]);
  for (let i = 0; i < spec.states.length; i++) for (const t of spec.transitions) if (reachable.has(t.from)) {
    reachable.add(t.to); if (t.failureState) reachable.add(t.failureState);
  }
  if (spec.states.some(s => !reachable.has(s.id))) issue("Unreachable state.");
  for (const r of spec.recovery) {
    if (!states.get(r.stateId)?.availableActions.includes(r.action) || !spec.transitions.some(t => t.from === r.stateId && t.event === r.action)) issue("Recovery needs an available transition action.");
  }
  for (const t of spec.transitions) if (t.failureState && !spec.recovery.some(r => r.stateId === t.failureState)) issue("Failure state needs recovery.");
  if (spec.kind === "component") {
    unique(spec.anatomy.map(p => p.id), "part"); unique(spec.variants.map(v => v.id), "variant");
    for (const v of spec.variants) {
      unique(v.partIds, "variant part");
      if (v.partIds.some(ref => !spec.anatomy.some(p => p.id === ref))) issue("Unknown variant part.");
      if (spec.anatomy.some(p => p.required && !v.partIds.includes(p.id))) issue("Variant omits a required part.");
      if (v.incompatibleWith.some(ref => ref === v.id || !spec.variants.some(other => other.id === ref))) issue("Unknown or self-incompatible variant.");
    }
  } else {
    unique(spec.slots.map(s => s.id), "slot"); unique(spec.sharedState.map(s => s.id), "shared state");
    const slots = new Set(spec.slots.map(s => s.id));
    for (const rel of spec.relationships) if (!slots.has(rel.from) || !slots.has(rel.to) || rel.sharedState.some(ref => !spec.sharedState.some(s => s.id === ref))) issue("Unknown relationship slot/state.");
    for (const s of spec.sharedState) if (s.owner !== "workspace" && !slots.has(s.owner)) issue("Unknown shared state owner.");
    for (const mode of spec.layoutModes) {
      unique(mode.orderedSlots, "layout slot");
      if (mode.orderedSlots.some(ref => !slots.has(ref)) || spec.slots.some(s => s.required && !mode.orderedSlots.includes(s.id))) issue("Layout omits required slots or references unknown slots.");
    }
  }
}
export const ComponentSpecSchema = componentShape.superRefine(validateStateGraph);
export const CompositionSpecSchema = compositionShape.superRefine(validateStateGraph);
export type ComponentSpec = z.infer<typeof ComponentSpecSchema>;
export type CompositionSpec = z.infer<typeof CompositionSpecSchema>;
export type ProfessionalSpec = ComponentSpec | CompositionSpec;
export interface ComponentCatalog { version: string; components: ComponentSpec[]; compositions: CompositionSpec[] }

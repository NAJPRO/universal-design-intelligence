import { z } from "zod";
import { DesignChoiceSchema, FrameworkSchema, KnowledgeProvenanceSchema, RuleCategorySchema } from "./schemas.js";

const text = z.string().trim().min(1).max(240);
const refs = z.array(z.string().min(1).max(240)).max(20);
export const EvidenceStatusSchema = z.enum(["explicit", "observed", "inferred", "unknown"]);
export function evidenceSchema<T extends z.ZodType>(value: T) {
  return z.object({
    value: value.nullable(), status: EvidenceStatusSchema,
    evidenceRefs: refs.default([]), alternatives: z.array(value).max(10).default([])
  }).strict().superRefine((evidence, ctx) => {
    const observedValue = (evidence as { value?: unknown }).value;
    if ((evidence.status === "unknown") !== (observedValue === null)) {
      ctx.addIssue({ code: "custom", message: "Unknown evidence requires null; known evidence requires a value." });
    }
  });
}
const unknown = { value: null, status: "unknown" as const, evidenceRefs: [], alternatives: [] };
export const TextEvidenceSchema = evidenceSchema(text);
export const APPLICATION_TYPES = ["public-information", "marketing", "storefront", "self-service-portal", "operations-workspace", "analytics", "authoring", "scheduling", "editorial"] as const;
export const ApplicationTypeSchema = z.enum(APPLICATION_TYPES);
export const ContextFieldSchema = z.enum(["industry", "applicationType", "primaryTask", "framework", "designSystem", "brand"]);
export const ScopedConstraintSchema = z.object({
  id: z.string().regex(/^CTX-[A-Z0-9-]+$/).max(64),
  scope: z.string().regex(/^application(?:\/[a-zA-Z0-9_-]+)*$/).max(160).default("application"),
  dimension: DesignChoiceSchema.shape.dimension,
  value: text, strength: z.enum(["must", "prefer"]), evidenceRefs: refs.default([])
}).strict();

export const ContextV2Schema = z.object({
  schemaVersion: z.literal("2.0"),
  industry: TextEvidenceSchema.default(unknown),
  applicationType: evidenceSchema(ApplicationTypeSchema).default(unknown),
  roles: z.array(TextEvidenceSchema).max(10).default([]),
  tasks: z.object({ primary: TextEvidenceSchema.default(unknown), secondary: z.array(TextEvidenceSchema).max(10).default([]) }).strict().default({ primary: unknown, secondary: [] }),
  framework: evidenceSchema(FrameworkSchema).default(unknown),
  designSystem: TextEvidenceSchema.default(unknown),
  brand: z.object({ identity: TextEvidenceSchema.default(unknown), preserve: z.boolean().default(true), tokens: z.array(text).max(20).default([]) }).strict().default({ identity: unknown, preserve: true, tokens: [] }),
  components: z.array(TextEvidenceSchema).max(20).default([]),
  query: z.string().max(1000).default(""),
  observations: z.array(z.object({ field: ContextFieldSchema, evidence: TextEvidenceSchema }).strict()).max(30).default([]),
  uncertainty: z.array(z.object({ field: ContextFieldSchema, reason: text }).strict()).max(20).default([]),
  constraints: z.array(ScopedConstraintSchema).max(30).default([])
}).strict();

export const KnowledgeEntityV2Schema = z.object({
  id: text, kind: z.enum(["rule", "pattern", "anti-pattern"]), title: text,
  category: RuleCategorySchema, guidance: z.array(z.string().min(1)).min(1),
  ruleIds: z.array(text), sourceIds: z.array(text),
  score: z.number().finite().nonnegative(), reasons: z.array(text).min(1)
}).strict();
export const ConflictV2Schema = z.object({
  scope: z.string(), dimension: DesignChoiceSchema.shape.dimension,
  status: z.enum(["resolved", "unresolved"]), selectedEntityId: text.nullable(),
  excludedEntityIds: z.array(text), constraintIds: z.array(text), explanation: z.string().min(1)
}).strict();
export const RecommendationV2Schema = z.object({
  schemaVersion: z.literal("2.0"), catalogVersion: text, engineVersion: text,
  engine: z.literal("udi-deterministic"), context: ContextV2Schema,
  evidenceLevel: z.enum(["strong", "mixed", "sparse"]), rankMargin: z.number().finite().nonnegative(),
  profileCandidates: z.array(z.object({
    id: text, name: text, score: z.number().finite().nonnegative(),
    contributions: z.object({ application: z.number(), task: z.number(), industry: z.number(), role: z.number() }).strict(),
    reason: text
  }).strict()).max(3),
  entities: z.array(KnowledgeEntityV2Schema),
  coverage: z.array(z.object({
    requirement: z.string().min(1).max(300), status: z.enum(["covered", "unsupported", "conflicting", "budget-omitted"]),
    entityIds: z.array(text), reason: z.string().min(1)
  }).strict()), coverageComplete: z.boolean(),
  conflicts: z.array(ConflictV2Schema),
  sources: z.array(KnowledgeProvenanceSchema),
  assumptions: z.array(z.string().min(1)),
  expansion: z.object({ key: text, omittedCount: z.number().int().nonnegative() }).strict().nullable(),
  budget: z.object({ maxBytes: z.number().int().positive(), usedBytes: z.number().int().nonnegative() }).strict()
}).strict().superRefine((packet, ctx) => {
  const ids = new Set(packet.entities.map(entity => entity.id));
  const rules = new Set(packet.entities.filter(entity => entity.kind === "rule").map(entity => entity.id));
  const sources = new Set(packet.sources.map(source => source.sourceId));
  const constraints = new Set(packet.context.constraints.map(constraint => constraint.id));
  const invalid = (message: string) => ctx.addIssue({ code: "custom", message });
  if (ids.size !== packet.entities.length) invalid("Duplicate selected entity ID.");
  if (sources.size !== packet.sources.length) invalid("Duplicate source ID.");
  if (new Set(packet.coverage.map(item => item.requirement)).size !== packet.coverage.length) invalid("Duplicate coverage requirement.");
  for (const entity of packet.entities) {
    if (entity.ruleIds.some(id => !rules.has(id))) invalid(`Missing rule reference for ${entity.id}.`);
    if (entity.sourceIds.some(id => !sources.has(id))) invalid(`Missing provenance for ${entity.id}.`);
  }
  for (const item of packet.coverage) {
    if (item.entityIds.some(id => !ids.has(id))) invalid("Coverage refers to an unselected entity.");
    if ((item.status === "covered") !== (item.entityIds.length > 0)) invalid("Coverage status and selected IDs disagree.");
  }
  for (const conflict of packet.conflicts) {
    if (conflict.selectedEntityId && !ids.has(conflict.selectedEntityId)) invalid("Conflict winner is not selected.");
    if (conflict.excludedEntityIds.some(id => ids.has(id))) invalid("Conflict loser is selected.");
    if (conflict.constraintIds.some(id => !constraints.has(id))) invalid("Unknown conflict constraint.");
    if (conflict.status === "resolved" && !conflict.selectedEntityId && !conflict.constraintIds.length) invalid("Resolved conflict has no surviving winner or context constraint.");
    if (conflict.status === "unresolved" && (conflict.selectedEntityId !== null || conflict.constraintIds.length < 2)) invalid("Unresolved conflict must retain competing constraints without a winner.");
  }
  if (packet.coverageComplete !== packet.coverage.every(item => item.status === "covered")) invalid("Incorrect coverageComplete.");
  if (packet.budget.usedBytes > packet.budget.maxBytes) invalid("Packet exceeds budget.");
});

export type ContextV2Input = z.input<typeof ContextV2Schema>;
export type ContextV2 = z.output<typeof ContextV2Schema>;
export type TextEvidence = z.output<typeof TextEvidenceSchema>;
export type ApplicationType = z.infer<typeof ApplicationTypeSchema>;
export type KnowledgeEntityV2 = z.infer<typeof KnowledgeEntityV2Schema>;
export type ScopedConstraint = z.infer<typeof ScopedConstraintSchema>;
export type ConflictV2 = z.infer<typeof ConflictV2Schema>;
export type RecommendationV2 = z.infer<typeof RecommendationV2Schema>;

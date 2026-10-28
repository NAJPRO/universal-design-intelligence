export * from "./legacy.js";
export { ContextV2Schema, RecommendationV2Schema, KnowledgeEntityV2Schema, ScopedConstraintSchema, EvidenceStatusSchema, TextEvidenceSchema, APPLICATION_TYPES, ApplicationTypeSchema } from "@udi/knowledge";
export type { ContextV2Input, ContextV2, KnowledgeEntityV2, RecommendationV2, ScopedConstraint, ConflictV2, TextEvidence } from "@udi/knowledge";
export { normalizeContextV2, adaptLegacyContext, mergeLegacyContext } from "./context-v2.js";
export { resolveConflictsV2 } from "./conflicts-v2.js";
export { retrieveKnowledgeV2 } from "./knowledge-v2.js";
export { recommendDesignV2, ENGINE_VERSION_V2 } from "./recommend-v2.js";
export type { RecommendationOptionsV2 } from "./recommend-v2.js";

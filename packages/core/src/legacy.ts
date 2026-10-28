export {
  AntiPatternSchema,
  ComponentPatternSchema,
  DesignProfileSchema,
  DesignRecommendationSchema,
  DesignRuleSchema,
  FrameworkSchema,
  KnowledgeProvenanceSchema,
  ProjectContextSchema,
  ProjectTypeSchema,
  RuleCategorySchema,
  RULE_CATEGORIES,
  PROJECT_TYPES,
  FRAMEWORKS,
  PRIORITIES,
} from "@udi/knowledge/legacy";
export type {
  AntiPattern,
  ComponentPattern,
  DesignProfile,
  DesignRecommendation,
  DesignRule,
  Framework,
  KnowledgeProvenance,
  Priority,
  ProjectContext,
  ProjectContextInput,
  ProjectType,
  RuleCategory
} from "@udi/knowledge/legacy";
export { antiPatterns, catalogVersion, componentPatterns, designProfiles, designRules, validateCatalog } from "@udi/knowledge/legacy";
export { Bm25Retriever, searchDesignRules, tokenize } from "./retrieval.js";
export type { Retriever, SearchFilterValues, SearchRequest, SearchResult } from "./retrieval.js";
export { recommendDesign, resolveRuleConflicts } from "./recommend.js";

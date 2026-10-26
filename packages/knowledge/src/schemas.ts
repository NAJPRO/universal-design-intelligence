import { z } from "zod";

export const RULE_CATEGORIES = [
  "visual-hierarchy",
  "typography",
  "color-contrast",
  "spacing-layout",
  "responsive-design",
  "navigation",
  "marketing-landing-pages",
  "saas-dashboards",
  "tables-data-visualization",
  "forms",
  "pricing-pages",
  "accessibility",
  "interaction-states",
  "design-systems",
  "anti-patterns"
] as const;

export const PROJECT_TYPES = [
  "marketing-site",
  "saas",
  "dashboard",
  "fintech",
  "developer-tools",
  "professional-services",
  "ecommerce",
  "editorial",
  "web-app",
  "marketplace",
  "education"
] as const;

export const FRAMEWORKS = [
  "framework-agnostic",
  "nextjs",
  "react",
  "vue",
  "nuxt",
  "angular",
  "svelte",
  "sveltekit",
  "astro",
  "remix",
  "html-css"
] as const;

export const PRIORITIES = ["critical", "high", "medium", "low"] as const;

export const RuleCategorySchema = z.enum(RULE_CATEGORIES);
export const ProjectTypeSchema = z.enum(PROJECT_TYPES);
export const FrameworkSchema = z.enum(FRAMEWORKS);
export const PrioritySchema = z.enum(PRIORITIES);

export const KnowledgeProvenanceSchema = z.object({
  sourceId: z.string().regex(/^SRC-[A-Z0-9-]+$/),
  sourceName: z.string().min(3),
  organization: z.string().min(2),
  license: z.string().min(2),
  url: z.string().url().optional(),
  attribution: z.string().min(3),
  references: z.array(z.object({
    name: z.string().min(3),
    url: z.string().url()
  }).strict()).default([]),
  reviewedBy: z.array(z.string().min(2)).min(1),
  reviewStatus: z.enum(["reviewed", "pending"]),
  reviewedAt: z.iso.date().optional()
}).strict();

export const DesignChoiceSchema = z.object({
  dimension: z.enum(["density", "motion", "navigation", "color", "brand"]),
  value: z.string().min(1)
}).strict();

export const DesignRuleSchema = z.object({
  id: z.string().regex(/^UDI-[A-Z]{3}-\d{3}$/),
  category: RuleCategorySchema,
  title: z.string().min(8),
  summary: z.string().min(20),
  guidance: z.array(z.string().min(15)).min(1),
  contexts: z.array(z.union([ProjectTypeSchema, z.literal("all")])).min(1),
  frameworks: z.array(FrameworkSchema).min(1),
  priority: PrioritySchema,
  tags: z.array(z.string().min(2)).min(1),
  source: KnowledgeProvenanceSchema,
  relatedAntiPatternIds: z.array(z.string().regex(/^UDI-ANTI-\d{3}$/)),
  choices: z.array(DesignChoiceSchema)
}).strict().superRefine((rule, context) => {
  const dimensions = new Set<string>();
  for (const choice of rule.choices) {
    if (dimensions.has(choice.dimension)) {
      context.addIssue({
        code: "custom",
        message: `A rule may define only one design choice per dimension (${choice.dimension}).`,
        path: ["choices"]
      });
    }
    dimensions.add(choice.dimension);
  }
});

export const DesignProfileSchema = z.object({
  id: z.string().regex(/^PRO-[A-Z0-9-]+$/),
  name: z.string().min(3),
  description: z.string().min(20),
  projectTypes: z.array(z.union([ProjectTypeSchema, z.literal("all")])).min(1),
  audiences: z.array(z.string().min(2)),
  styleKeywords: z.array(z.string().min(2)),
  ruleIds: z.array(z.string().regex(/^UDI-[A-Z]{3}-\d{3}$/)).min(1),
  direction: z.object({
    visualPrinciple: z.string().min(12),
    typography: z.string().min(12),
    color: z.string().min(12),
    layout: z.string().min(12),
    interaction: z.string().min(12)
  }).strict(),
  provenance: KnowledgeProvenanceSchema
}).strict();

export const ProjectContextSchema = z.object({
  type: ProjectTypeSchema.optional(),
  framework: FrameworkSchema.optional(),
  audience: z.string().max(240).optional(),
  goals: z.array(z.string().min(2).max(120)).max(10).default([]),
  style: z.string().max(80).optional(),
  constraints: z.object({
    preserveBrand: z.boolean().default(false),
    existingBrandDescription: z.string().max(500).optional(),
    designSystem: z.string().max(160).optional(),
    brandColorTokens: z.array(z.string().min(1)).max(20).default([]),
    brandTypography: z.string().max(160).optional()
  }).default({ preserveBrand: false, brandColorTokens: [] })
}).strict();

export const ComponentPatternSchema = z.object({
  id: z.string().regex(/^PAT-[A-Z0-9-]+$/),
  name: z.string().min(3),
  category: RuleCategorySchema,
  contexts: z.array(z.union([ProjectTypeSchema, z.literal("all")])).min(1),
  problem: z.string().min(15),
  solution: z.array(z.string().min(15)).min(1),
  ruleIds: z.array(z.string().regex(/^UDI-[A-Z]{3}-\d{3}$/)).min(1),
  provenance: KnowledgeProvenanceSchema
}).strict();

export const AntiPatternSchema = z.object({
  id: z.string().regex(/^UDI-ANTI-\d{3}$/),
  name: z.string().min(3),
  description: z.string().min(20),
  harms: z.array(z.string().min(10)).min(1),
  alternatives: z.array(z.string().min(15)).min(1),
  contexts: z.array(z.union([ProjectTypeSchema, z.literal("all")])).min(1),
  relatedRuleIds: z.array(z.string().regex(/^UDI-[A-Z]{3}-\d{3}$/)).min(1),
  provenance: KnowledgeProvenanceSchema
}).strict();

export const DesignRecommendationSchema = z.object({
  schemaVersion: z.literal("1.0"),
  catalogVersion: z.string().min(1),
  engine: z.literal("udi-deterministic"),
  context: ProjectContextSchema,
  profile: z.object({
    id: z.string(),
    name: z.string(),
    reason: z.string().min(12)
  }).strict(),
  direction: z.object({
    visualPrinciple: z.string(),
    typography: z.string(),
    color: z.string(),
    layout: z.string(),
    interaction: z.string()
  }).strict(),
  recommendations: z.array(z.object({
    ruleId: z.string(),
    category: RuleCategorySchema,
    title: z.string(),
    guidance: z.array(z.string()),
    priority: PrioritySchema,
    sourceIds: z.array(z.string())
  }).strict()),
  conflicts: z.array(z.object({
    dimension: z.string(),
    selectedValue: z.string(),
    selectedRuleId: z.string(),
    excludedRuleIds: z.array(z.string()),
    explanation: z.string()
  }).strict()),
  sourceRuleIds: z.array(z.string()),
  assumptions: z.array(z.string())
}).strict();

export type RuleCategory = z.infer<typeof RuleCategorySchema>;
export type ProjectType = z.infer<typeof ProjectTypeSchema>;
export type Framework = z.infer<typeof FrameworkSchema>;
export type Priority = z.infer<typeof PrioritySchema>;
export type KnowledgeProvenance = z.infer<typeof KnowledgeProvenanceSchema>;
export type DesignRule = z.infer<typeof DesignRuleSchema>;
export type DesignProfile = z.infer<typeof DesignProfileSchema>;
export type ProjectContextInput = z.input<typeof ProjectContextSchema>;
export type ProjectContext = z.output<typeof ProjectContextSchema>;
export type ComponentPattern = z.infer<typeof ComponentPatternSchema>;
export type AntiPattern = z.infer<typeof AntiPatternSchema>;
export type DesignRecommendation = z.infer<typeof DesignRecommendationSchema>;

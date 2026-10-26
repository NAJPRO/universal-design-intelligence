import {
  DesignRecommendationSchema,
  ProjectContextSchema,
  type DesignProfile,
  type DesignRecommendation,
  type DesignRule,
  type Priority,
  type ProjectContext,
  type ProjectContextInput
} from "@udi/knowledge";
import { antiPatterns, catalogVersion, designProfiles, designRules, validateCatalog } from "@udi/knowledge";
import { Bm25Retriever } from "./retrieval.js";

const priorityRank: Record<Priority, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1
};

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

function normalizedWords(value: string): Set<string> {
  return new Set(
    value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLocaleLowerCase("en-US")
      .match(/[\p{L}\p{N}]+/gu) ?? []
  );
}

function profileScore(profile: DesignProfile, context: ProjectContext, type: string): number {
  const exactType = profile.projectTypes.includes(type as DesignProfile["projectTypes"][number]) ? 20 : 0;
  const audience = new Set([...(context.audience ? normalizedWords(context.audience) : [])]);
  const audienceTerms = new Set(profile.audiences.flatMap((term) => [...normalizedWords(term)]));
  const audienceMatch = [...audienceTerms].filter((word) => audience.has(word)).length;
  const profileNameMatch = [...normalizedWords(profile.name)].filter((word) => audience.has(word)).length;
  const style = context.style ? normalizedWords(context.style) : new Set<string>();
  const styleMatch = profile.styleKeywords.reduce((sum, term) => {
    const words = normalizedWords(term);
    return sum + [...words].filter((word) => style.has(word)).length;
  }, 0);
  const specificity = exactType > 0 ? 4 / profile.projectTypes.length : 0;
  return exactType + specificity + audienceMatch * 2 + profileNameMatch * 4 + styleMatch * 3;
}

function selectProfile(profiles: readonly DesignProfile[], context: ProjectContext, type: string): DesignProfile {
  if (!context.type) {
    const safeDefault = profiles.find(({ id }) => id === "PRO-GENERAL-WEB");
    if (safeDefault) {
      return safeDefault;
    }
  }
  const applicableProfiles = profiles.filter((profile) =>
    profile.projectTypes.includes("all") ||
    profile.projectTypes.includes(type as DesignProfile["projectTypes"][number])
  );
  return [...applicableProfiles]
    .sort((left, right) =>
      profileScore(right, context, type) - profileScore(left, context, type) ||
      compareIds(left.id, right.id)
    )[0]!;
}

export function resolveRuleConflicts(rules: readonly DesignRule[]): {
  selectedRules: DesignRule[];
  conflicts: DesignRecommendation["conflicts"];
} {
  const choicesByDimension = new Map<string, Array<{ rule: DesignRule; value: string }>>();
  for (const rule of rules) {
    for (const choice of rule.choices) {
      const choices = choicesByDimension.get(choice.dimension) ?? [];
      choices.push({ rule, value: choice.value });
      choicesByDimension.set(choice.dimension, choices);
    }
  }

  const excludedIds = new Set<string>();
  const conflicts: DesignRecommendation["conflicts"] = [];
  for (const [dimension, choices] of choicesByDimension) {
    const values = new Set(choices.map(({ value }) => value));
    if (values.size < 2) {
      continue;
    }
    const ordered = [...choices].sort((left, right) =>
      priorityRank[right.rule.priority] - priorityRank[left.rule.priority] ||
      compareIds(left.rule.id, right.rule.id)
    );
    const winner = ordered[0]!;
    const excludedRuleIds = [...new Set(
      ordered.filter(({ value }) => value !== winner.value).map(({ rule }) => rule.id)
    )].sort(compareIds);
    excludedRuleIds.forEach((id) => excludedIds.add(id));
    conflicts.push({
      dimension,
      selectedValue: winner.value,
      selectedRuleId: winner.rule.id,
      excludedRuleIds,
      explanation: `Selected ${winner.value} from ${winner.rule.id} using priority (${winner.rule.priority}) and stable identifier ordering; incompatible choices were excluded.`
    });
  }

  return {
    selectedRules: rules.filter(({ id }) => !excludedIds.has(id)),
    conflicts
  };
}

function appliesTo(rule: DesignRule, type: string): boolean {
  return rule.contexts.includes("all") || rule.contexts.includes(type as DesignRule["contexts"][number]);
}

function adaptBrandDirection(
  direction: DesignProfile["direction"],
  context: ProjectContext,
  hasKnownBrand: boolean
): DesignProfile["direction"] {
  if (context.constraints.preserveBrand) {
    return {
      ...direction,
      color: context.constraints.brandColorTokens.length > 0
        ? `Preserve the supplied brand color tokens (${context.constraints.brandColorTokens.join(", ")}); adjust pairings and supporting cues for contrast without replacing them.`
        : "Preserve the existing brand palette; improve accessible pairings and supporting cues without replacing its colors.",
      typography: context.constraints.brandTypography
        ? `Preserve the supplied brand typography (${context.constraints.brandTypography}) and use it consistently across the type hierarchy.`
        : "Preserve the existing brand typography and improve hierarchy through its established type roles."
    };
  }
  if (!hasKnownBrand) {
    return {
      ...direction,
      color: "Use a restrained neutral base and accessible semantic colors; apply brand accents only after existing tokens are confirmed."
    };
  }
  return direction;
}

export function recommendDesign(
  input: ProjectContextInput,
  options: { rules?: readonly DesignRule[]; profiles?: readonly DesignProfile[] } = {}
): DesignRecommendation {
  const rules = options.rules ?? designRules;
  const profiles = options.profiles ?? designProfiles;
  validateCatalog({
    rules: [...rules],
    profiles: [...profiles],
    patterns: [],
    antiPatterns: options.rules ? [] : antiPatterns
  });

  const parsed = ProjectContextSchema.parse(input);
  const type = parsed.type ?? "web-app";
  const context: ProjectContext = { ...parsed, type };
  const selectedProfile = selectProfile(profiles, parsed, type);
  const query = [type, context.audience, context.style, ...context.goals].filter(Boolean).join(" ");
  const retrievalRequest = {
    query,
    projectType: type,
    limit: Math.min(rules.length, 40),
    ...(context.framework ? { framework: context.framework } : {})
  };
  const retrieved = rules.length === 0 ? [] : new Bm25Retriever(rules).retrieve(retrievalRequest);
  const rulesById = new Map(rules.map((rule) => [rule.id, rule]));
  const candidates: DesignRule[] = [];
  const candidateIds = new Set<string>();
  for (const id of selectedProfile.ruleIds) {
    const rule = rulesById.get(id);
    if (rule && appliesTo(rule, type) && !candidateIds.has(id)) {
      candidates.push(rule);
      candidateIds.add(id);
    }
    if (context.constraints.preserveBrand) {
      const brandRule = rulesById.get("UDI-SYS-005");
      if (brandRule && !candidateIds.has(brandRule.id)) {
        candidates.unshift(brandRule);
        candidateIds.add(brandRule.id);
      }
    }
  }
  for (const result of retrieved) {
    if (appliesTo(result.rule, type) && !candidateIds.has(result.rule.id)) {
      candidates.push(result.rule);
      candidateIds.add(result.rule.id);
    }
  }

  const resolution = resolveRuleConflicts(candidates);
  const selectedRules = resolution.selectedRules.slice(0, 14);
  const assumptions: string[] = [];
  if (!parsed.type) {
    assumptions.push("Project type was not specified; the web-app default and general-purpose profile were used.");
  }
  if (!parsed.audience) {
    assumptions.push("Audience was not specified; profile matching used project type and any supplied style or goals.");
  }
  if (!parsed.framework) {
    assumptions.push("Framework was not specified; only framework-agnostic guidance was assumed.");
  }
  if (!parsed.style) {
    assumptions.push("Style was not specified; the selected profile uses a balanced, product-appropriate direction.");
  }
  const hasKnownBrand = Boolean(
    context.constraints.designSystem ||
    context.constraints.brandColorTokens.length ||
    context.constraints.brandTypography ||
    context.constraints.existingBrandDescription
  );
  if (context.constraints.preserveBrand && !hasKnownBrand) {
    assumptions.push("Brand preservation was requested, but no brand tokens or description were supplied; preserve the current implementation as the source of truth.");
  } else if (!hasKnownBrand) {
    assumptions.push("No brand tokens were supplied; the direction avoids assuming permission to replace an existing identity.");
  }

  const audienceReason = parsed.audience ? ` and audience “${parsed.audience}”` : "";
  const styleReason = parsed.style ? ` with the requested ${parsed.style} style` : "";
  return DesignRecommendationSchema.parse({
    schemaVersion: "1.0",
    catalogVersion,
    engine: "udi-deterministic",
    context,
    profile: {
      id: selectedProfile.id,
      name: selectedProfile.name,
      reason: `Selected because this profile applies to ${type}${audienceReason}${styleReason}; profile matching uses explicit type, audience-keyword, and style-keyword overlap.`
    },
    direction: adaptBrandDirection(selectedProfile.direction, context, hasKnownBrand),
    recommendations: selectedRules.map((rule) => ({
      ruleId: rule.id,
      category: rule.category,
      title: rule.title,
      guidance: rule.guidance,
      priority: rule.priority,
      sourceIds: [rule.source.sourceId]
    })),
    conflicts: resolution.conflicts,
    sourceRuleIds: selectedRules.map(({ id }) => id),
    assumptions
  });
}

import {
  AntiPatternSchema,
  ComponentPatternSchema,
  DesignProfileSchema,
  DesignRuleSchema,
  type AntiPattern,
  type ComponentPattern,
  type DesignProfile,
  type DesignRule
} from "./schemas.js";

export interface Catalog {
  rules: DesignRule[];
  profiles: DesignProfile[];
  patterns: ComponentPattern[];
  antiPatterns: AntiPattern[];
}

export function validateCatalog(catalog: Catalog): void {
  catalog.rules.forEach((entry) => DesignRuleSchema.parse(entry));
  catalog.profiles.forEach((entry) => DesignProfileSchema.parse(entry));
  catalog.patterns.forEach((entry) => ComponentPatternSchema.parse(entry));
  catalog.antiPatterns.forEach((entry) => AntiPatternSchema.parse(entry));

  const identifiers = new Set<string>();
  const register = (id: string): void => {
    if (identifiers.has(id)) {
      throw new Error(`Duplicate catalog identifier: ${id}`);
    }
    identifiers.add(id);
  };

  catalog.rules.forEach(({ id }) => register(id));
  catalog.profiles.forEach(({ id }) => register(id));
  catalog.patterns.forEach(({ id }) => register(id));
  catalog.antiPatterns.forEach(({ id }) => register(id));

  const ruleIds = new Set(catalog.rules.map(({ id }) => id));
  const antiPatternIds = new Set(catalog.antiPatterns.map(({ id }) => id));
  const requireReferences = (ownerId: string, references: string[], available: Set<string>): void => {
    for (const reference of references) {
      if (!available.has(reference)) {
        throw new Error(`${ownerId} references unknown catalog identifier: ${reference}`);
      }
    }
  };

  for (const entry of catalog.rules) {
    requireReferences(entry.id, entry.relatedAntiPatternIds, antiPatternIds);
  }
  for (const entry of catalog.profiles) {
    requireReferences(entry.id, entry.ruleIds, ruleIds);
  }
  for (const entry of catalog.patterns) {
    requireReferences(entry.id, entry.ruleIds, ruleIds);
  }
  for (const entry of catalog.antiPatterns) {
    requireReferences(entry.id, entry.relatedRuleIds, ruleIds);
  }
}

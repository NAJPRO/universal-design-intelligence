import { z } from "zod";
import { antiPatterns, componentPatterns, designProfiles, designRules, validateCatalog } from "@udi/knowledge";
import type { Catalog, ContextV2, KnowledgeEntityV2, KnowledgeProvenance, DesignRule } from "@udi/knowledge";
import { normalizeContextV2, compare } from "./context-v2.js";
import type { ContextV2Input } from "@udi/knowledge";
import { appliesV2, frameworkApplies } from "./policy-v2.js";
import { Bm25Retriever } from "./retrieval.js";

export const defaultCatalogV2: Catalog = { rules: designRules, profiles: designProfiles, patterns: componentPatterns, antiPatterns };
export type IndexedEntityV2 = { entity: KnowledgeEntityV2; source: KnowledgeProvenance; document: DesignRule };

export class KnowledgeIndexV2 {
  readonly records: Map<string, IndexedEntityV2>;
  readonly rules: DesignRule[];
  private readonly indexes: Bm25Retriever[];

  constructor(readonly context: ContextV2, catalog: Catalog = defaultCatalogV2) {
    validateCatalog(catalog);
    this.rules = catalog.rules.filter(rule => appliesV2(rule.contexts, rule.category, context) && frameworkApplies(rule, context)).sort((a, b) => compare(a.id, b.id));
    this.records = new Map();
    for (const rule of this.rules) {
      this.records.set(rule.id, { document: rule, source: rule.source, entity: {
        id: rule.id, kind: "rule", title: rule.title, category: rule.category, guidance: rule.guidance,
        ruleIds: [], sourceIds: [rule.source.sourceId], score: 0, reasons: ["Applicable rule."]
      } });
    }
    const add = (id: string, kind: "pattern" | "anti-pattern", title: string, summary: string, guidance: string[], ruleIds: string[], source: KnowledgeProvenance, category: DesignRule["category"], contexts: DesignRule["contexts"]) => {
      // Every reference must pass the SAME application/framework gates as direct rules.
      if (!appliesV2(contexts, category, context) || !ruleIds.every(ruleId => this.records.has(ruleId))) return;
      const document: DesignRule = { id, title, summary, guidance, category, contexts, frameworks: ["framework-agnostic"], priority: "high", tags: [kind], source, relatedAntiPatternIds: [], choices: [] };
      this.records.set(id, { document, source, entity: { id, kind, title, category, guidance, ruleIds: [...ruleIds].sort(compare), sourceIds: [source.sourceId], score: 0, reasons: ["Applicable existing catalog entity; all referenced rules are compatible."] } });
    };
    for (const pattern of [...catalog.patterns].sort((a, b) => compare(a.id, b.id))) add(pattern.id, "pattern", pattern.name, pattern.problem, pattern.solution, pattern.ruleIds, pattern.provenance, pattern.category, pattern.contexts);
    for (const anti of [...catalog.antiPatterns].sort((a, b) => compare(a.id, b.id))) add(anti.id, "anti-pattern", anti.name, anti.description, [...anti.harms, ...anti.alternatives], anti.relatedRuleIds, anti.provenance, "anti-patterns", anti.contexts);
    // Reuse the established BM25 scorer without changing its v1 implementation.
    this.indexes = (["rule", "pattern", "anti-pattern"] as const).map(kind => new Bm25Retriever([...this.records.values()].filter(record => record.entity.kind === kind).map(record => record.document)));
  }

  search(query: string): KnowledgeEntityV2[] {
    return this.indexes.flatMap(index => index.retrieve({ query, limit: 100 }).map((result, rank) => ({
      ...this.records.get(result.rule.id)!.entity,
      // Reciprocal rank fusion keeps independent index magnitudes comparable.
      score: 1 / (60 + rank + 1), reasons: [`Lexical rank ${rank + 1} within entity kind; reciprocal-rank contribution.`]
    }))).sort((a, b) => b.score - a.score || compare(a.id, b.id));
  }
}

const requestSchema = z.object({ query: z.string().max(1000), limit: z.number().int().min(1).max(100).default(10), kind: z.enum(["rule", "pattern", "anti-pattern"]).optional() }).strict();
export function retrieveKnowledgeV2(input: ContextV2Input, request: z.input<typeof requestSchema>, catalog: Catalog = defaultCatalogV2): KnowledgeEntityV2[] {
  const options = requestSchema.parse(request);
  return new KnowledgeIndexV2(normalizeContextV2(input), catalog).search(options.query).filter(entity => !options.kind || entity.kind === options.kind).slice(0, options.limit);
}

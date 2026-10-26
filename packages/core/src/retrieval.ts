import { z } from "zod";
import {
  FrameworkSchema,
  ProjectTypeSchema,
  RuleCategorySchema,
  type DesignRule,
  type Framework,
  type ProjectType,
  type RuleCategory
} from "@udi/knowledge";

const SearchRequestSchema = z.object({
  query: z.string().max(1000),
  category: RuleCategorySchema.optional(),
  projectType: ProjectTypeSchema.optional(),
  framework: FrameworkSchema.optional(),
  limit: z.number().int().min(1).max(100).default(10)
}).strict();

export type SearchRequest = z.input<typeof SearchRequestSchema>;
export type SearchResult = {
  rule: DesignRule;
  score: number;
  sourceIds: string[];
};

export interface Retriever {
  retrieve(request: SearchRequest): SearchResult[];
}

const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "how", "in",
  "is", "it", "of", "on", "or", "the", "to", "with"
]);

export function tokenize(text: string): string[] {
  return text
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLocaleLowerCase("en-US")
    .match(/[\p{L}\p{N}]+/gu)
    ?.filter((token) => token.length > 1 && !STOP_WORDS.has(token)) ?? [];
}

type IndexedDocument = {
  rule: DesignRule;
  terms: Map<string, number>;
  length: number;
};

const K1 = 1.2;
const B = 0.75;

function compareIds(left: string, right: string): number {
  return left < right ? -1 : left > right ? 1 : 0;
}

export class Bm25Retriever implements Retriever {
  private readonly documents: IndexedDocument[];
  private readonly documentFrequency: Map<string, number>;
  private readonly averageLength: number;

  constructor(rules: readonly DesignRule[]) {
    this.documents = rules.map((rule) => {
      const weightedFields: Array<[string, number]> = [
        [rule.title, 2.5],
        [rule.summary, 1.4],
        [rule.guidance.join(" "), 1],
        [rule.tags.join(" "), 2],
        [rule.category.replaceAll("-", " "), 1.6],
        [rule.contexts.join(" "), 0.8]
      ];
      const terms = new Map<string, number>();
      for (const [field, weight] of weightedFields) {
        for (const token of tokenize(field)) {
          terms.set(token, (terms.get(token) ?? 0) + weight);
        }
      }
      return {
        rule,
        terms,
        length: [...terms.values()].reduce((sum, frequency) => sum + frequency, 0)
      };
    });

    this.documentFrequency = new Map();
    for (const document of this.documents) {
      for (const term of document.terms.keys()) {
        this.documentFrequency.set(term, (this.documentFrequency.get(term) ?? 0) + 1);
      }
    }
    this.averageLength = this.documents.length === 0
      ? 0
      : this.documents.reduce((sum, document) => sum + document.length, 0) / this.documents.length;
  }

  retrieve(request: SearchRequest): SearchResult[] {
    const options = SearchRequestSchema.parse(request);
    const queryTerms = [...new Set(tokenize(options.query))];
    if (queryTerms.length === 0 || this.documents.length === 0) {
      return [];
    }

    const ranked: SearchResult[] = [];
    for (const document of this.documents) {
      const { rule } = document;
      if (options.category && rule.category !== options.category) {
        continue;
      }
      if (options.projectType && !rule.contexts.includes("all") && !rule.contexts.includes(options.projectType)) {
        continue;
      }
      if (
        options.framework &&
        !rule.frameworks.includes("framework-agnostic") &&
        !rule.frameworks.includes(options.framework)
      ) {
        continue;
      }

      let score = 0;
      for (const term of queryTerms) {
        const frequency = document.terms.get(term) ?? 0;
        if (frequency === 0) {
          continue;
        }
        const documentFrequency = this.documentFrequency.get(term) ?? 0;
        const inverseDocumentFrequency = Math.log(
          1 + (this.documents.length - documentFrequency + 0.5) / (documentFrequency + 0.5)
        );
        const lengthNorm = this.averageLength === 0 ? 1 : 1 - B + B * document.length / this.averageLength;
        score += inverseDocumentFrequency * frequency * (K1 + 1) / (frequency + K1 * lengthNorm);
      }
      if (score > 0) {
        ranked.push({
          rule,
          score,
          sourceIds: [rule.source.sourceId]
        });
      }
    }

    ranked.sort((left, right) => right.score - left.score || compareIds(left.rule.id, right.rule.id));
    return ranked.slice(0, options.limit);
  }
}

export function searchDesignRules(
  rules: readonly DesignRule[],
  request: SearchRequest
): SearchResult[] {
  return new Bm25Retriever(rules).retrieve(request);
}

export type SearchFilterValues = {
  category?: RuleCategory;
  projectType?: ProjectType;
  framework?: Framework;
};

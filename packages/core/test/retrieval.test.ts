import { describe, expect, it } from "vitest";
import {
  DesignRuleSchema,
  designRules,
  Bm25Retriever,
  searchDesignRules,
  tokenize
} from "../src/index.js";
import type { DesignRule } from "../src/index.js";

const customRule = (id: string, overrides: Record<string, unknown> = {}): DesignRule =>
  DesignRuleSchema.parse({
    id,
    category: "forms",
    title: "React form validation",
    summary: "Validate form input and explain errors clearly.",
    guidance: ["Show a useful message beside each invalid form control."],
    contexts: ["saas"],
    frameworks: ["react"],
    priority: "high",
    tags: ["react", "forms", "validation"],
    source: {
      sourceId: "SRC-UDI-ORIGINAL",
      sourceName: "UDI test fixture",
      organization: "UDI",
      license: "MIT",
      attribution: "Test fixture.",
      reviewedBy: ["UDI maintainers"],
      reviewStatus: "reviewed",
      reviewedAt: "2026-10-26"
    },
    relatedAntiPatternIds: [],
    choices: [],
    ...overrides
  });

describe("BM25 retrieval", () => {
  it("normalizes case, accents, punctuation, and camel case", () => {
    expect(tokenize("Café FormValidation — readable labels!")).toEqual([
      "cafe", "form", "validation", "readable", "labels"
    ]);
  });

  it("ranks title and tag matches above incidental mentions", () => {
    const results = searchDesignRules(designRules, { query: "placeholder only form labels", limit: 5 });
    expect(results[0]?.rule.id).toBe("UDI-FOR-001");
    expect(results.map(({ rule }) => rule.id)).toContain("UDI-ANT-001");
  });

  it("returns the same stable ordering for repeated requests and ties", () => {
    const retriever = new Bm25Retriever([
      customRule("UDI-FOR-010"),
      customRule("UDI-FOR-009")
    ]);
    const first = retriever.retrieve({ query: "form validation", limit: 10 });
    const second = retriever.retrieve({ query: "form validation", limit: 10 });
    expect(first.map(({ rule }) => rule.id)).toEqual(["UDI-FOR-009", "UDI-FOR-010"]);
    expect(second).toEqual(first);
  });

  it("filters category, project type, and framework", () => {
    const retriever = new Bm25Retriever([
      customRule("UDI-FOR-010"),
      customRule("UDI-FOR-011", { contexts: ["ecommerce"], frameworks: ["vue"] }),
      customRule("UDI-VIS-010", {
        category: "visual-hierarchy",
        title: "Focal point for clear pages",
        summary: "Choose a clear focal point for the important content on the page.",
        guidance: ["Keep a visual focal point consistent with user priorities."],
        tags: ["visual", "focus"],
        frameworks: ["framework-agnostic"]
      })
    ]);
    expect(retriever.retrieve({ query: "form validation", category: "forms" }).map(({ rule }) => rule.id))
      .toEqual(["UDI-FOR-010", "UDI-FOR-011"]);
    expect(retriever.retrieve({ query: "form validation", projectType: "ecommerce" }).map(({ rule }) => rule.id))
      .toEqual(["UDI-FOR-011"]);
    expect(retriever.retrieve({ query: "form validation", framework: "vue" }).map(({ rule }) => rule.id))
      .toEqual(["UDI-FOR-011"]);
    expect(retriever.retrieve({ query: "form validation", framework: "react" }).map(({ rule }) => rule.id))
      .toEqual(["UDI-FOR-010"]);
  });

  it("returns an empty list for stop-word-only, unrelated, or empty catalogs", () => {
    expect(searchDesignRules(designRules, { query: "the and to" })).toEqual([]);
    expect(searchDesignRules(designRules, { query: "volcanic astronomy" })).toEqual([]);
    expect(new Bm25Retriever([]).retrieve({ query: "forms" })).toEqual([]);
    expect(searchDesignRules(designRules, { query: "forms", category: "pricing-pages" })).toEqual([]);
  });

  it("validates request bounds and rejects unsupported categories", () => {
    expect(() => searchDesignRules(designRules, { query: "forms", limit: 0 })).toThrow();
    expect(() => searchDesignRules(designRules, {
      query: "forms",
      category: "unsupported" as never
    })).toThrow();
  });

  it("returns catalog source identifiers with each result", () => {
    const result = searchDesignRules(designRules, { query: "accessible form labels" })[0];
    expect(result?.sourceIds).toContain("SRC-UDI-ORIGINAL");
  });
});

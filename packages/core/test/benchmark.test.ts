import { describe, expect, it } from "vitest";
import { designRules, searchDesignRules } from "../src/index.js";

const benchmark = [
  { query: "placeholder only form labels", type: "saas", relevant: ["UDI-FOR-001"] },
  { query: "text contrast foreground background WCAG", type: "marketing-site", relevant: ["UDI-COL-001"] },
  { query: "responsive reflow narrow viewport", type: "ecommerce", relevant: ["UDI-RSP-001"] },
  { query: "keyboard focus visible predictable", type: "dashboard", relevant: ["UDI-ACC-002"] },
  { query: "preserve existing brand design tokens", type: "developer-tools", relevant: ["UDI-SYS-001"] },
  { query: "pricing billing units renewal terms", type: "saas", relevant: ["UDI-PRC-002"] },
  { query: "dashboard metrics decisions comparison", type: "dashboard", relevant: ["UDI-SAA-001"] },
  { query: "accessible chart values summary table", type: "fintech", relevant: ["UDI-DAT-003"] },
  { query: "mobile responsive data table columns", type: "ecommerce", relevant: ["UDI-RSP-004"] },
  { query: "navigation active route current location", type: "saas", relevant: ["UDI-NAV-002"] },
  { query: "long running developer operation loading progress", type: "developer-tools", relevant: ["UDI-INT-003"] },
  { query: "marketing landing page value proposition call to action", type: "professional-services", relevant: ["UDI-MKT-001"] },
  { query: "form validation preserve user input errors", type: "fintech", relevant: ["UDI-FOR-004"] },
  { query: "typography line length readable paragraphs", type: "editorial", relevant: ["UDI-TYP-002"] },
  { query: "status color label icon accessible", type: "dashboard", relevant: ["UDI-COL-002"] },
  { query: "shopping product price availability", type: "ecommerce", relevant: ["UDI-PRC-002", "UDI-DAT-004"] }
] as const;

describe("retrieval benchmark", () => {
  it("measures Recall@5 and MRR@10 across realistic product queries", () => {
    let relevantRetrieved = 0;
    let reciprocalRankTotal = 0;
    let relevantTotal = 0;
    for (const sample of benchmark) {
      const results = searchDesignRules(designRules, {
        query: sample.query,
        projectType: sample.type,
        limit: 10
      });
      const topFive = new Set(results.slice(0, 5).map(({ rule }) => rule.id));
      const relevantRank = results.findIndex(({ rule }) => sample.relevant.includes(rule.id));
      relevantRetrieved += sample.relevant.filter((id) => topFive.has(id)).length;
      relevantTotal += sample.relevant.length;
      if (relevantRank >= 0 && relevantRank < 10) {
        reciprocalRankTotal += 1 / (relevantRank + 1);
      }
    }
    const recallAt5 = relevantRetrieved / relevantTotal;
    const mrrAt10 = reciprocalRankTotal / benchmark.length;
    console.info(`Retrieval baseline (${benchmark.length} queries): Recall@5=${recallAt5.toFixed(3)}, MRR@10=${mrrAt10.toFixed(3)}`);
    expect(recallAt5).toBeGreaterThanOrEqual(0.8);
    expect(mrrAt10).toBeGreaterThanOrEqual(0.5);
  });
});

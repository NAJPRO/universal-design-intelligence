import { describe, expect, it } from "vitest";
import {
  DesignRecommendationSchema,
  DesignRuleSchema,
  recommendDesign,
  resolveRuleConflicts
} from "../src/index.js";
import type { DesignRule } from "../src/index.js";

function choiceRule(
  id: string,
  priority: DesignRule["priority"],
  value: string
): DesignRule {
  return DesignRuleSchema.parse({
    id,
    category: "color-contrast",
    title: `Test ${value} choice`,
    summary: `A test rule that recommends the ${value} choice for this design dimension.`,
    guidance: [`Use the ${value} treatment for this test scenario.`],
    contexts: ["all"],
    frameworks: ["framework-agnostic"],
    priority,
    tags: ["conflict", value],
    source: {
      sourceId: "SRC-UDI-ORIGINAL",
      sourceName: "UDI test fixture",
      organization: "UDI",
      license: "MIT",
      attribution: "Test fixture.",
      reviewedBy: ["UDI maintainers"],
      reviewStatus: "reviewed"
    },
    relatedAntiPatternIds: [],
    choices: [{ dimension: "color", value }]
  });
}

describe("recommendation engine", () => {
  it("returns versioned, schema-valid, deterministic recommendations", () => {
    const context = {
      type: "saas" as const,
      audience: "enterprise operations teams",
      framework: "react" as const,
      style: "premium",
      goals: ["monitor operational metrics", "manage workspace access"]
    };
    const first = recommendDesign(context);
    const second = recommendDesign(context);
    expect(DesignRecommendationSchema.parse(first)).toEqual(first);
    expect(second).toEqual(first);
    expect(first.engine).toBe("udi-deterministic");
    expect(first.schemaVersion).toBe("1.0");
    expect(first.catalogVersion).toBe("1.0.0");
    expect(first.sourceRuleIds).toEqual(first.recommendations.map(({ ruleId }) => ruleId));
    expect(first.profile.id).toBe("PRO-ENTERPRISE-DASHBOARD");
  });

  it("selects distinct profiles for different product contexts", () => {
    const b2b = recommendDesign({ type: "saas", audience: "business buyers" });
    const dashboard = recommendDesign({ type: "dashboard", audience: "enterprise analysts administrators" });
    const fintech = recommendDesign({
      type: "fintech",
      audience: "consumers choosing a financial account",
      goals: ["explain rates", "build trust"]
    });
    const developerTools = recommendDesign({
      type: "developer-tools",
      audience: "developers and platform teams",
      goals: ["explain integrations", "monitor deployments"]
    });
    const ecommerce = recommendDesign({ type: "ecommerce", audience: "shoppers comparing products" });
    const services = recommendDesign({ type: "professional-services", audience: "business clients" });
    expect(b2b.profile.id).toBe("PRO-B2B-SAAS");
    expect(dashboard.profile.id).toBe("PRO-ENTERPRISE-DASHBOARD");
    expect(fintech.profile.id).toBe("PRO-FINTECH-MARKETING");
    expect(developerTools.profile.id).toBe("PRO-DEVELOPER-TOOLS");
    expect(ecommerce.profile.id).toBe("PRO-ECOMMERCE-STOREFRONT");
    expect(services.profile.id).toBe("PRO-PROFESSIONAL-SERVICES");
    expect(fintech.sourceRuleIds).toContain("UDI-MKT-005");
    expect(developerTools.sourceRuleIds).toContain("UDI-SAA-003");
    expect(ecommerce.sourceRuleIds).toContain("UDI-PRC-002");
    expect(services.sourceRuleIds).toContain("UDI-MKT-002");
  });

  it("uses safe assumptions for incomplete context", () => {
    const result = recommendDesign({});
    expect(result.context.type).toBe("web-app");
    expect(result.profile.id).toBe("PRO-GENERAL-WEB");
    expect(result.assumptions).toContain(
      "No brand tokens were supplied; the direction avoids assuming permission to replace an existing identity."
    );
  });

  it("preserves existing brand decisions when explicitly requested", () => {
    const result = recommendDesign({
      type: "saas",
      constraints: {
        preserveBrand: true,
        brandColorTokens: ["--brand-primary", "--brand-ink"],
        brandTypography: "Acme Sans"
      }
    });
    expect(result.direction.color).toContain("--brand-primary");
    expect(result.direction.typography).toContain("Acme Sans");
    expect(result.sourceRuleIds).toContain("UDI-SYS-005");
  });

  it("resolves conflicting choices by priority and stable rule identifier", () => {
    const conflict = resolveRuleConflicts([
      choiceRule("UDI-COL-011", "medium", "dark"),
      choiceRule("UDI-COL-010", "high", "light")
    ]);
    expect(conflict.selectedRules.map(({ id }) => id)).toEqual(["UDI-COL-010"]);
    expect(conflict.conflicts).toMatchObject([{
      dimension: "color",
      selectedValue: "light",
      selectedRuleId: "UDI-COL-010",
      excludedRuleIds: ["UDI-COL-011"]
    }]);
  });

  it("resolves equal-priority conflicts consistently by identifier", () => {
    const conflict = resolveRuleConflicts([
      choiceRule("UDI-COL-012", "high", "warm"),
      choiceRule("UDI-COL-013", "high", "cool")
    ]);
    expect(conflict.conflicts[0]?.selectedRuleId).toBe("UDI-COL-012");
    expect(conflict.selectedRules.map(({ id }) => id)).toEqual(["UDI-COL-012"]);
  });
});

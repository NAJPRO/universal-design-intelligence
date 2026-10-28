// Original UDI Mission 008 engine policy, not additional catalog/editorial content.
import type { ApplicationType, ContextV2, DesignProfile, DesignRule, ProjectType, RuleCategory } from "@udi/knowledge";
import { compare } from "./context-v2.js";
import { tokenize } from "./retrieval.js";

const profileApplications: Record<string, ApplicationType[]> = {
  "PRO-B2B-SAAS": ["marketing", "operations-workspace"],
  "PRO-ENTERPRISE-DASHBOARD": ["operations-workspace", "analytics", "scheduling"],
  "PRO-FINTECH-MARKETING": ["marketing", "public-information"],
  "PRO-FINTECH-PRODUCT": ["operations-workspace", "self-service-portal", "analytics"],
  "PRO-DEVELOPER-TOOLS": ["marketing", "operations-workspace", "analytics"],
  "PRO-PROFESSIONAL-SERVICES": ["marketing", "public-information"],
  "PRO-ECOMMERCE-STOREFRONT": ["storefront"],
  "PRO-EDITORIAL": ["editorial", "public-information", "marketing"],
  "PRO-MARKETPLACE": ["storefront"],
  "PRO-EDUCATION": ["self-service-portal", "operations-workspace", "authoring"],
  "PRO-CONSUMER-SAAS": ["self-service-portal"],
  "PRO-ADMIN-CONSOLE": ["operations-workspace", "authoring", "scheduling"],
  "PRO-PORTFOLIO": ["marketing"],
  "PRO-CAMPAIGN-LANDING": ["marketing"],
  "PRO-ANALYTICS": ["analytics"],
  "PRO-HEALTH-TECH": ["self-service-portal", "operations-workspace", "scheduling"]
};
const profileIndustries: Record<string, string> = {
  "PRO-FINTECH-MARKETING": "banking-finance", "PRO-FINTECH-PRODUCT": "banking-finance",
  "PRO-HEALTH-TECH": "healthcare", "PRO-EDUCATION": "education",
  "PRO-ECOMMERCE-STOREFRONT": "ecommerce", "PRO-MARKETPLACE": "ecommerce",
  "PRO-DEVELOPER-TOOLS": "developer-tools", "PRO-PROFESSIONAL-SERVICES": "professional-services"
};
const contextsByApplication: Record<ApplicationType, ProjectType[]> = {
  marketing: ["marketing-site", "professional-services"],
  "public-information": ["marketing-site", "editorial", "professional-services"],
  storefront: ["ecommerce", "marketplace"],
  "operations-workspace": ["dashboard", "saas", "web-app", "ecommerce"],
  analytics: ["dashboard", "saas", "developer-tools"],
  authoring: ["web-app", "saas"], scheduling: ["web-app", "saas", "dashboard"],
  "self-service-portal": ["web-app", "saas", "ecommerce"], editorial: ["editorial", "marketing-site"]
};

export function appliesV2(contexts: readonly string[], category: RuleCategory, context: ContextV2): boolean {
  const app = context.applicationType.value;
  if (app === null) return contexts.includes("all");
  const publicApp = ["marketing", "public-information", "editorial"].includes(app);
  if (category === "marketing-landing-pages" && !publicApp) return false;
  if (category === "pricing-pages" && !["marketing", "storefront"].includes(app)) return false;
  if (category === "saas-dashboards" && !["operations-workspace", "analytics", "scheduling"].includes(app)) return false;
  return contexts.includes("all") || contextsByApplication[app].some(type => contexts.includes(type));
}

export function frameworkApplies(rule: DesignRule, context: ContextV2): boolean {
  return rule.frameworks.includes("framework-agnostic") || (context.framework.value !== null && rule.frameworks.includes(context.framework.value));
}

export function rankProfilesV2(profiles: readonly DesignProfile[], eligibleRules: readonly DesignRule[], context: ContextV2) {
  const ruleIds = new Set(eligibleRules.map(rule => rule.id));
  const tasks = tokenize([context.tasks.primary.value, ...context.tasks.secondary.map(task => task.value)].filter(Boolean).join(" "));
  const roles = new Set(tokenize(context.roles.map(role => role.value).filter(Boolean).join(" ")));
  return profiles.filter(profile => {
    if (!profile.ruleIds.some(id => ruleIds.has(id))) return false;
    if (profile.projectTypes.includes("all")) return true;
    const industry = profileIndustries[profile.id];
    if (industry && industry !== context.industry.value) return false;
    return context.applicationType.value !== null && Boolean(profileApplications[profile.id]?.includes(context.applicationType.value));
  }).map(profile => {
    const general = profile.projectTypes.includes("all");
    const words = new Set(tokenize([profile.name, profile.description, ...profile.audiences].join(" ")));
    const contributions = {
      application: general ? 0 : 40,
      task: tasks.length ? 25 * tasks.filter(term => words.has(term)).length / tasks.length : 0,
      industry: profileIndustries[profile.id] === context.industry.value ? 15 : 0,
      role: roles.size ? 10 * [...roles].filter(term => words.has(term)).length / roles.size : 0
    };
    return { id: profile.id, name: profile.name, score: Object.values(contributions).reduce((sum, value) => sum + value, 0), contributions,
      reason: general ? "General fallback; no industry or application expertise is inferred." : "Eligible application and industry policy; task/role contributions are lexical overlap, not semantic confidence." };
  }).sort((a, b) => b.score - a.score || compare(a.id, b.id)).slice(0, 3);
}

export type Requirement = { id: string; categories: RuleCategory[]; query: string; unsupportedReason?: string };
const taskPolicies: Record<string, Requirement[]> = {
  "product-administration": [
    { id: "table-operations", categories: ["tables-data-visualization"], query: "table row identity selection" },
    { id: "filter-scope", categories: ["saas-dashboards"], query: "filter scope" },
    { id: "validation", categories: ["forms"], query: "form validation preserve input errors" },
    { id: "media-management", categories: [], query: "", unsupportedReason: "No media-management specification exists in the current catalog." }
  ],
  "browse-products": [{ id: "product-comparison", categories: ["tables-data-visualization", "pricing-pages"], query: "product price availability comparison" }],
  "public-information": [{ id: "information-hierarchy", categories: ["visual-hierarchy", "navigation"], query: "navigation content hierarchy" }],
  "staff-scheduling": [
    { id: "validation", categories: ["forms"], query: "form validation preserve input" },
    { id: "schedule-collisions", categories: [], query: "", unsupportedReason: "No scheduling, timezone, or collision contract exists in the current catalog." }
  ]
};
export function requirementsV2(context: ContextV2): Requirement[] {
  const requirements: Requirement[] = [
    { id: "accessibility", categories: ["accessibility"], query: "keyboard focus semantics" },
    { id: "responsive", categories: ["responsive-design"], query: "responsive reflow narrow viewport" },
    { id: "recovery", categories: ["interaction-states"], query: "errors feedback progress" }
  ];
  if (context.brand.preserve) requirements.push({ id: "brand-preservation", categories: ["design-systems"], query: "preserve brand tokens" });
  const tasks = [context.tasks.primary, ...context.tasks.secondary];
  for (const task of tasks) {
    if (task.value === null) continue;
    const policy = taskPolicies[task.value];
    if (policy) requirements.push(...policy);
    else requirements.push({ id: `task:${task.value}`, categories: [], query: "", unsupportedReason: "No reviewed task coverage policy; only general and lexical guidance is available." });
  }
  if (context.industry.value !== null) requirements.push({ id: "domain-workflow", categories: [], query: "", unsupportedReason: "No domain workflow packs are installed; industry matching only ranks existing profiles." });
  return [...new Map(requirements.map(item => [item.id, item])).values()];
}

import { ApplicationTypeSchema, ContextV2Schema, FrameworkSchema } from "@udi/knowledge";
import type { ContextV2, ContextV2Input, ProjectType, TextEvidence } from "@udi/knowledge";

export const compare = (a: string, b: string): number => a < b ? -1 : a > b ? 1 : 0;
export const canonical = <T>(items: readonly T[]): T[] => [...new Map(items.map(item => [JSON.stringify(item), item])).entries()].sort(([a], [b]) => compare(a, b)).map(([, item]) => item);
const strength = { explicit: 3, observed: 2, inferred: 1, unknown: 0 };

export function normalizeContextV2(input: ContextV2Input): ContextV2 {
  const context = ContextV2Schema.parse(input);
  const normalize = (evidence: TextEvidence): TextEvidence => ({
    ...evidence, evidenceRefs: canonical(evidence.evidenceRefs), alternatives: canonical(evidence.alternatives)
  });
  context.industry = normalize(context.industry);
  context.designSystem = normalize(context.designSystem);
  context.brand.identity = normalize(context.brand.identity);
  context.roles = canonical(context.roles.map(normalize));
  context.components = canonical(context.components.map(normalize));
  context.tasks.primary = normalize(context.tasks.primary);
  context.tasks.secondary = canonical(context.tasks.secondary.map(normalize));
  context.brand.tokens = canonical(context.brand.tokens);
  context.applicationType.evidenceRefs = canonical(context.applicationType.evidenceRefs);
  context.applicationType.alternatives = canonical(context.applicationType.alternatives);
  context.framework.evidenceRefs = canonical(context.framework.evidenceRefs);
  context.framework.alternatives = canonical(context.framework.alternatives);
  context.observations = canonical(context.observations.map(item => ({ field: item.field, evidence: normalize(item.evidence) })));
  const fieldMap = {
    industry: context.industry, applicationType: context.applicationType,
    primaryTask: context.tasks.primary, framework: context.framework,
    designSystem: context.designSystem, brand: context.brand.identity
  };
  for (const [field, current] of Object.entries(fieldMap)) {
    const observations = context.observations.filter(item => item.field === field).map(item => item.evidence);
    const values = [current, ...observations].sort((a, b) => strength[b.status] - strength[a.status] || compare(JSON.stringify(a), JSON.stringify(b)));
    const explicit = new Set(values.filter(item => item.status === "explicit").map(item => item.value));
    if (explicit.size > 1) throw new Error(`Conflicting explicit context for ${field}; supply one scope-specific context.`);
    const winner = values[0]!;
    if (field === "applicationType" && winner.value !== null) ApplicationTypeSchema.parse(winner.value);
    if (field === "framework" && winner.value !== null) FrameworkSchema.parse(winner.value);
    Object.assign(current, winner);
    const alternatives = values.filter(item => item.value !== null && item.value !== winner.value).map(item => item.value!);
    current.alternatives = canonical([...current.alternatives, ...alternatives]);
    if (alternatives.length) context.uncertainty.push({ field: field as ContextV2["uncertainty"][number]["field"], reason: "Conflicting observations retained; strongest evidence selected, equal-strength ties use stable value ordering." });
  }
  context.uncertainty = canonical(context.uncertainty);
  context.constraints = canonical(context.constraints.map(item => ({ ...item, evidenceRefs: canonical(item.evidenceRefs) })));
  const ids = new Set(context.constraints.map(item => item.id));
  if (ids.size !== context.constraints.length) throw new Error("Constraint IDs must be unique.");
  return ContextV2Schema.parse(context);
}

/** Industry-bearing legacy types deliberately never imply an application type. */
export function adaptLegacyContext(type: ProjectType): ContextV2Input {
  const evidence = (value: string) => ({ value, status: "inferred" as const, evidenceRefs: [`legacy:type:${type}`] });
  const result: ContextV2Input = { schemaVersion: "2.0", uncertainty: [] };
  if (type === "marketing-site") result.applicationType = { ...evidence("marketing"), value: "marketing" };
  else if (type === "editorial") result.applicationType = { ...evidence("editorial"), value: "editorial" };
  else {
    const industries: Record<string, string> = { ecommerce: "ecommerce", marketplace: "ecommerce", fintech: "banking-finance", education: "education", "developer-tools": "developer-tools", "professional-services": "professional-services" };
    const industry = industries[type];
    if (industry) result.industry = evidence(industry);
    result.uncertainty = [{ field: "applicationType", reason: `Legacy ${type} does not identify a unique application type.` }];
  }
  return result;
}

export function mergeLegacyContext(input: ContextV2Input, type: ProjectType): ContextV2 {
  const current = normalizeContextV2(input);
  const legacy = normalizeContextV2(adaptLegacyContext(type));
  for (const field of ["industry", "applicationType"] as const) {
    const value = legacy[field];
    if (value.value === null) continue;
    if (current[field].value !== null && current[field].value !== value.value) throw new Error(`--type conflicts with context ${field}.`);
    current.observations.push({ field, evidence: value });
  }
  if (current.applicationType.value === null) current.uncertainty.push(...legacy.uncertainty);
  return normalizeContextV2(current);
}

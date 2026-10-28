import { z } from "zod";
import { professionalComponents, validateComponentCatalog, inspectComponentSpec } from "@udi/knowledge/components";
import { RecommendationV21Schema } from "@udi/knowledge/v21-schemas";
import type { ComponentCatalog, ProfessionalSpec } from "@udi/knowledge/component-schemas";
import type { KnowledgeEntityV21, RecommendationV21 } from "@udi/knowledge/v21-schemas";
import type { Catalog, ContextV2Input, ContextV2, KnowledgeProvenance } from "@udi/knowledge";
import { canonical, compare, normalizeContextV2 } from "./context-v2.js";
import { defaultCatalogV2, KnowledgeIndexV2 } from "./knowledge-v2.js";
import { recommendDesignV2 } from "./recommend-v2.js";
import { resolveConflictsV2 } from "./conflicts-v2.js";
import { tokenize } from "./retrieval.js";

export { professionalComponents } from "@udi/knowledge/components";
export { ComponentSpecSchema, CompositionSpecSchema } from "@udi/knowledge/component-schemas";
export { RecommendationV21Schema } from "@udi/knowledge/v21-schemas";
export type { ComponentCatalog, ProfessionalSpec } from "@udi/knowledge/component-schemas";
export type { RecommendationV21 } from "@udi/knowledge/v21-schemas";
export const COMPONENT_ENGINE_VERSION = "2.1.0-experimental.1";
const optionsSchema = z.object({ maxBytes: z.number().int().min(1).max(1_048_576).default(24_576),
  entityLimit: z.number().int().min(1).max(100).default(100), expand: z.string().max(160).optional() }).strict();
export type ComponentRecommendationOptions = z.input<typeof optionsSchema>;
type Match = { spec: ProfessionalSpec; score: number; reasons: string[] };
const aliases: Record<string, string[]> = {
  "CMP-OPERATIONAL-TABLE": ["table", "data table", "operational table", "operational-table"],
  "CMP-FILTER-WORKSPACE": ["filter", "filters", "filter workspace", "advanced filters", "filter-workspace"],
  "CMP-RECOVERABLE-FORM": ["form", "recoverable form", "recoverable-form"],
  "COM-OPERATIONAL-MANAGEMENT": ["operational workspace", "operational management workspace"]
};
const normalized = (value: string) => tokenize(value).join(" ");
function requestedId(value: string, specs: ProfessionalSpec[]): string | undefined {
  return specs.find(spec => spec.id === value || normalized(spec.name) === normalized(value) || aliases[spec.id]?.some(alias => normalized(alias) === normalized(value)))?.id;
}
function termMatch(term: string, value: string): boolean {
  const needle = normalized(term);
  const haystack = ` ${normalized(value)} `;
  return needle.length > 0 && haystack.includes(` ${needle} `) && !new RegExp(`\\b(?:no|without|avoid) ${needle}\\b`).test(normalized(value));
}
function plan(context: ContextV2, pack: ComponentCatalog) {
  const specs = [...pack.components, ...pack.compositions].sort((a, b) => compare(a.id, b.id));
  const requests = context.components.filter(evidence => evidence.value !== null);
  const tasks = [context.tasks.primary, ...context.tasks.secondary].filter(evidence => evidence.value !== null);
  const matches: Match[] = [];
  const unsupported = new Map<string, string>();
  for (const request of requests) if (!requestedId(request.value!, specs)) unsupported.set(`component:${request.value}`, "No installed component specification matches this explicit requirement; general rules do not establish support.");
  for (const spec of specs) {
    const explicit = requests.filter(request => requestedId(request.value!, specs) === spec.id);
    const task = tasks.find(task => spec.applicability.taskTerms.some(term => termMatch(term, task.value!)));
    const role = context.roles.find(role => role.value !== null && spec.applicability.roleTerms.some(term => termMatch(term, role.value!)));
    const app = context.applicationType.value;
    if (app === null || !spec.applicability.applicationTypes.includes(app)) {
      for (const request of explicit) unsupported.set(`component:${request.value}`, app === null ? "Application type is unknown; component applicability cannot be established." : `Component is incompatible with application type ${app}.`);
      continue;
    }
    if (!explicit.length && !task) continue;
    // Compositions require task evidence plus both collection/filter applicability, even if named explicitly.
    if (spec.kind === "composition") {
      const required = spec.dependencies.map(ref => specs.find(candidate => candidate.id === ref)!);
      if (!task || required.some(dep => !matches.some(match => match.spec.id === dep.id))) {
        for (const request of explicit) unsupported.set(`component:${request.value}`, "Composition requires evidenced collection and filter tasks; it is not a generic dashboard default.");
        continue;
      }
    }
    matches.push({ spec, score: (explicit.length ? 80 : 0) + (task ? 40 : 0) + (role ? 10 : 0), reasons: [
      `Application gate: ${context.applicationType.status} ${app}.`,
      ...(explicit.length ? [`Requested component: ${explicit[0]!.status} ${explicit[0]!.value}.`] : []),
      ...(task ? [`Task evidence: ${task.status} ${task.value}.`] : []),
      ...(role ? [`Role overlap: ${role.status} ${role.value}; application-owned permissions are not inferred.`] : []),
      "Original generic contract; no domain workflow or rendered quality is claimed."
    ].map(reason => reason.slice(0, 240)) });
  }
  return { matches, unsupported };
}

export function inspectProfessionalSpec(id: string, pack: ComponentCatalog = professionalComponents, catalog: Catalog = defaultCatalogV2): ProfessionalSpec {
  return inspectComponentSpec(id, pack, catalog);
}
export function retrieveComponentSpecs(input: ContextV2Input, pack: ComponentCatalog = professionalComponents, catalog: Catalog = defaultCatalogV2): Array<{ id: string; score: number; reasons: string[] }> {
  return recommendDesignV21(input, { maxBytes: 1_048_576 }, catalog, pack).entities
    .filter(entity => entity.kind === "component" || entity.kind === "composition")
    .map(({ id, score, reasons }) => ({ id, score, reasons }));
}
function fingerprint(value: unknown): string {
  let hash = 14_695_981_039_346_656_037n;
  for (const byte of new TextEncoder().encode(JSON.stringify(value))) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1_099_511_628_211n);
  return hash.toString(16).padStart(16, "0");
}
function measure(packet: RecommendationV21): number {
  let prior = -1;
  while (prior !== packet.budget.usedBytes) { prior = packet.budget.usedBytes; packet.budget.usedBytes = new TextEncoder().encode(JSON.stringify(packet) + "\n").length; }
  return packet.budget.usedBytes;
}

export function recommendDesignV21(input: ContextV2Input, options: ComponentRecommendationOptions = {}, catalog: Catalog = defaultCatalogV2, pack: ComponentCatalog = professionalComponents): RecommendationV21 {
  const settings = optionsSchema.parse(options);
  validateComponentCatalog(pack, catalog);
  const context = normalizeContextV2(input);
  const planned = plan(context, pack);
  const base = recommendDesignV2(context, { maxBytes: 1_048_576, entityLimit: 100 }, catalog);
  const index = new KnowledgeIndexV2(context, catalog);
  const specs = new Map([...pack.components, ...pack.compositions].map(spec => [spec.id, spec]));
  const candidates = new Map<string, KnowledgeEntityV21>(base.entities.map(entity => [entity.id, entity]));
  const dependencies = new Map<string, string[]>();
  const ruleIds = new Set(base.entities.filter(entity => entity.kind === "rule").map(entity => entity.id));
  const requestedSpecs = new Set<string>();
  const collect = (id: string) => { if (requestedSpecs.has(id)) return; requestedSpecs.add(id); const spec = specs.get(id)!; spec.ruleIds.forEach(ref => ruleIds.add(ref)); spec.dependencies.forEach(collect); };
  planned.matches.forEach(match => collect(match.spec.id));
  const resolution = resolveConflictsV2(index.rules.filter(rule => ruleIds.has(rule.id)), context.constraints);
  const survivors = new Set(resolution.selectedRules.map(rule => rule.id));
  for (const id of ruleIds) {
    const record = index.records.get(id);
    if (record && survivors.has(id) && !candidates.has(id)) candidates.set(id, { ...record.entity, reasons: ["Required rule reference of selected component knowledge."] });
  }
  for (const [id, entity] of candidates) {
    if (entity.kind === "rule" ? !survivors.has(id) : entity.ruleIds.some(ref => !survivors.has(ref))) candidates.delete(id);
    else dependencies.set(id, entity.ruleIds);
  }
  const unavailable = new Map<string, "unsupported" | "conflicting">();
  const addSpec = (id: string): boolean => {
    if (candidates.has(id)) return true;
    if (unavailable.has(id)) return false;
    const spec = specs.get(id)!;
    if (context.applicationType.value === null || !spec.applicability.applicationTypes.includes(context.applicationType.value)) { unavailable.set(id, "unsupported"); return false; }
    const missingDependencies = spec.dependencies.filter(ref => !addSpec(ref));
    const missingRules = spec.ruleIds.filter(ref => !candidates.has(ref));
    if (missingDependencies.length || missingRules.length) {
      unavailable.set(id, missingDependencies.some(ref => unavailable.get(ref) === "unsupported") || missingRules.some(ref => !index.records.has(ref)) ? "unsupported" : "conflicting");
      return false;
    }
    const match = planned.matches.find(match => match.spec.id === id);
    const closureRules = canonical([...spec.ruleIds, ...spec.dependencies.flatMap(ref => candidates.get(ref)!.ruleIds)]);
    const reasons = match?.reasons ?? [`Required component dependency of an applicable specification; application gate: ${context.applicationType.value}.`];
    candidates.set(id, { id, kind: spec.kind, title: spec.name, category: spec.category, score: match?.score ?? 0, reasons,
      guidance: [spec.purpose, spec.visual.hierarchy, `Inspect ${id} for states, variants, keyboard, recovery, visual checks and anti-pattern references.`],
      ruleIds: closureRules, sourceIds: [spec.provenance.sourceId] });
    dependencies.set(id, [...spec.dependencies, ...closureRules]);
    return true;
  };
  planned.matches.forEach(match => addSpec(match.spec.id));
  const priorityMatches = [...planned.matches].sort((a, b) => Number(b.spec.kind === "composition") - Number(a.spec.kind === "composition") || b.score - a.score || compare(a.spec.id, b.spec.id));
  const accepted = new Set<string>();
  for (const match of priorityMatches) {
    if (!candidates.has(match.spec.id)) continue;
    const group = new Set<string>();
    const visit = (id: string) => { if (group.has(id)) return; group.add(id); specs.get(id)!.dependencies.forEach(visit); };
    visit(match.spec.id);
    const together = new Set([...accepted, ...group]);
    if ([...together].some(id => specs.get(id)!.incompatibleWith.some(ref => together.has(ref)))) unavailable.set(match.spec.id, "conflicting");
    else group.forEach(id => accepted.add(id));
  }
  for (const id of requestedSpecs) if (!accepted.has(id)) candidates.delete(id);
  // Prefer one task assembly, then its atomic component closure, then general coverage and refinements.
  const order = priorityMatches.map(match => match.spec.id).filter(id => candidates.has(id));
  order.push(...base.entities.map(entity => entity.id).filter(id => candidates.has(id) && !order.includes(id)));
  const key = fingerprint({ engine: COMPONENT_ENGINE_VERSION, context, catalog: canonical([...index.records.values()].map(record => record.document)), profiles: canonical(catalog.profiles), pack: { ...pack, components: canonical(pack.components), compositions: canonical(pack.compositions) } });
  let start = 0;
  if (settings.expand) {
    const parts = settings.expand.split(":");
    if (parts.length !== 3 || parts[0] !== "v21" || parts[1] !== key || !/^\d+$/.test(parts[2]!)) throw new Error("Expansion key does not match component engine, catalogs, or context.");
    start = Number(parts[2]);
    if (!Number.isSafeInteger(start) || start < 1 || start >= order.length) throw new Error("Expansion cursor is outside the candidate set.");
  }
  const packet: RecommendationV21 = { ...base, schemaVersion: "2.1", engineVersion: COMPONENT_ENGINE_VERSION, componentCatalogVersion: pack.version,
    entities: [], sources: [], coverage: [], conflicts: [], expansion: null, budget: { maxBytes: settings.maxBytes, usedBytes: 0 },
    assumptions: base.assumptions.filter(item => !item.startsWith("Only existing rules")).concat([
      "Three original generic component families and one conditional composition are available; no domain packs are installed.",
      "Component entries are summaries; inspect their stable ID for the complete specification. Contracts do not prove rendered visual quality."
    ]) };
  const selected = new Map<string, KnowledgeEntityV21>();
  const specSources = new Map([...specs.values()].map(spec => [spec.id, spec.provenance]));
  let end = start;
  const refresh = () => {
    packet.entities = [...selected.values()];
    const sources = new Map<string, KnowledgeProvenance>();
    for (const entity of packet.entities) {
      const source = specSources.get(entity.id) ?? index.records.get(entity.id)!.source;
      const previous = sources.get(source.sourceId);
      sources.set(source.sourceId, { ...source, references: canonical([...(previous?.references ?? []), ...source.references]) });
    }
    packet.sources = [...sources.values()].sort((a, b) => compare(a.sourceId, b.sourceId));
    packet.coverage = base.coverage.map(item => {
      if (item.status === "unsupported" || item.status === "conflicting") return { ...item };
      const entityIds = item.entityIds.filter(id => selected.has(id));
      const available = item.entityIds.some(id => candidates.has(id));
      return { ...item, entityIds, status: entityIds.length ? "covered" as const : available ? "budget-omitted" as const : "conflicting" as const,
        reason: entityIds.length ? item.reason : available ? "General guidance is outside this bounded page; expand or increase budget." : "Required guidance was excluded by component rule conflicts." };
    });
    for (const [requirement, reason] of planned.unsupported) packet.coverage.push({ requirement, status: "unsupported", entityIds: [], reason });
    for (const match of planned.matches) {
      const id = match.spec.id;
      packet.coverage.push({ requirement: `spec:${id}`, entityIds: selected.has(id) ? [id] : [],
        status: selected.has(id) ? "covered" : candidates.has(id) ? "budget-omitted" : unavailable.get(id) ?? "unsupported",
        reason: selected.has(id) ? "Applicable specification summary and all required component/rule dependencies are selected; inspect the ID for its full contract." : candidates.has(id) ? "Specification and its atomic dependencies are outside this page; expand or increase budget." : unavailable.get(id) === "conflicting" ? "Required rules/components conflict with surviving constraints; no partial contract is claimed." : "Required rules/components are incompatible with application/framework evidence; no partial contract is claimed." });
    }
    packet.coverageComplete = packet.coverage.every(item => item.status === "covered");
    packet.conflicts = resolution.conflicts.filter(conflict => conflict.selectedEntityId === null || selected.has(conflict.selectedEntityId));
    const next = order.findIndex((id, position) => position >= end && !selected.has(id));
    packet.expansion = next < 0 ? null : { key: `v21:${key}:${next}`, omittedCount: order.slice(next).filter(id => !selected.has(id)).length };
    measure(packet);
  };
  const closure = (id: string): KnowledgeEntityV21[] => {
    const found = new Map<string, KnowledgeEntityV21>();
    const visit = (ref: string) => { if (found.has(ref) || selected.has(ref)) return; for (const dep of dependencies.get(ref) ?? []) visit(dep); found.set(ref, candidates.get(ref)!); };
    visit(id); return [...found.values()];
  };
  refresh();
  if (packet.budget.usedBytes > settings.maxBytes) throw new Error(`Recommendation budget too small for context and coverage envelope (${packet.budget.usedBytes} bytes required).`);
  for (let position = start; position < order.length; position++) {
    const additions = closure(order[position]!);
    if (selected.size + additions.length > settings.entityLimit) break;
    additions.forEach(entity => selected.set(entity.id, entity)); end = position + 1; refresh();
    if (packet.budget.usedBytes > settings.maxBytes) { additions.forEach(entity => selected.delete(entity.id)); end = position; break; }
  }
  refresh();
  if (order.length > start && end === start) throw new Error("Recommendation budget cannot fit next specification/entity and its dependencies; increase budget or entity limit.");
  // Enforce atomic specification dependencies after packing, independently of scheduling.
  for (const entity of packet.entities) if ((dependencies.get(entity.id) ?? []).some(ref => !selected.has(ref))) throw new Error("Missing packed component dependency.");
  return RecommendationV21Schema.parse(packet);
}

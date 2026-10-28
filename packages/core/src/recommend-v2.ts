import { z } from "zod";
import { catalogVersion, RecommendationV2Schema } from "@udi/knowledge";
import type { Catalog, ContextV2Input, KnowledgeEntityV2, KnowledgeProvenance, RecommendationV2 } from "@udi/knowledge";
import { canonical, compare, normalizeContextV2 } from "./context-v2.js";
import { resolveConflictsV2 } from "./conflicts-v2.js";
import { defaultCatalogV2, KnowledgeIndexV2 } from "./knowledge-v2.js";
import { rankProfilesV2, requirementsV2 } from "./policy-v2.js";

export const ENGINE_VERSION_V2 = "2.0.0-experimental.1";
const optionsSchema = z.object({
  maxBytes: z.number().int().min(1).max(1_048_576).default(24_576),
  entityLimit: z.number().int().min(1).max(100).default(100),
  expand: z.string().max(160).optional()
}).strict();
export type RecommendationOptionsV2 = z.input<typeof optionsSchema>;

// FNV-1a/64 binds local pagination to input versions. It is not a security signature.
function fingerprintOf(value: unknown): string {
  let hash = 14_695_981_039_346_656_037n;
  for (const byte of new TextEncoder().encode(JSON.stringify(value))) hash = BigInt.asUintN(64, (hash ^ BigInt(byte)) * 1_099_511_628_211n);
  return hash.toString(16).padStart(16, "0");
}

/** Compact JSON plus its CLI line terminator; converge on the byte-count field. */
function measure(packet: RecommendationV2): number {
  let bytes = -1;
  while (bytes !== packet.budget.usedBytes) {
    bytes = packet.budget.usedBytes;
    packet.budget.usedBytes = new TextEncoder().encode(JSON.stringify(packet) + "\n").length;
  }
  return packet.budget.usedBytes;
}

export function recommendDesignV2(input: ContextV2Input, options: RecommendationOptionsV2 = {}, catalog: Catalog = defaultCatalogV2): RecommendationV2 {
  const settings = optionsSchema.parse(options);
  const context = normalizeContextV2(input);
  const index = new KnowledgeIndexV2(context, catalog);
  const profiles = rankProfilesV2(catalog.profiles, index.rules, context);
  const requirements = requirementsV2(context);
  const ranked = new Map<string, KnowledgeEntityV2>();
  const add = (entity: KnowledgeEntityV2, score: number, reason: string) => {
    const prior = ranked.get(entity.id);
    ranked.set(entity.id, { ...entity, score: (prior?.score ?? 0) + score, reasons: canonical([...(prior?.reasons ?? []), reason]) });
  };
  const query = [context.query, context.tasks.primary.value, ...context.tasks.secondary.map(task => task.value), ...context.components.map(component => component.value)].filter(Boolean).join(" ").slice(0, 1000);
  for (const entity of index.search(query)) add(entity, entity.score, "User task/component query.");
  for (const requirement of requirements) {
    if (!requirement.query) continue;
    const matches = index.search(requirement.query).filter(entity => requirement.categories.includes(entity.category) ||
      entity.ruleIds.some(id => requirement.categories.includes(index.records.get(id)!.entity.category))).slice(0, 8);
    for (const entity of matches) add(entity, entity.score, `Coverage query: ${requirement.id}.`);
    if (!matches.length) {
      const fallback = [...index.records.values()].find(record => record.entity.kind === "rule" && requirement.categories.includes(record.entity.category));
      if (fallback) add(fallback.entity, 0.0001, `Applicable category fallback: ${requirement.id}; no lexical match.`);
    }
  }
  for (const [rank, profile] of profiles.entries()) {
    for (const id of catalog.profiles.find(item => item.id === profile.id)!.ruleIds) {
      const record = index.records.get(id);
      if (record) add(record.entity, 0.001 / (rank + 1), `Linked by eligible profile ${profile.id}; lower weight than lexical coverage.`);
    }
  }
  for (const constraint of context.constraints.filter(item => item.strength === "must")) {
    for (const rule of index.rules.filter(rule => rule.choices.some(choice => choice.dimension === constraint.dimension && choice.value === constraint.value))) {
      add(index.records.get(rule.id)!.entity, 0.02, `Mandatory context constraint ${constraint.id}.`);
    }
  }
  // Reference closure is bounded to one level: patterns/anti-patterns reference rules only.
  for (const entity of [...ranked.values()]) {
    for (const id of entity.ruleIds) {
      if (!ranked.has(id)) add(index.records.get(id)!.entity, 0, `Required reference of ${entity.id}.`);
    }
  }
  const resolution = resolveConflictsV2(index.rules.filter(rule => ranked.has(rule.id)), context.constraints);
  const survivingRules = new Set(resolution.selectedRules.map(rule => rule.id));
  const excludedRules = new Set(resolution.excludedIds);
  const removed = new Set([...ranked.values()].filter(entity => entity.kind === "rule" ? !survivingRules.has(entity.id) : entity.ruleIds.some(id => !survivingRules.has(id))).map(entity => entity.id));
  const candidates = [...ranked.values()].filter(entity => !removed.has(entity.id)).sort((a, b) => b.score - a.score || compare(a.id, b.id));
  const ordered: KnowledgeEntityV2[] = [];
  const scheduled = new Set<string>();
  const schedule = (entity: KnowledgeEntityV2) => { if (!scheduled.has(entity.id)) { ordered.push(entity); scheduled.add(entity.id); } };
  // Coverage first; profile lists cannot consume the entire budget before tasks/accessibility.
  for (const requirement of requirements) {
    if (requirement.unsupportedReason) continue;
    const best = candidates.find(entity => entity.kind === "rule" && requirement.categories.includes(entity.category));
    if (best) schedule(best);
  }
  for (const constraint of context.constraints.filter(item => item.strength === "must")) {
    const best = candidates.find(entity => entity.kind === "rule" && index.records.get(entity.id)!.document.choices.some(choice => choice.dimension === constraint.dimension && choice.value === constraint.value));
    if (best) schedule(best);
  }
  // Round-robin entity kinds prevents rule-only results while preserving within-kind rank.
  const queues = (["rule", "pattern", "anti-pattern"] as const).map(kind => candidates.filter(entity => entity.kind === kind));
  for (let rank = 0; rank < candidates.length; rank++) for (const queue of queues) { const entity = queue[rank]; if (entity) schedule(entity); }

  const fingerprint = fingerprintOf({
    engine: ENGINE_VERSION_V2, context,
    records: [...index.records.values()].map(record => record.document).sort((a, b) => compare(a.id, b.id)),
    profiles: canonical(catalog.profiles)
  });
  let start = 0;
  if (settings.expand) {
    const parts = settings.expand.split(":");
    if (parts.length !== 3 || parts[0] !== "v2" || parts[1] !== fingerprint || !/^\d+$/.test(parts[2]!)) throw new Error("Expansion key does not match engine, catalog, or context; rerun the original request.");
    start = Number(parts[2]);
    if (!Number.isSafeInteger(start) || start < 1 || start >= ordered.length) throw new Error("Expansion cursor is outside the candidate set.");
  }
  const evidenceLevel = context.applicationType.value === null || context.tasks.primary.value === null ? "sparse" :
    context.uncertainty.length || [context.applicationType.status, context.tasks.primary.status].includes("inferred") ? "mixed" : "strong";
  const packet: RecommendationV2 = {
    schemaVersion: "2.0", catalogVersion, engineVersion: ENGINE_VERSION_V2, engine: "udi-deterministic", context,
    evidenceLevel, rankMargin: profiles.length > 1 ? profiles[0]!.score - profiles[1]!.score : 0,
    profileCandidates: profiles, entities: [], coverage: [], coverageComplete: false,
    conflicts: [], sources: [], assumptions: [
      "Scores and evidence bands are deterministic heuristics, not calibrated probabilities.",
      "Only existing rules, patterns and anti-patterns are available; no component specifications or domain packs are implied."
    ], expansion: null, budget: { maxBytes: settings.maxBytes, usedBytes: 0 }
  };
  if (context.applicationType.value === null) packet.assumptions.push("Application type is unknown; only globally applicable knowledge and the general profile are eligible.");
  if (context.framework.value === null) packet.assumptions.push("Framework is unknown; only framework-agnostic rules and compatible references are eligible.");
  const selected = new Map<string, KnowledgeEntityV2>();
  let end = start;
  const refresh = () => {
    packet.entities = [...selected.values()];
    const sourceMap = new Map<string, KnowledgeProvenance>();
    for (const entity of packet.entities) {
      const source = index.records.get(entity.id)!.source;
      const prior = sourceMap.get(source.sourceId);
      // One source ID can support several different standards references.
      sourceMap.set(source.sourceId, { ...source, references: canonical([...(prior?.references ?? []), ...source.references]) });
    }
    packet.sources = [...sourceMap.values()].sort((a, b) => compare(a.sourceId, b.sourceId));
    packet.coverage = requirements.map(requirement => {
      const entityIds = packet.entities.filter(entity => requirement.categories.includes(entity.category)).map(entity => entity.id);
      if (requirement.unsupportedReason) return { requirement: requirement.id, status: "unsupported" as const, entityIds: [], reason: requirement.unsupportedReason };
      if (entityIds.length) return { requirement: requirement.id, status: "covered" as const, entityIds, reason: "Selected applicable guidance covers this general category; no domain completeness is implied." };
      const available = candidates.some(entity => requirement.categories.includes(entity.category));
      const conflict = [...ranked.values()].some(entity => requirement.categories.includes(entity.category) && (removed.has(entity.id) || excludedRules.has(entity.id)));
      return { requirement: requirement.id, status: available ? "budget-omitted" as const : conflict ? "conflicting" as const : "unsupported" as const, entityIds: [],
        reason: available ? "Applicable guidance is outside this bounded page; expand or increase the budget." : conflict ? "All matching candidates were excluded by incompatible constraints or choices." : "No compatible existing knowledge matches the requirement." };
    });
    packet.coverageComplete = packet.coverage.every(item => item.status === "covered");
    packet.conflicts = resolution.conflicts.filter(conflict => conflict.selectedEntityId === null || selected.has(conflict.selectedEntityId));
    for (const constraint of context.constraints.filter(item => item.strength === "must")) {
      const matches = (entity: KnowledgeEntityV2) => entity.kind === "rule" && index.records.get(entity.id)!.document.choices.some(choice => choice.dimension === constraint.dimension && choice.value === constraint.value);
      const impossible = packet.conflicts.find(item => item.status === "unresolved" && item.constraintIds.includes(constraint.id));
      const entityIds = packet.entities.filter(matches).map(item => item.id);
      const available = candidates.some(matches);
      const excluded = [...ranked.values()].some(entity => matches(entity) && removed.has(entity.id));
      packet.coverage.push({ requirement: `constraint:${constraint.id}`,
        status: impossible ? "conflicting" : entityIds.length ? "covered" : available ? "budget-omitted" : excluded ? "conflicting" : "unsupported",
        entityIds: impossible ? [] : entityIds,
        reason: impossible?.explanation ?? (entityIds.length ? "Selected global guidance expresses the mandatory choice; its declared scope remains in context." : available ? "Matching mandatory guidance is outside this bounded page." : excluded ? "Matching mandatory guidance was excluded by another incompatible choice." : "No compatible existing rule expresses this mandatory choice; retain the constraint without claiming knowledge coverage.")
      });
    }
    packet.coverageComplete = packet.coverage.every(item => item.status === "covered");
    const next = ordered.findIndex((entity, position) => position >= end && !selected.has(entity.id));
    packet.expansion = next >= 0 ? { key: `v2:${fingerprint}:${next}`, omittedCount: ordered.slice(next).filter(entity => !selected.has(entity.id)).length } : null;
    measure(packet);
  };
  refresh();
  if (packet.budget.usedBytes > settings.maxBytes) throw new Error(`Recommendation budget too small for context and coverage envelope (${packet.budget.usedBytes} bytes required); increase --budget-bytes.`);
  for (let position = start; position < ordered.length; position++) {
    const entity = ordered[position]!;
    const additions = [...entity.ruleIds.map(id => ranked.get(id)!), entity].filter(item => !selected.has(item.id));
    if (selected.size + additions.length > settings.entityLimit) break;
    additions.forEach(item => selected.set(item.id, item));
    end = position + 1;
    refresh();
    if (packet.budget.usedBytes > settings.maxBytes) {
      additions.forEach(item => selected.delete(item.id));
      end = position;
      break;
    }
  }
  refresh();
  // A non-empty cursor page must make progress, otherwise expansion would loop forever.
  if (ordered.length > start && end === start) throw new Error("Recommendation budget cannot fit the next entity and its references; increase --budget-bytes or --entity-limit.");
  return RecommendationV2Schema.parse(packet);
}

import type { ConflictV2, DesignRule, ScopedConstraint } from "@udi/knowledge";
import { compare } from "./context-v2.js";

const priority = { critical: 4, high: 3, medium: 2, low: 1 };
const overlaps = (a: string, b: string) => a === b || a.startsWith(`${b}/`) || b.startsWith(`${a}/`);

/** Whole-rule greedy acceptance avoids winners that lose a later dimension. */
export function resolveConflictsV2(rules: readonly DesignRule[], constraints: readonly ScopedConstraint[] = []) {
  const orderedConstraints = [...constraints].sort((a, b) => compare(a.id, b.id));
  const mandatory = orderedConstraints.filter(item => item.strength === "must");
  const effective = [...mandatory];
  for (const preference of orderedConstraints.filter(item => item.strength === "prefer")) {
    if (!effective.some(other => other.dimension === preference.dimension && overlaps(other.scope, preference.scope))) effective.push(preference);
  }
  const unresolved: ConflictV2[] = [];
  for (let i = 0; i < mandatory.length; i++) {
    const a = mandatory[i]!;
    for (const b of mandatory.slice(i + 1)) {
      if (a.dimension !== b.dimension || a.value === b.value || !overlaps(a.scope, b.scope)) continue;
      unresolved.push({ scope: a.scope.length >= b.scope.length ? a.scope : b.scope,
        dimension: a.dimension, status: "unresolved", selectedEntityId: null,
        excludedEntityIds: [], constraintIds: [a.id, b.id],
        explanation: "Overlapping mandatory constraints disagree; no rule can silently override them." });
    }
  }
  const selectedRules: DesignRule[] = [];
  const conflicts: ConflictV2[] = [...unresolved];
  const excluded = new Set<string>();
  for (const rule of [...rules].sort((a, b) => priority[b.priority] - priority[a.priority] || compare(a.id, b.id))) {
    const impossible = unresolved.find(conflict => rule.choices.some(choice => choice.dimension === conflict.dimension));
    if (impossible) { excluded.add(rule.id); impossible.excludedEntityIds.push(rule.id); continue; }
    let rejection: ConflictV2 | undefined;
    for (const choice of rule.choices) {
      const constraint = effective.find(item => item.dimension === choice.dimension && item.value !== choice.value);
      if (constraint) {
        rejection = { scope: constraint.scope, dimension: choice.dimension, status: "resolved", selectedEntityId: null,
          excludedEntityIds: [rule.id], constraintIds: [constraint.id], explanation: "Context constraint excludes this global rule choice; scoped context remains authoritative." };
        break;
      }
      const winner = selectedRules.find(selected => selected.choices.some(other => other.dimension === choice.dimension && other.value !== choice.value));
      if (winner) {
        rejection = { scope: "application", dimension: choice.dimension, status: "resolved", selectedEntityId: winner.id,
          excludedEntityIds: [rule.id], constraintIds: [], explanation: "A surviving rule wins by priority then stable ID; whole-rule acceptance checks all dimensions together." };
        break;
      }
    }
    if (rejection) { excluded.add(rule.id); conflicts.push(rejection); }
    else selectedRules.push(rule);
  }
  return { selectedRules, conflicts, excludedIds: [...excluded].sort(compare) };
}

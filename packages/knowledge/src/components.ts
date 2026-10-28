import { z } from "zod";
import { ComponentSpecSchema, CompositionSpecSchema, type ComponentCatalog, type ProfessionalSpec } from "./component-schemas.js";
import type { Catalog } from "./integrity.js";
import { componentRecords } from "./component-records.js";

export const ComponentCatalogSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  components: z.array(ComponentSpecSchema).min(1).max(64),
  compositions: z.array(CompositionSpecSchema).max(64)
}).strict();
export const professionalComponents: ComponentCatalog = ComponentCatalogSchema.parse(componentRecords);

export function validateComponentCatalog(input: ComponentCatalog, catalog: Catalog): void {
  const pack = ComponentCatalogSchema.parse(input);
  const specs: ProfessionalSpec[] = [...pack.components, ...pack.compositions];
  const records = new Map(specs.map(spec => [spec.id, spec]));
  const existing = new Set([...catalog.rules, ...catalog.patterns, ...catalog.antiPatterns, ...catalog.profiles].map(entry => entry.id));
  if (records.size !== specs.length || specs.some(spec => existing.has(spec.id))) throw new Error("Duplicate component catalog ID.");
  const rules = new Set(catalog.rules.map(rule => rule.id));
  const anti = new Set(catalog.antiPatterns.map(entry => entry.id));
  const dependencies = (spec: ProfessionalSpec) => [...new Set([...spec.dependencies, ...(spec.kind === "composition" ? spec.slots.map(slot => slot.entityId) : [])])];
  for (const spec of specs) {
    if (spec.ruleIds.some(ref => !rules.has(ref)) || spec.antiPatternIds.some(ref => !anti.has(ref))) throw new Error(`${spec.id}: unknown rule or anti-pattern reference.`);
    if (dependencies(spec).some(ref => !records.has(ref)) || spec.incompatibleWith.some(ref => !records.has(ref))) throw new Error(`${spec.id}: unknown component reference.`);
    if (spec.kind === "composition") {
      for (const slot of spec.slots) {
        const component = records.get(slot.entityId);
        if (component?.kind !== "component" || !component.variants.some(v => v.id === slot.variantId)) throw new Error(`${spec.id}: unknown slot variant.`);
        if (slot.required && !spec.dependencies.includes(slot.entityId)) throw new Error(`${spec.id}: required slot is not a dependency.`);
      }
      for (const entity of new Set(spec.slots.map(slot => slot.entityId))) {
        const component = records.get(entity);
        if (component?.kind !== "component") continue;
        const variants = spec.slots.filter(slot => slot.entityId === entity).map(slot => slot.variantId);
        if (component.variants.some(v => variants.includes(v.id) && v.incompatibleWith.some(ref => variants.includes(ref)))) throw new Error(`${spec.id}: incompatible slot variants.`);
      }
    }
    const closure = new Set<string>();
    const walk = (entry: ProfessionalSpec, path: string[]) => {
      if (path.includes(entry.id)) throw new Error(`Component dependency cycle: ${[...path, entry.id].join(" -> ")}`);
      if (path.length >= 4) throw new Error("Component dependency depth exceeds three edges.");
      closure.add(entry.id);
      for (const dep of dependencies(entry)) walk(records.get(dep)!, [...path, entry.id]);
    };
    walk(spec, []);
    for (const ref of closure) if (records.get(ref)!.incompatibleWith.some(other => closure.has(other))) throw new Error(`${spec.id}: incompatible dependency closure.`);
  }
}

/** Full, validated specification; callers receive a fresh copy, never a mutable catalog singleton. */
export function inspectComponentSpec(id: string, pack: ComponentCatalog, catalog: Catalog): ProfessionalSpec {
  validateComponentCatalog(pack, catalog);
  const spec = [...pack.components, ...pack.compositions].find(entry => entry.id === id);
  if (!spec) throw new Error(`Unknown component/composition specification: ${id}`);
  return structuredClone(spec);
}

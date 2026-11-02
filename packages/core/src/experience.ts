import { z } from "zod";
import { CHARACTERS, INTERACTIONS, designDirections, motionGuidance, experienceQuality, experienceProvenance,
  validateExperienceKnowledge, DirectionPacketSchema, type DirectionPacket } from "@udi/knowledge/experience";
import type { ContextV2Input } from "@udi/knowledge";
import { normalizeContextV2, compare } from "./context-v2.js";
import { tokenize } from "./retrieval.js";

const OptionsSchema = z.object({
  character: z.enum(CHARACTERS).optional(), interactions: z.array(z.enum(INTERACTIONS)).max(10).default([]),
  query: z.string().trim().max(1000).default(""), maxBytes: z.number().int().min(1).max(24_576).default(8192)
}).strict();
export type DirectionOptions = z.input<typeof OptionsSchema>;
function hit(term: string, text: string): boolean {
  const needle = tokenize(term).join(" ");
  const haystack = tokenize(text).join(" ");
  return (` ${haystack} `).includes(` ${needle} `) && !new RegExp(`\\b(?:no|without|avoid) ${needle}\\b`).test(haystack);
}
export function inspectExperience(id: string) {
  validateExperienceKnowledge();
  const record = [...designDirections, ...motionGuidance, ...experienceQuality].find(r => r.id === id);
  if (!record) throw new Error(`Unknown experience ID: ${id}`);
  return { ...structuredClone(record), provenance: experienceProvenance };
}

export function recommendDirection(input: ContextV2Input, options: DirectionOptions = {}): DirectionPacket {
  const settings = OptionsSchema.parse(options);
  validateExperienceKnowledge();
  const context = normalizeContextV2(input);
  const app = context.applicationType.value;
  const tasks = [context.tasks.primary, ...context.tasks.secondary].filter(e => e.value !== null);
  const constraints = context.constraints.filter(c => c.scope === "application");
  for (const dimension of ["motion", "density", "brand", "color"] as const) {
    const musts = new Set(constraints.filter(c => c.dimension === dimension && c.strength === "must").map(c => c.value));
    if (musts.size > 1) throw new Error(`Conflicting required ${dimension} constraints; resolve them before selecting a direction.`);
  }
  const prose = [context.query, settings.query, context.industry.value ?? "", ...tasks.map(e => e.value!)].join(" ");
  const ranked = designDirections.map(record => ({ record,
    score: (record.character === settings.character ? 1000 : 0) + (app !== null && record.applications.includes(app) ? 20 : 0) + record.terms.filter(t => hit(t, prose)).length * 4
  })).sort((a, b) => b.score - a.score || compare(a.record.id, b.record.id));
  // Sparse context is an explicit conservative assumption, never inferred brand evidence.
  const selected = settings.character || ranked[0]!.score > 0 ? ranked[0]!.record : designDirections.find(d => d.character === "calm")!;
  const direction = structuredClone(selected);
  const override = (dimension: "density" | "color" | "brand") => constraints.filter(c => c.dimension === dimension).sort((a, b) => Number(b.strength === "must") - Number(a.strength === "must") || compare(a.id, b.id))[0];
  const color = override("color");
  const density = override("density");
  const preserveBrand = context.brand.preserve || override("brand")?.value.toLowerCase() === "preserve" || context.designSystem.value !== null;
  if (preserveBrand || color) {
    direction.color.foundation = color ? `Honor ${color.strength} color constraint: ${color.value}. Validate its rendered contrast and do not invent replacement colors.` : "Bind foundation and foreground to the existing brand/design-system tokens; keep their established identity.";
    direction.color.accent = "Use the existing action/selection accent with restraint; do not replace the palette to match this direction.";
  }
  if (density) direction.composition.density = `Honor ${density.strength} density constraint: ${density.value}. Keep full labels readable and essential controls usable.`;
  if (preserveBrand) direction.typography.display = "Preserve the existing brand/design-system faces; express this direction through hierarchy, spacing and weight instead of replacing fonts.";
  const blockedMotion = constraints.some(c => c.dimension === "motion" && c.strength === "must" && /^(none|off|reduced|instant|no-motion|no animation)$/i.test(c.value));
  const candidates = blockedMotion ? [] : motionGuidance.filter(record => {
    if (record.interaction === "scroll" || record.interaction === "entrance") {
      return settings.interactions.includes(record.interaction) && ["editorial", "marketing"].includes(app ?? "");
    }
    return settings.interactions.includes(record.interaction) || tasks.some(e => record.terms.some(term => hit(term, e.value!)));
  }).sort((a, b) => Number(settings.interactions.includes(b.interaction)) - Number(settings.interactions.includes(a.interaction)) || compare(a.id, b.id));
  const query = [context.query, settings.query].join(" ").trim();
  const searchable = [
    ...designDirections.map(r => ({ id: r.id, title: r.name, kind: "direction" as const, text: [r.name, ...r.terms, r.intent, ...Object.values(r.typography), ...Object.values(r.color)].join(" ") })),
    ...motionGuidance.map(r => ({ id: r.id, title: r.name, kind: "motion" as const, text: [r.name, ...r.terms, r.problem, r.reducedMotion].join(" ") })),
    ...experienceQuality.map(r => ({ id: r.id, title: r.dimension, kind: "quality" as const, text: [r.dimension, r.positive, r.negative].join(" ") }))
  ];
  const queryTokens = [...new Set(tokenize(query))];
  const matches = queryTokens.length ? searchable.map(r => ({ ...r, score: queryTokens.filter(t => hit(t, r.text)).length }))
    .filter(r => r.score > 0).sort((a, b) => b.score - a.score || compare(a.id, b.id)).slice(0, 5).map(({ id, title, kind }) => ({ id, title, kind })) : [];
  const packet: DirectionPacket = {
    schemaVersion: "1.0", engine: "udi-direction-deterministic", provenance: experienceProvenance,
    direction,
    selection: { basis: settings.character ? `Explicit character preference: ${settings.character}; this does not override brand or required constraints.` : ranked[0]!.score > 0 ? `Declared lexical/applicability heuristic for ${context.applicationType.status} ${app ?? "unknown application"}; task words retain their evidence status.` : "Sparse context: calm, conservative direction is an assumption; confirm the actual audience, brand and task.",
      alternatives: ranked.filter(r => r.record.id !== selected.id).slice(0, 2).map(r => r.record.id) },
    binding: { preserveBrand, tokens: context.brand.tokens,
      color: color ? `Existing ${color.strength} constraint: ${color.value}.` : preserveBrand ? "Reuse existing brand color roles; no replacement palette is authorized." : "Palette language is a proposal: choose actual tokens and verify rendered contrast.",
      typography: preserveBrand ? "Reuse the brand fonts; no remote/proprietary font requirement." : "Use existing or locally available fonts; download and licensing choices require separate review.",
      density: density ? `Existing ${density.strength} constraint: ${density.value}.` : direction.composition.density },
    motion: candidates.slice(0, 2).map(r => structuredClone(r)), omittedMotionIds: candidates.slice(2).map(r => r.id), matches,
    review: experienceQuality.map(({ id, dimension }) => ({ id, dimension })),
    limits: ["Inspect stable DIR/MOT/QUA IDs for detail. Use existing recommend 2.1 plus targeted inspection for eligible component/composition contracts.",
      "No beauty, emotion or user-trust score is computed. Review indicators require rendered evidence and contextual human/agent judgment.",
      blockedMotion ? "Required motion constraint suppresses animation. Retain instant focus, textual feedback and reduced-motion behavior." : "Motion is optional, task/interaction-gated and limited to two full records. Query matches are discovery hints, not applicability evidence.",
      "English declared terms and adjacent negation only; inferred task/context values do not become observed facts."],
    budget: { maxBytes: settings.maxBytes, usedBytes: 1 }
  };
  const measure = () => {
    let previous = -1;
    while (previous !== packet.budget.usedBytes) {
      previous = packet.budget.usedBytes;
      packet.budget.usedBytes = new TextEncoder().encode(JSON.stringify(packet) + "\n").length;
    }
    return packet.budget.usedBytes;
  };
  while (measure() > settings.maxBytes && packet.motion.length) packet.omittedMotionIds.unshift(packet.motion.pop()!.id);
  if (measure() > settings.maxBytes) throw new Error("Direction budget cannot fit the complete direction and critique index; increase --budget-bytes.");
  return DirectionPacketSchema.parse(packet);
}

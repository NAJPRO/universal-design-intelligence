import { recommendDirection, type DirectionOptions } from "@udi/core/experience";
import { readContextFile } from "./recommend-v2.js";

export function printDirection(options: { context: string; character?: string; interactions?: string; query?: string; budgetBytes?: string; json?: boolean }): void {
  if (options.budgetBytes !== undefined && !/^\d+$/.test(options.budgetBytes)) throw new Error("--budget-bytes must be a positive integer.");
  const settings = {
    ...(options.character ? { character: options.character } : {}),
    ...(options.interactions ? { interactions: options.interactions.split(",").map(s => s.trim()) } : {}),
    ...(options.query ? { query: options.query } : {}),
    ...(options.budgetBytes ? { maxBytes: Number(options.budgetBytes) } : {})
  };
  // Runtime validation in the core rejects unsupported character/interaction names.
  const packet = recommendDirection(readContextFile(options.context), settings as DirectionOptions);
  if (options.json) { console.log(JSON.stringify(packet)); return; }
  console.log(`${packet.direction.id} — ${packet.direction.name}`);
  console.log(packet.selection.basis);
  console.log(packet.direction.intent);
  console.log(`Focal point: ${packet.direction.composition.focal}`);
  console.log(`Typography: ${packet.direction.typography.display}`);
  console.log(`Color: ${packet.direction.color.foundation} ${packet.direction.color.accent}`);
  console.log(`Responsive: ${packet.direction.composition.responsive}`);
  for (const record of packet.motion) console.log(`${record.id}: ${record.problem} ${record.animate} Reduced motion: ${record.reducedMotion}`);
  if (packet.omittedMotionIds.length) console.log(`Inspect on demand: ${packet.omittedMotionIds.join(", ")}`);
  console.log(`Review separately: ${packet.review.map(r => `${r.id} (${r.dimension})`).join(", ")}`);
  console.log("Inspect a stable ID for full detail. Use --json for the complete bounded decision packet.");
}

import { closeSync, constants, fstatSync, openSync, readSync } from "node:fs";
import { ContextV2Schema, mergeLegacyContext, normalizeContextV2, recommendDesignV2 } from "@udi/core";
import type { ContextV2, Framework, ProjectType } from "@udi/core";

export function readContextFile(path: string): ContextV2 {
  const descriptor = openSync(path, constants.O_RDONLY | constants.O_NONBLOCK | (constants.O_NOFOLLOW ?? 0));
  try {
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.size > 65_536) throw new Error("Context must be a regular JSON file no larger than 65536 bytes.");
    const bytes = Buffer.alloc(65_537);
    let length = 0;
    while (length < bytes.length) {
      const count = readSync(descriptor, bytes, length, bytes.length - length, null);
      if (!count) break;
      length += count;
    }
    if (length > 65_536) throw new Error("Context exceeds 65536 bytes.");
    return normalizeContextV2(ContextV2Schema.parse(JSON.parse(bytes.subarray(0, length).toString("utf8"))));
  } finally { closeSync(descriptor); }
}

export interface V2CliOptions {
  context?: string; type?: ProjectType; framework?: Framework;
  budgetBytes?: string; entityLimit?: string; expand?: string;
  json?: boolean; explain?: boolean;
}
function integer(value: string | undefined, name: string): number | undefined {
  if (value === undefined) return undefined;
  if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error(`${name} must be a positive whole number.`);
  return Number(value);
}
export function printRecommendationV2(options: V2CliOptions): void {
  if (!options.context) throw new Error("Schema 2.0 requires --context <file>.");
  let context = readContextFile(options.context);
  if (options.type) context = mergeLegacyContext(context, options.type);
  if (options.framework) {
    if (context.framework.value !== null && context.framework.value !== options.framework) throw new Error("--framework conflicts with context framework.");
    context.framework = { value: options.framework, status: "explicit", evidenceRefs: ["cli:--framework"], alternatives: [] };
  }
  const maxBytes = integer(options.budgetBytes, "--budget-bytes");
  const entityLimit = integer(options.entityLimit, "--entity-limit");
  const result = recommendDesignV2(context, {
    ...(maxBytes === undefined ? {} : { maxBytes }),
    ...(entityLimit === undefined ? {} : { entityLimit }),
    ...(options.expand === undefined ? {} : { expand: options.expand })
  });
  if (options.json) { console.log(JSON.stringify(result)); return; }
  console.log(`UDI schema 2.0 (${result.evidenceLevel} evidence; heuristic scores)`);
  for (const candidate of result.profileCandidates) console.log(`- ${candidate.id}: ${candidate.score.toFixed(3)} — ${candidate.reason}`);
  console.log("\nSelected knowledge");
  for (const entity of result.entities) console.log(`- ${entity.kind} ${entity.id}: ${entity.title}`);
  console.log("\nCoverage");
  for (const item of result.coverage) console.log(`- ${item.requirement}: ${item.status} — ${item.reason}`);
  if (result.expansion) console.log(`\nExpand with the same context: --expand ${result.expansion.key}`);
  if (options.explain) {
    console.log("\nExplanation");
    for (const candidate of result.profileCandidates) console.log(`${candidate.id}: ${JSON.stringify(candidate.contributions)}`);
    for (const entity of result.entities) console.log(`${entity.id}: ${entity.reasons.join(" ")}`);
    for (const conflict of result.conflicts) console.log(`${conflict.scope}/${conflict.dimension}: ${conflict.status} — ${conflict.explanation}`);
    for (const assumption of result.assumptions) console.log(`- ${assumption}`);
  }
}

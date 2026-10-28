import { mergeLegacyContext } from "@udi/core";
import { recommendDesignV21, inspectProfessionalSpec } from "@udi/core/components";
import { readContextFile } from "./recommend-v2.js";
import type { V2CliOptions } from "./recommend-v2.js";

export function printComponentRecommendation(options: V2CliOptions): void {
  if (!options.context) throw new Error("Schema 2.1 requires --context <file> (context schema 2.0).");
  let context = readContextFile(options.context);
  if (options.type) context = mergeLegacyContext(context, options.type);
  if (options.framework) {
    if (context.framework.value !== null && context.framework.value !== options.framework) throw new Error("--framework conflicts with context framework.");
    context.framework = { value: options.framework, status: "explicit", evidenceRefs: ["cli:--framework"], alternatives: [] };
  }
  const integer = (value: string | undefined, name: string) => {
    if (value === undefined) return undefined;
    if (!/^\d+$/.test(value) || !Number.isSafeInteger(Number(value))) throw new Error(`${name} must be a positive whole number.`);
    return Number(value);
  };
  const maxBytes = integer(options.budgetBytes, "--budget-bytes");
  const entityLimit = integer(options.entityLimit, "--entity-limit");
  const packet = recommendDesignV21(context, {
    ...(maxBytes === undefined ? {} : { maxBytes }), ...(entityLimit === undefined ? {} : { entityLimit }),
    ...(options.expand === undefined ? {} : { expand: options.expand })
  });
  if (options.json) { console.log(JSON.stringify(packet)); return; }
  console.log(`UDI schema 2.1 (${packet.evidenceLevel} evidence; original component contracts)`);
  for (const entity of packet.entities) {
    console.log(`- ${entity.kind} ${entity.id}: ${entity.title}`);
    if (options.explain) for (const reason of entity.reasons) console.log(`  ${reason}`);
  }
  console.log("\nCoverage");
  for (const item of packet.coverage) console.log(`- ${item.requirement}: ${item.status} — ${item.reason}`);
  if (packet.expansion) console.log(`\nExpand with the same context: --expand ${packet.expansion.key}`);
  console.log("\nInspect complete contracts: udi inspect <CMP-...|COM-...> --json");
}
export function printComponentSpec(id: string, json?: boolean): void {
  console.log(JSON.stringify(inspectProfessionalSpec(id), null, json ? undefined : 2));
}

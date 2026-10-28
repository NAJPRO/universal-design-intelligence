import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { performance } from "node:perf_hooks";
import { recommendDesignV21, retrieveComponentSpecs, inspectProfessionalSpec, professionalComponents } from "../../packages/core/dist/components.js";
import { recommendDesignV2 } from "../../packages/core/dist/recommend-v2.js";
const bytes = readFileSync(new URL("./evaluation.json", import.meta.url));
const cases = JSON.parse(bytes);
const percentile = (sorted, q) => sorted[Math.ceil(sorted.length * q) - 1];
function timing(fn) {
  for (let i = 0; i < 10; i++) fn();
  const samples = [];
  for (let i = 0; i < 60; i++) { const start = performance.now(); fn(); samples.push(performance.now() - start); }
  const sorted = [...samples].sort((a, b) => a - b);
  return { samples, medianMs: percentile(sorted, 0.5), p95Ms: percentile(sorted, 0.95) };
}
const rows = cases.map(sample => {
  const started = performance.now();
  const packet = recommendDesignV21(sample.context);
  const runtimeMs = performance.now() - started;
  const selected = packet.entities.filter(e => ["component", "composition"].includes(e.kind));
  const selectedIds = selected.map(e => e.id).sort();
  const tp = sample.expected.filter(id => selectedIds.includes(id)).length;
  const fp = selectedIds.filter(id => !sample.expected.includes(id)).length;
  const fn = sample.expected.filter(id => !selectedIds.includes(id)).length;
  const unsupportedCorrect = (sample.unsupported ?? []).every(id => packet.coverage.some(c => c.requirement === id && c.status === "unsupported"));
  const explanationCorrect = selected.every(e => e.reasons.some(r => r.startsWith("Application gate:")) && e.reasons.some(r => r.startsWith("Task evidence:") || r.startsWith("Requested component:")));
  const coverageAccounted = sample.expected.every(id => packet.coverage.some(c => c.requirement === `spec:${id}` && ["covered", "budget-omitted", "conflicting", "unsupported"].includes(c.status)));
  return { id: sample.id, expected: sample.expected, selectedIds, tp, fp, fn, unsupportedCorrect, explanationCorrect, coverageAccounted,
    deterministic: JSON.stringify(packet) === JSON.stringify(recommendDesignV21(sample.context)), packetBytes: packet.budget.usedBytes,
    coveredSpecifications: packet.coverage.filter(c => c.requirement.startsWith("spec:") && c.status === "covered").length,
    coverageComplete: packet.coverageComplete, runtimeMs };
});
const total = metric => rows.reduce((sum, row) => sum + row[metric], 0);
const tp = total("tp"), fp = total("fp"), fn = total("fn");
const context = cases[0].context;
console.log(JSON.stringify({ timestamp: new Date().toISOString(), fixtureSha256: createHash("sha256").update(bytes).digest("hex"),
  protocol: "22 original pre-content fixtures, authored by the implementing agent, not independently expert-labeled or sealed. Warm API trials include validation/indexing/packing; componentSelection convenience API runs the complete validated 2.1 pipeline. No rendered interfaces.",
  totals: { cases: rows.length, expectedEntities: tp + fn, selectedEntities: tp + fp, tp, fp, fn, microPrecision: tp / (tp + fp), microRecall: tp / (tp + fn),
    incorrectRecommendationRate: fp / (tp + fp), exactSelections: rows.filter(r => !r.fp && !r.fn).length,
    explanationPasses: rows.filter(r => r.explanationCorrect).length, coverageAccountingPasses: rows.filter(r => r.coverageAccounted && r.unsupportedCorrect).length,
    deterministicPasses: rows.filter(r => r.deterministic).length, maxPacketBytes: Math.max(...rows.map(r => r.packetBytes)) }, rows,
  warm: { v20Recommendation: timing(() => recommendDesignV2(context)), v21Recommendation: timing(() => recommendDesignV21(context)),
    componentSelection: timing(() => retrieveComponentSpecs(context)) },
  inspectionBytes: Object.fromEntries([...professionalComponents.components, ...professionalComponents.compositions].map(spec => [spec.id, Buffer.byteLength(JSON.stringify(inspectProfessionalSpec(spec.id)) + "\n")])),
  memory: { rssBytes: process.memoryUsage().rss, maxRssKiB: process.resourceUsage().maxRSS }
}, null, 2));

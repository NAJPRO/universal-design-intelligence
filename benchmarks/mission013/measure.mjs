// Local evidence only. Run after other build/test/browser processes finish.
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import { gzipSync } from 'node:zlib';
const groups = {
  direction: ['direct', '--context', 'benchmarks/mission013/protocol/context.json', '--character', 'editorial', '--interactions', 'press,feedback', '--json'],
  components: ['recommend', '--schema-version', '2.1', '--context', 'benchmarks/mission012/runs/C/design-context.json', '--json']
};
const records = {};
for (let i = 0; i < 5; i++) for (const [name, args] of Object.entries(groups)) {
  const start = performance.now();
  const result = spawnSync(process.execPath, ['packages/cli/dist/index.js', ...args], { encoding: 'utf8' });
  if (result.error || result.status !== 0) throw Error(result.error?.message ?? result.stderr);
  const hash = createHash('sha256').update(result.stdout).digest('hex');
  const record = records[name] ??= { args, samplesMs: [], bytes: Buffer.byteLength(result.stdout), sha256: hash };
  if (hash !== record.sha256) throw Error('Non-deterministic output');
  record.samplesMs.push(performance.now() - start);
}
for (const row of Object.values(records)) row.medianMs = [...row.samplesMs].sort((a,b) => a-b)[2];
const bundle = readFileSync('packages/cli/dist/index.js');
const baseline = readFileSync('benchmarks/mission012/inputs/C/.udi/bin/runtime.mjs');
const output = { protocol: 'Five alternating fresh-process samples per command, warm filesystem cache, one host. Different commands/outputs; not a before/after speedup experiment.', environment: { node: process.version, platform: process.platform }, records, bundle: { bytes: bundle.length, gzipBytes: gzipSync(bundle).length, previousFrozenBytes: baseline.length, previousFrozenGzipBytes: gzipSync(baseline).length } };
writeFileSync('benchmarks/mission013/evidence/cost.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify(output));

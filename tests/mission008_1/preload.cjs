// Used only with instrumented benchmark bundles; never shipped with the CLI.
const { writeSync } = require('node:fs');
globalThis.__udiProfile = { modules: {}, phases: {}, counts: {}, preloadMs: performance.now() };
process.once('exit', () => {
  const trace = globalThis.__udiProfile;
  trace.exitMs = performance.now();
  trace.cpu = process.cpuUsage();
  trace.maxRssKiB = process.resourceUsage().maxRSS;
  writeSync(2, 'UDI_PROFILE:' + JSON.stringify(trace) + '\n');
});

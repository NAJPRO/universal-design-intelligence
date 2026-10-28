# Mission 008.1 measurement and compatibility fixtures

Run from the repository root using existing dependencies. These tools are not bundled into the CLI. They do not install dependencies or change Git state.

Before editing runtime source, build it and preserve a complete local CLI package tree under a new temporary `<run>/before` directory: `package.json`, README/license/notices, and `dist/` including skills. Keep a second snapshot of the optimized build under `<run>/after`. Preserve file layout so the CLI can resolve its manifest and assets.

For each source revision, generate its diagnostic bundle while that revision is in the working tree:

```sh
pnpm build
node tests/mission008_1/profile-build.mjs /tmp/<run>/before
# After source changes, build/copy the after package and instrument that source:
node tests/mission008_1/profile-build.mjs /tmp/<run>/after
python3 tests/mission008_1/measure.py /tmp/<run>
python3 tests/mission008_1/runtime-boundary.py /tmp/<run>
```

Redirect outputs to new artifacts; do not overwrite historical baseline data. This mission used `/tmp/udi-mission0081-gphw74ai`; temporary snapshots may later be removed. The checked-in JSON artifacts retain hashes, raw samples and methodology, not a redistributable baseline binary.

`profile-build.mjs` uses the installed TypeScript parser and esbuild to instrument source module initializers, catalog validation, index constructors and Commander callbacks. It resolves workspace modules to source, writes a separate diagnostic bundle, and does not edit production files. `preload.cjs` collects diagnostics on stderr. Instrumentation has overhead; use it for phase attribution/counts, not headline latency.

`measure.py` runs preserved **uninstrumented** bundles in 24 alternating pairs per command across three blocks, plus five diagnostic samples per variant/command. Each invocation uses a fresh Node process. Warmups warm filesystem caches; this is not an OS page-cache-cold experiment. No builds or tests should run concurrently. Output hashes must match across variants and diagnostic builds. It reports median, p95, range, standard deviation, block medians, paired differences, an empty-Node control, and local dry-run package size. It uses temporary npm caches.

`runtime-boundary.py` installs only into a temporary HOME/project/runtime store using both preserved bundles. It asserts unchanged inventories after rejected same-version replacements and checks the original launcher's version and original runtime's doctor result. No real user runtime is touched.

`compatibility-baseline.json` captures SHA-256 stdout, exact stderr and exit status from the pre-optimization CLI for seven v2 contexts and five error cases. Package-local tests combine it with the existing v1 full-output snapshots. Additional tests use V8 function coverage to verify **actual execution** of schema/catalog initializers without timing thresholds, run a tarball standalone offline, and exercise version coexistence/refusal.

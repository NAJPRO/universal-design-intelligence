# Mission 008.1 — Performance and release readiness

**Date:** 2026-10-28. **Status:** stabilization complete on the tested Linux environment; no publication or release performed. Mission 009 has not started.

## Findings

The CLI eagerly loaded the aggregated core API and v2 CLI adapter for every command. Their import graph initialized Zod, legacy schemas, the catalog, and v2 schemas **before Commander dispatched even `--version`**. Catalog construction parses 80 rules, 17 profiles, eight patterns and eight anti-patterns. Metadata commands need none of that knowledge.

Diagnostic module timings for pre-optimization `--version` were approximately **13.51 ms legacy schema initialization, 17.44 ms catalog construction, and 3.85 ms v2 schema initialization**. These exclude dependency initialization, JS parsing, Node startup and command registration. V2's eager schema cost is real but small; it cannot explain the entire roughly 150 ms increase suggested by Mission 008's temporally separated samples.

The pre-optimization Mission 008 bundle measured **119.64 ms median** in this mission's comparable runs, rather than the earlier report's 267.68 ms. The earlier large regression was **not reproduced at that magnitude**. The earlier protocol did not control host conditions across pre/post runs, so its timing difference cannot be attributed solely to the v2 implementation. This mission establishes and removes a specific unnecessary initialization cost without claiming to account for every earlier millisecond.

There was no repeated index construction per query within the v2 command: one `KnowledgeIndexV2` creates exactly **three** BM25 indexes, one per entity kind, and reuses them for the task and coverage queries. Legacy search/recommendation each constructs **one** BM25 index. Explicit cross-catalog validation runs once per recommendation, separately from catalog construction's per-record parsing; `--version` and search do not call that cross-catalog validator. These validation boundaries remain intact.

## Changes

- Moved existing enum arrays, without changing values/order, into [knowledge constants](../packages/knowledge/src/constants.ts). CLI option registration can read them without constructing schemas or loading the catalog.
- Added explicit [knowledge legacy](../packages/knowledge/src/legacy.ts) and [core legacy](../packages/core/src/legacy.ts) entry points. Existing aggregated root APIs still export their v1/v2 symbols; legacy implementations use the legacy knowledge boundary.
- [CLI dispatch](../packages/cli/src/index.ts) dynamically initializes the legacy engine only for search/v1 recommendation, and the v2 adapter only for explicit schema 2.0. Commander dispatch is awaited so command completion/errors are observed through installed launchers.
- Added private package export subpaths and matching CLI TypeScript path aliases. No dependency changes. The distribution remains **one executable bundle**, with no runtime chunks, new installer asset requirements or remote imports.
- Added compatibility/error fixtures, V8 initializer-execution checks, tarball offline checks, immutable-runtime/coexistence tests, and a regression showing subsequent calls observe modified supplied catalogs.

No recommendation scoring, coverage, conflict, budget or fingerprint algorithm was changed. No result/index cache was introduced. Catalog validation and indexes are rebuilt for each request, so different or modified caller-supplied catalogs cannot receive stale cached results. The catalog file, installer implementation, canonical skill files and lockfile match their mission-start SHA-256 hashes. AK.STORE was not accessed or modified.

## Measurement protocol

Data: [performance artifact](measurements/mission008.1-performance.json). Reproduction tools and snapshot instructions: [measurement README](../tests/mission008_1/README.md).

Environment: Linux x64, Node 22.23.1, Intel i7-10510U. Preserved uninstrumented before/after bundles were run in alternating order, with shuffled command order, **three blocks of eight paired trials per command**: 24 fresh processes per variant/command, 192 timed CLI processes total. No build/test workload ran concurrently. Stdout was captured identically and its SHA-256 had to remain identical across all trials and both variants.

These are process-cold measurements with warmed filesystem caches; no OS cache flush or machine reboot was attempted. Timings include process creation, module initialization, dispatch, the complete command, serialization and output capture. Five separate instrumented runs per variant/command attribute phases and count constructors. Their timings are not mixed into headline latency. An empty Node process control measured **31.94 ms median / 37.86 ms p95**. Host and scheduling variability remain, and the observations are specific to this corpus and machine.

### Fresh-process command latency

All values are milliseconds. SD is the population standard deviation of the 24 samples; raw ranges and per-block medians are retained in the artifact.

| Command / fixed workload | Before median / p95 / SD | After median / p95 / SD | Median paired difference, after − before |
| --- | --- | --- | --- |
| `--version` | 119.64 / 145.16 / 9.95 | **75.14 / 85.14 / 5.27** | **−44.73** |
| `search "keyboard focus" --json` | 131.87 / 152.01 / 8.63 | 132.49 / 148.12 / 6.88 | +0.04 |
| `recommend --type dashboard --json` | 143.44 / 153.03 / 6.87 | 146.74 / 167.07 / 8.44 | +3.46 |
| V2 commerce administration, default budget | 177.63 / 198.39 / 8.18 | 179.28 / 209.49 / 14.41 | +3.49 |

Metadata median startup improves about **37%**. Its three block medians were 117.00/119.33/121.92 ms before and 75.13/75.42/75.53 ms after. The improvement persists across blocks rather than depending on one unusually fast sample.

**Search/recommendation are not demonstrated faster.** Their median differences are small increases, with variability shown above; recommendation p95 also increased in this sample. Lazy dispatch moves required initialization into the selected action and adds bundle/wrapper overhead. The optimization removes unused metadata work and legacy v2 initialization, not the work genuinely required to produce recommendations. No statistical equivalence or universal performance claim is made.

### Initialization, validation, indexing, and dispatch

Instrumented medians below are milliseconds. Module initializer measurements exclude imported dependencies. Constructor phases are inclusive: `KnowledgeIndexV2` includes validation and its BM25 constructors; do not add these rows together as independent costs.

| Phase / workload | Before | After | Interpretation |
| --- | --- | --- | --- |
| Legacy schema factories, `--version` | 13.51 | **not executed** | Constants alone suffice |
| Catalog construction/parsing, `--version` | 17.44 | **not executed** | Catalog deferred to retrieval commands |
| V2 schema factories, `--version` | 3.85 | **not executed** | V2 initialization deferred |
| Legacy schema factories, v1 recommendation | 12.08 | 11.80 | Still required |
| Catalog construction, v1 recommendation | 21.58 | 20.43 | Still required |
| V2 schema factories, v1 recommendation | 3.88 | **not executed** | Verified legacy isolation |
| Cross-catalog validation, v1 recommendation | 5.67 | 4.75 | One call in both variants |
| BM25 construction, v1 recommendation | 5.91 | 5.90 | One index in both variants |
| Cross-catalog validation, v2 recommendation | 6.33 | 8.37 | One call in both variants |
| BM25 construction, v2 aggregate | 6.82 | 6.89 | Three indexes in both variants |
| `KnowledgeIndexV2` construction, inclusive | 14.14 | 20.21 | Includes filtering/adaptation/validation/indexing |
| Commander registration, `--version` | 2.08 | 2.84 | Registration remains small |
| Pre-dispatch module load plus registration, `--version` | 90.76 | 44.93 | Measured after profiling preload |
| Search action, inclusive | 10.51 | 59.80 | After now includes deferred module initialization |
| Legacy recommendation action, inclusive | 22.14 | 69.31 | Same relocation; not an extra equivalent amount of work |
| V2 recommendation action, inclusive | 58.89 | 105.98 | Same relocation; compare total command latency above |

Instrumented timings have probe/JIT/scheduling effects, especially for short cold phases; use them to identify/count work rather than replace uninstrumented command comparisons. V8 coverage in tests independently verifies actual initializer execution: metadata executes no schema/catalog initializer; legacy search/recommendation execute legacy schemas/catalog once and v2 schemas zero times; v2 executes both schema sets and catalog once.

### Packed distribution

| Local dry-run artifact | Before | After |
| --- | --- | --- |
| Compressed package | 191,521 bytes | 197,776 bytes (+6,255) |
| Unpacked package | 1,067,912 bytes | 1,143,253 bytes (+75,341) |
| Package files | 8 | 8, same whitelist |

Lazy initializer wrappers increase bundle size; this is the measured tradeoff for deferring execution without adding runtime files. Build output SHA-256 matches the measured after-bundle hash in the artifact. No minification, dependency replacement, speculative persistent cache, catalog editing or installer redesign was introduced to chase smaller numbers.

## Compatibility, offline and version-boundary validation

**Standard parallel `pnpm check` passed:** ESLint, package builds/type checking, and **102 tests across 11 files**. Its test run completed in 19.94 seconds on this run. Unlike Mission 008's final verification, this successful run did not require serial files or a relaxed default timeout. Tests that pack/install fixtures retain their existing or explicitly bounded 30-second timeout.

- All seven original v1 full-stdout snapshots still match byte-for-byte, including explicit schema 1.0 recommendations.
- Twelve additional pre-optimization cases preserve stdout hashes, exact stderr and exit status across v2 context scenarios and representative errors. Source-line-dependent uncaught stacks are not claimed byte-identical across builds.
- All v2 context, profile ranking, coverage, conflict, budget, reference, expansion and reordered-input checks pass. The supplied-catalog mutation regression passes without caching.
- A real locally packed tarball was extracted outside the workspace and ran version, search, legacy recommendation and v2 recommendation with HTTP/socket/DNS/fetch tripwires and no workspace dependencies. Single-bundle standalone behavior is verified; tripwires are not an OS-level air-gap or security audit.
- Existing global/shared/portable installation, relocation, no-overwrite and diagnostics tests pass. A new isolated fixture rejects different same-version bytes, including `--force`, without changing files. A fixture-only version 0.1.1 coexists with 0.1.0; reviewed owned launchers require the existing explicit force upgrade, while old project launchers remain pinned. Metadata/version mismatch is refused before importing a runtime.
- The actual preserved pre-optimization bundle was also installed under a temporary HOME/runtime store and challenged with the actual optimized bundle. Both same-version replacement attempts were refused, the entire inventory stayed unchanged, and the original launcher and doctor remained valid. See [runtime-boundary artifact](measurements/mission008.1-runtime-boundary.json).

All installation checks used temporary HOME/UDI_HOME/project directories. No real immutable user v0.1.0 runtime was written or replaced. The fixture 0.1.1 version is not a repository version bump or release.

Catalog validation remains **80 rules, 17 profiles, eight patterns, eight anti-patterns**. The unchanged retrieval regression reports Recall@5 **0.941** and MRR@10 **0.969**; these are retrieval regression results, not interface-quality scores.

Key commands:

```sh
pnpm build
node tests/mission008_1/profile-build.mjs /tmp/udi-mission0081-gphw74ai/before
node tests/mission008_1/profile-build.mjs /tmp/udi-mission0081-gphw74ai/after
python3 tests/mission008_1/measure.py /tmp/udi-mission0081-gphw74ai
python3 tests/mission008_1/runtime-boundary.py /tmp/udi-mission0081-gphw74ai
npm_config_cache=/tmp/udi-mission0081-npm-cache pnpm check
git diff --check
```

Before/after package trees were preserved separately before/after the edits. Diagnostic bundles are separate outputs, never production instrumentation. npm pack used local files and temporary caches; it did not publish or fetch a registry package. CLI tests needed approved execution outside the sandbox for subprocess output capture, as in Mission 008. An initial new upgrade fixture omitted the installer's existing owned-launcher force requirement; the fixture was corrected, and the installer stayed unchanged.

## Release assessment and next mission

**The Linux stabilization gate passes for an owner-reviewed new-version release candidate. This checkout is not ready to distribute as another v0.1.0 artifact.** Package versions remain unchanged; the maintainer must select a fresh release version and validate the final versioned tarball through the normal release process. Existing immutable v0.1.0 runtimes must coexist, not be overwritten. This mission performs no publication, staging, commit, push, tag, release or other Git state operation.

Remaining limits: one machine/OS and one corpus; process-cold rather than page-cache-cold timings; aggregate public library entry points still initialize their full API; search/recommendation retain cold schema/catalog/index costs; no cache-based amortization across CLI processes; no 1,000-entity scaling or cross-platform/live-host expansion was performed. The measured tiny recommendation slowdowns and larger lazy bundle should remain visible in release notes rather than being described as a universal speedup.

**Recommendation:** proceed to a separately authorized, bounded Mission 009 component-contract pilot. The startup investigation no longer needs to block that research/implementation planning, but final release versioning/artifact review is still a maintainer gate. Start with operational table/filter/form knowledge and independent retrieval fixtures; do not infer interface-quality improvement from these performance tests. **Mission 009 is not started automatically.**

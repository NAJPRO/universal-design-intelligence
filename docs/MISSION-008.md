# Mission 008 — Evidence-aware retrieval engine

**Date:** 2026-10-28. **Status:** implemented and validated locally; not published. Mission 009 has not started.

## Implementation

Added an independent, explicitly selected schema 2.0 recommendation path. Existing v1 recommendation/retrieval algorithms, editorial catalog records and IDs, package manifests/lockfile, canonical skill and installer implementation are unchanged. No dependency was added or installed into a consumer application. No Git state-changing or remote repository operation was performed. The existing untracked Mission 007 research documents were preserved.

Read the Mission 007 research set and checked proposals against source. The implementation keeps the useful narrow slice: orthogonal context, ranked eligible profiles, existing knowledge retrieval, coverage accounting, conflict correctness and bounded offline packets. It does not implement the proposed component schemas/domain packs, scanner, visual evaluation engine or broad skill redesign.

| Boundary | Implemented responsibility |
| --- | --- |
| [Knowledge schemas](../packages/knowledge/src/v2-schemas.ts) | Strict versioned evidence, context, scoped constraints, entity and output schemas; reference/coverage/conflict invariants |
| [Context](../packages/core/src/context-v2.ts) | Canonical ordering, evidence precedence, explicit contradiction errors, retained uncertainty, conservative legacy adapter |
| [Policy](../packages/core/src/policy-v2.ts) | Original application/profile compatibility and four task-to-category policies; no catalog edits |
| [Knowledge retrieval](../packages/core/src/knowledge-v2.ts) | Per-kind BM25 over compatible existing records; uniform dependency applicability; public lexical API |
| [Conflicts](../packages/core/src/conflicts-v2.ts) | Whole-rule acceptance, mandatory constraints, hierarchical scopes and stable preferences |
| [Recommendation](../packages/core/src/recommend-v2.ts) | Profile contributions, coverage-first allocation, kind mixing, dependency closure, exact byte budgeting and expansion |
| [CLI adapter](../packages/cli/src/recommend-v2.ts) | Bounded explicit context-file read, option validation, compact JSON and readable explanations |

Usage and migration: [recommendation-v2.md](recommendation-v2.md).

```sh
node packages/cli/dist/index.js recommend --schema-version 2.0 --context tests/mission008/commerce-admin.json --json
```

## Architecture decisions

1. **Separate v1 and v2 APIs/dispatch.** Default output remains strict v1; no enhanced fields are inserted into old payloads. Added flags are advertised in help, with explicit rejection of v2-only controls on the v1 path.
2. **Evidence is supplied, not discovered.** Industry/application/roles/tasks/framework/design-system/brand/components are independent. Missing data stays unknown. Conflicting explicit observations fail; weaker disagreements remain visible. No industry-to-application inference.
3. **Use Zod as the existing schema source.** No new JSON Schema toolchain/dependency or duplicated runtime validators. Component/domain proposal schemas remain future work.
4. **Explicit engine policy bridges the old taxonomy.** Existing industry-oriented profiles require compatible application evidence and matching industry. Unknown profiles receive no invented specialization. The adapter maps industry-bearing legacy types to industry only; ambiguous dashboard/SaaS types remain application-unknown.
5. **Reuse established BM25 without modifying v1.** Internal index documents adapt patterns/anti-patterns; they are not new editorial records. Per-kind reciprocal ranks avoid comparing raw index score magnitudes. Profile links have lower weight, and allocation covers required groups before optional guidance.
6. **Finite task coverage, explicit absence.** Four policies cover product administration, browsing products, public information and staff scheduling. Unknown tasks have an unsupported policy requirement while still receiving lexical retrieval. Current domain workflows, media contracts and schedule collisions are not fabricated.
7. **Resolve whole-rule compatibility before packaging.** Greedy priority/ID acceptance checks all dimensions together, preventing a conflict explanation from naming a winner excluded later. Opposing mandatory constraints remain unresolved, and every mandatory value receives its own coverage entry, including unsupported choices. Packet validation checks surviving winners and dependency references after budgeting.
8. **Byte-bounded, reproducible expansion.** Default compact JSON budget is 24,576 bytes including newline. Pages preserve the deterministic schedule with atomic rule dependencies; insufficient envelopes/entities fail explicitly. Fingerprints bind context and eligible content without a Node-specific hashing dependency in core. They are local cursor checks, not security signatures.

## Compatibility and context results

Captured **seven CLI stdout fixtures before implementation** in [v1-baseline.json](../packages/cli/test/fixtures/v1-baseline.json): missing context, commerce, dashboard/brand, fintech, filtered searches and an unrelated query. Tests compare exact stdout, including explicit schema 1.0 for recommendations. Existing command/installation tests also pass; default `search` remains rule-only and unchanged.

Original [context fixtures](../tests/mission008/) exercise commerce storefront vs administration, healthcare public information vs scheduling, unknown industry, missing application, and contradictory explicit context. Additional tests cover incompatible framework references, irrelevant queries, multidimensional conflicts, mandatory/preference scope, tiny budgets, references, expansion and reordered equivalent inputs/catalogs.

For the diagnostic merchant-editor request, legacy `ecommerce` selects `PRO-ECOMMERCE-STOREFRONT`; the v2 commerce-administration fixture selects `PRO-ADMIN-CONSOLE` first and excludes storefront profiles. The storefront fixture retains `PRO-ECOMMERCE-STOREFRONT`. Legacy `dashboard` with receptionist audience selects `PRO-ENTERPRISE-DASHBOARD`; v2 healthcare+scheduling selects `PRO-HEALTH-TECH`, while the public-healthcare fixture excludes that operational profile. V2 has richer supplied context; these are deterministic discrimination examples, not a controlled agent/interface-quality experiment.

The default commerce-administration packet selects **27 rules, 5 patterns and 4 anti-patterns** in **24,199 bytes**. Accessibility/responsive/recovery/brand/table/filter/validation groups are covered at the general-category level. Media-management and domain-workflow requirements remain unsupported. No patient-care, banking authorization or business-policy correctness is inferred.

## Verification and commands

Key commands executed:

```sh
pnpm build
pnpm exec vitest run packages/core/test/v2.test.ts packages/knowledge/test/v2-schemas.test.ts
pnpm exec eslint packages/*/src packages/*/test
npm_config_cache=/tmp/udi-mission008-npm-cache pnpm check
npm_config_cache=/tmp/udi-mission008-npm-cache pnpm exec vitest run packages/cli/test packages/core/test packages/knowledge/test --no-file-parallelism --testTimeout 30000
python3 tests/mission008/measure.py
git diff --check
git status --short
```

The measurement harness invokes `npm pack --dry-run --ignore-scripts --json --cache <temporary-directory>` locally; no publishing or remote access. Baseline and enhanced outputs were redirected to their separate JSON artifacts. Preimplementation fixture capture used Python subprocess calls to the existing built CLI. Read-only diffs verify that catalog, legacy algorithms, installer, manifests and lockfile were not changed.

**Lint, package type checking and builds passed. The final complete test run passed 83 tests across 10 files**, using serial file execution and a 30-second test timeout. An earlier `pnpm check` passed all 68 tests then present; later parallel runs hit five-second CLI/installer timeouts under host load. The snapshot and invalid-option loops were split into individual test cases, retaining their assertions; the final serial run also covers the unchanged installer suite. Default parallel `pnpm check` is therefore not claimed to pass reliably on this host. The unchanged 16-query retrieval regression still reports Recall@5 **0.941**, MRR@10 **0.969**. Catalog validation still reports 80 rules, 17 profiles, 8 patterns and 8 anti-patterns.

Initial sandboxed CLI checks failed because Node subprocess capture returned `EPERM`; the checks were rerun successfully with approved sandbox escalation. npm's normal home cache was read-only, so checks/measurements used temporary caches. These environment failures were not bypassed by weakening tests. Existing installer integration provisions only an isolated temporary **tool prefix** and verifies untouched fake application manifests/lockfiles/`node_modules`.

The new standalone test copies the built bundle/manifest and fixture to a temporary directory without workspace dependencies, then invokes v2 with throwing HTTP/socket/DNS/fetch tripwires. This verifies the exercised bundled path; it is not an OS-level air-gap or comprehensive network security audit. No browser/design-quality or live agent-host validation was run.

## Measurements

Artifacts: [baseline](measurements/mission008-baseline.json), [enhanced](measurements/mission008-enhanced.json). Reproduce from the repository root after building with [measure.py](../tests/mission008/measure.py) and its [Node harness](../tests/mission008/measure.mjs). The baseline was measured before runtime edits; do not overwrite it by rerunning against enhanced source.

Environment: Linux x64, Node 22.23.1, Intel i7-10510U. Startup uses 20 fresh `node ... --version` processes, including module initialization and process launch. Ranking uses 10 warmups plus 100 synchronous calls, including schema validation/index construction/selection; it is not retrieval scoring alone. Corpus is the current 96 knowledge entities, not the proposed 1,000-entity scale test. The v1 workload is dashboard/react/enterprise operations; the v2 workload is the commerce-administration fixture.

| Measurement | Before | Enhanced checkout |
| --- | --- | --- |
| Compressed package | 181,079 bytes | 191,521 bytes (+10,442) |
| Unpacked package | 1,024,496 bytes | 1,067,912 bytes (+43,416) |
| Bundled executable | 1,009,829 bytes | 1,052,439 bytes (+42,610) |
| CLI startup median / p95 | 114.26 / 124.62 ms | 267.68 / 345.31 ms |
| V1 recommendation median / p95 | 3.34 / 6.59 ms | 7.36 / 11.69 ms |
| V2 recommendation median / p95 | N/A | 26.08 / 38.07 ms |
| Warm v1 process RSS | 99,684,352 bytes | 83,632,128 bytes |
| RSS after v2 workload / process peak | N/A | 103,813,120 bytes / 104,336 KiB |
| Default v2 packet, including newline | N/A | 24,199 bytes |

These are one pre-change and one post-change local measurement run, sensitive to scheduling/host load and elapsed time between runs; they are not confidence intervals or causal attribution of every delta. The observed startup slowdown is a material limitation; investigate before a release promising unchanged startup performance. V2 adds validation/indexing/selection work; no performance superiority is claimed. Measured compressed growth stays below the provisional 500 KiB research budget; current-corpus ranking is below 100 ms p95, but this does not validate the research target at 1,000 entities. RSS/peak values describe the warm measurement process, not isolated per-request allocation or cold CLI peak memory.

## Limits and proposed next mission

Context/profile policies are intentionally small, original and heuristic; no held-out retrieval study, confidence calibration or comparative interface benchmark has been performed. Coverage proves inclusion/accounting of existing category guidance, not semantic completeness, accessibility conformance or aesthetic quality. Rich component behavior, role authorization, industry workflows and locale-sensitive scheduling remain unsupported content areas.

CLI context reads and tests were exercised on Linux. Native filesystem behavior, cross-platform execution and live host activation are not newly validated. Package version remains 0.1.0 because no release was requested; same-version immutable installed runtimes must not be silently replaced with this changed development artifact. Capability detection and migration instructions are in the guide.

Proposed Mission 009: review a bounded component-contract pilot for operational tables, filters and recoverable forms, with independently labeled retrieval cases and realistic states. Use Mission 008 coverage gaps to select scope before adding a domain pack, and investigate startup initialization cost. This is a proposal only; **do not start Mission 009 without an explicit request**.

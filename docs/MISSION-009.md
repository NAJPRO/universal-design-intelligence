# Mission 009 — Professional Component Intelligence

**Date:** 2026-10-28. **Status:** implemented and validated on Linux, unpublished. Mission 010 has not started.

UDI can select, explain and inspect three original component families and one task-gated operational composition. This is structured implementation guidance, not a React library, domain pack, rendered application or proof of premium visual output.

## Architecture review and compatibility decision

Reviewed Mission 007 documents [03](research/mission-007/03-component-intelligence.md), [05](research/mission-007/05-recommendation-architecture.md), [07](research/mission-007/07-quality-and-benchmarks.md), [08](research/mission-007/08-implementation-roadmap.md), its [source comparison](research/mission-007/02-ecosystem-comparison.md), and the [008](MISSION-008.md) / [008.1](MISSION-008.1.md) reports against current schemas, context normalization, retrieval, conflicts, CLI dispatch, catalog validation and installation tests.

The existing strict 2.0 schema only permits rule/pattern/anti-pattern entities. Widening that enum silently would break strict consumers. This mission adds an explicitly selected **recommendation output 2.1**, retaining the existing **input context 2.0** and all old 1.0/2.0 algorithms/output schemas. The component specification format is independently versioned **1.0**, with revision numbers and component catalog version **1.0.0**.

| Deliverable | Location / responsibility |
| --- | --- |
| Strict component/composition contracts | [component-schemas.ts](../packages/knowledge/src/component-schemas.ts): bounded strict Zod shapes, state graph and local invariants |
| Original knowledge | [component-records.ts](../packages/knowledge/src/component-records.ts): three families, one composition, visual/behavioral requirements and provenance |
| Pack integrity / inspection | [components.ts](../packages/knowledge/src/components.ts): catalog references, dependency graph, compatibility and full-record copies |
| Versioned packet schema | [v21-schemas.ts](../packages/knowledge/src/v21-schemas.ts): expanded kinds with reused 2.0 reference/coverage/conflict invariants |
| Evidence selection and packing | [core components](../packages/core/src/components.ts): application/task gates, reasons, conflict/dependency closure, bounded pages |
| CLI | [adapter](../packages/cli/src/recommend-components.ts), lazy dispatch, explicit output 2.1 and `inspect <id>` |
| Evaluation | [frozen fixtures](../tests/mission009/evaluation.json), schema/core/CLI regression tests, [reproduction guide](../tests/mission009/README.md) |

Zod remains the single executable schema source rather than adding the research proposal's separate JSON Schema parity toolchain. Every nested record is strict and bounded. Cross-record/graph invariants run in pack validation and the knowledge build. There are no new runtime dependencies, frontend implementations, remote retrieval services or external UI-library installations.

New modules use explicit private package subpaths. The core/knowledge aggregate entry points remain unchanged; dynamic CLI imports initialize the component schemas/catalog only for 2.1 or inspection. V8 execution-count tests verify that metadata, legacy retrieval and explicit 2.0 do not execute the component initializers. The distribution remains one offline executable with the same eight package entries.

## Knowledge coverage

| ID | Contract and limits |
| --- | --- |
| `CMP-OPERATIONAL-TABLE` | Read-only/selectable variants; identifiable rows, sorting, pagination, page-vs-all-matching selection, explicit filter-scope changes, row/bulk actions, permissions, partial outcomes, loading/empty/error recovery, long labels and missing values. Native table with embedded controls is the default semantic model; an interactive grid requires its separate complete focus/navigation implementation. No editable-grid contract is claimed. |
| `CMP-FILTER-WORKSPACE` | Labeled search, facets, active summary, immediate and explicit-apply variants, draft/active separation, reset vs committed clear, current/stale/qualified counts, cancellation of stale responses, safe optional URL state, mobile overlay policy and no-match recovery. |
| `CMP-RECOVERABLE-FORM` | Task grouping, required/optional meaning, single-page/sectioned variants, inline and linked-summary errors, client/server failures, dirty/pending/confirmed/unknown-result distinctions, unsaved navigation, safe retry, responsive fields and focus-safe recovery. Application owns validation, authorization and idempotency. |
| `COM-OPERATIONAL-MANAGEMENT` | Required filter/result slots and optional editor; shared query/page/selection/revision/return-record ownership; task-first hierarchy and action priority; wide/narrow restructuring, empty/loading/error coordination, focus continuity and explicit domain extension points. It is not a default dashboard layout. |

Every record contains actionable hierarchy, alignment, spacing, typography, emphasis, surface/border, proportion, discoverability, state and brand guidance, plus density modes, responsive preservation, purpose-led motion and reduced-motion alternatives. Existing rules and anti-patterns are referenced by stable ID instead of repeating their general prose. There is no prescribed palette, font, framework or consumer component library.

The composition owns shared state, not clinical, financial or organizational policy. It deliberately leaves identifiers/units/status vocabulary, consequence handling, permissions and domain validation to explicit extensions. Missing calendar collisions, regulated approval logic, media management and spreadsheet editing remain unsupported.

## Integrity and retrieval decisions

Validation rejects unknown keys, duplicate IDs, missing rules/anti-patterns/components, missing required anatomy, unknown or incompatible variants, invalid relationship/state owners, layouts omitting required slots, unavailable/ambiguous transition events, unknown states, unreachable states and failure states without recovery. Combined component/composition edges, including optional slot references, are cycle-checked and limited to three dependency edges. Incompatible dependency closures fail validation.

Selection uses declared application types plus exact component IDs/names/aliases or reviewed task phrases. Industry never activates a component. Role overlap affects ranking transparently without granting permission. Scores are fixed request/task/role contributions, not probabilities; evidence status remains in the reason. The limited English lexicon is documented and intentionally does not claim arbitrary semantic understanding.

A named composition needs task evidence and applicable collection/filter candidates. A single detail-edit form, a storefront filter or an analytics comparison table can be selected independently. Unknown application evidence yields no component selection; explicit incompatible/unknown requirements get unsupported coverage. Query prose alone does not establish applicability.

2.1 reuses the existing 2.0 recommendation as its general-guidance baseline. A second compatible knowledge index validates additional referenced rules, and the conflict resolver rechecks the combined rules before selection. This deliberately duplicates some validation/indexing and packet work to preserve the stable engine; the measured cost is shown below. No persistent/result/index cache was introduced.

Required component/rule dependencies are expanded transitively and packed atomically. Composition and component applicability are rechecked through dependency closure. Independently selected incompatible components are resolved by deterministic assembly/score/ID priority and reported as conflicts. Anti-pattern IDs in full specs are validated inspection references, not automatically mandatory packet entities.

Each matched specification has `spec:<ID>` coverage, and explicit missing requirements have `component:<request>` coverage. Coverage is recomputed after conflicts and budgeting. Generic category guidance cannot count as a missing component. Original domain/task-policy gaps remain explicit: a generic form/table contract does not establish full industry workflow coverage. `coverageComplete` still reflects all requirements, including those unsupported domain gaps.

Compact JSON plus newline defaults to at most 24,576 bytes. Pages include required references, and expansion keys bind engine, normalized context and both catalogs' content. Changed input/catalogs invalidate the key. Tiny envelopes or dependency groups fail explicitly; pages must progress. Full specs are available separately through `inspect`, not stuffed into every packet.

## Evaluation evidence

The [evaluation artifact](measurements/mission009-evaluation.json) retains every case and API timing sample. **22 original fixtures were written before the catalog and selection implementation** and frozen with SHA-256. They include six operational domains—commerce, appointment administration, transaction review, grades, property maintenance and competition administration—paired with public-information negatives, plus isolated component cases, generic-dashboard/irrelevant requests, missing application evidence and an unsupported calendar.

Synthetic data uses fictional stable IDs, long labels, missing-vs-zero grades, currency/timezone fields and partial/permission/stale/provisional states. These are retrieval briefs and contract-review conditions; no corresponding rendered state machine or business operation was executed.

| Metric on this small fixture set | Result |
| --- | --- |
| Exact component/composition selections | **22 / 22** cases |
| Relevant selected specifications / expected | **28 / 28**; micro precision and recall **1.000** |
| Unexpected specifications | **0 / 28** selected; **0** suggestions across 12 zero-specification negatives |
| Expected-spec coverage accounting and explicit gap check | **22 / 22** cases; all 28 expected specifications fit the default page |
| Explanation structure / evidence-status checks | **22 / 22** cases; selected specs name application and task/request evidence |
| Repeated serialized request determinism | **22 / 22** cases; separate regression covers reordered catalogs/context normalization |
| Largest default packet | **24,475 bytes**, including newline |

These labels were authored by the implementing agent, independently of external component libraries and in a separate pre-content fixture file. They were **not** adjudicated by independent reviewers or sealed from implementation tuning. Explanation checks are mechanical, not expert judgments of full semantic correctness. This is not the proposed 140-query retrieval study, 63-session interface experiment, domain-expert validation or a general relevance guarantee. No visual superiority, accessibility conformance or production regulatory correctness is claimed.

Full compact inspection record sizes, including newline:

| Specification | Bytes |
| --- | ---: |
| `CMP-OPERATIONAL-TABLE` | 13,963 |
| `CMP-FILTER-WORKSPACE` | 13,103 |
| `CMP-RECOVERABLE-FORM` | 13,896 |
| `COM-OPERATIONAL-MANAGEMENT` | 11,798 |

## Compatibility and standard checks

The final standard parallel `pnpm check` passed ESLint, builds/type checking and **167 tests across 14 files**; its test phase took **18.04 seconds**. The default timeout/file-parallelism configuration was retained. Tests that pack/install temporary fixtures keep their bounded integration timeout.

Seven original v1 stdout fixtures and the historical 2.0 stdout hashes remain unchanged. One intentional human-readable help delta is allowed explicitly in the 008.1 regression test: the advertised `2.1` choice and resulting line wrap. Historical fixture files were not rewritten. Other captured errors/exit statuses remain checked. Old packet schemas and the 2.0 engine source match their mission-start hashes.

New checks cover malformed graph/variant/reference cases, framework and mandatory-constraint exclusions, incompatible independent selections, transitive application gates, modified supplied catalogs, maximum-length evidence, strict 2.0 rejection of 2.1 packets, exact byte counts, self-contained pages, terminating expansion and stale cursor refusal.

A real locally packed tarball runs 2.1 and full composition inspection outside the workspace, with no package dependencies and HTTP/socket/DNS/fetch tripwires. Existing offline v1/2.0, installation, portable relocation, no-overwrite, doctor and fixture-version coexistence tests also pass. Tripwires exercise the tested paths; they are not an OS-level air-gap/security audit.

The [runtime-boundary artifact](measurements/mission009-runtime-boundary.json) additionally challenges an actually installed preserved 008.1 bundle with this mission's bundle under a temporary HOME/runtime store. Global and project same-version replacement attempts, even with force, both fail before writes. Inventory remains unchanged, and the old launcher and doctor remain valid.

Mission-start hashes verify unchanged legacy catalog, canonical skill, installer, 2.0 engine/schema and lockfile. Catalog totals remain 80 rules, 17 profiles, eight patterns and eight anti-patterns. The original retrieval benchmark remains Recall@5 **0.941**, MRR@10 **0.969**. AK.STORE was not accessed or modified. No Git write command, publication, tag, release, remote repository operation or real user runtime installation occurred.

## Performance and package measurements

[Raw performance artifact](measurements/mission009-performance.json). Linux x64, Node 22.23.1, Intel i7-10510U. Preserved uninstrumented package trees were measured sequentially, without test/build load: three blocks of six alternating pairs per common command, shuffled command order, 18 fresh processes per variant/command. Common-command stdout hashes match across before/after. New 2.1/inspection commands have 18 separate samples. Filesystem caches are warm; no OS cache flush or reboot was performed.

All timings are milliseconds. SD is population standard deviation. With only 18 samples, the nearest-rank p95 equals the observed maximum and is particularly sensitive to scheduling. An empty Node process measured **32.16 ms median / 38.60 ms p95**.

| Common workload | Before median / p95 / SD | After median / p95 / SD | Median paired delta |
| --- | --- | --- | --- |
| `--version` | 74.47 / 105.15 / 8.98 | 75.76 / 97.03 / 8.06 | 3.90 |
| `search "keyboard focus" --json` | 131.81 / 166.19 / 11.59 | 132.83 / 195.41 / 19.00 | 2.44 |
| v1 dashboard recommendation | 139.42 / 154.73 / 6.49 | 141.65 / 181.94 / 13.14 | 3.15 |
| 2.0 synthetic commerce administration | 178.74 / 231.32 / 14.81 | 182.72 / 225.45 / 16.69 | 5.51 |

New 2.1 commerce-administration process: **259.00 ms median / 365.47 ms p95**. Full table inspection: **163.34 / 204.79 ms**. Common-path medians show small increases, with substantial tail variability; no performance equivalence or speedup is established. The larger single bundle still has parsing/loading cost even when its component initializers do not execute. The 2.1 command is materially slower than 2.0 on this workload.

Separate warm library measurements use 10 warmups and 60 trials per API, including validation/index construction/retrieval/conflicts/packing; the corpus is the actual small built-in corpus, not 1,000 entities:

| API / same synthetic commerce context | Median / p95 ms |
| --- | --- |
| `recommendDesignV2` | 15.21 / 19.83 |
| `recommendDesignV21`, default packet | 41.54 / 45.78 |
| `retrieveComponentSpecs`, full-pipeline projection with larger packet | 51.43 / 65.62 |

The convenience selection API is not an independently optimized scorer; it creates the complete larger-budget packet before projecting component summaries. These costs are a visible limitation of preserving and composing with the existing engine rather than rewriting its internals.

| Distribution metric | Before | After |
| --- | ---: | ---: |
| Compressed local package | 197,776 bytes | 219,682 bytes |
| Unpacked package | 1,143,253 bytes | 1,262,414 bytes |
| Executable bundle | 1,127,780 bytes | 1,245,898 bytes |
| Package files | 8 | 8 |

Compressed growth is **21,906 bytes** and bundle growth **118,118 bytes**. This stays below the research proposal's provisional 500 KiB compressed-growth limit, but it does not validate the proposed 1,000-entity latency target. Measured bundle SHA-256 matches final build output. No dependency replacement, minification, runtime chunking or catalog cache was added. Memory values in the evaluation artifact describe the combined warm API process, not isolated allocation or cold per-command peak.

## Reproduction, operations and remaining limits

```sh
pnpm build
npm_config_cache=/tmp/udi009-npm-cache pnpm check
node tests/mission009/evaluate.mjs > /tmp/mission009-evaluation.json
python3 tests/mission009/measure.py /tmp/udi-mission009-before /tmp/udi-mission009-after > /tmp/mission009-performance.json
python3 tests/mission008_1/runtime-boundary.py /tmp/udi-mission009-boundary > /tmp/mission009-runtime-boundary.json
git diff --check
```

Run measurement workloads sequentially after checks. See the [reproduction instructions](../tests/mission009/README.md) for snapshot layout, frozen labels, protected hashes and limitations. Temporary snapshots may disappear; retained JSON contains hashes/raw samples. CLI subprocess/temporary-installer tests used approved execution outside the restricted sandbox, as in 008.1. Existing dependencies were reused; local packing did not publish or fetch a registry artifact.

[Usage and migration guide](component-intelligence.md) documents stable IDs, inspection, expansion, private library subpaths, capability boundaries and fallback to existing runtimes. The canonical skill was not modified. The repository still declares package version 0.1.0; the owner must choose a fresh release version and verify its final tarball before distribution. Installed immutable 0.1.0 runtimes must coexist rather than receive changed bytes in place.

Remaining limits include English lexical applicability, small self-authored labels, no independent domain review, no rendered comparisons, no browser/assistive-technology execution, Linux-only runtime validation and no scaling/cross-platform/live-host study. The three generic families do not supply domain packs, editable grids, calendars or complete business policies. Follow-up work requires separate scope; **Mission 010 is not started automatically**.

## External reference and rights ledger

The [Mission 007 source comparison](research/mission-007/02-ecosystem-comparison.md) informed boundaries across Carbon, PatternFly, React Aria, Radix, Base UI, shadcn/ui, Ant Design and Polaris. This mission independently authors all bundled content under the repository's MIT license; no external component code, assets or substantial documentation is incorporated.

- [WAI APG table](https://www.w3.org/WAI/ARIA/apg/patterns/table/) and [grid](https://www.w3.org/WAI/ARIA/apg/patterns/grid/) were consulted for semantic/focus boundaries. Their distinctions support choosing native table vs managed interactive grid. They are reference-only; the [W3C document](https://www.w3.org/copyright/document-license-2023/) and [software/document](https://www.w3.org/copyright/software-license-2023/) licenses are separate instruments and are not silently applied as MIT to documentation.
- [Carbon table guidelines](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines) and [PatternFly table guidelines](https://www.patternfly.org/components/table/design-guidelines/) were consulted as operational-component comparisons. [Carbon core's license](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE) is Apache-2.0 and [PatternFly core's license](https://raw.githubusercontent.com/patternfly/patternfly/main/LICENSE.txt) is MIT, checked on 2026-10-28. These repository observations do not establish rights to all separate site/brand/media assets. Both documentation artifacts remain reference-only in record provenance.

The original-content license is verified against this repository; source review remains marked pending for independent expert sign-off. External documentation citations carry artifact URLs, access dates, relationship and reference-only licensing status. Unresolved or restrictive rights permit citation/independent analysis, not incorporation. No license conclusion from archived Polaris React was transferred to current Shopify web components.

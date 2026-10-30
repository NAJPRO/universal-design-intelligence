# Mission 010 — Agent integration and visual benchmark

**Date:** 2026-10-30. **Outcome:** the enhanced canonical workflow was exercised by an independent coding agent and evaluated against no-skill and legacy-skill outputs using actual rendered evidence. This exploratory comparison demonstrates applied behaviors, **not superior overall aesthetic quality**. Strict experimental controls and implicit installed-host discovery remain incomplete as detailed below. No subsequent mission was started.

## Canonical integration

Updated [SKILL.md](../skills/udi-design/SKILL.md) and its [CLI reference](../skills/udi-design/references/udi-cli.md). The workflow now inspects the target stack/primary tasks, probes advertised capabilities, prefers output 2.1 with context 2.0 when supported, falls back to 2.0 or legacy commands, inspects relevant contracts selectively, maps knowledge IDs to explicit design decisions, implements/reviews rendered states and reports unsupported requirements.

Package version alone is insufficient: development runtimes still report 0.1.0 with different historical capabilities. The skill records version plus root/recommendation help; it never assumes 2.1 from that version or installs a runtime/application dependency automatically. Unsupported flags are avoided on older advertised paths. Actual retrieval/context errors must remain visible. No reference site or visual-style questionnaire is required.

Complete specifications are not embedded in the skill. Bounded recommendations precede targeted inspection; the agent extracts relevant obligations rather than loading every contract. C redirected the four selected contracts to files and read task-relevant extracts. Existing output 1.0/2.0 behavior and retrieval implementation are unchanged. The full check suite still verifies legacy byte compatibility; executing this updated skill against a separately installed historical runtime was **not** part of this run.

## Frozen benchmark and independent runs

[Reproduction instructions](../tests/mission010/README.md), [common task](../tests/mission010/protocol/task.md), [rubric](../tests/mission010/protocol/rubric.json), [input hashes](../tests/mission010/evidence/frozen-inputs.json), [environment/runtime hashes](../tests/mission010/evidence/environment.json), [invocation evidence](../tests/mission010/evidence/invocations.json).

Northstar Supply is a fictional administration product with 12 original synthetic records: long names, stable SKUs, categories, statuses, stock, USD prices, and two permission-limited records. Tasks include a management table, name/SKU search, combined status/category/low-stock filters, editing all five fields, validation, save/cancel/unsaved protection and collection recovery. Native HTML/CSS/JavaScript modules, fixed CSS tokens, system fonts and zero application dependencies/external assets were frozen before implementation. All implementation and evidence are within this repository. This does not complete the separate roadmap's Next.js example.

Three `collaboration.spawn_agent` calls used `fork_turns: none`, identical inherited model/reasoning settings, tool catalog and common task. No model overrides were used. Each began with a clean directory copy and no inherited conversation:

| Arm | Guidance | Frozen source and agent report |
| --- | --- | --- |
| A | No design skill; explicitly excluded global design skills and UDI | [source](../tests/mission010/runs/A/app.js), [evidence](../tests/mission010/runs/A/evidence.json) |
| B | Pre-mission canonical skill; legacy recommendation/search only | [source](../tests/mission010/runs/B/app.js), [evidence](../tests/mission010/runs/B/evidence.json) |
| C | Updated canonical skill with capability-aware Component Intelligence | [source](../tests/mission010/runs/C/app.js), [evidence](../tests/mission010/runs/C/evidence.json) |

Each received a maximum 12-minute/12,000-output-token/two-pass budget. A finished in approximately six minutes; B/C implementation froze at the controller budget notice, approximately twelve minutes, with evidence/cleanup afterward. Budgets were instructions, not runner-enforced caps; exact backend model revision/token consumption are unavailable. B/C took one implementation pass; A performed a second review/fix pass. All share the same maximum, not equal consumed effort.

Directory/input integrity checks passed **42/42**, including identical starting application hashes and unchanged data, tokens and supplied skills. [Final file inventory](../tests/mission010/evidence/integrity.json) records output hashes. Agents were instructed to read only their task/own directory and not use other skills. No run's implementation/design/evaluation was passed to another. Filesystem isolation was by prompt and directory, **not an access-control boundary**. Evaluation was withheld until implementation freeze. Parallel runs shared CPU; performance measurements ran afterward.

The same browser tools/escalation were available to all arms, but actual outcomes differed. C's own Chrome launch hit an automatic approval-review timeout, leaving its self-review unperformed; the controller subsequently rendered and exercised C successfully with the same common harness as A/B. This is a material implementation-review confound. A/B private test totals are not used as comparative scores.

## Retrieval and application evidence

[Original B command log](../tests/mission010/runs/B/commands.jsonl), [original C command log](../tests/mission010/runs/C/commands.jsonl). Arguments and timestamps were appended by local wrappers. The linked agent reports map applied IDs to decisions. [Controller replays](../tests/mission010/evidence/retrieval/) archive outputs separately; they are explicitly labeled replays and do not fabricate original agent transcripts.

B invoked, from its assigned directory:

```sh
node skill/scripts/udi.mjs search "accessible form validation errors unsaved changes table filters" --limit 6 --json
node skill/scripts/udi.mjs recommend --type dashboard --audience "catalog editors comparing and editing products" --preserve-brand --json
```

B reported eleven applied rule IDs: `UDI-SYS-005`, `UDI-VIS-005`, `UDI-SAA-001`, `UDI-SAA-002`, `UDI-DAT-001`, `UDI-RSP-004`, `UDI-ACC-001`, `UDI-DAT-004`, `UDI-COL-002`, `UDI-FOR-001`, `UDI-FOR-002`. It produced a scoped table/filter workspace and recoverable native-dialog editor without component specifications.

C invoked, from its assigned directory:

```sh
node skill/scripts/udi.mjs --version
node skill/scripts/udi.mjs recommend --help
node skill/scripts/udi.mjs --help
node skill/scripts/udi.mjs recommend --schema-version 2.1 --context brief.json --json
node skill/scripts/udi.mjs inspect COM-OPERATIONAL-MANAGEMENT --json
node skill/scripts/udi.mjs inspect CMP-OPERATIONAL-TABLE --json
node skill/scripts/udi.mjs inspect CMP-FILTER-WORKSPACE --json
node skill/scripts/udi.mjs inspect CMP-RECOVERABLE-FORM --json
```

C's retained [context](../tests/mission010/runs/C/brief.json), [packet](../tests/mission010/runs/C/recommendation.json) and four full contract files establish retrieval evidence beyond argument logging. All **four relevant specifications were selected, inspected and cited as applied**:

| ID | Applied decision | Observed evidence |
| --- | --- | --- |
| `COM-OPERATIONAL-MANAGEMENT` | Scope/query/results/collection hierarchy; editor avoids compressing collection | Populated captures and source |
| `CMP-OPERATIONAL-TABLE` | Native comparison table, full names, numeric alignment, row identity and permission explanation | Populated captures; shared permission/semantic checks |
| `CMP-FILTER-WORKSPACE` | Immediate local filtering; active chips survive collapsed advanced controls | [Collapsed-filter comparison](../tests/mission010/evidence/review/375-collapsed-filters.png); three removable chips in details.json |
| `CMP-RECOVERABLE-FORM` | Retained invalid input, linked error summary and explicit keep/discard choice | [Invalid-form comparison](../tests/mission010/evidence/review/375-invalid.png), [discard comparison](../tests/mission010/evidence/review/375-discard.png); shared save/cancel checks |

C also cited `UDI-RSP-004`, `UDI-ACC-002`, `UDI-SYS-001`, `UDI-FOR-002`, `UDI-FOR-004`, `UDI-SAA-004`. The skill was **explicitly routed** to each condition: this validates consumption/application, not automatic discovery in an independently installed Codex/Claude/Cursor/Antigravity host.

C's coverage was correctly reported incomplete: the three free-text task requirements were `unsupported` by the task-policy vocabulary, while all four specification requirements were covered. General accessibility/responsive/recovery/brand categories were covered. Component selection does not imply domain-task completeness. C preserved that distinction in its report. The packet contained 31 entities in **24,175 of 24,576 bytes**, with an expansion cursor for 27 omitted candidates. The agent did not expand because the needed specification groups were already present. No domain pack or external retrieval was added.

These observations support traceability and task-specific application, not proof that C could not have chosen the same behaviors without UDI. All agents use the same underlying model family and task.

## Rendered evaluation

[Capture metadata/hashes](../tests/mission010/evidence/captures.json), [shared interaction results](../tests/mission010/evidence/interactions.json), [focus/filter/error detail evidence](../tests/mission010/evidence/details.json), [dimension-level evaluation](../tests/mission010/evidence/evaluation.json).

Captured **45 original PNGs**: three arms × 375/768/1440 CSS pixels × populated/empty/error/loading/editor. Height 1000 CSS pixels; device scale factor 1. Added **nine actual 375px detail captures** for active filters, invalid editing and discard handling. The controller inspected all 15 primary comparison sheets and three detail sheets; original native-resolution images remain under [screenshots](../tests/mission010/evidence/screenshots/) and [details](../tests/mission010/evidence/details/). Contact sheets are scaled aids. Browser confirmation prompts in A/B were tested through CDP events, not represented as page screenshot pixels.

Representative comparisons: [375 populated](../tests/mission010/evidence/review/375-populated.png), [768 populated](../tests/mission010/evidence/review/768-populated.png), [1440 populated](../tests/mission010/evidence/review/1440-populated.png), [375 empty](../tests/mission010/evidence/review/375-empty.png), [375 error](../tests/mission010/evidence/review/375-error.png), [375 editor](../tests/mission010/evidence/review/375-edit.png).

The following scores use the frozen 0–4 rubric (4 strong for this task, 3 good/minor issues, 2 usable/material issues). They are separate judgments, **not an aggregate aesthetic score**. The evaluator knew the conditions; no independent blinded human reviewer participated.

| Dimension | A | B | C | Evidence and interpretation |
| --- | --- | --- | --- | --- |
| Task correctness | 4 | 4 | 4 | Shared search, combined facets, authorized editing, save/cancel, validation and recovery passed in each arm for the fixed local task. |
| Component appropriateness | 3 | 3 | 3 | All choose table/filter/editor appropriately; C's active chips add visible scope, but mobile action access remains cumbersome in all. |
| Information hierarchy | 3 | 3 | 3 | Clear title/tooling/rows throughout. A's metrics/sidebar consume more space; B foregrounds search; C gives the collection a distinct heading. No clear overall winner. |
| Visual composition | 3 | 3 | 3 | Consistent green/neutral surfaces and alignment. A/B mobile editors leave substantial blank space at 1000px height; C's modal is bounded, but its empty/error/loading table header leaves unnecessary mobile scrolling. |
| Responsive usability | 2 | 2 | 2 | No page overflow in any primary capture. All preserve readable tables through horizontal scrolling; mobile initially shows mostly names and hides later fields/actions. All editor submit actions reachable at 375×667. |
| Accessibility | 3 | 3 | 3 | Native structure, labels, focus styling and retained errors. A's explicit Tab loop stays inside; B/C briefly focus BODY between native-dialog cycles. No interactive background control was focused in follow-up. C adds error-summary links. No conformance claim. |
| State handling/recovery | 3 | 3 | 3 | Distinct empty/error/loading states, no-match Clear and Retry work. C adds explicit keep/discard and linked correction, but its error action sits lower on mobile. Stable synthetic loading is not transport validation. |
| Brand consistency | 3 | 3 | 3 | Fixed tokens/data unchanged; coherent typography, surfaces and status text. One fictional identity cannot establish cross-brand transfer. |

The common suite passed **A 27/27, B 26/27, C 26/27**. The B/C failure was the strict repeated-Tab-inside-editor assertion; follow-up narrowed it to a transient BODY stop, not observed background-control access. None of the 45 captures had page overflow or unlabelled form controls under the limited DOM-name check. No uncaught application exception was recorded. One initial A request for an absent favicon returned 404; this was a resource error, retained in raw capture logs. Observed requests were loopback-only.

Automated assertions establish only exercised functionality/structure. They do not prove aesthetic excellence, full accessibility or production readiness. No screen-reader, contrast audit, cross-browser, real touch, virtual-keyboard or full-page visual review was performed. Screenshots capture first viewports; lower content was exercised selectively through interaction tests.

**Finding:** C visibly applied specific useful contract obligations. Overall rendered quality was broadly comparable to A/B; this experiment does **not** establish an enhanced-workflow aesthetic advantage. Mobile collection/action access remains the clearest common usability limitation.

## Performance and scalability

[Raw measurements](../tests/mission010/evidence/performance.json), [measurement script](../tests/mission010/performance.mjs), [validation/index trace](../tests/mission010/evidence/validation-trace.json).

Warm API: two unmeasured calls then nine alternating 2.0/2.1 pairs per corpus size, same context. Synthetic growth clones legacy rules with valid unique IDs; profiles, patterns, anti-patterns and the four-specification component pack remain fixed. Repeated outputs at each size were hash-identical. This tests cost, not corpus relevance/quality. The 1,280-rule point is extrapolation, not a proposed content expansion.

| Legacy rules | Schema 2.0 median | Schema 2.1 median | Standalone index including validation |
| --- | --- | --- | --- |
| 80 | 15.96 ms | 45.38 ms | 3.31 ms |
| 320 | 36.46 ms | 122.00 ms | 10.50 ms |
| 1,280 | 95.85 ms | 228.87 ms | 54.39 ms |

At 80 rules, nine alternating fresh-process CLI calls measured medians **175.41 ms (2.0)** and **252.37 ms (2.1)**. Processes were cold, filesystem caches warm; no OS cache flush. Timings ran after agents, builds and browser checks, on one Linux/Node 22 host. Raw individual samples, min/max, output hashes, sizes, coverage and selected IDs are retained. Single-host small-sample timings are not latency guarantees.

Separate in-memory loader instrumentation counted, per recommendation after imports:

| Operation | 2.0 | 2.1 |
| --- | --- | --- |
| `KnowledgeIndexV2` construction | 1 | 2 |
| Legacy catalog validation | 1 | 2 |
| Component catalog validation | 0 | 1 |

The enhanced path calls `recommendDesignV2`, which constructs/validates an index, then constructs another index for dependency resolution. That second index repeats validation and three BM25 indexes. At 1,280 rules a standalone index costs about 54 ms; it is worth measuring reuse, but phase times are standalone and cannot be subtracted as a proven speedup. Component validation itself was about 0.8–1.0 ms here.

**Justified proposal:** introduce an internal per-call validated context/index pipeline reusable by 2.0 planning and 2.1 dependency resolution. Keep public inputs validated, preserve output ordering/bytes, context-bound cursors, supplied-catalog mutation detection and legacy behavior. Avoid a global identity cache for mutable caller-owned catalogs. Benchmark the proposed change with paired before/after outputs and timings before accepting it. The remaining hashing/packing/scoring costs were not isolated enough to justify further optimization. **No runtime optimization was implemented in this mission.**

## Validation and completion limits

- `pnpm install --offline --frozen-lockfile`: passed; no dependency changes.
- `pnpm build`: passed.
- `pnpm check`: lint/type checks and **167 tests across 14 files passed**; retrieval regression remains Recall@5 0.941 / MRR@10 0.969 on the existing small authored set.
- Canonical skill frontmatter validator: passed. Existing installer/package tests package the updated canonical assets. [Validation summary](../tests/mission010/evidence/validation.json) records commands and outcomes.
- Independent agent execution, actual rendered comparisons, state/interaction checks, command evidence and cost measurements: performed with limits above.
- Automatic installed-host discovery, historical-runtime behavioral skill run, exact backend-model revision, hard equal token accounting, repeated randomized trials and blinded independent aesthetic/accessibility review: **not validated**.

The mission definition's practical exercise/comparison is satisfied as an exploratory benchmark. A strictly isolated, budget-instrumented causal trial and broad quality/host-discovery claims remain unpassed; they must not be inferred from this report. All work stayed inside UDI. No user-project dependencies, full industry packs, publication, Git state commands or subsequent mission work were introduced.

## Recommendations for expansion

1. Improve the existing collection contract's narrow-screen task access before adding families: test a prioritized record summary/detail pattern or persistent row action access while preserving comparison semantics. Add rendered acceptance cases that require reaching status/price/edit without discovering distant columns.
2. Expand permission-aware row actions and destructive confirmation only with clear focus-return, denied-action and recovery contracts. The observed Tab-cycle differences and C's nested discard dialog merit dedicated keyboard/assistive-technology cases first.
3. Add a small product-administration task vocabulary/fixture set aligned with existing policy IDs. Keep component evidence distinct from domain support; the current unsupported free-text task diagnostics are useful and should remain truthful. Do not infer a full commerce pack from this single benchmark.
4. Add larger synthetic collections and pagination/selection only when those tasks are requested. Reuse the measured scaling harness and test per-call index reuse before expanding corpus size materially.
5. Repeat A/B/C with hard runner budgets, stronger file isolation, randomized condition order, multiple seeds and blinded reviewers. Validate actual installed-host skill discovery separately. None of these follow-ups was started automatically.

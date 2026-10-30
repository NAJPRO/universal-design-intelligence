# Mission 011 — Responsive Component Intelligence & Scroll Behavior

Date: 2026-10-30. Technical implementation and targeted reference validation completed. Autonomous agent improvement, overall visual superiority and accessibility conformance remain unproved.

## Audit and minimal changes

The [initial audit](MISSION-011-AUDIT.md) preceded implementation. Existing responsive fields, checks, variants and retrieval can express the requirements. No new component family, public schema, runtime scanner, dependency, remote retrieval or installer behavior was needed. Existing legacy responsive rules remain unchanged rather than duplicating their guidance in another catalog.

The original component catalog is now **1.1.0**, with revision **2** for `CMP-OPERATIONAL-TABLE`, `CMP-FILTER-WORKSPACE`, `CMP-RECOVERABLE-FORM` and `COM-OPERATIONAL-MANAGEMENT`. Schema 1.0, stable IDs, anatomy, states and variant identities are retained. Their responsive instructions now distinguish column comparison from individual record consultation, place essential actions with identity, preserve permission explanations and critical information, avoid empty-state comparison tracks, and require reachable dialog actions and stable keyboard focus during restructuring. Record summaries are conditional; tables are never universally converted to cards.

The existing compact recommendation guidance includes the applicable responsive decision. Full contracts remain selectively available through `inspect`; they are not dumped into every packet. The engine is `2.1.0-experimental.2`, invalidating older content-bound expansion keys. No selection score, dependency gate or indexing optimization changed. The package version remains unreleased 0.1.0; immutable installed runtimes must not be overwritten with these changed bytes.

## Contextual scroll policy

The canonical skill points to the shared [contextual policy](../skills/udi-design/references/design-quality.md). It covers page vertical scrolling, table comparison, navigation/tabs, filters/chips, carousels, dialog bodies and accidental overflow. Native automatic tracks are the default. Local concealment requires perceptible discovery, usable alternatives and verified keyboard/touch operation; hiding a track never means disabling scrolling. Global `overflow: hidden` and global `scrollbar-width: none` are rejected as fixes. Temporary scoped modal background locking remains a separate concern.

Checks distinguish measured failures (ordinary page overflow with an identified offender, essential action travel, declared inaccessible critical truncation, unrevealable dialog actions or demonstrated focus loss) from review warnings (nested owners, incomplete cues, hidden priority-column tradeoffs and transient BODY focus stops). The benchmark classifier is evidence-specific, not a generic production DOM auditor.

This is original UDI/MIT editorial content. Primary WAI and MDN references are linked in the policy/contracts for reference only; no external prose, code or assets were reproduced. Author review is not independent expert approval.

## Reproducible experiment and evidence

See [benchmark instructions](../benchmarks/mission011/README.md), [frozen task](../benchmarks/mission011/protocol/task.md), [retrieval comparison](../benchmarks/mission011/evidence/retrieval-comparison.json) and [browser evidence](../benchmarks/mission011/evidence/browser-results.json).

The baseline is an unchanged **copy** of Mission 010 C, with twelve fictional Northstar Supply records. The revised fixture is a controller-authored reference adaptation. Both retain the same data, brand tokens, task and browser. No additional coding agent was invoked, and generation budgets/model sampling were not controlled. This paired reference implementation demonstrates possible applications of the guidance; it is **not an independent agent comparison or causal evidence that UDI produces better designs**.

The pre-change bundled CLI and component catalog are retained separately. Exact command argument arrays, packet/spec JSON and SHA-256 hashes are archived for default recommendations, explicit 2.0/2.1 recommendations and inspection of all four contracts. Each command is repeated to check determinism. Default v1 output is byte-identical (8,906 bytes), as is explicit 2.0 (24,223 bytes). The 2.1 packet changes from 24,178 to 24,266 bytes, within its 24,576-byte budget; full inspected contracts intentionally grow. This measures payload size, not recommendation latency or corpus scalability.

Chrome 156.0.8078.47 on Linux, Node 22.23.1 and DPR 1 produced **45 actual PNGs**: 36 paired states at 375/768/1440 × 1000, four editor captures at 375 × 500/320, and five scroll-laboratory captures. States include populated, empty, error, loading, editor and explicit comparison. Twenty paired review sheets aid inspection; original screenshots retain native dimensions. Short editor shots follow revealing Cancel and Save and may have different initial scroll positions. A 320px height does not test WCAG 320px reflow width or an actual OS keyboard.

Examples: [mobile populated](../benchmarks/mission011/evidence/review/375-populated.png), [mobile comparison](../benchmarks/mission011/evidence/review/375-compare.png), [tablet error](../benchmarks/mission011/evidence/review/768-error.png), [desktop populated](../benchmarks/mission011/evidence/review/1440-populated.png), [short editor](../benchmarks/mission011/evidence/review/375x320-edit.png). All viewport/state pairs were visually inspected as review sheets.

## Observed results

| Criterion | Before | After | Interpretation |
| --- | --- | --- | --- |
| Maximum essential-action horizontal travel at 375px | 603.61px | 0px | Applies at horizontal origin in populated/comparison views; vertical page scrolling remains allowed. |
| Same measure at 768px / 1440px | 224.72px / 0px | 0px / 0px | Measures reach, not task completion time. |
| Empty/loading/error narrow comparison region | Blank overflowing table and comparison hint | Unused region/hint absent | Recovery remains visible; scrollbar disappearance alone is not the success criterion. |
| Unintended page overflow / runtime exceptions | None in 40 paired captures | None in 40 paired captures | Limited to measured states/viewports. |
| Cancel and Save revealable at both short heights | Yes | Yes | Baseline was already usable under this check; no claim of repairing inaccessible baseline actions. |
| Data, permissions, filters, editing/recovery | Exercised | Exercised, plus summary/details | Same records/tokens; read-only records cannot open editing, including URL attempts. |
| Focus on restructuring | Stable in unchanged table | Explicit identity restoration | The final harness focuses the visible representation; identity preservation was strengthened before final evidence. See fixture revision record. |

The task checks cover search, combined/draft filters, active chips, clearing empty results, Retry, permission restrictions, invalid-value retention, save acknowledgement, unsaved keep/discard, draft preservation on resize, focus return and keyboard scrolling. The revised fixture additionally exercises native summary disclosure and critical values. Final browser check totals are **19/21 before, 22/23 after and 7/7 laboratory** (48/51 overall). The extra two after checks cover summary/details; totals are not directly comparable quality scores. The three unresolved results are the two missing touch validations and the baseline BODY warning.

The baseline's repeated Tab trace includes a transient BODY stop, retained as a review warning rather than proof of interactive background access. Explicit boundary wrapping keeps the revised editor sequence within its controls. Simulated touch injection did not move either comparison table: both checks remain false and **touch validation is missing**, not a demonstrated physical touchscreen defect. Concealed laboratory navigation/carousel tracks retain operation warnings despite working alternative controls and sampled keyboard behavior.

Injected laboratory faults establish that the benchmark detects scoped accidental overflow and declared inaccessible truncation as failures, and uncued/nested scrolling as warnings. Unit cases also cover unrevealable dialog actions, priority-column warnings, focus loss, valid comparison scrolling and conditional concealed-track approval only when both keyboard and touch evidence are supplied. Synthetic approval cases are not real-device evidence.

Visual review found clearer mobile identity/action access and cleaner recovery states. The added view controls and taller comparison rows consume more vertical space and reduce desktop density; long comparison names and trailing values can still require horizontal travel, with complete record access available through summaries/details. No independent reviewer, blind scoring or demonstrated overall composition/brand advantage is claimed. Automatic checks cannot establish aesthetic excellence.

## Verification, limits and next work

`pnpm install --offline --frozen-lockfile`, the build pipeline and final `pnpm check` passed: **181 tests across 15 files**, lint and type checking included. The first restricted run encountered process-spawn EPERM; the authorized rerun passed and both logs are retained. Integrity verification checks the frozen Mission 011 inputs, identical paired data/tokens and every Mission 010 file plus its file set; Mission 010 evidence remains unchanged. A pre-final focus refinement and the hidden-target harness correction are explicitly recorded in `fixture-revision.json` with previous/final hashes instead of being concealed as an unchanged experimental input.

Missing validation: independent same-agent before/after generation with measured budgets, physical touch, assistive technology and announcements, actual OS keyboard, zoom/320px reflow width, real tab-widget behavior, cross-browser/platform runs, and independent visual/accessibility review. The laboratory covers navigation rails rather than asserting an implemented ARIA tab system. These are not marked passed.

The next useful work is a genuinely isolated, budget-instrumented agent experiment, followed by physical touch/assistive-technology review and refinement of summary density and comparison priority values. Expand component/domain coverage only after those observations identify a specific unmet task. No subsequent mission, publication or Git state operation was started.

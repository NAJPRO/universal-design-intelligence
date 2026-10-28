# Visual quality and benchmarks

**Proposed evaluation protocol**, followed by the checks actually run for this documentation mission. No enhanced-engine or comparative-interface results exist yet.

## Separate dimensions and evidence

| Dimension | Automated candidates | Visual/manual/expert judgment |
| --- | --- | --- |
| Functional correctness | Build, focused interaction tests, persisted state, recovery/idempotency scenarios | Does the complete task actually work and preserve intent? |
| Accessibility | Semantic/name checks, axe if available, focus assertions, contrast sampling | Keyboard flow, screen-reader behavior, understandable errors and alternatives |
| Visual composition | Overflow/overlap bounds, token consistency, screenshot differences | Hierarchy, proportion, rhythm, readable relationships and intentional emphasis |
| Component quality | Required parts/states, state-transition tests, selection consistency | Appropriate variants, sophistication, discoverability and coherent interaction |
| Domain appropriateness | Required identifiers/units/status distinctions, role/task coverage | Correct workflow and consequence framing; expert review for sensitive domains |
| Responsive usability | Viewport fixtures, overflow, text-spacing/enlargement tests | Useful restructuring, reachable detail/actions, practical density |
| Interaction quality | Loading/error/partial-failure tests, reduced-motion preference | Timing, feedback, focus continuity and meaningful motion |
| Brand consistency | Token references, approved component usage | Brand recognition, tone, appropriate expression and justified deviations |

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) supplies accessibility requirements, including reflow, text spacing, focus and input considerations; it is not an aesthetic scoring framework. Do not label a chosen target size or screenshot width as a universal standards requirement without checking its criterion and exceptions. Automated issue counts cover only executed rules and states. Passing them does not establish full conformance or aesthetic excellence.

Use anchored 0–4 ratings per dimension: 0 unusable/misleading; 1 substantial failures; 2 usable with material weaknesses; 3 coherent and task-appropriate with minor issues; 4 polished, robust and strongly suited to the brief. Store observable examples for every score, including why 3 differs from 4 in that scenario. Keep critical task/access failures as independent gates, never hide them behind an average of attractive screenshots.

Practical review: build/run → execute scripted task → capture fixed states → inspect hierarchy/component fit → inspect keyboard/responsive/long-content cases → correct highest-impact findings → repeat → publish evidence and remaining limitations. Automated diffs detect change, not improvement. Human raters should not award points just because an interface resembles a named library.

## Benchmark fixtures

Version each fixture's brief, starting codebase hash, synthetic dataset/seed, expected tasks, allowed assets, target viewports and state-control harness. Data must be plausible but fictional; no scraped patient/customer/student/tenant records or proprietary asset collections. Freeze clock/timezone, network responses, locale, fonts, random seed and animation capture state.

| Scenario | Realistic synthetic fixture | Required tasks and states |
| --- | --- | --- |
| Marketing website | A regional solar-maintenance service, 6 services, 4 accurately labeled fictional case examples, mixed-length copy | Understand offer, navigate service detail, request a quote; mobile nav, validation, success, unavailable image |
| E-commerce admin | 120 products, 480 variants, mixed inventory/publication states and long multilingual names | Filter low stock, edit variant, review publication and bulk selection; empty filter, denied edit, partial bulk failure, save conflict |
| Healthcare application | 60 fictional appointments with similar patient names, timezone labels and distinct appointment/task states | Staff scheduling and handoff only; identify correct person/context, reschedule safely; stale slot, missing data, denied view, recoverable error; no treatment decisions |
| Banking workspace | 180 fictional transactions across accounts/currencies, pending/booked/failed states, duplicate-looking entries | Investigate and record a simulated review decision; stale evidence, duplicate submit, unknown result, denied decision; no real transfers |
| Education application | 32 students × 12 assessments, missing/excused/zero/draft/published distinctions | Teacher locates assessment, edits feedback and reviews publication; save error, stale edit, long names, keyboard workflow |
| Real estate application | 24 properties, 140 units, lease/occupancy states, 40 work orders and licensed placeholder media | Manager scopes property, resolves maintenance task and reviews detail; unknown availability, restricted document, empty queue, failed media |
| Sports application | 16 teams, 8 rounds, fixtures across venues, provisional/official/postponed states | Organizer reschedules fixture and corrects simulated result; collision, stale live update, cancellation, mobile agenda |

Every scenario includes populated, loading, empty, validation/error, permission-limited and narrow-screen states where applicable. Use long labels, absent values, mixed units where relevant, non-color statuses and interrupted operations. Distinguish irrelevant states with an explicit N/A reason rather than forcing the same workflow onto every industry. Benchmark-only role policies are declared fixture rules, not generic regulations.

## Experimental arms and controls

- **A — Baseline:** same agent/model with no UDI or other design skill.
- **B — v0.1.0:** exact released artifact and canonical workflow, using the same task and codebase.
- **C — Proposed workflow:** first a manually supplied, frozen research packet to test the architecture hypothesis; later an implemented enhanced runtime as a **separate** experiment. Label manual-packet results clearly; they are not enhanced-engine results.
- **D — Optional competitor:** exact pinned skill/revision with rights and runtime prerequisites recorded. Use the same allowed tooling and budget; report unavailable source/runtime as not run, never replace the requested source silently.

Hold exact model snapshot, system instructions, user brief, starting tree, tool permissions, framework/dependency versions, asset access, wall-clock/turn/token budgets and verification tools constant. Each arm gets a clean independent copy/session; prevent skill or output leakage. Explicitly disable other automatically loaded design skills in A/B/C except the assigned one. Tool/dependency setup comes from the frozen fixture, not extra arm-specific internet research. If a competitor requires Python, provision it in all environments or declare that experiment separately.

Run at least three independent sessions per scenario per mandatory arm for a pilot: **7 × 3 × 3 = 63 sessions**. Use matched seeds when supported; agent nondeterminism remains even when retrieval is deterministic. Randomize arm order. Account for setup/tool errors, failed builds and timeouts in intention-to-evaluate results; do not discard unattractive failures. Record runtime/model identifiers, timestamp, harness versions, command logs, tool costs, elapsed time, packets, screenshots and test reports, with sensitive values excluded.

Use 375/768/1440 CSS-pixel captures plus a targeted 320-pixel reflow inspection, text enlargement/spacing, reduced motion and relevant keyboard states. Fix browser/OS/DPR and local fonts. A screenshot is evidence for that capture condition only. Record visual inspection separately from screenshot generation.

## Retrieval evaluation, independent of interface scoring

Create a reviewed 140-query set: 20 per scenario, spanning direct task terms, paraphrases, sparse context, ambiguous industry/app combinations, misleading keywords, irrelevant requests, unavailable packs and explicit constraints. Include adversarial storefront/admin pairs and public-healthcare/staff-scheduling pairs. Split by task/vocabulary family before tuning: 70 development, 35 validation, 35 sealed test. Keep the existing 16-query set as a distinct legacy regression suite, not part of held-out tuning.

Two reviewers label relevant rules/entities, required coverage groups, eligible profile candidates and inappropriate suggestions; a third adjudicates disagreements. Track micro/macro Recall@k, graded nDCG@10, MRR, precision/irrelevant-result rate, coverage satisfaction **and truthful gap reporting**, profile top-1/top-3 accuracy, domain/app confusion, unsupported-context behavior, and conflict explanation validity. Report confidence intervals and per-scenario denominators; sparse judgments are not exhaustive relevance truth.

Measure byte/token-estimate budget compliance, latency and memory independently. Evaluate evidence bands with error-rate reliability plots; do not claim numeric confidence calibration from ranking scores. Run the same serialized request repeatedly and under reordered catalog input; stable outputs are a separate deterministic contract. Test air-gapped execution with already provisioned artifacts in a future implementation mission.

## Final-interface evaluation

Have at least two blinded raters inspect scripted task recordings and matched states; include a relevant domain reviewer for sensitive operational scenarios. Remove arm labels from artifacts. Train raters on anchored examples outside the evaluation set; record inter-rater agreement and adjudications. Acknowledge that style may reveal an arm despite blinding. Measure task completion/errors, interaction count where meaningful, critical failures, and the eight dimension ratings. Keep machine and human results separate.

Report paired differences by scenario, medians/distributions and uncertainty, with failed runs retained. Cluster resampling by scenario/run rather than treating every screenshot as an independent participant. A 63-session pilot is too small to support broad superiority claims across all industries/models. Human usability claims require actual participant studies beyond expert ratings.

Proposed adoption gate: no new critical access/task failures; legacy behavior compatibility passes; held-out required-coverage accounting reaches 100% including explicit gaps; selected conflict explanations are valid; and blinded component/domain ratings improve without brand/responsive regression. Set numeric relevance/performance thresholds before the sealed test; a suggested initial target is macro Recall@10 ≥0.85 and inappropriate recommendation rate ≤0.05. These are targets, not current results. If C improves packet retrieval but not interface quality, revise workflow/content rather than increasing catalog size automatically.

Use ablations: C without domain overlay; C without component contracts; C without coverage allocation; C without visual review. These separate knowledge retrieval, context packaging and agent-review effects. Perform ablations after the pilot identifies useful signal; they are not all prerequisites for the first narrow implementation.

## Mission validation

On 2026-10-28, ran `pnpm exec vitest run packages/core/test packages/knowledge/test` using existing dependencies: **22 tests passed across 5 files**. Observed legacy benchmark: **Recall@5=0.941, MRR@10=0.969**. No install, catalog change, runtime edit, or enhanced implementation occurred.

The full `pnpm check` was intentionally not run: its build/integration path includes temporary package installation, which conflicts with this mission's no-dependency-install constraint. This focused result does not claim CLI/installer regression revalidation. Documentation validation passed for **9 Markdown documents, 25 local links, and 3 JSON examples**; expected deliverables and trailing whitespace were checked. `git diff --check` passed and `git status --short` showed only the new mission documentation directory. No comparative agent sessions, browser measurements or aesthetic scores were produced for this mission.

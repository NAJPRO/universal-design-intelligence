# Mission 013 — Design direction and experience intelligence

Date: 2026-11-02. Initial audit and architecture proposal recorded before implementation.

## Initial audit

The existing 17 legacy profiles contain five prose direction fields. Their original
color/type/layout advice is useful but does not specify an inspectable decision
contract, alternatives or a visual critique vocabulary. Legacy search indexes rules;
it cannot search profiles or retrieve structured motion guidance. Schema 2.1 adds
three components and one operational composition, not art direction. Full contracts
are progressively disclosed by `inspect`. Context 2.0 already distinguishes evidence,
application/tasks/roles, framework, brand preservation and constraints; a replacement
context or component family is unnecessary.

### Mission 012 composition diagnosis

`packages/core/src/components.ts:plan` requires the composition's own task match in
addition to eligible application and collection/filter dependencies. Its four task
terms are `manage`, `review`, `administration`, `operations`. Both retained agent
contexts use `consult and compare inventory products`, `search and filter products`,
and `edit product form` instead. Neither asks explicitly for the composition.
Their successful packets (B 24,387 bytes, C 24,176 bytes) contain all three components
but no composition coverage record. The composition is absent before ranking and
packing, not lost to expansion/budget. Role terms cannot authorize it. The skill
correctly says to inspect selected IDs, so the absent candidate is not naturally
discovered. This is a task-vocabulary discovery gap plus underspecified composition
disclosure, not proof of an agent's refusal to use a returned composition.

Mission 010 exercised the operational composition with a different context; Mission
011 has extensive page-level structure/responsiveness within the same contract.
Mission 012 demonstrates successful retrieval and sampled functionality, mixed
blinded visual findings and C's 900-second reporting failure. None establishes that
more rules, animation, or packets alone improve aesthetics or causal effectiveness.

### Cost and compatibility constraints

The 2.1 pipeline validates the component catalog, constructs the 2.0 recommendation
and constructs another knowledge index; a projection such as `retrieveComponentSpecs`
still calls that complete path. Do not duplicate it for a visual-direction command.
Current packets approach the 24,576-byte ceiling; adding long art-direction records
there would displace existing guidance. Metadata commands use lazy imports. The
CLI bundles everything for offline use; skill packaging/tests currently expect
three canonical skill assets. Existing default 1.0 and explicit 2.0 packet bytes
must remain identical. Runtime/development package versions remain unchanged.

## Architecture proposal — selected vertical slice

1. Add isolated, original MIT structured knowledge for six contextual visual
   directions, a ten-action motion vocabulary and eleven critique dimensions.
   Each direction makes composition, typography, color/contrast, density, trust,
   responsive and avoidance decisions actionable, without fixed templates or fonts.
2. Add an opt-in `udi direct --context <context-2.0.json>` command with explicit
   character/interaction/query overrides. It selects one direction with evidence,
   offers inspectable motion only for evidenced or explicitly requested interactions,
   and returns a small bounded decision packet. This independent versioned contract
   leaves recommendation schemas 1.0/2.0/2.1 intact. No remote model or new dependency.
3. Reuse and improve the existing composition gate: in operational applications,
   compare/consult tasks qualify only when both collection and filter evidence
   independently qualify. Retain no-composition negatives for marketing/single-form
   contexts and explicit-name-only requests. Do not create a duplicate composition.
4. Make new knowledge searchable through the direction command's query and
   inspectable by stable IDs, preserving old inspection behavior. Keep the compact
   critique checklist in a reference already shipped; full indicators on demand.
5. Update the canonical workflow: context → concise direction → composition and
   targeted components → implementation → inspect/critique/refine → report. Probe
   capabilities once, avoid redundant calls and reserve validation/reporting time.
6. Build an original fictional print-studio workshop interface from saved actual
   retrieval. Use a page-level editorial direction, local fonts, a restrained ink/
   paper/accent palette, purposeful feedback, reduced motion and responsive layout.
   Verify with the already installed Chrome/CDP, without copying historical apps.

The engine proposes decisions and review indicators. Rendered hierarchy,
distinctiveness, emotional response and perceived trust still require contextual
agent/human judgment; no automatic beauty or trust score will be emitted.

## Validation plan

Record pre-change v1/v2 CLI hashes, label deterministic selection cases, validate
record schemas/references, test motion negatives and brand/constraint handling,
enforce a direction-packet byte bound, and run current lint/types/tests/build plus
offline package checks. Keep frozen Missions 010–012 byte-identical. Browser checks
cover 320/375/768/1440, keyboard, overflow, feedback/loading and reduced motion.
Retain compact essential observations and retrieval evidence; generated PNGs and
profiles are local ignored artifacts. No agent comparison is claimed: delegation
is unavailable under this session's instructions, and a controller-authored demo
cannot establish superiority over a no-skill agent.

## Implemented capabilities

- Added isolated `@udi/knowledge/experience` and `@udi/core/experience` subpaths.
  Six original direction records specify focal point, sequence, grouping, density,
  responsive organization, display/body/numeric type and color/surface/trust roles.
- Added ten full motion records: feedback, press, focus/selection, disclosure,
  modal/drawer, progress, list/layout, entrance, navigation and scroll. Each states
  its purpose, moving/stable elements, bounded timing/easing, accessibility,
  reduced-motion fallback, performance advice and avoidance criteria. Timings are
  original editorial suggestions, not normative requirements or measured optima.
- Added eleven separate quality dimensions with positive/negative indicators,
  revision suggestions and explicit measurable-failure versus review distinctions.
  No aggregate quality, beauty, emotional-response or trust score is computed.
- Added lazy `udi direct --context <file>` and DIR/MOT/QUA inspection. Context 2.0
  remains unchanged. Explicit character preferences, declared lexical terms and
  application applicability select one inspectable direction. Query matches aid
  discovery without authorizing decorative interactions. Existing brand/system
  and must/prefer color/density constraints bind proposals; conflicting must values
  fail rather than silently choosing. Sparse context is labeled an assumption.
- Motion selection requires task or explicit interaction evidence; industry/roles/
  query alone do not select it. Scroll/entrance additionally require explicit intent
  and an editorial/marketing application. Recognized required no-motion values
  suppress motion; every record retains reduced-motion instructions.
- `direct` defaults to **8,192 bytes including newline**, one complete direction,
  at most two complete motion records, eleven review IDs and omitted-motion IDs.
  Tight budgets omit whole motion records transparently; insufficient base budgets
  fail without partial JSON. Full inspection is intentionally outside packet bounds.
- The existing operational composition now recognizes consult/compare tasks, still
  gated by compatible application plus independently evidenced collection/filter
  dependencies. Explicit-name-only, marketing and single-form negatives remain.
  Current replay of the exact old Mission 012 C context returns **all four** existing
  specifications in 24,246 bytes. This fixes candidate discovery, not the historical
  recorded run. Component engine revision is experimental.3; package versions and
  default 1.0/explicit 2.0 contracts are unchanged. Old 2.1 expansion cursors correctly
  become stale under the new engine revision.
- Canonical skill/references now guide context → direction → relevant composition/
  components → implement → inspect → separate critique → one focused revision →
  report. They reserve roughly the final quarter for verification/reporting, use
  capability checks, and avoid repeated probes/catalog dumps. Existing packaging
  keeps the same three skill assets, with no dependency or installer change.

The independent direction contract uses its own `schemaVersion: 1.0` and
`engine: udi-direction-deterministic`; it is not legacy recommendation schema 1.0.
Examples:

```sh
node packages/cli/dist/index.js direct --context benchmarks/mission013/protocol/context.json --character editorial --interactions press,feedback --json
node packages/cli/dist/index.js direct --context benchmarks/mission013/protocol/context.json --query 'disclosure reduced motion' --json
node packages/cli/dist/index.js inspect DIR-EDITORIAL --json
node packages/cli/dist/index.js inspect MOT-DISCLOSURE --json
node packages/cli/dist/index.js inspect QUA-COMPOSITION --json
```

## Practical evidence

The [original demonstration](../benchmarks/mission013/README.md), Morrow Print Room,
uses a fictional workshop programme, original HTML/CSS/JS/SVG, local Georgia/sans
fallbacks and no external assets. It does not reuse an inventory benchmark. Actual
CLI responses were saved before implementation: editorial direction plus press/
feedback records, a separately inspected disclosure record and composition critique.
The supplied fictional paper/ink/vermilion brand is preserved rather than invented
by the engine. The guide packet is **7,743 bytes**; extra disclosure was explicitly
listed as omitted and fetched only when needed.

The interface uses one strong editorial focal idea and print artifact, practical
programme rows, complete selected values, native disclosure, radio/press feedback,
real local IndexedDB pending/completion/error states and an explicit deletion path.
The result accurately says no request was sent and no place was reserved. Keyboard
focus and status are not represented solely by motion/color; spatial transitions
and the pending loop disappear under reduced motion, retaining textual feedback.

The installed Chrome CDP harness captured **13 native viewport PNGs** and recorded
**42/42 sampled assertions** at 320, 375, 768 and 1440 plus reduced-motion emulation.
Checks cover horizontal overflow/control reach, control names, keyboard radio
selection and action focus, retained invalid choices, stable pending-button geometry,
honest completion, deletion/focus return, reduced-motion parity, injected storage-
denial recovery/retry and declared token contrast pairs. The controller visually
inspected desktop/320px openings and the 375px saved state. PNGs/profiles/logs are
ignored local artifacts; compact results, source/capture hashes and retrieved
knowledge are deliberately retained as essential reproducibility evidence.

Observed color-pair ratios are recorded in `browser-results.json`; these limited
checks are not a complete accessibility audit. The small print captions/metadata
warrant further readability review. Pending state is inspected during a real local
write; it is not artificially extended to obtain a loading screenshot. Only action
geometry is sampled for stability, not whole-session cumulative layout shift.
No screen-reader, physical touch, zoom, cross-browser or independent blinded/user
study was performed. This controller-authored interface establishes usable
integration of retrieved guidance, **not a visual win over a no-UDI agent**.

## Validation and cost

Evidence lives under `benchmarks/mission013/evidence/`:

- New deterministic tests: **16/16 passed** across direction selection, knowledge
  schemas/ranges/completeness, motion negatives and explicit needs, brand/required
  constraints, byte accounting/errors, determinism, isolated inspection, actual
  Mission 012 task formulations and CLI success/error behavior.
- Standard `pnpm check`: lint/types/build passed; **195/197 tests passed**. Existing
  CLI tarball test hit 15s and existing component CLI test hit 5s. These failures
  remain reported; previous missions had concurrent timing failures on this host.
  No cause or successful standard suite is inferred from that history.
- A full sequential retry was requested but **not executed**: the automatic
  authorization-review service reached its usage limit. This is an infrastructure
  limit, not a determination that the command is unsafe. No bypass was attempted.
  Re-run when normal subprocess authorization is available:
  `pnpm exec vitest run packages/cli/test packages/core/test packages/knowledge/test --no-file-parallelism`.
- **1,003/1,003 prior file hashes match**; no frozen Mission 010/011/012/pilot inputs,
  results, source or raw run evidence changed. Two pre-change v1/v2 output hashes
  match byte-for-byte. Existing wider compatibility/lazy-load/offline-package/
  immutable-installation tests passed except the two explicit timing failures.
- Five alternating fresh-process samples measured direction **154.2 ms median**
  versus component recommendation **254.4 ms median**, on one host with warm file
  caches. These are different commands/outputs, not a causal before/after speedup.
  Direction avoids building the component retrieval pipeline; it does not replace
  component/domain/task-coverage diagnostics. Cost evidence includes raw samples.
- Bundle: 1,307,354 bytes / 228,068 gzip bytes, versus frozen pre-mission C runtime
  1,266,969 / 215,329: **40,385 raw / 12,739 compressed bytes added**. No dependency,
  external API or package version was added. Library exports remain isolated and
  CLI metadata does not eagerly initialize new knowledge.

## Before / after and remaining weaknesses

| Before | After |
| --- | --- |
| Five broad profile prose fields | Inspectable direction choices for composition, type, color, density, trust and responsive changes |
| Motion priorities scattered across rules | Ten structured purpose/accessibility/performance-aware interactions, gated progressive disclosure |
| Generic visual checklist | Eleven separate, inspectable critique dimensions with measured-vs-subjective boundaries |
| Mission 012 consult/compare context misses composition | Same context surfaces existing composition and its three components |
| Agent workflow begins with large component packet | Optional compact direction first, targeted contracts and explicit report budget |
| Mixed historical visual findings | Original functioning browser demo; comparative superiority still unproved |

Selection remains a declared English lexical heuristic, not semantic design
understanding. Complex negation, multilingual paraphrases and unresolved contextual
style preferences can need an agent/human. The engine proposes visual character,
not arbitrary CSS, exact palettes or a template. It cannot prove readability for
all font/platform combinations, emotional impact, user trust or memorability.
Authored knowledge has structural/author review, with independent design review
pending. The full standard test gate still has the two timing failures above;
sequential confirmation remains outstanding because of the review-service limit.
Future randomized independent comparisons, runtime profiling/index reuse and a
larger reviewed direction corpus are proposals, not completed work. No delegation,
paid agent execution, publication, Git write or Mission 014 was performed.

## Attribution and hygiene

All new guidance, demo copy/data and vector art are original UDI material under
MIT. Numeric contrast/reduced-motion references were checked against
[WCAG 2.2](https://www.w3.org/TR/WCAG22/) and
[Technique C39](https://www.w3.org/WAI/WCAG22/Techniques/css/C39).
The [W3C document license](https://www.w3.org/copyright/document-license-2023/)
was reviewed; standards prose/assets were not copied into this catalog. Original
editorial records carry source/author-review/license metadata and reference links.
The timing ranges are advisory UDI synthesis, not copied standards requirements.

No Git state changed. No tool/dependency was installed. New benchmark ignore rules
scope screenshots, Chrome profiles and local execution logs; protocols, original
demo source, actual retrieval packets and compact validation records stay visible.


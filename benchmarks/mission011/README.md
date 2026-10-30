# Mission 011 — reproducible responsive/scroll validation

Original UDI/MIT fictional fixture, no application dependencies, remote assets or user projects. See [initial audit](../../docs/MISSION-011-AUDIT.md) and [report](../../docs/MISSION-011.md).

## What is compared

1. **Actual retrieval:** frozen pre-mission CLI (`baseline/udi.mjs`) versus the built post-mission CLI; identical task context and commands, repeated outputs checked for determinism. `baseline/components.json` records parsed original contracts, `baseline/component-records.ts` their original source, and `baseline/design-quality.md` the original quality reference. The private package.json supplies the version metadata expected by the frozen bundle, without dependencies or an install step. Do not use this partial baseline bundle for installation/doctor commands.
2. **Rendered reference implementations:** `fixture/before/` is an unchanged COPY of the original Mission 010 C app; `fixture/after/` is a controller-authored adaptation using the same data/tokens and flows. The narrow default prioritizes individual records; explicit comparison remains available. This is **not independent agent generation or a causal experiment**. The controller knows the intended changes. No claims of aesthetic superiority or improved autonomous agent behavior follow from it.
3. **Scroll laboratory:** `fixture/lab.html` exercises local navigation/carousel tracks, wrapping chips and native-scrollbar comparison. Fault parameters inject page overflow, critical clipping, missing cues/alternatives and nested owners. It is not a production component library or a new UDI family.

Frozen task/criteria are in `protocol/task.md`. `evidence/frozen-inputs.json` hashes fixture/baseline/protocol files. `evidence/mission010-before.json` protects every original Mission 010 file. Neither verification nor rendering writes there.

## Run from the UDI root

Recorded environment: Node 22.23.1, pnpm 12.11.2, Chrome 156.0.8078.47 on Linux. Browser version details appear in browser-results.json. No downloads are performed by this harness. Dependencies already in the repository cache are sufficient:

```sh
pnpm install --offline --frozen-lockfile
pnpm check
node benchmarks/mission011/compare-retrieval.mjs
node benchmarks/mission011/render.mjs
node benchmarks/mission011/verify.mjs
# Optional contact sheets, only with an existing Pillow installation:
python3 benchmarks/mission011/review.py
```

`pnpm check` builds the final runtime. Local CLI subprocesses, HTTP and Chrome require the normal authorized sandbox escalation on hosts that deny them; record unavailable validation if escalation is unavailable. The initial restricted check log records EPERM failures; the escalated final log records the actual passing suite.

The scripts overwrite Mission 011 controller evidence. Preserve the existing evidence before rerunning a different environment. Do not regenerate baseline from the current runtime. `update-contracts.py` and `author-after.py` are authoring records for the retained files, not commands needed to evaluate or install UDI; editing frozen fixtures creates a new experiment.

## Evidence and interpretation

- `retrieval-comparison.json` and `retrieval/before|after/`: exact commands, runtime hashes, original packet/spec JSON, repeatability and sizes. Default 1.0 and explicit 2.0 must be byte-identical; 2.1 intentionally changes guidance/version/cursor with the revised content.
- `browser-results.json`: 40 paired viewport captures, per-capture observations/findings, task checks, laboratory fault classifications and five lab screenshots. Original PNGs retain native CSS/DPR dimensions. `review/` holds scaled comparison aids only.
- Widths 375, 768, 1440 at height 1000; six states per arm (populated/empty/error/loading/edit/explicit comparison) plus editing at 375×500 and 375×320. Short-height shots follow bringing Cancel and Save into view, so initial scroll position can differ. 320px **height** is not a 320px reflow-width/zoom test or a real virtual keyboard.
- Action travel measures how far an essential action exceeds the horizontal viewport at scroll origin; vertical page scrolling is allowed. It is not task completion time or an aesthetic score. Both reference apps retain all data through comparison/summary details.
- `assess.mjs` is a benchmark-only evidence classifier, used by repository tests. Confirmed failures require declared scope and direct measurements. Nested owners, incomplete discovery/hidden-track operation and BODY focus stops remain warnings. A missing scrollbar alone is never a defect or a success. Concealed tracks need verified controls, keyboard and touch evidence; the lab remains a review case where touch is unverified.
- Keyboard detail activation uses native Space; CDP Enter without its character event did not activate the native disclosure in an earlier harness run. This was a harness correction, not an application change.
- Simulated touch gestures did **not** move either comparison table on this host. These checks remain false and are a missing validation, not a confirmed touchscreen defect. Keyboard scrolling passed. Real touch devices, assistive technology, screen-reader focus/announcements, zoom/320px width, actual OS keyboards and other browsers remain untested.
- The before native modal has a transient BODY focus stop during repeated Tab; it is a warning rather than proof that background controls are interactive. The after fixture uses explicit boundary wrapping. Preserve this distinction when interpreting check totals.

The benchmark can show that specific hand-authored adaptations improve action access and remove redundant empty-state scroll regions in these fixtures. It does not show that a fresh agent will make those choices from the new contracts. Run a separately isolated, budget-instrumented same-model before/after agent experiment before making that claim.

The final resize test explicitly selects a visible record action; selecting the first DOM match had targeted a hidden alternate representation. A pre-final identity-preservation refinement is recorded in `evidence/fixture-revision.json`, including old/final fixture hashes. The initial false check alone was not proof of an application defect.

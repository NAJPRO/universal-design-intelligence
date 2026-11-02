# Mission 010 controlled agent benchmark

This is an original MIT fictional product administration benchmark. It uses **native HTML/CSS/JavaScript modules**, 12 fixed synthetic products, original CSS tokens, system fonts, and **zero application dependencies or external assets**. No user projects are involved. It is intentionally small enough for an offline static server. It does not replace the separate planned Next.js example.

Read [the mission report](../../docs/MISSION-010.md) for evaluation and limitations. Do not show completed runs or this evaluation to a new implementing agent.

## Frozen inputs and outputs

- `fixture/`: identical application starting files.
- `protocol/task.md`: common implementation task and budget; `protocol/rubric.json`: criteria and capture settings frozen before implementation.
- `protocol/legacy-skill/`: canonical skill captured before this mission's edits.
- `protocol/enhanced-skill/`: exact skill supplied to C, also verified against C's starting hashes. Never update snapshots when the canonical skill changes.
- `evidence/frozen-inputs.json`, `environment.json`: SHA-256 inputs/runtime/lockfile hashes and tool versions. The framework has no packages to resolve. Repository pnpm dependencies remain pinned by its lockfile.
- `runs/A|B|C/START.json`: exact starting file hashes, including assigned launcher and skill; finished source, evidence reports and private review artifacts remain in each arm.
- `evidence/invocations.json`: runner, inherited model settings, condition-specific routing, budget and isolation limits. `runs/B|C/commands.jsonl` records actual UDI invocation arguments/timestamps. `evidence/retrieval/` contains explicitly labeled controller replays, not fabricated original transcripts.
- `evidence/integrity.json`: verifies frozen inputs, identical application starts, unchanged data/tokens/skills and final run file hashes.

## Reproduce

Use Node **22.23.1**, pnpm **12.11.2**, and Chrome **156.0.8078.47** for the recorded environment. Browser binaries are not vendored; other browser versions can change pixels. Commands below run from repository root; no Git operations or application installation are needed.

```sh
pnpm install --offline --frozen-lockfile
pnpm build
# Existing runs are protected; create a NEW single directory name.
python3 tests/mission010/prepare.py --set rerun-01
```

`prepare.py` refuses existing arm destinations. It uses the frozen skills and creates wrappers that log arguments and invoke the repository's built CLI, with no global installation. Confirm that the CLI bundle hash matches `evidence/environment.json` before comparing with the recorded run; rebuilding a later runtime is a new experiment. The original launcher did not explicitly detect sandbox `spawnSync.error`; preparation now reports those errors. Exact original launcher bytes remain hashed in START.json.

Start three fresh contexts of the **same coding agent/model/reasoning setting**, no inherited conversation, same tools, with only `protocol/task.md` and the respective arm directory. Use the common prompt constraints in `evidence/invocations.json`. Assign:

- **A:** no design skill; explicitly exclude all globally listed skills and UDI commands.
- **B:** read `skill/SKILL.md`; use only its legacy recommend/search commands.
- **C:** read `skill/SKILL.md`; follow capability probing, enhanced recommendation and selective inspection.

In all arms forbid reading siblings, repository docs/evaluation, other skills or external context; write only inside the assigned arm. Apply the same 12-minute, 12,000-output-token, two-pass maximum. Record runner invocation IDs, exact model identifier/token usage if your runner exposes them, elapsed time, commands, applied IDs/decisions, unsupported requirements and checks. The recorded runner exposed no model revision or hard token cap; do not imply exact token equality. Skill routing here is explicit; automatic host discovery is a separate experiment.

Prefer stronger per-run filesystem isolation when a runner supports it. The recorded fresh contexts/directories used prompt restrictions on a shared filesystem, not an access-control boundary. Never pass one run's design or feedback to another. Freeze all implementations before common evaluation, even when incomplete. Retain failed runs.

## Evaluate the preserved runs

```sh
node tests/mission010/verify.mjs
node tests/mission010/capture.mjs
node tests/mission010/interactions.mjs
node tests/mission010/details.mjs
node tests/mission010/replay-retrieval.mjs
# Optional review sheets only; uses an existing Python Pillow installation.
python3 tests/mission010/review-sheets.py
# AFTER all agents/builds/browser work finish, run timing alone:
node tests/mission010/performance.mjs
node tests/mission010/trace.mjs
```

These commands overwrite controller evidence artifacts; preserve a copy for a fresh experiment. The scripts evaluate `runs/` by default. For new runs prefix commands with `UDI_BENCH_SET=rerun-01 UDI_BENCH_EVIDENCE=evidence-rerun-01` to evaluate the new set and store results separately (for review sheets, only the evidence variable is needed). `browser.mjs` creates a loopback-only HTTP server and temporary Chrome profile beside the harness and cleans both up. It does not install a browser or download assets. Environments that deny loopback/process launch need their normal authorized sandbox escalation; if unavailable, record missing validation. Chrome's `--no-sandbox` is confined to these trusted local fictional files.

`capture.mjs` records **45 actual viewport screenshots**: 3 arms × 3 widths (375/768/1440 CSS px) × 5 states, height 1000, DPR 1. Original PNGs retain native dimensions. `details.mjs` records another **9 mobile screenshots** of collapsed active filters, invalid editing and discard handling. A/B browser confirmation dialogs are captured as CDP events; their page PNGs show the editor after declining confirmation, not the native browser prompt. C's custom discard dialog is in the page screenshot. Contact sheets are scaled review aids, not original captures.

Review actual images and task flows against the frozen rubric, dimension by dimension. Automated assertions do not establish aesthetic excellence or accessibility conformance. `interactions.mjs` adapts only selectors, not task expectations. Native dialog Tab can pass through BODY without focusing an interactive background control; use `details.json` to interpret that assertion failure accurately. Only first viewport images are captured; full-page/scroll-position, real touch, assistive technology, cross-browser and virtual-keyboard testing remain additional work.

The performance fixture expands **legacy rules only** to 80/320/1280 with valid synthetic IDs; profiles/patterns/component pack stay fixed. It measures warm API calls, standalone validation/index phases and fresh-process CLI calls. Each output is hash-checked for repetition. It is a synthetic scaling experiment, not evidence of improved retrieval quality. `trace-loader.mjs` logs constructor/validation entries in memory in a separate process; it changes no source/build files and is not active during timings.

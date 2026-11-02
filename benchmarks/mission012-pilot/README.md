# Invalid pilot — excluded from Mission 012 effectiveness conclusions

See [the failure record](evidence/INVALID-EXPERIMENT.md) and [corrected primary experiment](../mission012/README.md). All pilot artifacts below are retained; they are not successful UDI comparisons.

# Mission 012 — Independent agent validation

Original fictional MIT-compatible Tern Works inventory, plain HTML/CSS/JavaScript, no dependencies or remote assets. No external user project is used. This experiment tests actual independent `codex exec` processes, rather than controller implementations. See [the report](../../docs/MISSION-012.md) for outcomes and missing validation.

## Frozen inputs

`fixture/`, `protocol/` and `inputs/A|B|C/` are SHA-256 inventoried in `evidence/frozen.json` before any implementation. A has no UDI. B has the Mission 010 enhanced skill and pre-Mission-011 bundled runtime; C has the current canonical skill/runtime. Each has the same original application, data, tokens, task and capture tool. The only condition-specific files are skill/runtime/catalog metadata. Runtime development versions are not changed or published. B/C launcher wrappers log exact command arguments/results without altering retrieval content.

The rubric/settings are held outside implementing agents' mounts. AGENTS.md advertises skill metadata for B/C; whether the agent opens/invokes it is measured rather than guaranteed. This is project-catalog-assisted discovery, not proof of every host's implicit skill discovery mechanism.

## Execution and isolation

Requires existing Node 22+, Codex CLI 0.164.0, Linux bubblewrap/user namespaces, Chrome 156.0.8078.47 and existing Codex authentication. No dependencies are installed in a user project. The invocation ignores user config/rules, has empty per-run HOME/CODEX_HOME, disables web search and delegation, and mounts only that run as `/work`. PID/IPC/filesystem namespaces hide sibling runs, the repository and previous results; read-only bindings protect input data, tools and condition resources. Isolation probes are retained. Network remains available for the model API; this is filesystem isolation, not a hostile-network security evaluation. No Git directory is mounted. Host authentication is mounted read-only, never copied into evidence; do not distribute credentials.

Model gpt-6.1-sol, medium effort, identical hard 900-second wall ceilings and soft 720-second target. Actual token usage and elapsed times are recorded; there is no enforced equal token cap, deterministic sampling seed or guarantee of equal backend load. No controller correction or continuation is provided to implementing agents. Shell commands and failed verification attempts are retained in raw JSONL and command summaries.

## Reproduction

The duplicate `runs/` tree is local generated state. On a fresh checkout, restore
it offline from retained `sources/`, frozen `inputs/` and evidence before running
verification (this never overwrites changed files):

```sh
python3 scripts/restore-benchmark-runs.py
python3 scripts/restore-benchmark-runs.py --check
```

See the [repository hygiene audit](../../docs/REPOSITORY-HYGIENE-AUDIT.md)
for tracking policy and the pre-existing Mission 010 archive gap.

Do not rerun authoring commands over retained evidence. Copy the complete benchmark to a fresh **repository-local experiment directory**, omit runs/inputs/sources/evidence from the copy, recreate an empty evidence directory and preserve the existing protocol. `prepare.py` intentionally refuses an already frozen experiment. It resolves baseline assets relative to the UDI repository, so retain the same two-level benchmark directory layout. Use a compatible current build whose hash matches the frozen C runtime if reproducing these exact inputs.

```sh
pnpm build
python3 benchmarks/<new-experiment>/prepare.py
# Run independently; concurrent starts reduce order/backend drift:
python3 benchmarks/<new-experiment>/run.py A
python3 benchmarks/<new-experiment>/run.py B
python3 benchmarks/<new-experiment>/run.py C
# Only after every process has finished:
python3 benchmarks/<new-experiment>/summarize.py
node benchmarks/<new-experiment>/evaluate.mjs
python3 benchmarks/<new-experiment>/verify.py
```

Run processes with normal sandbox authorization when this host restricts subprocesses, namespaces, local HTTP or Chrome. The runner uses externally sandboxed Codex execution; never remove the namespace wrapper to compensate for unavailable isolation. If agent execution cannot run, retain the failed attempt and report incomplete comparison. Do not replace outputs with controller code. No baseline or generated application is repaired after submission.

## Evidence

- Per-arm `invocation.json`, `isolation.json`, `execution.json`, `events.jsonl`, `stderr.log`, `command-events.json`, UDI logs where present and `source.patch`.
- `sources/` is the immutable copied submission used for browser evaluation; hashes are retained in `final-sources.json`. `runs/` includes raw self-review artifacts. Agents never see the controller's measurement output.
- `browser-results.json` and native screenshots: 320/375/768/1440 × 1000, populated/empty/loading/error/edit; plus reduced-height editing. Hooks assist automation but do not establish task or aesthetic success. Harness limitations remain distinct from demonstrated product failures.
- Comparison separates retrieval, applied decisions, functional checks, responsive measurements and visual judgments. One generation per condition cannot establish statistical superiority. Physical touch, assistive technology and cross-browser conformance require separate validation.

Source material is original UDI/MIT. Prior Mission 010/011 trees are inventoried and verified without changes. Actual execution needs network access to the selected coding model, whereas UDI recommendation retrieval remains offline and deterministic.

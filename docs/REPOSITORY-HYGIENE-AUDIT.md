# Repository hygiene audit

Date: 2026-11-02. Scope: the entire local UDI repository, including hidden paths and historical experiments.

## 1. Initial state and authorization

The index and working tree were clean (`git status --short` and staged diff empty).
There were **948 tracked files, 45,464,975 bytes**. No initial user edits or staged
changes were replaced. Node 22.23.1 and pnpm 12.11.2 were already installed.
No workspace dependencies were installed and no tools were downloaded. Existing
integration tests perform isolated offline installs of locally packed UDI tarballs.

The attached mission requested index-only removals. Automatic approval review
initially rejected that operation because `AGENTS.md` reserves Git state changes
for the owner. The owner subsequently explicitly authorized the exact two-directory
`git rm -r --cached` operation in chat, overriding that restriction for these
removals. It then succeeded. No other Git write operations were performed; no
commits, publication, remote operations, deletion of local evidence or history
rewriting occurred.

## 2. Methodology and coverage

Inventoried every `git ls-files` entry and its byte count, SHA-256, extension and
filesystem type; examined the complete directory tree, including ignored and
hidden paths. Dependency/build internals were counted separately. Read all four
initial ignore files, workspace/package manifests, build scripts, test references,
benchmark preparation/summarization/verification code, architecture, progress and
contribution guidance. Compared every proposed removal with a retained asset.
Scanned text for credential patterns and private filesystem paths without printing
matched values. Used only local content and installed tools.

Initial tracked coverage:

| Category | Files | Bytes | Decision |
| --- | ---: | ---: | --- |
| Root metadata/configuration, CI | 14 | 81,086 | KEEP TRACKED |
| `packages/cli` | 17 | 143,200 | KEEP TRACKED: source, tests, scripts, notices, package metadata |
| `packages/core` | 18 | 110,540 | KEEP TRACKED: deterministic retrieval and tests |
| `packages/knowledge` | 18 | 209,404 | KEEP TRACKED: original catalogs, schemas, validation and tests |
| `skills/udi-design` | 3 | 14,432 | KEEP TRACKED: canonical skill and references |
| `tests/` already tracked | 23 | 66,198 | KEEP TRACKED: Missions 008, 008.1, 009 and strategy |
| `benchmarks/mission011` | 118 | 7,308,291 | KEEP TRACKED: baseline, fixtures, harness and historical evidence |
| `benchmarks/mission012-pilot` | 322 | 15,160,641 | REMOVE 89 duplicate run entries; retain the invalid-pilot record |
| `benchmarks/mission012` | 381 | 21,986,966 | REMOVE 88 duplicate run entries; retain frozen inputs/submissions/evidence |
| `docs/` | 33 | 384,072 | KEEP TRACKED: architecture, missions, research and measurements |
| `examples/` | 1 | 145 | KEEP TRACKED: scope documentation |

All 948 entries are covered by these categories. Tracked extensions included 349
PNGs, 150 JSON, 128 Markdown, 96 MJS, 45 JS, 44 CSS, 41 TS, 23 HTML, 16 Python,
16 logs, 16 JSONL, 12 without an extension, six patches, two YAML, two CJS, one YML
and one SHA-256 file. PNGs are experimental captures/review aids. The only tracked
symlink was the pilot Chrome launcher, and the only two executable regular files
were pilot browser wrappers; all three are included in the duplicate-run manifest.
No tracked browser executable binary, tarball, dependency tree, package build
output, `.env` credential file or root local runtime store was found.

Hidden `.agents`, `.codex` and `.aws` root directories contain no files. Frozen
benchmark `.agents`/`.udi` inputs are deliberately retained. The CLI build bundles
into `packages/cli/dist/index.js` and copies the three canonical skill files;
core/knowledge compile to their package `dist/` directories. Those generated
outputs and the existing CLI tarball were already untracked.

## 3. Tracking problems found

- Root `tests/` ignore hid **182 existing Mission 010 files (8,804,987 bytes)**,
  including the enhanced-skill baseline consumed by Mission 012 preparation.
  These were never indexed in the initial snapshot, despite documentation and
  later integrity manifests referring to them. Removed the broad ignore rule.
  The files are now visible as untracked; this audit did not stage additions.
- Both Mission 012 `runs/` trees duplicated archived submissions, input runtime
  installations and invocation logs. Removed only these verified copies.
- The root `dist/` rule was broader than the actual workspace build paths, and the
  tarball rule hard-coded a single version. Replaced with scoped package rules.
- Local runtime/session/security-sensitive paths and common caches lacked explicit
  rules. Added precise rules while preserving canonical and frozen skill assets.

Initial byte-identical analysis found **164 duplicate groups**, comprising 378
extra file instances and 17,691,694 repeated bytes. Repeated bytes are a working-tree
measure, not unique Git storage. Categories include run/source copies, frozen
runtime bundles, fixture starting data/tokens, protocol/skill snapshots, replay
compatibility outputs, and screenshots/contact or blinded review copies. Only
unambiguous redundant run trees were removed; shared hashes alone are not grounds
to remove condition-specific or historically referenced evidence.

## 4. Completed index cleanup and restoration

Executed, with explicit owner authorization:

```sh
git rm -r --cached -- benchmarks/mission012/runs benchmarks/mission012-pilot/runs
```

**177 entries and 9,511,934 bytes** left the index. Every local path remains and
matches its pre-audit content or original symlink target. No filesystem deletion
was used on repository files.

The exhaustive per-file classification, retained source, content checksum and
original Git mode are in [`scripts/benchmark-run-copies.json`](../scripts/benchmark-run-copies.json).
Every entry in that manifest is classified **REMOVE FROM GIT TRACKING**:

- Non-hidden run files map byte-for-byte to the corresponding retained `sources/`.
- Hidden `.agents/` and `.udi/` files map to the exact frozen condition `inputs/`.
- `.udi-logs/commands.jsonl` maps to the retained arm's `evidence/udi-commands.jsonl`.
- The pilot Chrome symlink's target is recorded separately; the retained source
  is its archived launcher content. Restoration recreates link metadata without
  executing it. The external Chrome installation remains a documented prerequisite.

Restore a fresh checkout before running benchmark integrity scripts:

```sh
python3 scripts/restore-benchmark-runs.py
python3 scripts/restore-benchmark-runs.py --check
```

The helper requires no Git, network, install or current build. It checks every
retained checksum and preflights every destination before writing missing copies.
It refuses changed files and symlink parents, preserves executable modes and is
repeatable. Both Mission 012 READMEs document this prerequisite. Frozen inputs,
source submissions, original hash inventories and experimental criteria were not
rewritten. The helper does not rerun agents or claim a new scientific replication.

## 5. Ignore policy and verification

Root policy now covers workspace package builds/tarballs, dependencies, validation
caches, Python caches, environment values (with example exceptions), root local UDI
runtime storage, Codex sessions/log/authentication, AWS credential/cache paths,
package-manager debug logs, and editor/OS scratch files. It no longer hides tests
or arbitrary directories named `dist`. No blanket `docs`, `skills`, `benchmarks`,
`.agents` or `.udi` rule was added. All existing ignore files were reviewed;
Mission 010 and Mission 011 files remain unchanged to preserve historical hashes.
The two Mission 012 nested files now ignore only disposable Chrome profiles,
isolated evidence homes and their own `/runs/` copies; redundant cache rules were
removed because the root covers them.

`git check-ignore -v --no-index` verified representative paths for all these major
categories. Tests/fixtures, canonical skills, frozen input runtimes, archived
submissions and the Mission 011 baseline remain visible. Environment examples
match an explicit negation. `git ls-files -ci --exclude-standard` is now empty.

There are **6,433 ignored untracked files** at final measurement: 6,186 dependency
files, 69 build files, one CLI tarball, and the 177 newly untracked run entries.
Counts include files inside dependencies; they do not count empty local directories.

## 6. Intentionally retained and manual review

**KEEP TRACKED:** all actual package source/test/configuration, notices/license,
lockfile, canonical catalogs/skills, deterministic regression fixtures and expected
results, mission protocols/harnesses, frozen inputs, final submissions and essential
integrity inventories. The five large runtime snapshots are explicit historical
compatibility/condition inputs; rebuilding today's CLI cannot replace them safely.
Documentation and original research, including Mission 007 research and Missions
008/008.1/009 measurement records, remain intact.

**MANUAL REVIEW — retained, never automatically removed:** unique agent traces,
failed-run logs, final reports/patches, browser measurement results, screenshots,
contact/review sheets and blinded-review copies across Missions 010–012. Some aids
are reproducible or byte-identical, but they are referenced by historical reviews
or hash/file-set inventories. Archive policy and an evidence-preserving manifest
migration are needed before further untracking. An invalid pilot is still evidence
of failure and remains retained. No external archive was substituted for any
currently tracked unique evidence.

**MANUAL REVIEW — pre-existing archive gap:** owner must review and stage the now
visible `tests/mission010/` files together with intended audit changes before
claiming a fresh repository checkout reproduces all missions. No such files were
deleted. Staged run removals must travel with the new restoration script/manifest
and documentation; those additions/edits remain unstaged under owner Git ownership.

## 7. Security findings

No matches for tested provider-token formats, private-key headers, quoted credential
assignments, authenticated URLs, bearer headers or JWTs were detected in current
tracked text and the exposed Mission 010 archive. This is a heuristic current-file
scan, not a complete secret-history audit. The single email-pattern match is an
upstream attribution in `packages/cli/THIRD_PARTY_NOTICES.md`; retain the notice.

**27 files contain absolute user filesystem paths** (exposure: local account and
environment metadata, not a detected credential):

- `benchmarks/mission011/evidence/{pnpm-check-escalated.log,pnpm-check.log,retrieval-comparison.json}`
- `benchmarks/mission012-pilot/evidence/{A,B,C}/{invocation.json,isolation.json}`
- `benchmarks/mission012-pilot/evidence/pnpm-check.log`
- `benchmarks/mission012-pilot/run.py`
- `benchmarks/mission012/evidence/{A,B,C}/{invocation.json,isolation.json}`
- `benchmarks/mission012/evidence/{pnpm-check.log,vitest-serial.log}`
- `benchmarks/mission012/run.py`
- `tests/mission010/evidence/{performance.json,validation.json}`
- `tests/mission010/runs/{A,B,C}/evidence.json`
- `tests/mission010/evidence/retrieval/{B,C}/index.json`

Brace notation expands to individual affected file paths; no matching path values
or credentials are reproduced here. The last seven files are in the pre-existing
untracked archive. Agent event/command traces are retained scientific evidence and
also warrant human privacy review before distribution. Authentication is referenced
by mount path in runner metadata, not copied as an authentication file.

Recommended remediation: review privacy before release; preserve restricted raw
evidence and create separately labeled sanitized exports if needed, with updated
archive provenance rather than silently changing frozen hashes. If any credential
is subsequently confirmed, revoke/rotate it and assess history separately.
`.gitignore` and index removal do not erase previous commits. No credentials were
rotated and no history was rewritten.

## 8. Reproducibility and validation

- `pnpm check`: lint, build and type checking passed. Restricted execution produced
  118 passing/63 failing tests due to subprocess EPERM. Authorized normal execution
  produced **179/181 passing**, with a 5-second component CLI timeout and a pinned
  launcher assertion returning empty stdout. These concurrent failures resemble
  those recorded by Mission 012, but
  this audit does not claim a confirmed root cause or a passing standard check.
- `pnpm exec vitest run packages/cli/test packages/core/test packages/knowledge/test --no-file-parallelism`:
  **181/181 tests, 15/15 files passed**, using normal subprocess permissions.
  This includes offline packaging/runtime/install/skill/catalog checks and existing
  compatibility fixtures. No application implementation or timeout was changed.
- `pnpm build`: passed separately; all three packages built and catalogs validated.
- CLI `--version`, JSON search, schema 2.1 recommendation and component inspection:
  verified with the generated distribution.
- Package inventory: dry-run with scripts skipped after the successful build;
  expected eight distribution entries including the bundle and three canonical
  skill assets. Existing integration tests exercise real local tarballs offline.
- Restore helper: 177 copies reconstructed in an empty temporary destination,
  checksums/modes/link metadata verified, repeat run verified, changed-file refusal
  and all-destination preflight tested without overwriting user data.
- **1,057/1,057** read-only historical frozen/prior/source checks passed in place.
- Ran actual integrity scripts on a disposable filesystem mirror so original
  evidence could not be overwritten: Mission 010 **42/42**, Mission 011 **203/203**,
  Mission 012 pilot **444/444**, Mission 012 **443/443** passed.
- No paid/model agent experiment or browser evidence regeneration was run. Such a
  run needs the recorded model, authentication, namespaces and browser; a new run
  is not guaranteed to reproduce historical pixels or agent behavior.

## 9. Quantification and final Git checks

| Measure | Before | After |
| --- | ---: | ---: |
| Index entries | 948 | 771 |
| Index content bytes | 45,464,975 | 35,953,041 |
| Tracked working-tree bytes | 45,464,975 | 35,954,767 |
| Newly untracked duplicate entries | — | 177 |
| Bytes removed from index | — | 9,511,934 (20.92%) |

Index bytes count file blobs and symlink target bytes, not directory allocation.
Working-tree bytes additionally include unstaged edits to five tracked files.
The new audit report and two restoration files are not included in index totals;
Mission 010's newly visible archive is also untracked. Owner staging will therefore
change the eventual committed totals. These are actual present-index measurements,
not a projection of all additions.

Largest remaining tracked entries:

| Path | Index bytes |
| --- | ---: |
| `benchmarks/mission012-pilot/inputs/C/.udi/runtime.mjs` | 1,266,969 |
| `benchmarks/mission012/inputs/C/.udi/bin/runtime.mjs` | 1,266,969 |
| `benchmarks/mission011/baseline/udi.mjs` | 1,245,898 |
| `benchmarks/mission012-pilot/inputs/B/.udi/runtime.mjs` | 1,245,898 |
| `benchmarks/mission012/inputs/B/.udi/bin/runtime.mjs` | 1,245,898 |
| `benchmarks/mission012/evidence/browser-results.json` | 456,412 |
| `benchmarks/mission012-pilot/evidence/browser-results.json` | 404,283 |
| `benchmarks/mission012/evidence/review/768-edit.png` | 284,393 |
| `benchmarks/mission012/evidence/C/events.jsonl` | 269,854 |
| `benchmarks/mission012/evidence/B/events.jsonl` | 261,166 |

`git status --short`, `git diff --cached --stat`, `git diff --check`,
`git diff --cached --check` and `git ls-files` were inspected. Staged changes are
exactly the 177 intended removals. Local copies remain unchanged. Essential package,
catalog, canonical skill and frozen experiment sources remain indexed. No remaining
indexed file matches ignore rules. Whitespace checks pass.

`git count-objects -v` initially reported 1,245 loose objects and 81,788 KiB loose
object disk usage, with no packs. That historical object storage is separate from
the tracked snapshot: this cleanup does not remove old blobs or shrink previous
commits, and no garbage collection/history rewrite was performed.

## 10. Prevention and remaining work

Before an owner commit, stage the restoration assets and tracking-policy edits
with the duplicate removals, and decide inclusion/privacy policy for the exposed
Mission 010 archive. The repository is cleaner, but **fresh-checkout historical
reproducibility remains incomplete until that pre-existing archive gap is staged**.
The standard concurrent check also remains failing on this host; sequential tests
pass. Those limitations must not be represented as completed fixes.

For future missions, separate immutable inputs/submissions/evidence from generated
workspaces at creation time; record content hashes and explicit reconstruction
sources. Keep local credentials/session homes excluded. Review new ignored paths
with `git check-ignore -v`, review package contents with a dry-run, and inspect
`git ls-files -ci --exclude-standard` for tracked ignore matches. Avoid broad ignore
rules for canonical tests or agent directories. Require a human evidence/archive
review before removing unique traces, screenshots or historical runtime snapshots.


## 11. Mission 010 archive resolution

Follow-up audited 2026-11-02. The archive is fully classified and a prospective
checkout has been validated. **No additions were staged:** `AGENTS.md` prohibits
agent `git add`, and this follow-up explicitly preserves owner Git control. The
previous exception authorized only the two Mission 012 index removals. All 177
staged removals remain untouched. The earlier sections record the first audit;
this section provides the current Mission 010 disposition.

### Dependency map and retention decision

[`mission010-archive-manifest.json`](mission010-archive-manifest.json) lists every
original path, byte count, SHA-256, role, classification, privacy flag and applicable
local input/submission inventory. Its three shared full-tree inventories each
contain exactly the same **182 paths and original hashes**:

- `benchmarks/mission011/evidence/mission010-before.json`
- `benchmarks/mission012/evidence/prior-missions.json`
- `benchmarks/mission012-pilot/evidence/prior-missions.json`

Mission 011 verifies the Mission 010 file set and every hash. Both Mission 012
verifiers compare the union of the entire Mission 010/011 file sets and hashes.
Consequently **all 182 existing files are required for full historical verification**,
including `.gitignore`, README, derived sheets and small execution logs. The local
Mission 010 frozen-input inventory covers 13 files, and its final submission
inventory covers 59 run files. These smaller inventories do not supersede the
later full-tree inventories.

| Purpose | Mission 010 dependencies | Consumers and interpretation |
| --- | --- | --- |
| Reconstruct experiment setup | `fixture/`, `protocol/task.md`, `rubric.json`, legacy/enhanced skill snapshots; `prepare.py`, `config.mjs`, environment/invocation records | `prepare.py` creates independent new starts; Mission 012 and pilot `prepare.py` directly copy `protocol/enhanced-skill/` for arm B. Original agent results cannot be deterministically regenerated. |
| Verify frozen inputs | `evidence/frozen-inputs.json`, 13 referenced fixture/protocol files, arm `START.json` inventories and skill/data/token copies | Mission 010 `verify.mjs` checks original inputs and starts; Mission 011 and both Mission 012 verification scripts additionally check all 182 paths. |
| Verify historical submissions | All `runs/A`, `runs/B`, `runs/C` entries; `evidence/integrity.json#finalRunFiles` | Original apps, self-review evidence, launchers and logs remain byte-for-byte. Mission 010's verifier writes a new final inventory; independent comparison with the archived inventory is necessary to detect changed submissions. Later inventories already pin these bytes. |
| Replay retrieval | B/C `commands.jsonl`, C `brief.json`, original packet/contracts, `replay-retrieval.mjs`, `evidence/retrieval/{B,C}/` | The script executes commands against `packages/cli/dist/index.js`. Exact historical response comparison requires the Mission 010 runtime, retained at `benchmarks/mission011/baseline/udi.mjs`; the current build differs. Original C packets are agent evidence; controller replay files remain labeled as replays. |
| Reproduce measurements | Submitted apps/data/tokens, `browser.mjs`, `capture.mjs`, `interactions.mjs`, `details.mjs`, `performance.mjs`, `trace.mjs`, `trace-loader.mjs`, `performance-context.json`; archived measurement/evaluation JSON | Browser scripts use Chrome and loopback; performance/trace use built core/knowledge and the CLI. Timing/pixels are environment-dependent. Historical measurements remain immutable; new evaluation output belongs in a separate copy. |
| Review historical visuals | 45 primary captures, nine detail captures, capture metadata, interaction/detail/evaluation reports and 18 review sheets | Native images are evidence; sheets are derived inspection aids referenced by the report. The full-tree inventory also makes those aids required for historical verification. Agent private screenshots supplement, and do not replace, the common controller evaluation. |

`docs/MISSION-010.md` links protocols, original reports/commands, native captures,
review sheets and raw measurements. Mission 011's paired baseline is a retained
copy of Mission 010 C; its README/report and verification script describe that
provenance. Mission 012's README/report, input preparation and prior inventories
reference Mission 010's skill/evidence. The Mission 012 frozen input copies remain
available, but do not replace the source skill needed for preparing a new experiment.
Root package scripts and CI do not directly execute Mission 010; passing current
unit tests alone therefore cannot establish this archive's availability.

Byte-identical fixture/skill copies, C packet-versus-replay files, and several
screenshots were identified. They occupy distinct experimental roles and are pinned
by the full-tree inventories. No additional deduplication or manifest migration is
necessary for recovery, so none was performed.

### Exhaustive classification and ignore policy

The categories below are disjoint. KEEP TRACKED means recommended for owner
staging, not already indexed. MANUAL REVIEW means preserve visibly in place and
withhold from staging pending the owner's privacy decision; it does not mean
optional for cross-mission integrity.

| Classification | Files | Bytes |
| --- | ---: | ---: |
| KEEP TRACKED | 174 | 8,739,094 |
| IGNORE / KEEP LOCAL | 0 | 0 |
| MANUAL REVIEW | 8 | 65,893 |
| Total original archive | 182 | 8,804,987 |

No existing file qualifies as disposable without breaking a preserved inventory.
No blanket file-extension or directory exclusions were introduced. Existing
`tests/mission010/.gitignore` excludes `.chrome-*/` profiles; the root excludes
Python caches, workspace builds/dependencies and local secrets. `git check-ignore`
confirmed all 182 archive files remain visible, while a synthetic Chrome profile,
package build and Mission 012 run copy are ignored. No scratch profile, installed
runtime/dependency tree or credential file exists in the original Mission 010 tree.
Future rerun evidence is not automatically disposable: review it before archiving.

The original Mission 010 README and nested ignore file are themselves hashed;
editing them would break history. Added a navigation/policy note to `tests/README.md`
and placed this new manifest outside frozen trees. No original Mission 010 file,
measurement, response, criterion or hash was changed. The repository-wide ignore
policy and previously implemented restoration helper are unchanged.

### Privacy review

Scanned every text artifact for common provider credentials, private-key headers,
quoted credential assignments, authenticated URLs, bearer headers, JWTs, user paths
and email patterns. No tested credential/private-key/email patterns matched.
Authentication-related wording in skills/contracts describes application guidance;
it is not a captured authentication file. Environment and invocation records retain
version/hash information, inherited-model/budget/isolation limitations and tool
metadata; these are necessary interpretation context. PNG chunk inspection found
no embedded text/EXIF metadata; the retained capture subjects are the fictional
benchmark, not external user projects. This is a current-file heuristic review,
not a secret-history audit or proof that every possible sensitive value is absent.

Eight files need owner review before adding raw historical metadata:

| Path | Exposure type |
| --- | --- |
| `tests/mission010/evidence/performance.json` | Absolute local user/tool filesystem path |
| `tests/mission010/evidence/retrieval/B/index.json` | Absolute local runtime invocation path |
| `tests/mission010/evidence/retrieval/C/index.json` | Absolute local runtime invocation path |
| `tests/mission010/evidence/validation.json` | Absolute local filesystem path in validation metadata |
| `tests/mission010/runs/A/evidence.json` | Absolute local workspace path |
| `tests/mission010/runs/B/evidence.json` | Absolute local workspace path |
| `tests/mission010/runs/C/evidence.json` | Absolute local workspace path |
| `tests/mission010/runs/B/chrome.log` | Session-specific loopback browser debugging endpoint/identifier |

No matched values or secret values are printed here. The browser endpoint is
session-local diagnostic metadata, not a detected reusable API credential.
All eight remain visible, unmodified and unstaged. Do not sanitize them in place:
their original bytes are hash-pinned. If raw metadata is unsuitable for the target
repository audience, retain a restricted raw archive with these checksums and
provenance and create a separately labeled sanitized export outside the frozen
tree. No such archive/export was created or published. If the eight originals are
omitted from a commit, exact verification requires separately provisioning them at
the recorded paths; a standalone public checkout would remain incomplete.

### Prospective clean-checkout verification

Built a disposable directory **inside this repository** from exactly 771 currently
indexed paths, all 182 explicitly enumerated archive candidates (including the eight
review files for this conditional simulation), the audit/manifest and the two
restoration assets: **957 files before run restoration**. Copied working versions
of indexed files so the simulation includes intended unstaged policy/docs edits.
No Git database, `node_modules`, ignored runtime/run files, local credentials or
package `dist/` output was copied. This is a proposed file-set simulation, not a
claim that the current index already contains the missing archive.

Then ran the existing tools in that disposable copy:

| Command | Result |
| --- | --- |
| `python3 scripts/restore-benchmark-runs.py` | 177 absent Mission 012/pilot entries restored from retained assets |
| `python3 scripts/restore-benchmark-runs.py --check` | 177 verified; zero replacements |
| `node tests/mission010/verify.mjs` | 42/42 passed |
| `node benchmarks/mission011/verify.mjs` | 203/203 passed |
| `python3 benchmarks/mission012-pilot/verify.py` | 444/444 passed |
| `python3 benchmarks/mission012/verify.py` | 443/443 passed |

Independently compared every Mission 010 file with its archived checksum **after**
verifier execution: all 182 still matched. This matters because Mission 010's own
verifier re-inventories outputs rather than comparing them with its old final hashes.
The original working-tree evidence was never used as an output destination.

After integrity verification, in that same disposable copy only, placed the
hash-matching archived Mission 011 baseline at `packages/cli/dist/index.js` and
ran `UDI_BENCH_EVIDENCE=evidence-audit-replay node tests/mission010/replay-retrieval.mjs`.
The restricted launch hit subprocess EPERM; the authorized normal-permission run
completed offline. All **10/10 archived B/C response checksums matched**. Replay
metadata indices were written separately; original response/index files remained
unchanged. The root manifest and lockfile also match Mission 010's environment
hashes; the current CLI build does not, as expected after Mission 011 changes.

Finally ran `prepare.py --set archive-probe` in the disposable copy: all three new
starts matched their own generated inventories, and a repeat invocation correctly
refused existing destinations. This was setup verification, not a fresh agent run.
No model invocation, browser evidence regeneration, performance rerun, dependency
installation or Mission 013 work was performed. The previous build/unit-test results
in section 8 remain the latest; documentation/manifest-only changes did not require
repeating them. Exact timing, pixels, agent behavior and implicit host discovery
are not claimed reproduced.

To repeat the checkout simulation from the repository root without modifying
original evidence, use a disposable repository-local copy:

```sh
export UDI_ARCHIVE_CHECKOUT="$(mktemp -d "$PWD/.udi-archive-checkout.XXXXXX")"
python3 - <<'PY_COPY'
import json, os, shutil, subprocess
from pathlib import Path
repo = Path.cwd()
copy = Path(os.environ['UDI_ARCHIVE_CHECKOUT'])
archive = json.loads((repo / 'docs/mission010-archive-manifest.json').read_text())
paths = {p.decode() for p in subprocess.check_output(
    ['git', 'ls-files', '-z']).split(b'\0') if p}
paths.update(row['path'] for row in archive['files'])
paths.update(['scripts/restore-benchmark-runs.py', 'scripts/benchmark-run-copies.json',
              'docs/REPOSITORY-HYGIENE-AUDIT.md', 'docs/mission010-archive-manifest.json'])
for relative in sorted(paths):
    target = copy / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(repo / relative, target, follow_symlinks=False)
PY_COPY
(
  cd "$UDI_ARCHIVE_CHECKOUT" &&
  python3 scripts/restore-benchmark-runs.py &&
  python3 scripts/restore-benchmark-runs.py --check &&
  node tests/mission010/verify.mjs &&
  node benchmarks/mission011/verify.mjs &&
  python3 benchmarks/mission012-pilot/verify.py &&
  python3 benchmarks/mission012/verify.py
)
```

This procedure includes all eight raw review files if available locally; it does
not approve them for publication. Remove only the disposable copy after inspection.
Do not run evidence writers on the frozen original tree.

### Owner Git actions and remaining decisions

**Superseded for the eight raw files by section 13:** the owner chose private
archival and separate public derivatives. Do not stage those raw originals.
The 174-file staging command remains applicable.

The archive is selected and verified, with privacy decisions explicit. It remains
unstaged under repository ownership rules. Recommended commands below are for the
owner; **the agent did not execute them**.

Stage the 174 KEEP TRACKED entries precisely, without sweeping in manual-review or
unrelated files:

```sh
python3 - <<'PY_STAGE' | git --literal-pathspecs add --pathspec-from-file=- --pathspec-file-nul
import json, sys
from pathlib import Path
manifest = json.loads(Path('docs/mission010-archive-manifest.json').read_text())
paths = [row['path'] for row in manifest['files']
         if row['classification'] == 'KEEP TRACKED']
sys.stdout.buffer.write(b''.join(path.encode() + b'\0' for path in paths))
PY_STAGE
```

Review/stage the companion policy, manifest, documentation and restoration assets
with the already staged duplicate removals:

```sh
git add -- .gitignore tests/README.md docs/REPOSITORY-HYGIENE-AUDIT.md \
  docs/mission010-archive-manifest.json scripts/restore-benchmark-runs.py \
  scripts/benchmark-run-copies.json benchmarks/mission012/.gitignore \
  benchmarks/mission012/README.md benchmarks/mission012-pilot/.gitignore \
  benchmarks/mission012-pilot/README.md
```

The former optional staging command for the eight raw originals has been removed
following the private-archive decision in section 13. Stage their public derivatives
and provenance instead, together with the private archive tool and documentation.
A public checkout requires authorized access to the private archive for complete
historical verification. No original hash has been revised to accept public copies.

Final checks: `git status --short`, `git diff --cached --stat`, `git diff --check`,
`git diff --cached --check`, `git ls-files -ci --exclude-standard`, and representative
`git check-ignore -v` paths. Whitespace checks pass, no indexed path matches ignore
rules, and the index/staged diff remain byte-for-byte identical to the follow-up's
initial state. The only follow-up edits are this report, `tests/README.md` and the
new archive manifest. All original Mission 010 bytes and existing Mission 012 local
run copies are preserved.


## 12. Private raw archive with sanitized public derivatives

Feasibility verified 2026-11-02 for the eight MANUAL REVIEW files in section 11
(65,893 raw bytes). **Yes, provided the raw originals remain byte-identical and
are restored at their exact recorded paths before historical verification.**
Public derivatives must stay outside both `tests/mission010/` and
`benchmarks/mission011/`, whose complete file sets are frozen. An example destination
is `public-exports/mission010/`; this is a policy example, not a permanent export
created by this audit. Public copies cannot replace original files under their
historical paths, and an unaided public checkout without the raw files cannot pass
full historical verification.

A disposable repository-local experiment created a private raw tar archive and
eight separate sanitized derivatives, with a provenance table pairing original
repository-relative paths/SHA-256 values with public paths/new SHA-256 values.
The raw archive used relative member paths, neutral owner/time headers and mode
0600 inside a private temporary directory. This demonstrates local packaging and
restoration; remote storage access control or encryption was not configured/tested.
The temporary archive, exports and checkout were removed after verification.
No original file, historical inventory, Git index entry or retention classification
was changed. No permanent archive was moved, staged, uploaded or published.

Sanitization replaced the repository/user-home prefixes with explicit placeholders
in JSON string values. The browser log's loopback debugging endpoint and session
identifier were redacted. All seven JSON exports retained their object keys,
arrays, numbers, booleans and null values; measured results were not changed.
All eight derivatives had new checksums, and a residual scan found no original
user/repository path or targeted browser/session identifier in them. They are
labeled derivatives, not historical originals. These targeted checks do not replace
human review of any future public export.

| Disposable scenario | Mission 010 | Mission 011 | Pilot | Mission 012 | Original archive hashes |
| --- | --- | --- | --- | --- | --- |
| Original bytes plus public copies outside frozen trees | 42/42 | 203/203 | 444/444 | 443/443 | All 182 match |
| Public copies substituted at eight original paths (negative control) | 42/42 | 194/203, fails | 434/444, fails | 433/443, fails | Nine mismatches after verifier execution |
| Eight raw members restored from private tar at original paths; verifier-written inventory reset from unchanged original | 42/42 | 203/203 | 444/444 | 443/443 | All 182 match |

The ninth mismatch in the negative control is `evidence/integrity.json`, rewritten
by Mission 010's verifier to describe the altered submissions. Its 42/42 result
alone therefore cannot establish historical output integrity. Always compare
against the preserved SHA-256 inventories and run the cross-mission checks; never
update historical hashes to accept sanitized bytes. Mission 012 also detects the
changed Mission 011 integrity output produced during the negative control.

Recommended handling: retain the eight raw originals in owner-controlled private
storage with the manifest checksums and provenance; publish only explicitly labeled,
reviewed derivatives and a separate original-to-export checksum mapping outside
frozen trees. Restrict raw archive access, and use encrypted storage/transport when
needed for its destination. Authorized verification retrieves and restores the raw
members without overwriting differing files, checks their recorded hashes, then
runs the full historical verifiers in a disposable copy. Public-only users can
review sanitized evidence, but full historical verification requires access to the
raw archive. The eight entries remain MANUAL REVIEW pending the owner's choice of
archive location/access policy and approval of an actual public export.


## 13. Permanent local archive and public exports

Implemented 2026-11-02 following the owner's request, without Git mutations or a
commit. This is the current retention policy and supersedes the earlier pending
privacy/staging decisions in sections 10–12.

### Files and permissions

The permanent private directory is `../.udi-private-archives/mission010/`, in the
project's parent directory and outside every detected Git worktree. It is owned by
the current user with mode **0700**. Its three regular files are mode **0600**:

- `mission010-originals.tar`: 81,920 bytes, containing exactly the eight original
  files (65,893 content bytes), relative paths, neutral owner/time metadata, no links.
- `manifest.json`: each original path, size, SHA-256 and the tar SHA-256.
- `SHA256SUMS`: the tar checksum, also pinned in the public retention manifest.

Archive SHA-256:

```text
eb442478a2babe1efd636b85d7a58bbc7e6fbb864d4b9b411a84acda77a1d2d0
```

`public-exports/mission010/` now contains the eight sanitized derivatives at their
corresponding relative paths, plus `provenance.json`. The provenance records each
original path/hash/size, derivative path/hash/size and redaction rules, and labels
each export as a derivative. User/repository paths and browser session identifiers
are replaced with placeholders. JSON structure and non-string measurement values
are retained; original response/measurement/hash files are unchanged.

Eight exact root `.gitignore` rules exclude the raw working copies; no other
Mission 010 file or file category is ignored. The raw originals remain locally
present and unchanged, but no raw archive is placed in this Git worktree. The 174
other originals remain visible and selected for owner staging. The retention
manifest now classifies eight entries as `PRIVATE ARCHIVE / PUBLIC DERIVATIVE`,
with their original hashes unchanged. It reports zero unresolved MANUAL REVIEW
entries; backup validation remains separately incomplete.

### Simple recovery and verification

The standard-library-only `scripts/mission010-private-archive.py` has five commands:
`create`, `check`, `export`, `restore`, and `verify-history`. No downloads, model
calls or Git writes occur. Repeating creation/export preserves identical files and
refuses differing existing files.

Check the permanent archive against the eight trusted original hashes:

```sh
python3 -B scripts/mission010-private-archive.py check \
  --archive ../.udi-private-archives/mission010/mission010-originals.tar
```

Regenerate missing public exports from that archive without overwriting edits:

```sh
python3 -B scripts/mission010-private-archive.py export \
  --archive ../.udi-private-archives/mission010/mission010-originals.tar
```

For full historical verification, this one command builds a disposable repository-
local copy from indexed paths and the 174 explicitly selected archive assets,
restores the eight raw originals **from the private tar**, reconstructs the 177
Mission 012/pilot run copies, and runs the four existing historical verifiers:

```sh
python3 -B scripts/mission010-private-archive.py verify-history \
  --archive ../.udi-private-archives/mission010/mission010-originals.tar
```

It independently checks all 182 original hashes after verifier execution, then
removes its temporary copy. Existing raw working copies are not its source, and
original evidence is never an output destination. A public-only checkout needs
the private archive supplied separately to execute this command.

To restore manually into an existing disposable checkout:

```sh
python3 -B scripts/mission010-private-archive.py restore \
  --archive ../.udi-private-archives/mission010/mission010-originals.tar \
  --destination-root /path/to/disposable-checkout
# Add --check to verify existing restored copies without writing.
```

Restoration validates the exact eight-member regular-file inventory and every
SHA-256 against the public retention manifest before any destination write. It
rejects duplicate/unexpected/traversal/link members and symlink destination parents
or leaves. It checks the entire write plan first, refuses to overwrite differing
files, creates only missing files with mode 0600, and uses exclusive, no-follow
file creation plus directory file descriptors. It never calls tar extraction.
An interruption can leave a partial set of missing copies, never a replacement of
user data; rerunning restores remaining missing files after the same checks.

### Validation performed

- Permanent archive read back: eight original SHA-256 values match, tar checksum
  matches its inventory, archive directory 0700 and all three files 0600.
- Eight public exports: all derivative checksums match provenance; no residual
  original repository/home prefix, targeted local browser endpoint or session UUID
  was detected.
- Five standard-library safety tests pass: restrictive roundtrip/repeat behavior,
  whole-plan conflict refusal without partial writes, symlink/traversal refusal,
  corrupt/duplicate/traversal/link tar refusal, separate public exports/provenance.
  Run with `python3 -B scripts/test_mission010_private_archive.py`.
- Permanent archive `verify-history`: Mission 010 **42/42**, Mission 011 **203/203**,
  pilot **444/444**, Mission 012 **443/443**. All 182 historical bytes match afterward.
- Exactly eight raw files match ignore rules; all 174 selected originals and public
  exports remain visible. Existing 177 staged removals and index state are preserved.
- No package implementation/version changed; prior build/unit-test results still
  apply. The tests here exercise only the added archive/recovery workflow.

### Backup status: local only, independent recovery not validated

The owner first selected encrypted cloud plus external disk, then requested the
simplest possible setup without supplying destinations or a recipient key. No cloud
upload, external disk copy, backup scheduler, encryption key or backup product was
configured. No independent backup has been discovered or verified for the parent
directory. Filesystem persistence and 0700/0600 permissions **do not establish
backup or long-term recoverability**. The tar itself is not encrypted.

The local archive and restoration are complete. The requested independent backup
verification is **not complete**: losing this computer/disk could lose the only
verified archive. A simple future action is to copy the entire private archive
directory to a protected external disk and/or encrypted private cloud storage,
then retrieve that independent copy and run the same `check` and `verify-history`
commands against the retrieved tar. Keep any encryption recovery key separately.
Do not mark this requirement passed until a retrieval/restoration test succeeds.

### Owner staging

No files were staged by this implementation. Keep the eight raw ignore rules in
place. The 174-entry selection command in section 11 remains valid. In addition to
its companion files, review and stage the new public assets and recovery tools:

```sh
git add -- public-exports/mission010 scripts/mission010-private-archive.py \
  scripts/test_mission010_private_archive.py .gitignore tests/README.md \
  docs/mission010-archive-manifest.json docs/REPOSITORY-HYGIENE-AUDIT.md
```

This is an owner command only; no `git add` was executed. Preserve the existing
staged Mission 012 removals with their restoration assets in the eventual reviewed
commit. The private tar and its companion files must stay outside public Git.

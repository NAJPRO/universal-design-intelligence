# UDI progress

**Updated:** 2026-10-27

## Completed

### Phase 1 — Foundations

- Created pnpm workspace boundaries for CLI, core, and knowledge packages with strict TypeScript, Zod, ESLint, Vitest, CI, and the canonical `udi-design` skill.
- Verified initial skill conventions for Codex, Claude Code, Cursor, and Antigravity; host runtime discovery remains a Phase 3 validation item.
- `pnpm install --frozen-lockfile`, `pnpm check`, and `pnpm build` passed for the foundation.
- Implemented and tested `udi --version`; no package was published and no remote repository was created.
- Recorded architecture decisions and competitive research.

### Phase 2 — Local design intelligence

- Added strict Zod schemas and inferred TypeScript types for rules, profiles, project contexts, patterns, anti-patterns, provenance, and versioned recommendations.
- Added catalog build validation for schema validity, stable and unique identifiers, supported categories, and all profile/pattern/anti-pattern references.
- Curated **80 design rules**, **17 profiles**, **8 component patterns**, and **8 anti-patterns** across all 15 supported categories. Provenance identifies the original UDI synthesis and relevant external standards/tutorial references; no external prose is copied.
- Implemented offline deterministic BM25 retrieval with Unicode/case/punctuation normalization, weighted fields, filters, bounded result limits, stable ID tie-breaking, and source IDs.
- Implemented deterministic context/profile matching, applicable-rule selection, conflict resolution, versioned JSON, explanations, safe assumptions, and explicit brand preservation.
- Implemented `udi search` and `udi recommend`; the CLI bundles local core/knowledge/Zod runtime code and keeps Commander as its declared runtime dependency.
- Added package-local schema, catalog, retrieval, recommendation, benchmark, and built-CLI tests.
- `pnpm check` passed: ESLint and TypeScript checks passed; **29 tests passed across 6 files**. Catalog build validation reported 80 rules, 17 profiles, 8 patterns, and 8 anti-patterns.
- `npm pack --dry-run --json` listed 6 package entries, including the built CLI, canonical skill, package README/license, and third-party notices. Search and recommendation both ran successfully from `packages/cli/dist/index.js`.

### Phase 3 — Agent installation and discovery

- Added a shared `AgentAdapter` contract with project-local adapters for Codex, Claude Code, Cursor, and Antigravity. Codex and Antigravity intentionally share `.agents/skills/udi-design`; Cursor uses `.cursor/skills/udi-design`; Claude Code uses `.claude/skills/udi-design`.
- Implemented `udi init [--agent <agent|all>] [--dry-run] [--force]`. It requires an explicit selection when detection is absent or ambiguous, preflights every target before writes, deduplicates shared assets, blocks symlink/path escapes, preserves unrelated files, and refuses modified/unowned files even with force unless ownership is established by the UDI installation manifest.
- The installer copies the canonical skill and progressive-disclosure references, plus an isolated `.udi/bin/index.js` runtime and the CLI's Commander dependency. The project-local CLI can run via Node without a globally installed executable or workspace package path.
- Implemented `udi doctor [--json]` with Node compatibility, per-agent static paths, skill metadata and file integrity, package asset integrity, runtime installation integrity, configuration conflicts, remediation, static-discovery status, and an explicit false for actual host runtime verification.
- Reworked the canonical skill workflow and added focused CLI and design-quality references; all are copied from the single canonical source and included in the package tarball.
- Added official-path research and explicit evidence boundaries in `docs/agent-compatibility.md`. Global installation is documented but deferred.
- `pnpm check` passed: lint and type checks succeeded; **38 tests passed across 6 files**. Catalog build validation again reported 80 rules, 17 profiles, 8 patterns, and 8 anti-patterns.
- `pnpm build` passed. `npm pack --dry-run` showed 8 package entries, including `dist/index.js`, `SKILL.md`, and both linked references. The tarball was installed into a temporary external directory; its CLI version printed `0.1.0`, `udi init --agent cursor` succeeded in a separate temporary project, and the copied project-local runtime successfully ran search, recommendation, and doctor without referencing the monorepo.
- Search from the packed project-local runtime returned `UDI-SAA-001` for “dashboard metrics”; packed recommendation returned `PRO-FINTECH-MARKETING` for fintech with brand preservation; doctor reported `installationVerified: true`, `packageAssets.valid: true`, and `actualRuntimeDiscoveryVerified: false`.
- Codex and Claude executables are present locally; Cursor and Antigravity executables are unavailable. No external/paid agent session was invoked, so real host runtime discovery remains **not tested for all four agents**. No Git state changes, package publication, or release were performed.

### Phase 3.1 — Decoupled skill installation

- UDI is now installed as a developer tool/skill system, without application dependency installation. Commander is bundled and build-only; the local tarball has no production npm dependencies.
- Added `init --global` (all agents by default), global agent selection, default project scope with exact-version shared-runtime reuse, explicit `--install-runtime` consent, and relocatable `--portable` mode. Shared runtimes default to `~/.udi/runtimes/<version>` and support `UDI_HOME` configuration.
- Canonical skill files and small version-checking launchers are copied to official project/user discovery paths. Antigravity's global adapter targets its IDE path at `~/.gemini/config/skills`. Project installations do not copy a runtime unless portable mode is selected.
- Added SHA-256 ownership inventories for skill assets and launchers, full preflight, retained symlink/path protections, no force replacement of unrelated files, and immutable versioned runtimes. Adding agents retains ownership records without requiring force for metadata updates.
- Extended `doctor --global` and project diagnostics with scope/runtime location, exact version/content checks, inventory integrity, and missing/modified runtime remediation. Static verification still makes no host activation claim.
- Integration tests cover global defaults/all agents, project reuse, portable relocation, default/configured runtime stores, version mismatch, missing runtime, modified/unowned files, repeat installation, dry-run, and unchanged application manifests/lockfiles/node_modules.
- `pnpm install --offline --frozen-lockfile` passed using the existing local dependency cache. `pnpm check` passed: lint/type checks and **46 tests across 7 files**. Build steps passed and validated the unchanged 80-rule/17-profile/8-pattern/8-anti-pattern catalog.
- The tarball integration performs an actual `npm install --global --offline --ignore-scripts` into an isolated temporary tool prefix outside the monorepo. Global/project skills work after deleting that bootstrap prefix; conversion to portable mode continues working after deleting the shared runtime store. Search, recommendation, and both doctor scopes pass.
- Documented local tarball bootstrap, exact-version upgrade/coexistence, legacy manifest review, immutable-runtime repair, inventory/hash-aware manual uninstall, and platform/host verification limits in `docs/installation.md`.
- No Git write operations, publication, release, or remote repository operations were performed. Tests ran on Linux/Node.js 22; live agent activation and macOS/Windows execution remain untested.

## Retrieval benchmark

The committed benchmark contains 16 manually authored queries and 17 expected relevant rule IDs, spanning SaaS/dashboard, fintech, developer tools, e-commerce, and professional services use cases. On the passing test run:

- **Recall@5: 0.941** (16 of 17 expected relevant rule IDs retrieved in the top five).
- **MRR@10: 0.969** (mean reciprocal rank across the 16 queries).

This is a small, self-authored regression baseline, not an independent user study or a general performance claim. Relevance judgments and queries should be expanded and reviewed as real use cases arrive.

## Remaining / next

1. Phase 3 follow-up: test actual runtime discovery in each agent host when the runtime is available and external calls are authorized; global installation is now implemented in Phase 3.1.
2. Phase 4: build and run a representative Next.js example; perform measured responsive and accessibility checks.
3. Phase 5: audit the full production dependency and knowledge license set, recheck npm package-name availability, and prepare a release. Do not publish without explicit authorization.

## Decisions

- Keep local search and recommendations deterministic and fully offline; semantic retrieval is a future optional implementation behind the `Retriever` interface.
- Use explicit project, framework, category, and profile data rather than pretending the heuristics are LLM reasoning.
- When brand tokens are missing, do not assume permission to replace an existing identity; callers can explicitly request preservation with `--preserve-brand`.
- Continue using `universal-design-intelligence` as the proposed CLI package name pending a final pre-release registry check. The initial registry query does not reserve it.
- Do not publish or create/push any public repository without explicit authorization.

## Blockers and limitations

- Catalog and relevance judgments are authored in-repository; independent contributor review and broader user evaluation remain necessary before treating the benchmark as an external quality score.
- Profile matching is explicit keyword overlap, not semantic understanding. Unknown product vocabularies may select only the safe general profile.
- Framework applicability is represented and filtered, but the initial rules are deliberately framework-agnostic.
- Agent skill paths and installation behavior are covered by static and temporary-project tests, but actual host runtime discovery remains untested.
- Project-local installation is statically validated, not live-host validated; global and portable installs are implemented; uninstall is a documented inventory/hash review procedure, with no dedicated uninstall command.

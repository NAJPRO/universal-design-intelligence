# Roadmap

Target release: **2026-10-31**. The deadline prioritizes an installable, tested MVP over optional features.

## Phase 1 — Research and foundations

- [x] Inspect the repository and available Node tooling.
- [x] Record competitive research and initial architecture decisions.
- [x] Create pnpm workspace/package boundaries and strict TypeScript foundation.
- [x] Add lint, type-check, test, and CI workflows.
- [x] Implement and test the first CLI command (`udi --version`).
- [x] Confirm lockfile installation and full local checks.

**Acceptance:** clean `pnpm install --frozen-lockfile`; `pnpm check` and `pnpm build` pass; running the built CLI with `--version` prints the package version; the package dry run includes the CLI and canonical skill asset.

## Phase 2 — Design intelligence

- [x] Define Zod-validated knowledge and profile schemas with provenance/review metadata.
- [x] Create a reviewed, attributed catalog (80 rules, 17 profiles, 8 patterns, and 8 anti-patterns).
- [x] Implement deterministic BM25 retrieval with filters and empty-result behavior.
- [x] Implement recommendations and human/JSON output.
- [x] Add focused unit tests, a 16-query relevance benchmark, and CLI integration coverage.

**Acceptance:** met by `pnpm check` and `pnpm build`. The measured baseline is recorded in `docs/PROGRESS.md`; it is a small internal benchmark, not an external quality claim.

## Phase 3 — Agent integration

- [ ] Implement `udi init` and `udi doctor`.
- [ ] Add adapters for Codex, Claude Code, Cursor, and Antigravity.
- [ ] Verify install paths, file installation, discovery behavior, and safe/idempotent installation independently.
- [ ] Validate the canonical skill against Agent Skills format.

**Acceptance:** all four agent adapters install to documented project/global paths; dry-run writes nothing; repeated installation is idempotent; existing content is not overwritten without explicit `--force`; tests in temporary directories verify files and status independently of host runtime discovery.

## Phase 4 — Real-world validation

- [ ] Build a small Next.js SaaS example using the skill.
- [ ] Check responsive behavior and accessibility using actual tools.
- [ ] Document observed issues and improve the skill based on evidence.

**Acceptance:** the example runs using documented commands; responsive behavior is checked at representative viewport sizes; accessibility tooling and manual semantic/keyboard review are run and findings are documented; visual claims link to actual test evidence.

## Phase 5 — Release preparation

- [ ] Complete contribution, security, license, changelog, and knowledge contribution docs.
- [ ] Audit dependency and knowledge licenses.
- [ ] Verify package contents with `npm pack`.
- [ ] Run all checks and prepare a `v0.1.0` release.
- [ ] Provide exact publication instructions; publish only with explicit authorization.

**Acceptance:** dependency and content license audit is recorded; `npm pack --dry-run` includes every runtime asset; CI is green; release notes and exact publication commands are ready; nothing is published without explicit authorization.

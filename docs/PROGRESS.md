# UDI progress

**Updated:** 2026-10-26

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

## Retrieval benchmark

The committed benchmark contains 16 manually authored queries and 17 expected relevant rule IDs, spanning SaaS/dashboard, fintech, developer tools, e-commerce, and professional services use cases. On the passing test run:

- **Recall@5: 0.941** (16 of 17 expected relevant rule IDs retrieved in the top five).
- **MRR@10: 0.969** (mean reciprocal rank across the 16 queries).

This is a small, self-authored regression baseline, not an independent user study or a general performance claim. Relevance judgments and queries should be expanded and reviewed as real use cases arrive.

## Remaining / next

1. Phase 3: implement `udi init`/`udi doctor`, agent-specific installation adapters, safe/idempotent installation behavior, and host discovery tests.
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
- Agent skill paths are documented from official conventions, but runtime discovery and installation behavior remain untested until Phase 3.

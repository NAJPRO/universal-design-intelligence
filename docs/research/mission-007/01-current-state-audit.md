# Current-state audit

**Observed unless marked otherwise.** Scope: the checked-out v0.1.0 manifests and source, not a downloaded npm release. The mission reports v0.1.0 as the current public release; registry publication was not independently checked because remote repository/release operations are outside this mission.

## Packages and runtime

| Boundary | Evidence | Actual responsibility |
| --- | --- | --- |
| Knowledge | [schemas.ts](../../../packages/knowledge/src/schemas.ts), [catalog.ts](../../../packages/knowledge/src/catalog.ts), [integrity.ts](../../../packages/knowledge/src/integrity.ts) | Strict Zod records, original editorial catalog, identifier/reference validation |
| Core | [retrieval.ts](../../../packages/core/src/retrieval.ts), [recommend.ts](../../../packages/core/src/recommend.ts) | Synchronous BM25 and deterministic recommendation orchestration |
| CLI | [index.ts](../../../packages/cli/src/index.ts), [agent-install.ts](../../../packages/cli/src/agent-install.ts) | Commander interface, bundled distribution, installation planning and diagnostics |
| Canonical skill | [SKILL.md](../../../skills/udi-design/SKILL.md), linked references | Inspect → retrieve → choose direction → implement → review |

Knowledge does not depend on core. Private workspace core/knowledge packages are bundled into the public CLI with Zod and Commander. The CLI has no declared production npm dependencies. Node 22+ is required; the workspace specifies pnpm 12.11.2. Source-only research does not require an installation.

Shared runtimes use `<UDI_HOME>/runtimes/<exact-version>`; project skills can reuse them or carry a portable runtime. Ownership hashes, immutable version directories, preflight/path/symlink checks, and explicit force semantics protect projects. `init --dry-run` previews; normal `init` does write. Preserve this distinction rather than claiming every install defaults to preview. Runtime search/recommendation is offline; first obtaining a package may require network access unless an artifact is already available. See [installation](../../installation.md).

## Catalog, schemas, duplication

There are **80 rules, 17 profiles, 8 patterns, 8 anti-patterns**, 15 categories, 11 project types, and 11 framework values. Catalog version is `1.0.0`; recommendation schema version is `1.0`; package version is `0.1.0`. They are independent version axes.

Rules contain category, contexts, frameworks, priority, text guidance, tags, provenance, related anti-patterns, and choices in five dimensions: density, motion, navigation, color, brand. Profiles contain project applicability, audience/style keywords, linked rules, and five direction strings. Patterns contain a problem, solution strings, and rule references. They do not define anatomy, state transitions, keyboard contracts, composition ports, or domain roles.

All records are strict. Integrity validation checks unique IDs and reference existence. Provenance supports review status and dates, but reviewed status is not backed by a machine-verified reviewer identity or license artifact. Applicability is broad and prose remains editorial knowledge rather than a formal interaction contract.

Shared profile rule arrays reduce authoring repetition. However, guidance is also repeated across rules, anti-pattern alternatives, patterns, profile direction strings, and skill checklists. Duplication risks conflicting updates and context waste. Keep stable canonical rule IDs; make new entities link to them and add only the behavior specific to that entity. Architecture documentation lists the CLI boundary twice. Progress notes contain earlier installation/dependency descriptions superseded by Phase 3.1; treat source and newer release notes as stronger evidence.

## Search behavior

BM25 uses `k1=1.2`, `b=0.75`. Title has weight 2.5, tags 2, category 1.6, summary 1.4, guidance 1, contexts 0.8. Weighted term counts also determine document length. Tokenization splits camel case, normalizes NFKD/diacritics, lowercases, extracts Unicode letters/numbers, removes one-character tokens and a small English stop list. No stemming, domain synonym graph, embeddings, remote calls, or component indexing exists.

Search filters one category, one project type, and one framework; framework-agnostic rules survive framework filtering. Scores must be positive. Queries have a 1,000-character maximum and limits are 1–100. Ties use stable identifier ordering. Each public helper call builds an index from rules; the corpus is small today. Multi-category recall and amortized indexing need evaluation as content grows.

## Recommendation and profile selection

1. Validate context and catalog. If type is omitted, use `web-app` in the output and deliberately select `PRO-GENERAL-WEB`.
2. Filter profiles to the requested type or `all`.
3. Score exact type at 20, specificity at `4 / number of profile project types`, audience word matches at 2, profile-name/audience overlap at 4, style matches at 3. Tie-break by ID. Goals do not influence profile ranking.
4. Retrieve at most 40 rules using type, audience, style, goals, and optional framework.
5. Insert profile rules first, optionally inject `UDI-SYS-005` for brand preservation, then append retrieved rules with ID deduplication.
6. Resolve global choice conflicts by priority and ID; exclude entire losing rules. Keep the first **14** survivors.

Consequences: strong retrieval can be crowded out by profile-linked rules; no category coverage survives the cap by guarantee. Patterns and anti-pattern records are not independently retrieved or returned. Project types mix industries (`fintech`, `education`), application forms (`dashboard`, `marketing-site`), and markets (`professional-services`). E-commerce lacks a product-administration profile; health technology combines patients, clinicians, and administrators. The frontend selection issue is therefore deeper than missing style keywords.

Profile-linked candidates check project applicability but do **not** repeat framework compatibility checks; retrieval does. Current framework-agnostic content masks this future risk. The conflict resolver can select a winner in one dimension that is later excluded in another, leaving an explanation naming a non-retained winner. This is a code-path risk inferred from the algorithm, not a reproduced user defect. Scoped constraints and explanation validation should precede richer choices.

Skill preservation defaults are stronger than the core default `preserveBrand: false`. The CLI does not expose goals or structured brand tokens although core accepts them. Brand-description/design-system strings alone do not set preservation to true. Avoid silently equating a requested aesthetic with observed established tokens.

## Interfaces and workflow

Existing commands: `search <query>` with category/type/framework/limit/JSON; `recommend` with type/framework/style/audience/brand/design-system/JSON; `init` with agent/global/portable/install-runtime/dry-run/force; `doctor` with global/JSON. No application inspection, domain classification, component inventory, screenshot review, or visual audit command exists. Doctor checks installation, not interface quality.

The canonical skill already asks agents to inspect the stack, reuse existing components, preserve brand, retrieve progressively, and review responsiveness/keyboard/states. Its checklist is useful but does not require a task-to-knowledge coverage ledger, evidence of render inspection, or a bounded corrective loop. Optional questions are not yet governed by a material-ambiguity policy.

## Tests and evidence limits

Seven package test files cover schema/integrity validation, tokenization, ranking/filtering, deterministic output, profiles, brand preservation, conflicts, built CLI behavior, and defensive installation. Historical progress records **46 passing tests**; this is recorded evidence, not a fresh whole-suite result. See [mission validation](07-quality-and-benchmarks.md#mission-validation).

The retrieval benchmark has 16 self-authored queries and 17 relevant-rule labels. Micro Recall@5 is expected at 16/17 = 0.941; MRR@10 averages first-relevant reciprocal rank over 16 queries (reported 0.969). Test thresholds are only 0.8 and 0.5. It measures rules, not patterns, domain discrimination, profile candidate quality, rendering, or aesthetic quality. Vocabulary overlaps strongly with catalog terms and relevance labels are sparse.

[Mission 004](../../../udiTest/docs/MISSION-004.md) and [Mission 005](../../../udiTest/docs/MISSION-005.md) document an automotive editorial case and remediation. These reports identify sparse automotive retrieval, missing domain guidance, brand-evidence ambiguity, and a misleading runtime error for overlong style input. Their browser checks are project-specific reported evidence. Release notes record Codex live invocation on Linux; older progress notes still say all hosts are unverified. Other host/platform claims must stay scoped.

## AK.STORE findings mapped to evidence

No diagnostic report was located by filename/content searches in this workspace. Do not infer its implementation, screenshots, metrics, or causes.

| Reported finding in mission | Supporting repository mechanism or gap | Proposed response |
| --- | --- | --- |
| Generic admin interfaces | Broad dashboard direction; no task composition contracts | Task-based composition graph |
| Poor component sophistication | Patterns lack anatomy/variants/state contracts and are not retrieved | Component specifications and pattern retrieval |
| Insufficient domain awareness | Industry and application-type taxonomy conflated | Independent domain overlays |
| Weak profile selection | Single lexical winner; goals excluded; no candidate explanation | Eligibility gates, ranked alternatives, evidence labels |
| Under-retrieval | Rules only; profile-first 14-item cap | Category planning, coverage ledger, targeted expansion |
| Insufficient visual verification | Checklist without required evidence artifacts | Render → inspect → refine with stated limitations |

These links are architectural hypotheses explaining plausible failure modes, not an independent causal diagnosis of AK.STORE.

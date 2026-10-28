# Incremental implementation roadmap

**Proposal only.** This roadmap does not authorize implementation, installation, publication, Git writes or changes to AK.STORE. Scope gates require a later explicit implementation request. Version assignments below are recommendations, not release promises.

## Milestones and dependencies

| Priority / milestone | Deliverable and dependency | Acceptance criteria | Release positioning |
| --- | --- | --- | --- |
| P0 / M0 — Evidence and compatibility baseline | Pin source snapshots, legacy outputs, independent relevance labels and runtime measurements; depends on review of Mission 007 | All existing public CLI JSON fixtures captured; strict v1 consumers represented; pack/license decisions recorded; baseline size/latency/memory measured | Essential preparation |
| P0 / M1 — Existing-knowledge retrieval | Rank eligible profile candidates; retrieve existing patterns/anti-patterns; introduce coverage ledger and scoped explanations; depends on M0 | Same request yields identical output; no incompatible framework candidates; legacy path unchanged; enhanced gaps/truncation explicit; explanation winners survive selection | Essential candidate for v0.2.0, opt-in v2 envelope |
| P0 / M2 — Orthogonal context | Strict industry/app/role/task evidence envelope, legacy adapter, ambiguity/fallback behavior; depends on M0; integration with M1 | Commerce storefront/admin and healthcare public/staff pairs discriminate; unknown domain does not invent support; conflicting explicit inputs diagnosed | Essential narrow context slice for v0.2.0 |
| P1 / M3 — Component contracts | Independently authored schema plus table/filter/form/dialog/feedback/media/combobox specifications; depends on M1+M2 | Shape/reference/state/variant validation; native vs grid semantics clear; error/keyboard/responsive/reduced-motion contracts complete; license provenance reviewed | Narrow initial subset; remaining families later |
| P1 / M4 — Composition and first domain pack | Product workspace + operational table + publication review, commerce-administration overlay; depends on M3 | Product list/edit/variants/media tasks covered with realistic fixtures; bulk partial failure and save conflict specified; no storefront substitution | Optional v0.2.x or later, evidence-dependent |
| P1 / M5 — Adaptive skill and inspection | Concise skill revisions, evidence-led optional questions, local inventory, visual review loop; depends on M1+M2; uses M3/M4 when available | No required reference/style questionnaire; observed brand preserved; missing render tools reported; legacy launcher/install safety retained | Core workflow can ship narrowly; automated collector optional |
| P1 / M6 — Controlled pilot | Retrieval held-out test and 63-session interface pilot; depends on a frozen M1–M5 candidate | Reproducible artifacts, blinded ratings, failures retained, separate retrieval/interface results; gates in document 07 satisfied or scope revised | Required before broad improvement claims, not before every experimental prerelease |
| P2 / M7 — Expansion | Education/real-estate/sports overlays and public/self-service cases; later sensitive operations; depends on M6 findings | Each pack has source review, task fixtures, application-type negatives and domain reviewer; no compliance overclaims | Later releases |
| P3 / M8 — Specialized capabilities | Complex editors, clinical operations, financial approval depth, locale-rich scheduling, optional pack distribution/index optimization | Expert-validated contracts, measured need/performance, compatibility/security review | Longer-term; no commitment to v0.2.0 |

Dependency graph: `M0 → {M1, M2} → M3 → M4`; `{M1, M2} → M5`; `{M1…M5 frozen candidate} → M6 → M7 → M8`. M5's minimal checklist improvements can proceed before all component/domain work; a full automated inspector is not required to validate retrieval.

## Package and runtime implications

Do not add packages before data measurements justify them. Knowledge owns new strict definitions and original records; core owns selection; CLI owns context parsing and optional file inspection; canonical skill owns agent orchestration. Start with the existing bundle/install pipeline. A separate `@udi/domain-*` package system is optional later, not a prerequisite.

Capture current packed compressed/uncompressed size, runtime cold startup, warm multi-query ranking time, peak RSS and representative packet bytes. No size or timing was measured during this documentation mission. Initial **provisional engineering budgets**, to confirm at M0: selected v0.2 scope adds at most 500 KiB compressed knowledge/runtime data; default enhanced packet ≤24 KiB; selection p95 ≤100 ms after parsing/index setup on a declared reference machine at a 1,000-entity corpus. Measure cold start separately and avoid promises across untested machines. A budget failure should narrow content or improve encoding, not silently download data.

Store full prose only once, with compact ID references and reusable contract sections. Do not bundle screenshots, external component implementations, fonts, licensed image collections, browser binaries or a DOM automation library into the CLI. Optional browser/visual checks use project-provided tooling. A 10× synthetic growth test should report index construction cost and memory before choosing precomputed indexes or partitioning packs.

Exact-version shared runtimes remain immutable; additional pack assets enter the existing hash inventory and portable bundle. Never mutate an old runtime in place to add knowledge. No application manifest, lockfile or `node_modules` writes for skill installation. Avoid arbitrary code hooks in knowledge packs. Optional packs, if introduced later, must be explicitly provisioned and usable offline, with exact versions, hashes and engine compatibility checks.

## Backward compatibility

Keep default v1 output and commands stable initially. New context/ranking/knowledge is opt-in under schema 2.0; strict v1 output must not acquire extra fields. Snapshot legacy search and recommendation behavior including omissions and fallback. Use a dedicated v1 adapter rather than partially applying new classification and accidentally changing profiles. Preserve old IDs and support references from original patterns. Deprecation/default changes require a documented migration and an appropriate later version decision.

Legacy installers and launchers retain safety and version-binding behavior. An upgraded skill must not issue new flags to an old runtime without checking capability/version. If v2 is unavailable, use current search/recommend plus explicit targeted queries and report the capability limit. No silent network upgrade, pack fetch or dependency installation.

## Risks and mitigations

| Risk | Mitigation and stop condition |
| --- | --- |
| Domain knowledge becomes stereotype/style labels | Require task/application-specific positives and negatives, role distinctions and expert review; block a pack that only changes colors |
| More data worsens relevance/context size | Per-kind retrieval and applicability gates, coverage accounting, packet budgets and held-out labels; stop expansion if irrelevant recommendations rise |
| Conflict explanations disagree with output | Scoped constraints, dependency re-evaluation and invariant checks; unsatisfiable must constraints remain unresolved |
| Runtime confidence looks like semantic certainty | Evidence bands and alternatives; calibration only from held-out labeled cases |
| Licensing contamination | Original content, artifact-level source ledger, no reuse from unresolved/restricted sources; do not import components or assets |
| Clinical/financial errors or false compliance claims | Narrow first scope, simulated scenarios, qualified reviewers, no treatment/authorization/regulatory logic inferred by UDI |
| Public-site styling harms operational work | Task hierarchy/density gates, separate public/operations fixtures, blinded domain/component assessment |
| Visual review becomes a ritual without evidence | Capture route/state/viewport and actual findings, bounded corrections and retests; distinguish generated screenshots from inspected screenshots |
| Benchmark overfits one model or author | Sealed task-family split, external reviewers, repeated sessions, failed runs retained; expand models only after a credible pilot |
| Inspection exposes project secrets or executes code | Bounded read-only collector, exclusions and redaction; no arbitrary execution, upload or permanent evidence store |
| New packs break safe runtime sharing | Immutable version directories and validated data inventories; no in-place augmentation or implicit home writes |

## Proposed first implementation mission — Mission 008

**Title:** Evidence-aware retrieval of existing UDI knowledge.

**Problem:** the current recommendation path selects one profile and returns a capped rule list while existing patterns/anti-patterns are unavailable as first-class results. Domain and application type are conflated. Solve this narrow bottleneck before attempting six full domain packs.

**Authorized scope to request later:** implement the minimum M0/M1/M2 slice: a strict opt-in v2 context/output envelope, ranked eligible profiles, existing pattern/anti-pattern retrieval, coverage accounting, valid conflict explanations, a conservative legacy-type adapter, and original hand-authored context-discrimination fixtures. Use existing catalog entries unchanged; a complete component schema/domain catalog is outside Mission 008. Initial task-to-category mappings may live in core configuration with tests and explicit provenance as engine policy, not disguised catalog additions.

**Out of scope:** component implementations, domain-pack content expansion, arbitrary project scanning, screenshot scoring, remote APIs, embeddings, dependency installation in user projects, installer redesign, publication and Git state changes.

**Acceptance checklist for that later mission:**

1. Existing default CLI JSON and explicit v1 snapshots remain compatible; opt-in v2 is schema-valid and versioned.
2. Repeated/reordered equivalent inputs give stable v2 rankings; all candidate sources obey framework and application gates.
3. Existing `PAT-` and anti-pattern records can be returned with their rule references and original provenance.
4. Each required coverage group is covered or has an explicit unsupported/conflict/budget reason; a small budget never silently drops critical requirements.
5. Profile candidate reasons expose feature contributions, evidence level and ambiguity; no probability claim or fabricated domain expertise.
6. Storefront/admin, public-healthcare/staff, absent-type, unknown-domain, conflicting explicit context and irrelevant-query fixtures pass without changing v1 taxonomy.
7. Selected conflict explanations reference surviving rules; multi-dimension exclusion and competing must constraints have regression coverage.
8. Existing required checks pass using already available dependencies; network-disabled temporary-artifact checks confirm the enhanced runtime's local behavior under the later mission's permissions.
9. Measure size/startup/ranking/RSS/packet bytes against M0; report actual values and any budget revisions.
10. Document capability detection, fallback and migration; no production interface-quality superiority claim before M6.

Review these documents before authorizing Mission 008. Mission 007 itself ends with research artifacts only.

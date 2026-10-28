# Opt-in evidence-aware recommendations

Mission 008 adds an experimental schema 2.0 path. Existing `search`, default `recommend`, `init`, and `doctor` behavior remains unchanged. No catalog records, dependencies, installer architecture, domain packs, or component implementations are added.

## Start with an evidence context

```sh
node packages/cli/dist/index.js recommend --schema-version 2.0 --context tests/mission008/commerce-admin.json --json
```

An installed CLI uses the same arguments after `udi`. A minimal context:

```json
{
  "schemaVersion": "2.0",
  "industry": {"value": "ecommerce", "status": "explicit", "evidenceRefs": ["brief"]},
  "applicationType": {"value": "operations-workspace", "status": "observed", "evidenceRefs": ["src/products/page.tsx"]},
  "roles": [{"value": "merchant editor", "status": "explicit"}],
  "tasks": {"primary": {"value": "product-administration", "status": "explicit"}},
  "framework": {"value": "react", "status": "observed", "evidenceRefs": ["package.json"]},
  "brand": {"preserve": true, "tokens": ["--brand-primary", "--surface"]}
}
```

The CLI reads only the specified regular JSON file, with a 64 KiB cap, and rejects final-path symlinks. It does not scan the project, execute its code, or retrieve evidence references. File references are caller-provided labels, not proof UDI inspected those files. Explicit file paths may be outside the working directory; no automatic path traversal or evidence collection occurs. Filesystem permission and symlink semantics remain platform-dependent.

The strict Zod definitions live in [v2-schemas.ts](../packages/knowledge/src/v2-schemas.ts). Every nested object rejects unknown keys. All evidence-bearing fields use `{value, status, evidenceRefs?, alternatives?}`. `status` is `explicit`, `observed`, `inferred`, or `unknown`; unknown requires null and other statuses require a value. Missing fields default to unknown rather than inferred facts.

Supported application types: `public-information`, `marketing`, `storefront`, `self-service-portal`, `operations-workspace`, `analytics`, `authoring`, `scheduling`, `editorial`. Industry and role names are bounded free text; currently recognized industry IDs for profile eligibility are `ecommerce`, `healthcare`, `banking-finance`, `education`, `developer-tools`, `professional-services`. Other values remain intact with general applicable guidance and a domain coverage gap. Industry never determines application type.

`designSystem` and `brand.identity` are independent evidence fields; brand tokens are supplied strings. `components` is a list of evidence-bearing names included in lexical queries. `tasks.secondary` adds task coverage without replacing the primary task. An optional `query` adds up to 1,000 characters of retrieval terms. No visual-style selection is required.

## Observations, uncertainty, and constraints

`observations` preserves alternative evidence for `industry`, `applicationType`, `primaryTask`, `framework`, `designSystem`, and `brand`:

```json
{
  "schemaVersion": "2.0",
  "applicationType": {"value": "storefront", "status": "explicit"},
  "observations": [{
    "field": "applicationType",
    "evidence": {"value": "operations-workspace", "status": "inferred", "evidenceRefs": ["older-note"]}
  }],
  "uncertainty": [{"field": "primaryTask", "reason": "The current route's primary task has not been confirmed."}]
}
```

Explicit evidence outranks observed, then inferred, then unknown. Multiple distinct explicit values for one field fail with an actionable error. Weaker contradictions remain in alternatives/observations and uncertainty; equally strong nonexplicit values use stable ordering and remain marked ambiguous. Use separate contexts for different application surfaces instead of combining conflicting explicit scopes.

Optional `constraints` entries have a unique `CTX-…` ID, `dimension` (`density`, `motion`, `navigation`, `color`, `brand`), value, strength (`must` or `prefer`), evidence references and scope. Scope defaults to `application`; child scopes look like `application/products/editor`. Ancestor and descendant scopes overlap; sibling scopes do not. Opposing overlapping must constraints are unresolved and appear as conflicting coverage. Mandatory constraints override preferences; overlapping preferences use stable ID order. Legacy rule choices are global, so a global rule incompatible with a local constraint is excluded rather than rewritten into a scoped rule. The engine cannot synthesize new scoped editorial guidance. `brand.preserve` requests preservation coverage; use a must constraint when preservation is a mandatory choice.

## Output, selection, and honest gaps

The packet includes normalized context, engine/catalog/schema versions, up to three eligible profile candidates with additive application/task/industry/role contributions, selected `rule`/`pattern`/`anti-pattern` entities, deduplicated rule references and source metadata, coverage, conflicts, assumptions and pagination.

Profile eligibility is an explicit engine policy over existing profiles; task/role contributions use lexical overlap. Framework and application gates apply to direct rules, profile-linked rules and every pattern/anti-pattern dependency. Missing framework permits only framework-agnostic guidance. Missing application permits global knowledge and the general profile. A specialized profile cannot establish domain expertise merely by sharing keywords.

Independent per-kind BM25 ranks are combined through reciprocal-rank contributions; profile links have lower weight. General accessibility/responsive/recovery/brand coverage is scheduled first, followed by task requirements, then a round-robin mix of ranked entity kinds. Pattern dependencies are included atomically and deduplicated. There is no legacy 14-rule cap on the v2 path.

The initial original engine-policy task IDs are `product-administration`, `browse-products`, `public-information`, and `staff-scheduling`. Unknown tasks are still queried lexically, but get an explicit unsupported task-policy requirement. These mappings are not domain packs or component specifications.

Coverage is category-level accounting, not proof of an entire workflow's correctness:

- `covered`: applicable general guidance is selected for the group.
- `unsupported`: missing knowledge/policy or no compatible match; current media-management, scheduling collisions, and domain-workflow packs are explicitly absent.
- `conflicting`: matching candidates were excluded by choices/constraints, or mandatory constraints remain unresolved.
- `budget-omitted`: compatible guidance exists outside this bounded page.

`coverageComplete` requires every ledger entry covered. Domain context currently produces a domain-workflow gap even if a domain-oriented profile exists. `evidenceLevel` describes context evidence strength, not confidence in design quality. Ranking scores, rank margins and evidence bands are not calibrated probabilities. No aesthetic or interface-quality improvement is claimed.

Every mandatory constraint also has its own coverage entry. A constraint retained in context is not automatically covered: unsupported values remain unsupported, contradictory requirements remain conflicting, and a covered choice must be expressed by a selected surviving rule.

## Budget and expansion

```sh
udi recommend --schema-version 2.0 --context brief.json --budget-bytes 16000 --entity-limit 12 --json
udi recommend --schema-version 2.0 --context brief.json --expand 'v2:KEY:CURSOR' --json
udi recommend --schema-version 2.0 --context brief.json --explain
```

Use the exact `expansion.key` returned by the first request. Keys bind normalized context, engine version and eligible catalog content; they are deterministic fingerprints, not security signatures. Reuse the same context. Different budgets/entity limits are allowed. Default budget is 24,576 bytes; maximum is 1 MiB; entity limits are 1–100. Compact JSON plus its newline is counted exactly. Human-readable output is not byte-budgeted. Explanations are always present in JSON; `--explain` expands readable output.

Pages contain a contiguous prefix of the deterministic candidate schedule with atomic dependencies. Increasing the budget or following expansion retrieves omitted entries; dependency rules can repeat across pages. Coverage is evaluated for the current page, not an accumulated conversation. A context/envelope too large for the budget, or a page unable to fit its next entity with dependencies, fails explicitly. The engine does not silently return an empty continuation or suppress its coverage ledger.

## Migration and fallback

Default `recommend --json` and explicit `--schema-version 1.0` retain the strict v1 contract, profile selection and limits. Enhanced flags require `--schema-version 2.0`. V2 rejects v1 audience/style/brand flags: supply structured evidence in the file. `--framework` may supplement matching/unknown context; a disagreement fails. `--type` uses a conservative adapter: marketing/editorial types supply application evidence; industry-bearing types supply industry only, and SaaS/dashboard/web-app remain application-ambiguous. Conflicting known file/legacy values fail instead of silently replacing evidence.

Before using new flags through an installed launcher, check `recommend --help` for `--schema-version`. An old runtime may also report package version 0.1.0 during local development, so package version alone is insufficient capability evidence. If unavailable, use legacy recommendations and focused searches for missing categories. Keep limitations explicit; no implicit upgrade or network call. This mission does not publish or change the package version. Maintainers must choose a fresh release version before distributing a changed immutable runtime; do not overwrite an existing same-version runtime.

Core APIs export `recommendDesignV2`, `retrieveKnowledgeV2`, `normalizeContextV2`, `adaptLegacyContext`, `mergeLegacyContext`, and `resolveConflictsV2` separately from v1. The first accepts a context, byte/entity/expansion options, and optionally a complete catalog for deterministic testing. The lexical retrieval API supports kind/limit filters and returns an empty array for unrelated queries; recommendations additionally provide declared general coverage fallbacks. No dependency installation or internet access is necessary once the bundled runtime is available.

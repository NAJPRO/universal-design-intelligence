# Recommendation engine evolution

**Proposed architecture; current behavior is documented in [01](01-current-state-audit.md).** Keep core synchronous and deterministic over supplied context, installed packs, versions, and explicit limits. The agent can interpret a brief; the engine must not pretend it independently understands an entire application.

## Boundaries and inputs

Keep schemas/content/integrity in knowledge, ranking/planning in core, and argument parsing/project file inspection in CLI adapters. The skill orchestrates evidence gathering and visual judgment. Do not put screenshot interpretation or an LLM inside the offline retriever.

New context envelope: `schemaVersion`, `industryIds`, `applicationType`, `roleIds`, `tasks`, `components`, `framework`, `designSystem`, `brand`, `locale`, `densityNeeds`, `consequence`, and `evidence`. Each inferred value carries `{value, status: explicit|observed|inferred|unknown, evidenceRefs, alternatives}`. Evidence is bounded and project-relative; avoid absolute paths, file contents or sensitive data in exported packets. Contradictory observations stay visible. An agent-inferred task remains inferred unless the user or code evidence confirms it.

Prefer declarative `--context <file>` over dozens of flags. Context parsing rejects unknown fields, oversized files, unsupported schema versions and path escapes. Inspection reads manifests/configuration/tokens/component exports without executing application scripts or changing files. It never scans credentials or uploads project evidence.

## Deterministic pipeline

1. **Normalize:** validate versions and canonical IDs. Use explicit aliases from reviewed packs (for example SKU → product variant identifier), not unrestricted semantic expansion. Preserve original query terms; expansion has a lower weight and provenance.
2. **Classify:** evaluate application/industry evidence independently. Strong explicit context wins over inferred context; conflicting explicit inputs return a useful validation error. Missing industry remains unknown. Missing application type permits general guidance but no confident domain composition.
3. **Gate:** remove incompatible application types, frameworks and required capabilities. Gate profile-linked content as well as lexical candidates. Missing required domain pack is an explicit coverage gap.
4. **Rank profiles:** score all eligible candidates with feature contributions and show the best three. Use application/task fit before domain, role, style or generic specificity. Profiles guide direction rather than monopolize the candidate pool.
5. **Plan retrieval:** derive required categories/entities from tasks and compositions. Query rules, legacy patterns, anti-patterns, component specs and domain patterns independently, then combine bounded candidates.
6. **Expand references:** resolve required component/rule dependencies locally, deduplicate IDs and cap graph depth at three with explicit truncation evidence. Cycles fail pack validation.
7. **Resolve conflicts:** apply scoped constraints, propagate exclusions and validate selected explanations against the surviving set.
8. **Allocate coverage:** select mandatory task/safety requirements first, then useful variants and refinements. Recheck coverage after conflict resolution and packing.
9. **Package:** emit reasons, evidence, assumptions, exclusions, unresolved requirements and references under the caller's budget. Stable ID ties and fixed serialization ordering guarantee reproducibility.

### Initial ranking hypothesis, not calibrated probability

For eligible profile candidates, use bounded match features in [0,1]: `40*application + 25*task + 15*industry + 10*role + 5*brandCompatibility + 5*style`. Task overlap uses reviewed task IDs; sparse context cannot fabricate a task match. Normalize keyword features so a long profile cannot win simply by listing more words. These are proposed starting weights, to tune on development fixtures only.

Rank retrieved entities by normalized within-kind BM25 contribution plus exact component/task/domain applicability, dependency necessity and priority; subtract duplicate-topic and weak-expansion penalties. Raw BM25 scores from different entity indexes are not comparable. Use deterministic rank fusion (sum `weight/(60+rank)`), then explicit coverage selection; record each contributing list and weight. Freeze weights per engine version. IDF/index changes are retrieval-version changes, not invisible edits.

Example explanation: application=operations 40; product-edit task 25; e-commerce industry 15; merchant role 10; compatible observed tokens 5; no style evidence 0. Storefront candidate fails the application gate despite matching the industry. Unknown industry still permits an operational-table composition when the task supports it.

## Coverage guarantees and budgets

Guarantee **accounting**, not invented relevance: every required category ends as covered, unsupported, conflicting, or budget-omitted. Never claim completeness just because the top results list is full.

For product bulk editing, required groups include entity/scope, table/selection, filters, editing/validation, permission/error/recovery, keyboard/responsive, and brand/density. Domain publication rules become mandatory only if publication is a task. A chart is not mandatory merely because this is an admin.

Proposed default packet budget: 24 KiB UTF-8 serialized JSON, with a rough token estimate explicitly labeled. Reserve space for the envelope/coverage ledger and mandatory contracts. Select at least one applicable item per required group, prioritizing critical requirements. Trim examples and optional guidance before mandatory behavior. If mandatory content cannot fit, set `coverageComplete: false`, list omitted IDs/requirements, and provide deterministic expansion keys. A tiny budget returns an explicit insufficient-budget error if even the envelope cannot fit. No silent 14-rule truncation in the enhanced path.

Example coverage excerpt:

```json
{
  "coverageComplete": false,
  "coverage": [
    {"requirement": "selection-scope", "status": "covered", "ids": ["COM-OPERATIONAL-TABLE"]},
    {"requirement": "publish-review", "status": "unsupported", "ids": []}
  ],
  "assumptions": ["publication rules are not available in installed packs"],
  "expansionKeys": ["COM-OPERATIONAL-TABLE:keyboard"]
}
```

## Conflict semantics

Constraints need `scope` (application/route/composition/component/variant), `dimension`, `value`, `strength` (must/prefer), `condition`, and `sourceId`. Compact operational rows and spacious public editorial content can coexist under different scopes. Global user constraints and required accessibility/functional contracts outrank style preferences. A user-supplied inaccessible token pairing should trigger a concrete conflict with an accessible pairing proposal, not silent brand replacement or inaccessible output.

Resolve must constraints before preferences, then order by evidence strength, task relevance, priority and stable ID. Two incompatible must constraints produce an unresolved conflict and a targeted clarification/remediation, not an arbitrary ID winner. Recompute dependencies and coverage after exclusion. Every selected conflict explanation must refer to retained entities; cycles or unsatisfiable dependencies produce an explicit diagnostic. Reject contradictory packs at build time wherever conditions are statically decidable.

## Confidence and fallback

Expose `evidenceLevel` (`strong`, `mixed`, `sparse`) and a separate rank margin. A score or margin is not a probability. Strong requires explicit/observed application and task evidence without material contradictions. Sparse evidence defaults to safe general guidance and labels candidate alternatives. Calibrate on independently labeled fixtures: plot error rate by evidence band and margin; tune thresholds on development data and report held-out reliability. Only introduce numeric probabilities after calibration with a documented metric and sufficient data.

Fallback order: applicable installed domain+task → task composition without domain overlay → generic component contracts → general principles. Each step reports what is missing. A user-provided unfamiliar industry word must not force an unrelated known domain. Absent exact mappings, prefer framework-agnostic behavior and installed local components; no network lookup or replacement library installation is required.

## Backward compatibility and CLI decisions

The v1 schemas are strict, so adding fields to their JSON is a breaking change for some consumers. Preserve existing `search`, `recommend`, `init`, and `doctor` flags and default output contracts for the first enhanced release. Keep exact legacy behavior under `--schema-version 1.0`; initially this remains the default, including old profile selection and limits. Enhanced behavior is opt-in with `--schema-version 2.0 --context <file>`. A future major/default change needs a migration notice and fixture comparison. Old IDs and catalogs remain readable.

Legacy `--type` maps cautiously: `ecommerce` suggests industry only; `dashboard` suggests an operations/analytics application family but does not identify industry. `fintech` is industry evidence with unresolved public/product application type. Do not manufacture certainty. The legacy path retains its established meanings; mapping applies only in the enhanced adapter. Explicit new context resolves ambiguity, and conflicting new/legacy arguments are rejected with remediation.

| Proposed interface | Justification and limit |
| --- | --- |
| `recommend --schema-version 2.0 --context brief.json --json` | Carries orthogonal evidence and ranked candidates without flag explosion |
| `search --schema-version 2.0 --kind component --context brief.json` | Exposes new entities while retaining legacy rule search defaults |
| `inspect --json` | Optional later read-only CLI collector; justify against useful skill-led inspection first |
| `--explain`, `--budget-bytes`, `--expand <key>` | Inspect ranking, bound context, fetch local omitted details; expansion is version-bound |

No proposed `install component`, remote-registry dependency, automatic pack download, or `doctor` aesthetic score. Enhanced entities can initially be authored in the knowledge package and bundled; separate optional pack packaging is a later measured decision. Versioned packs are data, have a validated engine range, and are covered by runtime hash inventories. Existing exact-version installations and portable execution remain unchanged.

## Performance and provenance

Build a compact local index once per CLI invocation (and reuse for multi-category queries); precomputed indexes are optional after measurement. Store tokens/IDs and minimal display fields, resolving full records on selection. Benchmark corpus growth before adding index machinery. Search source URLs are references, never runtime fetch instructions. Include entity IDs, pack/catalog/engine/schema versions, revision evidence and license-review status in expanded output. Deduplicate identical source metadata at packet scope while keeping entity-to-source links.

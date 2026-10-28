# Professional component intelligence

Component intelligence is an original, offline knowledge layer, not a UI library. It specifies behavior, anatomy, visual relationships, accessibility and recovery for agents implementing a product in its existing stack.

## Opt-in and compatibility

Recommendation output **2.1** adds `component` and `composition` entity kinds and `componentCatalogVersion`. It intentionally uses the existing **2.0 context** format. Default 1.0 and explicit 2.0 output contracts remain unchanged. Strict 2.0 readers should continue requesting 2.0; they must explicitly support 2.1 before opting in. Component specifications have their own `schemaVersion: "1.0"`, revision and catalog version.

```sh
node packages/cli/dist/index.js recommend --schema-version 2.1 --context tests/mission008/commerce-admin.json --json
node packages/cli/dist/index.js inspect CMP-OPERATIONAL-TABLE --json
node packages/cli/dist/index.js inspect CMP-FILTER-WORKSPACE --json
node packages/cli/dist/index.js inspect CMP-RECOVERABLE-FORM --json
node packages/cli/dist/index.js inspect COM-OPERATIONAL-MANAGEMENT --json
```

`inspect` returns the entire local specification, including variants, states, transitions, visual guidance, rule/anti-pattern references, checks and provenance. Unknown IDs fail without partial JSON. These full records are not recommendation packets and do not use the packet byte-budget flag; the built-in records have bounded schema sizes. Inspection validates the entire pack and its legacy references, and returns a copy.

`recommend --schema-version 2.1` accepts `--budget-bytes`, `--entity-limit`, `--expand`, `--json`, `--explain`, and the same framework/type merge controls as 2.0. Its compact JSON plus newline defaults to at most **24,576 bytes**. A packet entry is a short specification summary; it does not contain all implementation guidance. Inspect the stable ID before implementing a component.

## Evidence and selection

The engine requires an eligible application type plus a recognized component request or task term. Role overlap adds a transparent ranking contribution; a role never supplies authorization. Industry does not cause component selection. Unknown application types produce no professional component suggestions. The current lexical terms and aliases are English; they are small declared heuristics, not language understanding.

- Tables require collection/comparison evidence and an operational, scheduling or analytics application. They do not replace a public story, gallery, calendar or spreadsheet.
- Filter workspaces require evidenced query refinement or an explicit compatible request. A storefront can use faceted filters without receiving an operational table or management composition.
- Recoverable forms require entry/edit/save evidence or an explicit compatible request. A single-record edit can receive a form without a table or filters.
- The operational management composition requires collection **and** filter candidates plus an operational task and application. Naming the composition alone does not make it a dashboard default. Table and filter slots are required; the editor slot is optional and selected only with its own task/request evidence.

The fixed score contributions are component request 80, task term 40 and role overlap 10. Within ties, IDs use stable codepoint order. Explanations retain evidence status; inferred inputs remain inferred. Query prose alone is insufficient to establish component applicability; put task evidence in `tasks` or explicit requirements in `components`. Negated adjacent `no`/`without`/`avoid` terms are excluded, but complex negation and arbitrary paraphrases are not semantically interpreted.

Required component dependencies and rule references are resolved transitively, deduplicated and included atomically. Every rule passes the existing application/framework gates and conflict resolver. Incompatible or unavailable dependencies produce `unsupported` coverage, incompatible rule choices produce `conflicting`, and packet omission produces `budget-omitted`. Anti-pattern references in the full specification are integrity-checked inspection references; they are not automatically mandatory packet entities. Existing general category guidance never substitutes for a missing component specification.

Explicit unknown requirements such as `components: [{"value":"calendar","status":"explicit"}]` get an unsupported `component:calendar` entry. Known task matches get `spec:CMP-...` / `spec:COM-...` coverage. Existing domain/task-policy gaps remain visible: selecting a generic form does not establish banking authorization, clinical scheduling or complete domain workflow coverage.

## Expansion and library API

Use a packet's expansion key with the **same context**:

```sh
node packages/cli/dist/index.js recommend --schema-version 2.1 --context brief.json --expand 'v21:<fingerprint>:<offset>' --json
```

Each page is self-contained, including its selected entities' required references. Dependencies may repeat on later pages; consumers merge by ID. The key binds engine version, normalized context, both catalogs and their content. Modified supplied knowledge or context invalidates it. No result/index cache is used. A budget that cannot fit the next complete dependency group fails explicitly rather than emitting partial specifications or a non-progressing cursor.

Private workspace consumers use explicit subpaths, keeping the old retrieval initialization graph isolated:

```ts
import { recommendDesignV21, retrieveComponentSpecs, inspectProfessionalSpec } from "@udi/core/components";
import { ComponentSpecSchema, CompositionSpecSchema } from "@udi/knowledge/component-schemas";
import { validateComponentCatalog, professionalComponents } from "@udi/knowledge/components";
import { RecommendationV21Schema } from "@udi/knowledge/v21-schemas";
```

`retrieveComponentSpecs` is a convenience projection of the complete validated recommendation pipeline with a larger packet budget, not a faster independent scoring engine. Optional supplied legacy/component catalogs are validated per call. Dependency expansion is limited to three edges, and cycles, invalid slot variants, incompatible assemblies and missing required anatomy fail validation.

## Limits and operational use

The new path uses existing Zod/TypeScript infrastructure, one bundled executable and no new dependency or online retrieval. The canonical skill is unchanged; agents can explicitly invoke these documented CLI capabilities when the installed runtime supports them. Older runtimes must continue using their supported commands; there is no automatic upgrade or capability claim based on package version 0.1.0 alone.

The development package version is unchanged. Distributing changed bytes as another immutable installed 0.1.0 runtime is inappropriate: the maintainer must choose a new release version and validate its final tarball. Existing runtimes and launchers remain pinned and must not be overwritten.

Passing contract/retrieval tests establishes structural correctness and bounded selection for the exercised corpus. Keyboard/browser/visual checks inside a specification are instructions for a later rendered implementation, not already executed conformance or aesthetics evidence. There are no frontend implementations, domain packs or premium visual-output claims in this pilot.

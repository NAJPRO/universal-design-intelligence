# Component and composition intelligence

**Proposal throughout.** Examples are original documentation sketches; no schemas or catalog entries are implemented. Source inspiration and rights are recorded in [02](02-ecosystem-comparison.md).

## Knowledge ownership

| Layer | Owns | Does not own |
| --- | --- | --- |
| Primitive | Semantic purpose, anatomy, keyboard/focus behavior, local states, token roles, modality and reduced-motion requirements | Business authorization, route hierarchy, industry-specific approval policy |
| Composition | Relationships among primitives, task hierarchy, layout adaptation, shared selection/filter state, transitions and recovery | Every industry's vocabulary or a universal dashboard layout |
| Domain pattern | Entity meaning, role/task constraints, consequence severity, critical identifiers/units and domain-specific state labels | A replacement primitive implementation or unverified compliance advice |

A combobox is a primitive specification even when its implementation has several parts. An operational table with filters, selection, pagination and detail navigation is a composition. A product bulk-publication workspace overlays product/variant/inventory semantics. Reuse is by references and constrained extension, with conflicts reported rather than silently inherited.

Native elements are preferred when they satisfy requirements. The [W3C APG pattern index](https://www.w3.org/WAI/ARIA/apg/patterns/) distinguishes widgets such as comboboxes, dialogs and grids; UDI must preserve their different behavior contracts. A normal data table should not acquire a grid role just because its rows contain buttons. These are original architectural applications of the reference, not copied pattern instructions.

## Proposed record contract

Use strict JSON Schema 2020-12 source definitions, with TypeScript/Zod parity checks at authoring/build time. The notation below defines reusable record shapes; `Ref` means a stable ID validated against the combined pack inventory, not a network URL. Every object rejects unknown keys. All strings are nonempty unless explicitly stated; arrays have bounded lengths (default maximum 64). Different entity kinds use a discriminated union.

```ts
type SourceEvidence = {
  id: string; url: string; artifact: string;
  revision: string | null; accessedAt: string; // ISO date
  licenseStatus: "verified" | "unresolved" | "reference-only";
  licenseExpression: string | null; // SPDX where applicable
  relationship: "original" | "supports" | "adapted";
  noticePath: string | null; reviewer: string;
};
type Check = {
  id: string; requirement: string;
  method: "schema" | "static" | "browser" | "keyboard" | "visual" | "expert";
  severity: "critical" | "high" | "medium" | "low";
  passEvidence: string;
};
type State = {
  id: string; meaning: string; presentation: string;
  announcement: string | null; availableActions: string[];
};
type Transition = {
  from: string; event: string; to: string;
  guard: string | null; focus: string; failureState: string | null;
};
type ComponentSpec = {
  schemaVersion: "2.0"; kind: "component"; id: string; revision: number;
  name: string; family: string; purpose: string;
  useWhen: string[]; avoidWhen: string[]; taskIds: string[];
  anatomy: { id: string; purpose: string; required: boolean;
    semanticElement: string; tokenRoles: string[] }[];
  variants: { id: string; useWhen: string; partIds: string[];
    overrides: { path: string; value: string }[] }[];
  states: State[]; transitions: Transition[];
  keyboard: { key: string; when: string; result: string; focus: string }[];
  accessibility: { naming: string; semantics: string; checks: Check[] };
  visual: { hierarchy: string; alignment: string; tokenRoles: string[] };
  responsive: { condition: string; restructure: string;
    preservedInformation: string[]; focusContinuity: string }[];
  density: { mode: "comfortable" | "compact"; useWhen: string;
    constraints: string[] }[];
  motion: { purpose: string; trigger: string; reduced: string;
    interruption: string };
  recovery: { stateId: string; explanation: string; action: string;
    preservedData: string[] }[];
  composition: { provides: string[]; requires: string[];
    incompatibleWith: string[]; focusOwner: string };
  frameworkMappings: { framework: string; library: string | null;
    testedVersionRange: string | null; guidance: string }[];
  ruleIds: string[]; antiPatternIds: string[];
  checks: Check[]; sources: SourceEvidence[];
};
```

IDs should use separate namespaces (`CMP-`, `COM-`, `DOM-`, `TASK-`) without renaming existing `PAT-`/`UDI-` IDs. A mapping is a reference to an implementation strategy, not bundled component code. Unknown installed versions produce unverified mapping guidance rather than claimed compatibility.

### Concrete validation fragment and instance

This complete sub-schema validates a transition document independently. A future full component schema composes this definition and adds graph checks; this fragment alone is not the entire entity validator.

```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "urn:udi:proposal:transition:2",
  "type": "object",
  "additionalProperties": false,
  "required": ["from", "event", "to", "guard", "focus", "failureState"],
  "properties": {
    "from": {"type": "string", "minLength": 1},
    "event": {"type": "string", "minLength": 1},
    "to": {"type": "string", "minLength": 1},
    "guard": {"type": ["string", "null"], "minLength": 1},
    "focus": {"type": "string", "minLength": 1},
    "failureState": {"type": ["string", "null"], "minLength": 1}
  }
}
```

```json
{
  "from": "editing",
  "event": "submit",
  "to": "saving",
  "guard": "current role can edit this entity and local validation passes",
  "focus": "retain submit control; announce saving without moving focus",
  "failureState": "save-failed"
}
```

Illustrative component instance excerpt: `CMP-COMBOBOX` has required label/input/listbox parts, optional description/error parts, single-selection and multi-selection variants, and idle/loading/open/empty/error/disabled states. Arrow-key navigation changes the active option according to the selected implementation contract; Escape closes the popup without clearing committed input; Tab follows document focus. Async failure preserves the query and offers retry. On narrow screens the popup stays within the viewport while retaining the input relationship. A token role controls selected-option contrast; reduced motion opens it immediately. This is an excerpt, not a claimed schema-valid full record.

### Validation strategy

Build gates: strict shape/type/length validation; globally unique IDs; version compatibility; references resolve offline; variants name existing parts; transitions name existing states; every recoverable failure has a recovery action; no unreachable non-initial states; required focus owner is unique across nested overlays; contradictory constraints require an explicit resolution or rejection. Bound dependency expansion, reject composition cycles, and ensure source evidence and license eligibility for adapted material. Schema checks cannot establish actual keyboard usability or good visual composition; representative fixtures and expert review remain necessary.

## Minimum component research coverage

All families inherit the full contract above, including empty/error/disabled/loading states where applicable. The table supplies family-specific requirements, not exhaustive implementation recipes.

| Family | Anatomy/variants and visual hierarchy | Interaction/accessibility, adaptation, failure and anti-pattern |
| --- | --- | --- |
| Navigation | Landmark, route groups, current item, workspace scope; top/side/local variants | Links vs disclosure buttons; visible location; compact menu with focus return; preserve destination on collapse; avoid ambiguous nested navigation |
| Forms | Label, control, hint, error, group, submit; inline/sectioned variants | Native grouping and validation associations; preserve input, error summary where useful; stack by task; avoid placeholder-only labels and premature errors |
| Data tables | Caption, headers, cells, toolbar, selection, pagination; read-only/selectable/editable | Semantic table vs interactive grid chosen deliberately; keyboard controls, sort announcement, stable row identity; scoped scroll or prioritized detail; avoid silently dropped columns |
| Filters | Scope, facets, applied conditions, clear/reset; immediate or explicitly applied | Distinguish draft/applied conditions; preserve URL state where appropriate; results count; narrow-screen summary; avoid hidden active constraints |
| Dialogs/drawers | Trigger, named surface, content, actions; modal/nonmodal distinction | Explicit focus entry/containment/return and dismissal policy; unsaved recovery; reflow; avoid nested competing focus traps |
| Menus/commands | Trigger, groups, items, shortcut hints; action vs command-search variants | Library-specific arrow/typeahead behavior; disabled explanation; close/return focus; avoid routing all actions through a hidden palette |
| Search/autocomplete | Label/query, suggestions, status, selected value; local/async | Query and selection differ; announce loading/results; cancel stale results; preserve query on failure; avoid selecting an unrelated first result automatically |
| Calendars/scheduling | Date field, timezone, calendar, availability; single/range/resource | Locale/date entry, keyboard alternative, timezone clarity, collision feedback; agenda fallback; avoid drag-only rescheduling |
| Data visualization | Title, units, scale, series, summary, exact values | Non-color encoding, text/table access, explicit missing/freshness states; responsive labels; avoid unlabeled axes and decorative misleading metrics |
| File uploads | File input/drop zone, queue, progress, retry/remove | Keyboard file selection, per-file error, format/size limits, cancellation; server validation boundary; avoid drag-only upload and false completed states |
| Media management | Asset list, preview, metadata, selection, crop/replace | Alt-text and rights fields, focus-safe preview, failed thumbnail, non-drag reorder; responsive inspector; avoid icon-only destructive actions |
| Notifications/feedback | Inline message, banner, toast, inbox; severity/action variants | Appropriate announcements without repeated interruption; persistent critical recovery; avoid toast-only failure and disappearing consequential messages |
| Authentication | Identifier, credential/passkey route, challenge, recovery, session state | Password-manager/paste support; clear expiration, safe redirect and generic sensitive account errors; avoid memory/puzzle barriers or fake security badges |
| Multi-step workflows | Step status, content, back/continue, review, draft | Preserve entered data, resumability and failed submission; visible current task; mobile linearization; avoid a decorative stepper with no recovery semantics |
| Complex editors | Document/canvas, toolbar, inspector, history, save state | Keyboard edit modes, accessible alternatives, undo, conflict resolution, autosave failure; narrow-screen task switching; avoid assuming a table is a spreadsheet |

## Composition contract

```ts
type CompositionSpec = {
  schemaVersion: "2.0"; kind: "composition"; id: string;
  taskIds: string[]; eligibleApplicationTypes: string[];
  slots: { id: string; entityId: string; required: boolean;
    priority: number; revealsAfter: string | null }[];
  relationships: { from: string; to: string;
    type: "filters" | "selects" | "edits" | "summarizes" | "approves";
    sharedState: string[] }[];
  navigation: { maxLocalDepth: number; deepLinkState: string[] };
  layoutModes: { condition: string; orderedSlots: string[];
    density: string; restructuring: string }[];
  states: State[]; transitions: Transition[];
  invariants: Check[]; ruleIds: string[]; sources: SourceEvidence[];
};
```

Choose assemblies by task frequency, consequence, comparison needs and concurrency. These are evidence-backed context fields, not a presumed agent ability to deduce every user's real work. Relationships carry state: filters scope the table; selection scopes batch actions; detail edits invalidate the relevant result; approval needs the reviewed revision. Narrow layouts may replace side-by-side detail with a route while preserving scope and return location.

| Assembly | Task-driven hierarchy and distinguishing constraint |
| --- | --- |
| Enterprise shell | Workspace identity → primary task navigation → contextual actions; collapse secondary groups, retain current location |
| Product management | Product identity/status → variants/media/inventory → publish readiness; bulk scope and partial failures visible |
| Master-detail | Stable collection/filter → selected identity → detail; deep-link selection and return position |
| Operational table | Exceptions/action queue before secondary metrics; selection count and scope stay explicit |
| Multi-step editor | Task sections, draft/save state, then review; route changes preserve edits |
| Approval workflow | Evidence/revision/difference → decision → audit outcome; concurrent changes invalidate review |
| Clinical workspace | Patient/context identity → relevant task queue → encounter detail; never bury identity in a dismissible panel |
| Banking review | Account/transaction identity → amount/currency/status → evidence and decision; duplicate execution guarded |
| Property workspace | Property/unit/occupancy scope → leases or maintenance queue → timeline; public location/media view is separate |
| Academic gradebook | Course/period scope → student-assessment matrix → edit/publication status; missing differs from zero |
| Sports competition | Competition/round/live-state scope → fixtures/results → corrections; live update and official result differ |

Do not start each assembly with four KPI cards. A public event page prioritizes discovery and participation; an official's competition console prioritizes live incidents and scoring integrity. Layout modes derive from the assembly's relationship graph and task constraints rather than an industry-colored universal dashboard.

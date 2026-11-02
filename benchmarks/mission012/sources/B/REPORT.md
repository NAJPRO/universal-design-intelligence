# Tern Works implementation report

Implemented the dependency-free inventory workspace in [index.html](index.html), [styles.css](styles.css), and [app.js](app.js). The provided data.js and tokens.css were not edited. No dependencies, remote assets, external services, Git commands, or delegation were used. Generated source is original MIT-compatible work.

## Decisions and assumptions

- Desktop uses a semantic table with complete product names, SKU/category metadata, status, stock, price, supplier, lead time, and contextual actions. All 18 records are available without pagination. Numeric columns align right. The table has native scrollbars and keyboard scrolling.
- Below 701px, the same record nodes become readable cards. Compare table restores horizontally scrollable comparison at any width. CSS changes preserve DOM identity and focused controls during resize.
- Search matches name or SKU without case sensitivity. Category, status, and stock filters combine with AND. Stock options explicitly define zero, 1–10 and 1+. Conditions can be removed individually or cleared together. Counts describe matching versus total records; overview figures always describe the entire inventory.
- Product-name buttons open complete details including record ID and the exact permission explanation. Authorized editing covers name, stock and price. Category, lifecycle and sourcing fields remain read only; this scope follows the task's three validation requirements.
- Stock must be a nonnegative safe whole number. Price must be finite and greater than zero. Linked summary and field errors retain entered values. Successful saves update records and overview, acknowledge the SKU, and restore the originating control or collection heading if the record leaves the filtered result.
- Unsaved Cancel, close, and Escape offer explicit discard or keep editing. Escape in confirmation preserves input. A native before-unload warning protects dirty edits when leaving the page.
- Permission and editor identity are held in application state independently of editable DOM hooks. Entry and save both check the original permission map. A forged restricted edit action is rejected, and changing the form's record ID cannot retarget saving.
- Prices are USD. Changes and filters last for the current page session, as stated in the interface. Reload restores the provided fixture; no persistence or backend was requested.
- Empty, loading and error query states are deterministic. Loading waits for user recovery. Recovery loads the local inventory. Empty collection and no filter matches have distinct explanations and recovery actions.

## Knowledge applied

The local udi-design launcher reported version 0.1.0 and advertised schema 2.1 and inspect support. [design-context.json](design-context.json) records evidence and [design-guidance.json](design-guidance.json) preserves the bounded recommendation. All three selected component contracts were inspected locally. No external reference links were visited.

| Knowledge ID | Specific implementation informed |
| --- | --- |
| CMP-OPERATIONAL-TABLE; UDI-DAT-001; UDI-DAT-004 | app.js renderResults(): semantic headers, stable record identity, comparable values and contextual actions. Pagination omitted for 18 local records. |
| UDI-RSP-004; PAT-RESPONSIVE-TABLE; UDI-ANT-009 | styles.css mobile cards, force-table override and labeled focusable table-scroll region. |
| CMP-FILTER-WORKSPACE; UDI-SAA-002 | app.js filtered(), renderChips() and renderResults(): immediate criteria, visible scope, removable conditions, result counts and recovery. No URL persistence or advanced filter modal was needed. |
| CMP-RECOVERABLE-FORM; UDI-FOR-001; UDI-FOR-002; UDI-FOR-004; PAT-VALIDATED-FORM | app.js openEdit(), save() and cancellation: labels, linked errors, preserved input, unsaved status and explicit discard. |
| UDI-ACC-002 | Native modal, focus indicators, validation focus, Escape handling, return focus and same-node responsive layout. |
| UDI-COL-002; UDI-INT-001 | Text lifecycle/status labels, out-of-stock/read-only explanations, pressed layout controls and hover/focus treatments. |
| UDI-SAA-004; UDI-INT-003 | app.js stateMarkup() and state branches: explanatory loading/empty/error states with recovery. |
| UDI-SYS-001; UDI-SYS-005 | Existing brand and semantic tokens reused in styles.css, system font and original local wordmark. |

The recommendation reported no conflicts, but marked domain-task coverage unsupported: generic contracts and heuristics do not establish domain completeness. Task-specific implementation and browser verification provide the additional evidence here.

## Checks actually run

- node --check app.js passed after an initial template-string syntax error was corrected.
- node verify.mjs passed all 39 checks. Source: [verify.mjs](verify.mjs). Results: [verification.json](verification.json).
- Checks cover 18 products/14 edit controls, case-insensitive SKU search, combined facets, active chips, empty-result recovery, editor focus, blank name/negative fractional stock/infinite price rejection, retained values, error links, unsaved cancellation, Escape, successful zero-stock save, acknowledgement, return focus, discard, restricted detail explanations, forged edit rejection and DOM record-ID tampering.
- At 320, 375, 768 and 1440px: no horizontal page overflow, input/focus continuity through resize, and Save reachable at 480px height. Mobile comparison scroll was exercised with ArrowRight; Tab from search to category passed.
- All deterministic empty/loading/error states and recovery routes passed. Loading remained pending after an additional wait. Capture outputs reported no runtime exceptions; the final-navigation exception check passed as well.
- Visually reviewed browser captures: [desktop.png](desktop.png), [tablet.png](tablet.png), [mobile.png](mobile.png), [mobile-record.png](mobile-record.png), [editor.png](editor.png), and [error.png](error.png). Also captured [empty.png](empty.png) and [loading.png](loading.png).
- Keyboard testing found Escape could close the dialog during confirmation. An explicit key handler now prevents native dismissal and preserves input. The complete suite passed after correction.
- tools is read only; an attempted test-file creation there failed without changing it. The verification script was created in the workspace root instead.

## Remaining limitations

- Storage is in memory for the page session. There is no server authorization boundary or durable persistence. Permission checks protect against UI manipulation, not arbitrary replacement of application code.
- Verification used local headless Chrome. No screen reader, other browser engine, real touch device or automated accessibility audit was run. This is not a claim of full accessibility conformance.
- Saving is synchronous and local, so there is no simulated network save failure. Required inventory error and retry states are implemented and tested.

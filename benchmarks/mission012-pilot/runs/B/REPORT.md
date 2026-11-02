# Tern Works implementation report

Implemented a dependency-free inventory workspace in [index.html](index.html), [styles.css](styles.css), and [app.js](app.js). The supplied data.js and tokens.css were retained without edits. Generated application source is original, MIT-compatible work. No dependencies, remote assets, services, Git operations, or delegation were used.

## Decisions and assumptions

- The [comparison table and responsive cards](styles.css) expose complete names, SKU, category, status, stock, USD price, supplier, and lead time. Wide screens default to a table; narrow screens default to cards. A Table/Cards switch works at all widths. Comparison scrolling is contained, keyboard-accessible, and explicitly described when constrained. Card mode retains table headers for assistive technology.
- [Filters and results](app.js) combine case-insensitive name/SKU substring search with category, lifecycle, and stock availability using AND. Low stock means 1–10 units; zero stock has a separate filter. Active filters can be removed individually or together. Results count the filtered set; overview metrics describe all available inventory.
- [Product details](app.js) expose record ID and the complete permission explanation. Names wrap rather than truncate. Restricted products have a View only label and no edit control. Editor entry and save both check a separate permission map derived from the original data, rather than trusting DOM attributes.
- [Editing](app.js) uses a native modal dialog for name, stock, and price. Other metadata stays consultable. Validation retains submitted text, identifies each invalid field, and focuses the first error. Successful saves update views, metrics, and filters and show acknowledgement. Blank names, blank/noninteger/negative stock, and nonfinite/nonpositive prices are rejected.
- Cancel, close, and Escape check for unsaved changes and offer Keep editing / Discard changes. Leaving a dirty editor requests the browser's standard navigation warning. Native modal behavior contains focus; explicit focus restoration returns to the product control or results heading if the edited record no longer matches the filters.
- Prices are assumed to be USD and stock to be whole units. Edits last in memory for this page session; the interface discloses that limitation. No server persistence is implied.
- Query states ?state=empty, ?state=loading, and ?state=error are deterministic. Loading does not complete automatically. A recovery button loads the sample inventory. Error/loading metrics show unknown values; empty inventory shows zero. Filtered zero-results has its own clear-filters recovery.

## Verification actually run

JavaScript syntax check passed: node --check app.js.

Local browser verification commands:

```
PATH="/work/browser-bin:$PATH" node verify.mjs
PATH="/work/browser-bin:$PATH" node verify-extra.mjs
```

[verify.mjs](verify.mjs) passed 23 checks; [verify-extra.mjs](verify-extra.mjs) passed 11 checks. These exercise:

- All 18 records, 14 authorized edit controls, SKU and case-insensitive name search.
- Combined filters, chips, clearing, counts, and no-match recovery.
- Restricted details and permission explanation, plus forged restricted edit rejection.
- Blank name, fractional/negative/blank stock, zero/NaN/infinite price, input retention, and error feedback.
- Valid zero-stock save, updated values, acknowledgement, focus restoration, discard, and preservation of previously saved values.
- Enter activation, Tab navigation, clean and dirty Escape, responsive focus preservation, and return focus when a saved product no longer matches the search.
- Desktop 1440px, tablet 800px, mobile 375px, and reduced-height 320 × 320px. No horizontal page overflow; contained comparison scrolling; Save remains reachable in a short editor.
- Every deterministic state and recovery, including loading remaining until user action.
- Runtime exception monitoring during checked flows; no application exceptions observed.

Visually inspected [desktop](desktop.png), [tablet](tablet.png), [initial mobile](mobile-initial.png), [mobile editor](mobile-editor.png), [short editor](short-editor.png), [error](error.png), and [loading](loading.png) captures. Corrected unknown metrics in the error state and enlarged mobile targets during review. An initial overflow assertion was corrected to allow vertical scrollbar width; the page had no horizontal overflow.

The supplied capture tool initially could not launch google-chrome; the available executable is google-chrome-stable. [A local shim](browser-bin/google-chrome) resolves that name without installation. The capture tool's empty route returned Not found, so verification uses the provided tools/browser.mjs directly with explicit index.html navigation. Tool sources were not modified.

## Design knowledge and limitations

Read the available [udi-design skill](.agents/skills/udi-design/SKILL.md), CLI instructions, and design-quality checklist. The local launcher failed at startup on --version with TypeError: Cannot read properties of undefined (reading 'showHelpAfterError'). No recommendations or capability output were returned, and no runtime installation was attempted. No catalog knowledge IDs were retrieved or used; none are claimed. The general skill checklist informed responsive review, visible focus, and explicit recovery and validation feedback in the linked implementation.

This is a fictional browser workspace without backend authorization or durable storage. No automated accessibility audit, screen-reader session, other browser-engine validation, or physical touch-device test was performed. Native semantics, labels, live announcements, visible focus, modal behavior, and keyboard flows were reviewed and tested as described. There is no interface animation; reduced-motion preferences require no animation fallback. Navigation warnings depend on browser policy.

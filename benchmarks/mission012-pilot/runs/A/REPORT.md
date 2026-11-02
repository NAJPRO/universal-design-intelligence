# Tern Works implementation report

Completed a dependency-free inventory application in [index.html](index.html), [styles.css](styles.css), and [app.js](app.js). The supplied `data.js` and `tokens.css` were not changed. No dependencies, remote assets, external services, Git operations, or delegated work were used.

## Decisions and implementation

- **Comparison and individual consultation:** The catalog is a semantic table on desktop and tablet, with full wrapping product names, SKU, category, lifecycle status, stock, unit price, and access. At phone widths CSS transforms the same records into cards, preserving focused elements. The tablet table has a visible scrolling instruction and a keyboard-focusable scroll region. See `render()` in [app.js](app.js) and responsive rules in [styles.css](styles.css).
- **Complete record access:** Clicking any product name opens a modal containing full identity, supplier, lead time, stock, price, lifecycle, and permission explanation. Restricted products remain consultable. See `detailMarkup()` in [app.js](app.js).
- **Finding records:** Search matches name/SKU without case sensitivity. Category, status, and stock filters combine with search. Active filters can be individually removed or cleared together; result counts are announced. See `matchingRecords()`, `render()`, and filter listeners in [app.js](app.js).
- **Authorized editing:** Source permissions are captured separately from mutable session records and checked both before opening an editor and at the save boundary. Injecting an edit control for a restricted ID does not open an editor. The currently edited record ID is internal module state, independent of editable DOM attributes. See `permissions`, `showRecord()`, and `save()` in [app.js](app.js).
- **Validation and cancellation:** Blank names, negative/fractional stock, and nonpositive/nonfinite prices fail validation without rerendering the form. Errors are attached to their inputs; focus moves to the first invalid field. Successful saves update the catalog/metrics and announce confirmation. Cancel, close, and Escape prompt before discarding dirty values; keeping edits preserves them. See `save()`, `dirty()`, and `requestClose()` in [app.js](app.js).
- **Focus and accessibility:** Labeled controls, semantic headings/table, a skip link, focus outlines, live result/save messages, native modal behavior, explicit Tab wrapping, and focus return after saving/closing. CSS layout changes retain the same DOM. Dialogs scroll within reduced viewport height. Reduced-motion preferences are respected. See [index.html](index.html), dialog handlers in [app.js](app.js), and [styles.css](styles.css).
- **States:** `?state=empty`, `?state=loading`, and `?state=error` produce deterministic states. Loading remains pending until recovery is clicked. Each state has a recovery action; a separate no-match state clears filters. See `requestedState` and `render()` in [app.js](app.js).

## Assumptions

Prices use USD; price input accepts any finite positive value and display uses currency rounding. Stock is a safe integer, with low stock defined as 1–10 units. Overview metrics describe the whole loaded catalog rather than filtered results. Stock value is the sum of stock multiplied by unit price, including all lifecycle statuses. Sample data recovery is appropriate for this fictional, local-only workspace. Edits persist in memory for the current page session and reset on reload, as stated in the interface.

## Verification actually run

- `node --check app.js` and `node --check verify.mjs`: passed.
- `PATH="/work/browser-bin:$PATH" node verify.mjs`: **31 checks passed**. Detailed results are in [verification-results.json](verification-results.json), with the repeatable harness in [verify.mjs](verify.mjs).
- Browser checks covered 18 populated records; combined filters; SKU search; clear-all/individual removal; no-match recovery; restricted record details; injected restricted edit prevention; authorized editing; retained invalid inputs; fractional stock rejection; dirty cancellation; keeping edits; successful save and focus return; discard; synthetic and physical Escape; all three deterministic states and recovery; persistent loading; layout-change focus; mobile/desktop overflow; tablet table scrolling; short-height dialog scrolling; and Tab wrapping.
- Examined captures at 1440px desktop, 375px mobile, 768px tablet, and a 375×480 editor viewport: [desktop.png](desktop.png), [mobile.png](mobile.png), [tablet.png](tablet.png), and [editor-short.png](editor-short.png). No page-wide horizontal overflow was detected. No runtime exceptions were reported by the final browser check.
- The provided capture command first failed because `google-chrome` was missing. A local wrapper in [browser-bin/google-chrome](browser-bin/google-chrome) invokes the installed `google-chrome-stable`. The supplied capture entry point also navigated to a double-slash URL that returned “Not found”; the verification script uses the same browser harness with explicit `index.html` navigation. No supplied tools were modified.
- Keyboard testing found that native modal navigation could leave the page at the final control. Explicit wrapping was added and the complete suite rerun successfully. Initial overflow assertions also incorrectly required equality with `innerWidth`, which includes the vertical scrollbar; corrected checks assert that document width does not exceed viewport width.

## Remaining limitations

This is an in-memory local application with no backend or cross-session persistence. Permission guards enforce the provided UI/module data paths; a production deployment would also require server authorization. Screen-reader software and browsers other than the installed Chrome variant were not tested. At intermediate widths the comparison table requires horizontal scrolling. Screenshots are viewport captures, not full-page captures.

## Knowledge provenance

No knowledge IDs, external references, or project skills materially informed this implementation. Decisions came from TASK.md, the provided data/tokens, and local browser findings, linked above to their specific implementation.

# Tern Works implementation report

## Delivered

A dependency-free inventory interface using the original, unmodified [data.js](data.js) and [tokens.css](tokens.css). All newly written source is original and MIT-compatible. No remote assets, services, installed dependencies, Git commands, or delegation were used.

## Decisions and assumptions

- **Comparison and consultation:** [index.html](index.html), [app.js](app.js) and [styles.css](styles.css) provide an aligned desktop comparison table with wrapped, complete product names. The same records become labeled cards below 700px, preserving content and focused controls during resizing. Tablet tables have a visible scrolling instruction and a keyboard-focusable scroll region. Desktop table headers remain visible during internal scrolling.
- **Complete records:** Every product name opens a detail dialog containing identity, SKU, category, lifecycle status, stock, price, supplier, lead time, and permission explanation. Supply fields also appear directly in the table/cards. Editor dialogs retain the product identity and explain editing permissions.
- **Finding products:** [app.js](app.js) combines case-insensitive name/SKU substring search with category, status, and stock filters. Active chips can be removed individually or cleared together. Stock bands are explicitly defined as zero, 1–10, and 11+. Result counts describe the filtered catalogue; overview figures always describe the full catalogue.
- **Editing:** [app.js](app.js) keeps permission authority and the current editing identity inside module scope, independently of DOM attributes and form fields. Both opening an editor and submitting changes check permission. Only name, stock, and price are editable. Stock must be a nonnegative safe integer written in digits; price must be finite and positive. Invalid values stay in the form with field-specific explanations. A save updates rows, overview totals, and a live acknowledgement.
- **Cancellation and focus:** [app.js](app.js) uses native modal dialogs for keyboard focus containment. Cancel, close, and Escape request confirmation when the form is dirty. Keep editing retains all values. Closing returns focus to the original control, its replacement after rendering, or the inventory section if an edit removes the record from current results. Dirty edits also trigger the browser's normal navigation protection where supported.
- **Data assumptions:** Prices are USD per unit; lead times are days; inventory value is stock multiplied by unit price across all lifecycle statuses. Changes last only in the current loaded tab and reset on reload; this is disclosed in the interface. No persistence or backend authorization service was requested or introduced. Client-side permission enforcement covers application interaction and DOM manipulation; it is not a security boundary against a user rewriting application JavaScript.
- **States:** [app.js](app.js) renders deterministic `?state=empty`, `?state=loading`, and `?state=error` views. Loading waits for an explicit recovery action. Retry/load controls restore the fictional catalogue. Filtered zero-result views offer a clear-filters recovery.
- **Visual/accessibility:** [styles.css](styles.css) builds on the supplied brand colors, uses native system fonts, visible keyboard focus, reduced-motion support, and scrollable dialogs bounded by viewport height. At 360px and narrower, filters stack and the value metric spans the overview to avoid cramped labels.

## Verification actually run

- `node --check app.js` — passed.
- `node verify.mjs` — **44 checks passed**, rerun after the final responsive adjustment. The original verification script is [verify.mjs](verify.mjs); the complete list of passing checks is [verification.json](verification.json).
- Checks cover initial row/edit counts; combined filters and counts; trimmed SKU search; removable chips; no-match recovery; restricted record detail access; forged restricted edit controls in both catalogue and dialog; retained invalid input and error focus; dirty cancellation/keep/discard; zero-stock save; acknowledgement; DOM identity tampering; focus return through detail-to-edit transitions and filtered-out saves; every deterministic state and recovery; persistent loading; responsive focus preservation; and reduced motion.
- Browser geometry and real Escape key checks passed at **320×640, 375×667, 768×600, 1024×768, 1440×520, and 1920×1080**. No page-level horizontal overflow; editor bounds stayed inside each viewport.
- Used the supplied capture tool and visually inspected [desktop.png](desktop.png), [mobile.png](mobile.png), [mobile-320.png](mobile-320.png), and [editor.png](editor.png). Capture runs reported no runtime exceptions. The 320px review prompted the final stacked-filter adjustment; its capture was regenerated afterward.

## Remaining limitations

Verification used the supplied local Chromium harness, not a cross-browser or assistive-technology matrix. The application intentionally has no durable storage, network synchronization, authentication, or server authorization. The demonstration error/loading states represent local fixtures rather than real network requests.

## Knowledge provenance

No knowledge IDs were supplied or used. Implementation choices came from TASK.md, AGENTS.md, the provided data/tokens and browser tools, and the local verification described above. No project skills or external references were consulted.

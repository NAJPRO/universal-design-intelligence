Build a polished, usable product administration interface for fictional Northstar Supply. The user is a catalog editor managing the supplied 12 products. Primary tasks: compare products, search/refine the collection, and edit an authorized product without losing work.

Use this starting codebase's native HTML/CSS/JavaScript modules, tokens and exact data. No dependencies, network services, remote assets, fonts, frameworks, or reference sites. Preserve tokens.css and data.js. Implement in app.js, styles.css and index.html; helper modules allowed. All work stays in your assigned directory. Do not use other skills or inspect sibling runs, repository docs, other agent outputs or external project context. No Git state changes. No publishing.

Requirements:
- Semantic product table: name, SKU, category, status, stock, USD price, permitted edit action. Preserve access to long names. Read-only products explain the permission restriction and cannot be changed.
- Search name/SKU; advanced filters for status, category and low stock (<=5); combine filters; show result count and allow clearing filters.
- Editor for name, category, status, nonnegative stock and positive price. Save updates the in-memory collection; Cancel discards edits; invalid save preserves input and explains errors. Warn before discarding unsaved changes. Clearly acknowledge save.
- Loading, empty and error collection states. Error has Retry; filter-empty has Clear filters. Query parameter ?state=populated|empty|error|loading sets reproducible initial state (default populated). ?edit=NS-1001 opens an editable product for capture. Retry resolves to populated. No artificial delay for populated state.
- Responsive at 375, 768 and 1440 CSS pixels; keyboard access, visible focus, labels, status/error announcements. Preserve brand tokens; provide coherent visual hierarchy and spacing.
- Do not add features outside this task (no auth service or backend). State unsupported production requirements in evidence.json.

Common tools: shell/file tools, Node 22, Python 3, Google Chrome headless. You may render with google-chrome --headless --no-sandbox --disable-gpu --screenshot=<path> --window-size=375,1000 --no-pdf-header-footer file://<absolute>/index.html (modules need HTTP; use python3 -m http.server on a unique port). Save evidence.json with exact commands, checks performed, applied knowledge IDs mapped to concrete decisions (empty for no skill), unsupported requirements and limitations. Do not claim unseen visual quality.

Budget: at most 12,000 output tokens and 12 minutes wall time, at most two implementation/review passes. Finish when functional and report actual checks. The controller will capture screenshots and evaluate all three outputs after they are frozen. Do not read the evaluation results or other runs. Your condition-specific skill is the only allowed design guidance beyond this task.

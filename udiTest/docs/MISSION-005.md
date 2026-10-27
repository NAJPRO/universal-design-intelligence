# Mission 005 — Lamborghini showcase remediation

This is a correction of the existing website, not a replacement design. Black and acid yellow, the editorial sans/italic-serif pairing, the cinematic sections, all three models, the engineering narrative, the journal, and the closing exploration spread are retained.

## UDI integration

Read the globally installed `/home/audin/.agents/skills/udi-design/SKILL.md` and its CLI and design-quality references. Executed the installed launcher for both `recommend` and `search`. Selected **PRO-EDITORIAL / Editorial publication**, catalog 1.0.0, with `--preserve-brand`, `--framework nextjs`, the luxury automotive audience, and the existing black/acid-yellow direction. Exact responses are stored in `docs/udi/mission-005-recommendation.json` and `docs/udi/mission-005-search.json`.

No UDI application dependency was installed. No UDI source repository was accessed or modified. No Git state-changing commands or publishing operations were performed.

## Defect-by-defect report

| Original issue | Root cause | Files modified | Correction | Test evidence | Final status |
| --- | --- | --- | --- | --- | --- |
| Text-spacing overlap and clipping at 320/375px; fragile enlargement | Fixed/max-height hero with independently absolutely positioned copy and specifications | `src/app/globals.css`, `tests/remediation.spec.ts` | Text and specifications now occupy normal document flow; content can expand vertically and long words wrap. Header and story copy also reflow. Photo layers are bounded independently. UDI-ACC-003, UDI-RSP-001, UDI-TYP-005. | Separate 320px and 375px spacing-override tests; separate simulated 200% text-only tests; native Chromium zoom test; bounding-box and horizontal-overflow assertions | Fixed |
| Mobile hero undersampling | Landscape `sizes="100vw"` ignored the much larger image area needed by cover cropping; all derivatives capped at 1920px | `src/components/hero-photograph.tsx`, `src/app/page.tsx`, `next.config.ts`, `scripts/optimize-images.mjs`, image assets and inventory | Native-resolution 1:2 portrait and 2:1 landscape crops. Picture media selection uses Next-generated srcsets with cover-aware slot budgets. No source enlargement. UDI-RSP-001; image pixel-budget calculation is a project-specific addition, not an invented UDI rule. | Encoded image bytes decoded with Sharp; actual cover scale × DPR must be ≤1.01 at 375px DPR 1/2/3, 768px DPR 2, 1440px DPR 2, and 2560px DPR 2; source-crop generation assertion | Fixed |
| Mobile menu Tab skips opened destinations | Disclosure trigger followed the navigation in DOM order | `src/components/navigation.tsx`, `src/app/globals.css`, tests | Trigger precedes navigation. Tab enters first link; Escape closes and returns focus; Tab can leave the last link without trapping. Open menu participates in document flow. UDI-ACC-002, UDI-NAV-005. | Dedicated Enter/Tab/Escape/focus-return/nonmodal-exit regression | Fixed |
| Active indicator remains stale outside sections | Intersection observer only set active state when entering a tracked section; never cleared it | `src/components/navigation.tsx`, tests | A requestAnimationFrame-throttled scroll/resize reader determines the section intersecting a reading line and clears state over the hero or final CTA. UDI-NAV-002. | Current marker asserted in collection, absent after returning to top and entering final exploration section | Fixed |
| “Discover the Revuelto” can show a previously selected Urus | Anchor destination did not reset explorer state | `src/app/page.tsx`, tests | Hero CTA is honestly labeled “Explore the collection”; it preserves the user's selected model. UDI-NAV-002 and UDI-SYS-002 inform predictable navigation and state ownership. | Select Urus, use hero CTA, assert collection destination, accurate label, and retained selection | Fixed |
| Microscopic labels and metadata | Many unrelated 5–13px font declarations without semantic roles | `src/app/globals.css`, `src/components/icons.tsx`, tests | Shared body 1rem, label .8125rem, and caption .75rem roles; informative captions/spec labels are at least 12 CSS px at default settings, body paragraphs at least 16px. Wordmark descriptor shortened to “INDEPENDENT CONCEPT” to retain readable size. Display typography remains fluid. UDI-TYP-001, UDI-TYP-002, UDI-TYP-003, UDI-SYS-001. | Computed-font-size regression, text enlargement tests, and visual review | Fixed |
| Blank/broken model and story transitions | Images unmounted immediately without decoded-frame retention, pending state, or recovery | New `src/components/resilient-image.tsx`; explorer/story integrations; `globals.css`; tests | Keep the previous decoded photo with its truthful alt text, keep replacement hidden until decode, show a loading status, expose error text and retry, and retain functioning model/chapter controls. Initial failure has a text fallback. Story feedback occupies its own row and never covers controls. The model error frame grows on narrow screens so its message and retry button remain fully visible. UDI-INT-001, UDI-INT-003, UDI-SYS-004, UDI-ACC-005. | Aborted requests, pending requests, retained-frame visibility, retry success, switching model/chapter after failure, and 375px feedback bounds | Fixed |
| Inconsistent imagery, competing cars, unsafe crops | Event/showroom assets chosen for availability, shared cover crops, no art-direction pipeline | Three new licensed original sources, seven derivatives, `scripts/optimize-images.mjs`, `src/app/credits/page.tsx`, model/story data, journal image | Replace yellow fenced hero, Rolls-Royce exterior scene, crowded Urus photo, and cyan-lit two-car Temerario scene. Use orange Revuelto exterior/detail, a sole foreground Urus, a rear Temerario crop, and cockpit detail without windshield spectators. Collection photos use contain to preserve the model. UDI-VIS-001 from prior audit; UDI-MKT-004 supports relevant explanatory imagery. | Source/license review, visual inspection of each original and crop, generated source inventory, mobile/desktop snapshots | Partially fixed: foreground competition and subject clipping addressed, but photographs are still from different locations; the Temerario retains distant parked cars through the showroom window. No claim of a uniform commissioned campaign. |
| Wide-screen alignment and arbitrary spacing | Header/footer gutters diverged from capped editorial sections; spacing values were not shared | `src/app/globals.css`, tests | One content width and shared rail calculation align header, hero, collection, engineering, journal, and footer. Shared spacing roles govern section rhythm, major gaps, and feedback controls. UDI-LAY-002, UDI-LAY-003, UDI-SYS-001. | All six rails must agree within 1 CSS px at 2560px; responsive screenshots | Fixed |

## Image delivery and licensing

The pipeline records original dimensions, crop rectangles, derivative dimensions, and byte counts in `docs/udi/mission-005-image-inventory.json`. Sharp uses `withoutEnlargement: true`; a 2350px Temerario crop remains 2350px rather than being relabeled as a 3840px source.

The hero background is capped at 1100 CSS px. Its 1:2 portrait has a conservative 550 CSS px width budget; its 2:1 landscape has a 2200 CSS px budget, increased to the viewport width when wider. Next selects the appropriate rendition for the device pixel ratio. The 1920×3840 portrait and 5120×2560 landscape are genuine downscales from 2000×4000 and 6000×3000 native source crops. Further enlargement of text extends the dark section without stretching the photographic layer indefinitely.

Active source records:

- **Revuelto:** [Lamborghini Revuelto.jpg](https://commons.wikimedia.org/wiki/File:Lamborghini_Revuelto.jpg), photograph by **江草慧至**, **CC BY-SA 4.0**, original 6000×4000.
- **Urus SE:** [Lamborghini Urus SE DSC 9099.jpg](https://commons.wikimedia.org/wiki/File:Lamborghini_Urus_SE_DSC_9099.jpg), photograph by **Alexander Migl**, **CC BY-SA 4.0**, original 4763×2516.
- **Temerario:** [Lamborghini Temerario (54305252560).jpg](https://commons.wikimedia.org/wiki/File:Lamborghini_Temerario_(54305252560).jpg), photograph by **Alexandre Prevot**, **CC BY-SA 2.0**, original 3000×2000.
- **Cockpit:** existing [Lamborghini Revuelto intérieur 01.jpg](https://commons.wikimedia.org/wiki/File:Lamborghini_Revuelto_int%C3%A9rieur_01.jpg), photograph by **Y.Leclercq**, **CC BY-SA 4.0**, original 3968×2232.

Attribution, source links, modification disclosure, and the correct individual license versions are published at `/credits`. Original Mission 004 sources are retained with their original credits as archived assets. No generated or invented photographs, photographer identities, licenses, or vehicle specifications were used.

## Verification approach

`tests/remediation.spec.ts` adds explicit behavior and geometry assertions, source-pixel checks, image-request failures, keyboard paths, and visual comparisons. These complement the existing semantic/axe checks; axe alone is not treated as evidence of accessibility conformance.

**Native zoom is separate from simulation.** A test-only Manifest V3 extension is loaded into a disposable Chromium profile using Playwright's documented extension mechanism. Its service worker calls the browser's real `chrome.tabs.setZoom` / `getZoom` APIs at 200% and 400%, and verifies effective viewport width and device pixel ratio. It does not use CSS `zoom`, page-scale emulation, or font injection. The separate text-only stress test explicitly doubles computed fonts and line heights and is labeled simulated.

References: [Playwright Chromium extension testing](https://playwright.dev/docs/chrome-extensions), [Chrome tabs zoom API](https://developer.chrome.com/docs/extensions/reference/api/tabs#method-setZoom), [W3C text-spacing criterion](https://www.w3.org/WAI/WCAG22/Understanding/text-spacing.html), [W3C resize-text guidance](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html).

Visual baselines are established only after reviewing the corrected mobile/desktop captures. A subsequent normal test run must compare against those stored baseline files. They are regression references for the corrected site, not proof that the first generated screenshot was correct.

## Final check results

- `pnpm check`: passed, zero ESLint warnings/errors and zero TypeScript errors.
- `pnpm build`: passed; `/` and `/credits` are statically prerendered.
- Final normal `pnpm test:browser` run: **24 passed, 0 failed, in 57.6 seconds**. This run compared the stored visual baselines; it did not update them.
- Actual native zoom verified: 200% reports effective viewport 720 CSS px and DPR 2 from a 1440px/DPR 1 start; 400% reports 360 CSS px and DPR 4. Full-page screenshots under native zoom were replaced with true viewport captures because CDP's full-page capture clipped the zoomed canvas. Native viewport captures are 1440×900.
- Simulated text-only 200% enlargement and the exact text-spacing overrides pass independently at 320px and 375px. Screenshots were inspected for overlap and clipping.
- All six encoded-pixel cover-budget tests pass. At 375px/DPR 1, the portrait delivered is 640×1280 for a 375×800 frame (cover scale .625), replacing the audited 640×347 landscape stretched to a tall frame. At 2560px/DPR 2, delivery is 5120×2560 and the cover scale is exactly 1.0. No missing source pixels are invented.
- Native asset-generation dimensions are checked against actual source crop dimensions, not just filenames or requested output sizes.
- Menu order, Escape focus return, nonmodal exit, accurate CTA wording/state, clearing active navigation, delayed-image retention, error recovery/retry, readable type roles, and shared 2560px rails all pass explicit regressions.
- Reviewed desktop/mobile baselines at 375px and 1440px; normal responsive captures at 768px; spacing/enlargement captures; and native zoom viewport captures. Full-page visual comparisons pass with the configured tolerance of 0.5% differing pixels (baseline files are present in the workspace; no Git operations were performed).
- Existing axe scans pass for baseline home-page states at 375px, 768px, and 1440px, plus credits. These supplement manual visual/keyboard and geometry checks; they do not establish complete WCAG conformance.

Machine-readable results and measured zoom/resolution evidence: `docs/udi/mission-005-verification.json`. Exact image-generation dimensions: `docs/udi/mission-005-image-inventory.json`. Full browser output, attachments, and captures: `test-results/`. Reviewed regression images: `tests/remediation.spec.ts-snapshots/`.

The first test runs exposed and corrected two harness issues (an uninvoked zoom expression and an exact floating-point comparison), a request-mocking race in the retry test, and a real story-error overlay collision. The final suite passes without force-clicks, skipped tests, or broad accessibility exclusions.

## Remaining limits

- Photographic cohesion is improved but not equivalent to a coordinated professional shoot. Distant background vehicles remain in the Temerario source and a small background figure remains in the Revuelto original; no synthetic removal or false licensing claim is used.
- Pixel-budget verification covers the explicitly tested viewports/DPRs, not arbitrary future screen sizes or DPR values. Source pixels remain finite.
- Native zoom was targeted in Chromium. Other engines, physical devices, and screen-reader behavior need separate verification; no complete WCAG conformance claim is made.
- UDI still supplies no automotive-specific profile or explicit cover-crop/DPR calculation workflow. This project adds concrete tests without attributing invented rule IDs to UDI.


## Complete file inventory

- Application: `src/app/globals.css`, `src/app/page.tsx`, `src/app/credits/page.tsx`.
- Components: `src/components/navigation.tsx`, `src/components/icons.tsx`, `src/components/vehicle-explorer.tsx`, `src/components/image-story.tsx`; new `src/components/resilient-image.tsx` and `src/components/hero-photograph.tsx`.
- Configuration and generation: `next.config.ts`, `playwright.config.ts`, `scripts/optimize-images.mjs`.
- Verification: `tests/showcase.spec.ts`, new `tests/remediation.spec.ts`, `tests/fixtures/native-zoom/manifest.json`, `tests/fixtures/native-zoom/background.js`, and the two reviewed PNG baselines in `tests/remediation.spec.ts-snapshots/`.
- New original sources: `public/images/revuelto-source.jpg`, `public/images/urus-source.jpg`, `public/images/temerario-source.jpg`.
- New derivatives: `public/images/hero-landscape.webp`, `hero-portrait.webp`, `revuelto-collection.webp`, `revuelto-detail.webp`, `urus-collection.webp`, `temerario-collection.webp`, `cockpit-detail.webp`.
- Documentation: `README.md`, this report, and `docs/udi/mission-005-{recommendation,search,image-inventory,verification}.json`.
- Existing source JPEGs and Mission 004 WebP files were retained rather than destructively removed. Package manifests and dependencies were not changed.

# Design quality review

Use this checklist after implementation. Adapt it to the product's existing design system and user goals.

## Visual consistency

- Establish a clear primary action and a readable hierarchy for page title, section headings, body content, and supporting metadata.
- Reuse the project's color, typography, spacing, radius, and elevation tokens; avoid introducing arbitrary one-off values.
- Keep layouts aligned to a consistent grid and use whitespace to distinguish related from unrelated content.
- Ensure interactive and informational elements look distinct without relying on color alone.

## Responsive behavior

- Inspect narrow, medium, and wide viewports; verify that content reflows rather than merely shrinking.
- Keep navigation, tables, dialogs, and forms usable without horizontal page overflow.
- Preserve readable line lengths and sufficiently large touch targets.

## Accessibility and interaction

- Use semantic landmarks, headings, labels, buttons, and links appropriate to their function.
- Ensure keyboard access, visible focus, logical focus order, and understandable validation/error messages.
- Check text and control contrast, non-color status cues, reduced-motion preferences, and accessible names.
- Review loading, empty, success, disabled, hover, focus, and error states where applicable.

Do not claim automated accessibility conformance or visual validation without running the relevant tools. Automated checks do not replace keyboard and semantic review.

## Contextual scroll policy

Decide from the task and available space, not a universal CSS reset. Record the scroll owner, axis, preserved information, visible cue/alternative controls and focus behavior. Browser/OS overlay scrollbars may appear only during interaction: `auto` preserves that preference; a screenshot without a painted track is not evidence that scrolling is disabled.

| Context | Justified scrolling and visibility | Required operation and alternatives |
| --- | --- | --- |
| Main page | Ordinary reading uses the page's vertical flow. Keep native scrollbar behavior; do not conceal it for decoration. | Landmarks and logical DOM order; keyboard, wheel and touch reach content. Avoid a second full-height content pane unless its task needs independent navigation. |
| Comparison table | Use local horizontal scrolling when column comparison requires readable two-dimensional data. Prefer native `auto` visibility and an observable scroll hint/edge or controls. | Keep identity, critical status/permission and frequent action available without horizontal travel; all columns remain reachable. Provide a named keyboard-operable region as needed, reveal focused content, and test touch. For individual work choose summary/details instead; do not convert every table into cards. Local scrollbar concealment needs demonstrated equivalent controls and cues, never a default recommendation. |
| Navigation or tabs | Prefer reflow/disclosure for navigation. A compact rail may scroll if the selected item and remaining destinations are discoverable. Local concealment is conditional, with persistent previous/next or equivalent visible controls and an edge/position cue. | Every item is reachable by keyboard/touch, focus and selection are revealed; preserve semantics. Use tab-list arrow-key behavior only for an actual tab widget, not ordinary navigation links. |
| Filters and chips | Prefer wrapping active conditions. If a rail is justified, preserve selected meaning and Clear; keep native scrollbar or expose reliable movement controls and overflow cues before hiding it locally. | Reveal focused chips, name each removal, preserve active/draft distinction and move focus predictably after removal. Avoid independent scrolling inside a filter sheet when wrapping is sufficient. |
| Carousel | Horizontal movement is deliberate sequential content. A locally hidden scrollbar may fit a controlled carousel only when visible previous/next, position and accessible content navigation remain. | Keyboard and touch have equivalent controls; no swipe-only operation. Keep focus coherent; make any automatic motion pausable and respect reduced motion. Hiding the track is not proof of a usable carousel. |
| Dialog body | Use one internal vertical owner when content exceeds the usable viewport. Native scrollbar `auto` is the default. Keep dialog header/actions outside that body only if they do not cover focused content. | Reach Save/Cancel, errors and all fields at short height and with a virtual keyboard; reveal focused targets; contain keyboard interaction and restore invoker/page position. Background locking is temporary and modal-scoped, with cleanup on every exit. Do not globally lock the page. |
| Accidental overflow | Fix min-width, long tokens, media or layout that creates unintended page-level horizontal overflow. | Do not hide the symptom with global `overflow: hidden` or `scrollbar-width: none`. Verify no information/action is clipped after repair; a valid comparison region is not accidental page overflow. |

Hiding a scrollbar removes its visual track; it does not disable scrolling. Conversely, clipping overflow can remove access regardless of whether a track is painted. Never apply `overflow: hidden` or `scrollbar-width: none` globally as a responsive strategy. A scoped hidden track requires independently operable alternatives, discoverable remaining content and real keyboard/touch checks. Do not make scrollbars hidden by default. Keep axis ownership minimal; two nested containers alone are a review signal, not proof of a defect.

### Responsive validation and certainty

At 375, 768 and 1440 CSS pixels, plus a short mobile viewport and enlarged text, inspect populated, empty, error and editing states. The 375px sample does not establish WCAG reflow conformance at 320 CSS pixels.

**Failures supported by direct evidence:** unintended page overflow with an identified offending ordinary-content node; a declared essential action requiring unrelated horizontal travel; critical truncation without full-content access; a Save/Cancel or correction target that cannot be brought into the usable dialog viewport; keyboard interaction reaching hidden duplicates or losing an entered draft on restructure. Record the measured condition and scope rather than claiming a generic accessibility audit.

**Warnings needing judgment:** wide table/hidden priority-column tradeoffs, an overflowing region without an obvious cue, concealed scrollbars with unclear alternative operation, multiple/nested owners, focus briefly on BODY during a native dialog cycle, sticky controls that may obscure content, visual/DOM order divergence. Test the actual task, keyboard, touch and assistive technology before promoting a warning to a confirmed failure. DOM dimensions or CSS alone cannot establish discoverability, user intent, occlusion or screen-reader usability.

This is original UDI guidance (MIT), informed by reference-only consultation of [WAI Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html), [APG modal dialogs](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/), [MDN scrollbar-width](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width), and [WAI carousels](https://www.w3.org/WAI/tutorials/carousels/). No external text, implementation or asset is incorporated.

## Experience critique within a time budget

Review dimensions separately; do not sum them into a beauty score. Use concrete
rendered observations and label measurements versus contextual visual judgments:

| Dimension | Look for | Correct a weak result |
| --- | --- | --- |
| Clarity | Real action scope and honest result | Rename misleading actions; keep outcome/status visible |
| Hierarchy | One focal task/idea and quieter support | Remove competing emphasis before adding decoration |
| Composition | Sequence, aligned groups and purposeful density | Remove empty grid regions and repetitive framing |
| Typography | Distinct levels, readable full selected values | Simplify scale/weights and wrap meaningful labels |
| Color | Foundation/accent/semantic roles with rendered contrast | Reduce accents, avoid default gradients, test pairs |
| Motion | Feedback or continuity with reduced-motion parity | Remove loops/delays; retain instant states and focus |
| Trust | Accurate claims, feedback and recovery | Replace invented proof with honest scope and evidence |
| Responsive | Reachable actions and intact meaning at 320px | Reorder around the task before shrinking controls |
| Accessibility | Keyboard/names/states/recovery | Use native controls, visible focus and live status |
| Distinctiveness | One recognizable content/brand-led choice | Replace generic dashboard chrome with relevant structure |
| Polish | Consistent spacing/copy across real states | Fix the largest state/flow inconsistency, then refine rhythm |

`QUA-CLARITY`, `QUA-HIERARCHY`, `QUA-COMPOSITION`, `QUA-TYPOGRAPHY`, `QUA-COLOR`,
`QUA-MOTION`, `QUA-TRUST`, `QUA-RESPONSIVE`, `QUA-ACCESSIBILITY`,
`QUA-DISTINCTIVENESS`, and `QUA-POLISH` provide inspectable indicators when supported.
A clipped essential action or failed keyboard flow is a reproducible defect;
balance, emotional tone and memorability require a contextual reviewer. Do not
report the latter as objectively measured. Reserve validation/reporting time and
perform one focused revision rather than endlessly fetching more guidance.

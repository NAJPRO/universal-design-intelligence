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

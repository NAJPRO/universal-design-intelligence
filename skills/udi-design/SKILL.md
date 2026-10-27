---
name: udi-design
description: Helps AI coding agents design and improve responsive, accessible, polished web interfaces while respecting a project's existing stack, brand, and design system.
license: MIT
---

# Universal Design Intelligence

UDI provides a repeatable workflow for frontend design and implementation. Use the local UDI CLI and the references linked below; do not load the full catalog into context.

## Workflow

1. Inspect the project and identify its framework, styling approach, existing components, and design conventions.
2. Clarify the user’s goal and whether the task is a new interface or an improvement.
3. Query local UDI guidance using the commands in [UDI CLI usage](references/udi-cli.md); if the CLI is unavailable, say so and proceed using repository evidence.
4. Choose and briefly explain a design direction that fits the product, audience, and user goals.
5. Reuse existing brand tokens, components, and conventions. Preserve existing branding unless the user explicitly requests a change.
6. Implement professional, coherent UI components using the existing stack and patterns.
7. Check responsive behavior, keyboard interaction, semantic structure, and accessible naming.
8. Review the result against [design quality checks](references/design-quality.md), then correct inconsistencies. Do not claim visual or accessibility validation unless the corresponding tools were run.

## Design priorities

- Prefer clarity, hierarchy, and usable interaction over novelty.
- Keep motion purposeful, restrained, and compatible with reduced-motion preferences.
- Avoid generic layouts and decorative effects that weaken readability or task completion.
- Preserve existing project behavior and surface assumptions or limitations.
- Do not introduce external services, dependencies, or destructive project changes without need and authorization.

## References

- [UDI CLI usage](references/udi-cli.md) — local search and recommendation examples.
- [Design quality checks](references/design-quality.md) — responsive, accessibility, and visual review checklist.

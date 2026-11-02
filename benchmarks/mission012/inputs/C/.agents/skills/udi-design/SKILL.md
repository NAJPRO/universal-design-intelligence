---
name: udi-design
description: Helps AI coding agents design and improve responsive, accessible, polished web interfaces while respecting a project's existing stack, brand, and design system.
license: MIT
---

# Universal Design Intelligence

UDI provides a repeatable workflow for frontend design and implementation. Use the local UDI CLI and the references linked below; do not load the full catalog into context.

## Workflow

1. Inspect the target project's stack, styling, existing components, brand tokens and primary user tasks. Separate observed facts, explicit requirements and assumptions; ask only for missing information that affects the work. Reference websites and style questionnaires are optional.
2. Resolve the local launcher and check runtime capabilities using [UDI CLI usage](references/udi-cli.md). Prefer schema 2.1 only when supported; fall back to supported 2.0 or legacy commands without upgrading or installing application dependencies.
3. Retrieve a bounded recommendation for the evidenced tasks. Read coverage, conflicts and assumptions. For selected component/composition IDs, inspect only the relevant contracts; extract the anatomy, variants, states, accessibility and recovery obligations needed for this interface. Do not load the whole catalog or every specification.
4. Turn the retrieved guidance into explicit decisions: connect each applied knowledge ID to a layout, component, interaction or state choice. Preserve existing tokens and conventions, and distinguish unsupported requirements from general guidance.
5. Implement with the project's existing stack and components. Review rendered narrow, medium and wide layouts, populated/empty/error states, keyboard behavior and editing/recovery flows using available tools; correct observed issues. Use [design quality checks](references/design-quality.md) for the relevant checks; when content scrolls, apply its contextual scroll policy and distinguish measured failures from review warnings.
6. Report applied knowledge IDs, important design decisions, checks actually run and unsupported requirements. State missing browser, accessibility or host-discovery validation explicitly; retrieval and automated tests alone do not prove visual quality.

## Design priorities

- Prefer clarity, hierarchy, and usable interaction over novelty.
- Keep motion purposeful, restrained, and compatible with reduced-motion preferences.
- Avoid generic layouts and decorative effects that weaken readability or task completion.
- Preserve existing project behavior and surface assumptions or limitations.
- Do not introduce external services, dependencies, or destructive project changes without need and authorization.

## References

- [UDI CLI usage](references/udi-cli.md) — local search and recommendation examples.
- [Design quality checks](references/design-quality.md) — responsive, accessibility, and visual review checklist.

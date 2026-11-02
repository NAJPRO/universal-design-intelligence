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
3. If root help exposes `direct`, retrieve one compact direction with `direct --context brief.json --json`. Choose a focal idea, section sequence, typography/color roles and density; preserve brand tokens. Supply `--character` only for a real preference, and `--interactions` only for actual task needs. Query matches help discovery; they do not authorize decoration or motion. Older runtimes use their supported profile guidance.
4. Retrieve one bounded component recommendation when task structure needs it. Read coverage, conflicts and assumptions. Inspect relevant selected composition first, then only its needed component contracts. Operational collections with filtering need page-level scope/query/results relationships, not just three unrelated components. Do not rename or invent task evidence to trigger a contract; preserve a missing match as a limitation.
5. Map applied DIR/COM/CMP/MOT IDs to concrete decisions, then implement. Reserve roughly the last quarter of the available budget for browser/keyboard checks, one focused critique/refinement pass and the final report. Avoid repeated probes, duplicate packets and catalog dumps; inspect omitted IDs only when needed.
6. Review rendered narrow, medium and wide layouts and the actual task states. Critique clarity, hierarchy, composition, typography, color, motion, trust, responsiveness, accessibility, distinctiveness and polish separately. Use [design quality checks](references/design-quality.md); inspect a relevant `QUA-...` indicator only for a weak dimension. Fix the largest observed issue first. Subjective judgments are not measured beauty or trust scores.
7. Report applied IDs, decisions, checks actually run, one remaining weakness and unsupported requirements. Reserve time to write the report even when implementation is incomplete. State missing browser/accessibility/host-discovery validation; retrieval and tests alone do not prove visual quality or superiority.

## Design priorities

- Prefer clarity, hierarchy, and usable interaction over novelty.
- Keep motion purposeful, restrained, and compatible with reduced-motion preferences.
- Avoid generic layouts and decorative effects that weaken readability or task completion.
- Preserve existing project behavior and surface assumptions or limitations.
- Do not introduce external services, dependencies, or destructive project changes without need and authorization.

## References

- [UDI CLI usage](references/udi-cli.md) — local search and recommendation examples.
- [Design quality checks](references/design-quality.md) — responsive, accessibility, and visual review checklist.

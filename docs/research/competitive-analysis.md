# Competitive analysis: UDI MVP foundations

**Research date:** 2026-10-26  
**Scope:** public repository landing pages, READMEs, and official skill documentation retrieved for Phase 1. This is a focused architectural review, not a source-code or dependency audit. Current details can change.

## Findings

| Project | Verified information | UDI implication |
|---|---|---|
| [UI UX Pro Max Skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | Its README describes a multi-platform design skill, a searchable UI style catalog, and design-system generation. It advertises 192 reasoning rules and 79 searchable styles; those counts are maintainer-provided claims. Its published workflow uses Python-based support, unlike UDI's intended TypeScript runtime. | Learn from its explicit design concepts and searchable catalog, but implement independent schemas, content, and retrieval. Do not import content without examining the source license and attribution obligations. |
| [Agent Skills specification](https://agentskills.io/specification) | A skill is a directory with a required `SKILL.md`, YAML frontmatter, and markdown instructions. The spec constrains required `name` and `description` fields and recommends optional scripts/references/assets. | Keep the canonical skill concise; split deeper guidance into references when the skill is implemented. Validate the spec and avoid assuming optional features are universally supported. |
| [Anthropic skills](https://github.com/anthropics/skills) | Repository README describes skills as self-contained folders with `SKILL.md`, and gives Claude plugin/marketplace installation routes. It notes some included document skills are source-available rather than open source. | Treat examples as inspiration, not blanket license permission; distinguish standard skill contents from Claude-specific packaging and invocation behavior. |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | README positions the project as customizable open code/components for users to make their own; README links its contribution guide and MIT license. | Favor reusable, adaptable recommendations and respect the host application's established component system rather than imposing a fixed visual kit. |
| [Radix Primitives](https://github.com/radix-ui/primitives) | README describes a low-level component library focused on accessibility, customization, and developer experience; it reports MIT licensing. | Catalog accessibility and interaction behavior, not merely appearance; keep guidance framework/component-library aware. |
| [Tailwind CSS](https://github.com/tailwindlabs/tailwindcss) | README describes a utility-first CSS framework and directs users to its documentation and contribution guidance. | Recommendations should map to a project's detected styling conventions instead of assuming Tailwind or imposing a new styling dependency. |
| [axe-core](https://github.com/dequelabs/axe-core) | README describes an automated accessibility engine and explicitly notes automated testing catches only a portion of WCAG issues, with incomplete results requiring manual review. | Accessibility checks should supplement, not replace, semantic/manual review. Do not claim a full conformance guarantee from automation. |
| [Playwright](https://github.com/microsoft/playwright) | README describes browser automation/testing across Chromium, Firefox, and WebKit with isolated contexts and web-first assertions. | Keep browser testing optional until core install/retrieval is stable; use real browser checks for visual claims. |

## Agent conventions verified so far

- **Codex:** [official skill docs](https://developers.openai.com/codex/skills/) state skills use `SKILL.md`, progressive disclosure, and `.agents/skills` for repository skills; the docs also describe user/admin/system scopes.
- **Claude Code:** [official skill docs](https://code.claude.com/docs/en/skills) state compatibility with the Agent Skills standard, explain Claude-specific metadata, and document project `.claude/skills/<name>/SKILL.md` and personal `~/.claude/skills/<name>/SKILL.md` paths.
- **Antigravity:** [official skill docs](https://antigravity.google/docs/skills) describe the `SKILL.md` convention, workspace `.agents/skills/<skill>`, and distinct global paths for app versus CLI.
- **Cursor:** [official skill docs](https://cursor.com/docs/skills) describe automatic discovery and manual `/` invocation, and identify `.agents/skills/`, `.cursor/skills/`, `~/.agents/skills/`, and `~/.cursor/skills/` as project/user skill locations.

The canonical file format does not prove that all hosts discover skills from the same directory or activate the same metadata. Codex, Cursor, and Antigravity document overlapping `.agents/skills` conventions, while Claude Code's project convention is `.claude/skills`; user-level locations and extensions also differ. UDI must test file installation separately from host runtime discovery and label compatibility evidence per agent.

## Licensing notes

- The inspected UI UX Pro Max and Radix Primitives license files state MIT.
- The inspected axe-core license identifies MPL-2.0; Playwright's license identifies Apache-2.0.
- Anthropic's README explicitly distinguishes some examples from source-available document-skill implementations; review each selected item rather than inferring permission from repository presence.
- This was a limited check of top-level license files, not a full dependency or file-level audit. UDI has not copied any competitor catalog or code.

## Architecture comparison and constraints

- Existing projects suggest a small folder-based instruction format is portable, while plugin marketplaces and invocation controls are host-specific.
- Design skill projects demonstrate that structured rules and named visual styles can be surfaced through search. UDI's catalog should add explicit provenance, review status, framework/project applicability, and anti-patterns.
- A local deterministic search engine provides explainable, offline results; embeddings remain a future optional capability, not an MVP dependency.
- Reuse of design rules, prose, datasets, or code requires a per-source license and attribution review. The public landing pages inspected here are insufficient for an exhaustive legal audit.

## Limits and follow-up

- No repository source files, full git history, dependency trees, or complete licenses were audited.
- Current CLI-name check used the npm registry on 2026-10-26: `universal-design-intelligence` and `udi-design` returned HTTP 404; `udi` returned HTTP 200. Availability is not reservation.
- Before release: inspect current license files for any reused materials, test agent runtime discovery through the actual adapters, and repeat `npm pack` artifact verification.

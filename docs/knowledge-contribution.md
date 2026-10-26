# Contributing design knowledge

The catalog lives in `packages/knowledge/src/catalog.ts`; runtime schemas live in `packages/knowledge/src/schemas.ts`. Catalog data is original UDI editorial guidance, with narrowly relevant external references recorded as provenance rather than copied prose.

## Supported categories

Use one of these exact category identifiers:

`visual-hierarchy`, `typography`, `color-contrast`, `spacing-layout`, `responsive-design`, `navigation`, `marketing-landing-pages`, `saas-dashboards`, `tables-data-visualization`, `forms`, `pricing-pages`, `accessibility`, `interaction-states`, `design-systems`, `anti-patterns`.

Supported project types are `marketing-site`, `saas`, `dashboard`, `fintech`, `developer-tools`, `professional-services`, `ecommerce`, `editorial`, `web-app`, `marketplace`, and `education`. Use `all` only when applicability is genuinely broad. Framework identifiers are declared in `FRAMEWORKS` in the schema module.

## Rule and provenance contract

Each rule requires a stable ID (`UDI-<three-letter-category>-<three-digit-number>`), category, title, explanatory summary, one or more actionable guidance items, applicable contexts and frameworks, priority, tags, provenance, related anti-pattern IDs, and optional explicit design choices. Priority is one of `critical`, `high`, `medium`, or `low`.

Provenance records a stable source ID, source name, organization, license, attribution, review status, reviewer, review date, and any relevant references. UDI-authored content must be attributed as original UDI synthesis; external references are evidence, not permission to reproduce their text. Verify the referenced source’s license before distributing any third-party content.

Profiles require project applicability, audience and style keywords, valid rule references, and concrete design direction for visual hierarchy, typography, color, layout, and interaction. Component patterns and anti-patterns must reference existing rules. `validateCatalog` rejects duplicate entity identifiers and broken cross-references; Zod rejects malformed records and unsupported categories.

## Requirements for a contribution

- Make the guidance specific enough to apply to an interface, not a general aesthetic preference.
- Identify the category, applicable project types/frameworks, priority, source metadata, and relevant anti-patterns.
- Include accessibility and responsive considerations where relevant.
- Cite the original source and its exact license. Do not copy third-party prose, datasets, or code unless the license permits redistribution and all conditions are met.
- Prefer a paraphrased, independently reasoned rule with a precise source reference over a copied rule.
- Mark an entry as reviewed only after another contributor checks correctness, attribution, and applicability.

## Review checklist

1. Is the rule actionable and compatible with UDI's local-first scope?
2. Is the source traceable and permission for reuse established?
3. Does the rule fit the stated project types and frameworks?
4. Are the anti-pattern and accessibility implications clear?
5. Is the content original, concise, and non-contradictory with accepted guidance?
6. Are tests updated if the entry affects retrieval or recommendations?

## Validation workflow

1. Add a stable, never-reused identifier and write original, concise, actionable guidance.
2. Add the item to the appropriate typed catalog and connect only valid IDs.
3. Add or update a retrieval query when the rule materially changes search behavior.
4. Run `pnpm check` and `pnpm build`; catalog validation is also part of the knowledge package build.
5. Request an independent contributor review before setting `reviewStatus` to `reviewed`; keep new or unreviewed material marked `pending`.

Do not renumber existing identifiers to close gaps. Do not add rules solely to hit a target catalog size.

The exact catalog schema and submission format will be documented after the Phase 2 schema is implemented.

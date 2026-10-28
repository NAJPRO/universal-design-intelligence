# Ecosystem comparison

**Verified source observations** below are limited to the linked pages/files inspected on 2026-10-28. Relevance and limitations are UDI architectural judgments. No competitor was installed, executed, benchmarked, or imported. Component examples were read as documentation/source examples, not tested in a browser. Counts advertised by maintainers are not independently counted.

## Priority sources

### UI UX Pro Max — exact requested repository

The requested [Aston1690 repository](https://github.com/Aston1690/ui-ux-pro-max) exposes `data`, `scripts`, a brief README, and a substantial [skill file](https://raw.githubusercontent.com/Aston1690/ui-ux-pro-max/main/SKILL.md). It describes categorized product/style/color/type/chart/UX knowledge, prioritized checks, stack guidance, and a search-driven design-system workflow. Its advertised coverage spans web/mobile stacks. The [data directory](https://github.com/Aston1690/ui-ux-pro-max/tree/main/data) lists CSVs for products, styles, colors, typography, charts, UX guidelines, UI reasoning and application interfaces, plus stack data. Component names appear in instructions, but this inspection did not establish comprehensive anatomy/state contracts. The instruction table explicitly says scripts do not consume its category-priority table. The [scripts directory](https://github.com/Aston1690/ui-ux-pro-max/tree/main/scripts) lists `core.py`, `search.py`, and `design_system.py`; their content fetches were unavailable. Retrieval implementation and dataset completeness remain unverified.

UDI relevance: explicit multi-category retrieval and product-context expansion. Limitation: instructions, advertised counts, and executable enforcement are different evidence. Accessibility and motion checklists need independent applicability review. The root listing did not expose a license; a direct `LICENSE` request failed. **Redistribution permission is unresolved.** Do not inherit the MIT finding for a different project: earlier [UDI research](../competitive-analysis.md) examined `nextlevelbuilder/ui-ux-pro-max-skill`, not this repository.

### Anthropic Frontend Design

The actual [skill instructions](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md) emphasize subject-specific visual choices, deliberate type/layout, meaningful motion, a short design plan, and critique. This is an aesthetic decision workflow rather than a structured component/domain catalog. It offers no demonstrated deterministic retrieval or exhaustive keyboard/state specifications. UDI can adopt the principle of evidence-based direction and critique through original instructions; it should adapt expressive design choices to daily operational tasks and existing brands. The skill-local [license](https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/LICENSE.txt) is Apache-2.0. Reusing licensed material would require license retention, modification notices, and applicable attribution/NOTICE handling; this proposal copies none.

### shadcn/ui, registry, blocks

The [data-table guide](https://ui.shadcn.com/docs/components/data-table) demonstrates assembling behavior rather than treating every table as one universal component. Its parts and variants are useful implementation references; application-specific selection, editing, and accessibility still need validation.

The [registry getting-started guide](https://ui.shadcn.com/docs/registry/getting-started) describes distributable items and dependencies; this is a code-distribution mechanism, not a UDI knowledge schema. UDI should reference compatible implementations without depending on live registry access or installing them automatically.

The supplied [`docs/_blocks` URL](https://ui.shadcn.com/docs/_blocks) is contribution guidance. The actual [blocks gallery](https://ui.shadcn.com/blocks) includes dashboard/sidebar and authentication assemblies, with preview/code surfaces. Relevance: composition boundaries and relationships. Limitation: selecting a ready-made dashboard does not establish domain fitness and can reproduce generic layouts. The [repository license](https://raw.githubusercontent.com/shadcn-ui/ui/main/LICENSE.md) is MIT; third-party registry items still need separate checks. Study structure, author UDI guidance independently, and preserve copyright/license notices for any future permitted substantial reuse.

### React Aria

[React Aria](https://react-aria.adobe.com/) separates styling from accessible behavior and exposes component parts, states, and slots. The [ComboBox documentation](https://react-aria.adobe.com/ComboBox) provides a concrete composition reference. Coverage includes collections, dates, overlays, forms, and internationalization. UDI relevance: behavior contracts, input modalities, locale-sensitive components, and testable state requirements. It is React-specific and does not supply a domain workflow or visual identity. Adopting a primitive does not verify an assembled application. The [React Spectrum repository license](https://raw.githubusercontent.com/adobe/react-spectrum/main/LICENSE) is Apache-2.0; audit selected packages/files and NOTICE obligations before reuse.

## Additional systems: coverage and method

Each row states observed organization/coverage first; the final column is UDI's interpretation. Accessibility support is a documented approach, not a finding of conformance in an application.

| Source and philosophy | Organization, anatomy/variants, composition | Accessibility, interaction/motion, quality method | Domain relevance and limitations for UDI |
| --- | --- | --- | --- |
| [Radix Primitives](https://www.radix-ui.com/primitives/docs/overview/introduction): low-level customizable behavior | Parts-based primitives, controlled/uncontrolled state; overlays, menus, tabs, controls; composition through exposed parts and `asChild` | Documents ARIA patterns, focus and keyboard behavior; styling/animation guides separate | Strong primitive contracts; no operational table/workflow/domain model or prescribed visual polish |
| [Base UI](https://base-ui.com/react/overview/about): headless accessible React | Open parts; forms, collections, navigation, overlays. [Dialog](https://base-ui.com/react/components/dialog) documents trigger/popup/title and focus/nesting examples | Documents platform/screen-reader testing; explicit styling, animation, and composition handbooks | Useful behavior and library-specific mapping; React-bound; not domain knowledge or an aesthetic evaluation system |
| [Material Web](https://github.com/material-components/material-web): Material 3 implementation | Web-component controls, token-based customization and component documentation | Accessible controls and stateful interactions are stated goals; token/state consistency is useful | M3 site required JavaScript and could not be fully read. Findings here concern Material Web, not a complete M3 audit. Repository says maintenance mode; do not default to it as a new dependency |
| [Ant Design](https://ant.design/docs/spec/introduce/): enterprise consistency | Specifications and React components; Pro/Charts/Motion linked as separate resources | Design values emphasize predictable enterprise experiences; component examples support consistency; full accessibility/motion coverage was not audited | Enterprise vocabulary and compositional breadth useful; no evidence that its aesthetic fits every industry or that external packages share all core guarantees |
| [PatternFly table guidelines](https://www.patternfly.org/components/table/design-guidelines/): operational enterprise UI | Table features/variants within a broad component system including drawers, uploads, editors, charts | Usage guidance describes operational behavior and relationships; implementation and manual checks still needed | Strong dense-operations reference. Not healthcare or finance expertise; do not impose infrastructure-console styling |
| [Carbon data table](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines): systematic enterprise tasks | Anatomy, variants and modifiers; toolbar, sorting, expansion, row/batch actions | Usage constraints and linked demos/Storybook provide inspectable cases | Excellent component-vs-workflow boundary; expressly distinguishes tables from spreadsheet applications. IBM visual identity is not UDI's default |
| [Fluent 2 web](https://fluent2.microsoft.design/components/web/react/): coherent productivity UI | React/web-component catalog, fields, drawers, menus, toolbars and collections | [Motion guidance](https://fluent2.microsoft.design/motion) connects transitions to function and continuity; consistency is a quality mechanism | Useful productivity patterns and platform variants. Microsoft conventions and assets require separate handling |
| [Polaris web components](https://shopify.dev/docs/api/app-home/latest/web-components): merchant tasks | Actions, data display, inputs, layouts within Shopify app surfaces | Host-native consistency is explicit; documentation is not proof of application accessibility | Best domain vocabulary reference for merchant administration. Shopify embedding/runtime is unsuitable for UDI's offline critical path; old React implementation is [archived/deprecated](https://github.com/Shopify/polaris-react-archive) |
| [React Bits](https://reactbits.dev/get-started/introduction): expressive animated UI | Text/effects/backgrounds/microinteractions; JS/TS × CSS/Tailwind variants | Examples expose visual effects; exhaustive keyboard, reduced-motion, or domain guarantees were not established | Optional expressive inspiration for appropriate public experiences. Not a foundation for dense operational work; redistribution restrictions matter |
| [Motion accessibility](https://motion.dev/docs/react-accessibility): controllable animation behavior | Motion configuration and reduced-motion hook rather than business components | Explains adapting transform/layout effects to user preferences | Use as motion policy reference. No domain model, component anatomy catalog, or guarantee of visual quality |

## Additional credible skill

The official [shadcn skill documentation](https://ui.shadcn.com/docs/skills) and [skill source](https://raw.githubusercontent.com/shadcn-ui/ui/main/skills/shadcn/SKILL.md) describe project configuration inspection, existing-component reuse, composition rules, and progressive references. They are useful evidence for inventory-aware guidance. Their package-runner/latest CLI workflow can require network access; UDI should inspect local evidence and ship versioned local guidance instead. This source was evaluated, not invoked as a skill in this mission.

## License and attribution ledger

These are observed licenses of the named artifacts only. A code repository's license must not be assumed to cover a separate documentation site, brand, fonts, icons, hosted examples, premium offering, or community registry.

| Artifact and direct license evidence | Observed terms | UDI incorporation decision |
| --- | --- | --- |
| Aston1690 requested repository | License not established | Citation-only; no catalog/code reuse |
| Anthropic frontend-design skill-local license, linked above | Apache-2.0 | Original synthesis preferred; any reuse needs license/change/NOTICE review |
| shadcn/ui license, linked above | MIT | Preserve notices if future licensed material is incorporated; review external registries independently |
| React Spectrum/Aria repository, linked above | Apache-2.0 | Check exact package/files and notices |
| [Radix](https://raw.githubusercontent.com/radix-ui/primitives/main/LICENSE) | MIT | Preserve notices for reused material |
| [Base UI](https://raw.githubusercontent.com/mui/base-ui/master/LICENSE) | MIT | Preserve notices; site/assets separately |
| [Material Web](https://raw.githubusercontent.com/material-components/material-web/main/LICENSE) | Apache-2.0 | Does not establish general m3.material.io asset rights |
| [Ant Design](https://raw.githubusercontent.com/ant-design/ant-design/master/LICENSE) | MIT | Does not cover every linked product automatically |
| [PatternFly core](https://raw.githubusercontent.com/patternfly/patternfly/main/LICENSE.txt) | MIT | Review React package/site/artwork separately |
| [Carbon core](https://raw.githubusercontent.com/carbon-design-system/carbon/main/LICENSE) | Apache-2.0 | Review documentation/assets and notices separately |
| [Fluent UI](https://raw.githubusercontent.com/microsoft/fluentui/master/LICENSE) | MIT, with separate font/icon terms noted | Do not package Microsoft fonts/icons without their own permission |
| [Archived Polaris React](https://raw.githubusercontent.com/Shopify/polaris-react-archive/main/LICENSE.md) | Custom Shopify restrictions, not plain MIT | No transplant into generic UDI or generic admin; current web-component terms not established here |
| [React Bits](https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md) | MIT + Commons Clause; component redistribution restricted | Do not vendor components, ports, or a redistributed component bundle |
| [Motion core](https://raw.githubusercontent.com/motiondivision/motion/main/LICENSE.md) | MIT | Separate core from commercial products and external examples |

For any future incorporation, record artifact path, immutable revision/hash, source URL, exact license text, copyright holder, modifications, required notices, reviewer, and date. Ambiguous rights block incorporation, not citation or independent analysis. License review is artifact-specific; this is not a full legal audit.

## Synthesis — proposal

Use headless systems for behavioral anatomy, enterprise systems for operational composition, Polaris for merchant-task framing, and design skills for context-aware direction/critique. No source supplies all of component semantics, domain discrimination, offline retrieval, brand preservation, and reproducible visual assessment. UDI's contribution should be a typed, attributed decision layer over the user's existing stack. Benchmark claims of superiority require the controlled evaluation in [07](07-quality-and-benchmarks.md).

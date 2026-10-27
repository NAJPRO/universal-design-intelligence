# Mission 004 — Lamborghini luxury automotive showcase

## Installed skill and runtime evidence

Read `/home/audin/.agents/skills/udi-design/SKILL.md`, `references/udi-cli.md`, and `references/design-quality.md`. All UDI queries used the installed launcher `/home/audin/.agents/skills/udi-design/scripts/udi.mjs`. No UDI source repository was accessed. No UDI dependency was installed or modified.

Executed before implementation:

```bash
node /home/audin/.agents/skills/udi-design/scripts/udi.mjs search "luxury automotive cinematic editorial performance" --limit 10 --json
node /home/audin/.agents/skills/udi-design/scripts/udi.mjs recommend --help
node /home/audin/.agents/skills/udi-design/scripts/udi.mjs recommend --type editorial --style "cinematic luxury, dark surfaces, expressive type, acid yellow" --framework nextjs --audience "luxury automotive enthusiasts" --preserve-brand --brand-description "Unofficial Lamborghini concept with angular Italian design" --json
node /home/audin/.agents/skills/udi-design/scripts/udi.mjs search "keyboard focus reduced motion responsive images contrast navigation" --limit 12 --json
```

Initial automotive search returned UDI-TYP-002 (reading measure) and UDI-MKT-005 (verifiable claims). Recommendation and interaction-search responses are retained in `docs/udi/`. The installed deterministic engine reported catalog version 1.0.0, schema version 1.0, and profile **PRO-EDITORIAL / Editorial publication**.

## Profile selection and design direction

The CLI's explicit type choices contain no automotive, luxury, vehicle showcase, or immersive brand-experience profile. Editorial is the closest fit: a narrative journey through vehicle design and engineering. No SaaS profile is used. Storytelling, restrained interface chrome, constrained reading widths, and clear captions are retained. Subscription recommendations are irrelevant to this brief and are omitted.

This is a new project without preexisting brand tokens or fonts. The preserve-brand flag refers to the user's requested visual direction, not to an existing approved Lamborghini design system. The concept establishes its own near-black, off-white, and acid-yellow tokens; no official logo or shield is reproduced. The wordmark is plain styled text with a persistent independent-perspective caption.

Art direction: full-height photographic opening, asymmetric composition, oversized fluid sans-serif titles, serif italic editorial contrast, angular controls, hairline rules, generous section spacing, and a bold yellow closing spread. The layout avoids dashboards, pricing, product-card grids, and testimonial patterns. Vehicle photography and editorial narrative carry the experience.

## Applied rules

| Rule | Implementation |
| --- | --- |
| UDI-SYS-005 | Retain the requested dark automotive direction and controlled accent throughout. |
| UDI-SYS-001 | Shared CSS tokens for neutral surfaces, text, borders, accents, and fluid gutters. |
| UDI-SYS-002 | Semantic reusable Navigation, Arrow, Wordmark, VehicleExplorer, and ImageStory components. |
| UDI-TYP-001 | Bounded fluid display/heading scale, consistent body/label/support roles. |
| UDI-TYP-002 | Short editorial paragraphs with constrained reading measures. |
| UDI-LAY-002 | Maximum-width editorial sections with independently full-bleed backgrounds. |
| UDI-NAV-002 | IntersectionObserver-driven current-location semantics and underlined active navigation. |
| UDI-ACC-001 | Main/header/footer/nav landmarks, ordered headings, native buttons, links, and details. |
| UDI-ACC-002 | Visible focus, skip link, roving model tabs, Arrow/Home/End keys, Escape menu dismissal with focus return. |
| UDI-ACC-003 | Content-driven text heights, narrow-screen reflow, wrapping labels. |
| UDI-COL-005 | Dark image overlays and off-white text preserve the intended accents with readable pairings. |
| UDI-COL-001 | Role-based contrast checked with axe; dark-on-yellow CTAs and high-contrast focus rings. |
| UDI-COL-003 | Accent, foreground, surface, and border tokens have independent roles. |
| UDI-COL-004 | Dark surfaces are deliberately graded instead of inverting a light theme. |
| UDI-ACC-005 | Informative image alt text; decorative SVGs hidden; no autoplay; reduced motion removes transitions. |
| UDI-RSP-005 | Reduced-motion media query changes smooth scroll and image transitions to stable state changes. |
| UDI-RSP-001 | Grid-to-stack reflow, responsive navigation, preserved essential content and model data. |
| UDI-RSP-003 | Hero and model exploration remain immediately discoverable on small screens. |
| UDI-NAV-005 | Menu expanded state, Escape dismissal, focus return, close on destination and desktop resize. |
| UDI-INT-005 / UDI-ANT-005 | All model, gallery, editorial, and navigation actions remain visible without hover. |
| UDI-INT-001 | Defined resting, hover, keyboard focus, selected model, and open/closed states. |
| UDI-VIS-001 | A single dominant hero title/CTA and one dominant story per editorial section. |
| UDI-MKT-005 | Exact CV figures linked to official sources; no invented performance, affiliation, scarcity, or customer claims. |

UDI-SYS-004 informed this documentation of interaction states. Network-independent image transitions retain an allocated visual container; data and controls remain usable while images load. Images do not determine essential model information.

## Functional scope

- Full-screen Revuelto hero with collection anchor and manufacturer-verified figures.
- Responsive navigation with current-section state, keyboard access, and mobile dismissal.
- Three-model tabbed explorer; content, image, category, specifications, and official source update together.
- Two-chapter manually controlled exterior/cockpit gallery; stable dimensions and reduced-motion treatment.
- Engineering highlights linked to the authoritative Revuelto page.
- Expandable independent editorial using native details/summary.
- Final collection CTA, back-to-top, and a dedicated credits/source page.
- Local licensed photos and responsive optimized image delivery; no third-party runtime service.

## Validation

Final results:

- `pnpm install`: passed. Required Sharp and resolver build scripts explicitly allowed in `pnpm-workspace.yaml`; no UDI package installed.
- `pnpm check`: passed; ESLint has zero warnings/errors and TypeScript has zero errors.
- `pnpm build`: passed with Next.js 16.4.3. `/` and `/credits` are statically prerendered.
- `pnpm test:browser`: **4 passed in 24.2 seconds** against the production server using Chromium.
- Tested widths: **375px, 768px, 1440px**, plus **320px** reflow with reduced motion.
- Verified mobile menu open/close, Escape focus return, navigation anchors, all three model selections, Arrow/Home keyboard behavior, gallery chapter changes, editorial expansion, and credits links.
- Verified no horizontal overflow, no browser runtime errors, successful image loading, stable image containers, reduced-motion CSS, and keyboard skip-link entry.
- Axe WCAG 2 A/AA and 2.1 AA tagged checks: zero violations in all three tested home-page viewport states and on the credits page. This is an automated result, not a claim of complete accessibility conformance.
- Visually inspected hero and full-page screenshots at all three requested widths for composition, cropping, content reflow, and readability.

Detected and corrected: test image-element TypeScript types; test locator tracking the menu's changing label; unsupported ARIA label on the decorative Italian stripe; skip-link visibility in full-page captures; explicit Next.js image-quality configuration. Initial browser runs experienced slow startup while browser installation was in progress; the final completed suite passed.

Reproducible checks are in `tests/showcase.spec.ts`. Screenshots: `test-results/hero-{375,768,1440}.png` and `test-results/full-{375,768,1440}.png`. No Lighthouse score, physical-device test, screen-reader audit, or measured CLS result is claimed.

## Files created

- Application: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/app/credits/page.tsx`.
- Components: `src/components/navigation.tsx`, `src/components/vehicle-explorer.tsx`, `src/components/image-story.tsx`, `src/components/icons.tsx`.
- Configuration: `package.json`, `pnpm-lock.yaml`, `pnpm-workspace.yaml`, `tsconfig.json`, `next-env.d.ts`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `playwright.config.ts`.
- Validation: `tests/showcase.spec.ts`.
- Assets: `public/images/{revuelto,revuelto-dark,temerario,urus,cockpit}.{jpg,webp}` and `scripts/optimize-images.mjs`.
- Documentation: `README.md`, this report, `docs/udi/recommendation.json`, and `docs/udi/interaction-search.json`.

The initial workspace contained no application files; all implementation files are new. No Git state-changing or remote repository commands were run.

## Limitations and missing UDI capabilities

1. No luxury automotive, performance-brand, cinematic showcase, or vehicle-comparison profile. The editorial profile gives useful general rules but cannot supply domain-specific art direction.
2. Automotive search is sparse: only two broad rules matched; no vehicle photography, focal-point crop, manufacturer specification units, or model-selection guidance surfaced.
3. An overlong style description caused a schema validation error that was wrapped in “runtime unavailable or incompatible,” although the runtime was healthy. Shortening the description resolved it; no runtime repair was performed.
4. The recommendation preserves typography and tokens without verifying whether a new project actually has them. Human judgment was needed to distinguish requested brand mood from an existing design system.
5. Image licensing, attribution, and correct vehicle identification required separate source research. UDI does not provide a licensed automotive asset workflow.
6. No dedicated guidance for creative typography over photography, cinematic image budgets, or editorial motion choreography was returned.

Concept limits: no 3D configurator, booking flow, synthesized engine sound, or commercial sales behavior. Gallery chapters are exterior/interior photographs, not a simulated 360-degree view. Photography is independently licensed editorial imagery rather than official commissioned campaign photography. Automated accessibility testing cannot establish full WCAG conformance; screen-reader and physical-device testing are outside the executed browser checks.

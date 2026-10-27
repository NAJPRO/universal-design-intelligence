# Lamborghini — Beyond the Expected

An independent, unofficial automotive editorial built with Next.js App Router, TypeScript, and Tailwind CSS. Featuring the Revuelto, Temerario, and Urus SE. No affiliation with Automobili Lamborghini S.p.A.

## Run locally

Requires Node.js 22+ and pnpm.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. For the production version:

```bash
pnpm check
pnpm build
pnpm start
```

## Browser validation

```bash
pnpm exec playwright install chromium
pnpm test:browser
```

The browser suite starts an isolated production server on port 3100. It checks responsive layouts, text-spacing overrides, simulated enlarged text, real Chromium zoom at 200%/400%, keyboard navigation, image failures and recovery, actual cover-crop resolution at DPR 1/2/3, wide-screen alignment, and visual snapshots. Screenshots and structured results are written to `test-results/`. The zoom extension is test-only and uses a disposable browser profile.

Mission 005 corrections and defect-by-defect evidence are documented in [docs/MISSION-005.md](docs/MISSION-005.md). Licensed image source dimensions and exact crops are recorded in `docs/udi/mission-005-image-inventory.json`.

## Design & assets

- UDI selection, applied rule identifiers, design rationale, gaps, and validation: [docs/MISSION-004.md](docs/MISSION-004.md).
- Exact installed runtime recommendation: [docs/udi/recommendation.json](docs/udi/recommendation.json).
- Retrieved accessibility and interaction rules: [docs/udi/interaction-search.json](docs/udi/interaction-search.json).
- Image authors, CC BY-SA 4.0 licenses, and official vehicle sources are published at `/credits`.
- Photos are local WebP files, served with responsive Next.js Image optimization. Original JPEG sources are retained; `node scripts/optimize-images.mjs` regenerates the WebP versions.
- System fonts require no external requests. There are no analytics, accounts, autoplay media, or remote runtime APIs.

UDI was queried from the globally installed skill. It is not a dependency of this project. The UDI source repository was not accessed or modified.

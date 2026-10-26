# Universal Design Intelligence CLI

UDI is a local-first design intelligence system for AI coding agents. The `universal-design-intelligence` package provides the `udi` executable.

## Commands

Build the package from the workspace root:

```sh
pnpm --filter universal-design-intelligence build
```

Run the built CLI with Node:

```sh
node packages/cli/dist/index.js search "accessible form labels" --category forms
node packages/cli/dist/index.js search "dashboard metrics" --type dashboard --framework react --limit 5 --json
node packages/cli/dist/index.js recommend --type saas --style premium --audience "operations teams"
node packages/cli/dist/index.js recommend --type fintech --preserve-brand --json
```

### `udi search "<query>"`

Searches the bundled catalog with deterministic BM25 ranking. Optional flags:

- `--category <category>`: a supported design knowledge category (see `udi search --help`).
- `--type <type>`: project type such as `saas`, `dashboard`, or `ecommerce`.
- `--framework <framework>`: `framework-agnostic`, `nextjs`, `react`, `vue`, `nuxt`, `angular`, `svelte`, `sveltekit`, `astro`, `remix`, or `html-css`.
- `--limit <number>`: 1–100 results; defaults to 10.
- `--json`: emit structured results with rule and source identifiers.

An empty or unmatched query returns a readable no-results message (or an empty JSON array), not all catalog entries.

### `udi recommend`

Creates a versioned recommendation using explicit deterministic heuristics. Optional flags:

- `--type <type>`: project type; omitted types use the general web-product default.
- `--style <style>` and `--audience <audience>`: influence profile matching through keyword overlap.
- `--framework <framework>`: filter applicable retrieved guidance.
- `--preserve-brand`: preserve the existing brand palette and typography.
- `--brand-description <description>` and `--design-system <name>`: record known project constraints.
- `--json`: emit schema-versioned JSON with assumptions, conflicts, and source rule IDs.

Supported project types: `marketing-site`, `saas`, `dashboard`, `fintech`, `developer-tools`, `professional-services`, `ecommerce`, `editorial`, `web-app`, `marketplace`, and `education`.

The recommendation engine is rule-based; it does not call or simulate an LLM. All knowledge is bundled locally, so these commands work offline.

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
node packages/cli/dist/index.js init --agent codex --dry-run
node packages/cli/dist/index.js doctor --json
```

### `udi init`

Installs canonical skills for `codex`, `claude`, `cursor`, `antigravity`, or `all`, with no changes to application dependencies, manifests, lockfiles, or `node_modules`.

- `udi init --global [--agent all]`: install user skills and a versioned shared runtime (all agents by default).
- `udi init --agent codex` or `--agent all`: project skills reuse an existing exact-version user runtime.
- `udi init --agent codex --install-runtime`: explicitly authorize installing a missing user runtime.
- `udi init --portable --agent codex`: self-contained offline project, including its runtime.
- `--dry-run`: preflight and preview without writes.
- `--force`: replace reviewed manifest-owned skill files; never unrelated files or differing immutable runtimes.

The runtime store defaults to `~/.udi/runtimes/<version>`; configure its base with `UDI_HOME`. Run the copied skill's `scripts/udi.mjs` with Node. Portable launchers are relocatable. Shared launchers pin a file URL to the user runtime. All required code is bundled; the tarball has no production npm dependencies.

Install a local tarball with `npm install --global --offline --ignore-scripts /path/to/udi.tgz` into a user tool prefix, or extract it outside the application and invoke `node /path/to/package/dist/index.js`. Nothing needs to be published to npm. For upgrades, preview and reinstall all previously selected agents with the matching new CLI; review owned changes before using force. Keep old runtime versions until no project references them. For uninstall, inspect `.udi/installation.json` hashes and remove only reviewed managed files and unused runtime versions, preserving unrelated files and shared skill parents.

### `udi doctor`

Reports runtime version compatibility, each agent's skill path in the selected scope, file and metadata validity, packaged asset integrity, changed-file conflicts, and remediation. `--global` inspects user skills; project scope is the default. Human-readable output is default; `--json` returns a structured report. Static installation/path verification is not the same as actual agent runtime discovery. UDI does not claim a host loaded a skill without a real host test.

See [agent compatibility](../../docs/agent-compatibility.md) for official sources, the exact path mapping, supported-format notes, and unverified runtime status.

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

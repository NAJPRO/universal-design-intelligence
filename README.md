# Universal Design Intelligence (UDI)

UDI is a local-first, open-source design intelligence system for AI coding agents. It helps agents make explainable, accessible, responsive UI decisions while preserving each project's existing framework, brand, and design system.

UDI provides an offline knowledge catalog, deterministic BM25 search, structured design recommendations, and user-level or project-local skill installation for supported coding agents.

## Requirements

- Node.js 22+
- pnpm 12+

## Development

```sh
pnpm install
pnpm check
pnpm build
```

Build and run the CLI from the workspace:

```sh
pnpm --filter universal-design-intelligence build
node packages/cli/dist/index.js --version
```

Install UDI into a project when the CLI is available on `PATH`:

```sh
udi init --global --agent all
udi doctor --global
udi init --agent codex
udi init --agent all --dry-run
udi doctor
```

UDI is a developer tool, never an application dependency. Project installs reuse an exact-version runtime under `~/.udi` (configurable with `UDI_HOME`). If it is missing, explicitly choose `udi init --agent codex --install-runtime` or `udi init --portable --agent codex`; UDI never silently writes to the home directory. Canonical skills and small launchers go into each agent's discovery path. Application manifests, lockfiles, and `node_modules` are untouched.

Use `--dry-run` to preview. Modified owned files require explicit `--force`; unrelated files are preserved. `udi doctor --json` checks installation integrity without claiming real host activation. See [installation, offline tarball bootstrap, upgrades, and uninstall](docs/installation.md) and [agent compatibility](docs/agent-compatibility.md). No public npm package has been published; use a locally packed tarball or the built CLI.

Search the local catalog:

```sh
node packages/cli/dist/index.js search "accessible form labels" --category forms --limit 5
node packages/cli/dist/index.js search "dashboard metrics" --type dashboard --framework react --json
```

Generate a deterministic design direction:

```sh
node packages/cli/dist/index.js recommend --type saas --style premium --audience "operations teams"
node packages/cli/dist/index.js recommend --type fintech --preserve-brand --json
```

Search and recommendations use local bundled catalog data; no API key or network connection is required. Use `--help` on either command for supported filters. No package is published and no remote repository has been created.

## Knowledge and provenance

The initial catalog contains 80 design rules and 17 profiles. Rules and profiles use strict Zod schemas, stable IDs, explicit applicability, actionable guidance, and provenance metadata. See [the knowledge contribution guide](docs/knowledge-contribution.md) before changing or adding catalog material.

## Project status and design decisions

- [Architecture and RFC](docs/architecture.md)
- [Competitive research](docs/research/competitive-analysis.md)
- [Roadmap and backlog](docs/roadmap.md)
- [Progress and remaining work](docs/PROGRESS.md)
- [Agent compatibility and installation](docs/agent-compatibility.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).

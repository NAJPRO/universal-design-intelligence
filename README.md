# Universal Design Intelligence (UDI)

UDI is a local-first, open-source design intelligence system for AI coding agents. It helps agents make explainable, accessible, responsive UI decisions while preserving each project's existing framework, brand, and design system.

Phase 2 provides an offline knowledge catalog, deterministic BM25 search, structured design recommendations, and a tested CLI. Agent installation adapters remain planned.

## Requirements

- Node.js 22+
- pnpm 12+

## Development

```sh
pnpm install
pnpm check
pnpm build
```

Run the current CLI command from the workspace:

```sh
pnpm --filter universal-design-intelligence build
node packages/cli/dist/index.js --version
```

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
- [Contributing](CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).

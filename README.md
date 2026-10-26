# Universal Design Intelligence (UDI)

UDI is a local-first, open-source design intelligence system for AI coding agents. It aims to help agents make grounded, accessible, responsive UI decisions while preserving each project's existing framework, brand, and design system.

The repository is in its foundation phase. The current executable milestone is a tested CLI version command; knowledge retrieval and agent installation are not yet implemented.

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

## Planned CLI

The MVP is planned to provide `udi init`, `udi search`, `udi recommend`, `udi doctor`, and `udi --version`. Only `udi --version` is implemented today. No package is published and no remote repository has been created.

## Project status and design decisions

- [Architecture and RFC](docs/architecture.md)
- [Competitive research](docs/research/competitive-analysis.md)
- [Roadmap and backlog](docs/roadmap.md)
- [Progress and blockers](docs/PROGRESS.md)
- [Contributing](CONTRIBUTING.md)

## License

MIT. See [LICENSE](LICENSE).

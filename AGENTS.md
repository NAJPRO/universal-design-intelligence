# Universal Design Intelligence

UDI is a local-first TypeScript monorepo for reusable UI/UX guidance and AI-agent skills.

## Development

- Use Node.js 22 or newer and pnpm.
- Run `pnpm install`, then `pnpm check` for linting, type checking, and tests.
- Run `pnpm build` to build packages that define a build script.
- Keep the core retrieval path deterministic and offline; do not add embeddings or remote APIs to the MVP critical path.
- Preserve user projects during skill installation: preview first, never overwrite by default, and make destructive behavior explicit.
- Attribute external knowledge and verify its license before incorporating content.

## Git ownership

- The repository owner manages all Git state changes manually. Agents must not run `git add`, `git commit`, `git push`, `git tag`, `git merge`, `git rebase`, or any other command that changes repository state.
- Read-only commands such as `git status` and `git diff` are permitted.
- Do not publish packages, create releases, or perform remote repository operations.

See [docs/architecture.md](docs/architecture.md), [docs/PROGRESS.md](docs/PROGRESS.md), and [CONTRIBUTING.md](CONTRIBUTING.md).

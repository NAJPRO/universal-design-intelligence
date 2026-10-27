# UDI architecture and Phase 1 RFC

**Status:** Phase 3.1 installation architecture implemented
**Date:** 2026-10-27

## Problem and scope

AI coding agents often produce inconsistent UI decisions unless they can use concise, project-aware design guidance. UDI will provide a curated local catalog, deterministic retrieval, structured recommendations, and skill installation adapters. The MVP targets marketing sites, B2B SaaS, dashboards, and web applications.

This RFC covers the first implementation boundary. It does not authorize package publication, remote repository creation, or changes to existing user projects.

## Goals

- Local-first use with no API key or service dependency.
- A typed TypeScript foundation and a CLI that can later be installed with npm/npx.
- One canonical Agent Skills instruction set with independently tested agent installation adapters.
- Explainable recommendations grounded in attributed catalog entries.
- Opt-in and safe filesystem operations.

## Non-goals for MVP

- Embeddings, hosted APIs, MCP, or vector databases in the critical path.
- Advanced 3D/WebGL experiences.
- Replacing the host project's design system.
- Publishing packages or deploying a hosted product.

## Proposed monorepo

- `packages/cli`: CLI entry point and distributable runtime assets.
- `packages/core`: local retrieval and recommendation logic.
- `packages/knowledge`: versioned, attributed, reviewed knowledge catalog.
- `packages/cli`: agent-specific project skill installers, diagnostics, and the distributable runtime.
- `skills/udi-design`: canonical Agent Skills skill.
- `tests/`, `examples/`, `docs/`, and `.github/workflows/`: validation, usage, and project governance.

Runtime path: CLI command -> core typed APIs -> local knowledge package. CLI-local agent adapters resolve installation conventions, preflight all destinations, and copy the canonical skill without overwriting modified files by default. Installed skill launchers run an exact-version shared user runtime, or a portable runtime inside the project, without application dependencies or workspace package paths. Search/recommendation results preserve source IDs for traceability.

### Phase 3.1 — Decoupled installation decision

UDI is a developer tool and AI skill system, never an application dependency. The CLI bundles Commander as well as core, catalog, and Zod; distributed runtimes require only Node.js 22+. Installation never invokes a package manager or writes application manifests, lockfiles, or `node_modules`.

- User runtimes live at `<UDI_HOME>/runtimes/<exact-cli-version>` (default `~/.udi`), with immutable content and bundled skills/license notices. All agents and projects may share a version.
- Global scope copies canonical skills to documented user discovery paths and provisions the shared runtime. Project scope copies canonical skills and small launchers only, reusing a matching runtime. Missing runtimes require an explicit `--install-runtime` or `--portable` choice; no implicit home writes occur.
- Portable mode copies the runtime into `.udi/runtimes/<version>` and generates relative-URL launchers; projects remain movable and offline. Shared launchers use pinned absolute file URLs, independent of PATH and later environment changes.
- Scope ownership manifests inventory hashes and runtime binding. Full preflight, symlink/path checks, no silent replacement, and explicit force for modified owned skills preserve user data. Different existing runtime content is never overwritten, even with force. New versions coexist until the owner reviews removal.
- Doctor verifies static metadata, inventory hashes, runtime version/content, and discovery locations without executing the inspected runtime. Host activation remains unverified.

See [installation operations and upgrade/uninstall strategy](installation.md) and [official discovery-path evidence](agent-compatibility.md). This supersedes the Phase 3 per-project runtime/dependency copies and deferred global installation decision.

## Phase 2 implementation

- `packages/knowledge` owns strict Zod schemas, the curated catalog, provenance, and cross-catalog integrity validation. Its build validates every entry and every profile/pattern/anti-pattern reference.
- `packages/core` owns the `Retriever` contract, deterministic BM25 implementation, and context-aware recommendation pipeline. It depends on the knowledge package; knowledge does not depend on core.
- `packages/cli` validates command options with Commander and invokes core APIs. The build bundles core, knowledge, and Zod into a local runtime artifact; Commander is also bundled and is a build-only dependency.
- Search normalizes Unicode, case, punctuation, and camel-case tokens, ranks weighted title/summary/guidance/tag fields using BM25, applies explicit category/project/framework filters, and uses rule IDs to break score ties.
- Recommendations use profile applicability plus audience/style keyword overlap, profile-linked rules plus retrieval, and explicit choice-priority conflict resolution. They identify deterministic assumptions, preserve brand constraints when requested, and include catalog/schema versions and source rule IDs.
- Runtime search and recommendation do not use a network connection, hosted model, embedding, or external API.

The initial knowledge set is original UDI editorial guidance released under this repository’s MIT license. Narrowly relevant W3C standards and tutorials are referenced as supporting sources; their prose is not copied into the catalog. The catalog’s counts and evaluated retrieval baseline are recorded in `docs/PROGRESS.md`.

## Decisions

1. **pnpm workspaces:** one lockfile and package-local boundaries without introducing a task orchestrator.
2. **Node.js 22+:** matches the target runtime and supports current TypeScript tooling.
3. **TypeScript strict mode:** enable `strict`, `noUncheckedIndexedAccess`, and `exactOptionalPropertyTypes`.
4. **Zod at runtime boundaries:** validate knowledge data and CLI-facing inputs before use.
5. **Vitest and ESLint:** lightweight tests and lint checks run in local development and CI.
6. **Commander:** small, established CLI framework.
7. **Deterministic retrieval:** implement local BM25/equivalent scoring with explicit filters; no embedding dependency in MVP.
8. **Canonical skill, adapter-specific installation:** share content while validating each agent’s path separately.
9. **Safe installation:** default to preview/no overwrite; any `--force` behavior must be explicit and narrowly scoped.
10. **License provenance:** MIT is the project default, but third-party rules must be separately reviewed and attributed before inclusion.
11. **Package boundary:** schemas and catalog integrity live with `@udi/knowledge`; core imports that package, and the CLI bundles the local knowledge runtime so a CLI installation does not depend on unpublished private workspace packages.

## Phase 1 implementation acceptance

- Monorepo package boundaries and Node/pnpm requirements are present.
- CI runs dependency install, lint, type checking, and tests.
- The CLI can be built and `--version` reports the installed CLI package version.
- Research claims are traceable to public repositories/documentation and unverified points are labeled.
- Progress and next-phase acceptance criteria are recorded in `docs/PROGRESS.md` and `docs/roadmap.md`.

## Open decisions

- Final public CLI package name must be rechecked immediately before publication. The registry query on 2026-10-26 found `universal-design-intelligence` unregistered and `udi` registered; npm names can change at any time.
- Validate current Agent Skills discovery paths per agent and distinguish shared file format support from host-specific activation.
- Audit actual dependency and knowledge licenses before the first public release.
- Actual host discovery still requires separate host validation.

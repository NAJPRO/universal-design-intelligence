# Universal Design Intelligence (UDI)

UDI is a local-first design intelligence tool and agent skill. It gives AI coding agents explainable, accessibility-aware UI/UX guidance that respects a project's existing framework, brand, and design system. Its curated catalog, deterministic BM25 search, and recommendation engine run locally; they do not call a model or require a network connection.

UDI is a **developer tool, not an application dependency**. npm distributes the `udi` installer/CLI; `udi init` installs the skill and runtime separately into a user or project scope. It does not add UDI to an application's `package.json`, lockfiles, or `node_modules`.

## Requirements

- Node.js 22 or newer
- npm for installing the CLI; pnpm 12+ is needed only to work on this repository

## Install the CLI

After the v0.1.0 package is available from npm:

```sh
npm install --global universal-design-intelligence
udi --version
udi --help
```

For a pre-publication or fully offline install, use a trusted local package tarball instead:

```sh
# Maintainer: build and pack from the repository.
pnpm install
pnpm build
cd packages/cli
npm pack --pack-destination /path/to/artifacts

# User: install the tarball into an npm global prefix, not an application.
npm install --global --offline --ignore-scripts /path/to/artifacts/universal-design-intelligence-0.1.0.tgz
```

If the default npm global prefix is not writable, choose a user-writable prefix and add its executable directory to `PATH`. No admin privileges are required. The published package has no production npm dependencies; the CLI and its runtime are bundled.

## Choose an installation scope

Select the agent explicitly when discovery is ambiguous. `--dry-run` previews destinations and changes without writing files.

### Global skill and shared runtime

Install the selected skill for your user and provision the shared runtime:

```sh
udi init --global --agent codex
udi doctor --global
```

Use `--agent all` to install all adapters. Global skills are installed under the agents' user-level discovery paths. Global installation does not edit shell profiles or put a new `udi` executable on `PATH`; the npm-installed CLI remains the command-line entrypoint.

### Project skill reusing the shared runtime

From the application root, install project-scoped skill files. An exact-version shared runtime must already exist:

```sh
cd /path/to/application
udi init --agent codex
udi doctor
```

To explicitly create a missing shared runtime while keeping the skill project-scoped:

```sh
udi init --agent codex --install-runtime
```

### Portable project

Put the runtime inside the project so the whole installation can be copied or moved without relying on `UDI_HOME`:

```sh
udi init --portable --agent codex
node .agents/skills/udi-design/scripts/udi.mjs search "accessible form labels"
```

Include `.udi` and the installed skill directory when copying the project. `--portable` and `--global` cannot be combined. Shared and portable runtimes are version-pinned; projects reuse them without downloading dependencies.

## Use UDI

Search the bundled catalog or generate a deterministic design direction:

```sh
udi search "accessible form labels" --category forms --limit 5
udi search "dashboard metrics" --type dashboard --framework react --json
udi recommend --type saas --style premium --audience "operations teams"
udi recommend --type fintech --preserve-brand --json
```

The same commands can be run through an installed skill launcher:

```sh
node .agents/skills/udi-design/scripts/udi.mjs search "accessible form labels" --json
```

Examples for invoking the installed skill in agent chat:

- **Codex:** `$udi-design` followed by the design task.
- **Claude Code:** `/udi-design` followed by the design task.
- **Cursor:** `/udi-design` followed by the design task.
- **Antigravity:** `/udi-design` followed by the design task.

These are documented invocation conventions, not a claim that each host was live-tested. Current evidence confirms Codex live discovery and execution only. See [supported agents and evidence](docs/agent-compatibility.md).

## Offline behavior and privacy

The npm package contains the CLI, catalog, canonical skill, references, license, and third-party notices. Once installed, `search`, `recommend`, project installation, and runtime execution do not need a network connection. UDI does not collect telemetry or send project source, prompts, or catalog queries to a UDI service. An AI agent may independently communicate with its provider according to that product's behavior and settings.

## Update, repair, and uninstall

Install a newer CLI version using npm or a new trusted tarball. Preview an installation update first, then rerun `udi init` with the same scope and runtime mode for each installation you want to upgrade. For example, a shared-runtime project install:

```sh
udi init --agent all --dry-run
udi init --agent all
udi doctor
```

For a portable project, add `--portable`; for a user-level installation, add `--global`. Use `--force` only after reviewing changes to files UDI already owns. A project remains pinned to its installed runtime until explicitly reinstalled. See [the installation guide](docs/installation.md) for shared-runtime reuse, offline bootstrap, repair, runtime retention, and careful uninstall steps.

`udi doctor` checks files, ownership metadata, hashes, runtime compatibility, and documented static paths. It cannot prove that an agent host has loaded or invoked a skill. Uninstall manually: inspect `.udi/installation.json`, remove only reviewed UDI-owned files and unused runtime versions, and preserve shared skill directories and unrelated files. Optionally remove the CLI with `npm uninstall --global universal-design-intelligence` using the same npm prefix.

## Security and known limitations

UDI uses path containment checks, refuses symlink destinations/parents, tracks managed files by SHA-256, previews changes, and avoids overwriting unrelated or modified files unless explicitly forced. These checks reduce accidental damage; they are not a formal security audit, cryptographic signature system, or guarantee against a malicious or concurrently modified local environment. Review code and tarball contents before installation.

The recommendation engine uses deterministic rules and keyword overlap, not an LLM or user-project analysis. Automated accessibility guidance and checks cannot establish full WCAG conformance. Host discovery and invocation are not live-verified for Claude Code, Cursor, or Antigravity; macOS and Windows require additional platform testing. Antigravity's global adapter targets the documented IDE skills location, not its separate CLI path.

## Project evidence and provenance

An independent, unofficial Lamborghini showcase was built using the globally installed UDI skill and later remediated. The recorded work includes responsive and interaction checks, automated accessibility checks, licensed image credits, and documented remaining limitations. This is a factual case study, not a controlled comparison, a performance claim, or an endorsement by Automobili Lamborghini S.p.A. See [v0.1.0 release notes](docs/release-v0.1.0.md).

UDI's initial catalog is original editorial guidance with provenance and references; references are not permission to reproduce third-party material. Verify license and attribution obligations before adding external content. See the [knowledge contribution guide](docs/knowledge-contribution.md) and [third-party notices](packages/cli/THIRD_PARTY_NOTICES.md).

## Development

```sh
pnpm install
pnpm check
pnpm build
pnpm pack:check
```

The monorepo contains the CLI, typed knowledge catalog, and retrieval/recommendation core. The published CLI bundles the required runtime code; workspace packages are not application dependencies.

## Release and project links

- [v0.1.0 release notes and manual release checklist](docs/release-v0.1.0.md)
- [Architecture](docs/architecture.md)
- [Roadmap](docs/roadmap.md)
- [Progress](docs/PROGRESS.md)
- [Contributing](CONTRIBUTING.md)
- [Security policy](SECURITY.md)

## License

MIT. See [LICENSE](LICENSE).

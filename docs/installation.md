# Installing UDI as a developer tool

UDI is a developer tool and AI skill system, not an application dependency. `init` does not run a package manager or edit application manifests, lockfiles, or `node_modules`. Node.js 22+ is required. Runtime use needs no registry access, network service, symlink, API key, or monorepo checkout.

After publication, install the CLI into an npm global prefix:

```sh
npm install --global universal-design-intelligence
udi --version
```

For an offline or pre-publication setup, install a trusted tarball as described below. Do not install UDI into an application's local dependencies.

## Bootstrap from a local tarball

A maintainer can build and pack locally without publishing:

```sh
pnpm install
pnpm build
cd packages/cli
npm pack --pack-destination /path/to/artifacts
```

Install the resulting local tarball as a user tool, from any directory:

```sh
npm install --global --offline --ignore-scripts /absolute/path/universal-design-intelligence-0.1.0.tgz
udi --version
```

Use a user-writable npm global prefix if the system prefix requires administrator privileges. For example, `npm install --global --prefix /path/to/user-tools --offline --ignore-scripts /path/to/udi.tgz`, then add that prefix's executable directory to PATH (`bin` on Unix, the prefix itself on Windows). This npm installation belongs to the tool prefix, never the application. The tarball has no production npm dependencies: Commander, core, catalog, and Zod are bundled. No lifecycle scripts are needed.

Alternatively, extract the tarball with a local archive tool outside the application and run `node /path/to/extracted/package/dist/index.js` in place of `udi` in all commands below. This avoids npm installation entirely. Keep the extracted package until `init` has copied the runtime; installed skills then work independently of it.

## Choose a scope

The default scope is the detected project root. Explicitly select the agent if detection is absent or ambiguous.

```sh
udi init --global --dry-run
udi init --global
udi init --global --agent all
udi doctor --global

# Reuse the existing exact-version user runtime:
cd /path/to/application
udi init --agent codex --dry-run
udi init --agent codex
udi init --agent all
udi doctor
```

`--global` with no agent installs all supported adapters. Global skills go into vendor discovery directories under the user's home, independently of the runtime-store location. Antigravity targets the documented IDE global path, not the separate Antigravity CLI path. See [agent compatibility](agent-compatibility.md).

If no compatible runtime exists, project installation stops before writing and presents two explicit choices:

```sh
# Authorize creating the user runtime; skills remain project-scoped:
udi init --agent codex --install-runtime

# Carry the runtime with this project; no home writes:
udi init --portable --agent codex
```

Both choices support `--dry-run` and `--agent all`. `--global --portable` is rejected. The tool does not prompt interactively, so CI receives the same actionable error and can explicitly choose a mode.

## Files and runtime resolution

The shared runtime store defaults to `~/.udi`. Set `UDI_HOME` to another directory before running `init` to configure it; relative values resolve against the invoking directory, so prefer absolute paths. Each version lives independently at `<UDI_HOME>/runtimes/<version>/`, with `bin/index.js`, bundled canonical skills, runtime metadata, and license notices. Runtime versions must match exactly; UDI does not guess compatibility or download a missing version.

Project installation copies canonical `SKILL.md`, its references, and a small `scripts/udi.mjs` launcher into each selected agent's discovery path. Each launcher pins an absolute file URL to the chosen shared runtime and checks its version before executing it. All agents and projects can reuse the same runtime. Changing `UDI_HOME` later does not redirect existing launchers; reinstall explicitly to rebind them.

Portable installation puts the same runtime at `.udi/runtimes/<version>` inside the project. Its launchers use relative URLs, so moving or copying the entire project preserves offline operation. Include the installed skill directories and `.udi` in the copy. Neither installation mode needs a `node_modules` directory.

Invoke the launcher using its actual skill directory:

```sh
node /path/to/application/.agents/skills/udi-design/scripts/udi.mjs search "accessible forms" --json
```

## Ownership, updates, and repair

Each scope has a `.udi/installation.json` inventory with exact runtime version/location and SHA-256 hashes for managed skill assets and launchers. Installing another agent retains earlier inventory entries. Identical files remain unchanged. All planned destinations and sources are preflighted before writes. Symlink destinations/parents, path escapes, directories in place of files, and unrelated existing files are rejected. As with ordinary filesystem copy operations, interruption or disk failure during writing may leave a partial installation; rerun the same command to finish it.

Modified skill files require review and explicit `--force`; force only replaces manifest-owned files. Ownership metadata can be updated when adding an agent without forcing unrelated content. Existing versioned runtimes are immutable: even `--force` cannot overwrite differing runtime content. If one is corrupt, inspect and move the affected version directory aside before reinstalling from the trusted matching tarball. Old Phase 3 manifests are rejected for review rather than silently migrated; preserve customizations and move the old installation aside before installing this format.

To upgrade, obtain and bootstrap the new local tarball, preview `udi init --global --agent all --dry-run`, then rerun with `--force` after reviewing the proposed owned-file changes. Repeat in each installed project, preserving its chosen shared/portable mode. A new version gets a separate runtime directory; existing projects remain pinned until explicitly reinstalled. Use `--agent all` when upgrading a scope with multiple agents, so all its launchers move together. Diagnose an older pinned installation with its matching CLI version. The doctor reports missing files, modifications, unsafe paths, and incompatible runtime metadata; it never executes a runtime to inspect it.

No automatic runtime garbage collection occurs, since another project may still reference an older version. Global install does not modify shell profiles or add a new command to PATH; the bootstrap command remains the administrative CLI, and the skill launchers remain directly runnable with Node.

## Uninstall

Run the matching `udi doctor --json` (or `--global --json`) and inspect `.udi/installation.json`. Compare listed hashes before removing anything, preserving modified files for review. Remove only the listed UDI-owned files and the scope's installation manifest; remove empty `udi-design` directories afterward. Never delete shared parents such as `.agents/skills` or files absent from the inventory.

For portable installations, remove the reviewed `.udi/runtimes/<version>` directory with its runtime metadata and notices. For shared installations, keep runtime versions until every referencing project/user skill has been removed or upgraded; UDI has no global project registry to prove a version is unused. Then remove only the reviewed runtime version directory. Keep unrelated contents of `.udi`. Finally, optionally uninstall the bootstrap tool with `npm uninstall --global universal-design-intelligence` using the same user prefix, or remove the extracted bootstrap directory. No application dependency uninstall is necessary.

Static verification does not establish that an agent host loaded the skill. Linux integration tests cover paths containing spaces and portable relocation; macOS/Windows and live host activation still require platform/host testing.

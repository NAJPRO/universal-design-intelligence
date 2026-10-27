# UDI v0.1.0 release notes and checklist

## Release summary

UDI v0.1.0 is the first release of a local-first design-intelligence CLI and portable agent skill. It bundles an 80-rule, 17-profile design catalog and deterministic search/recommendation functionality. The npm package provides the `udi` installer/CLI; it is not intended to be added to an application's dependencies.

The CLI can install skills globally, into a project while reusing an exact-version user runtime, or as a portable project containing its own runtime. It includes preview, file ownership tracking, hash-based diagnostics, and protections against path escapes, symlink destinations, and unintended overwrites.

### What's included

- `udi search` performs deterministic local catalog retrieval with category, project-type, framework, result-count, and JSON options.
- `udi recommend` produces a schema-versioned recommendation using explicit deterministic heuristics.
- `udi init` installs the canonical skill in global, project, or portable scope for Codex, Claude Code, Cursor, or Antigravity.
- `udi doctor` checks static paths, packaged assets, file ownership, hashes, runtime metadata, and Node compatibility.
- Progressive-disclosure references and third-party notices ship with the CLI.
- Search, recommendations, runtime setup, and installed skill execution need no network connection.

### Lamborghini case study

An independent, unofficial Lamborghini editorial showcase was built using the globally installed UDI skill. A subsequent remediation pass addressed documented issues involving narrow-screen text reflow, image resolution and crop selection, keyboard navigation, active-section state, image loading failures, and readable label sizing. The project recorded responsive-browser tests, interaction checks, automated axe checks, image provenance/credits, and remaining limitations.

The remediation report describes one remaining visual limitation: some distant parked vehicles remain visible through the Temerario showroom window. The tests do not establish complete WCAG conformance, physical-device behavior, screen-reader quality, CLS, Lighthouse performance, or superiority to a baseline. This is a project case study, not a controlled comparison, and the work is not affiliated with or endorsed by Automobili Lamborghini S.p.A.

## Known limitations

- Codex live skill discovery and execution are confirmed on Linux. Claude Code, Cursor, and Antigravity adapters have static path/metadata evidence but have not been live-tested.
- UDI's installer targets Node.js 22+ on Linux, macOS, and Windows; macOS/Windows and each host's platform behavior have not been verified here.
- Antigravity's global adapter targets the documented IDE skills directory, not its separate CLI skills directory.
- Recommendations use fixed deterministic rules and keyword overlap. UDI does not inspect a user's application or invoke an LLM.
- `udi doctor` validates installed files and documented locations; it cannot prove the host loaded or invoked a skill.
- Hash inventories and path/symlink checks reduce accidental overwrites. They are not signed package verification, a formal security audit, or protection against a malicious or concurrently modified local environment.
- UDI does not garbage-collect runtimes automatically. Owners must check references before deleting old versions.
- Automated accessibility checks cover only their tested scope and do not prove full accessibility conformance.

## Release checklist

### Maintainer verification

- [x] Package manifest identifies `universal-design-intelligence@0.1.0`, MIT, Node.js `>=22`, ESM, and the `udi` binary.
- [x] npm metadata links to the repository, package directory, homepage, and issue tracker.
- [x] Package whitelist contains the executable, canonical skill and references, README, MIT license, and third-party notices; it contains no workspace paths, application project, lockfiles, or secrets.
- [x] CLI package declares no production dependencies; implementation dependencies are bundled.
- [x] Local packed-tarball smoke checks cover offline global install, CLI help/version, global setup and doctor, project setup/runtime reuse, repeat installation, project manifest/lockfile/`node_modules` preservation, search, recommendation, and portable relocation.
- [x] Installation docs cover global, project, portable, offline, update, repair, and careful uninstall behavior.
- [x] Agent documentation distinguishes static installation from actual discovery/invocation and does not claim untested hosts are live-compatible.
- [x] Catalog provenance policy requires original guidance or verified permission and attribution for redistributed third-party material.
- [ ] Run the final lint, type-check, unit/integration tests, build, and `npm pack --dry-run` from a clean checkout after the release commit is prepared.
- [ ] Rebuild and inspect the exact final tarball, including manifest, file list, size, and hash, before publication.
- [ ] Confirm the npm package name is available/owned by the publisher, publisher account access is correct, and the GitHub repository settings are ready.

### Manual GitHub release steps

1. Review the final source diff, test output, and package tarball; keep the version at `0.1.0` and ensure the release commit is on the intended default branch.
2. The repository owner creates and pushes the `v0.1.0` tag using their normal Git workflow. This release preparation does not create Git state.
3. In GitHub, create a release from `v0.1.0`, use the title `UDI v0.1.0`, paste the release summary and limitations above, and attach the reviewed npm tarball if desired.
4. Publish the release from GitHub only after confirming the selected tag and attached artifact.

### Manual npm release steps

1. From a clean checkout, run `pnpm install`, `pnpm check`, `pnpm build`, and `pnpm pack:check`.
2. Inspect the dry-run contents and build a final tarball from `packages/cli`; verify its manifest, exact files, size, and checksum. Keep the tarball available for verification.
3. Authenticate the authorized publisher with npm by the maintainer's normal method. Do not place an access token in the repository or logs.
4. In `packages/cli`, publish the reviewed package with `npm publish`. This operation is intentionally not run as part of this mission.
5. From a clean temporary directory, install the published version globally, run `udi --version` and `udi --help`, and repeat at least one offline catalog command. Verify the published registry metadata and release page link to the same version.

### Copy-ready project descriptions

**npm description:** Local-first UI/UX guidance and deterministic design search for AI coding agents.

**GitHub description:** Local-first design intelligence and portable UI/UX agent skills, with deterministic offline search, recommendations, and safe installation.


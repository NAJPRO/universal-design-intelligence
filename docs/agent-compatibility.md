# Agent skill compatibility

**Checked:** 2026-10-27 against the official documentation linked below. These pages can change. UDI verifies files and documented static locations; it does not claim a host loaded the skill unless that host is tested separately.

## Verified conventions

| Agent | Project skill path | Discovery and invocation documented by vendor | Global path documented by vendor | UDI adapter |
|---|---|---|---|---|
| OpenAI Codex | `.agents/skills/udi-design/SKILL.md` | Scans skill locations in the current directory and parent directories; supports explicit `$skill-name` invocation. `agents/openai.yaml` is optional presentation metadata. | `$HOME/.agents/skills/<skill-name>/SKILL.md` | `.agents/skills/udi-design` |
| Claude Code | `.claude/skills/udi-design/SKILL.md` | Project skills load from the start directory and parent directories; can be invoked as `/udi-design` and may also be selected automatically when relevant. | `~/.claude/skills/<skill-name>/SKILL.md` | `.claude/skills/udi-design` |
| Cursor | `.agents/skills/udi-design/SKILL.md` and `.cursor/skills/udi-design/SKILL.md` are documented project locations | Skills are discovered at startup, can be invoked with `/`, and may be selected automatically. The skill folder name must match `name`. | `~/.agents/skills/<skill-name>/SKILL.md` and `~/.cursor/skills/<skill-name>/SKILL.md` | `.cursor/skills/udi-design` |
| Google Antigravity | `.agents/skills/udi-design/SKILL.md` | Skills can be invoked with `/skill-name` or selected autonomously. The vendor documents workspace-level `.agents/skills`. | IDE: `~/.gemini/config/skills/`; legacy IDE path `~/.gemini/antigravity/skills/`; CLI: `~/.gemini/antigravity-cli/skills/` | `.agents/skills/udi-design` |

The Codex/Antigravity overlap is intentional and the canonical skill content is byte-identical. `udi init --agent all` writes this shared path once; it does not create competing copies or agent-specific prompt content.

### Skill metadata

All four integrations use the Agent Skills folder format: a folder named `udi-design` containing `SKILL.md` with YAML frontmatter. The interoperable required fields are `name` and `description`; the name matches the folder. The standard recommends concise descriptions and progressive disclosure through linked references. Vendor-specific optional metadata is not required by UDI.

### Operating systems and activation limits

The cited skill documentation establishes file layout and discovery behavior, but does not provide a consistent OS support matrix for every agent CLI/app. UDI's installer uses Node.js filesystem and path APIs and is intended to run on Node.js 22+ on Linux, macOS, and Windows. That is an implementation target, not verification that each agent product supports each OS.

Static path/metadata validation is separate from host runtime discovery. This environment has Codex and Claude executables available, but no paid or remote agent session was authorized or invoked. Cursor and Antigravity executables were unavailable. Therefore, all host runtime-discovery results remain **not tested**; `udi doctor` reports this explicitly.

## Official sources

- [OpenAI Codex skills](https://developers.openai.com/codex/skills/) — currently redirects to OpenAI's skills documentation.
- [OpenAI skills documentation](https://learn.chatgpt.com/docs/build-skills) — current destination reached from the Codex URL.
- [Claude Code skills](https://code.claude.com/docs/en/skills) — project, personal, enterprise, and nested paths; discovery and invocation.
- [Cursor skills](https://cursor.com/docs/skills) — supported project/user directories and invocation behavior.
- [Google Antigravity skills](https://antigravity.google/docs/skills) — workspace and host-specific global locations.
- [Agent Skills specification](https://agentskills.io/specification) — portable folder and metadata format.

## Installation behavior and troubleshooting

First provision a user runtime with `udi init --global`, or choose explicit `--install-runtime`/`--portable`. Run `udi init --agent <codex|claude|cursor|antigravity>` from the project (or `udi init --agent all` where the shared `.agents/skills` destination is desired). The installer previews with `--dry-run`, preserves unrelated files, and refuses to replace modified UDI-owned files unless `--force` is supplied. Installation never needs network access.

Run `udi doctor` to check installed files and static paths. If a skill does not appear in the host, restart/reload that host if its documentation describes startup scanning, confirm the project root and the path listed by doctor, then invoke the skill by name if supported. A successful doctor result is not proof of runtime activation.

Uninstall manually after checking the ownership inventory and hashes: remove only reviewed UDI-owned files reported by `udi doctor` and `.udi/installation.json`, plus reviewed unused runtime versions. Preserve unrelated `.udi` files. Do not remove shared parent directories such as `.agents/skills`, `.claude/skills`, or `.cursor/skills`, since they may contain other user skills.

Global installation is implemented: `udi init --global` installs all adapters, and `--agent` can narrow the selection. Antigravity uses `~/.gemini/config/skills/udi-design` for the IDE; its separate CLI location is not targeted. Runtime stores are independent of discovery paths. See [installation](installation.md) for shared/portable modes and hash-aware uninstall/upgrade procedures.

Phase 3.1 global paths were rechecked against [Codex local skills](https://learn.chatgpt.com/docs/build-skills), [Claude skills](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview), [Cursor skill locations](https://cursor.com/help/customization/skills), and [Antigravity migration/global skills](https://antigravity.google/docs/migration/workflows-to-skills). This is static documentation evidence, not a live-host test.

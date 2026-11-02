# UDI local knowledge commands

Run the installed `scripts/udi.mjs` launcher beside this skill's `SKILL.md` with Node.js 22+. Resolve its full path from the skill directory supplied by the agent; do not assume the current working directory is the skill directory. It pins an exact UDI runtime version and works from any project directory. Project installs reuse the user runtime by default; portable installs carry the runtime inside `.udi/runtimes/<version>` and can be moved with the project. No application dependencies or network services are needed.

```sh
node <skill-directory>/scripts/udi.mjs search "dashboard filters and table density" --type dashboard --limit 5
node <skill-directory>/scripts/udi.mjs search "accessible form errors" --category forms --json
node <skill-directory>/scripts/udi.mjs recommend --type saas --audience "enterprise operations teams" --framework react
```

If the launcher reports a missing or incompatible runtime, run the matching CLI's `doctor` (with `--global` for user skills), then explicitly select `init --install-runtime` or `init --portable` for repair. Never add UDI to the application's package manifest.

`search` supports `--category`, `--type`, `--framework`, `--limit`, and `--json`. `recommend` supports `--type`, `--style`, `--framework`, `--audience`, `--preserve-brand`, and `--json`. Run either command with `--help` to see option values.

Search and recommendations are deterministic heuristics over the bundled catalog, not LLM reasoning. Cite rule IDs when using the guidance. If a query returns no results, broaden it rather than implying that a rule was found.

## Capability-aware recommendations

Use the resolved launcher (shown as `<udi>` below), not a global executable of unknown provenance. Record `<udi> --version`, `recommend --help` and root `--help`. The development package version alone does not imply feature support.

- If recommendation help advertises `2.1` and root help exposes `inspect`, request `recommend --schema-version 2.1 --context brief.json --json`.
- If only `2.0` is advertised, request `recommend --schema-version 2.0 --context brief.json --json`.
- Otherwise use the legacy `recommend --type … --framework … --audience … --preserve-brand --json` and focused `search` commands above. Do not pass unsupported flags.

Both enhanced versions use **context schema 2.0**. Build a small context file from project evidence, for example (omit framework when unknown):

```json
{
  "schemaVersion": "2.0",
  "applicationType": { "value": "operations-workspace", "status": "observed", "evidenceRefs": ["src/catalog-page"] },
  "tasks": {
    "primary": { "value": "manage products table", "status": "explicit", "evidenceRefs": ["user:brief"] },
    "secondary": [
      { "value": "filter products", "status": "explicit", "evidenceRefs": ["user:brief"] },
      { "value": "edit product form", "status": "explicit", "evidenceRefs": ["user:brief"] }
    ]
  },
  "brand": { "preserve": true }
}
```

Put task/component evidence in `tasks`/`components`; free query prose alone does not establish component applicability. Do not invent explicit evidence or treat role matching as permission. Inspect the returned `coverage`, `conflicts`, `assumptions`, and selected entity IDs. General category coverage does not establish domain completeness.

With 2.1, run `inspect <selected-ID> --json` for the contracts relevant to implementation, one at a time. A composition can identify its required slots; inspect those selected components only as needed. Summarize obligations into decisions rather than pasting full records into the conversation. Unknown IDs and unsupported requirements must remain visible.

Packets default to 24,576 bytes. Use `--expand <returned-key>` with the exact same context/schema only when omitted guidance is needed; merge by ID. On a budget error, increase `--budget-bytes` deliberately. Do not repeatedly fetch the whole catalog. If a capability probe contradicts the actual command, preserve its error, then use an advertised older path; do not silently discard invalid-context or retrieval failures as version incompatibility.

## Design direction (capability-gated)

When root help advertises `direct`, reuse context schema 2.0:

```sh
<udi> direct --context brief.json --json
# Only when supported by the actual product intent:
<udi> direct --context brief.json --character editorial --interactions press,feedback --json
<udi> direct --context brief.json --query "disclosure reduced motion" --json
<udi> inspect DIR-EDITORIAL --json
<udi> inspect MOT-DISCLOSURE --json
<udi> inspect QUA-HIERARCHY --json
```

`direct` is a separate schema 1.0 decision packet, not recommendation schema 1.0.
It defaults to 8,192 bytes including newline, contains one direction and at most two
complete motion records, and lists omitted motion IDs for inspection. Its review
index covers eleven dimensions; inspect only the relevant dimension for positive,
negative, measurable-failure and revision indicators. `--query` discovers knowledge
IDs without treating aesthetic prose as evidence of an interaction. Scroll/entrance
motion additionally requires explicit interaction intent and an editorial/marketing
application. Required no-motion constraints suppress motion. Brand/system bindings
and required constraints take precedence over a preferred character.

For task/component contracts, keep using the supported `recommend` schema; `direct`
does not replace its domain/task coverage diagnostics or imply that every design
choice has a component contract. Never infer user trust or aesthetic superiority
from a deterministic selection. Full inspection records are deliberately separate
from bounded packets. No animation library or font download is required.

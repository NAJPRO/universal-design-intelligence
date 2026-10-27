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

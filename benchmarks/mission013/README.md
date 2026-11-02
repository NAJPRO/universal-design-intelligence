# Mission 013 — original experience demonstration

Morrow Print Room is an original UDI/MIT fictional workshop programme, implemented
by the controller from actual retrieved guidance. It is not an independent agent
comparison, booking service or proof of aesthetic superiority. No historical app,
external assets, application dependencies or remote fonts are used.

From repository root, with existing dependencies/tools:

```sh
pnpm build
node packages/cli/dist/index.js direct --context benchmarks/mission013/protocol/context.json --character editorial --interactions press,feedback --json
python3 -m http.server 8023 --bind 127.0.0.1 --directory benchmarks/mission013/demo
# Visit http://127.0.0.1:8023 in your browser; stop the server afterward.
```

The demonstration saves a draft to IndexedDB on the viewing device, with explicit
local-only acknowledgement and a deletion action. Use fictional names. No request,
payment or reservation is transmitted. Storage denial retains input and offers a
retry; the browser harness tests that path using disclosed temporary instrumentation.

## Reproduce checks

```sh
node benchmarks/mission013/evaluate.mjs
# Timing only after all other builds/tests/browser work finish:
node benchmarks/mission013/measure.mjs
pnpm check
# If concurrent CLI timing tests fail, record the failure and try separately:
pnpm exec vitest run packages/cli/test packages/core/test packages/knowledge/test --no-file-parallelism
```

The CDP harness requires installed Chrome/Node and permission for local subprocesses
and a loopback HTTP server. It does not download a browser. It writes only this
mission's browser results and local ignored PNGs/profiles. Preserve retained results
before comparing another environment. Reduced-motion mode is emulated through CDP.

`protocol/` holds the original task/context and pre-implementation compatibility/
historical hashes. `evidence/direction.json`, `disclosure.json` and
`critique-composition.json` are actual CLI responses used before implementation.
`composition-replay.json` evaluates the old Mission 012 C context against the new
runtime; it is a new replay, not rewritten historical evidence. Browser assertions,
source/PNG hashes, cost measurements, validation limits and the decisions below are
retained as essential compact evidence. `.local/`, browser profiles and screenshots
are ignored. Screenshots can be recreated; they are not claimed as unique agent
trial evidence. No generated runtime or installed skill is copied here.

## Retrieved guidance → implementation

| ID | Concrete decision |
| --- | --- |
| `DIR-EDITORIAL` | One large outcome-led serif headline, an original print artifact, practical facts and action before decorative material on mobile; programme rows instead of repeated cards |
| `DIR-EDITORIAL` brand/color binding | Preserve the fictional paper/ink/vermilion tokens; use accent for typographic emphasis and selected/action meaning, with separate status text |
| `MOT-PRESS` | Stable radio hit areas, a short selected-check transition, bounded button press feedback and immediate keyboard focus |
| `MOT-FEEDBACK` | A real pending IndexedDB write, persistent honest success/error copy, no fake booking or transport progress |
| `MOT-DISCLOSURE` | Native details with a small rotating indicator; trigger/reading order remain stable; no height tween |
| `QUA-COMPOSITION` | Shared alignment, unequal feature/information proportions, compact offering rows and a separate useful local-draft surface |

## Review and limits

Browser evaluation: 42/42 sampled assertions, 13 native screenshots at four widths
plus reduced motion; all historical hashes and recorded v1/v2 packets preserved.
Controller inspected opening desktop/320px and saved 375px screenshots. The focal
hierarchy, limited palette and section rhythm form a coherent editorial intention;
that is a contextual judgment, not a measured beauty score. Some secondary labels
are deliberately small; broader readability/user review remains warranted. Loading
is observed synchronously during a real write, not prolonged for a screenshot.
There is no whole-session layout-shift study, screen-reader, real touch, cross-browser,
zoom or independent blinded comparative validation. See [the report](../../docs/MISSION-013.md).

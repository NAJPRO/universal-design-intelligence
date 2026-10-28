# Mission 009 evaluation and measurement

`evaluation.json` was authored before the component catalog/selection implementation. `evaluation.sha256` freezes that original file. It contains six synthetic operational domains and their public-information contrasts, isolated form/filter/table cases, generic dashboard and irrelevant negatives, missing application evidence and an unsupported calendar requirement. Each operational fixture includes fictional identifiers, long names, status distinctions and example data. These describe contract review conditions, not executed rendered-interface states.

All labels and content were written by the implementing agent. They are independently authored from external libraries and separated from the catalog, but **not independent reviewers, sealed held-out evaluation, domain-expert approval, or the 140-query/63-session research benchmark**. The tests must not be described as evidence of visual superiority.

After `pnpm build`:

```sh
node tests/mission009/evaluate.mjs > /tmp/mission009-evaluation.json
python3 tests/mission009/measure.py /tmp/udi-mission009-before /tmp/udi-mission009-after > /tmp/mission009-performance.json
```

Use fresh artifact paths when reproducing; preserve recorded historical reports. Run evaluation and process measurements sequentially, with no concurrent build/test workload. `evaluate.mjs` measures exact specification selections, false suggestions, expected-spec coverage accounting, explicit gaps, explanation structure, deterministic output and packet bytes. It also records 10 warmups plus 60 trials per library API, including validation, index construction, existing retrieval/conflicts and packing. The projection API intentionally executes the complete 2.1 pipeline. Timings are current-corpus diagnostics, not a 1,000-entity scaling result.

Before/after trees must each contain the complete built local CLI package: `dist/`, `package.json`, `README.md`, `LICENSE`, and `THIRD_PARTY_NOTICES.md`. Preserve before **before modifying runtime code**. This mission's temporary snapshots are `/tmp/udi-mission009-before` and `/tmp/udi-mission009-after`; they may later be removed. Durable artifacts retain bundle hashes, raw samples and methodology, not the baseline executable.

`measure.py` runs three blocks of six alternating pairs per common command, shuffles command order with a fixed seed, captures stdout identically and asserts unchanged stdout hashes. It separately measures new 2.1/inspection commands and an empty-Node control. These are fresh processes with warm filesystem caches, not OS-cache-cold trials. Local `npm pack --dry-run --ignore-scripts` measures compressed/unpacked size without registry access. No package is published.

`protected-hashes.json` records mission-start hashes for the legacy catalog, 2.0 engine/schema, canonical skill, installer and lockfile. Verify without changing files:

```sh
python3 - <<'PY'
import hashlib,json,pathlib
for name,digest in json.loads(pathlib.Path('tests/mission009/protected-hashes.json').read_text()).items():
    assert hashlib.sha256(pathlib.Path(name).read_bytes()).hexdigest() == digest, name
print('Protected content unchanged')
PY
```

Package-local tests additionally check strict schemas, malformed state/reference graphs, variant compatibility, dependency cycles, framework/conflict gates, atomic pages, stale cursors, mutable supplied catalogs, old v1/2.0 snapshots, V8 initializer isolation and offline standalone tarball behavior. The historical 008.1 error fixture stays unchanged; its test permits exactly the intentional added `2.1` help choice and associated line wrap. Installer tests use temporary user/runtime/project directories and retain immutable version guarantees.

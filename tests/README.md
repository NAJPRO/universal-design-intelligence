# Test strategy

Package-local tests live beside their owning package:

- `packages/knowledge/test/`: strict schema validation and catalog integrity.
- `packages/core/test/`: BM25 ranking/filtering, context-aware recommendations, conflict handling, and a 16-query retrieval benchmark.
- `packages/cli/test/`: built CLI command, JSON, filter, error, and runtime asset integration checks.

Run all current checks from the workspace root with `pnpm check`. The search benchmark reports Recall@5 and MRR@10 from the committed expected-relevance set; it is a small baseline, not an external or statistically representative evaluation.

Historical Missions 008–010 retain experiment fixtures, protocols and evidence.
Mission 010's complete 182-file archive is required by the Mission 011/012 file-set
and SHA-256 inventories, including original logs and derived review sheets.
Its eight raw privacy files are preserved in a private archive outside Git and
excluded by eight precise root ignore rules; the other 174 files remain selected
for owner staging. Public sanitized copies have their own
[provenance manifest](../public-exports/mission010/provenance.json). See the
[archive-resolution policy](../docs/REPOSITORY-HYGIENE-AUDIT.md#11-mission-010-archive-resolution)
and [per-file retention manifest](../docs/mission010-archive-manifest.json).

Do not add files inside the frozen `tests/mission010/` tree or rerun evidence
writers there. Use a disposable repository-layout copy for verification; the
archive-resolution policy documents the procedure. For a complete verification
from the private archive, run from the repository root:

```sh
python3 -B scripts/mission010-private-archive.py verify-history \
  --archive ../.udi-private-archives/mission010/mission010-originals.tar
```

This restores raw files only inside a temporary copy, checks all four mission
verifiers and all 182 original hashes, then removes the copy. The private archive
is currently local only; no independent backup has been verified. The existing `.chrome-*/`
rule excludes browser scratch profiles; existing historical evidence must remain
available for full cross-mission verification.

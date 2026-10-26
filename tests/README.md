# Test strategy

Package-local tests live beside their owning package:

- `packages/knowledge/test/`: strict schema validation and catalog integrity.
- `packages/core/test/`: BM25 ranking/filtering, context-aware recommendations, conflict handling, and a 16-query retrieval benchmark.
- `packages/cli/test/`: built CLI command, JSON, filter, error, and runtime asset integration checks.

Run all current checks from the workspace root with `pnpm check`. The search benchmark reports Recall@5 and MRR@10 from the committed expected-relevance set; it is a small baseline, not an external or statistically representative evaluation.

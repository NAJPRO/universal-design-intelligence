# Test strategy

Package-local tests live beside their owning package. The CLI smoke/integration tests are in `packages/cli/test/`; shared end-to-end checks can be added here as retrieval, installation, and package workflows are implemented.

Run all current checks from the workspace root with `pnpm check`.

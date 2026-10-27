import { build } from "esbuild";

await build({
  bundle: true,
  banner: { js: 'import { createRequire as udiCreateRequire } from "node:module"; const require = udiCreateRequire(import.meta.url);' },
  entryPoints: ["src/index.ts"],
  format: "esm",
  outfile: "dist/index.js",
  platform: "node",
  sourcemap: false,
  tsconfig: "tsconfig.json",
  target: "node22"
});

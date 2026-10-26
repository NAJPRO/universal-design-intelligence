import { build } from "esbuild";

await build({
  bundle: true,
  entryPoints: ["src/index.ts"],
  external: ["commander"],
  format: "esm",
  outfile: "dist/index.js",
  platform: "node",
  sourcemap: false,
  tsconfig: "tsconfig.json",
  target: "node22"
});

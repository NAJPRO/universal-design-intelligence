import { copyFileSync, mkdirSync } from "node:fs";

const sourceDirectory = new URL("../../../skills/udi-design/", import.meta.url);
const destinationDirectory = new URL("../dist/skills/udi-design/", import.meta.url);
const assets = ["SKILL.md", "references/udi-cli.md", "references/design-quality.md"];

for (const asset of assets) {
  const destination = new URL(asset, destinationDirectory);
  mkdirSync(new URL(".", destination), { recursive: true });
  copyFileSync(new URL(asset, sourceDirectory), destination);
}

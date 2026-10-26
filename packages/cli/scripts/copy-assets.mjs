import { copyFileSync, mkdirSync } from "node:fs";

const source = new URL("../../../skills/udi-design/SKILL.md", import.meta.url);
const destinationDirectory = new URL("../dist/skills/udi-design/", import.meta.url);

mkdirSync(destinationDirectory, { recursive: true });
copyFileSync(source, new URL("SKILL.md", destinationDirectory));

#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { Command } from "commander";

interface PackageManifest {
  version: string;
}

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as PackageManifest;

new Command()
  .name("udi")
  .description("Local-first design intelligence for AI coding agents")
  .version(manifest.version)
  .parse();

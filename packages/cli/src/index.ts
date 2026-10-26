#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { Command, InvalidArgumentError, Option } from "commander";
import {
  FRAMEWORKS,
  PROJECT_TYPES,
  RULE_CATEGORIES,
  designRules,
  recommendDesign,
  searchDesignRules
} from "@udi/core";
import type { Framework, ProjectType, RuleCategory, SearchRequest } from "@udi/core";

interface PackageManifest {
  version: string;
}

const manifest = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8")
) as PackageManifest;

function parseLimit(value: string): number {
  if (!/^\d+$/.test(value)) {
    throw new InvalidArgumentError("limit must be a whole number between 1 and 100");
  }
  const parsed = Number(value);
  if (parsed < 1 || parsed > 100) {
    throw new InvalidArgumentError("limit must be a whole number between 1 and 100");
  }
  return parsed;
}

function addCommonOptions(command: Command): Command {
  command
    .addOption(new Option("--framework <framework>").choices([...FRAMEWORKS]))
    .option("--json", "Print machine-readable JSON");
  return command;
}

const program = new Command()
  .name("udi")
  .description("Local-first design intelligence for AI coding agents")
  .version(manifest.version)
  .showHelpAfterError();

addCommonOptions(
  program.command("search")
    .description("Search the local, curated design knowledge catalog")
    .argument("<query>", "Words describing the design problem or guidance")
)
  .addOption(new Option("--category <category>").choices([...RULE_CATEGORIES]))
  .addOption(new Option("--type <type>").choices([...PROJECT_TYPES]))
  .option("--limit <number>", "Maximum results (1–100)", parseLimit, 10)
  .action((query: string, options: {
    category?: RuleCategory;
    type?: ProjectType;
    framework?: Framework;
    limit: number;
    json?: boolean;
  }) => {
    const request: SearchRequest = {
      query,
      limit: options.limit,
      ...(options.category ? { category: options.category } : {}),
      ...(options.type ? { projectType: options.type } : {}),
      ...(options.framework ? { framework: options.framework } : {})
    };
    const results = searchDesignRules(designRules, request);
    if (options.json) {
      console.log(JSON.stringify(results.map(({ rule, score, sourceIds }) => ({
        ruleId: rule.id,
        category: rule.category,
        title: rule.title,
        summary: rule.summary,
        guidance: rule.guidance,
        priority: rule.priority,
        score,
        sourceIds
      })), null, 2));
      return;
    }
    console.log(`Search results for “${query}” (${results.length})`);
    if (results.length === 0) {
      console.log("No matching design rules. Try broader terms or remove a filter.");
      return;
    }
    for (const [index, result] of results.entries()) {
      console.log(`\n${index + 1}. [${result.rule.priority}] ${result.rule.id} — ${result.rule.title}`);
      console.log(`   Category: ${result.rule.category} | Score: ${result.score.toFixed(3)}`);
      console.log(`   ${result.rule.summary}`);
      console.log(`   Guidance: ${result.rule.guidance.join(" ")}`);
      console.log(`   Sources: ${result.sourceIds.join(", ")}`);
    }
  });

addCommonOptions(
  program.command("recommend")
    .description("Generate a deterministic, context-aware design direction")
)
  .addOption(new Option("--type <type>").choices([...PROJECT_TYPES]))
  .option("--style <style>", "Preferred visual style")
  .option("--audience <audience>", "Intended users or buyers")
  .option("--preserve-brand", "Preserve existing brand and design-system choices")
  .option("--brand-description <description>", "Short description of the existing brand")
  .option("--design-system <name>", "Name of the existing design system")
  .action((options: {
    type?: ProjectType;
    framework?: Framework;
    style?: string;
    audience?: string;
    preserveBrand?: boolean;
    brandDescription?: string;
    designSystem?: string;
    json?: boolean;
  }) => {
    const recommendation = recommendDesign({
      ...(options.type ? { type: options.type } : {}),
      ...(options.framework ? { framework: options.framework } : {}),
      ...(options.style ? { style: options.style } : {}),
      ...(options.audience ? { audience: options.audience } : {}),
      ...(options.preserveBrand || options.brandDescription || options.designSystem
        ? {
            constraints: {
              preserveBrand: Boolean(options.preserveBrand),
              ...(options.brandDescription ? { existingBrandDescription: options.brandDescription } : {}),
              ...(options.designSystem ? { designSystem: options.designSystem } : {})
            }
          }
        : {})
    });
    if (options.json) {
      console.log(JSON.stringify(recommendation, null, 2));
      return;
    }
    console.log(`${recommendation.profile.name} (${recommendation.profile.id})`);
    console.log(recommendation.profile.reason);
    console.log("\nDesign direction");
    console.log(`- Visual principle: ${recommendation.direction.visualPrinciple}`);
    console.log(`- Typography: ${recommendation.direction.typography}`);
    console.log(`- Color: ${recommendation.direction.color}`);
    console.log(`- Layout: ${recommendation.direction.layout}`);
    console.log(`- Interaction: ${recommendation.direction.interaction}`);
    console.log("\nRecommendations");
    for (const item of recommendation.recommendations) {
      console.log(`- [${item.priority}] ${item.ruleId} ${item.title}`);
      console.log(`  ${item.guidance[0]}`);
    }
    if (recommendation.conflicts.length > 0) {
      console.log("\nResolved conflicts");
      for (const conflict of recommendation.conflicts) {
        console.log(`- ${conflict.dimension}: selected ${conflict.selectedValue} (${conflict.selectedRuleId})`);
      }
    }
    if (recommendation.assumptions.length > 0) {
      console.log("\nAssumptions");
      for (const assumption of recommendation.assumptions) {
        console.log(`- ${assumption}`);
      }
    }
    console.log(`\nSource rules: ${recommendation.sourceRuleIds.join(", ")}`);
    console.log(`Engine: ${recommendation.engine}; schema ${recommendation.schemaVersion}`);
  });

program.parse();

import {
  antiPatterns,
  componentPatterns,
  designProfiles,
  designRules,
  validateCatalog
} from "../dist/index.js";

validateCatalog({
  rules: designRules,
  profiles: designProfiles,
  patterns: componentPatterns,
  antiPatterns
});

console.log(
  `Validated catalog: ${designRules.length} rules, ${designProfiles.length} profiles, ${componentPatterns.length} patterns, ${antiPatterns.length} anti-patterns.`
);

const { professionalComponents, validateComponentCatalog } = await import("../dist/components.js");
validateComponentCatalog(professionalComponents, { rules: designRules, profiles: designProfiles, patterns: componentPatterns, antiPatterns });
console.log(`Validated component pack: ${professionalComponents.components.length} families, ${professionalComponents.compositions.length} composition.`);

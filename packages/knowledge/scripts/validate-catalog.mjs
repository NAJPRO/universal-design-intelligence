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

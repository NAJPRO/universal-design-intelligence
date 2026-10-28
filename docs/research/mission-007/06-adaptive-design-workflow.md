# Adaptive design workflow

**Proposal for a future skill revision.** This mission does not change the shipped skill. The agent gathers and interprets evidence; offline UDI ranks the supplied context. Neither references nor a user-selected style are prerequisites.

## 1. Inspect before asking

Read repository instructions, relevant route/component files, manifests, framework and styling configuration, local token definitions, existing screens, and available tests. Detect component inventory from imports/exports and local conventions, not only dependency names. Distinguish installed library, actually used library, and approved design system. A React dependency alone does not identify the framework, base component library, or product design language.

Read a bounded sample (proposed default: 50 relevant text files, at most 1 MiB total, skipping generated/vendor/build/credential files). Report what was inspected and why, plus missing evidence. Do not execute arbitrary package scripts during inspection. Follow symlink/path boundaries and redact sensitive values from output. A future collector should support explicit include paths and a scan limit, never a universal full-tree scrape.

Capture industry, application type, role, primary task, secondary tasks, known components, brand evidence, interaction consequences and responsive constraints. Prefer user instructions over inference. Mark contradictory route evidence rather than flattening a repository containing both a public site and an internal workspace into one global profile.

## 2. Decide whether a question matters

Questions are optional when enough evidence exists. Ask only if different plausible answers change the primary workflow, consequential operation, or brand direction materially. Do not ask the user to choose a visual style merely because a style field exists. Do not demand reference websites.

| Evidence situation | Action | Optional concise question if unresolved |
| --- | --- | --- |
| Product routes show SKU/variant editing and inventory | Infer commerce administration, record evidence and proceed | None |
| Brief says “healthcare app,” no routes or roles | Proceed with safe shared inspection; hold clinical assumptions | “Which primary experience: patient portal (recommended for this brief), staff scheduling, or clinical workspace?” Use a recommended option only when the brief supports it |
| Existing coherent tokens/components | Preserve and extend; repair proven issues in scoped pairings | None |
| Empty project with clear product/audience | Propose one grounded direction with brief rationale and proceed | None |
| Established brand conflicts with explicit request for a new identity | Explain the concrete scope difference | “Keep the current identity and refine it (recommended), or create a new identity?” unless the user already authorized replacement |
| Unknown critical action policy | Keep action semantics unresolved and implement only independently authorized work in a future implementation task | Ask about the policy, not cosmetic preferences |

Suggested choices must be meaningful and limited to two or three, with a reason for the recommended default. Clarification must not become routine approval for each design decision. If an answer is required for a consequential behavior, elapsed time does not authorize it.

## 3. Preserve or establish the identity

Use three distinct evidence states: established observed identity, user-requested direction, and unknown/new identity. Existing tokens and typography are actual project evidence; a luxury mood phrase is not proof that approved tokens exist. Preserve local naming, semantic colors, type roles, spacing and interaction conventions. Propose changes tied to a specific issue, with narrow scope and evidence.

For new projects, ground direction in subject, audience and task: select type roles, layout hierarchy, surface/accent roles, density and motion policy. Choose existing/local fonts and assets where possible; no remote font or image service is necessary to use UDI. A missing asset should produce a purposeful placeholder or content strategy, not a forced download or invented licensing claim.

If voluntarily supplied, inspect screenshots/references for transferable principles: information hierarchy, contrast, density, proportion, task grouping and interaction emphasis. Distinguish visible evidence from inferred hidden behavior. Do not clone distinctive logos, imagery, proprietary visual assets, or exact trade dress. Record reference source and rights uncertainty; UDI need not retain the original image.

## 4. Retrieve with coverage, then plan

Classify context using the orthogonal model in [04](04-domain-intelligence.md). Run version-appropriate local recommendations and targeted retrieval. Confirm coverage for task, components, accessibility, responsive adaptation, recovery and domain meaning. A top-ten result is not evidence all necessary topics were retrieved. Ask the engine for missing categories or specific IDs; if the pack lacks them, state the gap and use bounded generic guidance.

A short design direction should include:

- Primary task and role; confirmed versus inferred context.
- Existing system/brand evidence and proposed token roles.
- Selected composition and why its hierarchy suits that task.
- Required components, variants, states and responsive restructuring.
- Rule/entity IDs applied, conflicts, missing knowledge and inspection plan.

Example: a merchant editor needs product identity and publication readiness above a variant/inventory workspace, with media and fulfillment details revealed when relevant. A public sports booking page needs activity, location, time and participation requirements before account administration. Both may use a date field; they should not share the same default dashboard composition.

## 5. Framework-aware implementation guidance

For a future implementation mission, map behavioral contracts onto existing components first. Check actual local versions and part APIs before suggesting React Aria, Radix, Base UI, shadcn, native HTML or other implementations. Do not mix their trigger/slot/composition APIs by name similarity. Guidance for unknown versions must be labeled unverified. Preserve SSR/client boundaries, routing, form conventions and controlled state ownership already used by the project.

Represent derived state deliberately: filter scope, selected entity, draft values, saving and unknown-result states must be consistent. UI permission states communicate application authorization; frontend visibility alone does not provide access control. Choose native controls when their behavior is sufficient, avoiding elaborate reimplementations solely for visual novelty.

## 6. Render, inspect and refine

Use the project's existing verification tools when available. Render realistic populated/loading/empty/error/permission-denied/partial-failure states. Inspect narrow, middle and wide widths, long content, keyboard flow, text enlargement and reduced motion. Log automated checks separately from actual screenshot inspection and manual/assistive-technology review.

For each defect: record screenshot/route/state, expectation, observed problem, proposed correction, and retest. Rank by consequence: task loss, access barriers and wrong entity/state interpretation first, then hierarchy, density, alignment and polish. Reinspect corrected states. A proposed default is two bounded critique/refinement passes; unresolved important problems remain documented rather than hidden by a passing score.

When rendering tools are unavailable, provide static review and exact unverified checks. Do not claim visual validation, screen-reader quality, or aesthetic excellence from code inspection or an automated accessibility score. The final handoff should name the chosen direction, applied knowledge, checks actually run, remaining limitations and next inspection targets.

## Skill packaging

Keep canonical instructions concise. Progressive references can cover context inspection, component/state contracts, domain disambiguation, retrieval coverage, and evidence-based review. Keep one source for behavior rules and reference stable entity IDs. No full-catalog context dump, internet dependency, external MCP requirement, or permanent project evidence storage is necessary. Optional evidence artifacts belong in a project-approved documentation location; do not overwrite user design documents or modify application dependencies as part of skill installation.

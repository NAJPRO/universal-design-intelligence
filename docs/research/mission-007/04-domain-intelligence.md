# Domain intelligence

**Proposal unless explicitly sourced.** Domain scenarios are original research synthesis, not clinical, legal, financial, or regulatory instructions. They require domain review before becoming production recommendations. No real customer, patient, student, tenant, or financial records are needed.

## Independent context axes

Industry is not application type. Use separate, extensible identifiers for:

- Industry: e-commerce, healthcare, banking-finance, real-estate, education, sports; support multiple industries where evidence warrants it.
- Application type: public-information, marketing, storefront, self-service-portal, operations-workspace, analytics, authoring, scheduling.
- Roles and tasks: merchant editing inventory, clinician reviewing an encounter, teacher publishing grades.
- Scope: organization, workspace, entity, jurisdiction if supplied, locale, device/input modality, data sensitivity, consequence severity.

Healthcare/public-information should retrieve clear service information and navigation; healthcare/operations-workspace should retrieve identity, work queues, handoff and task recovery. Neither should automatically inherit a hospital-green palette or clinical compliance claims. E-commerce/storefront is a discovery/purchase workflow; e-commerce/operations-workspace is product/order administration. Shared primitives do not imply equivalent priorities.

## Proposed pack contract

```ts
type DomainPack = {
  schemaVersion: "2.0"; kind: "domain-pack";
  id: string; version: string; engineRange: string;
  dependencies: { id: string; versionRange: string; required: boolean }[];
  industryIds: string[];
  applicationVariants: {
    applicationType: string; roleIds: string[]; taskIds: string[];
    compositionIds: string[]; excludedCompositionIds: string[];
    requiredCoverage: string[];
  }[];
  roles: { id: string; purpose: string; taskIds: string[] }[];
  vocabulary: { term: string; meaning: string; aliases: string[];
    ambiguity: string | null }[];
  entities: { id: string; identityFields: string[]; units: string[];
    sensitivity: "public" | "internal" | "sensitive" }[];
  workflows: { id: string; roleIds: string[]; entityIds: string[];
    steps: string[]; criticalActions: string[]; recovery: string[] }[];
  risks: { id: string; trigger: string; consequence: string;
    mitigationRuleIds: string[]; needsExpertReview: boolean }[];
  screenIds: string[]; componentIds: string[];
  accessibilityNeeds: string[]; antiPatternIds: string[];
  provenance: SourceEvidence[]; // contract in document 03
};
```

Example excerpt: `DOM-COMMERCE-ADMIN` depends on a core composition pack and applies to `ecommerce` + `operations-workspace`. Roles include `merchant-editor` and `catalog-reviewer`; workflow `TASK-PRODUCT-PUBLISH` refers to `product` and `variant`; required coverage includes identity, publication state, validation, media, selection scope, partial failure and permission-denied. `COM-PRODUCT-WORKSPACE` is eligible, while a storefront product-grid composition is not a substitute. This is a design excerpt, not a full schema-valid runtime entry.

Validate strict record shapes and bounded arrays; unique/versioned IDs; supported engine range; dependency graph acyclicity; every role/task/entity/screen/component reference; application-specific exclusions; unit and identity requirements; reviewed source provenance; no runtime network URLs masquerading as required dependencies. Unknown domain IDs yield an explicit unsupported-pack result plus general guidance. Packs ship local data only; no executable pack hooks, client files, or remote fetching.

## Six initial research profiles

### E-commerce

**Types/roles:** storefront and shopper account for shoppers; product/order administration for merchants, editors, fulfillment staff and support. **Workflows:** discover/compare/buy/return versus create product, edit variants, update stock, publish, fulfill and resolve returns. **Terminology:** SKU, variant, inventory, available/reserved, fulfillment, refund, publication channel. The [Shopify Product object](https://shopify.dev/docs/api/admin-graphql/latest/objects/Product) illustrates products with variants/media and publication context; it is a vendor-specific vocabulary reference, not UDI's data model.

**Priority/screens/components:** product list, product detail/editor, variant matrix, media manager, stock exceptions, order timeline, bulk-action review. Show entity, price/currency, availability and lifecycle status before secondary analytics. Critical actions include bulk price/stock changes, publication and refund submission. **Risks:** overselling, incorrect price scope, duplicate refund or misleading availability. **Privacy/security:** role-scoped customer/order details; authorization belongs to the application backend; UI must explain scope and denied actions. **Accessibility:** keyboard variant editing, labeled numeric fields, non-drag media reorder. **Common failures:** storefront cards substituted for an editor, hidden selected-row scope, stock inferred from color, partial bulk failures swallowed.

### Healthcare

**Types/roles:** public service information, patient portal, appointment booking, clinical operations and administrative scheduling; patients, receptionists, clinicians and care coordinators have distinct tasks. **Workflows/terminology:** patient identity → encounter/task review → handoff/result review; appointment, encounter, observation, request, task, care team. [FHIR workflow documentation](https://hl7.org/fhir/workflow.html) separates workflow resources and interactions; it does not prescribe UDI's screens or clinical decisions.

**Priority/screens/components:** identity/context banner, task/appointment queue, encounter timeline, results list with units/source/time, consent-related status. Critical operations need reviewed domain definitions and explicit consequence/context; UDI must not invent alert thresholds or treatment logic. **Risks:** wrong-person actions, missed follow-up, stale results or confusing units. **Privacy/security:** role-appropriate disclosure and session recovery; avoid sensitive content in incidental notifications or screenshots. **Accessibility:** plain language for patients, keyboard efficiency for staff, non-color urgency and readable dense data. **Common failures:** treating a patient portal like a clinical workstation, burying identity in navigation, undifferentiated alert walls, status mistaken for clinical interpretation. Expert review is a prerequisite for a clinical pack.

### Banking and finance

**Types/roles:** public product information, personal account self-service, payment operations, analyst investigation and transaction approval. Roles include account holder, support, payment operator and authorized reviewer. **Workflows/terms:** inspect transaction → compare evidence → approve/reject/return → observe outcome; booked/pending/failed, amount, currency, counterparty, value date, reconciliation and approval revision. The [GOV.UK check-answers pattern](https://design-system.service.gov.uk/patterns/check-answers/) supplies a general review-before-submission reference, not banking authorization policy.

**Priority/screens/components:** account scope, transaction queue, amount/currency, evidence panel, difference/revision view, review action and durable receipt. Critical actions include submitting payment instructions and decisions on consequential changes. **Risks:** wrong account/currency, repeated execution, stale review, unclear finality. **Privacy/security:** mask nonessential identifiers, retain necessary disambiguation, show permissions and session-expiry recovery; actual controls and applicable requirements need project-specific review. **Accessibility:** unambiguous numeric formatting, keyboard review, recoverable timeout, non-color credit/debit indicators. **Common failures:** marketing profile selected for operations, ambiguous negative values, confident success after an unknown result, UI approval presented as proof of backend authorization. No jurisdiction-specific compliance conclusion is implied.

### Real estate

**Types/roles:** public property discovery, agent CRM, tenant portal, lease administration and maintenance operations. Roles include applicant, tenant, agent, property manager and maintenance coordinator. **Workflows/terms:** discover property → inquire/book viewing; administer property/unit → inspect occupancy/lease → resolve maintenance. Property, unit, listing, lease, occupancy and work order should not collapse into one entity. The [RESO Data Dictionary](https://www.reso.org/data-dictionary/) is evidence of standardized industry terminology; copying its full definitions requires a separate rights review.

**Priority/screens/components:** public map/list/detail with media; operational unit/lease table, maintenance queue, appointment schedule and document checklist. Critical operations include publishing location details, changing lease status and recording consequential tenant actions. **Risks:** wrong unit, stale listing availability, exposed tenant documents or address precision. **Privacy/security:** role-scoped identity/documents, appropriate location disclosure. **Accessibility:** map alternatives, useful photo descriptions, keyboard galleries and appointment entry. **Common failures:** map-only discovery, listing cards used for lease operations, ambiguous area/rent units, inaccessible photo-only information. UDI should offer workflow safeguards, not tenancy-law advice.

### Education

**Types/roles:** public institution information, course catalog, student learning portal, teacher gradebook and academic administration. Roles include learner, teacher, guardian and registrar; visibility varies by task. **Workflows/terms:** enroll → access learning → submit → assess → review/publish; course, class, enrollment, assessment, score, missing, excused, unpublished. [OneRoster 1.2](https://www.imsglobal.org/spec/oneroster/v1p2) provides roster/gradebook interoperability context, not a universal grading policy.

**Priority/screens/components:** course/period scope, roster, assessment matrix, submission status, feedback and publication controls. Critical actions include publishing grades, editing enrollment and sharing student records. **Risks:** missing score interpreted as zero, wrong class scope, accidental publication or loss of comments. **Privacy/security:** student/guardian/staff visibility and permission explanations; backend enforces access. **Accessibility:** keyboard cell navigation or accessible form alternative, clear edit/save status, accommodations without visual-only cues, low-bandwidth reading paths. **Common failures:** generic dashboard replacing teaching tasks, color-only performance bands, no distinction between draft and published scores, over-dense matrices without row/column identity. Any grading rules need institution review.

### Sports

**Types/roles:** public club/event information, activity booking, participant portal, competition operations and performance analysis. Roles include participant, coach, organizer, official and spectator. **Workflows/terms:** discover/book/cancel activity versus schedule fixtures, record results, handle postponement and publish standings. Competition, season, round, fixture, venue, provisional result and official result are distinct. [OpenActive opportunity modelling](https://openactive.io/modelling-opportunity-data/) grounds activity/session/location vocabulary, but does not establish competition scoring or tie-break rules.

**Priority/screens/components:** activity finder and agenda; fixture scheduler, live result panel, standings and correction history for operations. Critical actions include official-result publication and consequential schedule changes. **Risks:** wrong fixture/team, stale standings, timezone errors, duplicate booking or unannounced cancellation. **Privacy/security:** participant/minor details separated from public results; organizer permissions and private contact data scoped. **Accessibility:** text alternatives to brackets/live graphics, controlled announcements, non-drag scheduling and readable live updates. **Common failures:** every sport represented by the same analytics dashboard, provisional results displayed as official, color-only team identity, rearranging live rows while an operator acts. Sport-specific scoring requires qualified review.

## First pack and expansion policy

Implement **e-commerce product administration** first: it directly tests the reported admin/domain/component gaps, exercises rich reusable tables/filters/media/editing/feedback, and has workflows that can be modeled with synthetic data. It avoids making clinical or jurisdiction-specific financial correctness a prerequisite. This is a prioritization judgment, not a conclusion that commerce has no privacy or financial risk.

Initial scope: product list, product editor, variant inventory, media metadata, publication review and partial bulk failure. Explicitly defer payment processing, refund execution, tax rules and fulfillment automation. Pack acceptance requires distinguishing storefront and administration under identical industry terms, preserving existing branding, retrieving each workflow's necessary components, and reporting unsupported tasks. Next extend public-information/self-service cases; clinical and banking operations need domain experts and stronger fixtures before broad release.

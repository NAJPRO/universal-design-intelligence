// Original UDI Mission 009 contracts, revised by Mission 011. MIT; citation-only external references.
export const componentRecords: unknown = {
  "version": "1.1.0",
  "components": [
    {
      "schemaVersion": "1.0",
      "revision": 2,
      "id": "CMP-OPERATIONAL-TABLE",
      "name": "Operational Data Table",
      "purpose": "Compare identifiable records and act on an explicitly scoped result set without confusing missing data, permission or selection.",
      "kind": "component",
      "category": "tables-data-visualization",
      "applicability": {
        "applicationTypes": [
          "operations-workspace",
          "scheduling",
          "analytics"
        ],
        "taskTerms": [
          "rows",
          "records",
          "table",
          "compare transactions",
          "review transactions",
          "product-administration"
        ],
        "roleTerms": [
          "operator",
          "administrator",
          "reviewer",
          "teacher",
          "manager"
        ]
      },
      "dependencies": [],
      "incompatibleWith": [],
      "initialState": "ready",
      "provenance": {
        "sourceId": "SRC-UDI-COMPONENTS",
        "sourceName": "UDI original professional component contracts",
        "organization": "UDI contributors",
        "license": "MIT",
        "attribution": "Original UDI Mission 009 contracts revised by Mission 011; no external code, prose or assets reproduced.",
        "references": [
          {
            "name": "WAI APG table and grid distinction",
            "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/"
          },
          {
            "name": "Carbon table task boundaries",
            "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines"
          },
          {
            "name": "PatternFly operational table reference",
            "url": "https://www.patternfly.org/components/table/design-guidelines/"
          },
          {
            "name": "W3C WAI Reflow",
            "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html"
          },
          {
            "name": "MDN scrollbar-width reference",
            "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width"
          }
        ],
        "reviewedBy": [
          "UDI author (automated structural review; no independent expert sign-off)"
        ],
        "reviewStatus": "pending",
        "reviewedAt": "2026-10-30"
      },
      "evidence": [
        {
          "artifact": "UDI independently written Mission 009 contract",
          "url": null,
          "accessedAt": "2026-10-28",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "WAI APG table and grid distinction",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Carbon table task boundaries",
          "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "PatternFly operational table reference",
          "url": "https://www.patternfly.org/components/table/design-guidelines/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Original UDI Mission 011 responsive and scroll revision",
          "url": null,
          "accessedAt": "2026-10-30",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "W3C WAI Reflow",
          "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "MDN scrollbar-width reference",
          "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        }
      ],
      "density": [
        {
          "mode": "comfortable",
          "useWhen": "Mixed input methods, occasional use or unfamiliar terminology.",
          "constraints": [
            "Keep controls independently reachable without overlapping hit areas.",
            "Allow user text sizing and wrapping to determine minimum row or field height."
          ]
        },
        {
          "mode": "compact",
          "useWhen": "Repeated scanning by experienced operators with a measured information need.",
          "constraints": [
            "Reduce surrounding padding before reducing readable text size.",
            "Preserve focus outline clearance, labels and distinct control targets."
          ]
        }
      ],
      "motion": {
        "purpose": "Explain a local state change without interrupting the current task.",
        "trigger": "User initiated disclosure or result replacement.",
        "reduced": "Replace content immediately; keep textual progress and completion feedback.",
        "interruption": "Cancel obsolete transitions; never queue animation behind new input or block retry."
      },
      "accessibility": {
        "naming": "Give the region a task-specific heading and each control a persistent name.",
        "semantics": "Prefer native table, caption and associated headers. Sort uses a button and aria-sort on its header. Checkboxes have record-specific names. A selectable table remains a table; an interactive grid is a separate composite-widget implementation requiring managed arrow-key focus.",
        "checks": [
          {
            "id": "keyboard-path",
            "requirement": "Every task and recovery action can be completed with keyboard input.",
            "method": "keyboard",
            "severity": "critical",
            "passEvidence": "Record the starting focus, complete the task and verify a visible logical destination."
          }
        ]
      },
      "checks": [
        {
          "id": "long-content",
          "requirement": "Long labels, absent values and permission restrictions remain distinguishable.",
          "method": "visual",
          "severity": "high",
          "passEvidence": "Inspect narrow and wide views with synthetic long labels and missing data."
        },
        {
          "id": "recovery-path",
          "requirement": "Failure preserves user intent and exposes an operable next step.",
          "method": "browser",
          "severity": "critical",
          "passEvidence": "Inject failure, retry and confirm identity, entered values and focus remain coherent."
        },
        {
          "id": "page-overflow",
          "requirement": "Failure when ordinary page content produces unintended horizontal overflow; a declared two-dimensional comparison region is evaluated separately.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "At 375, 768 and 1440 CSS px and enlarged text, measure document width and locate the offending node; repair its layout instead of globally clipping overflow."
        },
        {
          "id": "scroll-discovery",
          "requirement": "Review each genuinely overflowing region for a perceptible cue or reachable alternative control, plus keyboard and touch access.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Record axis, task, accessible name, focus path and cue/control; test keyboard scrolling or equivalent navigation and swipe. Hidden scrollbar alone is neither pass nor failure."
        },
        {
          "id": "nested-scroll",
          "requirement": "Review multiple scroll owners; unnecessary same-axis nesting can strand focus, wheel or touch input.",
          "method": "browser",
          "severity": "medium",
          "passEvidence": "Inventory page, collection, filter and dialog scroll owners; justify containment per task and exercise boundaries. Region count alone cannot determine a failure."
        },
        {
          "id": "focus-reflow",
          "requirement": "Failure when a layout change loses the focused record/field, enters a hidden duplicate or changes keyboard task order incoherently.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Resize with a field or row action focused; preserve identity, draft/query and logical order, then complete the task in both Tab directions."
        },
        {
          "id": "priority-action",
          "requirement": "Failure when a declared essential row action cannot be reached without horizontal travel in a narrow viewport.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "At 375 CSS px and scrollLeft zero, locate and operate the frequent permitted action; verify a denied record exposes a reason and no unauthorized action. Repeat at 768 and 1440."
        },
        {
          "id": "truncation-access",
          "requirement": "Failure when critical identity/value is clipped without an operable full-content route.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "Use long names, text enlargement and missing values; demonstrate wrap or keyboard/touch-accessible detail. Title-only hover text does not suffice."
        },
        {
          "id": "comparison-or-summary",
          "requirement": "Review the responsive strategy against the actual task; hidden priority columns and automatic card conversion can impair comparison.",
          "method": "expert",
          "severity": "high",
          "passEvidence": "Declare which values/actions are essential; complete both single-record work and cross-record comparison, recording any extra disclosure cost."
        }
      ],
      "family": "operational-table",
      "useWhen": [
        "Several records share meaningful comparable attributes.",
        "Operators need stable identity, sorting or scoped row and bulk actions."
      ],
      "avoidWhen": [
        "A narrative, product discovery gallery or a single detail view is the main task.",
        "Spreadsheet editing or spatial scheduling requires a dedicated grid or calendar contract."
      ],
      "anatomy": [
        {
          "id": "caption",
          "purpose": "Identify collection and scope.",
          "semanticElement": "caption",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "headers",
          "purpose": "Name attributes and current sort.",
          "semanticElement": "thead with th scope",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "rows",
          "purpose": "Associate stable record identity with values.",
          "semanticElement": "tbody with row headers",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "status",
          "purpose": "Describe count, freshness and missing values.",
          "semanticElement": "text and polite status",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "pagination",
          "purpose": "Navigate the result scope.",
          "semanticElement": "nav with named buttons",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "selection",
          "purpose": "Select explicit row identities.",
          "semanticElement": "checkbox",
          "required": false,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "actions",
          "purpose": "Expose contextual row and bulk outcomes.",
          "semanticElement": "buttons and action group",
          "required": false,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        }
      ],
      "variants": [
        {
          "id": "read-only",
          "useWhen": "Comparison and navigation without selection.",
          "partIds": [
            "caption",
            "headers",
            "rows",
            "status",
            "pagination"
          ],
          "incompatibleWith": [
            "selectable"
          ],
          "guidance": [
            "Use links for navigation and keep sort controls keyboard operable."
          ]
        },
        {
          "id": "selectable",
          "useWhen": "Operators act on one or more authorized records.",
          "partIds": [
            "caption",
            "headers",
            "rows",
            "status",
            "pagination",
            "selection",
            "actions"
          ],
          "incompatibleWith": [
            "read-only"
          ],
          "guidance": [
            "Store selected record IDs rather than row positions.",
            "Header selection affects this page by default; offer a separately confirmed all-matching scope with count and exclusions.",
            "Changing filters clears selection or explicitly asks to retain a named cross-filter scope; never silently broaden it.",
            "Recheck permissions and record revisions at execution; identify unauthorized and failed IDs in partial outcomes."
          ]
        }
      ],
      "states": [
        {
          "id": "ready",
          "meaning": "Current records loaded.",
          "presentation": "Show record identity, labeled status and result count.",
          "announcement": null,
          "availableActions": [
            "load",
            "sort",
            "page",
            "select",
            "act"
          ]
        },
        {
          "id": "loading",
          "meaning": "Initial or replacement query pending.",
          "presentation": "Retain headers and scope; label stale rows if retained.",
          "announcement": "Loading records",
          "availableActions": [
            "resolve",
            "empty",
            "partial",
            "fail"
          ]
        },
        {
          "id": "empty",
          "meaning": "No records in this collection.",
          "presentation": "Explain first use and offer an authorized create action.",
          "announcement": null,
          "availableActions": [
            "load"
          ]
        },
        {
          "id": "partial",
          "meaning": "Only some records or actions completed.",
          "presentation": "Separate successful, failed and unavailable records; avoid a false total.",
          "announcement": "Some records could not be updated",
          "availableActions": [
            "load",
            "retry"
          ]
        },
        {
          "id": "error",
          "meaning": "Result request failed.",
          "presentation": "Keep filters and page intent with a persistent retry message.",
          "announcement": "Records could not be loaded",
          "availableActions": [
            "retry"
          ]
        },
        {
          "id": "permission-limited",
          "meaning": "Action is unavailable for this role.",
          "presentation": "Explain denied capability without exposing restricted values.",
          "announcement": null,
          "availableActions": [
            "dismiss",
            "load"
          ]
        }
      ],
      "transitions": [
        {
          "event": "load",
          "to": "loading",
          "guard": null,
          "focus": "Retain initiating control.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "sort",
          "to": "loading",
          "guard": null,
          "focus": "Retain sort header; announce resulting order.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "page",
          "to": "loading",
          "guard": null,
          "focus": "Keep pagination control; announce page and count.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "select",
          "to": "ready",
          "guard": null,
          "focus": "Retain checkbox; announce selected count and scope.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "act",
          "to": "loading",
          "guard": "Role and revision permit action.",
          "focus": "Keep action control while pending.",
          "failureState": "permission-limited",
          "from": "ready"
        },
        {
          "event": "resolve",
          "to": "ready",
          "guard": null,
          "focus": "Keep focus unless initiating row was removed; then next record or heading.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "empty",
          "to": "empty",
          "guard": null,
          "focus": "Keep query trigger; do not focus a decorative illustration.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "partial",
          "to": "partial",
          "guard": null,
          "focus": "Keep bulk summary available; link failed record IDs.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "fail",
          "to": "error",
          "guard": null,
          "focus": "Keep trigger; announce retry availability.",
          "failureState": "error",
          "from": "loading"
        },
        {
          "event": "retry",
          "to": "loading",
          "guard": null,
          "focus": "Retain retry control.",
          "failureState": null,
          "from": "error"
        },
        {
          "event": "retry",
          "to": "loading",
          "guard": null,
          "focus": "Retry failed IDs only; retain summary focus.",
          "failureState": null,
          "from": "partial"
        },
        {
          "event": "load",
          "to": "loading",
          "guard": null,
          "focus": "Retain refresh control.",
          "failureState": null,
          "from": "partial"
        },
        {
          "event": "load",
          "to": "loading",
          "guard": null,
          "focus": "Retain create or refresh trigger.",
          "failureState": null,
          "from": "empty"
        },
        {
          "event": "dismiss",
          "to": "ready",
          "guard": null,
          "focus": "Return to action trigger.",
          "failureState": null,
          "from": "permission-limited"
        },
        {
          "event": "load",
          "to": "loading",
          "guard": null,
          "focus": "Retain refresh trigger.",
          "failureState": null,
          "from": "permission-limited"
        }
      ],
      "keyboard": [
        {
          "key": "Tab / Shift+Tab",
          "when": "Native table with embedded controls.",
          "result": "Visit links, selection and actions in document order; cells are read through table navigation.",
          "focus": "Visible control focus; no custom arrow interception."
        },
        {
          "key": "Enter / Space",
          "when": "Sort button, row checkbox or action.",
          "result": "Activate the named control and announce changed sort or selection.",
          "focus": "Retain control or nearest surviving row action."
        },
        {
          "key": "Arrow keys / Home / End",
          "when": "Only when a separately implemented and tested interactive grid is explicitly chosen.",
          "result": "Use the complete APG grid focus model; this table pilot does not supply editable-cell behavior.",
          "focus": "A grid manages one tab entry and cell focus; never add role=grid solely because rows contain buttons."
        }
      ],
      "visual": {
        "hierarchy": "Collection identity and current scope precede column headings; record identifier anchors each row before secondary metadata.",
        "alignment": "Align text to reading direction and comparable numbers to the trailing edge; align headers with their cell values.",
        "spacing": "Use the same horizontal inset for caption, toolbar and first content column; separate bulk actions from row controls.",
        "typography": "Use body text for values, a restrained header weight and secondary text for metadata; tabular numerals support comparisons where available.",
        "emphasis": "Reserve strongest emphasis for record identity and the current task action; selection uses an additional labeled marker.",
        "surfaces": "Use subtle row separators for tracking across columns; avoid a separate elevated card around every cell.",
        "proportions": "Give identity and long names flexible width; keep status and numeric columns readable; wrap important names or expose full text accessibly.",
        "discoverability": "Anchor the frequent permitted action near record identity, reachable at horizontal origin on narrow screens; secondary values/actions may use named details/overflow with a permission reason. Native scrollbar auto is the comparison default; additional controls and cues must be verified before considering local concealment.",
        "states": "Show missing as unknown or unavailable rather than zero; status includes words, freshness and units where relevant.",
        "brand": "Reuse existing text, border, status and focus tokens; do not invent an industry palette.",
        "tokenRoles": [
          "text-primary",
          "text-secondary",
          "border-subtle",
          "surface-selected",
          "focus-ring",
          "space-row"
        ]
      },
      "responsive": [
        {
          "condition": "Column comparison is the primary task and readable columns exceed available width, including tablet or enlarged text.",
          "restructure": "Keep a semantic table in one named horizontal scroll region with native scrollbar visibility (auto); preserve row identity and place the frequent authorized action beside the identity or in a persistent, non-overlapping action area without horizontal travel. Do not convert comparison tasks to cards automatically.",
          "preservedInformation": [
            "Record identity and full name access",
            "Critical status, permission and units",
            "Every comparable column and selected scope",
            "Prioritized authorized action without horizontal travel"
          ],
          "focusContinuity": "Retain record IDs, query and sort; reveal focused cells/controls without obscuring them. Restore the same record action after details."
        },
        {
          "condition": "Individual record lookup or editing matters more than simultaneous column comparison on a narrow screen.",
          "restructure": "Use a task-focused row summary with identity, critical status/value and authorized primary action; disclose labeled secondary fields on demand. A summary is not a forced card layout. Keep one active semantic representation and offer comparison when the task still requires it.",
          "preservedInformation": [
            "Stable identity",
            "Critical values and units",
            "Explicit read-only permission reason",
            "All secondary values through a named details control"
          ],
          "focusContinuity": "Details return to the same record; do not duplicate tabbable controls or lose selection on layout changes."
        },
        {
          "condition": "No records are displayed: initial empty, zero matches, loading or error.",
          "restructure": "Keep query, scope and recovery meaningful; do not create an empty horizontal scroll track from a minimum-width header. Hide or constrain the unused table region while preserving loading/status announcements and Clear or Retry.",
          "preservedInformation": [
            "Query and result meaning",
            "Recovery actions and permission context"
          ],
          "focusContinuity": "Keep focus on the initiating query/control, or move deliberately to an announced recovery destination."
        }
      ],
      "recovery": [
        {
          "stateId": "error",
          "explanation": "Retain failed query scope and distinguish stale rows.",
          "action": "retry",
          "preservedData": [
            "active filters",
            "sort",
            "page intent"
          ]
        },
        {
          "stateId": "partial",
          "explanation": "Retry failed actions without repeating successes.",
          "action": "retry",
          "preservedData": [
            "selected IDs",
            "successful IDs",
            "failed IDs and reasons"
          ]
        },
        {
          "stateId": "permission-limited",
          "explanation": "Return to the unchanged collection; authorization is owned by the application.",
          "action": "dismiss",
          "preservedData": [
            "row identity",
            "query state"
          ]
        }
      ],
      "composition": {
        "provides": [
          "Identifiable result rows",
          "Selection by stable ID",
          "Sort and pagination events"
        ],
        "requires": [
          "Application-owned query scope",
          "Application-owned permissions and record revisions"
        ],
        "focusOwner": "Table retains local control focus; workspace coordinates removed rows and detail return."
      },
      "ruleIds": [
        "UDI-DAT-001",
        "UDI-RSP-004",
        "UDI-ACC-002"
      ],
      "antiPatternIds": [
        "UDI-ANTI-004",
        "UDI-ANTI-006"
      ]
    },
    {
      "schemaVersion": "1.0",
      "revision": 2,
      "id": "CMP-FILTER-WORKSPACE",
      "name": "Advanced Filter Workspace",
      "purpose": "Make a collection query explicit, reversible and understandable while distinguishing edited filters from the results currently displayed.",
      "kind": "component",
      "category": "interaction-states",
      "applicability": {
        "applicationTypes": [
          "operations-workspace",
          "scheduling",
          "analytics",
          "storefront",
          "self-service-portal"
        ],
        "taskTerms": [
          "filter",
          "faceted",
          "by stock",
          "by clinic",
          "by account",
          "by course",
          "by property",
          "by round",
          "product-administration"
        ],
        "roleTerms": [
          "operator",
          "administrator",
          "reviewer",
          "teacher",
          "manager",
          "shopper"
        ]
      },
      "dependencies": [],
      "incompatibleWith": [],
      "initialState": "ready",
      "provenance": {
        "sourceId": "SRC-UDI-COMPONENTS",
        "sourceName": "UDI original professional component contracts",
        "organization": "UDI contributors",
        "license": "MIT",
        "attribution": "Original UDI Mission 009 contracts revised by Mission 011; no external code, prose or assets reproduced.",
        "references": [
          {
            "name": "WAI APG table and grid distinction",
            "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/"
          },
          {
            "name": "Carbon table task boundaries",
            "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines"
          },
          {
            "name": "PatternFly operational table reference",
            "url": "https://www.patternfly.org/components/table/design-guidelines/"
          },
          {
            "name": "W3C WAI Reflow",
            "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html"
          },
          {
            "name": "MDN scrollbar-width reference",
            "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width"
          }
        ],
        "reviewedBy": [
          "UDI author (automated structural review; no independent expert sign-off)"
        ],
        "reviewStatus": "pending",
        "reviewedAt": "2026-10-30"
      },
      "evidence": [
        {
          "artifact": "UDI independently written Mission 009 contract",
          "url": null,
          "accessedAt": "2026-10-28",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "WAI APG table and grid distinction",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Carbon table task boundaries",
          "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "PatternFly operational table reference",
          "url": "https://www.patternfly.org/components/table/design-guidelines/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Original UDI Mission 011 responsive and scroll revision",
          "url": null,
          "accessedAt": "2026-10-30",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "W3C WAI Reflow",
          "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "MDN scrollbar-width reference",
          "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        }
      ],
      "density": [
        {
          "mode": "comfortable",
          "useWhen": "Mixed input methods, occasional use or unfamiliar terminology.",
          "constraints": [
            "Keep controls independently reachable without overlapping hit areas.",
            "Allow user text sizing and wrapping to determine minimum row or field height."
          ]
        },
        {
          "mode": "compact",
          "useWhen": "Repeated scanning by experienced operators with a measured information need.",
          "constraints": [
            "Reduce surrounding padding before reducing readable text size.",
            "Preserve focus outline clearance, labels and distinct control targets."
          ]
        }
      ],
      "motion": {
        "purpose": "Explain a local state change without interrupting the current task.",
        "trigger": "User initiated disclosure or result replacement.",
        "reduced": "Replace content immediately; keep textual progress and completion feedback.",
        "interruption": "Cancel obsolete transitions; never queue animation behind new input or block retry."
      },
      "accessibility": {
        "naming": "Give the region a task-specific heading and each control a persistent name.",
        "semantics": "Use a named search region, fieldsets for facets and a polite result status. Announce committed query changes rather than every keystroke. Native controls keep their keyboard model; modal mobile presentation requires a labeled dialog with focus containment and return.",
        "checks": [
          {
            "id": "keyboard-path",
            "requirement": "Every task and recovery action can be completed with keyboard input.",
            "method": "keyboard",
            "severity": "critical",
            "passEvidence": "Record the starting focus, complete the task and verify a visible logical destination."
          }
        ]
      },
      "checks": [
        {
          "id": "long-content",
          "requirement": "Long labels, absent values and permission restrictions remain distinguishable.",
          "method": "visual",
          "severity": "high",
          "passEvidence": "Inspect narrow and wide views with synthetic long labels and missing data."
        },
        {
          "id": "recovery-path",
          "requirement": "Failure preserves user intent and exposes an operable next step.",
          "method": "browser",
          "severity": "critical",
          "passEvidence": "Inject failure, retry and confirm identity, entered values and focus remain coherent."
        },
        {
          "id": "url-state",
          "requirement": "Only shareable, nonsensitive active query values enter URL state when deep linking is appropriate.",
          "method": "static",
          "severity": "high",
          "passEvidence": "Reload/back restores the same active scope; drafts and sensitive free text are excluded by declared policy."
        },
        {
          "id": "page-overflow",
          "requirement": "Failure when ordinary page content produces unintended horizontal overflow; a declared two-dimensional comparison region is evaluated separately.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "At 375, 768 and 1440 CSS px and enlarged text, measure document width and locate the offending node; repair its layout instead of globally clipping overflow."
        },
        {
          "id": "scroll-discovery",
          "requirement": "Review each genuinely overflowing region for a perceptible cue or reachable alternative control, plus keyboard and touch access.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Record axis, task, accessible name, focus path and cue/control; test keyboard scrolling or equivalent navigation and swipe. Hidden scrollbar alone is neither pass nor failure."
        },
        {
          "id": "nested-scroll",
          "requirement": "Review multiple scroll owners; unnecessary same-axis nesting can strand focus, wheel or touch input.",
          "method": "browser",
          "severity": "medium",
          "passEvidence": "Inventory page, collection, filter and dialog scroll owners; justify containment per task and exercise boundaries. Region count alone cannot determine a failure."
        },
        {
          "id": "focus-reflow",
          "requirement": "Failure when a layout change loses the focused record/field, enters a hidden duplicate or changes keyboard task order incoherently.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Resize with a field or row action focused; preserve identity, draft/query and logical order, then complete the task in both Tab directions."
        }
      ],
      "family": "filter-workspace",
      "useWhen": [
        "A collection has several meaningful criteria or operators repeatedly refine a result scope."
      ],
      "avoidWhen": [
        "There is no queryable collection or only one fixed record.",
        "A simple short list can be scanned without filter state or an advanced panel."
      ],
      "anatomy": [
        {
          "id": "scope",
          "purpose": "Name the collection being queried.",
          "semanticElement": "heading",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "search",
          "purpose": "Search record text without confusing it with selected facets.",
          "semanticElement": "labeled search input",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "facets",
          "purpose": "Group independent criteria with named values.",
          "semanticElement": "fieldset and controls",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "active-summary",
          "purpose": "Expose active conditions and reversible removal.",
          "semanticElement": "list with named remove buttons",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "result-status",
          "purpose": "Report current result count and query progress.",
          "semanticElement": "polite status",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "apply-reset",
          "purpose": "Apply draft or clear/reset defined scopes.",
          "semanticElement": "button group",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        }
      ],
      "variants": [
        {
          "id": "immediate",
          "useWhen": "Queries are cheap and incremental changes are predictable.",
          "partIds": [
            "scope",
            "search",
            "facets",
            "active-summary",
            "result-status",
            "apply-reset"
          ],
          "incompatibleWith": [
            "explicit-apply"
          ],
          "guidance": [
            "Apply facet changes immediately; debounce text search without delaying keyboard editing.",
            "Cancel or ignore stale responses using query identity; count always belongs to the displayed active query.",
            "Treat change then apply as one atomic user operation in the shared state model; never display an intermediate unapplied draft in immediate mode."
          ]
        },
        {
          "id": "explicit-apply",
          "useWhen": "Queries are costly, interdependent or require deliberate review.",
          "partIds": [
            "scope",
            "search",
            "facets",
            "active-summary",
            "result-status",
            "apply-reset"
          ],
          "incompatibleWith": [
            "immediate"
          ],
          "guidance": [
            "Keep draft controls distinct from active conditions and show unapplied changes.",
            "Apply commits draft atomically and resets page to the first result; closing the panel retains or discards draft according to an explicit policy.",
            "Reset draft restores the active query without changing results; a separately labeled Clear and apply action explicitly commits the default query."
          ]
        }
      ],
      "states": [
        {
          "id": "ready",
          "meaning": "Active query matches current controls or committed draft.",
          "presentation": "Show active chips, scope and exact or qualified result count.",
          "announcement": null,
          "availableActions": [
            "change",
            "clear",
            "load"
          ]
        },
        {
          "id": "draft",
          "meaning": "Controls differ from the displayed active query.",
          "presentation": "Mark unapplied changes without showing a draft count as current results.",
          "announcement": null,
          "availableActions": [
            "apply",
            "reset"
          ]
        },
        {
          "id": "loading",
          "meaning": "Active query is pending.",
          "presentation": "Keep active query visible and qualify retained stale count.",
          "announcement": "Updating results",
          "availableActions": [
            "resolve",
            "empty",
            "fail"
          ]
        },
        {
          "id": "empty-filtered",
          "meaning": "Active conditions match no results.",
          "presentation": "Retain active conditions and offer clear or remove a criterion.",
          "announcement": "No matching results",
          "availableActions": [
            "clear",
            "change"
          ]
        },
        {
          "id": "error",
          "meaning": "Query could not complete.",
          "presentation": "Keep draft and active values distinct and show retry.",
          "announcement": "Results could not be updated",
          "availableActions": [
            "retry"
          ]
        }
      ],
      "transitions": [
        {
          "event": "change",
          "to": "draft",
          "guard": null,
          "focus": "Keep edited facet focus.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "clear",
          "to": "loading",
          "guard": null,
          "focus": "Keep clear trigger; active query becomes declared defaults.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "load",
          "to": "loading",
          "guard": null,
          "focus": "Retain initiating control.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "apply",
          "to": "loading",
          "guard": null,
          "focus": "Keep apply control; commit draft and reset page.",
          "failureState": null,
          "from": "draft"
        },
        {
          "event": "reset",
          "to": "ready",
          "guard": null,
          "focus": "Keep reset button; restore draft from active query.",
          "failureState": null,
          "from": "draft"
        },
        {
          "event": "resolve",
          "to": "ready",
          "guard": null,
          "focus": "Keep filter focus; politely announce new count.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "empty",
          "to": "empty-filtered",
          "guard": null,
          "focus": "Keep trigger; announce no matches.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "fail",
          "to": "error",
          "guard": null,
          "focus": "Retain filter control; announce persistent retry.",
          "failureState": "error",
          "from": "loading"
        },
        {
          "event": "clear",
          "to": "loading",
          "guard": null,
          "focus": "Retain clear control or nearest summary heading after removal.",
          "failureState": null,
          "from": "empty-filtered"
        },
        {
          "event": "change",
          "to": "draft",
          "guard": null,
          "focus": "Retain changed facet.",
          "failureState": null,
          "from": "empty-filtered"
        },
        {
          "event": "retry",
          "to": "loading",
          "guard": null,
          "focus": "Keep retry focus.",
          "failureState": null,
          "from": "error"
        }
      ],
      "keyboard": [
        {
          "key": "Tab / Shift+Tab",
          "when": "Filter controls and active condition removals.",
          "result": "Follow visible label and group order; removal buttons name the condition.",
          "focus": "On removal, use next chip or active-summary heading."
        },
        {
          "key": "Enter",
          "when": "Text search in explicit-apply mode.",
          "result": "Submit the draft query without submitting an unrelated edit form.",
          "focus": "Keep search focus and announce results."
        },
        {
          "key": "Escape",
          "when": "Mobile modal filter panel.",
          "result": "Close the panel with its declared draft policy.",
          "focus": "Return to the filter trigger; a nonmodal panel must not trap focus."
        }
      ],
      "visual": {
        "hierarchy": "Scope and text search lead; frequent facets precede advanced criteria; active conditions remain visible beside result count.",
        "alignment": "Align search and facet labels to a shared grid and align active summary with the result collection.",
        "spacing": "Keep label-control spacing smaller than the gap between facet groups; separate reset from the primary apply action.",
        "typography": "Use a clear section label and normal control labels; render active values with enough weight to distinguish them from hints.",
        "emphasis": "Highlight Apply only for unapplied draft changes; active count is supporting information, not a competing headline.",
        "surfaces": "Use a single coherent filter region; chips mark conditions rather than decorative tags around all metadata.",
        "proportions": "Size controls for plausible long option names; let multi-select summaries wrap before truncating selected meaning.",
        "discoverability": "Show active filter count when collapsed and keep Clear all available without reopening every facet.",
        "states": "Distinguish stale results, pending requests, draft changes and zero matches using explicit labels.",
        "brand": "Reuse the product control, spacing and selected-state tokens; preserve focus and status contrast when adapting brand.",
        "tokenRoles": [
          "space-group",
          "text-label",
          "surface-control",
          "border-control",
          "focus-ring"
        ]
      },
      "responsive": [
        {
          "condition": "Facets crowd search/results at narrow or tablet widths, or selected values are long.",
          "restructure": "Move advanced facets into a named disclosure or one focus-managed sheet. Keep query, result meaning, active conditions and Clear reachable; prefer wrapping chips. Horizontal chip scrolling is conditional: show an edge cue or previous/next controls, reveal focused removals and never silently clip selected scope.",
          "preservedInformation": [
            "Active query and applied conditions",
            "Unapplied draft meaning when applicable",
            "Result count and reset scope"
          ],
          "focusContinuity": "Closing returns to the trigger; removing a chip moves focus to the next relevant chip or Clear/search. Result updates do not steal typing focus."
        },
        {
          "condition": "A filter sheet is shorter than its fields, especially with an on-screen keyboard.",
          "restructure": "Use one vertical body scroll owner, with Apply/reset reachable by scrolling or non-obscuring actions. Avoid an independently scrolling chip rail nested inside the sheet when wrapping suffices. Scrollbar auto is default; conceal only with equivalent discoverable operation.",
          "preservedInformation": [
            "Draft values and active query distinction",
            "All filter options and labels",
            "Apply/clear actions"
          ],
          "focusContinuity": "Bring focused options into the usable viewport and return to the same trigger; preserve drafts on resize according to the declared policy."
        }
      ],
      "recovery": [
        {
          "stateId": "error",
          "explanation": "Retry the active query without discarding draft.",
          "action": "retry",
          "preservedData": [
            "draft query",
            "active query",
            "URL-safe scope"
          ]
        },
        {
          "stateId": "empty-filtered",
          "explanation": "Offer the default query or removal of one condition.",
          "action": "clear",
          "preservedData": [
            "search text until explicitly cleared",
            "previous query history"
          ]
        }
      ],
      "composition": {
        "provides": [
          "Draft and active query events",
          "Active-condition summary",
          "Query identity"
        ],
        "requires": [
          "Collection query owner",
          "URL serialization policy excluding sensitive values"
        ],
        "focusOwner": "Filter control owns editing focus; workspace owns result replacement and mobile overlay lifecycle."
      },
      "ruleIds": [
        "UDI-INT-001",
        "UDI-ACC-002"
      ],
      "antiPatternIds": [
        "UDI-ANTI-004"
      ]
    },
    {
      "schemaVersion": "1.0",
      "revision": 2,
      "id": "CMP-RECOVERABLE-FORM",
      "name": "Recoverable Form",
      "purpose": "Collect or edit meaningful input with clear grouping, honest save state and a recovery route that retains valid user work.",
      "kind": "component",
      "category": "forms",
      "applicability": {
        "applicationTypes": [
          "operations-workspace",
          "scheduling",
          "authoring",
          "self-service-portal",
          "marketing",
          "public-information",
          "storefront"
        ],
        "taskTerms": [
          "edit",
          "reschedule",
          "record review decision",
          "correct",
          "write",
          "save",
          "contact form",
          "product-administration"
        ],
        "roleTerms": [
          "operator",
          "administrator",
          "reviewer",
          "teacher",
          "author",
          "customer"
        ]
      },
      "dependencies": [],
      "incompatibleWith": [],
      "initialState": "ready",
      "provenance": {
        "sourceId": "SRC-UDI-COMPONENTS",
        "sourceName": "UDI original professional component contracts",
        "organization": "UDI contributors",
        "license": "MIT",
        "attribution": "Original UDI Mission 009 contracts revised by Mission 011; no external code, prose or assets reproduced.",
        "references": [
          {
            "name": "WAI APG table and grid distinction",
            "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/"
          },
          {
            "name": "Carbon table task boundaries",
            "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines"
          },
          {
            "name": "PatternFly operational table reference",
            "url": "https://www.patternfly.org/components/table/design-guidelines/"
          },
          {
            "name": "W3C WAI Reflow",
            "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html"
          },
          {
            "name": "MDN scrollbar-width reference",
            "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width"
          }
        ],
        "reviewedBy": [
          "UDI author (automated structural review; no independent expert sign-off)"
        ],
        "reviewStatus": "pending",
        "reviewedAt": "2026-10-30"
      },
      "evidence": [
        {
          "artifact": "UDI independently written Mission 009 contract",
          "url": null,
          "accessedAt": "2026-10-28",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "WAI APG table and grid distinction",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Carbon table task boundaries",
          "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "PatternFly operational table reference",
          "url": "https://www.patternfly.org/components/table/design-guidelines/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Original UDI Mission 011 responsive and scroll revision",
          "url": null,
          "accessedAt": "2026-10-30",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "W3C WAI Reflow",
          "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "MDN scrollbar-width reference",
          "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        }
      ],
      "density": [
        {
          "mode": "comfortable",
          "useWhen": "Mixed input methods, occasional use or unfamiliar terminology.",
          "constraints": [
            "Keep controls independently reachable without overlapping hit areas.",
            "Allow user text sizing and wrapping to determine minimum row or field height."
          ]
        },
        {
          "mode": "compact",
          "useWhen": "Repeated scanning by experienced operators with a measured information need.",
          "constraints": [
            "Reduce surrounding padding before reducing readable text size.",
            "Preserve focus outline clearance, labels and distinct control targets."
          ]
        }
      ],
      "motion": {
        "purpose": "Explain a local state change without interrupting the current task.",
        "trigger": "User initiated disclosure or result replacement.",
        "reduced": "Replace content immediately; keep textual progress and completion feedback.",
        "interruption": "Cancel obsolete transitions; never queue animation behind new input or block retry."
      },
      "accessibility": {
        "naming": "Give the region a task-specific heading and each control a persistent name.",
        "semantics": "Use form, fieldset, legend and associated visible labels. Required state is programmatically exposed; hints and errors reference controls, invalid state follows validation. A failed submit exposes a focusable linked summary; server-level failures remain persistent and announced without clearing inputs.",
        "checks": [
          {
            "id": "keyboard-path",
            "requirement": "Every task and recovery action can be completed with keyboard input.",
            "method": "keyboard",
            "severity": "critical",
            "passEvidence": "Record the starting focus, complete the task and verify a visible logical destination."
          }
        ]
      },
      "checks": [
        {
          "id": "long-content",
          "requirement": "Long labels, absent values and permission restrictions remain distinguishable.",
          "method": "visual",
          "severity": "high",
          "passEvidence": "Inspect narrow and wide views with synthetic long labels and missing data."
        },
        {
          "id": "recovery-path",
          "requirement": "Failure preserves user intent and exposes an operable next step.",
          "method": "browser",
          "severity": "critical",
          "passEvidence": "Inject failure, retry and confirm identity, entered values and focus remain coherent."
        },
        {
          "id": "page-overflow",
          "requirement": "Failure when ordinary page content produces unintended horizontal overflow; a declared two-dimensional comparison region is evaluated separately.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "At 375, 768 and 1440 CSS px and enlarged text, measure document width and locate the offending node; repair its layout instead of globally clipping overflow."
        },
        {
          "id": "scroll-discovery",
          "requirement": "Review each genuinely overflowing region for a perceptible cue or reachable alternative control, plus keyboard and touch access.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Record axis, task, accessible name, focus path and cue/control; test keyboard scrolling or equivalent navigation and swipe. Hidden scrollbar alone is neither pass nor failure."
        },
        {
          "id": "nested-scroll",
          "requirement": "Review multiple scroll owners; unnecessary same-axis nesting can strand focus, wheel or touch input.",
          "method": "browser",
          "severity": "medium",
          "passEvidence": "Inventory page, collection, filter and dialog scroll owners; justify containment per task and exercise boundaries. Region count alone cannot determine a failure."
        },
        {
          "id": "focus-reflow",
          "requirement": "Failure when a layout change loses the focused record/field, enters a hidden duplicate or changes keyboard task order incoherently.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Resize with a field or row action focused; preserve identity, draft/query and logical order, then complete the task in both Tab directions."
        },
        {
          "id": "short-dialog",
          "requirement": "Failure when Save/Cancel or a focused correction cannot be brought into the usable dialog viewport.",
          "method": "browser",
          "severity": "critical",
          "passEvidence": "At 375 by 500 CSS px, then simulated reduced visual viewport, reach inputs/errors and Save/Cancel by keyboard and scroll; check occlusion by footer, preserve draft on resize and restore page position on exit."
        }
      ],
      "family": "recoverable-form",
      "useWhen": [
        "A user creates, edits or submits a meaningful record.",
        "Errors, server rejection or interrupted saving must be recoverable."
      ],
      "avoidWhen": [
        "Content is read-only or the task only changes a collection query.",
        "A binary immediate toggle needs no extended data-entry workflow."
      ],
      "anatomy": [
        {
          "id": "heading",
          "purpose": "Identify task and record.",
          "semanticElement": "heading",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "groups",
          "purpose": "Order related input by task.",
          "semanticElement": "fieldset and legend",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "fields",
          "purpose": "Associate labels, hints and validity.",
          "semanticElement": "label and native input",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "feedback",
          "purpose": "Link summary and inline errors.",
          "semanticElement": "error summary and described text",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "actions",
          "purpose": "Expose save and cancel outcome.",
          "semanticElement": "button group",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        },
        {
          "id": "save-status",
          "purpose": "Distinguish unsaved, pending and confirmed success.",
          "semanticElement": "polite status",
          "required": true,
          "tokenRoles": [
            "text-primary",
            "space-control"
          ]
        }
      ],
      "variants": [
        {
          "id": "single-page",
          "useWhen": "A small or medium task can be completed in one coherent page.",
          "partIds": [
            "heading",
            "groups",
            "fields",
            "feedback",
            "actions",
            "save-status"
          ],
          "incompatibleWith": [
            "sectioned"
          ],
          "guidance": [
            "Order identity and required decisions before optional detail; indicate optional and required fields consistently."
          ]
        },
        {
          "id": "sectioned",
          "useWhen": "Long entry benefits from task sections and progressive disclosure.",
          "partIds": [
            "heading",
            "groups",
            "fields",
            "feedback",
            "actions",
            "save-status"
          ],
          "incompatibleWith": [
            "single-page"
          ],
          "guidance": [
            "Keep progress and save scope explicit; reveal the containing section before focusing a hidden invalid field.",
            "Preserve values in collapsed or previous sections and show unresolved errors in the summary."
          ]
        }
      ],
      "states": [
        {
          "id": "ready",
          "meaning": "Loaded input is unchanged.",
          "presentation": "Show record identity, editable scope and required/optional convention.",
          "announcement": null,
          "availableActions": [
            "change"
          ]
        },
        {
          "id": "dirty",
          "meaning": "Input differs from confirmed saved state.",
          "presentation": "Show unsaved status without repeated announcements.",
          "announcement": null,
          "availableActions": [
            "submit",
            "leave",
            "change"
          ]
        },
        {
          "id": "pending",
          "meaning": "Submission is awaiting acknowledgement.",
          "presentation": "Label saving, prevent duplicate requests and keep entered values visible.",
          "announcement": "Saving",
          "availableActions": [
            "success",
            "invalid",
            "fail"
          ]
        },
        {
          "id": "invalid",
          "meaning": "Client or server rejected one or more values.",
          "presentation": "Persistent summary links and field-specific correction text.",
          "announcement": "Please correct the identified fields",
          "availableActions": [
            "change",
            "submit"
          ]
        },
        {
          "id": "failure",
          "meaning": "Save failed or result is unknown.",
          "presentation": "Show persistent retry or verify-outcome action; never claim success.",
          "announcement": "Save was not confirmed",
          "availableActions": [
            "retry",
            "change"
          ]
        },
        {
          "id": "success",
          "meaning": "Server confirmed the saved revision.",
          "presentation": "Confirm outcome with record identity and saved status.",
          "announcement": "Changes saved",
          "availableActions": [
            "change"
          ]
        },
        {
          "id": "leave-confirmation",
          "meaning": "Navigation would discard unsaved work.",
          "presentation": "Offer stay, save where possible and explicit discard.",
          "announcement": null,
          "availableActions": [
            "stay",
            "discard"
          ]
        }
      ],
      "transitions": [
        {
          "event": "change",
          "to": "dirty",
          "guard": null,
          "focus": "Keep edited input.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "change",
          "to": "dirty",
          "guard": null,
          "focus": "Keep edited input.",
          "failureState": null,
          "from": "dirty"
        },
        {
          "event": "submit",
          "to": "pending",
          "guard": "Local validation passes; otherwise use invalid state.",
          "focus": "Retain submit control while pending.",
          "failureState": "invalid",
          "from": "dirty"
        },
        {
          "event": "leave",
          "to": "leave-confirmation",
          "guard": null,
          "focus": "Focus the safe Stay choice in the named confirmation.",
          "failureState": null,
          "from": "dirty"
        },
        {
          "event": "success",
          "to": "success",
          "guard": null,
          "focus": "Retain save focus or move to next task only for explicit navigation intent.",
          "failureState": null,
          "from": "pending"
        },
        {
          "event": "invalid",
          "to": "invalid",
          "guard": null,
          "focus": "Focus summary on submitted multi-field failure; links reveal and focus invalid controls.",
          "failureState": "invalid",
          "from": "pending"
        },
        {
          "event": "fail",
          "to": "failure",
          "guard": null,
          "focus": "Keep submit focus; expose persistent recovery.",
          "failureState": "failure",
          "from": "pending"
        },
        {
          "event": "change",
          "to": "dirty",
          "guard": null,
          "focus": "Keep the corrected control; remove obsolete error after revalidation.",
          "failureState": null,
          "from": "invalid"
        },
        {
          "event": "submit",
          "to": "pending",
          "guard": null,
          "focus": "Keep submit focus after corrected validation.",
          "failureState": null,
          "from": "invalid"
        },
        {
          "event": "retry",
          "to": "pending",
          "guard": "Verify unknown outcome or use an application-owned idempotency policy before retry.",
          "focus": "Keep retry control.",
          "failureState": null,
          "from": "failure"
        },
        {
          "event": "change",
          "to": "dirty",
          "guard": null,
          "focus": "Keep edited value and server revision.",
          "failureState": null,
          "from": "failure"
        },
        {
          "event": "change",
          "to": "dirty",
          "guard": null,
          "focus": "Keep edited field.",
          "failureState": null,
          "from": "success"
        },
        {
          "event": "stay",
          "to": "dirty",
          "guard": null,
          "focus": "Return to initiating field or navigation trigger.",
          "failureState": null,
          "from": "leave-confirmation"
        },
        {
          "event": "discard",
          "to": "ready",
          "guard": null,
          "focus": "Navigate only after explicit discard; destination owns focus.",
          "failureState": null,
          "from": "leave-confirmation"
        }
      ],
      "keyboard": [
        {
          "key": "Tab / Shift+Tab",
          "when": "Entry and section disclosure.",
          "result": "Follow task order with persistent visible focus; no layout-only positive tabindex.",
          "focus": "Each labeled control or disclosure button."
        },
        {
          "key": "Enter",
          "when": "Submit intent outside multiline text or specialized controls.",
          "result": "Validate current values without bypassing server checks.",
          "focus": "Summary after failed submission; otherwise retain submit."
        },
        {
          "key": "Enter / Space",
          "when": "An error-summary link or section disclosure.",
          "result": "Reveal the relevant section and focus the exact invalid field.",
          "focus": "Named invalid control; preserve values in all other fields."
        },
        {
          "key": "Escape",
          "when": "Unsaved-change confirmation.",
          "result": "Choose Stay when dismissal is allowed.",
          "focus": "Return to the originating control; do not silently discard."
        }
      ],
      "visual": {
        "hierarchy": "Task and entity identity lead; group headings organize decisions; labels stay closer to controls than adjacent groups.",
        "alignment": "Use a shared label and input axis; align action group with form content rather than the outer viewport.",
        "spacing": "Keep hint and error adjacent to their input, with larger space between task groups; reserve error space only when it avoids disruptive jumps.",
        "typography": "Body-size inputs and labels remain readable; hints and optional markers use a quieter but legible supporting role.",
        "emphasis": "Save is the strongest task action; cancel and destructive actions have distinct subordinate placement.",
        "surfaces": "Use section whitespace or restrained dividers; avoid boxing each field into a competing surface.",
        "proportions": "Choose input widths by expected value and allow long labels to wrap; avoid a full-width short numeric field suggesting long content.",
        "discoverability": "Keep submit outcome and save scope visible; reveal advanced inputs with a named disclosure rather than hidden gesture.",
        "states": "Show invalidity with correction text and an additional visual marker; distinguish unsaved, saving, unknown outcome and confirmed saved.",
        "brand": "Use existing field, error and action tokens; brand adaptation must preserve error readability and focus visibility.",
        "tokenRoles": [
          "space-field",
          "space-section",
          "text-label",
          "text-error",
          "border-invalid",
          "focus-ring"
        ]
      },
      "responsive": [
        {
          "condition": "Fields or actions no longer fit readable columns, including narrow, tablet, enlarged text or short usable viewport.",
          "restructure": "Stack related fields in reading order. For an overlay, give its body one vertical scroll owner constrained by the usable viewport; keep Save/Cancel reachable without clipping and reveal focused inputs/errors above any sticky actions. Use native scrollbar auto by default, not global overflow locking.",
          "preservedInformation": [
            "Identity, labels and entered values",
            "Validation/server errors and unsaved status",
            "Save scope, permissions and revision"
          ],
          "focusContinuity": "Retain the same field across resize. Error links reveal the containing section and scroll the target clear of fixed chrome; close returns to the invoker."
        },
        {
          "condition": "The page or another overlay already owns scrolling.",
          "restructure": "Choose page editing or one modal focus owner deliberately; avoid simultaneously scrolling form, dialog and page for the same task. A temporary modal background lock must be scoped, preserve page position and restore scrolling on every exit.",
          "preservedInformation": [
            "Dirty data and recoverable outcome",
            "Reachable submit, cancel and close"
          ],
          "focusContinuity": "Test Tab and Shift+Tab, Escape and error focus in a short viewport; do not treat a transient BODY stop alone as proof of background control access."
        }
      ],
      "recovery": [
        {
          "stateId": "invalid",
          "explanation": "Map server field keys to visible input errors; retain unknown/global errors in summary.",
          "action": "submit",
          "preservedData": [
            "valid input",
            "invalid input for correction",
            "server field error map"
          ]
        },
        {
          "stateId": "failure",
          "explanation": "Preserve input; distinguish known rejection from unknown completion and verify outcome before repeating consequential work.",
          "action": "retry",
          "preservedData": [
            "entered values",
            "record ID",
            "server revision",
            "request identity"
          ]
        }
      ],
      "composition": {
        "provides": [
          "Dirty and saved revision events",
          "Field and summary validation",
          "Confirmed save outcome"
        ],
        "requires": [
          "Application-owned validation and permissions",
          "Safe retry and unsaved-navigation policy"
        ],
        "focusOwner": "Form owns validation focus; workspace coordinates detail dismissal and return to record."
      },
      "ruleIds": [
        "UDI-FOR-001",
        "UDI-FOR-002",
        "UDI-FOR-004"
      ],
      "antiPatternIds": [
        "UDI-ANTI-001",
        "UDI-ANTI-002"
      ]
    }
  ],
  "compositions": [
    {
      "schemaVersion": "1.0",
      "revision": 2,
      "id": "COM-OPERATIONAL-MANAGEMENT",
      "name": "Operational Management Workspace",
      "purpose": "Coordinate a scoped record collection, filters and authorized actions around repeated operational work, with an optional recoverable detail editor.",
      "kind": "composition",
      "category": "interaction-states",
      "applicability": {
        "applicationTypes": [
          "operations-workspace",
          "scheduling"
        ],
        "taskTerms": [
          "manage",
          "review",
          "administration",
          "operations"
        ],
        "roleTerms": [
          "operator",
          "administrator",
          "reviewer",
          "teacher",
          "manager"
        ]
      },
      "dependencies": [
        "CMP-OPERATIONAL-TABLE",
        "CMP-FILTER-WORKSPACE"
      ],
      "incompatibleWith": [],
      "initialState": "ready",
      "provenance": {
        "sourceId": "SRC-UDI-COMPONENTS",
        "sourceName": "UDI original professional component contracts",
        "organization": "UDI contributors",
        "license": "MIT",
        "attribution": "Original UDI Mission 009 contracts revised by Mission 011; no external code, prose or assets reproduced.",
        "references": [
          {
            "name": "WAI APG table and grid distinction",
            "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/"
          },
          {
            "name": "Carbon table task boundaries",
            "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines"
          },
          {
            "name": "PatternFly operational table reference",
            "url": "https://www.patternfly.org/components/table/design-guidelines/"
          },
          {
            "name": "W3C WAI Reflow",
            "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html"
          },
          {
            "name": "MDN scrollbar-width reference",
            "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width"
          }
        ],
        "reviewedBy": [
          "UDI author (automated structural review; no independent expert sign-off)"
        ],
        "reviewStatus": "pending",
        "reviewedAt": "2026-10-30"
      },
      "evidence": [
        {
          "artifact": "UDI independently written Mission 009 contract",
          "url": null,
          "accessedAt": "2026-10-28",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "WAI APG table and grid distinction",
          "url": "https://www.w3.org/WAI/ARIA/apg/patterns/table/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Carbon table task boundaries",
          "url": "https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "PatternFly operational table reference",
          "url": "https://www.patternfly.org/components/table/design-guidelines/",
          "accessedAt": "2026-10-28",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "Original UDI Mission 011 responsive and scroll revision",
          "url": null,
          "accessedAt": "2026-10-30",
          "relationship": "original",
          "licenseStatus": "verified",
          "licenseExpression": "MIT"
        },
        {
          "artifact": "W3C WAI Reflow",
          "url": "https://www.w3.org/WAI/WCAG22/Understanding/reflow.html",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        },
        {
          "artifact": "MDN scrollbar-width reference",
          "url": "https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/scrollbar-width",
          "accessedAt": "2026-10-30",
          "relationship": "supports",
          "licenseStatus": "reference-only",
          "licenseExpression": null
        }
      ],
      "density": [
        {
          "mode": "comfortable",
          "useWhen": "Mixed input methods, occasional use or unfamiliar terminology.",
          "constraints": [
            "Keep controls independently reachable without overlapping hit areas.",
            "Allow user text sizing and wrapping to determine minimum row or field height."
          ]
        },
        {
          "mode": "compact",
          "useWhen": "Repeated scanning by experienced operators with a measured information need.",
          "constraints": [
            "Reduce surrounding padding before reducing readable text size.",
            "Preserve focus outline clearance, labels and distinct control targets."
          ]
        }
      ],
      "motion": {
        "purpose": "Explain a local state change without interrupting the current task.",
        "trigger": "User initiated disclosure or result replacement.",
        "reduced": "Replace content immediately; keep textual progress and completion feedback.",
        "interruption": "Cancel obsolete transitions; never queue animation behind new input or block retry."
      },
      "accessibility": {
        "naming": "Give the region a task-specific heading and each control a persistent name.",
        "semantics": "Prefer native HTML structure; name status and recovery relationships.",
        "checks": [
          {
            "id": "keyboard-path",
            "requirement": "Every task and recovery action can be completed with keyboard input.",
            "method": "keyboard",
            "severity": "critical",
            "passEvidence": "Record the starting focus, complete the task and verify a visible logical destination."
          }
        ]
      },
      "checks": [
        {
          "id": "long-content",
          "requirement": "Long labels, absent values and permission restrictions remain distinguishable.",
          "method": "visual",
          "severity": "high",
          "passEvidence": "Inspect narrow and wide views with synthetic long labels and missing data."
        },
        {
          "id": "recovery-path",
          "requirement": "Failure preserves user intent and exposes an operable next step.",
          "method": "browser",
          "severity": "critical",
          "passEvidence": "Inject failure, retry and confirm identity, entered values and focus remain coherent."
        },
        {
          "id": "page-overflow",
          "requirement": "Failure when ordinary page content produces unintended horizontal overflow; a declared two-dimensional comparison region is evaluated separately.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "At 375, 768 and 1440 CSS px and enlarged text, measure document width and locate the offending node; repair its layout instead of globally clipping overflow."
        },
        {
          "id": "scroll-discovery",
          "requirement": "Review each genuinely overflowing region for a perceptible cue or reachable alternative control, plus keyboard and touch access.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Record axis, task, accessible name, focus path and cue/control; test keyboard scrolling or equivalent navigation and swipe. Hidden scrollbar alone is neither pass nor failure."
        },
        {
          "id": "nested-scroll",
          "requirement": "Review multiple scroll owners; unnecessary same-axis nesting can strand focus, wheel or touch input.",
          "method": "browser",
          "severity": "medium",
          "passEvidence": "Inventory page, collection, filter and dialog scroll owners; justify containment per task and exercise boundaries. Region count alone cannot determine a failure."
        },
        {
          "id": "focus-reflow",
          "requirement": "Failure when a layout change loses the focused record/field, enters a hidden duplicate or changes keyboard task order incoherently.",
          "method": "keyboard",
          "severity": "high",
          "passEvidence": "Resize with a field or row action focused; preserve identity, draft/query and logical order, then complete the task in both Tab directions."
        },
        {
          "id": "task-action-access",
          "requirement": "Failure when the declared essential action or state-recovery control is clipped or requires traversing unrelated horizontal columns.",
          "method": "browser",
          "severity": "high",
          "passEvidence": "Complete the declared primary task at 375/768/1440 and 375 by 500; verify permissions, no accidental page overflow, stable focus and accessible filters in populated/empty/error/edit states."
        }
      ],
      "useWhen": [
        "Repeated record comparison, query refinement and operational action are all evidenced."
      ],
      "avoidWhen": [
        "A generic dashboard overview, public story, shopping gallery or single-record form is the primary task."
      ],
      "slots": [
        {
          "id": "filters",
          "entityId": "CMP-FILTER-WORKSPACE",
          "variantId": "explicit-apply",
          "required": true,
          "priority": 2
        },
        {
          "id": "results",
          "entityId": "CMP-OPERATIONAL-TABLE",
          "variantId": "selectable",
          "required": true,
          "priority": 1
        },
        {
          "id": "editor",
          "entityId": "CMP-RECOVERABLE-FORM",
          "variantId": "sectioned",
          "required": false,
          "priority": 3
        }
      ],
      "relationships": [
        {
          "to": "results",
          "type": "filters",
          "sharedState": [
            "active-query",
            "page",
            "selection"
          ],
          "from": "filters"
        },
        {
          "to": "results",
          "type": "edits",
          "sharedState": [
            "revision",
            "return-record"
          ],
          "from": "editor"
        }
      ],
      "sharedState": [
        {
          "id": "active-query",
          "owner": "workspace",
          "resetWhen": "Commit filter draft; URL contains only approved shareable state."
        },
        {
          "id": "page",
          "owner": "workspace",
          "resetWhen": "Reset to first page when active query changes."
        },
        {
          "id": "selection",
          "owner": "workspace",
          "resetWhen": "Filter commit clears selection or prompts for explicit scope retention."
        },
        {
          "id": "revision",
          "owner": "workspace",
          "resetWhen": "Confirmed save invalidates the matching collection revision; preserve dirty draft during conflicts."
        },
        {
          "id": "return-record",
          "owner": "workspace",
          "resetWhen": "Detail closes; restore record focus or nearest surviving row."
        }
      ],
      "actionPriority": [
        "Current record identity and collection task precede secondary metrics.",
        "Keep the frequent collection action visible; bulk actions only apply to a labeled selected scope.",
        "Permission checks and consequential confirmation belong to the application; unavailable actions explain why."
      ],
      "extensionPoints": [
        "Supply domain-specific identifiers, units and status vocabulary without changing native semantics.",
        "Declare role permissions, data freshness, conflict policy and consequential action confirmation.",
        "Scheduling collision detection, regulated approvals, media management and editable grids need separate specifications."
      ],
      "domainDefaults": [
        "Assume no healthcare, financial, education or competition policy expertise.",
        "Use labeled generic records and application-owned permissions until explicit domain evidence is supplied."
      ],
      "layoutModes": [
        {
          "condition": "Wide collection and detail both remain readable.",
          "orderedSlots": [
            "filters",
            "results",
            "editor"
          ],
          "restructuring": "Use aligned query and results; optional detail is subordinate to the selected record."
        },
        {
          "condition": "Narrow screen or enlarged text.",
          "orderedSlots": [
            "filters",
            "results",
            "editor"
          ],
          "restructuring": "Prioritize query/scope, then record identity/status and frequent action at horizontal origin. Choose table scrolling for comparison or summary/details for individual work; move editor to one focus-managed surface or route, preserve query/draft and avoid redundant scrollbars in empty states."
        }
      ],
      "states": [
        {
          "id": "ready",
          "meaning": "Current result scope is available.",
          "presentation": "Show collection identity, active conditions and priority action.",
          "announcement": null,
          "availableActions": [
            "query",
            "open"
          ]
        },
        {
          "id": "loading",
          "meaning": "Query or refresh pending.",
          "presentation": "Retain scope and mark stale results.",
          "announcement": "Updating workspace",
          "availableActions": [
            "resolve",
            "empty",
            "fail"
          ]
        },
        {
          "id": "empty",
          "meaning": "No results for the active scope.",
          "presentation": "Distinguish first use and zero matches; expose create or reset accordingly.",
          "announcement": null,
          "availableActions": [
            "query"
          ]
        },
        {
          "id": "error",
          "meaning": "Collection refresh failed.",
          "presentation": "Keep active filters, selection identity and optional dirty draft.",
          "announcement": "Workspace could not refresh",
          "availableActions": [
            "retry"
          ]
        },
        {
          "id": "editing",
          "meaning": "Detail editor has task focus.",
          "presentation": "Show selected identity and saved/dirty state.",
          "announcement": null,
          "availableActions": [
            "save",
            "close"
          ]
        }
      ],
      "transitions": [
        {
          "event": "query",
          "to": "loading",
          "guard": null,
          "focus": "Retain filter trigger; clear or confirm selection scope.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "open",
          "to": "editing",
          "guard": null,
          "focus": "Move to detail task heading or first meaningful field.",
          "failureState": null,
          "from": "ready"
        },
        {
          "event": "resolve",
          "to": "ready",
          "guard": null,
          "focus": "Keep initiating control; announce count.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "empty",
          "to": "empty",
          "guard": null,
          "focus": "Retain trigger; expose recovery.",
          "failureState": null,
          "from": "loading"
        },
        {
          "event": "fail",
          "to": "error",
          "guard": null,
          "focus": "Retain query control and announce retry.",
          "failureState": "error",
          "from": "loading"
        },
        {
          "event": "query",
          "to": "loading",
          "guard": null,
          "focus": "Keep clear or create trigger.",
          "failureState": null,
          "from": "empty"
        },
        {
          "event": "retry",
          "to": "loading",
          "guard": null,
          "focus": "Keep retry trigger.",
          "failureState": null,
          "from": "error"
        },
        {
          "event": "save",
          "to": "loading",
          "guard": "Form reports a confirmed saved revision; failed save remains in form.",
          "focus": "Keep detail save control while refreshing affected records.",
          "failureState": null,
          "from": "editing"
        },
        {
          "event": "close",
          "to": "ready",
          "guard": "Unsaved-change policy has allowed closing.",
          "focus": "Restore selected record action or next surviving row.",
          "failureState": null,
          "from": "editing"
        }
      ],
      "keyboard": [
        {
          "key": "Tab / Shift+Tab",
          "when": "Query, results and detail.",
          "result": "Follow the task hierarchy; no competing focus traps.",
          "focus": "Local component owns focus; workspace handles explicit detail entry/return."
        },
        {
          "key": "Escape",
          "when": "Dismissible detail or filter overlay.",
          "result": "Apply the local dirty/draft policy before closing.",
          "focus": "Return to the exact record or filter trigger."
        }
      ],
      "visual": {
        "hierarchy": "Workspace title and entity scope lead, followed by query, result count and collection; optional detail follows the selected record.",
        "alignment": "Align title, search region and collection content edges; detail uses a separate aligned column only when readable.",
        "spacing": "Separate query and result groups with a larger task gap than row spacing; avoid unrelated metric blocks between them.",
        "typography": "Use a clear page heading, smaller collection labels and consistent record text; keep units and identifiers legible.",
        "emphasis": "Prioritize operational exceptions and the current task over secondary metrics; do not start every workspace with KPI cards.",
        "surfaces": "Use one collection surface and a meaningful detail boundary, avoiding nested decorative card frames.",
        "proportions": "Allocate most working width to the current comparison task; detail must not compress columns into unreadable fragments.",
        "discoverability": "Display the primary create/review action and selected-scope bulk actions near their collection context.",
        "states": "Scope, count, freshness, dirty detail and partial failures remain distinct across the entire workspace.",
        "brand": "Reuse application shell and component tokens; this composition prescribes relationships rather than a palette.",
        "tokenRoles": [
          "space-workspace",
          "space-section",
          "surface-collection",
          "border-detail",
          "text-heading",
          "focus-ring"
        ]
      },
      "responsive": [
        {
          "condition": "Collection, filters and editor compete for readable width or height.",
          "restructure": "Choose comparison-scroll versus single-record summary from the task. Keep identity, critical status/permission and frequent permitted action available at narrow widths; move details to a route or one modal surface. Do not nest independent vertical panes unless their task requires them.",
          "preservedInformation": [
            "Active scope, query, sort and page",
            "Selection and permitted row actions",
            "Dirty form and return-record identity"
          ],
          "focusContinuity": "Exactly one overlay owns interaction. Preserve focus and draft when switching layout; restore the invoker or a meaningful collection fallback."
        },
        {
          "condition": "Workspace contains page, table, navigation or chips that overflow.",
          "restructure": "Assign one owner per axis/task: page owns ordinary vertical reading; comparison table owns necessary horizontal movement; navigation/chips wrap or provide reachable controls and reveal selection. Native scrollbar auto is default. Conceal locally only after equivalent discovery and keyboard/touch operation are demonstrated; repair accidental page overflow instead of clipping it.",
          "preservedInformation": [
            "Navigation/active filter meaning",
            "All comparison values",
            "Recovery and editor actions"
          ],
          "focusContinuity": "Match DOM task order to visible order; focused navigation, chips and records scroll into view without shifting unrelated regions."
        }
      ],
      "recovery": [
        {
          "stateId": "error",
          "explanation": "Retry collection fetch while preserving unsaved detail and active scope.",
          "action": "retry",
          "preservedData": [
            "active query",
            "selection IDs",
            "dirty form values"
          ]
        }
      ],
      "ruleIds": [
        "UDI-VIS-003",
        "UDI-ACC-002"
      ],
      "antiPatternIds": [
        "UDI-ANTI-004",
        "UDI-ANTI-008"
      ]
    }
  ]
};

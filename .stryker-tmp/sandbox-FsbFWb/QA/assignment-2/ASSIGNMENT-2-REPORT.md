# Assignment 2: Test Automation Implementation Report

Date: 2026-04-03
Project: Ada Oil App

## Objective
This report implements Assignment 2 requirements by:
- Automating high-risk modules identified in Assignment 1
- Integrating automation into CI/CD quality gates
- Collecting execution and quality metrics for research reporting
- Documenting reproducible evidence

## Learning Goals Status
| Learning Goal | Status | Evidence |
| :---- | :---- | :---- |
| Select and implement automation tools for system type | Complete | Playwright E2E + API integration tests in QA/test-scripts/e2e |
| Integrate automated tests into CI/CD | Complete | .github/workflows/qa-smoke-pr.yml and .github/workflows/qa-nightly-full.yml |
| Define quality gates | Complete | Section 2 quality gate tables |
| Collect and analyze metrics | Complete | Section 3 metrics tables and charts |
| Document strategy and initial results for research | Complete | Sections 1 to 5 + evidence tables |

## Connection to Assignment 1
Automation scope and priorities were inherited from Assignment 1 risk analysis (authentication, API contracts, chart data integrity, oil-loss analysis, export reliability).

| Task / Assignment Component | By the end of this assignment, you will be able to... (Learning Outcome) | Bloom's Level | Where Demonstrated in Submission |
| ----- | ----- | ----- | ----- |
| Automated Test Implementation - Identify Test Scope | Identify high-risk modules and prioritize which functions require automation. | Understand / Analyze | Section 1, Step 1 (Scope Table) |
| Automated Test Implementation - Define Test Cases | Design detailed test cases with input, expected output, and scenario type. | Apply / Analyze | Section 1, Step 2 (Test Cases Table) |
| Automated Test Implementation - Script Implementation | Implement maintainable, reusable automated scripts. | Apply / Create | Section 1, Step 3 + QA/test-scripts/e2e |
| Automated Test Implementation - Version Control Tracking | Track automation progress via Git commits. | Apply / Analyze | Section 1, Step 4 |
| Automated Test Implementation - Evidence for Research Paper | Provide reproducible proof (screenshots/logs/reports). | Apply / Evaluate | Section 1, Step 5 |
| Quality Gate Definition & Integration - Define Pass/Fail Criteria | Set and justify thresholds for reliability and coverage. | Evaluate / Apply | Section 2, Step 1 |
| Quality Gate Definition & Integration - Integrate into CI/CD | Embed tests into CI/CD for continuous verification. | Apply / Create | Section 2, Step 2 |
| Quality Gate Definition & Integration - Alerting & Failure Handling | Define handling for failures and pipeline errors. | Analyze / Evaluate | Section 2, Step 3 |
| Metrics Collection - Automation Coverage | Measure proportion of high-risk modules automated. | Analyze / Evaluate | Section 3, Step 1 |
| Metrics Collection - Execution Time Tracking (TTE) | Record and analyze execution performance. | Analyze / Evaluate | Section 3, Step 2 |
| Metrics Collection - Defects vs Expected Risk | Compare detected defects to predicted risk. | Analyze / Evaluate | Section 3, Step 3 |
| Metrics Collection - Maintain Detailed Logs | Keep detailed execution logs for reproducibility. | Apply / Evaluate | Section 3, Step 4 |
| Metrics Collection - Metrics Reporting | Compile and visualize coverage and performance metrics. | Analyze / Evaluate | Section 3, Step 5 |
| Documentation - Automation Approach & Tool Selection | Document rationale for tooling and strategy. | Understand / Evaluate | Section 4, Step 1 |
| Documentation - Quality Gate Definitions | Report thresholds and observed outcomes. | Evaluate | Section 4, Step 2 |
| Documentation - CI/CD Integration Overview | Present pipeline steps, triggers, and integration. | Apply / Create | Section 4, Step 3 |
| Documentation - Initial Results & Coverage Metrics | Present initial outcomes (coverage, timing, defects). | Analyze / Evaluate | Section 4, Step 4 |
| Documentation - Evidence for Reproducibility | Provide logs, screenshots, and code for reruns. | Apply / Evaluate | Section 4, Step 5 |

## Suggested System-Specific Automation Focus (Applied)
| System Type | Applied Automation Focus | Tools Used |
| :---- | :---- | :---- |
| Web Application + API | Login/auth flow, chart workflow, critical API contracts, export endpoints | Playwright, GitHub Actions, MySQL seeded CI |

## 1. Automated Test Implementation

### Step 1: Identify Test Scope
| Module/Feature | High-Risk Function | Test Priority (High/Medium/Low) | Notes/Expected Outcome |
| :---- | :---- | :---- | :---- |
| Authentication | User authentication with valid/invalid credentials | High | Must reject invalid credentials and persist valid session |
| Authentication | Session termination/logout | High | Must clear auth state and return to login screen |
| API Integration | Health and auth API contracts | High | Health must return ok, auth API must enforce credential rules |
| API Integration | Wells and 2-hour production data APIs | High | Endpoints must return valid, typed datasets |
| Chart and Visualization | Chart rendering and control interactions | High | Chart must render with data and preserve UI interactivity |
| Oil Loss | Oil-loss data retrieval and analysis contract validation | High | Data contracts and payload validation must remain stable |
| Export Reports | CHRP/AGZU archive export feed integrity | High | Export APIs must return export-ready rows |

### Step 2: Define Test Cases
| Test Case ID | Module/Feature | Description | Input Data | Expected Result | Scenario Type (Positive/Negative) | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TS-Auth-001 | Authentication | Login form visibility and usability | Open login page | Login form controls visible and enabled | Positive | Smoke test |
| TS-Auth-002 | Authentication | Invalid credentials rejected | invalid_user/wrong_password | Error shown, user remains unauthenticated | Negative | Critical auth guard |
| TS-Auth-003 | Authentication | Valid login persisted | user_test/password456 or env credentials | User stored in localStorage, dashboard loads | Positive | Smoke test |
| TS-Auth-004 | Authentication | Logout clears session | Logged-in user clicks logout | Auth state cleared, login screen restored | Positive | Session integrity |
| TS-API-001 | API Integration | Health endpoint check | GET /api/health | { status: ok } and HTTP 200 | Positive | Smoke test |
| TS-API-002 | API Integration | Login API success path | Valid credentials | User object returned | Positive | Smoke test |
| TS-API-003 | API Integration | Login API failure path | Invalid password | HTTP 401 + error payload | Negative | Auth contract check |
| TS-API-004 | API Integration | Wells endpoint data contract | GET /api/wells | Array with BSK wells | Positive | Data availability |
| TS-API-005 | API Integration | 2-hour current/archive availability | oil_field=BSK, archive dates | Current data + archive date list reachable | Positive | Archive-date normalization added |
| TS-Chart-001 | Chart and Visualization | Chart renders and loads 2-hour data | Dashboard load/reload | SVG + plotted series visible | Positive | Smoke test |
| TS-Chart-002 | Chart and Visualization | Liquid/oil toggle behavior | Toggle controls | Control state updates correctly | Positive | UI control integrity |
| TS-Chart-003 | Chart and Visualization | Accumulation toggle interaction | Checkbox toggle | Toggle state changes, chart remains visible | Positive | Interaction reliability |
| TS-Chart-004 | Chart and Visualization | Archive dates reachability from UI flow | Chart view with API request | Archive dates endpoint reachable and date input visible | Positive | API+UI integration |
| TS-Oil-001 | Oil Loss | Oil-loss wells listing | GET /api/oil-loss/wells | Well list returned | Positive | High-risk data source |
| TS-Oil-002 | Oil Loss | Oil-loss dataset fields | GET /api/oil-loss | Required fields present with expected types | Positive | Contract validation |
| TS-Oil-003 | Oil Loss | Oil-loss analysis payload validation | POST /api/oil-loss/analysis with {} | HTTP 400 and required error text | Negative | Input validation |
| TS-Oil-004 | Oil Loss | Date-range filter contract | startDate/endDate filters | Filtered rows match well/date constraints | Positive | High-risk analytical path |
| TS-Export-001 | Export Reports | CHRP export feed contract | startDate/endDate/well | Export-ready rows returned | Positive | High-risk reporting |
| TS-Export-002 | Export Reports | AGZU export feed contract | startDate/endDate/well | Export-ready rows returned | Positive | High-risk reporting |

### Step 3: Track Script Implementation
| Script ID | Module/Feature | Automation Framework | Script Name/Location | Status (Not Started/In Progress/Complete) | Comments |
| :---- | :---- | :---- | :---- | :---- | :---- |
| S01 | Authentication | Playwright | QA/test-scripts/e2e/auth.spec.js | Complete | 4 scenarios (positive + negative) |
| S02 | API Integration | Playwright | QA/test-scripts/e2e/api-integration.spec.js | Complete | 5 contract tests, archive handling hardened |
| S03 | Chart and Visualization | Playwright | QA/test-scripts/e2e/charts.spec.js | Complete | 4 UI + API-connected chart checks |
| S04 | Oil Loss and Export | Playwright | QA/test-scripts/e2e/high-risk.spec.js | Complete | 6 high-risk coverage tests |
| S05 | Shared Auth Utilities | Playwright Helpers | QA/test-scripts/e2e/utils/test-helpers.js | Complete | Added live credential auto-provision/repair |

### Step 4: Version Control Tracking
| Commit ID / Hash | Date | Module/Feature | Description of Changes | Author |
| :---- | :---- | :---- | :---- | :---- |
| 383cdaa | 2026-03-22 | Auth, Charts, API | Fixed button selectors and API redirect handling in tests | DaldenU |
| c2c6ba3 | 2026-03-22 | Authentication | Fixed invalid-credentials error selector | DaldenU |
| b5b2b17 | 2026-03-28 | CI | Reworked workflow baseline after action-version updates | DaldenU |
| Local working tree (uncommitted) | 2026-04-03 | Auth + API + Docs | Added live user credential provisioning, hardened TS-API-005 archive date handling, created Assignment 2 report | Current workspace changes |

### Step 5: Evidence for Research Paper
| Evidence ID | Module/Feature | Type (Screenshot/Log/Other) | Description | File Location/Link |
| :---- | :---- | :---- | :---- | :---- |
| E01 | Full Assignment 2 run | Log/JSON report | 19 tests passed, no failures | QA/test-reports/playwright/results.json |
| E02 | Full Assignment 2 run | JUnit XML | CI-friendly run output | QA/test-reports/playwright/results.xml |
| E03 | Full Assignment 2 run | HTML report | Visual execution report | QA/test-reports/playwright/index.html |
| E04 | CI/CD smoke gate | Workflow config | PR smoke quality gate workflow | .github/workflows/qa-smoke-pr.yml |
| E05 | CI/CD full gate | Workflow config | Nightly full regression workflow | .github/workflows/qa-nightly-full.yml |
| E06 | Deterministic CI data | SQL schema/seed | Repeatable MySQL setup used in CI | QA/ci/schema.sql, QA/ci/seed.sql |
| E07 | High-risk test code | Source code | Oil-loss and export automation implementation | QA/test-scripts/e2e/high-risk.spec.js |

### Deliverables
1. Automated test scripts for high-risk modules: Complete.
2. Version control repository evidence: Complete.
3. Scope, test case, script, version control, and evidence tables: Complete.

### Best Practices Applied
- Critical/high-risk modules were automated first.
- Tests are deterministic in CI using seeded MySQL data.
- Tests are maintainable through shared helper utilities.
- Auth-dependent tests now self-heal credentials via real API setup (no mocks).

## 2. Quality Gate Definition & Integration

### Step 1: Define Pass/Fail Criteria
| Quality Gate ID | Metric / Criterion | Threshold / Requirement | Importance (High/Medium/Low) | Notes |
| :---- | :---- | :---- | :---- | :---- |
| QG01 | Automation coverage for high-risk functions | >= 80% | High | Current: 100% |
| QG02 | Open critical defects in automated critical path | 0 allowed | High | Current: 0 open critical defects |
| QG03 | Assignment suite execution time | <= 10 minutes total | Medium | Current: 12.47 seconds |
| QG04 | Critical/high risk suite success rate | 100% pass required | High | Current: 19/19 passed |
| QG05 | Static analysis (lint) | 0 major issues | Medium | Current status: Failed due to missing eslint-plugin-react package in workspace config |

### Step 2: Integrate Tests into CI/CD Pipeline
| Pipeline Step | Description | Tool / Framework | Trigger (On Commit / Scheduled / PR) | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Step 1 | Checkout code | GitHub Actions | PR (smoke), Nightly (full) | actions/checkout@v4 |
| Step 2 | Install dependencies | npm | Automatic | Frontend and backend install |
| Step 3 | Seed deterministic DB | MySQL + SQL scripts | Automatic | QA/ci/schema.sql + QA/ci/seed.sql |
| Step 4 | Run automated tests | Playwright | PR smoke + nightly full | npm run test:e2e:smoke, npm run test:e2e:full |
| Step 5 | Generate/upload reports | Playwright + GitHub Artifacts | Automatic | Uploads QA/test-reports and playwright-report |

### Step 3: Document Alerting & Failure Handling Procedures
| Scenario / Event | Alert Type | Recipient / Channel | Action Required | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Critical test failure (smoke/full) | GitHub check failure + workflow status | QA owner + dev team via PR checks | Investigate failed case, fix, rerun workflow | Block merge on smoke failures |
| Coverage below threshold | Quality-gate review in report/PR | QA owner | Add missing high-risk test coverage before release | Tracked in Section 3 coverage table |
| Test execution timeout | Workflow failure log | DevOps/QA | Optimize test path or increase targeted timeout after diagnosis | Keep deterministic seeding |
| CI pipeline config error | Workflow failure log | DevOps | Fix workflow YAML and rerun | Keep two-gate model (smoke/full) |
| Lint gate failure | Local/CI lint output | Dev team | Install missing lint dependencies and rerun lint | Current known issue captured in QG05 |

### Step 4: CI/CD Pipeline Documentation

```mermaid
flowchart LR
	A[PR to main] --> B[qa-smoke-pr.yml]
	B --> C[Install deps]
	C --> D[Seed MySQL test DB]
	D --> E[Build + start backend]
	E --> F[Run smoke tests]
	F --> G[Upload report artifacts]

	H[Nightly schedule] --> I[qa-nightly-full.yml]
	I --> J[Install deps + browsers]
	J --> K[Seed MySQL test DB]
	K --> L[Build + start backend]
	L --> M[Run full E2E suite]
	M --> N[Upload nightly artifacts]
```

### Deliverables
1. Quality gate definitions and observed outcomes: Complete.
2. CI/CD integration documentation and workflow evidence: Complete.
3. Failure handling strategy documentation: Complete.

### Best Practices Applied
- Fast PR gate + broader nightly regression.
- Deterministic DB bootstrapping for reproducibility.
- Artifact retention for audit and research evidence.

## 3. Metrics Collection

### Step 1: Track Automation Coverage
| Module/Feature | High-Risk Function | Test Automated? (Yes/No) | Coverage % | Notes |
| :---- | :---- | :---- | :---- | :---- |
| Authentication | Login, invalid login, session persistence, logout | Yes | 100% | TS-Auth-001..004 |
| API Integration | Health, auth contracts, wells data, archive availability | Yes | 100% | TS-API-001..005 |
| Chart and Visualization | Render + toggle + archive-date integration | Yes | 100% | TS-Chart-001..004 |
| Oil Loss + Export | Oil-loss wells/data/analysis/filter + CHRP/AGZU exports | Yes | 100% | TS-Oil-001..004, TS-Export-001..002 |

Automation Coverage Formula:
Automation Coverage (%) = (Automated high-risk functions / Total high-risk functions) x 100

Computed Result:
- Automated high-risk functions: 8
- Total high-risk functions: 8
- Overall automation coverage: 100%

### Step 2: Track Execution Time (TTE)
| Module/Feature | Number of Test Cases | Execution Time per Test Case (sec) | Total Execution Time (sec) | Notes |
| :---- | :---- | :---- | :---- | :---- |
| API Integration | 5 | 0.048, 0.026, 0.019, 0.015, 0.034 | 0.142 | Contract checks |
| Authentication | 4 | 0.903, 1.087, 1.259, 1.310 | 4.559 | UI state transitions |
| Chart and Visualization | 4 | 1.225, 1.385, 1.331, 1.350 | 5.291 | UI + API interaction |
| Oil Loss + Export | 6 | 0.027, 0.040, 0.007, 0.159, 0.007, 0.030 | 0.270 | High-risk API contracts |
| Full Assignment 2 Suite | 19 | Mixed | 12.473 | From QA/test-reports/playwright/results.json |

### Step 3: Track Defects Found vs Expected Risk
| Module/Feature | High-Risk Level (High/Medium/Low) | Expected Defects | Defects Found | Pass/Fail | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Authentication | High | 2 | 1 | Pass | Local credential drift detected and fixed via live credential provisioning |
| API Integration | High | 2 | 1 | Pass | Archive-date format/ordering fragility fixed in TS-API-005 |
| Chart and Visualization | High | 2 | 0 | Pass | Stable after login dependency fix |
| Oil Loss + Export | High | 1 | 0 | Pass | Endpoint contracts remained stable |

### Step 4: Maintain Detailed Logs
| Test Case ID | Module/Feature | Execution Date/Time | Result (Pass/Fail) | Defects Found | Execution Time (sec) | Notes |
| :---- | :---- | :---- | :---- | :---- | :---- | :---- |
| TS-API-001 | API Integration | 2026-04-03T08:29:07Z | Pass | 0 | 0.048 | Health gate |
| TS-API-002 | API Integration | 2026-04-03T08:29:07Z | Pass | 0 | 0.026 | Valid login API |
| TS-API-003 | API Integration | 2026-04-03T08:29:07Z | Pass | 0 | 0.019 | Invalid login API |
| TS-API-004 | API Integration | 2026-04-03T08:29:07Z | Pass | 0 | 0.015 | Wells data contract |
| TS-API-005 | API Integration | 2026-04-03T08:29:07Z | Pass | 0 | 0.034 | Current/archive data contract |
| TS-Auth-001 | Authentication | 2026-04-03T08:29:07Z | Pass | 0 | 0.903 | Login form visibility |
| TS-Auth-002 | Authentication | 2026-04-03T08:29:07Z | Pass | 0 | 1.087 | Invalid credentials rejection |
| TS-Auth-003 | Authentication | 2026-04-03T08:29:07Z | Pass | 0 | 1.259 | Session persistence |
| TS-Auth-004 | Authentication | 2026-04-03T08:29:07Z | Pass | 0 | 1.310 | Logout state clear |
| TS-Chart-001 | Chart and Visualization | 2026-04-03T08:29:07Z | Pass | 0 | 1.225 | Chart render |
| TS-Chart-002 | Chart and Visualization | 2026-04-03T08:29:07Z | Pass | 0 | 1.385 | Mode switching |
| TS-Chart-003 | Chart and Visualization | 2026-04-03T08:29:07Z | Pass | 0 | 1.331 | Accumulation toggle |
| TS-Chart-004 | Chart and Visualization | 2026-04-03T08:29:07Z | Pass | 0 | 1.350 | Archive dates reachability |
| TS-Oil-001 | Oil Loss + Export | 2026-04-03T08:29:07Z | Pass | 0 | 0.027 | Oil-loss wells list |
| TS-Oil-002 | Oil Loss + Export | 2026-04-03T08:29:07Z | Pass | 0 | 0.040 | Oil-loss required fields |
| TS-Oil-003 | Oil Loss + Export | 2026-04-03T08:29:07Z | Pass | 0 | 0.007 | Analysis payload rejection |
| TS-Oil-004 | Oil Loss + Export | 2026-04-03T08:29:07Z | Pass | 0 | 0.159 | Date-range filtering contract |
| TS-Export-001 | Oil Loss + Export | 2026-04-03T08:29:07Z | Pass | 0 | 0.007 | CHRP export-ready rows |
| TS-Export-002 | Oil Loss + Export | 2026-04-03T08:29:07Z | Pass | 0 | 0.030 | AGZU export-ready rows |

### Step 5: Metrics Reporting

Bar Chart: Automation Coverage by Module

```mermaid
xychart-beta
	title "Automation Coverage by Module"
	x-axis ["Authentication", "API", "Charts", "Oil+Export"]
	y-axis "Coverage %" 0 --> 100
	bar [100, 100, 100, 100]
```

Line Chart: Module Execution Time

```mermaid
xychart-beta
	title "Execution Time by Module (sec)"
	x-axis ["API", "Auth", "Charts", "Oil+Export"]
	y-axis "Seconds" 0 --> 6
	line [0.142, 4.559, 5.291, 0.270]
```

Pie Chart: Defects Found Distribution

```mermaid
pie showData
	title Defects Found by Module During Implementation
	"Authentication" : 1
	"API Integration" : 1
	"Charts" : 0
	"Oil Loss + Export" : 0
```

### Deliverables
1. Metrics report tables and charts: Complete.
2. Execution evidence and run logs: Complete.

## 4. Documentation

### Step 1: Automation Approach & Tool Selection
| Section | Details | Example / Prompt Response |
| :---- | :---- | :---- |
| Automation Approach | Risk-based, regression-first, contract + UI critical-path validation | High-risk modules automated first; smoke subset for PR gating |
| Tool Selection | Playwright for UI/API E2E, GitHub Actions for CI orchestration, MySQL seed scripts for deterministic data | Chosen for browser automation, API assertions, CI portability, and reproducibility |
| Scope | Authentication, API integration, chart workflows, oil-loss and export contracts | 19 tests in assignment suite |
| Reusability | Shared helper utilities and environment-driven credentials | QA/test-scripts/e2e/utils/test-helpers.js |

### Step 2: Quality Gate Definitions (Observed)
| Quality Gate ID | Metric / Criterion | Threshold | Observed Results | Notes |
| :---- | :---- | :---- | :---- | :---- |
| QG01 | Coverage of high-risk functions | >= 80% | 100% | Pass |
| QG02 | Open critical defects | 0 | 0 | Pass |
| QG03 | Assignment suite TTE | <= 10 minutes | 12.473 seconds | Pass |
| QG04 | Critical/high-risk suite success | 100% | 100% (19/19) | Pass |
| QG05 | Linting/static analysis | 0 major issues | Failed (missing eslint-plugin-react package) | Action required |

### Step 3: CI/CD Integration Overview
| Pipeline Step | Tool / Framework | Trigger | Description | Screenshot/Diagram |
| :---- | :---- | :---- | :---- | :---- |
| Step 1 | GitHub Actions | PR to main | Checkout + setup Node + install dependencies | .github/workflows/qa-smoke-pr.yml |
| Step 2 | GitHub Actions + MySQL | PR/Nightly | Seed deterministic DB (schema + seed) | .github/workflows/qa-smoke-pr.yml, .github/workflows/qa-nightly-full.yml |
| Step 3 | Playwright | PR smoke | Run chromium smoke subset | package.json script test:e2e:smoke |
| Step 4 | Playwright | Nightly / Manual dispatch | Run full E2E suite | package.json script test:e2e:full |
| Step 5 | Artifact upload | On failure/success | Upload reports for audit | workflow upload-artifact steps |

### Step 4: Initial Results & Coverage Metrics
| Module/Feature | Automated? | Coverage % | Execution Time (sec) | Defects Found | Pass/Fail |
| :---- | :---- | :---- | :---- | :---- | :---- |
| Authentication | Yes | 100% | 4.559 | 1 (fixed) | Pass |
| API Integration | Yes | 100% | 0.142 | 1 (fixed) | Pass |
| Chart and Visualization | Yes | 100% | 5.291 | 0 | Pass |
| Oil Loss + Export | Yes | 100% | 0.270 | 0 | Pass |
| Overall Assignment 2 Suite | Yes | 100% | 12.473 | 2 fixed total during implementation | Pass |

Visual references are included in Section 3, Step 5.

### Step 5: Evidence for Reproducibility
| Evidence ID | Module/Feature | Type (Screenshot / Log / Code) | Description | File Location / Link |
| :---- | :---- | :---- | :---- | :---- |
| E01 | Full suite | Log | Playwright JSON execution log | QA/test-reports/playwright/results.json |
| E02 | Full suite | Report | Playwright HTML report | QA/test-reports/playwright/index.html |
| E03 | CI smoke gate | Config | PR smoke pipeline definition | .github/workflows/qa-smoke-pr.yml |
| E04 | CI full gate | Config | Nightly full pipeline definition | .github/workflows/qa-nightly-full.yml |
| E05 | Auth/API robustness | Code | Credential auto-provision + archive-date handling | QA/test-scripts/e2e/utils/test-helpers.js, QA/test-scripts/e2e/api-integration.spec.js |
| E06 | High-risk coverage | Code | Oil-loss and export coverage suite | QA/test-scripts/e2e/high-risk.spec.js |

### Deliverables
1. Updated QA strategy and automation documentation: Complete (this report).
2. Reproducibility evidence references: Complete.

### Best Practices Applied
- Tables and metrics are updated with latest passing run.
- Failures found during implementation are documented and linked to fixes.
- CI and test evidence are referenced with concrete project paths.

## 5. Deliverables Checklist
| Deliverable | Description | File/Location | Status (Not Started / In Progress / Complete) | Notes / Evidence |
| :---- | :---- | :---- | :---- | :---- |
| Automated Test Scripts | Scripts for all high-risk modules/components, including positive and negative scenarios | QA/test-scripts/e2e | Complete | 19 assignment tests, 100% pass |
| Updated QA Test Strategy Document | Includes automation approach, quality gates, CI/CD overview, and metrics | QA/assignment-2/ASSIGNMENT-2-REPORT.md | Complete | Consolidated assignment report |
| Quality Gate Report | Pass/fail criteria, thresholds, and outcomes | QA/assignment-2/ASSIGNMENT-2-REPORT.md (Section 2) | Complete | QG01..QG05 documented |
| Metrics Report | Coverage, execution times, defects, logs, and charts | QA/assignment-2/ASSIGNMENT-2-REPORT.md (Section 3) | Complete | Includes per-test execution log |
| CI/CD Pipeline Evidence | Pipeline integration and artifact/report evidence | .github/workflows/qa-smoke-pr.yml, .github/workflows/qa-nightly-full.yml, QA/test-reports/playwright | Complete | Workflow + report artifacts referenced |

## Final Status Summary
- Assignment-required command executed successfully: npm run test:e2e:assignment2
- Result: 19 passed, 0 failed
- Runtime: 12.473 seconds
- Coverage of identified high-risk functions: 100%


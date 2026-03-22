# Advanced Quality Assurance
**Assignment 1: QA Landscape & Testing Planning**  
Team members: Amirsultan Shakenov, Temirlan Andasov and Ernest Aibatov  
Group: CSE-2507M

## Testing Infrastructure for Ada Oil App

This repository contains comprehensive QA testing infrastructure, risk assessment, and test strategy documentation for the Ada Oil App (IoT oil industry monitoring platform).

### Contents

#### Documentation
- **QA/ASSIGNMENT-1-REPORT.docx** - Complete assignment report (concise, on-point)
- **QA/Assignment-1/** - Detailed documents
  - `01-RISK-ASSESSMENT.md` - System risk analysis (10 components, 5 high-risk)
  - `02-QA-TEST-STRATEGY.md` - Testing strategy (25 test scenarios)
  - `03-QA-ENVIRONMENT-SETUP.md` - Environment configuration guide
  - `04-BASELINE-METRICS.md` - Performance and coverage baselines

#### Test Infrastructure
- **QA/test-scripts/e2e/** - 13 automated E2E tests
  - `auth.spec.js` - Authentication workflow tests (4 scenarios)
  - `api-integration.spec.js` - API endpoint tests (5 scenarios)
  - `charts.spec.js` - Chart visualization tests (4 scenarios)
  - `utils/test-helpers.js` - Reusable test utilities
- **playwright.config.js** - Playwright configuration (multi-browser, mobile)
- **.github/workflows/qa-tests.yml** - GitHub Actions CI/CD pipeline

#### Test Reports & Utilities
- **QA/test-reports/** - Test execution results
- **QA/README.md** - QA module documentation
- **QA/QUICK-START.md** - 5-minute setup guide
- **QA/DELIVERABLES.md** - Assignment deliverables checklist


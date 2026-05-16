# Intellectual Oil Field App — QA Project

> A comprehensive Quality Assurance suite for an oil-field production monitoring web application. The project covers the full QA spectrum: unit testing, end-to-end (E2E) testing, mutation testing, performance testing, chaos engineering, and test case prioritization (APFD).

---

## Authors

| Name | GitHub |
|---|---|
| Andasov Temirlan | [@DaldenU](https://github.com/DaldenU) |
| Aibatov Ernest | [@ernestajbatov-blip](https://github.com/ernestajbatov-blip) |
| Shakenov Amirsultan | [@Octozavrus](https://github.com/Octozavrus) |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Installation & Setup](#4-installation--setup)
5. [Environment Variables](#5-environment-variables)
6. [Running the Application](#6-running-the-application)
7. [Test Suites](#7-test-suites)
   - [7.1 Unit Tests (Vitest)](#71-unit-tests-vitest)
   - [7.2 End-to-End Tests (Playwright)](#72-end-to-end-tests-playwright)
   - [7.3 Mutation Tests (Stryker)](#73-mutation-tests-stryker)
   - [7.4 Performance Tests](#74-performance-tests)
   - [7.5 Chaos Tests](#75-chaos-tests)
   - [7.6 APFD Measurement (Test Case Prioritization)](#76-apfd-measurement-test-case-prioritization)
8. [Viewing Test Reports](#8-viewing-test-reports)
9. [CI/CD Database Setup](#9-cicd-database-setup)
10. [Project Structure](#10-project-structure)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. Project Overview

The ADA Oil App is a React/Vite front-end with a Node.js/Express back-end that visualises oil-field production metrics sourced from a MySQL database. This repository contains the **full QA pipeline** developed across three academic assignments:

| Assignment | Focus Area | Test Types |
|---|---|---|
| Assignment 1 | Infrastructure & Smoke Tests | E2E (auth, API, charts) |
| Assignment 2 | High-Risk & Expanded Coverage | E2E (oil loss, export, edge cases), Unit |
| Assignment 3 | Advanced Techniques | Mutation, Performance, Chaos, APFD |

---

## 2. Architecture & Tech Stack

### Application
| Layer | Technology |
|---|---|
| Frontend | React 18, Vite 6, React Router, Recharts, Leaflet |
| Backend | Node.js, Express (via `src/backend/server.js`) |
| Database | MySQL 2 |

### QA Stack
| Tool | Purpose |
|---|---|
| **Vitest** | Unit & component tests |
| **@testing-library/react** | React component rendering & interaction |
| **Playwright** | End-to-end browser automation |
| **Stryker Mutator** | Mutation testing |
| **Custom Node.js scripts** | Performance & chaos testing |

---

## 3. Prerequisites

Ensure the following are installed before proceeding:

- **Node.js** ≥ 18 (LTS recommended)
- **npm** ≥ 9 (or **yarn** — a `yarn.lock` is present)
- **MySQL** 8.x — a running instance is required for the backend and E2E tests
- **Playwright browsers** — installed separately (see §4)

> **Windows users:** All commands below use `npm`. Replace with `yarn` if preferred.

---

## 4. Installation & Setup

### Step 1 — Clone & install root dependencies

```bash
# From the project root
npm install
```

### Step 2 — Install backend dependencies

```bash
cd src/backend
npm install
cd ../..
```

### Step 3 — Install Playwright browsers

```bash
npx playwright install
```

> This downloads Chromium, Firefox, WebKit, and the mobile device emulator. It must be run once. On CI it is typically replaced by `npx playwright install --with-deps chromium`.

### Step 4 — Configure the database

Create the database schema and seed it with test data using the SQL files provided under `QA/ci/`:

```bash
# Example using the MySQL CLI (adjust host/user/pass as needed)
mysql -u root -p < QA/ci/schema.sql
mysql -u root -p ada_oil_db < QA/ci/seed.sql
```

> The seed script populates BSK-prefixed well records required by the E2E test assertions (e.g., `TS-API-004`, `TS-Oil-001`).

---

## 5. Environment Variables

Create a `.env` file in the project root (a template `.env` is already present):

```dotenv
# --- Database ---
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=ada_oil_db

# --- E2E Test credentials (must match a seeded user) ---
E2E_LOGIN=your_test_user
E2E_PASSWORD=your_test_password

# --- Optional overrides ---
PERF_BASE_URL=http://localhost:3000   # Override base URL for performance tests
CHAOS_BASE_URL=http://localhost:3000  # Override base URL for chaos tests
```

> **Note:** If `E2E_LOGIN` / `E2E_PASSWORD` are not set, the API integration tests fall back to `test` / `123456`. These must correspond to a real user row in the database for `TS-API-002` to pass.

---

## 6. Running the Application

The backend must be running for E2E, performance, and chaos tests to work.

### Start backend + frontend (development mode)

Open **two terminals** and run:

```bash
# Terminal 1 — backend API server (port 3000)
npm run backend:start

# Terminal 2 — Vite dev server (port 5173, proxied to 3000)
npm run dev
```

### Build & serve (production-like, used by Playwright's built-in web server)

```bash
npm run build
npm run backend:start
```

> Playwright's `webServer` configuration in `playwright.config.js` automatically runs `npm run build && npm run backend:start` before tests if no server is already listening on port 3000. Set `PW_NO_WEBSERVER=1` to disable this and manage the server yourself.

---

## 7. Test Suites

### 7.1 Unit Tests (Vitest)

Unit tests are powered by **Vitest** with **jsdom** for DOM simulation and **@testing-library/react** for component rendering. They cover:

| File | What it tests |
|---|---|
| `src/axios/__tests__/api.test.js` | `getBaseURL` logic, `axios.create` config (baseURL, headers) |
| `src/states/__tests__/WellsContext.test.jsx` | `WellsContext` provider — initial state, data propagation |
| `src/states/__tests__/WellsABCContext.test.jsx` | `WellsABCContext` — ABC well grouping, state mutations |
| `src/states/__tests__/UserContext.test.jsx` | `UserContext` — user state management |
| `src/components/__tests__/Login.test.jsx` | `Login` component — form rendering, submit behaviour, 401 handling |
| `src/components/__tests__/NotificationBell.test.jsx` | `NotificationBell` — polling interval, badge display |

#### Commands

```bash
# Run all unit tests once
npm run test:unit

# Run with code coverage report
npm run test:unit:coverage

# Run in watch mode (re-runs on file change)
npm run test:unit:watch
```

#### Coverage output

Coverage reports are written to `QA/test-reports/coverage/`. Open `QA/test-reports/coverage/index.html` in a browser to explore coverage per file.

---

### 7.2 End-to-End Tests (Playwright)

E2E tests are located in `QA/test-scripts/e2e/` and run against the live application at `http://localhost:3000`.

#### Test files & what they cover

| Spec File | Test IDs | Description |
|---|---|---|
| `auth.spec.js` | TS-Auth-001 to 004 | Login form visibility, invalid credential rejection, localStorage persistence, logout behaviour |
| `api-integration.spec.js` | TS-API-001 to 005 | `/api/health`, `/api/auth/login`, `/api/wells`, `/api/2hours` (current + archive) |
| `charts.spec.js` | TS-Chart-001 to 004 | Chart render, liquid/oil mode toggle, accumulation toggle, archive date picker |
| `high-risk.spec.js` | TS-Oil-001 to 004, TS-Export-001 to 002 | Oil-loss wells list, dataset fields, payload validation, date-range filtering, CHRP/AGZU archive exports |
| `expanded-tests.spec.js` | TC-AUTH-FAILURE-01, TC-API-FAILURE-01/02, TC-CHART-EDGE-01/02, TC-OILLOSS-CONCURRENT-01, TC-AUTH-INVALID-BEHAVIOR-01, TC-EXPORT-EDGE-01, TC-OIL-EDGE-01, UNIT-1 to 14, Baselines | Extended edge cases, unit-level logic tests (embedded in Playwright), and baseline health checks |

#### Commands

```bash
# Run smoke tests only (tagged @smoke) on Chromium
npm run test:e2e:smoke

# Run full E2E suite on all configured browsers (Chromium, Firefox, WebKit, Mobile Chrome)
npm run test:e2e:full

# Run the expanded edge-case tests on Chromium only
npm run test:e2e:expanded

# Run Assignment 2 test files (auth + API + charts + high-risk) on Chromium
npm run test:e2e:assignment2
```

#### Running specific test files manually

```bash
# Single file, Chromium
npx playwright test QA/test-scripts/e2e/auth.spec.js --project=chromium

# Single test by title (grep)
npx playwright test --grep "TS-Auth-001"

# With headed browser (see the browser window)
npx playwright test --headed --project=chromium

# With Playwright UI mode (interactive test explorer)
npx playwright test --ui
```

#### Reports

HTML, JSON, and JUnit XML reports are written to `QA/test-reports/playwright/`. Screenshots and video recordings on failures are retained in `test-results/`.

---

### 7.3 Mutation Tests (Stryker)

Mutation testing uses **Stryker Mutator** with the **Vitest runner** to inject faults into production code and verify that the unit test suite catches them.

#### What is mutated

Stryker targets the following source paths (configured in `stryker.conf.json`):

| Path | Description |
|---|---|
| `src/axios/**/*.js` | API client layer |
| `src/states/**/*.{js,jsx}` | React context providers (excluding `UniversalActivityTracker.jsx`) |
| `src/components/Login/**/*.jsx` | Login form component |
| `src/components/NotificationBell/**/*.jsx` | Notification bell component |

> `UniversalActivityTracker.jsx` is excluded because it relies on physical browser hardware events that are untestable in automated environments.

#### Command

```bash
# Run full mutation test suite (takes several minutes)
npm run mutation:test
```

#### Open the mutation report

```bash
# Opens the HTML report in the default browser
npm run mutation:test:report

# Alternatively open manually:
# Windows: start QA\test-reports\mutation\index.html
# macOS/Linux: open QA/test-reports/mutation/index.html
```

#### Output files

| File | Description |
|---|---|
| `QA/test-reports/mutation/index.html` | Interactive HTML report (mutant map per file) |
| `QA/test-reports/mutation/results.json` | Machine-readable JSON (used by APFD runner) |

#### Key findings

See [`QA/test-reports/mutation/mutation_testing_summary.md`](QA/test-reports/mutation/mutation_testing_summary.md) for a full analysis. Highlights:

- **API layer** — 100% mutation score; any accidental HTTP method or URL change is instantly caught.
- **State layer** — Hardcoded string matching in `WellsABCContext` is sensitive to backend data format changes.
- **UI components** — Behaviour is fully covered; injected CSS strings are inherently untestable.

---

### 7.4 Performance Tests

A custom **Node.js load runner** (`QA/test-scripts/performance-test.js`) measures throughput, response times, and resource usage across four load scenarios.

#### Tested endpoints

| Module | Method | Endpoint |
|---|---|---|
| Authentication | POST | `/api/auth/login` |
| API Integration | GET | `/api/wells` |
| Oil Loss Analysis | GET | `/api/oil-loss` |

#### Load scenarios

| Scenario | Concurrency | Duration |
|---|---|---|
| `normal_load` | 5 workers | 20 s |
| `peak_load` | 20 workers | 20 s |
| `spike_load` | 50 workers | 10 s |
| `endurance_test` | 10 workers | 45 s |

#### Command

> **The backend must be running** on `http://localhost:3000` (or the value of `PERF_BASE_URL`).

```bash
npm run performance:test
```

#### Output files

All outputs are written to `QA/test-reports/performance/`:

| File | Content |
|---|---|
| `performance-results.json` | Full results per scenario including module breakdown |
| `response-time-summary.csv` | Per-scenario summary (avg, median, p95, p99, throughput) |
| `throughput-over-time.csv` | Requests/sec and errors/sec sampled every second |
| `resource-usage.csv` | CPU %, memory %, and file I/O delta per second |
| `execution-log.txt` | Timestamped execution log |

---

### 7.5 Chaos Tests

The chaos test suite (`QA/test-scripts/chaos-test.js`) simulates real-world infrastructure failures and measures the application's resilience (availability and MTTR).

#### Chaos scenarios

| Scenario | Fault Type | Duration | Target Endpoint |
|---|---|---|---|
| `api_downtime_simulation` | Forced 100% failure (all requests fail) | 20 s | `/api/health` |
| `database_failure_simulation` | Aggressive 40 ms timeout (simulates slow/unavailable DB) | 20 s | `/api/oil-loss` |
| `network_latency_packet_loss` | 250–1150 ms injected latency + 20% packet loss | 25 s | `/api/2hours?oil_field=BSK` |
| `resource_exhaustion_spike` | 70 concurrent workers hammering the server | 20 s | `/api/wells` |

#### Command

> **The backend must be running** on `http://localhost:3000` (or the value of `CHAOS_BASE_URL`).

```bash
npm run chaos:test
```

#### Output files

All outputs are written to `QA/test-reports/chaos/`:

| File | Content |
|---|---|
| `chaos-results.json` | Full per-scenario results including propagated error breakdown |
| `chaos-metrics.csv` | Summary table (availability %, avg latency, p95, MTTR) |
| `fault-injection-log.txt` | Timestamped log of scenario start/finish events |

---

### 7.6 APFD Measurement (Test Case Prioritization)

The APFD (Average Percentage of Faults Detected) runner (`QA/test-scripts/run-apfd.js`) quantifies the effectiveness of **risk-based test ordering** versus random ordering, consuming the mutation results as its fault oracle.

#### How it works

1. Loads mutation results from `QA/test-reports/mutation/results.json` (falls back to realistic mock data if not present).
2. Generates a **risk-based ordering** of all 19 test cases by risk score and coverage.
3. Generates **30 random permutations** (with a fixed seed for reproducibility).
4. Calculates APFD and T1F (Time-to-First-Failure) for each ordering across 4 browsers.
5. Produces a comparative analysis report.

#### Command

> Run mutation tests first to get a fresh `results.json`, then run APFD:

```bash
npm run mutation:test        # generates results.json
npm run apfd:measure         # consumes results.json and outputs APFD reports
```

#### Open the APFD visualisation

```bash
npm run apfd:report

# Alternatively open manually:
# Windows: start QA\test-reports\mutation\apfd-curves.html
```

#### Output files

All outputs are written to `QA/test-reports/mutation/`:

| File | Content |
|---|---|
| `apfd-results.json` | Full APFD results for both orderings |
| `apfd-report.md` | Markdown report with tables, formula, and conclusions |
| `apfd-curves.html` | Interactive HTML chart of fault detection curves |
| `apfd-curve-risk-based.csv` | Cumulative fault detection data (risk-based) |
| `apfd-curve-random.csv` | Cumulative fault detection data (random baseline) |

---

### Run Everything (Assignment 3 Bundle)

To execute performance, mutation, and chaos tests sequentially:

```bash
npm run assignment3:run
```

> This is equivalent to: `npm run performance:test && npm run mutation:test && npm run chaos:test`

---

## 8. Viewing Test Reports

| Report | Location | How to open |
|---|---|---|
| Unit coverage | `QA/test-reports/coverage/index.html` | Open in browser |
| Playwright HTML | `QA/test-reports/playwright/index.html` | Open in browser |
| Mutation HTML | `QA/test-reports/mutation/index.html` | `npm run mutation:test:report` |
| APFD curves | `QA/test-reports/mutation/apfd-curves.html` | `npm run apfd:report` |
| Performance JSON | `QA/test-reports/performance/performance-results.json` | Any text editor or JSON viewer |
| Chaos JSON | `QA/test-reports/chaos/chaos-results.json` | Any text editor or JSON viewer |

---

## 9. CI/CD Database Setup

The `QA/ci/` directory contains two SQL scripts for automated pipeline setup:

| File | Purpose |
|---|---|
| `QA/ci/schema.sql` | Creates all tables required by the backend |
| `QA/ci/seed.sql` | Inserts BSK well records and a test user for E2E assertions |

A typical CI step (e.g., GitHub Actions with a MySQL service container):

```yaml
- name: Setup database
  run: |
    mysql -h 127.0.0.1 -u root -proot < QA/ci/schema.sql
    mysql -h 127.0.0.1 -u root -proot ada_oil_db < QA/ci/seed.sql
```

---

## 10. Project Structure

```
ada_oil_app-main/
├── QA/
│   ├── ci/
│   │   ├── schema.sql              # Database DDL for CI
│   │   └── seed.sql                # Test data seed
│   ├── test-reports/
│   │   ├── chaos/                  # Chaos test outputs
│   │   ├── mutation/               # Stryker + APFD outputs
│   │   ├── performance/            # Performance test outputs
│   │   └── playwright/             # Playwright HTML/JSON/XML reports
│   └── test-scripts/
│       ├── e2e/
│       │   ├── api-integration.spec.js
│       │   ├── auth.spec.js
│       │   ├── charts.spec.js
│       │   ├── expanded-tests.spec.js
│       │   ├── high-risk.spec.js
│       │   ├── fixtures/           # HAR fixtures for mocked responses
│       │   └── utils/              # Shared test helpers (loginToApp, etc.)
│       ├── apfd-calculator.js      # APFD formula implementation
│       ├── apfd-experiment.js      # Experiment runner
│       ├── apfd-visualization.js   # HTML/CSV chart generator
│       ├── chaos-test.js           # Chaos engineering scenarios
│       ├── performance-test.js     # Load testing runner
│       ├── run-apfd.js             # APFD main orchestrator
│       └── test-ordering.js        # Test case metadata & risk scores
├── src/
│   ├── axios/
│   │   ├── api.js                  # Axios instance (mutated by Stryker)
│   │   └── __tests__/api.test.js
│   ├── backend/
│   │   ├── server.js               # Express API server
│   │   └── db.js                   # MySQL connection pool
│   ├── components/
│   │   ├── Login/                  # Login form (mutated by Stryker)
│   │   ├── NotificationBell/       # Notification bell (mutated by Stryker)
│   │   └── __tests__/              # Component unit tests
│   ├── states/
│   │   ├── WellsContext.jsx        # Global wells state (mutated by Stryker)
│   │   ├── WellsABCContext.jsx     # ABC well grouping (mutated by Stryker)
│   │   ├── UserContext.js          # User auth state
│   │   ├── UniversalActivityTracker.jsx  # (excluded from mutation)
│   │   └── __tests__/              # State unit tests
│   └── pages/                      # Route-level page components
├── playwright.config.js            # Playwright configuration
├── stryker.conf.json               # Stryker Mutator configuration
├── vite.config.js                  # Vite + Vitest configuration
└── package.json                    # All npm scripts
```

---

## 11. Troubleshooting

### `Error: connect ECONNREFUSED 127.0.0.1:3000`
The backend server is not running. Start it with `npm run backend:start` before running E2E, performance, or chaos tests.

### Playwright tests fail with `net::ERR_CONNECTION_REFUSED`
Either the backend is down or the Playwright `webServer` did not finish building. Check that `npm run build` completes without errors. You can bypass the auto-server with:
```bash
PW_NO_WEBSERVER=1 npx playwright test
```

### `TS-API-002` fails with `Login API failed`
The `E2E_LOGIN` / `E2E_PASSWORD` environment variables are not set or do not match a seeded user in the database. Re-run `QA/ci/seed.sql` and update `.env` accordingly.

### Stryker runs slowly or times out
Stryker spawns one Vitest process per mutant. Reduce the scope or increase `timeoutMS` in `stryker.conf.json`. The `concurrency: 4` setting limits parallel workers to avoid resource exhaustion.

### APFD runner uses mock data
If `QA/test-reports/mutation/results.json` does not exist, the APFD runner automatically falls back to mock mutation data. Run `npm run mutation:test` first to generate real results.

### Coverage report is empty
Run `npm run test:unit:coverage` (not `test:unit`). The coverage provider requires the `--coverage` flag which is baked into the `test:unit:coverage` script.

# Mutation Testing Strategy & Results

**Date**: 2026-04-11  
**Project**: Ada Oil App  
**Framework**: Stryker.js (v7+)

## Overview

Mutation testing validates that your test suite is effective at catching code defects by intentionally introducing bugs (mutations) into the source code and verifying that tests fail. This complements your risk-based test automation strategy by measuring test quality, not just coverage.

---

## Part 1: Mutation Testing Rationale

### Why Mutation Testing?

From your Assignment 2 work, you have:
- **19 passing E2E tests** across 4 high-risk modules
- **100% automation coverage** of critical paths
- **2 defects caught** during implementation (auth credential drift, API archive-date handling)

**Question**: Are your 19 tests *effective* at catching code mutations?

Mutation testing answers this by:
1. Introducing mutations (bugs) into high-risk code
2. Running your 19 E2E tests
3. Measuring how many mutations your tests *kill* (detect)
4. Computing a **mutation score**: `(killed mutations / total mutations) × 100`

A high mutation score indicates your tests are robust validators of code quality.

---

## Part 2: Mutation Testing Scope

### Target Modules (High-Risk Focus)

| Module | File Pattern | Rationale | Risk Level |
|--------|--------------|-----------|-----------|
| **API Integration** | `src/axios/wellService.js`, `src/axios/api.js` | Core data contracts, authentication flow | High |
| **Authentication** | `src/components/Login/` | User credential validation, session persistence | High |
| **Chart Rendering** | `src/components/AChart/`, `src/components/AmChart/`, `src/components/Chart/` | Data visualization, toggle state, archive-date handling | High |
| **Oil-Loss Analysis** | `src/components/OilLossChart/` | High-risk analytical calculations | High |
| **Export Logic** | `src/components/DataDisplay/`, `src/pages/` | CHRP/AGZU export data formatting | High |

### Mutations NOT Included

- Test files (`*.test.js`, `*.spec.js`)
- Node modules and dependencies
- Static assets and configuration files
- Comments and documentation

### Types of Mutations Applied

Stryker applies standard JavaScript mutations:

| Mutation Type | Example | Expected Impact |
|---------------|---------|-----------------|
| **Logical operators** | `&&` → `\|\|`, `>` → `>=` | Boundary condition checks fail |
| **Arithmetic** | `+` → `-`, `*` → `/` | Calculations produce wrong results |
| **Assignments** | `x = value` → `x = !value` | State changes are inverted |
| **Return values** | `return true` → `return false` | Control flow diverges |
| **Conditional removal** | `if (x) { }` → removed | Safeguards are eliminated |

---

## Part 3: Mutation Testing Execution

### Prerequisites

```bash
# Install dependencies (already done)
npm install

# Backend running (for E2E tests)
npm run backend:start

# In another terminal, run mutation:
npm run mutation:test
```

### Command Reference

| Command | Purpose |
|---------|---------|
| `npm run mutation:test` | Run full mutation test suite against Assignment 2 test cases |
| `npm run mutation:test:report` | Open HTML mutation report in browser |

### Execution Flow

```
1. Stryker discovers source files (src/axios/, src/components/)
2. For each source file:
   a. Create a copy with one mutation applied
   b. Run: npm run test:e2e:assignment2
   c. Check if tests pass or fail
   d. Record mutation status (killed/survived)
3. Generate JSON, HTML, text reports
4. Compute mutation score
```

### Expected Runtime

- **First run**: 10–30 minutes (depending on CPU, number of mutations)
- **Subsequent runs**: Faster with caching enabled
- **Parallelization**: Stryker can run mutations in parallel (adjust `maxTestRunnerReuses` if needed)

---

## Part 4: Interpretation & Metrics

### Mutation Score Calculation

```
Mutation Score (%) = (Mutations Killed / Total Mutations) × 100

Where:
- Killed: Tests detected the mutation (test failed on mutated code)
- Survived: Tests passed on mutated code (mutation not detected)
```

### Quality Thresholds (from stryker.conf.json)

| Threshold | Minimum Score | Assessment |
|-----------|---------------|------------|
| **High** | ≥ 80% | Excellent test effectiveness |
| **Medium** | 60–79% | Good test coverage, but gaps exist |
| **Low** | < 60% | Poor test quality, needs improvement |

### Result Interpretation

#### Example 1: Mutation Score = 91%
- **Meaning**: 91 out of 100 mutations were caught by tests
- **Assessment**: ✅ PASS — Your tests are highly effective
- **Action**: Minor improvements opportunity; consider edge cases

#### Example 2: Mutation Score = 65%
- **Meaning**: 65 out of 100 mutations were caught
- **Assessment**: ⚠️ CONDITIONAL PASS — Tests catch most defects
- **Action**: Analyze survived mutations; add edge-case tests

#### Example 3: Mutation Score = 45%
- **Meaning**: Only 45 out of 100 mutations were caught
- **Assessment**: ❌ FAIL — Tests miss significant defects
- **Action**: Major gaps; expand test cases, review test logic

### Mutation Report Structure

The HTML report (QA/test-reports/mutation/index.html) includes:

1. **Overview Page**
   - Total mutations: N
   - Killed: K
   - Survived: S
   - Overall score: K/(K+S) × 100%

2. **File-Level Breakdown**
   - Source file
   - Mutations per file
   - Individual mutation details (line, code change, status)

3. **Survived Mutations List**
   - Source code with mutation highlighted
   - Reason: no test validates this code path
   - Recommendation: add test coverage

---

## Part 5: Expected Results for Your Project

### Hypothesis

Given your risk-based, high-coverage approach:

**Expected Mutation Score: 75–90%**

### Reasoning

| Factor | Impact |
|--------|--------|
| 100% structural coverage (Assignment 2) | → Fewer safe mutations |
| API contract + UI integration tests | → Catches state/boundary mutations |
| Auth + logout tests | → Validates control flow |
| Edge-case handling (invalid credentials, archive dates) | → Catches logical mutations |
| Potential gaps | Oil-loss calculation precision, export field formatting |

### Likely Survived Mutations

High-probability mutations your tests *may not catch*:

1. **Arithmetic mutations** in oil-loss calculations (if no boundary tests)
2. **String formatting** in export functions (if no output validation)
3. **Optional chaining** (`?.`) deep in component props
4. **Default parameter values** not exercised in live API flow

### Likely Killed Mutations

High-probability mutations your tests *will catch*:

1. **Login logic**: `if (credentials) → if (!credentials)` → Test Auth-002 fails
2. **API health check**: `status === "ok" → status === "error"` → Test API-001 fails
3. **Chart rendering**: `render() → return null` → Test Chart-001 fails
4. **Oil-loss filtering**: `startDate > x → startDate < x` → Test Oil-004 fails

---

## Part 6: Integration with Research Paper

### Position in Your Paper

**Mutation Testing Results** would support your research arguments:

#### Argument 1: Risk-Based Tests Are Effective
*"We automated high-risk modules first. Mutation testing demonstrates that our 19 tests kill [X%] of mutations, validating the quality of risk-based test selection."*

#### Argument 2: Test Suite Quality Metrics
*"In addition to 100% structural coverage, our test suite achieves a mutation score of [X%], indicating robust defect detection."*

#### Argument 3: Comparison Baseline
*"Mutation score [X%] on high-risk modules (Auth, API, Charts) vs. [Y%] on lower-risk modules demonstrates the effectiveness of prioritized automation."*

### Recommended Paper Sections

**Section: "Test Suite Quality Validation"**
```
- Mutation score: [Score]%
- Mutations killed: [K] / [Total]
- Survived mutations: [S] (list top 5)
- Implications: [Qualitative assessment]
- Recommendations: [Improvements for next phase]
```

---

## Part 7: Running & Reporting

### Step 1: Run Mutation Tests

```bash
npm run mutation:test
```

**Expected Output:**
```
✓ Stryker initialized
✓ Testing mutation 1/234...
  ...
✓ Mutation score: 78.6% (184/234)
✓ Report generated: QA/test-reports/mutation/index.html
```

### Step 2: View Detailed Report

```bash
npm run mutation:test:report
```

Opens interactive HTML report with file-level drill-down.

### Step 3: Analyze Survived Mutations

From HTML report, identify mutations your tests *didn't catch*:
- Lines of code without test coverage
- Edge cases not exercised
- Logical boundary conditions

### Step 4: Document Results

Update QA/assignment-2/ASSIGNMENT-2-REPORT.md with:

```markdown
## Mutation Testing Results

| Metric | Value | Status |
|--------|-------|--------|
| Total Mutations | [N] | - |
| Mutations Killed | [K] | ✅ |
| Mutation Score | [K/(K+S)]% | PASS/CONDITIONAL/FAIL |
| Survived Top 5 | [list] | Review needed |
```

---

## Part 8: Troubleshooting

### Issue: Mutation tests run very slowly
**Solution**: Adjust `maxTestRunnerReuses` in stryker.conf.json (default: 1 = slowest, most accurate)

### Issue: Many mutations survive unexpectedly
**Solution**: Review survived mutations in HTML report → add test cases for uncovered code paths

### Issue: Test command fails or times out
**Solution**: Ensure backend is running: `npm run backend:start` (separate terminal)

### Issue: Stryker crashes with "Cannot find module"
**Solution**: Reinstall: `npm install --save-dev @stryker-mutator/core`

---

## Summary Command Reference

```bash
# Install & setup (completed)
npm install --save-dev @stryker-mutator/core

# Run mutation tests against your 19 test cases
npm run mutation:test

# View results
npm run mutation:test:report

# Check logs (if needed)
cat mutation-report.json | jq '.result'
```

---

## Next Steps for Paper

1. **Run mutation tests** → document actual mutation score
2. **Analyze survived mutations** → identify gaps
3. **Add edge-case tests** if score < 80%
4. **Include mutation score in results section** of paper
5. **Compare mutation score vs. code coverage** as validation metric


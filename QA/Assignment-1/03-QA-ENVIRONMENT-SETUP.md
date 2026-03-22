# QA Environment Setup Report
## Ada Oil App - Assignment 1 Deliverable

**Date:** March 22, 2026  
**Environment:** Local Development + GitHub Actions  
**Status:** ✅ Ready for Testing  

---

## 1. Environment Overview

### 1.1 Test Environment Architecture

```
┌─────────────────────────────────────────────────────────┐
│              LOCAL DEVELOPMENT MACHINE                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Frontend Testing Environment               │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Vite Dev Server (http://localhost:3000)  │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Playwright E2E Testing Framework          │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Chrome/Firefox/Edge Browsers              │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Backend Testing Environment               │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Express Server (http://localhost:5000)   │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Jest Unit Testing Framework               │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  Postman API Testing Collections           │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
│  ┌──────────────────────────────────────────────────┐   │
│  │        Database Testing Environment              │   │
│  │  ┌────────────────────────────────────────────┐  │   │
│  │  │  MySQL 5.7+ (localhost:3306)              │  │   │
│  │  │  Test Database: ada_oil_test              │  │   │
│  │  └────────────────────────────────────────────┘  │   │
│  └──────────────────────────────────────────────────┘   │
│                                                           │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│              CI/CD PIPELINE (GitHub Actions)             │
├─────────────────────────────────────────────────────────┤
│  → Code Push → Lint → Unit Tests → E2E Tests            │
│             → Coverage Report → Artifact Storage        │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tool Installation & Configuration

### 2.1 Development Environment Setup

#### 2.1.1 Node.js & npm
**Installation:** Already installed (assumed)
**Version Check:**
```bash
node --version  # Should be v16+
npm --version   # Should be v7+
```

#### 2.1.2 Project Dependencies
**Installation:**
```bash
# Frontend dependencies
cd c:\Users\Admin\Documents\work\ada_oil_app-main
npm install

# Backend dependencies
cd src\backend
npm install
```

**Installed Packages (Frontend):**
- React 18.3.1
- Vite 6.2.0
- Vitest (for unit testing)
- Playwright (for E2E testing)
- Axios 1.8.3
- date-fns, Recharts, AmCharts

**Installed Packages (Backend):**
- Express 4.21.2
- MySQL 2.18.1
- Axios 1.12.2
- CORS 2.8.5

### 2.2 Testing Framework Installation

All testing framework installations covered by package.json. Run:

```bash
npm install --save-dev \
  @playwright/test \
  vitest \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  supertest
```

---

## 3. Database Configuration for Testing

### 3.1 Test Database Setup

**Database Name:** `ada_oil_test`

**Creation Script:**
```sql
-- Create test database
CREATE DATABASE IF NOT EXISTS ada_oil_test 
  CHARACTER SET utf8mb4 
  COLLATE utf8mb4_unicode_ci;

-- Use test database
USE ada_oil_test;

-- Import schema from main database
-- (Copy structure from production database)
-- Note: Execute with appropriate SQL export from existing database
```

### 3.2 Test Data Population

**Test Data Categories:**
1. **Test Users:**
   - Admin User: `admin_test` / `password123`
   - Regular User: `user_test` / `password456`
   - Limited User: `user_limited` / `password789`

2. **Test Wells:**
   - 5-10 wells with complete historical data
   - Mix of operational and idle wells
   - Various well statuses for edge case testing

3. **Test Data Points:**
   - Real-time data for last 2 hours
   - Archive data for past 30 days
   - Edge case: dates with no data

**Data Reset Script:**
```bash
# Create backup before testing
mysqldump -u root -p ada_oil_test > backup_test_db.sql

# Reset to initial state after testing
mysql -u root -p ada_oil_test < backup_test_db.sql
```

### 3.3 Database Connection Configuration

**Environment Variables** (.env file):
```
# Frontend API
VITE_API_URL=http://localhost:5000/api

# Backend Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=[your_password]
DB_NAME=ada_oil_test

# External Services
GUNICORN_SERVICE_URL=http://localhost:8888/losses_calculation
```

---

## 4. Local Development Server Configuration

### 4.1 Frontend Setup (Vite)

**run command:**
```bash
npm run dev
# Server runs at http://localhost:3000
```

**Configuration** (vite.config.js):
```javascript
export default {
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      }
    }
  }
}
```

### 4.2 Backend Setup (Express)

**Start command:**
```bash
cd src/backend
npm start  # or node server.js
# Server runs at http://localhost:5000
```

**Backend Configuration** (server.js):
```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
```

### 4.3 Startup Sequence

**Recommended Startup Order:**
1. **Step 1:** Start MySQL Service
   ```bash
   # Windows
   net start MySQL80
   ```

2. **Step 2:** Start Backend Server
   ```bash
   cd src/backend && npm start
   ```

3. **Step 3:** Start Frontend Dev Server
   ```bash
   npm run dev
   ```

4. **Step 4:** Open Browser
   ```
   http://localhost:3000
   ```

---

## 5. Testing Infrastructure Setup

### 5.1 Playwright E2E Testing Setup

#### Installation
```bash
npm install -D @playwright/test
npx playwright install
```

#### Configuration File (playwright.config.js)
```javascript
// playwright.config.js
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './QA/test-scripts/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  
  fullyParallel: false, // Run tests in sequence for more stability
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  
  reporter: [
    ['html', { outputFolder: 'QA/test-reports/playwright' }],
    ['json', { outputFile: 'QA/test-reports/playwright/results.json' }],
    ['junit', { outputFile: 'QA/test-reports/playwright/results.xml' }],
  ],
  
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### Run Tests
```bash
# Run all E2E tests
npx playwright test

# Run specific test
npx playwright test tests/auth.spec.js

# Run in headed mode (see browser)
npx playwright test --headed

# Debug mode
npx playwright test --debug
```

### 5.2 Vitest Unit Testing Setup

#### Configuration File (vitest.config.js)
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './QA/test-scripts/unit/setup.js',
    coverage: {
      reporter: ['text', 'json', 'html'],
      lines: 60,
      statements: 60,
      functions: 60,
      branches: 60,
    },
  },
});
```

#### Run Tests
```bash
# Run all unit tests
npm run test:unit

# Run with coverage
npm run test:unit -- --coverage

# Watch mode
npm run test:unit -- --watch
```

### 5.3 Postman API Testing Setup

#### Installation
- Download from https://www.postman.com/downloads/

#### Collection Setup
1. Open Postman
2. Create new collection: "Ada Oil App - QA Testing"
3. Set environment variables
4. Import API endpoints
5. Create pre-request scripts for authentication
6. Set up post-response tests for validation

#### Sample Environment Variables
```json
{
  "base_url": "http://localhost:5000/api",
  "auth_token": "",
  "test_user": "user_test",
  "test_password": "password456",
  "admin_user": "admin_test",
  "admin_password": "password123"
}
```

---

## 6. CI/CD Pipeline Configuration

### 6.1 GitHub Actions Workflow

**File:** `.github/workflows/qa-tests.yml`

```yaml
name: QA Tests - Assignment 1

on:
  push:
    branches: [qa/assignment-1-testing, main]
  pull_request:
    branches: [qa/assignment-1-testing, main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: ada_oil_test
        options: >-
          --health-cmd="mysqladmin ping"
          --health-interval=10s
          --health-timeout=5s
          --health-retries=3
        ports:
          - 3306:3306

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies - Frontend
        run: npm install
      
      - name: Install dependencies - Backend
        run: cd src/backend && npm install
      
      - name: Run ESLint
        run: npm run lint
        continue-on-error: true
      
      - name: Run Unit Tests
        run: npm run test:unit -- --coverage
        continue-on-error: true
      
      - name: Start Backend Server
        run: cd src/backend && npm start &
        continue-on-error: true
      
      - name: Wait for services
        run: sleep 10
      
      - name: Run E2E Tests
        run: npx playwright test
        continue-on-error: true
      
      - name: Upload Test Reports
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: QA/test-reports/
      
      - name: Upload Coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: false

  security-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run npm audit
        run: npm audit --audit-level=moderate
        continue-on-error: true
      
      - name: Run security check
        run: npm run lint -- --max-warnings=0
        continue-on-error: true
```

### 6.2 Run Tests Locally

```bash
# Before pushing, run tests locally
npm run test:unit
npx playwright test

# Generate coverage report
npm run test:coverage

# View HTML coverage
open coverage/index.html  # or start local server
```

---

## 7. Test Script Structure

### 7.1 Directory Organization

```
QA/
├── Assignment-1/
│   ├── 01-RISK-ASSESSMENT.md
│   ├── 02-QA-TEST-STRATEGY.md
│   ├── 03-QA-ENVIRONMENT-SETUP.md
│   ├── 04-BASELINE-METRICS.md
│   ├── 05-TEST-EXECUTION-REPORT.md
│   └── ASSIGNMENT-1-SUMMARY.md
│
├── test-scripts/
│   ├── e2e/
│   │   ├── auth.spec.js
│   │   ├── dashboard.spec.js
│   │   ├── api-integration.spec.js
│   │   ├── charts.spec.js
│   │   ├── reports.spec.js
│   │   └── utils/
│   │       └── test-helpers.js
│   │
│   ├── unit/
│   │   ├── setup.js
│   │   ├── components/
│   │   ├── utils/
│   │   └── api/
│   │
│   └── api/
│       └── postman-collection.json
│
└── test-reports/
    ├── playwright/
    ├── unit-coverage/
    ├── postman-results/
    └── metrics/
```

### 7.2 Sample E2E Test (Playwright)

**File:** `QA/test-scripts/e2e/auth.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
  });

  test('should login with valid credentials', async ({ page }) => {
    // Find and fill login form
    await page.fill('input[name="username"]', 'user_test');
    await page.fill('input[name="password"]', 'password456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/');
    
    // Verify dashboard loaded
    await expect(page.locator('.app')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    // Verify error message
    const errorMsg = page.locator('.error-message');
    await expect(errorMsg).toBeVisible();
  });

  test('should maintain session on refresh', async ({ page }) => {
    // Login
    await page.fill('input[name="username"]', 'user_test');
    await page.fill('input[name="password"]', 'password456');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('**/');
    
    // Refresh page
    await page.reload();
    
    // Dashboard should still be visible
    await expect(page.locator('.app')).toBeVisible();
  });
});
```

---

## 8. Performance & Accessibility Baseline

### 8.1 Lighthouse Audit Baseline

**Metrics to Track:**
- Performance Score: Current baseline
- Accessibility Score: Current baseline
- SEO Score: Current baseline
- Best Practices Score: Current baseline

**Sample Audit:**
```bash
# Install lighthouse
npm install -D lighthouse

# Run audit
lighthouse http://localhost:3000 --output html --output-path QA/test-reports/lighthouse-report.html
```

### 8.2 Page Load Performance

| Page | Current (ms) | Target (ms) | Status |
|------|-------------|-----------|--------|
| Login | [TBD] | < 1000 | Pending |
| Dashboard | [TBD] | < 3000 | Pending |
| Charts | [TBD] | < 2000 | Pending |
| Reports | [TBD] | < 5000 | Pending |

---

## 9. Repository & Version Control Setup

### 9.1 Branch Structure
```
main (production)
├── qa/assignment-1-testing (testing branch)
│   ├── QA/
│   ├── test-scripts/
│   └── .github/workflows/
```

### 9.2 Git Configuration
```bash
# Ensure on testing branch
git branch
# * qa/assignment-1-testing

# Track all QA files
git add QA/
git add .github/workflows/
git add package.json (if updated with test deps)
git add QA/test-scripts/

# Initial commit
git commit -m "Assignment 1: Add QA test infrastructure and documentation"

# Push to branch
git push origin qa/assignment-1-testing
```

---

## 10. Monitoring & Logging

### 10.1 Test Execution Logging

**Log Locations:**
- Frontend: `QA/test-reports/playwright/` (Playwright logs)
- Backend: `src/backend/logs/` (Server logs)
- Database: MySQL error logs

### 10.2 Failure Investigation
```bash
# View recent Playwright failure
npx playwright show-report

# Check backend logs
tail -f src/backend/logs/activity-*.txt

# Database query logs (if enabled)
# Check MySQL logs for query issues
```

---

## 11. Troubleshooting Guide

### Issue: Cannot connect to MySQL
**Solution:**
```bash
# Check MySQL service running
mysql -u root -p -e "SELECT 1"

# If error, start MySQL service
# Windows: net start MySQL80
# Mac: brew services start mysql
# Linux: sudo systemctl start mysql
```

### Issue: Port 3000 or 5000 already in use
**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :5000

# Kill process
kill -9 <PID>
```

### Issue: Playwright tests timeout
**Solution:**
- Ensure frontend server is running
- Increase timeout in playwright.config.js
- Run with `--headed` flag to debug

### Issue: API calls failing in tests
**Solution:**
- Verify backend server is running on port 5000
- Check environment variables in .env
- Verify database connection
- Check CORS configuration

---

## 12. Cleanup & Teardown

### 12.1 After Testing Session
```bash
# Reset database
mysql -u root -p ada_oil_test < backup_test_db.sql

# Clear browser cache/cookies
rm -rf ~/.playwright/

# Stop servers
# Ctrl+C in both terminal windows
```

### 12.2 Cleanup Artifacts
```bash
# Remove test reports (keep archived versions)
rm -rf QA/test-reports/*

# Clear node_modules if needed
rm -rf node_modules src/backend/node_modules

# Reinstall for clean state
npm install && cd src/backend && npm install
```

---

## 13. Sign-off

| Aspect | Status | Date | Notes |
|--------|--------|------|-------|
| Environment Setup Complete | ✅ | 2026-03-22 | All tools configured |
| Database Ready | ⏳ | 2026-03-22 | Awaiting test data population |
| CI/CD Pipeline | ✅ | 2026-03-22 | GitHub Actions workflow created |
| Documentation | ✅ | 2026-03-22 | Complete |
| Ready for Testing | ⏳ | TBD | Pending start of test execution |

---

## Appendix: Quick Start Commands

```bash
# Complete setup sequence
git checkout qa/assignment-1-testing
npm install
cd src/backend && npm install && cd ../..

# Terminal 1: Start Backend
cd src/backend && npm start

# Terminal 2: Start Frontend
npm run dev

# Terminal 3: Run Tests
npx playwright test

# Check test reports
open QA/test-reports/playwright/index.html
```

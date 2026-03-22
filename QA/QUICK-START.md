# Quick Start Guide - Running QA Tests
## Ada Oil App - Assignment 1 Testing Infrastructure

---

## 🚀 5-Minute Setup

### Step 1: Ensure Dependencies are Installed
```bash
cd c:\Users\Admin\Documents\work\ada_oil_app-main
npm install
cd src\backend
npm install
cd ..\..\

# Install Playwright browsers
npx playwright install
```

### Step 2: Start Services (In Separate Terminal Windows)

**Terminal 1 - Backend Server:**
```bash
cd src\backend
npm start
# Output: Server running at http://localhost:5000
```

**Terminal 2 - Frontend Server:**
```bash
npm run dev
# Output: http://localhost:3000
```

**Terminal 3 - Run Tests:**
```bash
# Wait for services to start (10 seconds), then:
npx playwright test
```

---

## 📊 Running Tests

### Run All E2E Tests
```bash
npx playwright test
```

### Run Specific Test File
```bash
# Just authentication tests
npx playwright test QA/test-scripts/e2e/auth.spec.js

# Just API integration tests  
npx playwright test QA/test-scripts/e2e/api-integration.spec.js

# Just chart tests
npx playwright test QA/test-scripts/e2e/charts.spec.js
```

### Run in Headed Mode (See Browser)
```bash
npx playwright test --headed
```

### Run with UI Mode (Debug)
```bash
npx playwright test --ui
```

### Run Single Test
```bash
npx playwright test -g "should login with valid credentials"
```

### Generate HTML Report
```bash
npx playwright show-report
```

---

## 📈 Test Reports & Results

After running tests, view results:

```bash
# View Playwright HTML report
npx playwright show-report QA/test-reports/playwright

# View test results JSON
cat QA/test-reports/playwright/results.json

# View test logs
cat QA/test-reports/logs/backend.log
cat QA/test-reports/logs/vite.log
```

---

## 🔍 Debugging Failed Tests

### See Browser During Test
```bash
npx playwright test --headed --workers=1
```

### Debug Specific Test
```bash
npx playwright test --debug -g "test name"
```

### Check Backend Logs
```bash
# If backend crashes, check:
cd src/backend && npm start
# Watch for error messages
```

### Check Frontend Logs  
```bash
# Browser console errors appear when running with --headed
npx playwright test --headed
```

---

## 📋 Test Scenarios Reference

### Authentication Tests (TS-Auth series)
- **TS-Auth-001:** Valid login → Dashboard access
- **TS-Auth-002:** Invalid credentials → Error message
- **TS-Auth-003:** Session persistence → Refresh resilience
- **TS-Auth-004:** Logout → Session clearing

### API Integration Tests (TS-API series)
- **TS-API-001:** Fetch well list → Returns array
- **TS-API-002:** Fetch well details → Returns object
- **TS-API-003:** Real-time data → 2-hour fetch
- **TS-API-004:** Archive data → Date-range fetch
- **TS-API-005:** Error handling → Graceful failures

### Chart Tests (TS-Chart series)
- **TS-Chart-001:** Chart rendering → SVG/Canvas visible
- **TS-Chart-002:** Data accuracy → Values match source
- **TS-Chart-003:** Mode switching → Chart updates
- **TS-Chart-004:** Date selection → New data loads

---

## 🐛 Common Issues & Solutions

### Port Already in Use

```bash
# Find process on port 3000
netstat -ano | findstr :3000

# Kill process (Windows)
taskkill /PID <process_id> /F

# Or use different port
npm run dev -- --port 3001
```

### MySQL Connection Failed

```bash
# Check if MySQL is running (Windows)
net start | findstr MySQL

# Start MySQL if needed
net start MySQL80

# Or restart MySQL
net stop MySQL80
net start MySQL80
```

### Playwright Timeout

```bash
# Increase timeout in Playwright config or command line
npx playwright test --timeout 60000  # 60 seconds

# Or run with more logging
npx playwright test --headed --workers=1
```

### API Endpoint Not Found

```bash
# Verify backend is running
curl http://localhost:5000/api/wells

# Check backend logs for errors
# If 404, verify endpoints are implemented
```

---

## 📊 Viewing Test Coverage

### Unit Test Coverage (When Available)
```bash
npm run test:unit -- --coverage
open coverage/index.html  # View coverage report
```

### View Code Quality
```bash
npm run lint
```

---

## 🔄 CI/CD Testing (GitHub Actions)

Tests run automatically when you push:

```bash
# Push to testing branch to trigger tests
git push origin qa/assignment-1-testing

# View results
# → Go to GitHub Actions
# → Select "QA Tests" workflow
# → See results and artifacts
```

---

## 📝 Test Data

### Test Credentials
```
Username: user_test
Password: password456

Admin Username: admin_test
Admin Password: password123
```

### Test Wells
- Well IDs are in test database
- Verify via API: `http://localhost:5000/api/wells`

### Reset Test Database
```bash
# Restore from backup
mysql -u root -p ada_oil_test < backup_test_db.sql
```

---

## ✅ Success Indicators

When tests run successfully, you should see:

```bash
✓ TS-Auth-001: should login with valid credentials (2.5s)
✓ TS-Auth-002: should reject invalid credentials (1.8s)
✓ TS-Auth-003: should maintain session on page refresh (3.2s)
✓ TS-Auth-004: should logout and clear session (2.1s)
✓ TS-API-001: should fetch well list successfully (1.5s)
...
13 passed (45.2s)
```

---

## 📊 Advanced Testing Options

### Parallel Test Execution
```bash
# Run tests in parallel (2 workers)
npx playwright test --workers=2
```

### Test-Specific Filters
```bash
# Run only tests matching pattern
npx playwright test -g "login"

# Run excluding pattern
npx playwright test --grep-invert "performance"
```

### Output Report Formats
```bash
# JSON output
npx playwright test --reporter=json

# JUnit (for CI/CD)
npx playwright test --reporter=junit

# Verbose output
npx playwright test --reporter=verbose
```

---

## 📚 Documentation Links

- **Quick Overview:** `QA/README.md`
- **Risk Assessment:** `QA/Assignment-1/01-RISK-ASSESSMENT.md`
- **Test Strategy:** `QA/Assignment-1/02-QA-TEST-STRATEGY.md`
- **Environment Setup:** `QA/Assignment-1/03-QA-ENVIRONMENT-SETUP.md`
- **Baseline Metrics:** `QA/Assignment-1/04-BASELINE-METRICS.md`
- **Test Scripts:** `QA/test-scripts/e2e/`
- **Submission Summary:** `QA/Assignment-1/SUBMISSION-SUMMARY.md` (this file)

---

## 🎯 Next Steps

1. **Start Services:** Backend + Frontend (2 terminals)
2. **Run Tests:** `npx playwright test`
3. **Review Results:** Check test report
4. **Debug if Needed:** Use `--headed` flag
5. **Commit Results:** Document findings

---

## 📞 Help & Support

### For Issues:
1. Check troubleshooting section above
2. Review environment setup documentation
3. Check backend/frontend logs
4. Verify database connection

### For Test Questions:
1. Review specific test file: `QA/test-scripts/e2e/*.spec.js`
2. Check test documentation: `QA/Assignment-1/02-QA-TEST-STRATEGY.md`
3. Reference test helpers: `QA/test-scripts/e2e/utils/test-helpers.js`

---

**Last Updated:** March 22, 2026  
**Status:** Ready for Week 2 Execution  
**Next:** Manual test execution (March 27-30, 2026)

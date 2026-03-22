# QA Test Strategy Document
## Ada Oil App - Assignment 1 Deliverable

**Document Version:** 1.0  
**Date:** March 2026  
**Prepared for:** Assignment 1 - QA Landscape & Planning  

---

## 1. Project Scope & Objectives

### 1.1 Scope
This QA test strategy covers the Ada Oil App - a web-based IoT monitoring system for the oil industry. The system includes:
- React-based frontend dashboard
- Express backend API
- MySQL database
- Multiple data visualization modules
- User authentication and authorization

### 1.2 Objectives
1. **Quality Assurance:** Ensure system meets functional and non-functional requirements
2. **Risk Mitigation:** Focus testing on high-risk areas identified in risk assessment
3. **Process Documentation:** Capture test processes for research paper
4. **Test Infrastructure:** Establish CI/CD pipeline for continuous testing
5. **Baseline Metrics:** Collect initial coverage and defect data

---

## 2. Risk Assessment Summary

### 2.1 High-Risk Areas (Priority 1)
From Risk Assessment Document:
- User Authentication System (Risk Score: 10/10)
- API Integration & Data Fetching (Risk Score: 9/10)
- Chart Data Visualization (Risk Score: 8.5/10)
- Budget Calculation Service (Risk Score: 8/10)
- Report Generation (Risk Score: 7.5/10)

### 2.2 Risk-Based Test Prioritization
```
Priority 1: Authentication & API Integration (40% of test effort)
Priority 2: Data Visualization & Reports (35% of test effort)
Priority 3: User Permissions & UI (15% of test effort)
Priority 4: Edge Cases & Performance (10% of test effort)
```

---

## 3. Test Approach

### 3.1 Testing Levels & Strategy

#### 3.1.1 Unit Testing
**Scope:** Individual functions and components
**Tools:** Vitest (for React components), Jest (for backend)
**Coverage Target:** 60% of critical functions
**Status:** Not yet implemented - can be added to CI/CD

**Test Categories:**
- Data transformation functions (Chart.jsx, AmChart.jsx)
- API utility functions (wellService.js)
- Date handling functions
- Permission validation functions

#### 3.1.2 Integration Testing
**Scope:** Component-to-component and frontend-to-backend
**Tools:** Playwright, Postman, MongoDB Stitch for API testing
**Coverage Target:** 80% of API endpoints

**Test Categories:**
- Frontend API calls ↔ Backend responses
- Database queries and data integrity
- External service integration (Gunicorn)
- Report generation with data accuracy
- Authentication flow with session management

#### 3.1.3 System Testing
**Scope:** End-to-end user workflows
**Tools:** Playwright, Manual testing
**Coverage Target:** 85% of critical user flows

**Test Categories:**
- User login and dashboard access
- Well data viewing and filtering
- Report generation and export
- Data visualization accuracy
- Admin user management

#### 3.1.4 Manual Testing
**Scope:** UI/UX, edge cases, exploratory testing
**Coverage Target:** 100% of high-risk components
**Test Approach:** Exploratory and scenario-based

**Test Categories:**
- Login scenarios (valid/invalid credentials)
- Data search and filtering
- Chart interactivity
- Export functionality
- Error handling and user feedback
- Browser compatibility

#### 3.1.5 Performance Testing
**Scope:** System responsiveness under load
**Tools:** Lighthouse, JMeter (future)
**Metrics:** Response times, load times

**Initial Performance Baselines:**
- Dashboard load time: < 3 seconds
- Chart rendering: < 1 second
- API response time: < 500ms for nominal queries
- Report generation: < 5 seconds

#### 3.1.6 Security Testing
**Scope:** Authentication, authorization, data protection
**Tools:** OWASP ZAP (future), Manual testing

**Focus Areas:**
- SQL injection vulnerabilities in API
- XSS vulnerabilities in data display
- Authentication bypass attempts
- Unauthorized data access
- Session hijacking prevention

### 3.2 Test Phases

#### Phase 1: Environment Setup & Baseline (Days 1-3)
- Install testing tools and frameworks
- Configure test environment
- Set up CI/CD pipeline
- Create test data
- Establish baseline metrics

#### Phase 2: Manual Testing - Critical Path (Days 4-6)
- Manual testing of Priority 1 components
- Test user authentication workflows
- API endpoint validation
- Data visualization accuracy
- Error scenario validation

#### Phase 3: Automated Testing Setup (Days 7-8)
- Create automated test scripts
- Set up Playwright for E2E tests
- Configure API testing
- Integrate tests into CI/CD

#### Phase 4: Test Execution & Analysis (Days 9-11)
- Execute manual test suite
- Run automated tests
- Collect defect data
- Analyze coverage metrics
- Document findings

#### Phase 5: Regression & Final Checks (Days 12-14)
- Regression testing
- Cross-browser testing
- Report generation
- Metrics compilation
- Documentation completion

---

## 4. Tool Selection & Configuration

### 4.1 Frontend Testing Tools

#### 4.1.1 Playwright
**Purpose:** E2E testing, browser automation, cross-browser testing
**Version:** Latest stable
**Configuration:** 
- Headless mode for CI/CD
- Multiple browsers: Chrome, Firefox, Edge
- Screenshot/video capture on failure

**Installation:**
```bash
npm install -D @playwright/test
npx playwright install
```

**Use Cases:**
- User login and authentication flows
- Chart interaction and data loading
- Report generation workflows
- Navigation and routing

#### 4.1.2 Vitest  
**Purpose:** Unit testing for React components
**Version:** Latest
**Configuration:**
- JSX support enabled
- Coverage reporting
- Watch mode for development

**Installation:**
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Use Cases:**
- Component rendering tests
- Props validation
- State management tests
- Event handler tests

### 4.2 Backend Testing Tools

#### 4.2.1 Postman
**Purpose:** API endpoint testing, contract testing, regression testing
**Version:** Latest
**Configuration:**
- Collections organized by resource
- Pre-request scripts for auth tokens
- Post-response validation

**Setup Approach:**
- Import API endpoints from OpenAPI/Swagger (if available)
- Create request templates
- Set up environment variables (localhost vs staging)

#### 4.2.2 Jest
**Purpose:** Backend unit and integration testing
**Version:** Latest
**Configuration:**
- CommonJS module support for Node backend
- Coverage thresholds: 60% minimum

**Installation:**
```bash
npm install -D jest
```

**Use Cases:**
- Server route testing
- Database query testing
- Utility function testing
- Authentication middleware testing

### 4.3 Performance & Quality Tools

#### 4.3.1 Lighthouse
**Purpose:** Performance, accessibility, best practices auditing
**Run:** Built-in Chrome DevTools

**Metrics to Track:**
- Performance Score
- Accessibility Score
- SEO Score
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)

#### 4.3.2 ESLint & Prettier
**Purpose:** Code quality, consistency
**Already Configured:** Yes (in package.json)
**Configuration:** `eslint.config.js`

### 4.4 CI/CD Platform

#### 4.4.1 GitHub Actions
**Purpose:** Automated test execution on commits
**Configuration:** `.github/workflows/test.yml`

**Workflow:**
1. Trigger on push/PR
2. Install dependencies
3. Run linting
4. Run unit tests
5. Run E2E tests
6. Generate coverage reports
7. Post results

---

## 5. Test Scenarios & Cases

### 5.1 Critical Test Scenarios (Priority 1)

#### 5.1.1 Authentication Test Scenarios

**TS-Auth-001: Successful Login**
- Precondition: Application is loaded
- Steps: Enter valid username/password → Click login
- Expected: Dashboard loads, user session created
- Risk Level: CRITICAL

**TS-Auth-002: Invalid Credentials**
- Precondition: Application is loaded
- Steps: Enter invalid credentials → Click login
- Expected: Error message displayed, login page retained
- Risk Level: CRITICAL

**TS-Auth-003: Session Persistence**
- Precondition: User logged in
- Steps: Refresh page → Execute protected operations
- Expected: Session maintained, operations succeed
- Risk Level: HIGH

**TS-Auth-004: Logout Functionality**
- Precondition: User logged in
- Steps: Click logout → Try to access protected page
- Expected: Redirected to login, session cleared
- Risk Level: HIGH

#### 5.1.2 Data Fetching Test Scenarios

**TS-API-001: Fetch Well List**
- API: GET /api/wells
- Expected: Returns array of wells with valid structure
- Validation: Check data types, required fields
- Error Handling: Handle connection timeout
- Risk Level: CRITICAL

**TS-API-002: Fetch Well Details**
- API: GET /api/well/:id
- Expected: Returns single well with complete data
- Validation: Verify all required fields present
- Error Handling: Handle invalid well ID
- Risk Level: CRITICAL

**TS-API-003: Fetch Real-Time Data (2-Hours)**
- API: GET /api/fetch2Hours
- Expected: Returns recent data points
- Validation: Verify data recency and accuracy
- Error Handling: Graceful failure with user message
- Risk Level: HIGH

**TS-API-004: Fetch Archive Data**
- API: GET /api/fetch2HoursArchive
- Expected: Returns data for specified date range
- Validation: Verify date filtering, data accuracy
- Error Handling: Handle invalid dates, no data scenarios
- Risk Level: HIGH

#### 5.1.3 Chart Data Visualization Test Scenarios

**TS-Chart-001: Chart Data Loading**
- Precondition: AppLayout dashboard loaded
- Steps: Wait for data load → Verify chart displays
- Expected: Chart renders with correct data points
- Data Validation: Compare dashboard values with source data
- Risk Level: HIGH

**TS-Chart-002: Chart Data Accuracy**
- Precondition: Chart displaying data
- Steps: Verify values in chart → Cross-reference API data
- Expected: Chart values match API source data exactly
- Risk Level: HIGH

**TS-Chart-003: Chart Mode Switching**
- Precondition: Chart with data loaded
- Steps: Switch between chart modes (oil/liquid)
- Expected: Chart updates with correct data for selected mode
- Risk Level: MEDIUM

**TS-Chart-004: Date Range Selection**
- Precondition: Archive mode enabled
- Steps: Select past date → View archive data
- Expected: Chart updates with historical data for selected date
- Risk Level: MEDIUM

### 5.2 Report Generation Test Scenarios

**TS-Report-001: CHRP Report Export**
- Precondition: CHRP data available
- Steps: Select date range → Click export to Excel
- Expected: Excel file generated with correct data and formatting
- Validation: Check column headers, data accuracy, formatting
- Risk Level: HIGH

**TS-Report-002: AGZU Report Export**
- Precondition: AGZU data available
- Steps: Select well and date range → Export
- Expected: Excel file with AGZU data
- Validation: Data accuracy, format compliance
- Risk Level: HIGH

**TS-Report-003: No Data Export**
- Precondition: Date range with no data
- Steps: Try to export report for empty date range
- Expected: User-friendly error message, no file generated
- Risk Level: MEDIUM

### 5.3 User Permissions Test Scenarios

**TS-Perm-001: Admin Access**
- Precondition: Admin user logged in
- Steps: Navigate to /admin/users
- Expected: Admin panel loads, user management visible
- Risk Level: MEDIUM

**TS-Perm-002: Non-Admin Restriction**
- Precondition: Regular user logged in
- Steps: Try to access /admin/users
- Expected: Redirected to dashboard, error message shown
- Risk Level: HIGH

**TS-Perm-003: Well Access Control**
- Precondition: User with limited well access
- Steps: Try to access unauthorized well data
- Expected: Page loads but well restricted, error on API call
- Risk Level: MEDIUM

---

## 6. Test Data Requirements

### 6.1 Test Data Sets
1. **Valid Test Wells:** 5 wells with complete historical data
2. **Invalid Test Scenarios:** Wells with missing/malformed data
3. **Edge Cases:** Empty date ranges, extremely large datasets
4. **User Accounts:** 
   - Admin user: login/password for admin testing
   - Regular user: login/password for permission testing
   - Guest account: for access control testing

### 6.2 Data Reset Procedures
- Database backup before and after testing
- Test data rollback script
- Clear session/cache between test runs

---

## 7. Success Criteria & Acceptance Rules

### 7.1 Pass/Fail Criteria

#### Authentication Testing
- ✅ All login scenarios execute without errors
- ✅ Invalid credentials properly rejected
- ✅ Session persists across page refreshes
- ✅ Logout clears all session data

#### API Testing
- ✅ All critical endpoints respond within 500ms
- ✅ All endpoints return correct data schema
- ✅ Error responses properly formatted
- ✅ 95%+ API endpoint availability

#### Data Visualization
- ✅ Charts render without errors
- ✅ Data in charts matches source data
- ✅ Chart interactions responsive
- ✅ Zoom/pan functions work correctly

#### Report Generation
- ✅ Reports generate without errors
- ✅ Excel files open without corruption
- ✅ All required columns present
- ✅ Data accuracy ≥ 99%

### 7.2 Coverage Targets
- **Code Coverage:** Minimum 60% for critical paths
- **API Coverage:** 85% of endpoints with integration tests
- **Component Coverage:** 100% of high-risk components
- **Test Case Completion:** 90% of planned test cases executed

---

## 8. Defect Management

### 8.1 Defect Classification

**Severity Levels:**
- **Critical:** System unavailable, data loss, security breach
- **High:** Major feature broken, data incorrect
- **Medium:** Minor feature issue, workaround exists
- **Low:** Cosmetic, UI inconsistency

**Priority Levels:**
- **P1:** Fix immediately (blocks testing)
- **P2:** Fix before release
- **P3:** Fix in next iteration
- **P4:** Review for future release

### 8.2 Defect Reporting Template
```
Title: [Summary]
System: Ada Oil App
Component: [Module Name]
Severity: [Critical/High/Medium/Low]
Priority: [P1/P2/P3/P4]
Status: [New/Assigned/In Progress/Resolved/Closed]
Preconditions: [Steps to reproduce]
Expected Result: [What should happen]
Actual Result: [What actually happened]
Screenshots/Logs: [Attachments]
Assigned To: [QA Engineer]
Target Resolution Date: [Date]
```

### 8.3 Defect Tracking
- **Tool:** GitHub Issues (free, integrated)
- **Workflow:** New → Assigned → In Progress → Resolved → Verified
- **Tracking Metrics:** Total bugs, by severity, open/closed ratio

---

## 9. Planned Metrics

### 9.1 Test Coverage Metrics
- Lines of code covered by tests
- Branch coverage percentage  
- Critical path coverage
- API endpoint coverage

### 9.2 Defect Metrics
- Total defects found
- Defect density (defects per 1000 LOC)
- Defects by severity/component
- Escape rate (defects found in production)
- MTBF (Mean Time Between Failures)

### 9.3 Testing Effort Metrics
- Test case execution rate (cases/hour)
- Test case pass/fail ratio
- Time to execute full test suite
- Test creation vs execution time ratio

### 9.4 Quality Metrics
- Code quality score (ESLint)
- Accessibility score (Lighthouse)
- Performance score (Lighthouse)
- Reliability metrics (uptime, availability)

### 9.5 Baseline Metrics (Initial Collection)
- Baseline defect count: [To be collected]
- Baseline coverage: [To be collected]
- Baseline performance: [To be collected]. These serve as comparison points for future iterations

---

## 10. Documentation & Reporting

### 10.1 Test Plan Artifacts
- Test scenarios and cases (this document)
- Test execution logs
- Defect reports
- Coverage reports
- Performance reports
- Screenshots/videos

### 10.2 Research Paper Contribution
This test strategy document will be included as **Chapter 3: Test Strategy & Environment Setup** in the final research paper, covering:
- Testing methodology
- Tool selection rationale
- Initial test results
- Metrics collection approach

### 10.3 Deliverables Timeline
- **End of Week 1:** Risk assessment + test strategy (COMPLETED)
- **End of Week 2:** Test environment setup + baseline metrics
- **Final:** Complete test execution report + research paper draft

---

## 11. Sign-off & Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| QA Lead | Single Developer | 2026-03-22 | ✓ |
| PM | Course Instructor | [TBD] | |
| Stakeholder | Instructor | [TBD] | |

---

## Appendix A: Test Scenario Mapping to Risk Areas

| Risk Area | Test Scenarios | Coverage % |
|-----------|-----------------|-----------|
| Authentication | TS-Auth-001 to 004 | 100% |
| API Integration | TS-API-001 to 004 | 85% |
| Chart Visualization | TS-Chart-001 to 004 | 90% |
| Report Generation | TS-Report-001 to 003 | 85% |
| User Permissions | TS-Perm-001 to 003 | 80% |

---

## Appendix B: Test Environment Requirements

### Hardware
- Minimum: 4GB RAM, 10GB disk space
- Recommended: 8GB RAM, SSD, 20GB disk space

### Software
- Node.js 16+ (for backend/tooling)
- npm 7+ or yarn
- MySQL 5.7+ or MariaDB
- Modern browser (Chrome, Firefox, Edge)
- Git for version control

### Network
- Localhost connectivity
- External service access (if testing with real Gunicorn)
- No specific internet requirements

### Database
- Test database with sample data
- Backup/restore scripts
- Data reset procedures

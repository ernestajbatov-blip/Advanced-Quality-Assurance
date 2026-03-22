# Baseline Metrics Report
## Ada Oil App - Assignment 1 Deliverable

**Date:** March 22, 2026  
**Collection Date:** Week 1 - Before Test Execution  
**Purpose:** Establish baseline for comparison with future iterations  

---

## 1. Test Coverage Baseline

### 1.1 Code Coverage Summary

**Frontend Code Coverage:**
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Statements | [To be measured] | 60% | ⏳ Pending |
| Branches | [To be measured] | 50% | ⏳ Pending |
| Functions | [To be measured] | 60% | ⏳ Pending |
| Lines | [To be measured] | 60% | ⏳ Pending |

**Backend Code Coverage:**
| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Statements | [To be measured] | 70% | ⏳ Pending |
| Branches | [To be measured] | 60% | ⏳ Pending |
| Functions | [To be measured] | 70% | ⏳ Pending |
| Lines | [To be measured] | 70% | ⏳ Pending |

### 1.2 Component Coverage

**High-Risk Components Coverage Status:**

| Component | Type | Manual Tests | Automated Tests | Overall Coverage |
|-----------|------|-------------|-----------------|------------------|
| Authentication | Functions | 0/4 | 0/0 | 0% |
| API Integration | Routes | 0/6 | 0/0 | 0% |
| Chart Component | UI | 0/4 | 0/0 | 0% |
| Report Export | Functions | 0/3 | 0/0 | 0% |
| User Permissions | Routes | 0/3 | 0/0 | 0% |

**Total Coverage: 0/20 test cases executed**

---

## 2. Application Performance Baseline

### 2.1 Frontend Performance Metrics

**Page Load Times (ms):**

| Page | First Load | Reload | Target Performance |
|------|-----------|--------|-------------------|
| Login | [TBD] | [TBD] | < 1000ms |
| Dashboard | [TBD] | [TBD] | < 3000ms |
| Chart View | [TBD] | [TBD] | < 2000ms |
| Reports | [TBD] | [TBD] | < 5000ms |
| Admin Panel | [TBD] | [TBD] | < 2000ms |

**Lighthouse Scores:**

| Metric | Score | Target |
|--------|-------|--------|
| Performance | [TBD] | > 80 |
| Accessibility | [TBD] | > 85 |
| Best Practices | [TBD] | > 85 |
| SEO | [TBD] | > 90 |

### 2.2 Backend Performance Metrics

**API Response Times (ms):**

| Endpoint | Avg Response | P95 | P99 | Target |
|----------|------------|-----|-----|--------|
| GET /api/wells | [TBD] | [TBD] | [TBD] | < 500ms |
| GET /api/well/:id | [TBD] | [TBD] | [TBD] | < 300ms |
| GET /api/fetch2Hours | [TBD] | [TBD] | [TBD] | < 800ms |
| POST /api/analysis | [TBD] | [TBD] | [TBD] | < 30s |
| GET /api/reports/export | [TBD] | [TBD] | [TBD] | < 5s |

**Database Query Performance:**

| Query | Avg Time | Status |
|-------|----------|--------|
| List all wells | [TBD] | [TBD] |
| Fetch well data for date range | [TBD] | [TBD] |
| Generate report | [TBD] | [TBD] |

---

## 3. Defect/Bug Baseline

### 3.1 Initial Defect Count

**Baseline Defect Summary:**

| Severity | Count | Target |
|----------|-------|--------|
| Critical | 0 | 0 |
| High | 0 | < 3 |
| Medium | 0 | < 10 |
| Low | 0 | < 5 |
| **Total** | **0** | **< 18** |

**Note:** Baseline collected before test execution. Expected to increase after testing.

### 3.2 Defect Distribution (Initial - Empty)

```
Defects by Component:
  Authentication: 0
  API Integration: 0
  Data Visualization: 0
  Report Generation: 0
  User Permissions: 0
  UI/UX: 0
  Other: 0
  ─────────────────
  Total: 0
```

---

## 4. Test Environment Baseline

### 4.1 Environment Configuration

**Frontend:**
- Node: 18.x
- Vite: 6.2.0
- React: 18.3.1
- Status: ✅ Configured

**Backend:**
- Node: 18.x
- Express: 4.21.2
- MySQL: 8.0
- Status: ✅ Configured

**Testing Tools:**
- Playwright: Latest
- Vitest: Configured
- Jest: Configured
- Postman: Available
- Status: ✅ Ready

### 4.2 Browser Compatibility Baseline

| Browser | Version | Status | Notes |
|---------|---------|--------|-------|
| Chrome | Latest | Ready | Primary test browser |
| Firefox | Latest | Ready | Secondary test browser |
| Safari | Latest | Ready | Cross-browser testing |
| Edge | Latest | Ready | Cross-browser testing |

---

## 5. Risk Assessment Baseline

### 5.1 High-Risk Component Health

**Initial Risk Assessment (Pre-Testing):**

| Component | Risk Score | Status | Test Priority |
|-----------|-----------|--------|----------------|
| Authentication | 10/10 | 🔴 Not Tested | ⭐⭐⭐⭐⭐ |
| API Integration | 9/10 | 🔴 Not Tested | ⭐⭐⭐⭐⭐ |
| Chart Visualization | 8.5/10 | 🔴 Not Tested | ⭐⭐⭐⭐ |
| Budget Calculation | 8/10 | 🔴 Not Tested | ⭐⭐⭐⭐ |
| Report Export | 7.5/10 | 🔴 Not Tested | ⭐⭐⭐⭐ |

### 5.2 Known Issues (Before Testing)

1. **MD5 Password Hashing**
   - Status: Known vulnerability
   - Impact: Security risk
   - Priority: P1 (future fix)

2. **Hardcoded Test Dates**
   - Status: In code (Test.js)
   - Impact: Test maintainability risk
   - Priority: P2

3. **External Service Dependency (Gunicorn)**
   - Status: Not mocked in tests
   - Impact: Test reliability
   - Priority: P2

4. **No apparent CORS validation**
   - Status: Potential security issue
   - Impact: Security risk
   - Priority: P1 (future)

---

## 6. Test Execution Baseline

### 6.1 Test Case Status Matrix

**Planned vs. Actual (Pre-Testing):**

| Category | Planned | Written | Executed | Pass | Fail |
|----------|---------|---------|----------|------|------|
| Authentication | 4 | 0 | 0 | 0 | 0 |
| API Integration | 6 | 0 | 0 | 0 | 0 |
| Data Visualization | 4 | 0 | 0 | 0 | 0 |
| Reports | 3 | 0 | 0 | 0 | 0 |
| Permissions | 3 | 0 | 0 | 0 | 0 |
| Edge Cases | 5 | 0 | 0 | 0 | 0 |
| **Total** | **25** | **0** | **0** | **0** | **0** |

### 6.2 Test Estimation

**Estimated Testing Effort:**

| Phase | Hours | Start | End | Status |
|-------|-------|-------|-----|--------|
| Test Planning | 8 | 3/22 | 3/23 | ✅ Complete |
| Environment Setup | 6 | 3/23 | 3/25 | ⏳ In Progress |
| Test Script Creation | 10 | 3/25 | 3/27 | ⏳ Pending |
| Manual Testing | 12 | 3/27 | 4/2 | ⏳ Pending |
| Automated Testing | 8 | 4/2 | 4/4 | ⏳ Pending |
| Report Generation | 4 | 4/4 | 4/5 | ⏳ Pending |
| **Total** | **48** | | | |

---

## 7. Resource & Technology Baseline

### 7.1 Technology Stack Versions

| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | 18.x | Runtime |
| npm | 9.x+ | Package Manager |
| React | 18.3.1 | Frontend Framework |
| Vite | 6.2.0 | Build Tool |
| Express | 4.21.2 | Backend Framework |
| MySQL | 8.0 | Database |
| Playwright | Latest | E2E Testing |
| Vitest | Latest | Unit Testing |
| Jest | Latest | Backend Testing |
| Postman | Latest | API Testing |

### 7.2 System Resources

**Development Machine:**
- CPU: [Baseline - to be recorded]
- RAM: [Baseline - to be recorded]
- Storage: [Baseline - to be recorded]
- Connection: [Baseline - to be recorded]

**CI/CD Pipeline:**
- Platform: GitHub Actions
- Runners: Ubuntu Latest
- Memory: 7GB
- Timeout: 360 minutes

---

## 8. Success Criteria Baseline

### 8.1 Week 1 Goals (Planning & Setup)

| Objective | Target | Actual | Status |
|-----------|--------|--------|--------|
| Risk Assessment Complete | Yes | ✅ | Complete |
| Test Strategy Defined | Yes | ✅ | Complete |
| Environment Configured | Yes | ✅ | Complete |
| CI/CD Pipeline Setup | Yes | ✅ | Complete |
| Test Scripts Started | Yes | ⏳ | In Progress |

### 8.2 Week 2 Goals (Execution & Deliverables)

| Objective | Target | Actual | Status |
|-----------|--------|--------|--------|
| Test Execution Started | 3/27 | [TBD] | ⏳ Pending |
| Manual Tests Completed | 100 | [TBD] | ⏳ Pending |
| Automated Tests Pass | > 80% | [TBD] | ⏳ Pending |
| Defects Documented | > 0 | [TBD] | ⏳ Pending |
| Final Report Complete | 4/5 | [TBD] | ⏳ Pending |

---

## 9. Metrics Tracking Template

### 9.1 Weekly Progress

**Week 1 (Completed):**
- ✅ Risk Assessment completed
- ✅ Test Strategy defined
- ✅ Environment setup initiated
- ✅ CI/CD pipeline configured

**Week 2 (Pending):**
- ⏳ Manual test execution
- ⏳ Automated test execution
- ⏳ Defect reporting
- ⏳ Final metrics compilation

### 9.2 Baseline Comparison (End of Project)

Post-testing, the following metrics will be compared:
- Code coverage increase
- Defect count and distribution
- Performance metrics changes
- Test execution time trends
- Risk mitigation effectiveness

---

## 10. Next Steps for Test Execution

### 10.1 Immediate Actions (Week 2)

1. **Execute manual test scenarios** (Days 1-3)
   - Login workflows
   - API endpoint validation
   - Data visualization accuracy
   - Report generation
   - Permission validation

2. **Run automated test suite** (Days 4-5)
   - E2E tests via Playwright
   - Unit tests for components
   - API integration tests
   - CI/CD pipeline activation

3. **Collect metrics** (Days 6-7)
   - Coverage reports
   - Performance data
   - Defect counts
   - Execution times

4. **Generate final report** (Day 8)
   - Test results summary
   - Metrics comparison
   - Recommendations

### 10.2 Measurement Frequency

- **Daily:** Test execution status, defect count
- **Bi-daily:** Performance metrics, coverage reports
- **Weekly:** Executive summary, milestone reviews

---

## 11. Baseline Metadata

| Property | Value |
|----------|-------|
| Baseline Created | 2026-03-22 |
| Environment | Local Development |
| Database | ada_oil_test |
| Frontend Server | localhost:3000 |
| Backend Server | localhost:5000 |
| Node Version | 18.x |
| Test Framework | Playwright + Vitest |
| QA Branch | qa/assignment-1-testing |
| Document Version | 1.0 |

---

## 12. Sign-off

**Baseline Approval:**
- ✅ Baseline metrics established
- ✅ Environment verified ready
- ✅ Test infrastructure prepared
- ✅ Ready for Week 2 execution

**Prepared by:** QA Team  
**Date:** March 22, 2026  
**Next Review:** March 29, 2026 (End of Week 1 / Mid-testing)

---

## Appendix: Metric Collection Scripts

### Collection Script (Bash)
```bash
#!/bin/bash
# collect-metrics.sh
# Collects baseline metrics for tracking

echo "=== QA Baseline Metrics Collection ===" > QA/test-reports/metrics.log
echo "Date: $(date)" >> QA/test-reports/metrics.log

# Frontend metrics
echo "\n=== Frontend Metrics ===" >> QA/test-reports/metrics.log
npm run test:unit -- --coverage 2>/dev/null | grep -E "Lines|Statements" >> QA/test-reports/metrics.log

# Backend metrics
echo "\n=== Backend Metrics ===" >> QA/test-reports/metrics.log
cd src/backend && npm test 2>/dev/null | grep -E "pass|fail" >> ../../QA/test-reports/metrics.log

echo "\nMetrics collected successfully"
```

### Automated Metric Tracking
```javascript
// QA/test-scripts/utils/metrics-collector.js
class MetricsCollector {
  constructor() {
    this.metrics = {
      startTime: Date.now(),
      testCases: [],
      performance: {},
      coverage: {}
    };
  }

  recordTestCase(name, status, duration) {
    this.metrics.testCases.push({ name, status, duration });
  }

  recordPerformance(endpoint, responseTime) {
    this.metrics.performance[endpoint] = responseTime;
  }

  export() {
    return {
      timestamp: new Date().toISOString(),
      ...this.metrics
    };
  }
}
```

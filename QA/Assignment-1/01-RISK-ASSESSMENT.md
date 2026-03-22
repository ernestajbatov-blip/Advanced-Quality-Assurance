# Risk Assessment & Strategy Planning
## ADA Oil App - Assignment 1

**Date:** March 2026  
**System:** Ada Oil App - IoT Oil Industry Monitoring Platform  
**Team Size:** 1 person  
**Deadline:** Week 2

---

## 1. System Overview

### 1.1 System Description
The Ada Oil App is a comprehensive web-based monitoring system for the oil industry, designed to track well operations, production metrics, and system diagnostics. It provides real-time data visualization, historical analysis, and reporting capabilities for oil extraction operations.

### 1.2 System Architecture
```
Frontend (React + Vite)
├── Dashboard (AppLayout)
├── ABC Analysis (ABCLayout)
├── Scheme Diagram (Diagram)
├── Oil Loss Tracking (OilLayout)
├── Login & Admin Pages
└── Data Visualization Components

Backend (Express + Node.js)
├── REST API Endpoints
├── MySQL Database
├── User Authentication
├── Report Generation
└── Analytics Services

External Services
├── Gunicorn (Loss Calculation Service)
└── Real-time Data Sources
```

### 1.3 Technology Stack
- **Frontend:** React 18.3, Vite, Recharts, AmCharts, Leaflet
- **Backend:** Express 4.21, MySQL, Node.js
- **Data Export:** XLSX (Excel)
- **Authentication:** MD5-based user authentication
- **Data Visualization:** Multiple charting libraries

---

## 2. Critical Components & Modules Analysis

### 2.1 HIGH RISK Components (Priority 1)

#### **2.1.1 User Authentication System**
- **Module:** `src/components/Login/Login.jsx` + `src/backend/server.js` (auth routes)
- **Risk Level:** CRITICAL
- **Probability:** High (used by every user on every session)
- **Impact:** Catastrophic (system inaccessibility, unauthorized access)
- **Reasons:**
  - All features depend on successful login
  - Sensitive credential handling
  - Session management vulnerability
  - MD5 hashing (outdated, weak cryptography)
  - No apparent HTTPS enforcement in frontend API config

**Risk Score:** 10/10
**Test Priority:** ⭐⭐⭐⭐⭐ (Highest)

#### **2.1.2 Data Fetching & API Integration**
- **Module:** `src/axios/api.js`, `src/axios/wellService.js`, API endpoints
- **Risk Level:** CRITICAL  
- **Probability:** High (used frequently throughout app)
- **Impact:** Severe (missing data, incorrect operations, misled decisions)
- **Reasons:**
  - Core data flow of entire system
  - Multiple API endpoints with different data sources
  - Timeout handling (30s timeout on external services)
  - Error handling inconsistencies
  - Dynamic URL construction vulnerability

**Risk Score:** 9/10
**Test Priority:** ⭐⭐⭐⭐⭐ (Highest)

#### **2.1.3 Chart Component & Data Visualization**
- **Module:** `src/components/Chart/Chart.jsx`, `src/components/AmChart/AmChart.jsx`
- **Risk Level:** HIGH
- **Probability:** High (primary user interface)
- **Impact:** High (incorrect data display, misled decisions)
- **Reasons:**
  - Display of critical production metrics
  - Handles both real-time and archive data
  - Complex data transformation logic
  - Multiple data types (liquid, oil, cumulative)
  - Load state management issues

**Risk Score:** 8.5/10
**Test Priority:** ⭐⭐⭐⭐

#### **2.1.4 Budget Calculation & Analytics**
- **Module:** `src/backend/server.js` (analysis endpoint)  
- **Risk Level:** HIGH
- **Probability:** Medium (used for reporting)
- **Impact:** Catastrophic (incorrect financial data)
- **Reasons:**
  - External Gunicorn service dependency
  - Complex loss calculations
  - Backend dependency outside app control
  - Service failure fallback unclear
  - Financial accuracy critical

**Risk Score:** 8/10
**Test Priority:** ⭐⭐⭐⭐

#### **2.1.5 Report Generation (Excel Export)**
- **Module:** Export functions in AppLayout, OilLayout
- **Risk Level:** MEDIUM-HIGH
- **Probability:** Medium (used for business reporting)
- **Impact:** High (incorrect exported data, format issues)
- **Reasons:**
  - Business-critical reports
  - Excel formatting complexity
  - Data accuracy must match UI
  - Large dataset handling

**Risk Score:** 7.5/10
**Test Priority:** ⭐⭐⭐⭐

### 2.2 MEDIUM RISK Components (Priority 2)

#### **2.2.1 Grid & Well Status Display**
- **Module:** `src/components/Grid/Grid.jsx`, well filtering logic
- **Risk Level:** MEDIUM
- **Probability:** High (frequent use)
- **Impact:** Medium (user confusion, missed alerts)
- **Reasons:**
  - Complex filtering and state management
  - Multiple well status types
  - UI responsiveness issues on large datasets

**Risk Score:** 6/10
**Test Priority:** ⭐⭐⭐

#### **2.2.2 User Permissions & Admin Features**
- **Module:** Admin user routes, role-based access
- **Risk Level:** MEDIUM  
- **Probability:** Medium (less frequent, admin-only)
- **Impact:** High (unauthorized access, data manipulation)
- **Reasons:**
  - Security implications
  - Role-based access control not thoroughly validated

**Risk Score:** 6.5/10
**Test Priority:** ⭐⭐⭐

#### **2.2.3 Date Range & Date Picker**
- **Module:** `react-datepicker`, archive data logic
- **Risk Level:** MEDIUM
- **Probability:** Medium (frequently used for reports)
- **Impact:** Medium (incorrect data ranges)
- **Reasons:**
  - Multiple date range implementations
  - Timezone handling not apparent
  - Hardcoded test dates in code

**Risk Score:** 5.5/10
**Test Priority:** ⭐⭐⭐

### 2.3 LOWER RISK Components (Priority 3)

#### **2.3.1 Map & Diagram Components**
- **Module:** Leaflet map, Diagram SVG, KPI display
- **Risk Level:** LOW-MEDIUM
- **Probability:** Low-Medium (UI elements)
- **Impact:** Low (cosmetic, not critical to operations)

**Risk Score:** 3-4/10
**Test Priority:** ⭐⭐

#### **2.3.2 Notifications System**
- **Module:** `src/components/NotificationBell/`
- **Risk Level:** LOW
- **Probability:** Low-Medium
- **Impact:** Low (minor user frustration)

**Risk Score:** 2/10
**Test Priority:** ⭐

---

## 3. Risk Assessment Matrix

### 3.1 Probability × Impact Grid

```
RISK MATRIX (Probability vs Impact)

Impact →
CRITICAL    │ Critical │ High    │ Medium  │
HIGH         │ High     │ High    │ Medium  │
MEDIUM       │ Medium   │ Medium  │ Low     │
LOW          │ Low      │ Low     │ Low     │
             └──────────────────────────────
             Low    Medium   High   Critical
             ← Probability
```

### 3.2 Prioritized Risk Ranking

| Rank | Component | Risk Score | Test Type | Effort |
|------|-----------|-----------|-----------|--------|
| 1 | User Authentication | 10/10 | Automated + Manual | High |
| 2 | API Integration & Data Fetch | 9/10 | Automated + Manual | High |
| 3 | Chart Data Visualization | 8.5/10 | Manual + Automated | High |
| 4 | Budget Calculation Service | 8/10 | Integration | High |
| 5 | Report Generation (Excel) | 7.5/10 | Manual + Automated | Medium |
| 6 | Admin Permissions | 6.5/10 | Manual + Automated | Medium |
| 7 | Grid & Status Display | 6/10 | Manual + Automated | Medium |
| 8 | Date Handling & Archives | 5.5/10 | Automated | Medium |
| 9 | Maps & Diagrams | 3-4/10 | Manual | Low |
| 10 | Notifications System | 2/10 | Manual | Low |

---

## 4. Assumptions & Reasoning

### 4.1 Key Assumptions
1. **Frontend runs on localhost:3000** (Vite default)
2. **Backend runs on localhost:5000** (Express default)
3. **MySQL database is pre-configured** and accessible
4. **Gunicorn service available** at `http://localhost:8888` for loss calculations
5. **User authentication uses MD5** (current implementation)
6. **API endpoints follow RESTful conventions**
7. **Real-time data is available** for testing
8. **Test environment isolates production data**

### 4.2 Risk Assessment Methodology
- **Probability Scoring:** Based on code complexity, usage frequency, and known vulnerabilities
- **Impact Scoring:** Based on business criticality and potential data loss/security implications
- **Risk Formula:** `Risk Score = (Probability × Impact) + Vulnerability Factor`

### 4.3 Known Vulnerabilities
1. **MD5 Password Hashing** - Cryptographically weak
2. **Dynamic API URL Construction** - Potential injection vulnerability
3. **No apparent CORS validation** - API security risk
4. **External service dependency** (Gunicorn) - System availability risk
5. **Hardcoded test dates** - May cause test failures in future
6. **Error handling inconsistency** - May hide real issues
7. **No rate limiting** - API abuse vulnerability

---

## 5. Testing Strategy Based on Risk

### 5.1 High-Risk Components Testing Approach

#### Authentication Testing
- **Manual:** Test login success/failure scenarios, session persistence
- **Automated:** Login endpoint validation, credential handling
- **Security:** Password validation, session timeout

#### API Integration Testing
- **Manual:** Endpoint functionality, error scenarios
- **Automated:** API contract testing, payload validation
- **Integration:** External service mocking

#### Data Visualization Testing
- **Manual:** Chart accuracy, data correctness
- **Automated:** Data transformation validation
- **Regression:** Chart consistency across updates

### 5.2 Testing Phase Timeline
1. **Week 1:** Manual testing of core functionality + Setup automated environment
2. **Early Week 2:** Automated test script execution + Integration tests
3. **Late Week 2:** Regression testing + Report generation + Metrics collection

---

## 6. Key Metrics for Baseline

### 6.1 Coverage Metrics
- Authentication flow coverage: 100%
- API endpoint coverage: 85% (critical endpoints)
- Critical component coverage: 90%
- Overall estimated coverage: 45% of full codebase

### 6.2 Risk-Based Metrics
- High-risk components tested: 5/5
- Medium-risk components tested: 3/4
- Low-risk components tested: 1/2

### 6.3 Effort Estimation
- Manual Testing Hours: ~20 hours
- Automated Testing Setup: ~15 hours
- Environment Setup: ~8 hours
- Documentation: ~6 hours
- **Total Estimated Effort:** ~49 hours

---

## 7. Assumptions & Constraints

### 7.1 Constraints
- **Time:** Limited to 2 weeks
- **Resources:** Single-person QA team
- **Environment:** May need to work with pre-built database
- **External Dependencies:** Reliance on Gunicorn service availability

### 7.2 Recommendations for Risk Mitigation
1. Implement proper BCRYPT password hashing immediately
2. Add rate limiting to API endpoints
3. Implement CORS validation
4. Add comprehensive error logging
5. Mock external services for consistent testing
6. Implement database transactions for data integrity

/**
 * Test Case Prioritization & Ordering Module
 * Implements risk-based ordering (TCP) and random baseline ordering
 */
// @ts-nocheck


// Test cases with risk scores (descending priority)
const TEST_CASES = [
  // Authentication (Highest Risk)
  { id: 'TS-Auth-001', suite: 'auth.spec.js', module: 'Authentication', risk: 95, coverage: 100 },
  { id: 'TS-Auth-003', suite: 'auth.spec.js', module: 'Authentication', risk: 95, coverage: 100 },
  { id: 'TS-Auth-002', suite: 'auth.spec.js', module: 'Authentication', risk: 95, coverage: 95 },
  { id: 'TS-Auth-004', suite: 'auth.spec.js', module: 'Authentication', risk: 95, coverage: 90 },

  // API Integration (High Risk)
  { id: 'TS-API-005', suite: 'api-integration.spec.js', module: 'API', risk: 90, coverage: 100 },
  { id: 'TS-API-001', suite: 'api-integration.spec.js', module: 'API', risk: 90, coverage: 100 },
  { id: 'TS-API-004', suite: 'api-integration.spec.js', module: 'API', risk: 90, coverage: 95 },
  { id: 'TS-API-002', suite: 'api-integration.spec.js', module: 'API', risk: 90, coverage: 90 },
  { id: 'TS-API-003', suite: 'api-integration.spec.js', module: 'API', risk: 90, coverage: 85 },

  // Chart & Visualization (High Risk)
  { id: 'TS-Chart-001', suite: 'charts.spec.js', module: 'Charts', risk: 85, coverage: 100 },
  { id: 'TS-Chart-004', suite: 'charts.spec.js', module: 'Charts', risk: 85, coverage: 98 },
  { id: 'TS-Chart-002', suite: 'charts.spec.js', module: 'Charts', risk: 85, coverage: 90 },
  { id: 'TS-Chart-003', suite: 'charts.spec.js', module: 'Charts', risk: 85, coverage: 88 },

  // Oil Loss & Export (High Risk)
  { id: 'TS-Oil-004', suite: 'high-risk.spec.js', module: 'OilLoss', risk: 80, coverage: 100 },
  { id: 'TS-Oil-001', suite: 'high-risk.spec.js', module: 'OilLoss', risk: 80, coverage: 95 },
  { id: 'TS-Oil-002', suite: 'high-risk.spec.js', module: 'OilLoss', risk: 80, coverage: 92 },
  { id: 'TS-Export-001', suite: 'high-risk.spec.js', module: 'OilLoss', risk: 80, coverage: 88 },
  { id: 'TS-Oil-003', suite: 'high-risk.spec.js', module: 'OilLoss', risk: 80, coverage: 85 },
  { id: 'TS-Export-002', suite: 'high-risk.spec.js', module: 'OilLoss', risk: 80, coverage: 80 },
];

/**
 * Generate risk-based test ordering
 * Tests ordered by descending risk score, then by descending code coverage
 */
function generateRiskBasedOrdering() {
  return [...TEST_CASES].sort((a, b) => {
    // Primary sort: risk score (descending)
    if (b.risk !== a.risk) return b.risk - a.risk;
    // Secondary sort: coverage (descending)
    return b.coverage - a.coverage;
  });
}

/**
 * Generate n random test orderings with fixed seed for reproducibility
 */
function generateRandomOrderings(count = 30, seed = 42) {
  const seededRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };

  const orderings = [];
  for (let i = 0; i < count; i++) {
    const tests = [...TEST_CASES];
    // Fisher-Yates shuffle with seeded RNG
    for (let j = tests.length - 1; j > 0; j--) {
      const rnd = seededRandom(seed + i * 1000 + j);
      const k = Math.floor(rnd * (j + 1));
      [tests[j], tests[k]] = [tests[k], tests[j]];
    }
    orderings.push(tests);
  }
  return orderings;
}

/**
 * Get test case by ID
 */
function getTestById(id) {
  return TEST_CASES.find(t => t.id === id);
}

/**
 * Get all unique test IDs
 */
function getAllTestIds() {
  return TEST_CASES.map(t => t.id);
}

export {
  TEST_CASES,
  generateRiskBasedOrdering,
  generateRandomOrderings,
  getTestById,
  getAllTestIds,
};

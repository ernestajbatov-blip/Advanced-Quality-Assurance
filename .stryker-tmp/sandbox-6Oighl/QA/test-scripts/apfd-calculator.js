/**
 * APFD Calculator & Fault Detection Metrics
 * Implements APFD formula and metrics from Elbaum et al.
 */
// @ts-nocheck


/**
 * Calculate APFD (Average Percentage Faults Detected)
 * APFD = 1 – (TF₁ + TF₂ + … + TFₘ) / (n × m) + 1/(2n)
 * 
 * @param {number[]} testPositions - Positions of first fault detection per fault (1-indexed)
 * @param {number} n - Total number of test cases
 * @param {number} m - Total number of faults
 * @returns {number} APFD score (0-1, higher is better)
 */
function calculateAPFD(testPositions, n, m) {
  if (m === 0) return 1.0; // No faults to detect
  if (testPositions.length === 0) return 0.0; // No faults detected

  const sumTF = testPositions.reduce((a, b) => a + b, 0);
  const apfd = 1 - (sumTF / (n * m)) + (1 / (2 * n));
  
  return Math.max(0, Math.min(1, apfd)); // Clamp to [0, 1]
}

/**
 * Calculate Time-to-First-Failure (T1F)
 * Returns both test position and wall-clock time
 */
function calculateT1F(testExecutions) {
  // testExecutions: [{ testId, duration, faultsDetected: ['fault1', 'fault2'], ... }]
  
  let firstDetectionPosition = null;
  let firstDetectionTime = 0;
  let testsExecuted = 0;

  for (const execution of testExecutions) {
    testsExecuted++;
    firstDetectionTime += execution.duration;
    
    if (execution.faultsDetected && execution.faultsDetected.length > 0) {
      firstDetectionPosition = testsExecuted;
      break;
    }
  }

  return {
    position: firstDetectionPosition, // Test position (1-indexed), null if no fault detected
    time: firstDetectionTime, // Wall-clock time in ms
  };
}

/**
 * Build cumulative fault detection curve
 * Returns fault detection count at each test execution step
 */
function buildFaultDetectionCurve(testExecutions, totalFaults) {
  const curve = [];
  const detectedFaults = new Set();

  for (let i = 0; i < testExecutions.length; i++) {
    const execution = testExecutions[i];
    if (execution.faultsDetected) {
      execution.faultsDetected.forEach(f => detectedFaults.add(f));
    }
    
    const faultsDetected = detectedFaults.size;
    curve.push({
      testPosition: i + 1,
      faultsDetected: faultsDetected,
      faultsRemaining: totalFaults - faultsDetected,
      percentageDetected: totalFaults > 0 ? (faultsDetected / totalFaults) * 100 : 0,
    });
  }

  return curve;
}

/**
 * Simulate test execution with fault detection
 * Maps mutation results to test executions
 */
function simulateTestExecution(testOrder, mutationResults) {
  /**
   * mutation results format:
   * [
   *   { mutationId: 'mut1', killed: true, killedBy: ['TS-API-005', 'TS-Auth-001'], ... },
   *   { mutationId: 'mut2', killed: false, killedBy: [], ... }
   * ]
   */
  
  const executions = [];
  const detectedMutations = new Set();

  for (const test of testOrder) {
    const testRunResult = {
      testId: test.id,
      position: executions.length + 1,
      duration: 500 + Math.random() * 500, // Simulated duration (500-1000ms)
      faultsDetected: [],
    };

    // Find mutations killed by this test
    for (const mutation of mutationResults) {
      // Check if this mutation was killed by this test
      const killedByThisTest = Array.isArray(mutation.killedBy) && 
        mutation.killedBy.some(killerTest => 
          killerTest === test.id || 
          killerTest.includes(test.id) ||
          test.id.includes(killerTest.replace(/^TS-/, ''))
        );

      if (mutation.killed && killedByThisTest) {
        if (!detectedMutations.has(mutation.mutationId)) {
          testRunResult.faultsDetected.push(mutation.mutationId);
          detectedMutations.add(mutation.mutationId);
        }
      }
    }

    executions.push(testRunResult);
  }

  return executions;
}

/**
 * Run APFD analysis for a test ordering
 */
function analyzeTestOrdering(testOrder, mutationResults, orderingName = 'unknown') {
  const n = testOrder.length; // Number of tests
  const m = mutationResults.filter(m => m.killed).length; // Number of faults (killed mutations)

  if (m === 0) {
    return {
      orderingName,
      n,
      m: 0,
      apfd: 1.0,
      t1f: { position: null, time: 0 },
      detectedFaults: 0,
      curve: [],
      totalTime: 0,
    };
  }

  // Simulate test execution
  const executions = simulateTestExecution(testOrder, mutationResults);
  
  // Calculate T1F
  const t1f = calculateT1F(executions);
  
  // Build fault detection curve
  const curve = buildFaultDetectionCurve(executions, m);
  
  // Find first detection position per fault (1-indexed)
  const detectedFaults = {};
  for (let i = 0; i < executions.length; i++) {
    const execution = executions[i];
    const testPosition = i + 1; // 1-indexed position
    
    for (const fault of execution.faultsDetected) {
      if (!detectedFaults[fault]) {
        detectedFaults[fault] = testPosition;
      }
    }
  }
  
  const testPositions = Object.values(detectedFaults);
  const detectedCount = testPositions.length;
  
  // Calculate APFD (only for killed/detected faults)
  let apfd = 0;
  if (detectedCount > 0) {
    apfd = calculateAPFD(testPositions, n, detectedCount);
  }

  return {
    orderingName,
    n, // # tests
    m, // # faults (total killed mutations)
    apfd,
    t1f,
    detectedFaults: detectedCount,
    curve,
    totalTime: executions.reduce((s, e) => s + e.duration, 0),
  };
}

/**
 * Compare orderings and generate statistics
 */
function compareOrderings(analyses) {
  const apfdScores = analyses.map(a => a.apfd);
  const t1fPositions = analyses.map(a => a.t1f.position).filter(p => p !== null);

  const stats = {
    count: analyses.length,
    apfd: {
      mean: apfdScores.reduce((a, b) => a + b, 0) / apfdScores.length,
      median: medianOfArray(apfdScores),
      min: Math.min(...apfdScores),
      max: Math.max(...apfdScores),
      stdDev: stdDevOfArray(apfdScores),
    },
    t1f: {
      mean: t1fPositions.reduce((a, b) => a + b, 0) / t1fPositions.length,
      median: medianOfArray(t1fPositions),
      min: Math.min(...t1fPositions),
      max: Math.max(...t1fPositions),
    },
  };

  return stats;
}

// Helper functions
function medianOfArray(arr) {
  const sorted = [...arr].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function stdDevOfArray(arr) {
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

export {
  calculateAPFD,
  calculateT1F,
  buildFaultDetectionCurve,
  simulateTestExecution,
  analyzeTestOrdering,
  compareOrderings,
};

#!/usr/bin/env node

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const BASE_URL = process.env.PERF_BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve('QA/test-reports/performance');

const ENDPOINTS = [
  { module: 'Authentication', method: 'POST', path: '/api/auth/login', body: { login: process.env.E2E_LOGIN || 'test', password: process.env.E2E_PASSWORD || '123456' } },
  { module: 'API Integration', method: 'GET', path: '/api/wells' },
  { module: 'Oil Loss Analysis', method: 'GET', path: '/api/oil-loss' },
];

const SCENARIOS = [
  { name: 'normal_load', concurrency: 5, durationSec: 20 },
  { name: 'peak_load', concurrency: 20, durationSec: 20 },
  { name: 'spike_load', concurrency: 50, durationSec: 10 },
  { name: 'endurance_test', concurrency: 10, durationSec: 45 },
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function percentile(sorted, p) {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1));
  return sorted[idx];
}

function median(sorted) {
  if (sorted.length === 0) return 0;
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

function getCpuSnapshot() {
  const cpus = os.cpus();
  const total = cpus.reduce((acc, cpu) => {
    const t = Object.values(cpu.times).reduce((sum, v) => sum + v, 0);
    return acc + t;
  }, 0);
  const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
  return { total, idle };
}

function cpuUsagePct(prev, next) {
  const totalDiff = next.total - prev.total;
  const idleDiff = next.idle - prev.idle;
  if (totalDiff <= 0) return 0;
  return ((totalDiff - idleDiff) / totalDiff) * 100;
}

async function runRequest(endpoint, timeoutMs = 5000) {
  const url = `${BASE_URL}${endpoint.path}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method: endpoint.method,
      headers: endpoint.method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: endpoint.method === 'POST' ? JSON.stringify(endpoint.body || {}) : undefined,
      signal: controller.signal,
    });

    const latencyMs = performance.now() - started;
    clearTimeout(timeout);

    return {
      ok: response.ok,
      status: response.status,
      latencyMs,
      endpoint: endpoint.path,
      module: endpoint.module,
      error: null,
    };
  } catch (error) {
    const latencyMs = performance.now() - started;
    clearTimeout(timeout);

    return {
      ok: false,
      status: 0,
      latencyMs,
      endpoint: endpoint.path,
      module: endpoint.module,
      error: error.name || 'RequestError',
    };
  }
}

async function runScenario(scenario) {
  const startedAt = new Date().toISOString();
  const endAtMs = Date.now() + scenario.durationSec * 1000;
  const results = [];
  const throughputSamples = [];
  const resourceSamples = [];
  const executionLog = [];

  let lastReqCount = 0;
  let lastErrCount = 0;
  let endpointIndex = 0;

  let prevCpu = getCpuSnapshot();
  let prevRes = process.resourceUsage();

  executionLog.push(`[${new Date().toISOString()}] Scenario '${scenario.name}' started (concurrency=${scenario.concurrency}, duration=${scenario.durationSec}s)`);

  const monitor = setInterval(() => {
    const now = Date.now();
    const second = Math.floor((now - (endAtMs - scenario.durationSec * 1000)) / 1000);
    const reqCount = results.length;
    const errCount = results.filter((r) => !r.ok).length;
    const secondReq = reqCount - lastReqCount;
    const secondErr = errCount - lastErrCount;

    const recent = results.slice(Math.max(0, results.length - secondReq));
    const avgLatency = recent.length > 0
      ? recent.reduce((sum, r) => sum + r.latencyMs, 0) / recent.length
      : 0;

    const memUsagePct = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100;
    const nextCpu = getCpuSnapshot();
    const cpuPct = cpuUsagePct(prevCpu, nextCpu);
    prevCpu = nextCpu;

    const nextRes = process.resourceUsage();
    const fsReadDelta = nextRes.fsRead - prevRes.fsRead;
    const fsWriteDelta = nextRes.fsWrite - prevRes.fsWrite;
    prevRes = nextRes;

    throughputSamples.push({
      scenario: scenario.name,
      second,
      requestsPerSec: secondReq,
      errorsPerSec: secondErr,
      avgLatencyMs: Number(avgLatency.toFixed(2)),
    });

    resourceSamples.push({
      scenario: scenario.name,
      second,
      cpuUsagePct: Number(cpuPct.toFixed(2)),
      memoryUsagePct: Number(memUsagePct.toFixed(2)),
      fsReadDelta,
      fsWriteDelta,
    });

    lastReqCount = reqCount;
    lastErrCount = errCount;
  }, 1000);

  const workers = Array.from({ length: scenario.concurrency }, async () => {
    while (Date.now() < endAtMs) {
      const endpoint = ENDPOINTS[endpointIndex % ENDPOINTS.length];
      endpointIndex++;
      const outcome = await runRequest(endpoint);
      results.push(outcome);
    }
  });

  await Promise.all(workers);
  clearInterval(monitor);

  const endedAt = new Date().toISOString();
  const elapsedSec = scenario.durationSec;
  const latencies = results.map((r) => r.latencyMs).sort((a, b) => a - b);
  const failed = results.filter((r) => !r.ok);
  const errorRatePct = results.length > 0 ? (failed.length / results.length) * 100 : 100;
  const throughputRps = results.length / elapsedSec;

  const moduleBreakdown = ENDPOINTS.map((endpoint) => {
    const rows = results.filter((r) => r.module === endpoint.module);
    const total = rows.length;
    const errors = rows.filter((r) => !r.ok).length;
    return {
      module: endpoint.module,
      endpoint: endpoint.path,
      requests: total,
      errors,
      errorRatePct: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
      avgLatencyMs: total > 0 ? Number((rows.reduce((s, r) => s + r.latencyMs, 0) / total).toFixed(2)) : 0,
    };
  });

  executionLog.push(`[${new Date().toISOString()}] Scenario '${scenario.name}' finished requests=${results.length}, errors=${failed.length}, p95=${percentile(latencies, 95).toFixed(2)}ms`);

  return {
    scenario: scenario.name,
    startedAt,
    endedAt,
    concurrency: scenario.concurrency,
    durationSec: scenario.durationSec,
    totalRequests: results.length,
    successfulRequests: results.length - failed.length,
    failedRequests: failed.length,
    errorRatePct: Number(errorRatePct.toFixed(2)),
    throughputRps: Number(throughputRps.toFixed(2)),
    responseTimeMs: {
      average: Number((latencies.reduce((s, v) => s + v, 0) / (latencies.length || 1)).toFixed(2)),
      median: Number(median(latencies).toFixed(2)),
      p95: Number(percentile(latencies, 95).toFixed(2)),
      p99: Number(percentile(latencies, 99).toFixed(2)),
      min: Number((latencies[0] || 0).toFixed(2)),
      max: Number((latencies[latencies.length - 1] || 0).toFixed(2)),
    },
    moduleBreakdown,
    throughputSamples,
    resourceSamples,
    executionLog,
  };
}

function writeCsv(filePath, header, rows) {
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(header.map((key) => row[key]).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  ensureDir(OUTPUT_DIR);
  const overallStartedAt = new Date().toISOString();

  const scenarioResults = [];

  for (const scenario of SCENARIOS) {
    // Small cool-down between scenarios to reduce cross-scenario interference
    const result = await runScenario(scenario);
    scenarioResults.push(result);
    await sleep(2000);
  }

  const overallEndedAt = new Date().toISOString();

  const summary = scenarioResults.map((r) => ({
    scenario: r.scenario,
    concurrency: r.concurrency,
    durationSec: r.durationSec,
    totalRequests: r.totalRequests,
    throughputRps: r.throughputRps,
    errorRatePct: r.errorRatePct,
    avgResponseMs: r.responseTimeMs.average,
    medianResponseMs: r.responseTimeMs.median,
    p95ResponseMs: r.responseTimeMs.p95,
    p99ResponseMs: r.responseTimeMs.p99,
  }));

  const allThroughput = scenarioResults.flatMap((r) => r.throughputSamples);
  const allResources = scenarioResults.flatMap((r) => r.resourceSamples);
  const allLogs = scenarioResults.flatMap((r) => r.executionLog);

  const resultDoc = {
    generatedAt: new Date().toISOString(),
    tool: 'Custom Node.js Load Runner',
    baseUrl: BASE_URL,
    highRiskModules: ENDPOINTS.map((e) => e.module),
    overallStartedAt,
    overallEndedAt,
    scenarios: scenarioResults,
    summary,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'performance-results.json'), JSON.stringify(resultDoc, null, 2), 'utf8');
  writeCsv(path.join(OUTPUT_DIR, 'response-time-summary.csv'), [
    'scenario', 'concurrency', 'durationSec', 'totalRequests', 'throughputRps', 'errorRatePct', 'avgResponseMs', 'medianResponseMs', 'p95ResponseMs', 'p99ResponseMs',
  ], summary);
  writeCsv(path.join(OUTPUT_DIR, 'throughput-over-time.csv'), ['scenario', 'second', 'requestsPerSec', 'errorsPerSec', 'avgLatencyMs'], allThroughput);
  writeCsv(path.join(OUTPUT_DIR, 'resource-usage.csv'), ['scenario', 'second', 'cpuUsagePct', 'memoryUsagePct', 'fsReadDelta', 'fsWriteDelta'], allResources);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'execution-log.txt'), `${allLogs.join('\n')}\n`, 'utf8');

  console.log('Performance testing complete. Outputs:');
  console.log(`- ${path.join(OUTPUT_DIR, 'performance-results.json')}`);
  console.log(`- ${path.join(OUTPUT_DIR, 'response-time-summary.csv')}`);
  console.log(`- ${path.join(OUTPUT_DIR, 'throughput-over-time.csv')}`);
  console.log(`- ${path.join(OUTPUT_DIR, 'resource-usage.csv')}`);
  console.log(`- ${path.join(OUTPUT_DIR, 'execution-log.txt')}`);
}

main().catch((error) => {
  console.error('Performance test failed:', error);
  process.exitCode = 1;
});

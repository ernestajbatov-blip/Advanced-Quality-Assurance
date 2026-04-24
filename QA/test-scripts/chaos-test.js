#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const BASE_URL = process.env.CHAOS_BASE_URL || 'http://localhost:3000';
const OUTPUT_DIR = path.resolve('QA/test-reports/chaos');

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestWithFaults(url, options = {}) {
  const {
    timeoutMs = 5000,
    injectLatencyMs = 0,
    packetLossProbability = 0,
    forceFailure = false,
    method = 'GET',
    body,
  } = options;

  if (injectLatencyMs > 0) {
    await sleep(injectLatencyMs);
  }

  if (Math.random() < packetLossProbability || forceFailure) {
    return {
      ok: false,
      status: 0,
      latencyMs: injectLatencyMs,
      error: forceFailure ? 'InjectedDowntime' : 'InjectedPacketLoss',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const started = performance.now();

  try {
    const response = await fetch(url, {
      method,
      headers: method === 'POST' ? { 'Content-Type': 'application/json' } : undefined,
      body: method === 'POST' ? JSON.stringify(body || {}) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timeout);

    return {
      ok: response.ok,
      status: response.status,
      latencyMs: performance.now() - started,
      error: null,
    };
  } catch (error) {
    clearTimeout(timeout);

    return {
      ok: false,
      status: 0,
      latencyMs: performance.now() - started,
      error: error.name || 'RequestError',
    };
  }
}

async function measureRecovery(probeUrl, maxWaitSec = 60) {
  const started = Date.now();
  let consecutiveOk = 0;

  while ((Date.now() - started) / 1000 < maxWaitSec) {
    const probe = await requestWithFaults(probeUrl, { timeoutMs: 3000 });
    if (probe.ok) {
      consecutiveOk += 1;
      if (consecutiveOk >= 3) {
        return Number(((Date.now() - started) / 1000).toFixed(2));
      }
    } else {
      consecutiveOk = 0;
    }
    await sleep(1000);
  }

  return maxWaitSec;
}

function summarizeScenario(name, events, mttrSec, affectedModule, faultType, durationSec) {
  const total = events.length;
  const failures = events.filter((e) => !e.ok).length;
  const availabilityPct = total > 0 ? ((total - failures) / total) * 100 : 0;
  const latencies = events.map((e) => e.latencyMs).sort((a, b) => a - b);

  const p95 = latencies.length > 0 ? latencies[Math.max(0, Math.ceil(latencies.length * 0.95) - 1)] : 0;
  const avg = latencies.length > 0 ? latencies.reduce((s, v) => s + v, 0) / latencies.length : 0;

  return {
    scenario: name,
    affectedModule,
    faultType,
    durationSec,
    totalChecks: total,
    failures,
    availabilityPct: Number(availabilityPct.toFixed(2)),
    avgLatencyMs: Number(avg.toFixed(2)),
    p95LatencyMs: Number(p95.toFixed(2)),
    mttrSec,
    propagatedErrors: events
      .filter((e) => !e.ok)
      .reduce((acc, e) => {
        const key = e.error || `HTTP_${e.status}`;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {}),
  };
}

async function scenarioApiDowntime(logLines) {
  const name = 'api_downtime_simulation';
  const durationSec = 20;
  const events = [];
  const started = Date.now();

  logLines.push(`[${new Date().toISOString()}] Starting ${name} for ${durationSec}s`);

  while ((Date.now() - started) / 1000 < durationSec) {
    const result = await requestWithFaults(`${BASE_URL}/api/health`, { forceFailure: true });
    events.push(result);
    await sleep(1000);
  }

  const mttrSec = await measureRecovery(`${BASE_URL}/api/health`, 30);
  const summary = summarizeScenario(name, events, mttrSec, 'API Integration', 'API downtime', durationSec);

  logLines.push(`[${new Date().toISOString()}] Finished ${name}: availability=${summary.availabilityPct}%, mttr=${summary.mttrSec}s`);
  return { summary, events };
}

async function scenarioDbFailureLike(logLines) {
  const name = 'database_failure_simulation';
  const durationSec = 20;
  const events = [];
  const started = Date.now();

  logLines.push(`[${new Date().toISOString()}] Starting ${name} for ${durationSec}s`);

  while ((Date.now() - started) / 1000 < durationSec) {
    const result = await requestWithFaults(`${BASE_URL}/api/oil-loss`, { timeoutMs: 40 });
    events.push(result);
    await sleep(500);
  }

  const mttrSec = await measureRecovery(`${BASE_URL}/api/oil-loss`, 45);
  const summary = summarizeScenario(name, events, mttrSec, 'Oil Loss Analysis', 'Database slow/unavailable simulation (aggressive timeout)', durationSec);

  logLines.push(`[${new Date().toISOString()}] Finished ${name}: availability=${summary.availabilityPct}%, mttr=${summary.mttrSec}s`);
  return { summary, events };
}

async function scenarioNetworkFault(logLines) {
  const name = 'network_latency_packet_loss';
  const durationSec = 25;
  const events = [];
  const started = Date.now();

  logLines.push(`[${new Date().toISOString()}] Starting ${name} for ${durationSec}s`);

  while ((Date.now() - started) / 1000 < durationSec) {
    const latency = 250 + Math.floor(Math.random() * 900);
    const result = await requestWithFaults(`${BASE_URL}/api/2hours?oil_field=BSK`, {
      injectLatencyMs: latency,
      packetLossProbability: 0.2,
      timeoutMs: 3000,
    });
    events.push(result);
    await sleep(250);
  }

  const mttrSec = await measureRecovery(`${BASE_URL}/api/2hours?oil_field=BSK`, 30);
  const summary = summarizeScenario(name, events, mttrSec, 'Charts / API Integration', 'Network latency + packet loss', durationSec);

  logLines.push(`[${new Date().toISOString()}] Finished ${name}: availability=${summary.availabilityPct}%, mttr=${summary.mttrSec}s`);
  return { summary, events };
}

async function scenarioResourceExhaustion(logLines) {
  const name = 'resource_exhaustion_spike';
  const durationSec = 20;
  const events = [];
  const workers = 70;
  const endAt = Date.now() + durationSec * 1000;

  logLines.push(`[${new Date().toISOString()}] Starting ${name} for ${durationSec}s with ${workers} concurrent workers`);

  const tasks = Array.from({ length: workers }, async () => {
    while (Date.now() < endAt) {
      const result = await requestWithFaults(`${BASE_URL}/api/wells`, { timeoutMs: 4000 });
      events.push(result);
    }
  });

  await Promise.all(tasks);

  const mttrSec = await measureRecovery(`${BASE_URL}/api/wells`, 30);
  const summary = summarizeScenario(name, events, mttrSec, 'API Integration', 'Resource exhaustion via high concurrency', durationSec);

  logLines.push(`[${new Date().toISOString()}] Finished ${name}: availability=${summary.availabilityPct}%, mttr=${summary.mttrSec}s`);
  return { summary, events };
}

function writeCsv(filePath, header, rows) {
  const lines = [header.join(',')];
  for (const row of rows) {
    lines.push(header.map((key) => {
      const value = typeof row[key] === 'object' ? JSON.stringify(row[key]) : row[key];
      return String(value).replaceAll(',', ';');
    }).join(','));
  }
  fs.writeFileSync(filePath, `${lines.join('\n')}\n`, 'utf8');
}

async function main() {
  ensureDir(OUTPUT_DIR);

  const runStartedAt = new Date().toISOString();
  const logLines = [`[${runStartedAt}] Chaos testing run started`];

  const scenarios = [];

  scenarios.push(await scenarioApiDowntime(logLines));
  await sleep(2000);

  scenarios.push(await scenarioDbFailureLike(logLines));
  await sleep(2000);

  scenarios.push(await scenarioNetworkFault(logLines));
  await sleep(2000);

  scenarios.push(await scenarioResourceExhaustion(logLines));

  const runEndedAt = new Date().toISOString();
  logLines.push(`[${runEndedAt}] Chaos testing run finished`);

  const summary = scenarios.map((s) => s.summary);

  const output = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    runStartedAt,
    runEndedAt,
    scenarios,
    summary,
  };

  fs.writeFileSync(path.join(OUTPUT_DIR, 'chaos-results.json'), JSON.stringify(output, null, 2), 'utf8');
  writeCsv(path.join(OUTPUT_DIR, 'chaos-metrics.csv'), [
    'scenario', 'affectedModule', 'faultType', 'durationSec', 'totalChecks', 'failures', 'availabilityPct', 'avgLatencyMs', 'p95LatencyMs', 'mttrSec', 'propagatedErrors',
  ], summary);
  fs.writeFileSync(path.join(OUTPUT_DIR, 'fault-injection-log.txt'), `${logLines.join('\n')}\n`, 'utf8');

  console.log('Chaos testing complete. Outputs:');
  console.log(`- ${path.join(OUTPUT_DIR, 'chaos-results.json')}`);
  console.log(`- ${path.join(OUTPUT_DIR, 'chaos-metrics.csv')}`);
  console.log(`- ${path.join(OUTPUT_DIR, 'fault-injection-log.txt')}`);
}

main().catch((error) => {
  console.error('Chaos test failed:', error);
  process.exitCode = 1;
});

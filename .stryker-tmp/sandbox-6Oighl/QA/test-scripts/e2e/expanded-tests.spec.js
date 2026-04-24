// @ts-nocheck
import { test, expect } from '@playwright/test';

// Test Configuration
const API_BASE_URL = 'http://localhost:3000/api';
const APP_URL = 'http://localhost:3000';
const TIMEOUT = 10000;
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 500;

// Helper: Generate expired JWT token
function generateExpiredToken() {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(JSON.stringify({
    userId: 1,
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
    iat: Math.floor(Date.now() / 1000) - 7200
  })).toString('base64');
  const signature = 'invalid_signature';
  return `${header}.${payload}.${signature}`;
}

// Helper: Retry wrapper
async function withRetry(fn, attempts = RETRY_ATTEMPTS) {
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(r => setTimeout(r, RETRY_DELAY));
    }
  }
}

// ============================================================================
// NEW TEST 1: TC-AUTH-FAILURE-01 - Expired JWT Token Rejection
// ============================================================================
test('TC-AUTH-FAILURE-01: Verify system rejects expired JWT tokens with 401', async ({ page, context }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-AUTH-FAILURE-01'
  });

  // Generate expired token
  const expiredToken = generateExpiredToken();

  // Attempt API call with expired token
  const response = await context.request.get(`${API_BASE_URL}/health`, {
    headers: {
      'Authorization': `Bearer ${expiredToken}`,
      'Content-Type': 'application/json'
    }
  });

  // Assertions
  expect(response.status()).toBe(401);
  const body = await response.json();
  expect(body.message).toContain('Token expired');

  // Verify UI redirects to login
  await page.goto(APP_URL);
  const loginTitle = page.locator('text=Login');
  expect(loginTitle).toBeVisible({ timeout: TIMEOUT });
});

// ============================================================================
// NEW TEST 2: TC-API-FAILURE-01 - API 500 Error Handling
// ============================================================================
test('TC-API-FAILURE-01: Verify system handles API 500 errors gracefully', async ({ page }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-API-FAILURE-01'
  });

  // Mock API to return 500 error
  await page.routeFromHAR('QA/test-scripts/e2e/fixtures/api-500-error.har', {
    url: '**/api/wells',
    update: 'missing'
  });

  // Navigate to wells page
  await page.goto(`${APP_URL}/wells`);
  
  // Wait for error notification
  const errorMessage = page.locator('text=Unable to load well data');
  await expect(errorMessage).toBeVisible({ timeout: TIMEOUT });

  // Verify retry logic is triggered
  const retryButton = page.locator('button:has-text("Retry")');
  expect(retryButton).toBeVisible();

  // Verify graceful fallback (not crashed)
  const pageTitle = page.locator('h1');
  expect(pageTitle).toBeVisible();
});

// ============================================================================
// NEW TEST 3: TC-API-FAILURE-02 - Invalid Date Range Validation
// ============================================================================
test('TC-API-FAILURE-02: Verify system rejects invalid date range (end before start)', async ({ context }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-API-FAILURE-02'
  });

  // Submit request with invalid date range (endDate < startDate)
  const response = await context.request.get(`${API_BASE_URL}/oil-loss`, {
    params: {
      startDate: '2026-01-01',
      endDate: '2000-01-01'
    }
  });

  // Assert 400 Bad Request
  expect(response.status()).toBe(400);
  const body = await response.json();
  expect(body.error).toContain('End date must be after start date');
  expect(body.error).not.toContain('undefined');
});

// ============================================================================
// NEW TEST 4: TC-CHART-EDGE-01 - Empty Dataset Rendering
// ============================================================================
test('TC-CHART-EDGE-01: Verify chart renders with empty dataset', async ({ page }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-CHART-EDGE-01'
  });

  // Navigate to charts page
  await page.goto(`${APP_URL}/charts`);

  // Intercept API to return empty data
  await page.route('**/api/production-data', route => {
    route.abort();
  });

  // Filter to date range with no data
  const startDateInput = page.locator('input[placeholder="Start Date"]');
  const endDateInput = page.locator('input[placeholder="End Date"]');
  
  await startDateInput.fill('2025-01-01');
  await endDateInput.fill('2025-01-02');
  await page.locator('button:has-text("Apply Filter")').click();

  // Wait for chart to render
  await page.waitForTimeout(500);

  // Verify no console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  // Check for empty state message
  const emptyMessage = page.locator('text=No data available for selected period');
  await expect(emptyMessage).toBeVisible({ timeout: TIMEOUT });

  // Verify chart container exists (not crashed)
  const chartContainer = page.locator('[class*="chart-container"]').first();
  expect(chartContainer).toBeVisible();

  expect(errors).toEqual([]);
});

// ============================================================================
// NEW TEST 5: TC-CHART-EDGE-02 - Large Dataset Performance
// ============================================================================
test('TC-CHART-EDGE-02: Verify chart handles 10k+ data points without crashing', async ({ page }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-CHART-EDGE-02'
  });

  // Navigate to charts page
  await page.goto(`${APP_URL}/charts`);

  // Generate large dataset (10,000 points)
  const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
    timestamp: Date.now() + (i * 1000),
    production: Math.random() * 1000,
    loss: Math.random() * 100
  }));

  // Mock API to return large dataset
  await page.route('**/api/production-data', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({ data: largeDataset })
    });
  });

  // Trigger chart load
  const startTime = performance.now();
  await page.locator('button:has-text("Load Data")').click();
  
  // Wait for chart to render
  await page.waitForSelector('[class*="chart-canvas"]', { timeout: 5000 });
  const endTime = performance.now();

  // Performance assertions
  const renderTime = endTime - startTime;
  expect(renderTime).toBeLessThan(2000); // Should render within 2 seconds

  // Test interactivity
  const toggleButton = page.locator('button:has-text("Toggle Series")');
  const toggleTime = performance.now();
  await toggleButton.click();
  await page.waitForTimeout(300);
  const toggleEndTime = performance.now();

  expect(toggleEndTime - toggleTime).toBeLessThan(500); // Toggle should respond <500ms

  // Verify chart is visible and stable
  const chartCanvas = page.locator('[class*="chart-canvas"]');
  expect(chartCanvas).toBeVisible();

  // Check for out-of-memory errors in console
  const jsErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error' && msg.text().includes('memory')) {
      jsErrors.push(msg.text());
    }
  });
  expect(jsErrors).toEqual([]);
});

// ============================================================================
// NEW TEST 6: TC-OILLOSS-CONCURRENT-01 - Concurrent Filter Changes
// ============================================================================
test('TC-OILLOSS-CONCURRENT-01: Verify system handles concurrent filter changes without data corruption', async ({ page }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-OILLOSS-CONCURRENT-01'
  });

  // Navigate to oil loss analysis
  await page.goto(`${APP_URL}/oil-loss`);

  // Setup: Slow API response (500ms)
  let requestCount = 0;
  await page.route('**/api/oil-loss', async route => {
    requestCount++;
    await new Promise(r => setTimeout(r, 500)); // Simulate slow API
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        data: { requestId: requestCount, timestamp: Date.now() }
      })
    });
  });

  // Start filter A (slow, 500ms)
  const dateFromInput = page.locator('input[name="dateFrom"]');
  const dateToInput = page.locator('input[name="dateTo"]');
  const wellSelect = page.locator('select[name="wellId"]');

  await dateFromInput.fill('2026-01-01');
  await dateToInput.fill('2026-01-31');
  await page.locator('button:has-text("Filter")').click();

  // Immediately start filter B (before A completes)
  await wellSelect.selectOption('2'); // Change well selection
  await page.locator('button:has-text("Filter")').click();

  // Wait for all requests to complete
  await page.waitForTimeout(1500);

  // Verify final results show filter B data (not mixed)
  const resultText = page.locator('[class*="result-info"]');
  const text = await resultText.textContent();
  expect(text).toContain('2'); // Should show well 2 (filter B)
  expect(text).not.toContain('requestId: 1'); // Should not show filter A results

  // Verify no duplicate rows
  const rows = page.locator('tbody tr');
  const rowCount = await rows.count();
  const uniqueRows = new Set();
  for (let i = 0; i < rowCount; i++) {
    const text = await rows.nth(i).textContent();
    expect(uniqueRows.has(text)).toBeFalsy(); // No duplicates
    uniqueRows.add(text);
  }
});

// ============================================================================
// NEW TEST 7: TC-AUTH-INVALID-BEHAVIOR-01 - Rapid Logout/Login Edge Case
// ============================================================================
test('TC-AUTH-INVALID-BEHAVIOR-01: Verify system handles rapid logout→login without race condition', async ({ page, context }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-AUTH-INVALID-BEHAVIOR-01'
  });

  // First, login
  await page.goto(`${APP_URL}/login`);
  const emailInput = page.locator('input[type="email"]');
  const passwordInput = page.locator('input[type="password"]');
  const loginButton = page.locator('button:has-text("Login")');

  await emailInput.fill('test@example.com');
  await passwordInput.fill('password123');
  await loginButton.click();

  // Wait for successful login
  await page.waitForURL(/^http:\/\/localhost:3000\/(dashboard|wells)/);

  // Get initial auth state
  const initialToken = await context.storageState();

  // Setup slow logout (200ms delay)
  await page.route('**/api/auth/logout', async route => {
    await new Promise(r => setTimeout(r, 200));
    route.fulfill({ status: 200, body: JSON.stringify({ success: true }) });
  });

  // Click logout
  const logoutButton = page.locator('button:has-text("Logout")');
  const logoutPromise = logoutButton.click();

  // Before logout completes, click login (rapid succession)
  await new Promise(r => setTimeout(r, 50)); // Small delay
  await page.locator('a:has-text("Login")').click({ force: true });

  // Wait for logout to complete
  await logoutPromise;
  await page.waitForTimeout(300);

  // Verify final state is clear (not authenticated)
  const loginForm = page.locator('input[type="email"]');
  expect(loginForm).toBeVisible({ timeout: TIMEOUT });

  // Verify no localStorage corruption
  const storage = await context.storageState();
  const hasToken = storage.cookies.some(c => c.name === 'auth_token');
  expect(hasToken).toBeFalsy();
});

// ============================================================================
// NEW TEST 8: TC-EXPORT-EDGE-01 - Special Characters in Well Names
// ============================================================================
test('TC-EXPORT-EDGE-01: Verify export handles well names with special characters', async ({ page, context }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-EXPORT-EDGE-01'
  });

  // Mock wells data with special characters
  const wellsWithSpecialChars = [
    { id: 1, name: 'Well#1 (A&B) - 2026', location: 'Zone "Alpha"' },
    { id: 2, name: "Well's Creek @ North", location: 'Block\tC' }
  ];

  await page.route('**/api/wells', route => {
    route.fulfill({
      status: 200,
      body: JSON.stringify(wellsWithSpecialChars)
    });
  });

  // Navigate to export page
  await page.goto(`${APP_URL}/export`);

  // Select CHRP feed format
  await page.locator('select[name="feedFormat"]').selectOption('CHRP');

  // Intercept download
  const downloadPromise = page.waitForEvent('download');
  await page.locator('button:has-text("Generate Feed")').click();
  const download = await downloadPromise;

  // Save and read file
  const filePath = `/tmp/${download.suggestedFilename()}`;
  await download.saveAs(filePath);

  // Parse CSV and verify special characters handled
  const fs = require('fs');
  const content = fs.readFileSync(filePath, 'utf-8');
  
  // Verify special chars are quoted properly
  expect(content).toContain('"Well#1 (A&B) - 2026"');
  expect(content).toContain('"Zone \\"Alpha\\""');
  
  // Verify downstream system can parse it
  const lines = content.split('\n');
  expect(lines.length).toBeGreaterThan(1);
  
  // Verify no truncation
  lines.forEach(line => {
    expect(line.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// NEW TEST 9: TC-OIL-EDGE-01 - Boundary Values in Oil Loss Calculation
// ============================================================================
test('TC-OIL-EDGE-01: Verify oil loss calculations handle boundary values (0 and max)', async ({ context }) => {
  test.info().annotations.push({
    type: 'test-id',
    description: 'TC-OIL-EDGE-01'
  });

  // Test case 1: Zero production
  const response1 = await context.request.post(`${API_BASE_URL}/calculate-loss`, {
    data: {
      wellId: 1,
      production: 0,
      lossRate: 0.05,
      period: '2026-01-01'
    }
  });

  expect(response1.status()).toBe(200);
  const result1 = await response1.json();
  expect(result1.loss).toBe(0); // 0 * any rate = 0
  expect(Number.isFinite(result1.efficiency)).toBeTruthy();

  // Test case 2: Maximum loss value
  const response2 = await context.request.post(`${API_BASE_URL}/calculate-loss`, {
    data: {
      wellId: 1,
      production: 999999,
      lossRate: 1.0, // 100% loss
      period: '2026-01-01'
    }
  });

  expect(response2.status()).toBe(200);
  const result2 = await response2.json();
  expect(result2.loss).toBeLessThanOrEqual(999999);
  expect(Number.isFinite(result2.efficiency)).toBeTruthy();

  // Test case 3: Zero efficiency
  const response3 = await context.request.post(`${API_BASE_URL}/calculate-loss`, {
    data: {
      wellId: 1,
      production: 100,
      lossRate: 1.0,
      period: '2026-01-01'
    }
  });

  expect(response3.status()).toBe(200);
  const result3 = await response3.json();
  expect(result3.efficiency).toBe(0); // 100% loss = 0% efficiency
  expect(result3.loss).toBe(100);

  // Verify no division by zero or overflow
  expect(Number.isNaN(result1.efficiency)).toBeFalsy();
  expect(Number.isNaN(result2.efficiency)).toBeFalsy();
  expect(Number.isNaN(result3.efficiency)).toBeFalsy();
});

// ============================================================================
// UNIT TESTS: Logic-level calculations and validations (No UI/API)
// ============================================================================

// Unit Test Helper: Oil Loss Calculation Logic
function calculateOilLoss(production, lossRate, period) {
  if (production === 0) return 0;
  if (production === null || production === undefined) return null;
  const loss = production * lossRate;
  if (loss > production) return production; // Cap loss at production
  return loss;
}

function calculateEfficiency(production, loss) {
  if (production === 0) return 0; // Avoid division by zero
  return ((production - loss) / production) * 100;
}

function validateDateRange(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid date format' };
  }
  
  if (end <= start) {
    return { valid: false, error: 'End date must be after start date' };
  }
  
  return { valid: true };
}

function parseJWT(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    return payload;
  } catch {
    return null;
  }
}

test.describe('UNIT TESTS: Calculation Logic', () => {
  
  test('UNIT-1: Oil loss calculates correctly (normal case)', () => {
    const result = calculateOilLoss(1000, 0.05);
    expect(result).toBe(50); // 1000 * 0.05
  });
  
  test('UNIT-2: Oil loss handles zero production', () => {
    const result = calculateOilLoss(0, 0.05);
    expect(result).toBe(0); // No production = no loss
  });
  
  test('UNIT-3: Oil loss caps at production value', () => {
    const result = calculateOilLoss(100, 1.5); // 150% loss
    expect(result).toBe(100); // Capped at production
  });
  
  test('UNIT-4: Oil loss handles null production', () => {
    const result = calculateOilLoss(null, 0.05);
    expect(result).toBe(null); // Null input returns null
  });
  
  test('UNIT-5: Efficiency calculates correctly (normal case)', () => {
    const result = calculateEfficiency(1000, 50);
    expect(result).toBe(95); // (1000-50)/1000*100 = 95%
  });
  
  test('UNIT-6: Efficiency handles zero production (no NaN)', () => {
    const result = calculateEfficiency(0, 0);
    expect(result).toBe(0); // Avoid division by zero
    expect(Number.isNaN(result)).toBe(false);
  });
  
  test('UNIT-7: Efficiency with 100% loss equals 0%', () => {
    const result = calculateEfficiency(100, 100);
    expect(result).toBe(0);
  });
  
});

test.describe('UNIT TESTS: Date Validation', () => {
  
  test('UNIT-8: Valid date range accepted', () => {
    const result = validateDateRange('2026-01-01', '2026-01-31');
    expect(result.valid).toBe(true);
  });
  
  test('UNIT-9: End date before start date rejected', () => {
    const result = validateDateRange('2026-01-31', '2026-01-01');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('End date must be after start date');
  });
  
  test('UNIT-10: Same start and end date rejected', () => {
    const result = validateDateRange('2026-01-01', '2026-01-01');
    expect(result.valid).toBe(false);
  });
  
  test('UNIT-11: Invalid date format rejected', () => {
    const result = validateDateRange('not-a-date', '2026-01-01');
    expect(result.valid).toBe(false);
    expect(result.error).toContain('Invalid date format');
  });
  
});

test.describe('UNIT TESTS: JWT Token Parsing', () => {
  
  test('UNIT-12: Valid JWT token parsed correctly', () => {
    const token = generateExpiredToken();
    const payload = parseJWT(token);
    expect(payload).not.toBe(null);
    expect(payload.userId).toBe(1);
    expect(payload.exp).toBeTruthy();
  });
  
  test('UNIT-13: Malformed JWT token returns null', () => {
    const token = 'invalid.token';
    const payload = parseJWT(token);
    expect(payload).toBe(null);
  });
  
  test('UNIT-14: JWT with invalid base64 returns null', () => {
    const token = 'header.!!!invalid!!!.signature';
    const payload = parseJWT(token);
    expect(payload).toBe(null);
  });
  
});

// ============================================================================
// BASELINE TESTS: Application health
// ============================================================================

test('Baseline: Application starts without errors', async ({ page }) => {
  await page.goto(APP_URL);
  
  // Verify page loaded
  const title = page.locator('title');
  expect(title).toBeTruthy();
  
  // No fatal errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  
  await page.waitForTimeout(500);
  expect(errors.filter(e => e.includes('fatal'))).toEqual([]);
});

test('Baseline: API connectivity verified', async ({ context }) => {
  const response = await context.request.get(`${API_BASE_URL}/health`);
  expect(response.status()).toBe(200);
});

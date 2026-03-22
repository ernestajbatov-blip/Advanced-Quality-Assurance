/**
 * Test Helper Utilities for Playwright Tests
 * Ada Oil App QA Testing - Assignment 1
 */

/**
 * Wait for API calls to complete
 * @param {Page} page - Playwright page object
 * @param {String} urlPattern - URL pattern to match
 * @param {Number} timeout - Timeout in milliseconds
 */
export async function waitForAPIResponse(page, urlPattern, timeout = 5000) {
  return new Promise((resolve, reject) => {
    const handler = (response) => {
      if (response.url().includes(urlPattern)) {
        page.off('response', handler);
        clearTimeout(timeoutId);
        resolve(response);
      }
    };
    
    const timeoutId = setTimeout(() => {
      page.off('response', handler);
      reject(new Error(`API response for ${urlPattern} not received within ${timeout}ms`));
    }, timeout);
    
    page.on('response', handler);
  });
}

/**
 * Login to application
 * @param {Page} page - Playwright page object
 * @param {String} username - Username
 * @param {String} password - Password
 */
export async function loginToApp(page, username, password) {
  const usernameField = page.locator('input[type="text"]').first();
  const passwordField = page.locator('input[type="password"]');
  const submitButton = page.locator('button').filter({ hasText: 'Войти' });
  
  await usernameField.fill(username);
  await passwordField.fill(password);
  await submitButton.click();
  
  await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
}

/**
 * Logout from application
 * @param {Page} page - Playwright page object
 */
export async function logoutFromApp(page) {
  const logoutButton = page.locator('button:has-text("Выход"), button:has-text("Logout")').first();
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL('http://localhost:3000/', { timeout: 10000 });
  }
}

/**
 * Get all chart data points from rendered chart
 * @param {Page} page - Playwright page object
 * @returns {Promise<Array>} Array of data points
 */
export async function getChartDataPoints(page) {
  const dataPoints = [];
  const elements = page.locator('[data-value], [title*="value"]');
  
  const count = await elements.count();
  for (let i = 0; i < count; i++) {
    const value = await elements.nth(i).getAttribute('data-value') || 
                  await elements.nth(i).getAttribute('title');
    if (value) dataPoints.push(value);
  }
  
  return dataPoints;
}

/**
 * Navigate to specific well
 * @param {Page} page - Playwright page object
 * @param {String} wellId - Well ID or name
 */
export async function navigateToWell(page, wellId) {
  const wellLink = page.locator(`text=${wellId}, [data-well-id="${wellId}"]`).first();
  
  if (await wellLink.isVisible()) {
    await wellLink.click();
    await page.waitForTimeout(2000);
  } else {
    throw new Error(`Well ${wellId} not found on page`);
  }
}

/**
 * Take screenshot for debugging
 * @param {Page} page - Playwright page object
 * @param {String} name - Screenshot name
 */
export async function takeDebugScreenshot(page, name) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({ 
    path: `QA/test-reports/screenshots/${name}-${timestamp}.png`,
    fullPage: true 
  });
}

/**
 * Clear browser storage
 * @param {Page} page - Playwright page object
 */
export async function clearBrowserStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Check console for errors
 * @param {Page} page - Playwright page object
 * @returns {Promise<Array>} Array of error messages
 */
export async function getConsoleErrors(page) {
  const errors = [];
  
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  return errors;
}

/**
 * Intercept and log network requests
 * @param {Page} page - Playwright page object
 * @param {String} pattern - URL pattern to intercept
 */
export async function interceptRequests(page, pattern) {
  const requests = [];
  
  page.on('request', (request) => {
    if (request.url().includes(pattern)) {
      requests.push({
        url: request.url(),
        method: request.method(),
        time: new Date().toISOString()
      });
    }
  });
  
  return requests;
}

/**
 * Format test result for reporting
 * @param {String} testName - Test name
 * @param {Boolean} passed - Test result
 * @param {Number} duration - Test duration in ms
 * @returns {String} Formatted test result
 */
export function formatTestResult(testName, passed, duration) {
  const status = passed ? '✓' : '✗';
  const time = `${duration}ms`;
  return `${status} ${testName} (${time})`;
}

export default {
  waitForAPIResponse,
  loginToApp,
  logoutFromApp,
  getChartDataPoints,
  navigateToWell,
  takeDebugScreenshot,
  clearBrowserStorage,
  getConsoleErrors,
  interceptRequests,
  formatTestResult,
};

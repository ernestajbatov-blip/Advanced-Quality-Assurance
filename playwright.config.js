import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright Configuration for Ada Oil App QA Testing
 * Assignment 1: QA Environment Setup & Test Infrastructure
 */

export default defineConfig({
  testDir: './QA/test-scripts/e2e',
  
  /* Run tests in files in parallel */
  fullyParallel: false, // Disable parallel to avoid flakiness with single backend instance
  
  /* Fail the build on CI if you accidentally left test.only in the source code */
  forbidOnly: !!process.env.CI,
  
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  
  /* Opt out of parallel workers on CI for stability */
  workers: process.env.CI ? 1 : 1,
  
  /* Reporter to use */
  reporter: [
    ['html', { outputFolder: 'QA/test-reports/playwright', open: 'never' }],
    ['json', { outputFile: 'QA/test-reports/playwright/results.json' }],
    ['junit', { outputFile: 'QA/test-reports/playwright/results.xml' }],
    ['list'],
  ],
  
  /* Shared settings for all the projects below */
  use: {
    /* Base URL to use in actions like `await page.goto('/')` */
    baseURL: 'http://localhost:3000',
    
    /* Collect trace when retrying the failed test */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Video recording on failure */
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
  
  /* Global timeout for each test */
  timeout: 30 * 1000,
  
  /* Expect timeout */
  expect: {
    timeout: 5 * 1000,
  },
});

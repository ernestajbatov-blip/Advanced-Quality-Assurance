// @ts-nocheck
import { test, expect } from '@playwright/test';
import { loginToApp, waitForAPIResponse } from './utils/test-helpers';

test.describe('Chart And Visualization', () => {
  test.beforeEach(async ({ page }) => {
    await loginToApp(page);
  });

  test('TS-Chart-001 @smoke: chart renders and loads 2-hour data', async ({ page }) => {
    const twoHoursResponsePromise = waitForAPIResponse(page, '/api/2hours?');

    await page.reload();

    const response = await twoHoursResponsePromise;
    expect(response.ok()).toBeTruthy();

    const chart = page.locator('svg').first();
    await expect(chart).toBeVisible({ timeout: 15000 });

    const plottedSeries = page.locator(
      'svg path[stroke="#228B22"], svg path[stroke="#B22222"], svg path[stroke="#888888"]'
    );
    await expect(plottedSeries.first()).toBeVisible();
  });

  test('TS-Chart-002: switching liquid and oil modes updates control state', async ({ page }) => {
    const liquidRadio = page.locator('input#liquid');
    const oilRadio = page.locator('input#oil');

    await expect(liquidRadio).toBeChecked();
    await expect(oilRadio).not.toBeChecked();

    await page.locator('label[for="oil"]').click();
    await expect(oilRadio).toBeChecked();
    await expect(liquidRadio).not.toBeChecked();

    await page.locator('label[for="liquid"]').click();
    await expect(liquidRadio).toBeChecked();
    await expect(oilRadio).not.toBeChecked();

    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('TS-Chart-003: accumulation toggle is interactive and preserves chart visibility', async ({ page }) => {
    const accumulationToggle = page.locator('input[type="checkbox"]').first();
    await expect(accumulationToggle).toBeVisible();

    await expect(accumulationToggle).toBeChecked();
    await accumulationToggle.uncheck();
    await expect(accumulationToggle).not.toBeChecked();

    await accumulationToggle.check();
    await expect(accumulationToggle).toBeChecked();

    await expect(page.locator('svg').first()).toBeVisible();
  });

  test('TS-Chart-004: archive dates endpoint is reachable from chart view', async ({ page }) => {
    const datesResponsePromise = waitForAPIResponse(page, '/api/2hours/archive/dates');

    await page.reload();

    const response = await datesResponsePromise;
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);

    await expect(page.locator('input[placeholder="Выберите дату"]')).toBeVisible();
  });
});
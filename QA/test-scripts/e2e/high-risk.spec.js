import { test, expect } from '@playwright/test';

const API = '/api';
const REQUIRE_NON_EMPTY_DATA = !!process.env.CI;

test.describe('High-Risk Coverage: Oil Loss and Excel Export', () => {
  test('TS-Oil-001: oil-loss wells endpoint returns well list', async ({ request }) => {
    const response = await request.get(`${API}/oil-loss/wells`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    if (REQUIRE_NON_EMPTY_DATA) {
      expect(body.length).toBeGreaterThan(0);
    }

    if (body.length > 0) {
      expect(body[0]).toEqual(
        expect.objectContaining({
          well: expect.stringMatching(/^BSK_/),
        })
      );
    }
  });

  test('TS-Oil-002: oil-loss endpoint returns dataset with required fields', async ({ request }) => {
    const wellsResponse = await request.get(`${API}/oil-loss/wells`);
    expect(wellsResponse.ok()).toBeTruthy();
    const wellsBody = await wellsResponse.json();

    const targetWell = Array.isArray(wellsBody) && wellsBody.length > 0
      ? wellsBody[0].well
      : undefined;

    const response = await request.get(`${API}/oil-loss`, {
      params: {
        well: targetWell,
      },
    });
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();

    if (REQUIRE_NON_EMPTY_DATA) {
      expect(body.length).toBeGreaterThan(0);
    }

    if (body.length > 0) {
      expect(body[0]).toEqual(
        expect.objectContaining({
          well: expect.any(String),
          date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
          tm_oil: expect.any(Number),
          tm_fluid: expect.any(Number),
          well_work_time: expect.any(Number),
        })
      );
    }
  });

  test('TS-Oil-003: oil-loss analysis validates payload and rejects empty input', async ({ request }) => {
    const response = await request.post(`${API}/oil-loss/analysis`, {
      data: {},
    });

    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body).toEqual(
      expect.objectContaining({
        error: expect.stringContaining('records array is required'),
      })
    );
  });

  test('TS-Oil-004: oil-loss endpoint supports date-range filtering contract', async ({ request }) => {
    const fullResponse = await request.get(`${API}/oil-loss`);
    expect(fullResponse.ok()).toBeTruthy();

    const fullBody = await fullResponse.json();
    expect(Array.isArray(fullBody)).toBeTruthy();

    if (REQUIRE_NON_EMPTY_DATA) {
      expect(fullBody.length).toBeGreaterThan(0);
    }

    if (fullBody.length > 0) {
      const sample = fullBody[0];
      const filteredResponse = await request.get(`${API}/oil-loss`, {
        params: {
          well: sample.well,
          startDate: sample.date,
          endDate: sample.date,
        },
      });

      expect(filteredResponse.ok()).toBeTruthy();
      const filteredBody = await filteredResponse.json();
      expect(Array.isArray(filteredBody)).toBeTruthy();

      for (const row of filteredBody) {
        expect(row.well).toBe(sample.well);
        expect(row.date).toBe(sample.date);
      }
    }
  });

  test('TS-Export-001: CHRP archive report endpoint returns export-ready rows', async ({ request }) => {
    const response = await request.get(`${API}/chrp/archive/report`, {
      params: {
        startDate: '2025-01-15',
        endDate: '2025-01-15',
        well: 'BSK_0001',
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();

    if (REQUIRE_NON_EMPTY_DATA) {
      expect(body.length).toBeGreaterThan(0);
    }

    if (body.length > 0) {
      expect(body[0]).toEqual(
        expect.objectContaining({
          'Скважина': expect.any(String),
          'Дата опроса': expect.any(String),
          'Напряжение': expect.any(Number),
        })
      );
    }
  });

  test('TS-Export-002: AGZU archive report endpoint returns export-ready rows', async ({ request }) => {
    const response = await request.get(`${API}/agzu/archive/report`, {
      params: {
        startDate: '2025-01-15',
        endDate: '2025-01-15',
        well: 'BSK_0001',
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();

    if (REQUIRE_NON_EMPTY_DATA) {
      expect(body.length).toBeGreaterThan(0);
    }

    if (body.length > 0) {
      expect(body[0]).toEqual(
        expect.objectContaining({
          'Скважина': expect.any(String),
          'Дата': expect.any(String),
          'Жидкость': expect.any(Number),
        })
      );
    }
  });
});

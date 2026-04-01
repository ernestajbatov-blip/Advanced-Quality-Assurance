import { test, expect } from '@playwright/test';
import { TEST_USERS, ensureUserCredentials } from './utils/test-helpers';

const API = '/api';
const REQUIRE_NON_EMPTY_ARCHIVE = !!process.env.CI;

test.describe('API Integration', () => {
  test('TS-API-001 @smoke: health endpoint returns ok', async ({ request }) => {
    const response = await request.get(`${API}/health`);
    expect(response.ok()).toBeTruthy();
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

  test('TS-API-002 @smoke: login succeeds with valid credentials', async ({ request }) => {
    await ensureUserCredentials(request, TEST_USERS.regular);

    const response = await request.post(`${API}/auth/login`, {
      data: {
        login: TEST_USERS.regular.login,
        password: TEST_USERS.regular.password,
      },
    });

    if (!response.ok()) {
      const bodyText = await response.text();
      throw new Error(
        `Login API failed for '${TEST_USERS.regular.login}' with status ${response.status()}. ` +
        `Set E2E_LOGIN/E2E_PASSWORD to valid local credentials. Response: ${bodyText}`
      );
    }

    const body = await response.json();

    expect(body).toEqual(
      expect.objectContaining({
        id: expect.any(Number),
        login: TEST_USERS.regular.login,
        name: expect.any(String),
      })
    );
  });

  test('TS-API-003: login fails with invalid credentials', async ({ request }) => {
    const response = await request.post(`${API}/auth/login`, {
      data: {
        login: TEST_USERS.regular.login,
        password: 'incorrect_password',
      },
    });

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual(
      expect.objectContaining({ error: expect.any(String) })
    );
  });

  test('TS-API-004: wells endpoint returns seeded BSK wells', async ({ request }) => {
    const response = await request.get(`${API}/wells`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(Array.isArray(body)).toBeTruthy();
    expect(body.length).toBeGreaterThan(0);

    expect(body[0]).toEqual(
      expect.objectContaining({
        well: expect.stringMatching(/^BSK/),
      })
    );
  });

  test('TS-API-005: 2-hour current and archive endpoints return data', async ({ request }) => {
    const currentResponse = await request.get(`${API}/2hours?oil_field=BSK`);
    expect(currentResponse.ok()).toBeTruthy();
    const currentBody = await currentResponse.json();
    expect(Array.isArray(currentBody)).toBeTruthy();
    expect(currentBody.length).toBeGreaterThan(0);
    expect(currentBody[0]).toEqual(
      expect.objectContaining({
        time: expect.any(String),
      })
    );

    const datesResponse = await request.get(`${API}/2hours/archive/dates?oil_field=BSK`);
    expect(datesResponse.ok()).toBeTruthy();
    const datesBody = await datesResponse.json();
    expect(Array.isArray(datesBody)).toBeTruthy();
    expect(datesBody.length).toBeGreaterThan(0);

    const archiveDates = [...new Set(datesBody
      .map((entry) => entry?.date)
      .map((rawDate) => {
        if (!rawDate) {
          return null;
        }

        if (typeof rawDate === 'string') {
          return rawDate.slice(0, 10);
        }

        const parsedDate = new Date(rawDate);
        if (Number.isNaN(parsedDate.getTime())) {
          return null;
        }

        return parsedDate.toISOString().slice(0, 10);
      })
      .filter((normalizedDate) => /^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)))]
      .slice(0, 10);
    expect(archiveDates.length).toBeGreaterThan(0);

    let foundArchiveData = false;

    for (const archiveDate of archiveDates) {
      const archiveResponse = await request.get(
        `${API}/2hours/archive?oil_field=BSK&date=${encodeURIComponent(archiveDate)}`
      );
      expect(archiveResponse.ok()).toBeTruthy();

      const archiveBody = await archiveResponse.json();
      expect(Array.isArray(archiveBody)).toBeTruthy();

      if (archiveBody.length > 0) {
        foundArchiveData = true;
        break;
      }
    }

    if (REQUIRE_NON_EMPTY_ARCHIVE) {
      expect(foundArchiveData).toBeTruthy();
    }
  });
});

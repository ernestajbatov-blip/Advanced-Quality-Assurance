import { expect } from '@playwright/test';

export const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000';

export const TEST_USERS = {
  regular: {
    login: process.env.E2E_LOGIN || 'user_test',
    password: process.env.E2E_PASSWORD || 'password456',
  },
  admin: {
    login: process.env.E2E_ADMIN_LOGIN || 'admin_test',
    password: process.env.E2E_ADMIN_PASSWORD || 'admin123',
  },
};

function getProvisionedUserName(credentials) {
  return credentials.login === TEST_USERS.admin.login
    ? 'E2E Admin User'
    : 'E2E Test User';
}

export async function ensureUserCredentials(apiContext, credentials = TEST_USERS.regular) {
  const loginResponse = await apiContext.post('/api/auth/login', {
    data: {
      login: credentials.login,
      password: credentials.password,
    },
  });

  if (loginResponse.ok()) {
    return;
  }

  const createResponse = await apiContext.post('/api/admin/users', {
    data: {
      login: credentials.login,
      name: getProvisionedUserName(credentials),
      password: credentials.password,
      is_admin: credentials.login === TEST_USERS.admin.login,
      available_ngdu_id: 1,
    },
  });

  if (createResponse.ok()) {
    return;
  }

  if (createResponse.status() !== 400) {
    const createErrorBody = await createResponse.text();
    throw new Error(
      `Unable to provision test user '${credentials.login}'. ` +
      `Admin create returned ${createResponse.status()}: ${createErrorBody}`
    );
  }

  const usersResponse = await apiContext.get('/api/admin/users');
  if (!usersResponse.ok()) {
    const usersErrorBody = await usersResponse.text();
    throw new Error(
      `Unable to repair test user '${credentials.login}'. ` +
      `Admin users list returned ${usersResponse.status()}: ${usersErrorBody}`
    );
  }

  const users = await usersResponse.json();
  const existingUser = Array.isArray(users)
    ? users.find((candidate) => candidate.login === credentials.login)
    : undefined;

  if (!existingUser?.id) {
    throw new Error(
      `User '${credentials.login}' not found after duplicate create response. ` +
      'Set E2E_LOGIN/E2E_PASSWORD to valid local credentials or allow admin user management endpoints.'
    );
  }

  const updateResponse = await apiContext.put(`/api/admin/users/${existingUser.id}`, {
    data: {
      login: credentials.login,
      name: existingUser.name || getProvisionedUserName(credentials),
      password: credentials.password,
      is_admin: existingUser.is_admin === 1,
      available_ngdu_id: existingUser.available_ngdu_id ?? 1,
    },
  });

  if (!updateResponse.ok()) {
    const updateErrorBody = await updateResponse.text();
    throw new Error(
      `Failed to update password for test user '${credentials.login}'. ` +
      `Admin update returned ${updateResponse.status()}: ${updateErrorBody}`
    );
  }

  const verifyLoginResponse = await apiContext.post('/api/auth/login', {
    data: {
      login: credentials.login,
      password: credentials.password,
    },
  });

  if (!verifyLoginResponse.ok()) {
    const verifyBody = await verifyLoginResponse.text();
    throw new Error(
      `Test user '${credentials.login}' still cannot authenticate after provisioning. ` +
      `Login returned ${verifyLoginResponse.status()}: ${verifyBody}`
    );
  }
}

export async function waitForAPIResponse(page, pathPart, timeout = 10000) {
  return page.waitForResponse(
    (response) => response.url().includes(pathPart),
    { timeout }
  );
}

export async function gotoLogin(page) {
  await page.goto('/');
  await expect(page.getByText('Вход в систему')).toBeVisible();
}

export async function loginToApp(page, credentials = TEST_USERS.regular) {
  await ensureUserCredentials(page.request, credentials);
  await gotoLogin(page);

  await page.locator('input[name="login"]').fill(credentials.login);
  await page.locator('input[name="password"]').fill(credentials.password);
  await page.getByRole('button', { name: 'Войти' }).click();

  const settingsButton = page.getByTitle('Настройки пользователя');
  const loginError = page.getByText('Неверный логин или пароль');

  await Promise.race([
    settingsButton.waitFor({ state: 'visible', timeout: 15000 }),
    loginError.waitFor({ state: 'visible', timeout: 15000 }),
  ]);

  if (await loginError.isVisible().catch(() => false)) {
    throw new Error(
      `E2E login failed for '${credentials.login}'. ` +
      `Set E2E_LOGIN and E2E_PASSWORD to valid local credentials before running tests.`
    );
  }

  await expect(settingsButton).toBeVisible({ timeout: 15000 });
  await expect(page.locator('input[name="login"]')).toHaveCount(0);
}

export async function logoutFromApp(page) {
  const settingsButton = page.getByTitle('Настройки пользователя');
  await expect(settingsButton).toBeVisible({ timeout: 10000 });
  await settingsButton.click();

  await page.getByRole('button', { name: 'Выйти' }).click();
  await expect(page.getByText('Вход в систему')).toBeVisible();
}

export async function expectStoredUser(page) {
  const raw = await page.evaluate(() => localStorage.getItem('user'));
  expect(raw).toBeTruthy();

  const user = JSON.parse(raw);
  expect(user).toEqual(
    expect.objectContaining({
      id: expect.any(Number),
      login: expect.any(String),
      name: expect.any(String),
    })
  );

  return user;
}

export async function clearBrowserStorage(page) {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export default {
  BASE_URL,
  TEST_USERS,
  ensureUserCredentials,
  waitForAPIResponse,
  gotoLogin,
  loginToApp,
  logoutFromApp,
  expectStoredUser,
  clearBrowserStorage,
};

// @ts-nocheck
import { test, expect } from '@playwright/test';
import {
  TEST_USERS,
  clearBrowserStorage,
  expectStoredUser,
  gotoLogin,
  loginToApp,
  logoutFromApp,
} from './utils/test-helpers';

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await clearBrowserStorage(page);
    await page.goto('/');
  });

  test('TS-Auth-001 @smoke: login form is visible and usable', async ({ page }) => {
    await gotoLogin(page);

    await expect(page.locator('input[name="login"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Войти' })).toBeEnabled();
  });

  test('TS-Auth-002: invalid credentials are rejected', async ({ page }) => {
    await gotoLogin(page);

    await page.locator('input[name="login"]').fill('invalid_user');
    await page.locator('input[name="password"]').fill('wrong_password');
    await page.getByRole('button', { name: 'Войти' }).click();

    await expect(page.getByText('Неверный логин или пароль')).toBeVisible();
    await expect(page.getByText('Вход в систему')).toBeVisible();
  });

  test('TS-Auth-003 @smoke: valid login persists user in localStorage', async ({ page }) => {
    await loginToApp(page, TEST_USERS.regular);

    const user = await expectStoredUser(page);
    expect(user.login).toBe(TEST_USERS.regular.login);

    await page.reload();
    await expect(page.getByText('Мониторинг добычи')).toBeVisible();
  });

  test('TS-Auth-004: logout clears authenticated state', async ({ page }) => {
    await loginToApp(page, TEST_USERS.regular);
    await logoutFromApp(page);

    const storedUser = await page.evaluate(() => localStorage.getItem('user'));
    expect(storedUser).toBeNull();
    await expect(page.getByText('Вход в систему')).toBeVisible();
  });
});

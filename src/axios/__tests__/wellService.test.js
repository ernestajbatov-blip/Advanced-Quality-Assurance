/**
 * Unit tests for src/axios/wellService.js
 * Stryker mutation-testing-friendly unit tests.
 *
 * Strategy: mock the internal `./api` module so api.js (which calls
 * window.location at import time) is never executed during tests.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// vi.mock is hoisted to the top of the file, so we must use vi.hoisted()
// to create variables that are accessible inside the factory function.
const mockApi = vi.hoisted(() => ({
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
}));

// Replace the api module with our mock
vi.mock('../api.js', () => ({ default: mockApi }));

// Now import wellService (api.js is replaced by the mock above)
import * as wellService from '../wellService.js';

// ── reset between tests ───────────────────────────────────────────────────────
beforeEach(() => {
  vi.clearAllMocks();
  mockApi.get.mockResolvedValue({ data: [], status: 200 });
  mockApi.post.mockResolvedValue({ data: {}, status: 200 });
  mockApi.put.mockResolvedValue({ data: {}, status: 200 });
  mockApi.delete.mockResolvedValue({ data: {}, status: 200 });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetch2Hours', () => {
  it('calls GET /2hours with default oil_field BSK', async () => {
    await wellService.fetch2Hours();
    expect(mockApi.get).toHaveBeenCalledWith('/2hours', { params: { oil_field: 'BSK' } });
  });

  it('calls GET /2hours with a custom oil_field', async () => {
    await wellService.fetch2Hours('KNG');
    expect(mockApi.get).toHaveBeenCalledWith('/2hours', { params: { oil_field: 'KNG' } });
  });

  it('returns the axios response', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [{ time: '12:00' }], status: 200 });
    const result = await wellService.fetch2Hours();
    expect(result.data).toEqual([{ time: '12:00' }]);
    expect(result.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetch2HoursArchive', () => {
  it('calls GET /2hours/archive with oil_field and date', async () => {
    await wellService.fetch2HoursArchive('BSK', '2025-01-15');
    expect(mockApi.get).toHaveBeenCalledWith('/2hours/archive', {
      params: { oil_field: 'BSK', date: '2025-01-15' },
    });
  });

  it('uses BSK as default oil_field', async () => {
    await wellService.fetch2HoursArchive(undefined, '2025-03-01');
    expect(mockApi.get).toHaveBeenCalledWith('/2hours/archive', {
      params: { oil_field: 'BSK', date: '2025-03-01' },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('getAvailableArchiveDates', () => {
  it('calls GET /2hours/archive/dates with default oil_field', async () => {
    await wellService.getAvailableArchiveDates();
    expect(mockApi.get).toHaveBeenCalledWith('/2hours/archive/dates', {
      params: { oil_field: 'BSK' },
    });
  });

  it('calls GET /2hours/archive/dates with custom oil_field', async () => {
    await wellService.getAvailableArchiveDates('ZHN');
    expect(mockApi.get).toHaveBeenCalledWith('/2hours/archive/dates', {
      params: { oil_field: 'ZHN' },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchWells', () => {
  it('calls GET /wells', async () => {
    await wellService.fetchWells();
    expect(mockApi.get).toHaveBeenCalledWith('/wells');
    expect(mockApi.get).toHaveBeenCalledTimes(1);
  });

  it('returns well list from response', async () => {
    mockApi.get.mockResolvedValueOnce({ data: [{ well: 'BSK_001' }] });
    const result = await wellService.fetchWells();
    expect(result.data[0].well).toBe('BSK_001');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchWellsABC', () => {
  it('calls GET /wells/abc', async () => {
    await wellService.fetchWellsABC();
    expect(mockApi.get).toHaveBeenCalledWith('/wells/abc');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchABCByWell', () => {
  it('calls GET /wells/abc/ (trailing slash)', async () => {
    await wellService.fetchABCByWell();
    expect(mockApi.get).toHaveBeenCalledWith('/wells/abc/');
  });

  it('endpoint is not an empty string (StringLiteral mutant)', async () => {
    await wellService.fetchABCByWell();
    const calledWith = mockApi.get.mock.calls[0][0];
    expect(calledWith).not.toBe('');
    expect(calledWith.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchLast10Wells', () => {
  it('calls GET /well/last10', async () => {
    await wellService.fetchLast10Wells();
    expect(mockApi.get).toHaveBeenCalledWith('/well/last10');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchWellData', () => {
  it('calls GET /well/data with the given well name', async () => {
    await wellService.fetchWellData('BSK_042');
    expect(mockApi.get).toHaveBeenCalledWith('/well/data', { params: { well: 'BSK_042' } });
  });

  it('passes undefined when no well name is given', async () => {
    await wellService.fetchWellData();
    expect(mockApi.get).toHaveBeenCalledWith('/well/data', { params: { well: undefined } });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchBSKWells', () => {
  it('calls GET /wells/bsk', async () => {
    await wellService.fetchBSKWells();
    expect(mockApi.get).toHaveBeenCalledWith('/wells/bsk');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchProgressOil', () => {
  it('calls GET /progress-oil', async () => {
    await wellService.fetchProgressOil();
    expect(mockApi.get).toHaveBeenCalledWith('/progress-oil');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchLastUpdate', () => {
  it('calls GET /wells/last-update', async () => {
    await wellService.fetchLastUpdate();
    expect(mockApi.get).toHaveBeenCalledWith('/wells/last-update');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchChrpArchiveReport', () => {
  it('calls GET /chrp/archive/report with correct params', async () => {
    await wellService.fetchChrpArchiveReport({ startDate: '2025-01-01', endDate: '2025-01-31', well: 'BSK_001' });
    expect(mockApi.get).toHaveBeenCalledWith('/chrp/archive/report', {
      params: { startDate: '2025-01-01', endDate: '2025-01-31', well: 'BSK_001' },
    });
  });

  it('passes undefined for missing params', async () => {
    await wellService.fetchChrpArchiveReport({});
    expect(mockApi.get).toHaveBeenCalledWith('/chrp/archive/report', {
      params: { startDate: undefined, endDate: undefined, well: undefined },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchAgzuArchiveReport', () => {
  it('calls GET /agzu/archive/report with correct params', async () => {
    await wellService.fetchAgzuArchiveReport({ startDate: '2025-02-01', endDate: '2025-02-28', well: 'BSK_002' });
    expect(mockApi.get).toHaveBeenCalledWith('/agzu/archive/report', {
      params: { startDate: '2025-02-01', endDate: '2025-02-28', well: 'BSK_002' },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('getAvailableVlagomerDates', () => {
  it('calls GET /vlagomer-history/dates', async () => {
    await wellService.getAvailableVlagomerDates();
    expect(mockApi.get).toHaveBeenCalledWith('/vlagomer-history/dates');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchVlagomerHistory', () => {
  it('calls GET /vlagomer-history when no date is given', async () => {
    await wellService.fetchVlagomerHistory();
    expect(mockApi.get).toHaveBeenCalledWith('/vlagomer-history');
  });

  it('calls GET /vlagomer-history/:date when date is provided', async () => {
    await wellService.fetchVlagomerHistory('2025-03-10');
    expect(mockApi.get).toHaveBeenCalledWith('/vlagomer-history/2025-03-10');
  });

  it('uses /vlagomer-history for null date', async () => {
    await wellService.fetchVlagomerHistory(null);
    expect(mockApi.get).toHaveBeenCalledWith('/vlagomer-history');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchKPIProduction', () => {
  it('calls GET /kpi/production', async () => {
    await wellService.fetchKPIProduction();
    expect(mockApi.get).toHaveBeenCalledWith('/kpi/production');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchKPIInjection', () => {
  it('calls GET /kpi/injection', async () => {
    await wellService.fetchKPIInjection();
    expect(mockApi.get).toHaveBeenCalledWith('/kpi/injection');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchOilLossData', () => {
  it('calls GET /oil-loss with default empty params', async () => {
    await wellService.fetchOilLossData();
    expect(mockApi.get).toHaveBeenCalledWith('/oil-loss', {
      params: { well: undefined, startDate: undefined, endDate: undefined },
    });
  });

  it('calls GET /oil-loss with supplied params', async () => {
    await wellService.fetchOilLossData({ well: 'BSK_010', startDate: '2025-01-01', endDate: '2025-01-31' });
    expect(mockApi.get).toHaveBeenCalledWith('/oil-loss', {
      params: { well: 'BSK_010', startDate: '2025-01-01', endDate: '2025-01-31' },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchOilLossWells', () => {
  it('calls GET /oil-loss/wells', async () => {
    await wellService.fetchOilLossWells();
    expect(mockApi.get).toHaveBeenCalledWith('/oil-loss/wells');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('analyzeOilLoss', () => {
  it('calls POST /oil-loss/analysis with provided data', async () => {
    const payload = { records: [{ well: 'BSK_001', tm_oil: 50 }] };
    await wellService.analyzeOilLoss(payload);
    expect(mockApi.post).toHaveBeenCalledWith('/oil-loss/analysis', payload);
  });

  it('does not call GET when posting', async () => {
    await wellService.analyzeOilLoss({ records: [] });
    expect(mockApi.get).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('login', () => {
  it('calls POST /auth/login with credentials', async () => {
    const creds = { login: 'admin', password: 'secret' };
    await wellService.login(creds);
    expect(mockApi.post).toHaveBeenCalledWith('/auth/login', creds);
  });

  it('returns the server response', async () => {
    mockApi.post.mockResolvedValueOnce({ data: { id: 1, login: 'admin' }, status: 200 });
    const result = await wellService.login({ login: 'admin', password: 'pass' });
    expect(result.data.id).toBe(1);
    expect(result.status).toBe(200);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchUsers', () => {
  it('calls GET /admin/users', async () => {
    await wellService.fetchUsers();
    expect(mockApi.get).toHaveBeenCalledWith('/admin/users');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('createUser', () => {
  it('calls POST /admin/users with user data', async () => {
    const userData = { login: 'newuser', password: 'pass', role: 'operator' };
    await wellService.createUser(userData);
    expect(mockApi.post).toHaveBeenCalledWith('/admin/users', userData);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('deleteUser', () => {
  it('calls DELETE /admin/users/:id with correct id', async () => {
    await wellService.deleteUser(42);
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/users/42');
  });

  it('interpolates the user id into the URL correctly', async () => {
    await wellService.deleteUser(7);
    expect(mockApi.delete).toHaveBeenCalledWith('/admin/users/7');
    expect(mockApi.delete).not.toHaveBeenCalledWith('/admin/users/42');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('updateUser', () => {
  it('calls PUT /admin/users/:id with user data', async () => {
    const userData = { name: 'Updated Name' };
    await wellService.updateUser(5, userData);
    expect(mockApi.put).toHaveBeenCalledWith('/admin/users/5', userData);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchAGZUCategories', () => {
  it('calls GET /agzu/categories', async () => {
    await wellService.fetchAGZUCategories();
    expect(mockApi.get).toHaveBeenCalledWith('/agzu/categories');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchAGZUTags', () => {
  it('calls GET /agzu/tags/:category with encoded category', async () => {
    await wellService.fetchAGZUTags('Oil Production');
    expect(mockApi.get).toHaveBeenCalledWith(`/agzu/tags/${encodeURIComponent('Oil Production')}`);
  });

  it('encodes special characters in category name', async () => {
    await wellService.fetchAGZUTags('Нефть & Газ');
    expect(mockApi.get).toHaveBeenCalledWith(`/agzu/tags/${encodeURIComponent('Нефть & Газ')}`);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchAGZUWellData', () => {
  it('calls GET /well/agzu-data with the well param', async () => {
    await wellService.fetchAGZUWellData('BSK_003');
    expect(mockApi.get).toHaveBeenCalledWith('/well/agzu-data', { params: { well: 'BSK_003' } });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchNotifications', () => {
  it('calls GET /notifications with defaults when no params given', async () => {
    await wellService.fetchNotifications();
    expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
      params: { status: 'open', oil_field: undefined, limit: 50 },
    });
  });

  it('uses provided status and limit', async () => {
    await wellService.fetchNotifications({ status: 'closed', oil_field: 'BSK', limit: 10 });
    expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
      params: { status: 'closed', oil_field: 'BSK', limit: 10 },
    });
  });

  it('falls back to open status when status not provided', async () => {
    await wellService.fetchNotifications({ oil_field: 'ZHN' });
    expect(mockApi.get).toHaveBeenCalledWith('/notifications', {
      params: { status: 'open', oil_field: 'ZHN', limit: 50 },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('fetchNotificationCount', () => {
  it('calls GET /notifications/count with defaults', async () => {
    await wellService.fetchNotificationCount();
    expect(mockApi.get).toHaveBeenCalledWith('/notifications/count', {
      params: { status: 'open', oil_field: undefined },
    });
  });

  it('uses provided status and oil_field', async () => {
    await wellService.fetchNotificationCount({ status: 'closed', oil_field: 'BSK' });
    expect(mockApi.get).toHaveBeenCalledWith('/notifications/count', {
      params: { status: 'closed', oil_field: 'BSK' },
    });
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('checkWellStatus', () => {
  it('calls GET /wells/check-status', async () => {
    await wellService.checkWellStatus();
    expect(mockApi.get).toHaveBeenCalledWith('/wells/check-status');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('createNotification', () => {
  it('calls POST /notifications/create with notification data', async () => {
    const notifData = { type: 'alert', message: 'Well BSK_001 pressure low' };
    await wellService.createNotification(notifData);
    expect(mockApi.post).toHaveBeenCalledWith('/notifications/create', notifData);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('updateNotificationStatus', () => {
  it('calls PUT /notifications/:id/status with status payload', async () => {
    await wellService.updateNotificationStatus(99, 'resolved');
    expect(mockApi.put).toHaveBeenCalledWith('/notifications/99/status', { status: 'resolved' });
  });

  it('uses the correct notification id in the URL', async () => {
    await wellService.updateNotificationStatus(1, 'open');
    expect(mockApi.put).toHaveBeenCalledWith('/notifications/1/status', { status: 'open' });
    expect(mockApi.put).not.toHaveBeenCalledWith('/notifications/99/status', expect.anything());
  });
});

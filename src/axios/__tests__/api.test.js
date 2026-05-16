/**
 * Unit tests for src/axios/api.js
 *
 * api.js executes getBaseURL() and axios.create() at module load time (top-level),
 * so every test must:
 *   1. Set globalThis.window.location BEFORE importing api.js
 *   2. Call vi.resetModules() to get a fresh module for each scenario
 *   3. Use a dynamic import() so the module is re-evaluated with the new window
 *
 * Mutants being covered:
 *   - BlockStatement  : getBaseURL body is removed  → returns undefined
 *   - StringLiteral   : `:${port}` prefix replaced with ``
 *   - StringLiteral   : empty-string fallback replaced with "Stryker was here!"
 *   - StringLiteral   : full return template replaced with ``
 *   - ObjectLiteral   : axios.create({...}) replaced with axios.create({})
 *   - ObjectLiteral   : headers value replaced with {}
 *   - StringLiteral   : "application/json" replaced with ""
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Set window.location to a controlled value for the current test. */
function setWindow({ protocol = 'http:', hostname = 'localhost', port = '' } = {}) {
  globalThis.window = { location: { protocol, hostname, port } };
}

/**
 * Reset modules and re-import api.js after window has been configured.
 * Returns { api, createSpy } where createSpy is the mocked axios.create.
 */
async function freshImport() {
  vi.resetModules();

  // Re-mock axios fresh for this import cycle
  const createSpy = vi.fn().mockReturnValue({
    get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn(),
  });

  vi.doMock('axios', () => ({
    default: { create: createSpy },
  }));

  const { default: api } = await import('../api.js');
  return { api, createSpy };
}

// ── Cleanup ───────────────────────────────────────────────────────────────────
afterEach(() => {
  vi.resetModules();
  vi.restoreAllMocks();
});

// ─────────────────────────────────────────────────────────────────────────────
// getBaseURL — with port
// ─────────────────────────────────────────────────────────────────────────────
describe('getBaseURL — with a port number', () => {
  beforeEach(() => setWindow({ protocol: 'http:', hostname: 'localhost', port: '3000' }));

  it('constructs the full URL including :port', async () => {
    const { createSpy } = await freshImport();
    const callArg = createSpy.mock.calls[0][0];
    expect(callArg.baseURL).toBe('http://localhost:3000/api');
  });

  it('includes the colon before the port number', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).toContain(':3000');
  });

  it('ends with /api', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).toMatch(/\/api$/);
  });

  it('baseURL is a non-empty string (BlockStatement mutant)', async () => {
    const { createSpy } = await freshImport();
    const baseURL = createSpy.mock.calls[0][0].baseURL;
    expect(typeof baseURL).toBe('string');
    expect(baseURL.length).toBeGreaterThan(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getBaseURL — without port
// ─────────────────────────────────────────────────────────────────────────────
describe('getBaseURL — without a port', () => {
  beforeEach(() => setWindow({ protocol: 'https:', hostname: 'oil.example.com', port: '' }));

  it('omits the port segment entirely', async () => {
    const { createSpy } = await freshImport();
    const baseURL = createSpy.mock.calls[0][0].baseURL;
    expect(baseURL).toBe('https://oil.example.com/api');
  });

  it('does not contain a colon-port pattern', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).not.toMatch(/:\d+/);
  });

  it('does not contain the Stryker fallback string (StringLiteral mutant)', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).not.toContain('Stryker was here!');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// getBaseURL — protocol is used
// ─────────────────────────────────────────────────────────────────────────────
describe('getBaseURL — respects protocol', () => {
  it('uses http: protocol correctly', async () => {
    setWindow({ protocol: 'http:', hostname: 'localhost', port: '5000' });
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).toMatch(/^http:\/\//);
  });

  it('uses https: protocol correctly', async () => {
    setWindow({ protocol: 'https:', hostname: 'secure.app.com', port: '' });
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).toMatch(/^https:\/\//);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// axios.create — called correctly (ObjectLiteral mutants)
// ─────────────────────────────────────────────────────────────────────────────
describe('axios.create — configuration object', () => {
  beforeEach(() => setWindow({ protocol: 'http:', hostname: 'localhost', port: '3000' }));

  it('calls axios.create exactly once', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy).toHaveBeenCalledTimes(1);
  });

  it('passes a config object (ObjectLiteral mutant — create({}) )', async () => {
    const { createSpy } = await freshImport();
    const arg = createSpy.mock.calls[0][0];
    // If mutant replaces config with {}, baseURL and headers are both absent
    expect(arg).toHaveProperty('baseURL');
    expect(arg).toHaveProperty('headers');
  });

  it('sets baseURL on the config (not undefined)', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].baseURL).toBeDefined();
    expect(createSpy.mock.calls[0][0].baseURL).not.toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// axios.create — headers (ObjectLiteral + StringLiteral mutants)
// ─────────────────────────────────────────────────────────────────────────────
describe('axios.create — headers', () => {
  beforeEach(() => setWindow({ protocol: 'http:', hostname: 'localhost', port: '3000' }));

  it('sets Content-Type header (ObjectLiteral mutant — headers: {} )', async () => {
    const { createSpy } = await freshImport();
    const headers = createSpy.mock.calls[0][0].headers;
    expect(headers).toHaveProperty('Content-Type');
  });

  it('Content-Type is application/json (StringLiteral mutant)', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].headers['Content-Type']).toBe('application/json');
  });

  it('Content-Type is not an empty string', async () => {
    const { createSpy } = await freshImport();
    expect(createSpy.mock.calls[0][0].headers['Content-Type']).not.toBe('');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Default export — the created api instance
// ─────────────────────────────────────────────────────────────────────────────
describe('default export', () => {
  beforeEach(() => setWindow({ protocol: 'http:', hostname: 'localhost', port: '3000' }));

  it('exports the value returned by axios.create', async () => {
    const { api, createSpy } = await freshImport();
    expect(api).toBe(createSpy.mock.results[0].value);
  });

  it('is not null or undefined', async () => {
    const { api } = await freshImport();
    expect(api).toBeDefined();
    expect(api).not.toBeNull();
  });
});

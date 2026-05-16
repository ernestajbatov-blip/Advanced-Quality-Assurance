/**
 * Dedicated Vitest config for Stryker mutation testing.
 * Intentionally minimal — no Playwright, no webServer, unit tests only.
 */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.js'],
    // Only unit tests — explicitly excludes QA/e2e specs
    include: [
      'src/**/__tests__/**/*.test.{js,jsx}',
      'src/**/*.test.{js,jsx}',
    ],
    exclude: [
      'node_modules/**',
      'QA/**',
      '**/*.spec.{js,ts}',
    ],
  },
});

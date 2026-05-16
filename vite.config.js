import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    // Vitest configuration — jsdom needed for React Testing Library
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.js"],
    include: ["src/**/__tests__/**/*.test.{js,jsx}", "src/**/*.test.{js,jsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json"],
      include: ["src/axios/**/*.js", "src/states/**/*.{js,jsx}", "src/components/**/*.jsx"],
      reportsDirectory: "QA/test-reports/coverage",
    },
  },
});

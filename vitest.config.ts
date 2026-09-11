import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: these unit/component tests don't need
// the Tailwind Vite plugin, and mixing it in pulls in two mismatched
// copies of Vite's plugin types (vitest bundles its own). esbuild's
// built-in JSX transform (Vite's default) is enough for the .tsx tests
// here — no React plugin needed since nothing relies on Fast Refresh.
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
    // e2e/ holds Playwright specs (run via `npm run test:e2e`, a
    // different tool/runner) — Vitest's default include pattern would
    // otherwise try to execute them too and collide with Playwright's
    // own test.beforeEach.
    exclude: ["node_modules/**", "e2e/**"],
  },
});

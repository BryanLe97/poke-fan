import { defineConfig } from "vitest/config";

// Kept separate from vite.config.ts: our unit tests only exercise plain
// TS/store logic (no components), so they don't need the React/Tailwind
// Vite plugins — and mixing them pulls in two mismatched copies of Vite's
// plugin types (vitest bundles its own).
export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/test/setup.ts",
  },
});

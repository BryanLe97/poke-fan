import { defineConfig, devices } from "@playwright/test";

// A deliberately small, illustrative E2E suite — see e2e/README.md for why
// it's kept to a handful of cases rather than full coverage.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "line" : "list",
  use: {
    baseURL: "http://localhost:4173/poke-fan/",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Exercises the real production build (matches what GitHub Pages
  // actually serves), not the dev server.
  webServer: {
    command: "npm run build && npm run preview -- --port 4173 --strictPort",
    url: "http://localhost:4173/poke-fan/",
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});

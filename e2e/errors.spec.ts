import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("a failed name-index fetch shows Browse's error state, and retry recovers", async ({
  page,
}) => {
  // "?" is literal in a Playwright glob, not a wildcard — this matches only
  // the list endpoint (…/pokemon?limit=…), not a per-Pokemon detail URL.
  await page.route("**/pokemon?*", (route) =>
    route.fulfill({ status: 500, body: "boom" }),
  );

  await page.reload();

  const alert = page.getByRole("alert");
  await expect(alert).toContainText("PokeAPI request failed");
  const retry = page.getByRole("button", { name: "Try again" });
  await expect(retry).toBeVisible();

  await page.unroute("**/pokemon?*");
  await retry.click();
  await expect(page.locator("li img").first()).toBeVisible();
});

test("one card's failed fetch is isolated — the rest of the grid still renders", async ({
  page,
}) => {
  await page.route("**/pokemon/bulbasaur", (route) =>
    route.fulfill({ status: 500, body: "boom" }),
  );

  await page.reload();
  await page.waitForSelector("li img"); // sibling cards still load fine

  const failedSlot = page.locator("li", { hasText: "PokeAPI request failed" });
  await expect(failedSlot).toBeVisible();
  await expect(failedSlot.getByRole("button", { name: "Retry" })).toBeVisible();

  // An unrelated sibling card is completely unaffected by bulbasaur's error.
  await expect(page.locator("li", { hasText: /ivysaur/i })).toBeVisible();
});

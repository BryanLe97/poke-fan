import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("li img");
});

test("search finds the expected Pokemon", async ({ page }) => {
  await page.getByPlaceholder("Search Pokemon by name...").fill("pikachu");
  // Debounced (1s) before it's committed to the URL and re-fetched.
  await page.waitForURL(/\?q=pikachu/);
  await expect(page.getByRole("link", { name: /pikachu/i }).first()).toBeVisible();
  // Something that clearly isn't a match shouldn't still be on screen.
  await expect(page.getByText("Bulbasaur")).toHaveCount(0);
});

test("opening a card's detail page shows the right Pokemon", async ({ page }) => {
  await page.getByPlaceholder("Search Pokemon by name...").fill("charizard");
  await page.waitForURL(/\?q=charizard/);

  await page
    .locator("li", { hasText: "Charizard" })
    .first()
    .getByRole("link")
    .first()
    .click();

  await expect(page).toHaveURL(/\/pokemon\/charizard/);
  await expect(page.getByRole("heading", { name: "charizard" })).toBeVisible();
  await expect(page.getByText("#006")).toBeVisible();
});

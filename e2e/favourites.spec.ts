import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.waitForSelector("li img");
});

test("favouriting a Pokemon on Browse shows it on Favourites, and un-favouriting removes it", async ({
  page,
}) => {
  await page
    .locator("li", { hasText: "Bulbasaur" })
    .first()
    .getByRole("button", { name: /Add bulbasaur to favourites/ })
    .click();

  await page.getByRole("link", { name: /Favourites/i }).first().click();
  await expect(page).toHaveURL(/\/favourites/);
  await expect(page.locator("li", { hasText: /bulbasaur/i })).toBeVisible();

  // Un-favourite from the Favourites page itself (same star toggle).
  await page
    .locator("li", { hasText: "Bulbasaur" })
    .getByRole("button", { name: /Remove bulbasaur from favourites/ })
    .click();

  await expect(page.getByText("No favourites yet")).toBeVisible();
});

test("grouping a favourite, filtering by it, then deleting the group keeps the favourite", async ({
  page,
}) => {
  const bulbasaurCard = page.locator("li", { hasText: "Bulbasaur" }).first();
  await bulbasaurCard
    .getByRole("button", { name: /Add bulbasaur to favourites/ })
    .click();

  await bulbasaurCard
    .getByRole("button", { name: /Add bulbasaur to a group/ })
    .click();
  await page.getByLabel("Search or create a group").fill("Starters");
  await page.getByRole("button", { name: 'Create "Starters"' }).click();

  await page.getByRole("link", { name: /Favourites/i }).first().click();
  // Exact name, not a /Starters/ substring match — that would also match
  // the sibling "Delete group Starters" button.
  const starterFilterButton = page.getByRole("button", { name: "Starters 1" });
  await expect(starterFilterButton).toBeVisible();

  // Filtering by the group shows only its members.
  await starterFilterButton.click();
  await expect(page.locator("li", { hasText: /bulbasaur/i })).toBeVisible();

  // Deleting the group removes it from the sidebar, but the underlying
  // favourite survives — deleteGroup never touches `favourites`.
  await page.getByRole("button", { name: "Delete group Starters" }).click();
  await expect(starterFilterButton).toHaveCount(0);
  await expect(page.locator("li", { hasText: /bulbasaur/i })).toBeVisible();
});

import { test, expect } from "../helpers/fixtures";

test.describe("Calendar", () => {
  test("renders group with aria-label='Calendar'", async ({ gotoRoute, page }) => {
    await gotoRoute("Calendar");
    await expect(page.getByRole("group", { name: "Calendar" })).toBeVisible();
  });

  test("Next button advances the month heading", async ({ gotoRoute, page }) => {
    await gotoRoute("Calendar");
    // defaultDisplayMonth = 2026-04-01 → heading begins "April 2026".
    // Heading is a <Label> element, not a semantic heading, so select it by
    // text match rather than role.
    const group = page.getByRole("group", { name: "Calendar" });
    await expect(group).toContainText("April 2026");
    await page.getByRole("button", { name: "Next" }).click();
    await expect(group).toContainText("May 2026");
    await expect(group).not.toContainText("April 2026");
  });

  test("Previous button moves the month heading back", async ({ gotoRoute, page }) => {
    await gotoRoute("Calendar");
    const group = page.getByRole("group", { name: "Calendar" });
    await page.getByRole("button", { name: "Previous" }).click();
    await expect(group).toContainText("March 2026");
  });

  test("clicking a day cell updates picked readout to that ISO date", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Calendar");
    await expect(page.getByTestId("picked")).toHaveText("none");
    // Day buttons have their date number as the accessible name. April 2026
    // starts on a Wednesday, so the "15" button is unambiguously 2026-04-15
    // within the visible month grid.
    const group = page.getByRole("group", { name: "Calendar" });
    await group.getByRole("button", { name: "15", exact: true }).click();
    await expect(page.getByTestId("picked")).toHaveText("2026-04-15");
  });
});

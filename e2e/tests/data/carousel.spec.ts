import { test, expect } from "../helpers/fixtures";

test.describe("Carousel", () => {
  test("clicking Next advances by one slide", async ({ gotoRoute, page }) => {
    await gotoRoute("Carousel");
    await expect(page.getByTestId("index")).toHaveText("0");
    await page.getByRole("button", { name: "Next slide" }).click();
    await expect(page.getByTestId("index")).toHaveText("1");
  });

  test("clicking Prev wraps to last slide when loop=true", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Carousel");
    await expect(page.getByTestId("index")).toHaveText("0");
    await page.getByRole("button", { name: "Previous slide" }).click();
    await expect(page.getByTestId("index")).toHaveText("2");
  });

  test("ArrowRight on the carousel viewport advances the slide", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Carousel");
    // Arrow-key handling lives on the viewport (aria-roledescription=slides,
    // tabIndex=0). aria-roledescription is not an accessible name, so we
    // target the viewport by its library class.
    const viewport = page.locator(".vf-carousel__viewport");
    await expect(viewport).toBeVisible();
    await viewport.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByTestId("index")).toHaveText("1");
  });

  test("clicking a dot jumps to the matching slide index", async ({
    gotoRoute,
    page,
  }) => {
    await gotoRoute("Carousel");
    await page.getByRole("tab", { name: "Slide 3" }).click();
    await expect(page.getByTestId("index")).toHaveText("2");
    await expect(page.getByRole("tab", { name: "Slide 3" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
  });
});

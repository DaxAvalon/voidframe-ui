import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { ImageDiff } from "../ImageDiff";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const BEFORE = "https://example.com/before.png";
const AFTER = "https://example.com/after.png";

describe("ImageDiff", () => {
  it("renders before and after images", () => {
    renderWithTheme(<ImageDiff before={BEFORE} after={AFTER} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThanOrEqual(2);
  });

  it("defaults to slider mode", () => {
    const { root } = renderWithTheme(<ImageDiff before={BEFORE} after={AFTER} />);
    expect(root().className).toContain("vf-image-diff--slider");
  });

  it.each(["side-by-side", "overlay", "slider"] as const)(
    "applies mode class for %s",
    (mode) => {
      const { root } = renderWithTheme(
        <ImageDiff before={BEFORE} after={AFTER} mode={mode} />
      );
      expect(root().className).toContain(`vf-image-diff--${mode}`);
    }
  );

  it("shows both images with labels in side-by-side mode", () => {
    renderWithTheme(
      <ImageDiff before={BEFORE} after={AFTER} mode="side-by-side" />
    );
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("shows custom labels", () => {
    renderWithTheme(
      <ImageDiff
        before={BEFORE}
        after={AFTER}
        mode="side-by-side"
        beforeLabel="Original"
        afterLabel="Modified"
      />
    );
    expect(screen.getByText("Original")).toBeInTheDocument();
    expect(screen.getByText("Modified")).toBeInTheDocument();
  });

  it("shows overlay opacity control in overlay mode", () => {
    renderWithTheme(
      <ImageDiff before={BEFORE} after={AFTER} mode="overlay" />
    );
    expect(screen.getByLabelText("Overlay opacity")).toBeInTheDocument();
  });

  it("overlayOpacity prop drives the overlay when provided", () => {
    const { rerender, container } = renderWithTheme(
      <ImageDiff before={BEFORE} after={AFTER} mode="overlay" overlayOpacity={0.2} />
    );
    const pickOverlay = () =>
      container.querySelector<HTMLElement>(
        ".vf-image-diff--overlay .vf-image-diff__after"
      );
    expect(pickOverlay()?.style.opacity).toBe("0.2");
    rerender(
      <ImageDiff before={BEFORE} after={AFTER} mode="overlay" overlayOpacity={0.8} />
    );
    expect(pickOverlay()?.style.opacity).toBe("0.8");
  });

  it("renders slider divider in slider mode", () => {
    renderWithTheme(<ImageDiff before={BEFORE} after={AFTER} mode="slider" />);
    expect(screen.getByRole("separator")).toBeInTheDocument();
  });

  it("shows zoom controls by default", () => {
    renderWithTheme(<ImageDiff before={BEFORE} after={AFTER} />);
    expect(screen.getByLabelText("Zoom in")).toBeInTheDocument();
    expect(screen.getByLabelText("Zoom out")).toBeInTheDocument();
  });

  it("respects zoom prop", () => {
    renderWithTheme(<ImageDiff before={BEFORE} after={AFTER} zoom={2} />);
    const imgs = screen.getAllByRole("img");
    expect(imgs[0]!.style.transform).toContain("scale(2)");
  });

  it("hides zoom controls when showZoomControls={false}", () => {
    renderWithTheme(
      <ImageDiff before={BEFORE} after={AFTER} showZoomControls={false} />
    );
    expect(screen.queryByLabelText("Zoom in")).not.toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(
      <ImageDiff before={BEFORE} after={AFTER} size={size} />
    );
    expect(root().className).toContain(`vf-image-diff--${size}`);
  });

  it("handles loading state gracefully", () => {
    renderWithTheme(<ImageDiff before="" after="" />);
    const imgs = screen.getAllByRole("img");
    expect(imgs.length).toBeGreaterThanOrEqual(2);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <ImageDiff before={BEFORE} after={AFTER} />
    );
    await expectNoA11yViolations(container);
  });
});

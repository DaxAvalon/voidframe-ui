import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { LiveIndicator } from "../LiveIndicator";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("LiveIndicator", () => {
  it("defaults to typing variant", () => {
    const { container } = renderWithTheme(<LiveIndicator />);
    expect(
      container.querySelector(".vf-live-indicator--typing")
    ).toBeInTheDocument();
  });

  it.each(["typing", "recording", "active", "live"] as const)(
    "applies variant class %s",
    (variant) => {
      const { container } = renderWithTheme(
        <LiveIndicator kind={variant} />
      );
      expect(
        container.querySelector(`.vf-live-indicator--${variant}`)
      ).toBeInTheDocument();
    }
  );

  it("typing variant renders 3 dots", () => {
    const { container } = renderWithTheme(<LiveIndicator kind="typing" />);
    const dots = container.querySelectorAll(".vf-live-indicator__dot");
    expect(dots).toHaveLength(3);
  });

  it("recording variant renders pulse", () => {
    const { container } = renderWithTheme(
      <LiveIndicator kind="recording" />
    );
    expect(
      container.querySelector(".vf-live-indicator__pulse--recording")
    ).toBeInTheDocument();
  });

  it("active variant renders green dot", () => {
    const { container } = renderWithTheme(<LiveIndicator kind="active" />);
    expect(
      container.querySelector(".vf-live-indicator__pulse--active")
    ).toBeInTheDocument();
  });

  it("live variant renders LIVE text", () => {
    renderWithTheme(<LiveIndicator kind="live" />);
    expect(screen.getByText("LIVE")).toBeInTheDocument();
  });

  it("renders label", () => {
    renderWithTheme(<LiveIndicator label="User is typing" />);
    expect(screen.getByText("User is typing")).toBeInTheDocument();
  });

  it("renders avatar as string URL", () => {
    const { container } = renderWithTheme(
      <LiveIndicator avatar="https://example.com/avatar.png" />
    );
    const img = container.querySelector(
      ".vf-live-indicator__avatar"
    ) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.getAttribute("src")).toBe("https://example.com/avatar.png");
  });

  it("renders avatar as ReactNode", () => {
    renderWithTheme(
      <LiveIndicator avatar={<span data-testid="custom-avatar">A</span>} />
    );
    expect(screen.getByTestId("custom-avatar")).toBeInTheDocument();
  });

  it.each(["sm", "md"] as const)("applies size class %s", (size) => {
    const { container } = renderWithTheme(<LiveIndicator size={size} />);
    expect(
      container.querySelector(`.vf-live-indicator--${size}`)
    ).toBeInTheDocument();
  });

  it("animated={false} disables animation", () => {
    const { container } = renderWithTheme(<LiveIndicator animated={false} />);
    expect(
      container.querySelector(".vf-live-indicator--static")
    ).toBeInTheDocument();
  });

  it("missing label and avatar renders dots only", () => {
    const { container } = renderWithTheme(<LiveIndicator />);
    expect(
      container.querySelector(".vf-live-indicator__dots")
    ).toBeInTheDocument();
    expect(
      container.querySelector(".vf-live-indicator__label")
    ).not.toBeInTheDocument();
    expect(
      container.querySelector(".vf-live-indicator__avatar")
    ).not.toBeInTheDocument();
  });

  it("has role=status and aria-live=polite for a11y", async () => {
    const { container } = renderWithTheme(
      <LiveIndicator label="Someone typing" />
    );
    const el = screen.getByRole("status");
    expect(el).toHaveAttribute("aria-live", "polite");
    await expectNoA11yViolations(container);
  });
});

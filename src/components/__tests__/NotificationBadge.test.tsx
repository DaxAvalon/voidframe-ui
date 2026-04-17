import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { NotificationBadge } from "../NotificationBadge";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("NotificationBadge", () => {
  it("renders children element", () => {
    renderWithTheme(
      <NotificationBadge count={3}>
        <button>Mail</button>
      </NotificationBadge>
    );
    expect(screen.getByRole("button", { name: "Mail" })).toBeInTheDocument();
  });

  it("renders badge with count number", () => {
    renderWithTheme(<NotificationBadge count={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("count of 0 hides badge by default", () => {
    renderWithTheme(<NotificationBadge count={0} />);
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    );
    expect(indicator).toHaveClass(
      "vf-notification-badge__indicator--hidden"
    );
  });

  it("showZero={true} shows badge with 0", () => {
    renderWithTheme(<NotificationBadge count={0} showZero />);
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    );
    expect(indicator).not.toHaveClass(
      "vf-notification-badge__indicator--hidden"
    );
    expect(screen.getByText("0")).toBeInTheDocument();
  });

  it('count exceeding max shows "99+"', () => {
    renderWithTheme(<NotificationBadge count={150} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it('custom max value (max=9 shows "9+")', () => {
    renderWithTheme(<NotificationBadge count={15} max={9} />);
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("dot variant renders dot without text", () => {
    renderWithTheme(<NotificationBadge dot />);
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    );
    expect(indicator).toHaveClass("vf-notification-badge__indicator--dot");
    expect(indicator?.textContent).toBe("");
  });

  it("offset prop adjusts position via style", () => {
    renderWithTheme(<NotificationBadge count={1} offset={[4, 6]} />);
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    ) as HTMLElement;
    expect(indicator.style.top).toBe("-6px");
    expect(indicator.style.right).toBe("-4px");
  });

  it("custom color applies to indicator", () => {
    renderWithTheme(<NotificationBadge count={1} color="#00ff00" />);
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    ) as HTMLElement;
    expect(indicator.style.getPropertyValue("--vf-accent")).toBe("#00ff00");
  });

  it.each(["sm", "md"] as const)("size=%s applies modifier class", (size) => {
    renderWithTheme(<NotificationBadge count={1} size={size} />);
    const root = document.querySelector(".vf-notification-badge");
    expect(root).toHaveClass(`vf-notification-badge--${size}`);
  });

  it("badge without children renders inline (standalone class)", () => {
    renderWithTheme(<NotificationBadge count={3} />);
    const root = document.querySelector(".vf-notification-badge");
    expect(root).toHaveClass("vf-notification-badge--standalone");
  });

  it("negative count treated as 0", () => {
    renderWithTheme(<NotificationBadge count={-5} />);
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    );
    expect(indicator).toHaveClass(
      "vf-notification-badge__indicator--hidden"
    );
  });

  it("a11y: badge has aria-label describing count", async () => {
    const { container } = renderWithTheme(
      <NotificationBadge count={7}>
        <button>Inbox</button>
      </NotificationBadge>
    );
    const indicator = document.querySelector(
      ".vf-notification-badge__indicator"
    );
    expect(indicator).toHaveAttribute("aria-label", "7 notifications");
    await expectNoA11yViolations(container);
  });
});

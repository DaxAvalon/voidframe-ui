// Regression: a disabled asChild Button on a non-button host (anchor, router
// link) must not navigate, must leave the tab order, and must be announced
// as disabled.
import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { Button } from "../Button";

describe("Button asChild disabled", () => {
  it("marks the host disabled and removes it from the tab order", () => {
    renderWithTheme(
      <Button asChild disabled>
        <a href="/download" download>
          Download
        </a>
      </Button>
    );
    const a = screen.getByText("Download").closest("a")!;
    expect(a).toHaveAttribute("aria-disabled", "true");
    expect(a).toHaveAttribute("tabindex", "-1");
    expect(a).toHaveAttribute("data-disabled", "true");
  });

  it("prevents the default action and suppresses the child's own onClick", () => {
    const childClick = vi.fn();
    const buttonClick = vi.fn();
    renderWithTheme(
      <Button asChild disabled onClick={buttonClick}>
        <a href="/go" onClick={childClick}>
          Go
        </a>
      </Button>
    );
    const a = screen.getByText("Go").closest("a")!;
    const ev = fireEvent.click(a);
    expect(ev).toBe(false); // default prevented
    expect(childClick).not.toHaveBeenCalled();
    expect(buttonClick).not.toHaveBeenCalled();
  });

  it("keeps the child's onClick and the Button onClick when enabled", () => {
    const childClick = vi.fn();
    const buttonClick = vi.fn();
    renderWithTheme(
      <Button asChild onClick={buttonClick}>
        <a href="#x" onClick={childClick}>
          Go
        </a>
      </Button>
    );
    fireEvent.click(screen.getByText("Go").closest("a")!);
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(buttonClick).toHaveBeenCalledTimes(1);
  });
});

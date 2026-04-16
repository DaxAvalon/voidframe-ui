import { describe, expect, it, vi } from "vitest";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Button } from "../Button";
import { Badge } from "../Badge";
import { Card } from "../Card";
import { avatarColorFromName } from "../DataExtended";

describe("Button — loading + icons", () => {
  it("renders iconLeft before children", () => {
    const { container } = renderWithTheme(
      <Button iconLeft={<span data-testid="icon">★</span>}>Save</Button>
    );
    const icon = container.querySelector(".vf-button__icon--left");
    expect(icon).toBeTruthy();
    expect(container.textContent).toMatch(/★.*Save/);
  });

  it("renders iconRight after children", () => {
    const { container } = renderWithTheme(
      <Button iconRight={<span>→</span>}>Next</Button>
    );
    expect(container.querySelector(".vf-button__icon--right")).toBeTruthy();
    expect(container.textContent).toMatch(/Next.*→/);
  });

  it("loading shows spinner and disables click", () => {
    const onClick = vi.fn();
    const { container } = renderWithTheme(
      <Button loading onClick={onClick}>
        Saving
      </Button>
    );
    expect(container.querySelector(".vf-button__spinner")).toBeTruthy();
    fireEvent.click(container.querySelector("button")!);
    expect(onClick).not.toHaveBeenCalled();
    expect(
      container.querySelector("button")?.getAttribute("aria-disabled")
    ).toBe("true");
  });

  it("loading=false renders normally", () => {
    const { container } = renderWithTheme(
      <Button loading={false}>Go</Button>
    );
    expect(container.querySelector(".vf-button__spinner")).toBeNull();
  });
});

describe("Badge — dismiss + count", () => {
  it("renders count as label", () => {
    const { container } = renderWithTheme(<Badge count={42} />);
    expect(container.textContent).toContain("42");
  });

  it("renders overflowCount+ when count exceeds it", () => {
    const { container } = renderWithTheme(
      <Badge count={150} overflowCount={99} />
    );
    expect(container.textContent).toContain("99+");
  });

  it("renders close button when dismissible", () => {
    const onDismiss = vi.fn();
    const { container } = renderWithTheme(
      <Badge dismissible onDismiss={onDismiss}>
        Tag
      </Badge>
    );
    const close = container.querySelector(".vf-badge__close");
    expect(close).toBeTruthy();
    fireEvent.click(close!);
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("does not render close button by default", () => {
    const { container } = renderWithTheme(<Badge>Tag</Badge>);
    expect(container.querySelector(".vf-badge__close")).toBeNull();
  });
});

describe("Card — hoverable + actions", () => {
  it("adds hoverable class when prop is set", () => {
    const { container } = renderWithTheme(
      <Card hoverable title="Test">
        content
      </Card>
    );
    expect(container.querySelector(".vf-card--hoverable")).toBeTruthy();
  });

  it("renders actions footer when provided", () => {
    const { container } = renderWithTheme(
      <Card title="Test" actions={<button type="button">Save</button>}>
        body
      </Card>
    );
    expect(container.querySelector(".vf-card__actions")).toBeTruthy();
    expect(container.textContent).toContain("Save");
  });

  it("does not render actions div when not provided", () => {
    const { container } = renderWithTheme(<Card title="Test">body</Card>);
    expect(container.querySelector(".vf-card__actions")).toBeNull();
  });
});

describe("avatarColorFromName", () => {
  it("returns an hsl string", () => {
    const color = avatarColorFromName("Alice");
    expect(color).toMatch(/^hsl\(\d+,\s*55%,\s*45%\)$/);
  });

  it("is deterministic", () => {
    expect(avatarColorFromName("Bob")).toBe(avatarColorFromName("Bob"));
  });

  it("produces different colors for different names", () => {
    expect(avatarColorFromName("Alice")).not.toBe(
      avatarColorFromName("Charlie")
    );
  });

  it("handles empty string without crashing", () => {
    expect(typeof avatarColorFromName("")).toBe("string");
  });
});

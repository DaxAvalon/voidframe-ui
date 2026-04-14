import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LiveRegion } from "../LiveRegion";

describe("LiveRegion", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("renders a polite region by default", () => {
    const { container } = render(<LiveRegion message="hello" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-live")).toBe("polite");
    expect(el.getAttribute("role")).toBe("status");
    expect(el.textContent).toBe("hello");
  });

  it("renders an assertive region when politeness='assertive'", () => {
    const { container } = render(
      <LiveRegion message="urgent" politeness="assertive" />
    );
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-live")).toBe("assertive");
    expect(el.getAttribute("role")).toBe("alert");
  });

  it("clears the message after `clearAfter`", () => {
    const { container } = render(<LiveRegion message="hello" clearAfter={500} />);
    const el = container.firstChild as HTMLElement;
    expect(el.textContent).toBe("hello");
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(el.textContent).toBe("");
  });
});

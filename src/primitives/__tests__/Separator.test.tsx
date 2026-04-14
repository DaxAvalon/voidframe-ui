import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Separator } from "../Separator";

describe("Separator", () => {
  it("defaults to horizontal role=separator", () => {
    const { container } = render(<Separator />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("separator");
    expect(el.getAttribute("aria-orientation")).toBe("horizontal");
  });

  it("respects vertical orientation", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("aria-orientation")).toBe("vertical");
  });

  it("decorative strips semantics", () => {
    const { container } = render(<Separator decorative />);
    const el = container.firstChild as HTMLElement;
    expect(el.getAttribute("role")).toBe("none");
    expect(el.getAttribute("aria-orientation")).toBeNull();
  });
});

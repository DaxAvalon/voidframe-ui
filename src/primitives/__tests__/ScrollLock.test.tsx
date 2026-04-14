import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ScrollLock } from "../ScrollLock";

describe("ScrollLock", () => {
  const savedOverflow = document.body.style.overflow;
  const savedPadding = document.body.style.paddingRight;

  beforeEach(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = "";
  });

  afterEach(() => {
    document.body.style.overflow = savedOverflow;
    document.body.style.paddingRight = savedPadding;
  });

  it("locks body overflow while mounted", () => {
    const { unmount } = render(<ScrollLock />);
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("");
  });

  it("respects nested locks — releases only when all unmount", () => {
    const { unmount: u1 } = render(<ScrollLock />);
    const { unmount: u2 } = render(<ScrollLock />);
    expect(document.body.style.overflow).toBe("hidden");
    u1();
    expect(document.body.style.overflow).toBe("hidden");
    u2();
    expect(document.body.style.overflow).toBe("");
  });

  it("does nothing when enabled=false", () => {
    render(<ScrollLock enabled={false} />);
    expect(document.body.style.overflow).toBe("");
  });
});

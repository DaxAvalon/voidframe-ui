import { describe, expect, it, vi, afterEach } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { Text } from "../Text";
import { Code } from "../DataExtended";

afterEach(() => vi.restoreAllMocks());

describe("Text tone", () => {
  it("renders a tone class and data-tone", () => {
    const { container } = renderWithTheme(<Text tone="muted">hint</Text>);
    const el = container.querySelector(".vf-text")!;
    expect(el).toHaveClass("vf-text--muted");
    expect(el).toHaveAttribute("data-tone", "muted");
  });

  it("does not emit a tone class for default", () => {
    const { container } = renderWithTheme(<Text tone="default">plain</Text>);
    const el = container.querySelector(".vf-text")!;
    expect(el.className).not.toMatch(/vf-text--default/);
    expect(el).not.toHaveAttribute("data-tone");
  });

  it("warns when color is a tone word rather than a CSS colour", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithTheme(<Text color="muted">x</Text>);
    expect(warn).toHaveBeenCalled();
    expect(String(warn.mock.calls[0]?.[0] ?? "")).toMatch(/tone="muted"/);
  });

  it("does not warn for a real colour or a var() expression", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithTheme(
      <>
        <Text color="#ff0000">a</Text>
        <Text color="var(--vf-text-2)">b</Text>
      </>
    );
    expect(warn).not.toHaveBeenCalled();
  });

  it("Code muted renders the dimmed class", () => {
    const { container } = renderWithTheme(<Code inline muted>old</Code>);
    expect(container.querySelector("code")).toHaveClass("vf-code--muted");
  });
});

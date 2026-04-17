import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegExpTester } from "../RegExpTester";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("RegExpTester", () => {
  it("renders pattern and test string inputs", () => {
    renderWithTheme(<RegExpTester />);
    expect(screen.getByLabelText("Regular expression pattern")).toBeInTheDocument();
    expect(screen.getByLabelText("Test string")).toBeInTheDocument();
  });

  it("shows matches for a valid pattern", () => {
    renderWithTheme(
      <RegExpTester
        pattern="foo"
        testString="foo bar foo"
        flags="g"
      />
    );
    expect(screen.getByText("2 matches")).toBeInTheDocument();
  });

  it("shows correct match count", () => {
    renderWithTheme(
      <RegExpTester
        pattern="[0-9]+"
        testString="abc 123 def 456 ghi 789"
        flags="g"
      />
    );
    expect(screen.getByText("3 matches")).toBeInTheDocument();
  });

  it("displays capture groups", () => {
    renderWithTheme(
      <RegExpTester
        pattern="([a-z]+)@([a-z]+)"
        testString="user@host"
        flags="g"
      />
    );
    expect(screen.getByText(/Group 1/)).toBeInTheDocument();
    expect(screen.getByText(/Group 2/)).toBeInTheDocument();
  });

  it("shows error for invalid pattern", () => {
    renderWithTheme(
      <RegExpTester pattern="(?P<bad" testString="test" flags="g" />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("clears matches when pattern is empty", () => {
    renderWithTheme(
      <RegExpTester pattern="" testString="test" flags="g" />
    );
    expect(screen.queryByText(/match/i)).not.toBeInTheDocument();
  });

  it("toggles flags when clicking a flag button", async () => {
    const onFlagsChange = vi.fn();
    renderWithTheme(
      <RegExpTester flags="g" onFlagsChange={onFlagsChange} />
    );
    await userEvent.click(screen.getByLabelText("Flag i"));
    expect(onFlagsChange).toHaveBeenCalledWith("gi");
  });

  it("hides flags when showFlags={false}", () => {
    renderWithTheme(<RegExpTester showFlags={false} />);
    expect(screen.queryByLabelText("Flag g")).not.toBeInTheDocument();
  });

  it("hides match info when showMatches={false}", () => {
    renderWithTheme(
      <RegExpTester
        pattern="foo"
        testString="foo"
        flags="g"
        showMatches={false}
      />
    );
    expect(screen.queryByText(/match/i)).not.toBeInTheDocument();
  });

  it("hides captures when showCaptures={false}", () => {
    renderWithTheme(
      <RegExpTester
        pattern="([a-z]+)"
        testString="hello"
        flags="g"
        showCaptures={false}
      />
    );
    expect(screen.queryByText(/Group/)).not.toBeInTheDocument();
  });

  it("shows replace input when showReplace is true", () => {
    renderWithTheme(<RegExpTester showReplace />);
    expect(screen.getByLabelText("Replace pattern")).toBeInTheDocument();
  });

  it("supports controlled pattern/testString/flags", () => {
    const onPattern = vi.fn();
    renderWithTheme(
      <RegExpTester
        pattern="abc"
        testString="abc def"
        flags="gi"
        onPatternChange={onPattern}
      />
    );
    const input = screen.getByLabelText("Regular expression pattern");
    expect(input).toHaveValue("abc");
  });

  it.each(["sm", "md"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(<RegExpTester size={size} />);
    expect(root().className).toContain(`vf-regexp-tester--${size}`);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<RegExpTester />);
    await expectNoA11yViolations(container);
  });
});

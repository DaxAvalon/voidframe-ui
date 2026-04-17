import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokenVisualizer, type Token } from "../TokenVisualizer";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("TokenVisualizer", () => {
  it("renders tokens from a string array", () => {
    renderWithTheme(<TokenVisualizer tokens={["Hello", " ", "world"]} />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
    expect(screen.getByText("world")).toBeInTheDocument();
  });

  it("renders tokens from a Token array", () => {
    const tokens: Token[] = [
      { text: "foo", id: 1 },
      { text: "bar", id: 2 },
    ];
    renderWithTheme(<TokenVisualizer tokens={tokens} />);
    expect(screen.getByText("foo")).toBeInTheDocument();
    expect(screen.getByText("bar")).toBeInTheDocument();
  });

  it("renders individual spans per token", () => {
    renderWithTheme(<TokenVisualizer tokens={["a", "b", "c"]} />);
    const spans = document.querySelectorAll(".vf-token-viz__token");
    expect(spans).toHaveLength(3);
  });

  it("applies alternating classes", () => {
    renderWithTheme(
      <TokenVisualizer tokens={["a", "b"]} colorMode="alternating" />
    );
    const spans = document.querySelectorAll(".vf-token-viz__token");
    expect(spans[0]?.className).toContain("even");
    expect(spans[1]?.className).toContain("odd");
  });

  it("applies logprob coloring", () => {
    const tokens: Token[] = [
      { text: "hi", logprob: -0.1 },
      { text: "lo", logprob: -5 },
    ];
    renderWithTheme(
      <TokenVisualizer tokens={tokens} colorMode="logprob" />
    );
    const spans = document.querySelectorAll(".vf-token-viz__token");
    expect(spans[0]?.className).toContain("high-prob");
    expect(spans[1]?.className).toContain("low-prob");
  });

  it("shows boundaries by default", () => {
    const { root } = renderWithTheme(
      <TokenVisualizer tokens={["a", "b"]} />
    );
    expect(root().className).not.toContain("no-boundaries");
  });

  it("hides boundaries when showBoundaries={false}", () => {
    const { root } = renderWithTheme(
      <TokenVisualizer tokens={["a", "b"]} showBoundaries={false} />
    );
    expect(root().className).toContain("no-boundaries");
  });

  it("fires onTokenClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <TokenVisualizer tokens={["click-me"]} onTokenClick={onClick} />
    );
    await userEvent.click(screen.getByText("click-me"));
    expect(onClick).toHaveBeenCalledWith(
      expect.objectContaining({ text: "click-me" }),
      0
    );
  });

  it("fires onTokenHover", async () => {
    const onHover = vi.fn();
    renderWithTheme(
      <TokenVisualizer tokens={["hover-me"]} onTokenHover={onHover} />
    );
    await userEvent.hover(screen.getByText("hover-me"));
    expect(onHover).toHaveBeenCalledWith(
      expect.objectContaining({ text: "hover-me" }),
      0
    );
  });

  it("highlights selectedTokens", () => {
    renderWithTheme(
      <TokenVisualizer tokens={["a", "b", "c"]} selectedTokens={[1]} />
    );
    const spans = document.querySelectorAll(".vf-token-viz__token");
    expect(spans[1]?.className).toContain("selected");
    expect(spans[0]?.className).not.toContain("selected");
  });

  it("styles special tokens", () => {
    const tokens: Token[] = [{ text: "<|endoftext|>", special: true }];
    renderWithTheme(<TokenVisualizer tokens={tokens} />);
    const span = document.querySelector(".vf-token-viz__token--special");
    expect(span).toBeTruthy();
  });

  it("makes whitespace visible", () => {
    renderWithTheme(<TokenVisualizer tokens={[" "]} />);
    const span = document.querySelector(".vf-token-viz__token--whitespace");
    expect(span).toBeTruthy();
  });

  it("shows token count summary", () => {
    renderWithTheme(<TokenVisualizer tokens={["a", "b", "c"]} />);
    expect(screen.getByText("3 tokens")).toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(
      <TokenVisualizer tokens={["a"]} size={size} />
    );
    expect(root().className).toContain(`vf-token-viz--${size}`);
  });

  it("applies colorMode=none without color classes", () => {
    renderWithTheme(
      <TokenVisualizer tokens={["a", "b"]} colorMode="none" />
    );
    const spans = document.querySelectorAll(".vf-token-viz__token");
    expect(spans[0]?.className).not.toContain("even");
    expect(spans[0]?.className).not.toContain("odd");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <TokenVisualizer tokens={["hello", "world"]} />
    );
    await expectNoA11yViolations(container);
  });
});

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MarkdownEditor,
  applyMarkdownCommand,
  renderMarkdownBlocks,
} from "../MarkdownEditor";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("renderMarkdownBlocks", () => {
  it("renders headings", () => {
    const { container } = render(<>{renderMarkdownBlocks("# Hello")}</>);
    expect(container.querySelector("h1")?.textContent).toBe("Hello");
    const { container: c2 } = render(<>{renderMarkdownBlocks("## Sub")}</>);
    expect(c2.querySelector("h2")?.textContent).toBe("Sub");
  });

  it("renders bold + italic inline", () => {
    const { container } = render(
      <>{renderMarkdownBlocks("**hi** and *bye*")}</>
    );
    expect(container.querySelector("strong")?.textContent).toBe("hi");
    expect(container.querySelector("em")?.textContent).toBe("bye");
  });

  it("renders bulleted lists", () => {
    const { container } = render(<>{renderMarkdownBlocks("- a\n- b")}</>);
    const items = container.querySelectorAll("ul li");
    expect(items).toHaveLength(2);
    expect(items[0]?.textContent).toBe("a");
    expect(items[1]?.textContent).toBe("b");
  });

  it("renders fenced code", () => {
    const { container } = render(
      <>{renderMarkdownBlocks("```\nconst x = 1;\n```")}</>
    );
    expect(container.querySelector("pre code")?.textContent).toBe(
      "const x = 1;"
    );
  });

  it("renders links with safe href + noopener", () => {
    const { container } = render(
      <>{renderMarkdownBlocks("[vf](https://example.com)")}</>
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("href")).toBe("https://example.com");
    expect(a?.getAttribute("rel")).toBe("noreferrer noopener");
    expect(a?.textContent).toBe("vf");
  });

  it("blocks javascript: URLs in links", () => {
    const { container } = render(
      <>{renderMarkdownBlocks("[pwn](javascript:alert(1))")}</>
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("href")).toBe("#");
  });

  it("never produces <script> even with raw HTML in source", () => {
    const { container } = render(
      <>{renderMarkdownBlocks("<script>alert(1)</script>")}</>
    );
    // React escapes text content — no real <script> tag should exist.
    expect(container.querySelector("script")).toBeNull();
    expect(container.textContent).toContain("<script>alert(1)</script>");
  });

  it("renders a horizontal rule", () => {
    const { container } = render(<>{renderMarkdownBlocks("---")}</>);
    expect(container.querySelector("hr")).toBeTruthy();
  });

  it("respects linkTarget=_self (no target/rel)", () => {
    const { container } = render(
      <>
        {renderMarkdownBlocks("[x](https://example.com)", {
          linkTarget: "_self",
        })}
      </>
    );
    const a = container.querySelector("a");
    expect(a?.getAttribute("target")).toBeNull();
    expect(a?.getAttribute("rel")).toBeNull();
  });

  it("honors components override", () => {
    const H1 = (p: { children?: React.ReactNode }) => (
      <div data-testid="custom-h1">{p.children}</div>
    );
    const { getByTestId } = render(
      <>{renderMarkdownBlocks("# Hi", { components: { h1: H1 } })}</>
    );
    expect(getByTestId("custom-h1").textContent).toBe("Hi");
  });
});

describe("applyMarkdownCommand", () => {
  it("wraps selection with ** for bold", () => {
    const ta = document.createElement("textarea");
    ta.value = "hello";
    ta.selectionStart = 0;
    ta.selectionEnd = 5;
    applyMarkdownCommand(ta, "bold");
    expect(ta.value).toBe("**hello**");
  });

  it("prepends ## on the current line for heading", () => {
    const ta = document.createElement("textarea");
    ta.value = "title";
    ta.selectionStart = 0;
    ta.selectionEnd = 0;
    applyMarkdownCommand(ta, "heading");
    expect(ta.value).toBe("## title");
  });

  it("inserts placeholder for empty selection", () => {
    const ta = document.createElement("textarea");
    ta.value = "";
    ta.selectionStart = 0;
    ta.selectionEnd = 0;
    applyMarkdownCommand(ta, "italic");
    expect(ta.value).toBe("*italic*");
  });
});

describe("MarkdownEditor", () => {
  it("renders textarea + preview side by side", () => {
    renderWithTheme(<MarkdownEditor label="Notes" defaultValue="# Hi" />);
    expect(screen.getByLabelText("Notes")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Markdown preview" })).toBeInTheDocument();
  });

  it("preview can be hidden via prop", () => {
    renderWithTheme(<MarkdownEditor label="Notes" preview={false} />);
    expect(
      screen.queryByRole("region", { name: "Markdown preview" })
    ).not.toBeInTheDocument();
  });

  it("typing emits onChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(<MarkdownEditor label="Notes" onValueChange={onChange} />);
    const ta = screen.getByLabelText("Notes");
    await userEvent.type(ta, "hi");
    expect(onChange).toHaveBeenCalled();
  });

  it("toolbar Bold button injects ** around selection", async () => {
    renderWithTheme(<MarkdownEditor label="Notes" defaultValue="hello" />);
    const ta = screen.getByLabelText("Notes") as HTMLTextAreaElement;
    ta.selectionStart = 0;
    ta.selectionEnd = 5;
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(ta.value).toBe("**hello**");
  });

  it("toggle preview button hides/shows the preview pane", async () => {
    renderWithTheme(<MarkdownEditor label="Notes" />);
    await userEvent.click(
      screen.getByRole("button", { name: "Hide preview" })
    );
    expect(
      screen.queryByRole("region", { name: "Markdown preview" })
    ).not.toBeInTheDocument();
  });
});

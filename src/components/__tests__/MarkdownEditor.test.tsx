import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MarkdownEditor,
  applyMarkdownCommand,
  renderMarkdown,
} from "../MarkdownEditor";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("renderMarkdown", () => {
  it("renders headings", () => {
    expect(renderMarkdown("# Hello")).toContain("<h1>Hello</h1>");
    expect(renderMarkdown("## Sub")).toContain("<h2>Sub</h2>");
  });

  it("renders bold + italic inline", () => {
    const out = renderMarkdown("**hi** and *bye*");
    expect(out).toContain("<strong>hi</strong>");
    expect(out).toContain("<em>bye</em>");
  });

  it("renders bulleted lists", () => {
    const out = renderMarkdown("- a\n- b");
    expect(out).toContain("<ul><li>a</li><li>b</li></ul>");
  });

  it("renders fenced code", () => {
    const out = renderMarkdown("```\nconst x = 1;\n```");
    expect(out).toContain("<pre><code>const x = 1;</code></pre>");
  });

  it("renders links", () => {
    const out = renderMarkdown("[vf](https://example.com)");
    expect(out).toContain('<a href="https://example.com">vf</a>');
  });

  it("escapes HTML in raw input", () => {
    const out = renderMarkdown("<script>alert(1)</script>");
    expect(out).not.toContain("<script>");
    expect(out).toContain("&lt;script&gt;");
  });

  it("renders a horizontal rule", () => {
    expect(renderMarkdown("---")).toContain("<hr/>");
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
    renderWithTheme(<MarkdownEditor label="Notes" onChange={onChange} />);
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

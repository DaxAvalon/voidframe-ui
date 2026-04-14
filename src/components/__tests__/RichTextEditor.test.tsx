import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RichTextEditor } from "../RichTextEditor";
import { renderWithTheme } from "../../../test/renderWithTheme";

function setHTML(el: HTMLElement, html: string): void {
  (el as unknown as Record<string, string>).innerHTML = html;
}

describe("RichTextEditor", () => {
  it("renders a toolbar with default commands", () => {
    renderWithTheme(<RichTextEditor label="Body" />);
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Italic" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Heading 1" })).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Body" })).toBeInTheDocument();
  });

  it("clicking a tool invokes the command bridge", async () => {
    const bridge = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: bridge,
    });
    renderWithTheme(<RichTextEditor label="Body" />);
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(bridge).toHaveBeenCalledWith("bold");
  });

  it("emits onChange when content changes via input event", () => {
    const onChange = vi.fn();
    renderWithTheme(<RichTextEditor label="Body" onChange={onChange} />);
    const content = screen.getByRole("textbox", { name: "Body" }) as HTMLDivElement;
    setHTML(content, "<p>hello</p>");
    content.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith("<p>hello</p>");
  });

  it("respects a custom toolbar subset", () => {
    renderWithTheme(
      <RichTextEditor label="Body" toolbar={["bold", "italic"]} />
    );
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Heading 1" })
    ).not.toBeInTheDocument();
  });

  it("readOnly prevents command dispatch", async () => {
    const bridge = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: bridge,
    });
    renderWithTheme(<RichTextEditor label="Body" readOnly />);
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(bridge).not.toHaveBeenCalled();
  });

  it("renderToolbar swaps in custom chrome", () => {
    renderWithTheme(
      <RichTextEditor
        label="Body"
        renderToolbar={(api) => (
          <button onClick={() => api.run("bold")}>MyBold</button>
        )}
      />
    );
    expect(screen.getByText("MyBold")).toBeInTheDocument();
  });
});

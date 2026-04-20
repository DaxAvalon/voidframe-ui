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
    renderWithTheme(<RichTextEditor label="Body" onValueChange={onChange} />);
    const content = screen.getByRole("textbox", { name: "Body" }) as HTMLDivElement;
    setHTML(content, "<p>hello</p>");
    content.dispatchEvent(new Event("input", { bubbles: true }));
    expect(onChange).toHaveBeenCalledWith("<p>hello</p>");
  });

  it("onInput with script tag is sanitized before onChange fires", () => {
    const onChange = vi.fn();
    renderWithTheme(<RichTextEditor label="Body" onValueChange={onChange} />);
    const content = screen.getByRole("textbox", { name: "Body" }) as HTMLDivElement;
    setHTML(content, "<p>safe<script>alert(1)</script></p>");
    content.dispatchEvent(new Event("input", { bubbles: true }));
    const received = String(onChange.mock.calls.at(-1)?.[0] ?? "");
    expect(received.toLowerCase()).not.toContain("<script");
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

  it("disabled prevents command dispatch", async () => {
    const bridge = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, "execCommand", {
      configurable: true,
      value: bridge,
    });
    renderWithTheme(<RichTextEditor label="Body" disabled />);
    await userEvent.click(screen.getByRole("button", { name: "Bold" }));
    expect(bridge).not.toHaveBeenCalled();
  });

  it("renders all toolbar commands when no subset is given", () => {
    renderWithTheme(<RichTextEditor label="Body" />);
    expect(screen.getByRole("button", { name: "Underline" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Strikethrough" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Block quote" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inline code" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Insert link" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Clear formatting" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Ordered list" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bulleted list" })).toBeInTheDocument();
  });

  it("contentEditable is false when readOnly", () => {
    renderWithTheme(<RichTextEditor label="Body" readOnly />);
    const textbox = screen.getByRole("textbox", { name: "Body" });
    expect(textbox.getAttribute("contenteditable")).toBe("false");
  });

  it("contentEditable is false when disabled", () => {
    renderWithTheme(<RichTextEditor label="Body" disabled />);
    const textbox = screen.getByRole("textbox", { name: "Body" });
    expect(textbox.getAttribute("contenteditable")).toBe("false");
  });

  it("renders with placeholder text", () => {
    renderWithTheme(<RichTextEditor label="Body" placeholder="Write..." />);
    const textbox = screen.getByRole("textbox", { name: "Body" });
    expect(textbox.getAttribute("data-placeholder")).toBe("Write...");
  });

  it("renders with custom minHeight", () => {
    renderWithTheme(<RichTextEditor label="Body" minHeight={300} />);
    const textbox = screen.getByRole("textbox", { name: "Body" });
    expect(textbox.style.minHeight).toBe("300px");
  });

  it("renders default aria-label when no label given", () => {
    renderWithTheme(<RichTextEditor />);
    expect(
      screen.getByRole("textbox", { name: "Rich text editor" })
    ).toBeInTheDocument();
  });

  it("uses controlled value", () => {
    renderWithTheme(<RichTextEditor label="Body" value="<p>controlled</p>" />);
    expect(screen.getByRole("textbox", { name: "Body" })).toBeInTheDocument();
  });
});

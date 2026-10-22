// GFM tables and task lists in the bundled markdown renderer.
import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { renderMarkdownBlocks } from "../MarkdownEditor";
import { MarkdownRenderer } from "../Viewers/MarkdownRenderer";
import { MessageContent } from "../Chat/Message";

const table = [
  "| Name | Qty | Price |",
  "|:-----|:---:|------:|",
  "| Tea  | 2   | 3.50  |",
  "| Milk | 1   |",
].join("\n");

describe("markdown GFM tables", () => {
  it("renders table/thead/tbody with alignment and padded cells", () => {
    const { container } = renderWithTheme(renderMarkdownBlocks(table));
    const t = container.querySelector("table.vf-md-table")!;
    expect(t).toBeTruthy();
    const ths = t.querySelectorAll("thead th[scope='col']");
    expect(ths.length).toBe(3);
    expect((ths[0] as HTMLElement).style.textAlign).toBe("left");
    expect((ths[1] as HTMLElement).style.textAlign).toBe("center");
    expect((ths[2] as HTMLElement).style.textAlign).toBe("right");
    const rows = t.querySelectorAll("tbody tr");
    expect(rows.length).toBe(2);
    expect(rows[1]!.querySelectorAll("td").length).toBe(3);
    expect((rows[0]!.querySelectorAll("td")[2] as HTMLElement).style.textAlign).toBe("right");
    expect(screen.getByText("Tea")).toBeInTheDocument();
  });

  it("supports inline markup and escaped pipes in cells", () => {
    const { container } = renderWithTheme(
      renderMarkdownBlocks("| a | b |\n| - | - |\n| **bold** | x \\| y |")
    );
    expect(container.querySelector("td strong")!.textContent).toBe("bold");
    expect(container.querySelectorAll("td")[1]!.textContent).toBe("x | y");
  });

  it("does not treat a lone pipe line without a delimiter row as a table", () => {
    const { container } = renderWithTheme(renderMarkdownBlocks("a | b\nplain"));
    expect(container.querySelector("table")).toBeNull();
    expect(container.querySelector("p")!.textContent).toBe("a | b plain");
  });

  it("starts a table directly after a paragraph line", () => {
    const { container } = renderWithTheme(
      renderMarkdownBlocks("Intro\n| h |\n| - |\n| v |")
    );
    expect(container.querySelector("p")!.textContent).toBe("Intro");
    expect(container.querySelector("table td")!.textContent).toBe("v");
  });

  it("honours components overrides for table tags", () => {
    const Td = (p: React.HTMLAttributes<HTMLTableCellElement>) => (
      <td data-custom="1" {...p} />
    );
    const { container } = renderWithTheme(
      renderMarkdownBlocks("| h |\n| - |\n| v |", { components: { td: Td } })
    );
    expect(container.querySelector("td[data-custom='1']")!.textContent).toBe("v");
  });
});

describe("markdown task lists", () => {
  const md = "Todo\n\n- [ ] write\n- [x] test\n- plain\n\n1. [X] ship";

  it("renders checkboxes, disabled without a handler, with state classes", () => {
    const { container } = renderWithTheme(<MarkdownRenderer content={md} />);
    const boxes = container.querySelectorAll<HTMLInputElement>(".vf-md-task__checkbox");
    expect(boxes.length).toBe(3);
    expect(boxes[0]!.checked).toBe(false);
    expect(boxes[1]!.checked).toBe(true);
    expect(boxes[2]!.checked).toBe(true);
    boxes.forEach((b) => expect(b.disabled).toBe(true));
    expect(container.querySelector("ul")).toHaveClass("vf-md-task-list");
    expect(container.querySelectorAll("li.vf-md-task")[1]).toHaveAttribute("data-checked", "true");
    expect(container.querySelector("ol li")).toHaveClass("vf-md-task");
    // The plain item keeps its text and is not a task.
    expect(container.querySelectorAll("ul li")[2]!.textContent).toBe("plain");
    expect(container.querySelectorAll("ul li")[2]).not.toHaveClass("vf-md-task");
    expect(container.textContent).not.toContain("[ ]");
  });

  it("onTaskToggle reports index, new state and 1-based line", async () => {
    const onTaskToggle = vi.fn();
    const { container } = renderWithTheme(
      <MarkdownRenderer content={md} onTaskToggle={onTaskToggle} />
    );
    const boxes = container.querySelectorAll<HTMLInputElement>(".vf-md-task__checkbox");
    boxes.forEach((b) => expect(b.disabled).toBe(false));
    await userEvent.click(boxes[0]!);
    expect(onTaskToggle).toHaveBeenLastCalledWith(0, true, 3);
    await userEvent.click(boxes[2]!);
    expect(onTaskToggle).toHaveBeenLastCalledWith(2, false, 7);
  });

  it("interactiveTasks=false keeps boxes disabled even with a handler", () => {
    const { container } = renderWithTheme(
      <MarkdownRenderer content={md} onTaskToggle={() => {}} interactiveTasks={false} />
    );
    container
      .querySelectorAll<HTMLInputElement>(".vf-md-task__checkbox")
      .forEach((b) => expect(b.disabled).toBe(true));
  });

  it("MessageContent forwards onTaskToggle for string and part content", async () => {
    const onTaskToggle = vi.fn();
    const { container } = renderWithTheme(
      <>
        <MessageContent content="- [ ] a" markdown onTaskToggle={onTaskToggle} />
        <MessageContent
          content={[{ type: "text", text: "- [x] b" }]}
          markdown
          onTaskToggle={onTaskToggle}
        />
      </>
    );
    const boxes = container.querySelectorAll<HTMLInputElement>(".vf-md-task__checkbox");
    expect(boxes.length).toBe(2);
    await userEvent.click(boxes[1]!);
    expect(onTaskToggle).toHaveBeenCalledWith(0, false, 1);
  });
});

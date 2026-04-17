// Tests for Viewers sub-components: CodeBlock, DiffViewer, JSONViewer, LogViewer

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { CodeBlock } from "../Viewers/CodeBlock";
import { DiffViewer } from "../Viewers/DiffViewer";
import { JSONViewer } from "../Viewers/JSONViewer";
import { LogViewer } from "../Viewers/LogViewer";

describe("CodeBlock", () => {
  const sample = "const a = 1;\nconst b = 2;\nconst c = 3;";

  it("renders code lines with line numbers", () => {
    renderWithTheme(<CodeBlock code={sample} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("const a = 1;")).toBeInTheDocument();
  });

  it("hides line numbers when lineNumbers=false", () => {
    renderWithTheme(<CodeBlock code={sample} lineNumbers={false} />);
    expect(screen.queryByText("1")).not.toBeInTheDocument();
    expect(screen.getByText("const a = 1;")).toBeInTheDocument();
  });

  it("renders copy button when copyable", () => {
    renderWithTheme(<CodeBlock code={sample} copyable />);
    const btn = screen.getByRole("button", { name: "Copy code" });
    expect(btn).toBeInTheDocument();
    expect(btn.textContent).toBe("Copy");
  });

  it("renders filename in header", () => {
    renderWithTheme(<CodeBlock code={sample} fileName="app.ts" copyable />);
    expect(screen.getByText("app.ts")).toBeInTheDocument();
  });

  it("highlights specified lines", () => {
    const { container } = renderWithTheme(
      <CodeBlock code={sample} highlightLines={[2]} />
    );
    const highlighted = container.querySelector(".vf-codeblock__line--highlight");
    expect(highlighted).toBeInTheDocument();
  });

  it("renders search input when searchable", async () => {
    renderWithTheme(<CodeBlock code={sample} searchable />);
    const search = screen.getByRole("textbox", { name: "Search in code" });
    expect(search).toBeInTheDocument();
    await userEvent.type(search, "const b");
    expect(screen.getByText("const b")).toBeInTheDocument();
  });

  it("renders download button when downloadable", () => {
    renderWithTheme(<CodeBlock code={sample} downloadable />);
    expect(screen.getByRole("button", { name: "Download code" })).toBeInTheDocument();
  });

  it("renders ReactNode from highlight function", () => {
    renderWithTheme(
      <CodeBlock
        code={sample}
        highlight={() => <span data-testid="custom">highlighted</span>}
      />
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("sets data-language attribute", () => {
    const { container } = renderWithTheme(
      <CodeBlock code={sample} language="typescript" />
    );
    expect(container.querySelector("[data-language='typescript']")).toBeInTheDocument();
  });

  it("search highlights matching text with <mark>", async () => {
    const { container } = renderWithTheme(
      <CodeBlock code={sample} searchable />
    );
    const search = screen.getByRole("textbox", { name: "Search in code" });
    await userEvent.type(search, "const b");
    const marks = container.querySelectorAll("mark.vf-code-block__match");
    expect(marks.length).toBeGreaterThanOrEqual(1);
    expect(marks[0]!.textContent).toBe("const b");
  });

  it("highlight function returning string writes to HTMLPane", () => {
    const { container } = renderWithTheme(
      <CodeBlock
        code="x = 1"
        highlight={(code) => `<span class="hl">${code}</span>`}
      />
    );
    expect(container.querySelector(".vf-codeblock__highlight")).toBeInTheDocument();
  });

  it("download button triggers download", () => {
    const createObjectURL = vi.fn().mockReturnValue("blob:test");
    const revokeObjectURL = vi.fn();
    Object.defineProperty(URL, "createObjectURL", { value: createObjectURL, configurable: true });
    Object.defineProperty(URL, "revokeObjectURL", { value: revokeObjectURL, configurable: true });

    renderWithTheme(<CodeBlock code={sample} downloadable downloadFilename="test.ts" />);
    const btn = screen.getByRole("button", { name: "Download code" });
    fireEvent.click(btn);
    expect(createObjectURL).toHaveBeenCalled();
    expect(revokeObjectURL).toHaveBeenCalled();
  });
});

describe("DiffViewer", () => {
  it("renders diff container", () => {
    const { container } = renderWithTheme(
      <DiffViewer oldValue="hello\nworld" newValue="hello\nearth" />
    );
    expect(container.querySelector(".vf-diff")).toBeInTheDocument();
  });

  it("renders lines from both old and new values", () => {
    const { container } = renderWithTheme(
      <DiffViewer oldValue="alpha" newValue="beta" />
    );
    const lines = container.querySelectorAll(".vf-diff__line");
    expect(lines.length).toBeGreaterThan(0);
  });
});

describe("JSONViewer", () => {
  it("renders JSON with expandable keys", () => {
    renderWithTheme(<JSONViewer data={{ name: "test", count: 42 }} />);
    expect(screen.getByText(/"name"/)).toBeInTheDocument();
    expect(screen.getByText(/"test"/)).toBeInTheDocument();
  });

  it("renders arrays", () => {
    const { container } = renderWithTheme(<JSONViewer data={[1, 2, 3]} />);
    expect(container.querySelector(".vf-json-viewer")).toBeInTheDocument();
  });

  it("renders null and boolean values", () => {
    renderWithTheme(<JSONViewer data={{ flag: true, empty: null }} />);
    expect(screen.getByText(/true/)).toBeInTheDocument();
    expect(screen.getByText(/null/)).toBeInTheDocument();
  });
});

describe("LogViewer", () => {
  const entries = [
    { timestamp: "2024-01-01T00:00:00Z", level: "info" as const, message: "Started" },
    { timestamp: "2024-01-01T00:00:01Z", level: "error" as const, message: "Failed" },
    { timestamp: "2024-01-01T00:00:02Z", level: "warn" as const, message: "Slow query" },
  ];

  it("renders log entries", () => {
    renderWithTheme(<LogViewer entries={entries} />);
    expect(screen.getByText("Started")).toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });

  it("shows level indicators", () => {
    const { container } = renderWithTheme(<LogViewer entries={entries} />);
    expect(container.querySelector(".vf-log-viewer__level--info")).toBeInTheDocument();
    expect(container.querySelector(".vf-log-viewer__level--error")).toBeInTheDocument();
  });

  it("filters by log level", () => {
    renderWithTheme(<LogViewer entries={entries} level="warn" />);
    expect(screen.queryByText("Started")).not.toBeInTheDocument();
    expect(screen.getByText("Failed")).toBeInTheDocument();
    expect(screen.getByText("Slow query")).toBeInTheDocument();
  });

  it("shows filter input when filterable", () => {
    renderWithTheme(<LogViewer entries={entries} filterable />);
    expect(screen.getByRole("textbox", { name: "Filter log entries" })).toBeInTheDocument();
  });

  it("filters entries by text input", async () => {
    renderWithTheme(<LogViewer entries={entries} filterable />);
    const input = screen.getByRole("textbox", { name: "Filter log entries" });
    await userEvent.type(input, "Slow");
    expect(screen.queryByText("Started")).not.toBeInTheDocument();
    expect(screen.getByText("Slow query")).toBeInTheDocument();
  });

  it("shows pause/resume button", () => {
    renderWithTheme(<LogViewer entries={entries} pausable />);
    expect(screen.getByText(/Pause/)).toBeInTheDocument();
  });

  it("pauses scrolling on button click", async () => {
    renderWithTheme(<LogViewer entries={entries} pausable />);
    await userEvent.click(screen.getByText(/Pause/));
    expect(screen.getByText(/Resume/)).toBeInTheDocument();
  });

  it("fires onEntryClick", async () => {
    const onEntryClick = vi.fn();
    renderWithTheme(<LogViewer entries={entries} onEntryClick={onEntryClick} />);
    await userEvent.click(screen.getByText("Started"));
    expect(onEntryClick).toHaveBeenCalled();
  });
});

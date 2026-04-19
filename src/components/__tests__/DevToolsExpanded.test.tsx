// Expanded coverage tests for DevTools.tsx — NetworkInspector detail, ConsoleOutput, DebugTree, QueryBuilder, toYaml

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  CommitGraph,
  ConsoleOutput,
  DebugTree,
  KeyValueEditor,
  NetworkInspector,
  QueryBuilder,
  ShortcutEditor,
  toYaml,
} from "../DevTools";

describe("NetworkInspector detail pane", () => {
  const requestWithHeaders = {
    id: "1",
    method: "POST",
    url: "/api/data",
    status: 201,
    duration: 120,
    size: 4096,
    state: "complete" as const,
    requestHeaders: { "Content-Type": "application/json" },
    responseHeaders: { "X-Request-Id": "abc123" },
    requestBody: { key: "value" },
    responseBody: { result: "ok" },
  };

  it("shows detail section with headers and body when item selected", () => {
    renderWithTheme(
      <NetworkInspector requests={[requestWithHeaders]} selectedId="1" />
    );
    expect(screen.getByText("Request headers")).toBeInTheDocument();
    expect(screen.getByText("Response headers")).toBeInTheDocument();
    expect(screen.getByText("Request body")).toBeInTheDocument();
    expect(screen.getByText("Response body")).toBeInTheDocument();
  });

  it("hides detail pane when showDetail=false", () => {
    renderWithTheme(
      <NetworkInspector
        requests={[requestWithHeaders]}
        selectedId="1"
        showDetail={false}
      />
    );
    expect(screen.queryByText("Request headers")).not.toBeInTheDocument();
  });

  it("shows pending placeholder when no status", () => {
    renderWithTheme(
      <NetworkInspector
        requests={[{ id: "p", method: "GET", url: "/pending" }]}
      />
    );
    expect(document.querySelector(".vf-network-inspector__pending")).toBeInTheDocument();
  });

  it("formats size in KB and MB", () => {
    renderWithTheme(
      <NetworkInspector
        requests={[
          { id: "1", method: "GET", url: "/a", size: 500 },
          { id: "2", method: "GET", url: "/b", size: 2048 },
          { id: "3", method: "GET", url: "/c", size: 1048576 },
        ]}
      />
    );
    expect(screen.getByText("500B")).toBeInTheDocument();
    expect(screen.getByText("2.0K")).toBeInTheDocument();
    expect(screen.getByText("1.0M")).toBeInTheDocument();
  });

  it("formats duration in ms and seconds", () => {
    renderWithTheme(
      <NetworkInspector
        requests={[
          { id: "1", method: "GET", url: "/a", duration: 0.5 },
          { id: "2", method: "GET", url: "/b", duration: 250 },
          { id: "3", method: "GET", url: "/c", duration: 1500 },
        ]}
      />
    );
    expect(screen.getByText("<1ms")).toBeInTheDocument();
    expect(screen.getByText("250ms")).toBeInTheDocument();
    expect(screen.getByText("1.50s")).toBeInTheDocument();
  });

  it("status tone: 3xx is info, 4xx is warning", () => {
    renderWithTheme(
      <NetworkInspector
        requests={[
          { id: "1", method: "GET", url: "/r", status: 301 },
          { id: "2", method: "GET", url: "/n", status: 404 },
        ]}
      />
    );
    expect(screen.getByText("301")).toHaveClass("vf-network-inspector__status--info");
    expect(screen.getByText("404")).toHaveClass("vf-network-inspector__status--warning");
  });

  it("error state row has error class", () => {
    const { container } = renderWithTheme(
      <NetworkInspector
        requests={[{ id: "1", method: "GET", url: "/err", state: "error" }]}
      />
    );
    expect(container.querySelector(".vf-network-inspector__row--error")).toBeInTheDocument();
  });

  it("controlled filter via onFilterChange", () => {
    const onFilterChange = vi.fn();
    renderWithTheme(
      <NetworkInspector
        requests={[{ id: "1", method: "GET", url: "/test" }]}
        filter="test"
        onFilterChange={onFilterChange}
      />
    );
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "new" } });
    expect(onFilterChange).toHaveBeenCalledWith("new");
  });

  it("filters by method and type", async () => {
    renderWithTheme(
      <NetworkInspector
        requests={[
          { id: "1", method: "GET", url: "/a", type: "xhr" },
          { id: "2", method: "POST", url: "/b", type: "fetch" },
        ]}
      />
    );
    const search = screen.getByRole("searchbox");
    await userEvent.type(search, "post");
    expect(screen.queryByText("/a")).not.toBeInTheDocument();
    expect(screen.getByText("/b")).toBeInTheDocument();
  });
});

describe("ConsoleOutput extended", () => {
  it("exact level filter (warn only)", () => {
    const entries = [
      { level: "warn" as const, message: "warning" },
      { level: "error" as const, message: "oops" },
      { level: "log" as const, message: "normal" },
    ];
    renderWithTheme(<ConsoleOutput entries={entries} filter="warn" />);
    expect(screen.getByText("warning")).toBeInTheDocument();
    expect(screen.queryByText("oops")).not.toBeInTheDocument();
    expect(screen.queryByText("normal")).not.toBeInTheDocument();
  });

  it("shows timestamps when provided", () => {
    const entries = [
      { level: "info" as const, message: "timed", timestamp: new Date("2025-01-01T12:00:00Z") },
    ];
    const { container } = renderWithTheme(
      <ConsoleOutput entries={entries} showTimestamps />
    );
    expect(container.querySelector(".vf-console-output__time")).toBeInTheDocument();
  });

  it("hides timestamps when showTimestamps=false", () => {
    const entries = [
      { level: "info" as const, message: "notimed", timestamp: 1700000000000 },
    ];
    const { container } = renderWithTheme(
      <ConsoleOutput entries={entries} showTimestamps={false} />
    );
    expect(container.querySelector(".vf-console-output__time")).not.toBeInTheDocument();
  });

  it("shows source when provided", () => {
    const entries = [
      { level: "info" as const, message: "msg", source: "app.js" },
    ];
    renderWithTheme(<ConsoleOutput entries={entries} />);
    expect(screen.getByText("app.js")).toBeInTheDocument();
  });

  it("invalid filter returns all entries", () => {
    const entries = [
      { level: "info" as const, message: "a" },
      { level: "warn" as const, message: "b" },
    ];
    renderWithTheme(<ConsoleOutput entries={entries} filter="unknown" />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });

  it("debug+ filter returns all levels", () => {
    const entries = [
      { level: "debug" as const, message: "d" },
      { level: "log" as const, message: "l" },
      { level: "info" as const, message: "i" },
      { level: "warn" as const, message: "w" },
      { level: "error" as const, message: "e" },
    ];
    renderWithTheme(<ConsoleOutput entries={entries} filter="debug+" />);
    expect(screen.getByText("d")).toBeInTheDocument();
    expect(screen.getByText("e")).toBeInTheDocument();
  });

  it("level glyphs are correct", () => {
    const entries = [
      { id: "1", level: "error" as const, message: "err" },
      { id: "2", level: "warn" as const, message: "wrn" },
      { id: "3", level: "info" as const, message: "inf" },
      { id: "4", level: "debug" as const, message: "dbg" },
      { id: "5", level: "log" as const, message: "lg" },
    ];
    const { container } = renderWithTheme(<ConsoleOutput entries={entries} />);
    const glyphs = container.querySelectorAll(".vf-console-output__level");
    expect(glyphs[0]?.textContent).toBe("✕");
    expect(glyphs[1]?.textContent).toBe("▲");
    expect(glyphs[2]?.textContent).toBe("ⓘ");
    expect(glyphs[3]?.textContent).toBe("⋯");
    expect(glyphs[4]?.textContent).toBe("›");
  });
});

describe("DebugTree extended", () => {
  it("renders with format data attribute", () => {
    const { container } = renderWithTheme(
      <DebugTree data={{ x: 1 }} format="yaml" />
    );
    expect(container.querySelector("[data-format='yaml']")).toBeInTheDocument();
  });

  it("renders JSON viewer without root label", () => {
    const { container } = renderWithTheme(<DebugTree data={{ a: 1 }} />);
    expect(container.querySelector(".vf-debug-tree")).toBeInTheDocument();
    expect(container.querySelector(".vf-debug-tree__label")).not.toBeInTheDocument();
  });

  it("renders with format=json class", () => {
    const { container } = renderWithTheme(<DebugTree data={{ x: 1 }} />);
    expect(container.querySelector(".vf-debug-tree--json")).toBeInTheDocument();
  });
});

describe("toYaml extended", () => {
  it("handles null and undefined", () => {
    expect(toYaml(null)).toBe("null");
    expect(toYaml(undefined)).toBe("null");
  });

  it("handles booleans", () => {
    expect(toYaml(false)).toBe("false");
  });

  it("handles numbers", () => {
    expect(toYaml(42)).toBe("42");
  });

  it("handles empty string", () => {
    expect(toYaml("")).toBe('""');
  });

  it("handles plain strings", () => {
    expect(toYaml("hello")).toBe("hello");
  });

  it("handles nested objects in arrays", () => {
    const result = toYaml([{ name: "a" }, { name: "b" }]);
    expect(result).toContain("- name: a");
    expect(result).toContain("- name: b");
  });

  it("handles nested empty collections", () => {
    const result = toYaml({ list: [], obj: {} });
    expect(result).toContain("list: []");
    expect(result).toContain("obj: {}");
  });

  it("quotes keys with special chars", () => {
    const result = toYaml({ "key:value": 1 });
    expect(result).toContain('"key:value"');
  });

  it("quotes strings matching YAML reserved words", () => {
    expect(toYaml("yes")).toBe('"yes"');
    expect(toYaml("no")).toBe('"no"');
    expect(toYaml("~")).toBe('"~"');
  });
});

describe("CommitGraph extended", () => {
  it("shows active commit with aria-current", () => {
    renderWithTheme(
      <CommitGraph
        commits={[
          { id: "abc1234", message: "first" },
          { id: "def5678", message: "second" },
        ]}
        activeId="abc1234"
      />
    );
    const active = document.querySelector("[aria-current='true']");
    expect(active).toBeInTheDocument();
    expect(active?.textContent).toContain("first");
  });

  it("shows timestamp and author when provided", () => {
    renderWithTheme(
      <CommitGraph
        commits={[
          { id: "abc1234", message: "msg", author: "Alice", timestamp: "2h ago" },
        ]}
      />
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("2h ago")).toBeInTheDocument();
  });

  it("disables buttons when no onCommitClick", () => {
    renderWithTheme(
      <CommitGraph commits={[{ id: "abc1234", message: "msg" }]} />
    );
    const btn = document.querySelector(".vf-commit-graph__row") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });
});

describe("KeyValueEditor extended", () => {
  it("updates key and value", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <KeyValueEditor
        value={[{ key: "foo", value: "bar", id: "1" }]}
        onValueChange={onChange}
      />
    );
    const inputs = screen.getAllByRole("textbox");
    const keyInput = inputs.find((i) => i.getAttribute("aria-label") === "Key")!;
    fireEvent.change(keyInput, { target: { value: "baz" } });
    expect(onChange).toHaveBeenCalled();
    const result = onChange.mock.calls[0][0];
    expect(result[0].key).toBe("baz");
  });

  it("toggles disabled via checkbox", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <KeyValueEditor
        value={[{ key: "k", value: "v", id: "1" }]}
        onValueChange={onChange}
        allowDisable
      />
    );
    const checkbox = screen.getByRole("checkbox");
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0][0].disabled).toBe(true);
  });

  it("hides checkbox when allowDisable=false", () => {
    renderWithTheme(
      <KeyValueEditor
        value={[{ key: "k", value: "v", id: "1" }]}
        onValueChange={() => {}}
        allowDisable={false}
      />
    );
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
  });
});

describe("QueryBuilder extended", () => {
  it("adds a group", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={{ id: "root", combinator: "AND", rules: [] }}
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "+ Group" }));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0][0];
    expect(next.rules[0].rules).toBeDefined();
  });

  it("removes a rule", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={{
          id: "root",
          combinator: "AND",
          rules: [{ id: "r1", field: "name", operator: "=", value: "test" }],
        }}
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove rule" }));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0][0];
    expect(next.rules).toHaveLength(0);
  });

  it("changes combinator", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={{ id: "root", combinator: "AND", rules: [] }}
        onValueChange={onChange}
      />
    );
    const select = screen.getByRole("combobox", { name: "Combinator" });
    await userEvent.selectOptions(select, "OR");
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0].combinator).toBe("OR");
  });
});

describe("ShortcutEditor extended", () => {
  it("shows 'unassigned' when no value", () => {
    renderWithTheme(<ShortcutEditor />);
    expect(screen.getByText("unassigned")).toBeInTheDocument();
  });

  it("shows current chord value", () => {
    renderWithTheme(<ShortcutEditor value="mod+s" />);
    expect(screen.getByText("mod+s")).toBeInTheDocument();
  });

  it("Escape during listening cancels capture", async () => {
    const onChange = vi.fn();
    renderWithTheme(<ShortcutEditor onValueChange={onChange} />);
    const btn = screen.getByRole("button", { name: "Edit shortcut" });
    await userEvent.click(btn);
    btn.focus();
    fireEvent.keyDown(btn, { key: "Escape" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("modifier-only key does not trigger capture", async () => {
    const onChange = vi.fn();
    renderWithTheme(<ShortcutEditor onValueChange={onChange} />);
    const btn = screen.getByRole("button", { name: "Edit shortcut" });
    await userEvent.click(btn);
    btn.focus();
    fireEvent.keyDown(btn, { key: "Shift" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it("shows placeholder during listening", async () => {
    renderWithTheme(<ShortcutEditor placeholder="Press keys..." />);
    const btn = screen.getByRole("button", { name: "Edit shortcut" });
    await userEvent.click(btn);
    expect(screen.getByText("Press keys...")).toBeInTheDocument();
  });

  it("controlled value with defaultValue fallback", () => {
    renderWithTheme(<ShortcutEditor defaultValue="alt+k" />);
    expect(screen.getByText("alt+k")).toBeInTheDocument();
  });
});

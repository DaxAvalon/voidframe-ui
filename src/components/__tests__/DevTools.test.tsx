import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
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
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("CommitGraph", () => {
  const commits = [
    { id: "abcdef1234", message: "first", branch: "main" },
    { id: "ba34567890", message: "second", tone: "success" as const },
    { id: "c12098", message: "third" },
  ];
  it("renders one row per commit", () => {
    renderWithTheme(<CommitGraph commits={commits} />);
    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.getByText("second")).toBeInTheDocument();
    expect(screen.getByText("third")).toBeInTheDocument();
  });
  it("fires onCommitClick", async () => {
    const onCommitClick = vi.fn();
    renderWithTheme(
      <CommitGraph commits={commits} onCommitClick={onCommitClick} />
    );
    await userEvent.click(screen.getByText("second"));
    expect(onCommitClick).toHaveBeenCalledWith("ba34567890");
  });
});

describe("NetworkInspector", () => {
  const requests = [
    { id: "1", method: "GET", url: "/a", status: 200, duration: 50, size: 200 },
    { id: "2", method: "POST", url: "/b", status: 500, duration: 400, size: 10 },
    { id: "3", method: "GET", url: "/c", state: "pending" as const },
  ];
  it("filters by URL", async () => {
    renderWithTheme(<NetworkInspector requests={requests} />);
    const search = screen.getByRole("searchbox");
    await userEvent.type(search, "/b");
    expect(screen.queryByText("/a")).not.toBeInTheDocument();
    expect(screen.getByText("/b")).toBeInTheDocument();
  });
  it("selects a row and shows detail", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <NetworkInspector
        requests={requests}
        selectedId="1"
        onSelect={onSelect}
      />
    );
    await userEvent.click(screen.getByText("/b"));
    expect(onSelect).toHaveBeenCalledWith("2");
  });
  it("filter prop updates the rendered list when controlled", () => {
    const { rerender } = renderWithTheme(
      <NetworkInspector requests={requests} filter="/a" onFilterChange={() => {}} />
    );
    expect(screen.getByText("/a")).toBeInTheDocument();
    expect(screen.queryByText("/b")).not.toBeInTheDocument();
    rerender(
      <NetworkInspector requests={requests} filter="/b" onFilterChange={() => {}} />
    );
    expect(screen.queryByText("/a")).not.toBeInTheDocument();
    expect(screen.getByText("/b")).toBeInTheDocument();
  });

  it("picks a tone per status", () => {
    renderWithTheme(<NetworkInspector requests={requests} />);
    const ok = screen.getByText("200");
    expect(ok).toHaveClass("vf-network-inspector__status--success");
    const err = screen.getByText("500");
    expect(err).toHaveClass("vf-network-inspector__status--danger");
  });
});

describe("ConsoleOutput", () => {
  const entries = [
    { level: "info" as const, message: "hello" },
    { level: "warn" as const, message: "watch" },
    { level: "error" as const, message: "boom" },
    { level: "debug" as const, message: "ping" },
  ];
  it("renders all levels by default", () => {
    renderWithTheme(<ConsoleOutput entries={entries} />);
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
  it("filters with 'warn+' (warnings or higher)", () => {
    renderWithTheme(<ConsoleOutput entries={entries} filter="warn+" />);
    expect(screen.queryByText("hello")).not.toBeInTheDocument();
    expect(screen.getByText("watch")).toBeInTheDocument();
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
});

describe("DebugTree", () => {
  it("renders JSON data with a root label", () => {
    renderWithTheme(
      <DebugTree rootLabel="state" data={{ count: 2, items: [1, 2] }} />
    );
    expect(screen.getByText("state")).toBeInTheDocument();
  });

  it("renders YAML output when format='yaml'", () => {
    const { container } = renderWithTheme(
      <DebugTree format="yaml" data={{ name: "voidframe", version: 1 }} />
    );
    const pre = container.querySelector(".vf-debug-tree__yaml");
    expect(pre).toBeTruthy();
    expect(pre!.textContent).toContain("name: voidframe");
    expect(pre!.textContent).toContain("version: 1");
  });
});

describe("toYaml", () => {
  it("serializes primitives and nested objects", () => {
    const out = toYaml({ flag: true, count: 3, tags: ["a", "b"] });
    expect(out).toContain("flag: true");
    expect(out).toContain("count: 3");
    expect(out).toContain("tags:");
    expect(out).toContain("- a");
    expect(out).toContain("- b");
  });

  it("quotes strings that would parse ambiguously", () => {
    expect(toYaml("true")).toBe('"true"');
    expect(toYaml("null")).toBe('"null"');
    expect(toYaml("line\nbreak")).toBe('"line\\nbreak"');
  });

  it("handles empty collections", () => {
    expect(toYaml([])).toBe("[]");
    expect(toYaml({})).toBe("{}");
  });
});

describe("KeyValueEditor", () => {
  it("adds a row", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <KeyValueEditor value={[]} onValueChange={onChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Add/ }));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0]![0];
    expect(next).toHaveLength(1);
  });
  it("removes a row", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <KeyValueEditor
        value={[{ key: "a", value: "1", id: "1" }]}
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onChange).toHaveBeenCalledWith([]);
  });
});

describe("QueryBuilder", () => {
  it("adds a rule and emits onChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={{ id: "root", combinator: "AND", rules: [] }}
        onValueChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "+ Rule" }));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0]![0];
    expect(next.rules).toHaveLength(1);
  });

  it("nested group's + Rule button emits a patched tree via onChange", async () => {
    const onChange = vi.fn();
    const tree = {
      id: "root",
      combinator: "AND" as const,
      rules: [
        { id: "child", combinator: "OR" as const, rules: [] },
      ],
    };
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={tree}
        onValueChange={onChange}
      />
    );
    // There are two "+ Rule" buttons now (root + nested). Click the second (nested).
    const buttons = screen.getAllByRole("button", { name: "+ Rule" });
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[1]!);
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls[0]![0];
    expect(next.rules).toHaveLength(1);
    // Root still has one child group
    expect(next.rules[0].id).toBe("child");
    // Nested group got the new rule
    expect(next.rules[0].rules).toHaveLength(1);
  });

  it("nested group's + Group button nests another group into the child", async () => {
    const onChange = vi.fn();
    const tree = {
      id: "root",
      combinator: "AND" as const,
      rules: [
        { id: "child", combinator: "OR" as const, rules: [] },
      ],
    };
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={tree}
        onValueChange={onChange}
      />
    );
    const buttons = screen.getAllByRole("button", { name: "+ Group" });
    expect(buttons).toHaveLength(2);
    await userEvent.click(buttons[1]!);
    const next = onChange.mock.calls[0]![0];
    expect(next.rules[0].rules).toHaveLength(1);
    // And the nested new rule is itself a group (has a combinator + rules)
    expect(next.rules[0].rules[0].combinator).toBeDefined();
  });

  it("nested group's combinator change patches only that group", async () => {
    const onChange = vi.fn();
    const tree = {
      id: "root",
      combinator: "AND" as const,
      rules: [
        { id: "child", combinator: "AND" as const, rules: [] },
      ],
    };
    renderWithTheme(
      <QueryBuilder
        fields={[{ id: "name", label: "Name" }]}
        value={tree}
        onValueChange={onChange}
      />
    );
    const combinators = screen.getAllByLabelText("Combinator");
    expect(combinators).toHaveLength(2);
    await userEvent.selectOptions(combinators[1] as HTMLSelectElement, "OR");
    const next = onChange.mock.calls.at(-1)![0];
    // Root unchanged, nested flipped
    expect(next.combinator).toBe("AND");
    expect(next.rules[0].combinator).toBe("OR");
  });
});

describe("ShortcutEditor", () => {
  it("captures a chord on key press", async () => {
    const onChange = vi.fn();
    renderWithTheme(<ShortcutEditor onValueChange={onChange} />);
    const trigger = screen.getByRole("button", { name: "Edit shortcut" });
    await userEvent.click(trigger);
    trigger.focus();
    await userEvent.keyboard("{Meta>}{Shift>}k{/Shift}{/Meta}");
    expect(onChange).toHaveBeenCalled();
    const chord = onChange.mock.calls[0]![0];
    expect(chord).toMatch(/mod.*shift.*k/);
  });
  it("clears the chord", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ShortcutEditor value="mod+k" onValueChange={onChange} />
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Clear shortcut" })
    );
    expect(onChange).toHaveBeenCalledWith("");
  });
  it("marks conflicts", () => {
    renderWithTheme(
      <ShortcutEditor value="mod+k" conflicts={["mod+k"]} />
    );
    expect(screen.getByText("Already assigned")).toBeInTheDocument();
  });
});

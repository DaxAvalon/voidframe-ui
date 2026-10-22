// The 1.4.0 selection / pressed grammar reachable as props.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Table } from "../Data";
import { Activity } from "../Activity";
import { DataList } from "../DataList";
import { Timeline } from "../DataExtended";
import { Button } from "../Button";

const rows = [
  { id: "a", name: "Alpha" },
  { id: "b", name: "Beta" },
  { id: "c", name: "Gamma" },
];
const columns = [{ key: "name", header: "Name" }];

describe("Table selection", () => {
  it("selectedRowKey marks one row with class, data and aria-selected", () => {
    renderWithTheme(
      <Table columns={columns} data={rows} rowKey={(r) => r.id} selectedRowKey="b" rowAttributes={(r) => ({ "data-testid": `r-${r.id}` })} />
    );
    const b = screen.getByTestId("r-b");
    expect(b).toHaveClass("vf-table__row--selected");
    expect(b).toHaveAttribute("data-selected", "true");
    expect(b).toHaveAttribute("aria-selected", "true");
    expect(screen.getByTestId("r-a")).toHaveAttribute("aria-selected", "false");
    expect(screen.getByTestId("r-a")).not.toHaveClass("vf-table__row--selected");
  });

  it("accepts several keys, a predicate, and omits aria-selected when selection is not in use", () => {
    const { rerender } = renderWithTheme(
      <Table columns={columns} data={rows} rowKey={(r) => r.id} selectedRowKey={["a", "c"]} rowAttributes={(r) => ({ "data-testid": `r-${r.id}` })} />
    );
    expect(screen.getByTestId("r-a")).toHaveClass("vf-table__row--selected");
    expect(screen.getByTestId("r-c")).toHaveClass("vf-table__row--selected");
    expect(screen.getByTestId("r-b")).not.toHaveClass("vf-table__row--selected");
    rerender(
      <Table columns={columns} data={rows} rowKey={(r) => r.id} isRowSelected={(r) => r.name.startsWith("G")} rowAttributes={(r) => ({ "data-testid": `r-${r.id}` })} />
    );
    expect(screen.getByTestId("r-c")).toHaveAttribute("aria-selected", "true");
    rerender(<Table columns={columns} data={rows} rowKey={(r) => r.id} rowAttributes={(r) => ({ "data-testid": `r-${r.id}` })} />);
    expect(screen.getByTestId("r-a")).not.toHaveAttribute("aria-selected");
  });

  it("works in as='table' mode on the tr", () => {
    renderWithTheme(
      <Table as="table" columns={columns} data={rows} rowKey={(r) => r.id} selectedRowKey="a" rowAttributes={(r) => ({ "data-testid": `r-${r.id}` })} />
    );
    const a = screen.getByTestId("r-a");
    expect(a.tagName).toBe("TR");
    expect(a).toHaveClass("vf-table__row--selected");
  });
});

describe("selectable items", () => {
  it("Activity.Item: selected paints, onSelect makes it a tab stop operable by click and keyboard", async () => {
    const onSelect = vi.fn();
    const onClick = vi.fn();
    renderWithTheme(
      <Activity>
        <Activity.Item actor="Ann" action="opened" selected data-testid="one" />
        <Activity.Item actor="Bob" action="closed" onSelect={onSelect} onClick={onClick} data-testid="two" />
        <Activity.Item actor="Cy" action="noted" data-testid="three" />
      </Activity>
    );
    const one = screen.getByTestId("one");
    expect(one).toHaveClass("vf-activity__item--selected");
    expect(one).toHaveAttribute("data-selected", "true");
    expect(one).toHaveAttribute("aria-current", "true");
    expect(one).not.toHaveAttribute("tabindex");
    const two = screen.getByTestId("two");
    expect(two).toHaveClass("vf-activity__item--selectable");
    expect(two).toHaveAttribute("tabindex", "0");
    await userEvent.click(two);
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledTimes(1);
    two.focus();
    await userEvent.keyboard("{Enter}");
    await userEvent.keyboard(" ");
    expect(onSelect).toHaveBeenCalledTimes(3);
    expect(screen.getByTestId("three")).not.toHaveAttribute("tabindex");
  });

  it("a consumer onClick that prevents default suppresses selection", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <DataList>
        <DataList.Item label="k" value="v" onSelect={onSelect} onClick={(e) => e.preventDefault()} data-testid="row" />
      </DataList>
    );
    await userEvent.click(screen.getByTestId("row"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("DataList.Item and Timeline.Item carry the same classes", () => {
    renderWithTheme(
      <>
        <DataList>
          <DataList.Item label="k" value="v" selected onSelect={() => {}} data-testid="dl" />
        </DataList>
        <Timeline>
          <Timeline.Item title="t" selected onSelect={() => {}} data-testid="tl" />
        </Timeline>
      </>
    );
    expect(screen.getByTestId("dl")).toHaveClass("vf-datalist__row--selected", "vf-datalist__row--selectable");
    expect(screen.getByTestId("tl")).toHaveClass("vf-timeline__event--selected", "vf-timeline__event--selectable");
    expect(screen.getByTestId("tl")).toHaveAttribute("aria-current", "true");
  });
});

describe("Button pressed", () => {
  it("sets aria-pressed both ways and the pressed class only when true", () => {
    const { rerender } = renderWithTheme(<Button pressed>Mute</Button>);
    const b = screen.getByRole("button", { name: "Mute" });
    expect(b).toHaveAttribute("aria-pressed", "true");
    expect(b).toHaveAttribute("data-pressed", "true");
    expect(b).toHaveClass("vf-button--pressed");
    rerender(<Button pressed={false}>Mute</Button>);
    expect(b).toHaveAttribute("aria-pressed", "false");
    expect(b).not.toHaveClass("vf-button--pressed");
    rerender(<Button>Mute</Button>);
    expect(b).not.toHaveAttribute("aria-pressed");
  });
});

describe("one shared selection rule", () => {
  it("the stylesheet paints table, activity, datalist and timeline selection from one rule", () => {
    const css = readFileSync(resolve(__dirname, "../../css/components/data-display.css"), "utf8");
    expect(css).toMatch(/\.vf-table__row--selected > \.vf-table__cell,\n\.vf-activity__item--selected,\n\.vf-datalist__row--selected,\n\.vf-timeline__event--selected \{\n  background: var\(--vf-bg-3\);\n  color: var\(--vf-text-0\);/);
    expect(css).toContain("box-shadow: inset 2px 0 0 var(--vf-accent);");
    const button = readFileSync(resolve(__dirname, "../../css/components/button.css"), "utf8");
    expect(button).toMatch(/\.vf-button--pressed,\n\.vf-button\[aria-pressed="true"\] \{\n  background: var\(--vf-bg-5\);\n  border-color: var\(--vf-border-3\);\n  color: var\(--vf-text-0\);/);
  });
});

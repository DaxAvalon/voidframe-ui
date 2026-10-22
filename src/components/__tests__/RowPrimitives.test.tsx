// Text/Code truncate, ListRow, SettingsRow, fullWidth fields.
import { describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Text } from "../Text";
import { Code } from "../DataExtended";
import { ListRow } from "../ListRow";
import { SettingsRow } from "../SettingsRow";
import { Input, Select, Textarea } from "../Form";
import { Switch } from "../FormAdvanced";

const css = (rel: string) => readFileSync(resolve(__dirname, "../../css/components", rel), "utf8");

describe("Text and Code truncate", () => {
  it("adds the class and a title from plain children; explicit title wins; rich children get none", () => {
    const { container } = renderWithTheme(
      <>
        <Text truncate>A long name</Text>
        <Text truncate title="Custom">A long name</Text>
        <Text truncate><b>rich</b></Text>
        <Code inline truncate>/very/long/path</Code>
      </>
    );
    const [a, b, c] = Array.from(container.querySelectorAll(".vf-text"));
    expect(a).toHaveClass("vf-text--truncate");
    expect(a).toHaveAttribute("title", "A long name");
    expect(b).toHaveAttribute("title", "Custom");
    expect(c).not.toHaveAttribute("title");
    const code = container.querySelector("code")!;
    expect(code).toHaveClass("vf-code--truncate");
    expect(code).toHaveAttribute("title", "/very/long/path");
    const t = css("text.css");
    expect(t).toMatch(/\.vf-text--truncate \{[^}]*overflow: hidden;[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
    expect(css("data-extended.css")).toMatch(/\.vf-code--truncate \{[^}]*text-overflow: ellipsis;/);
  });
});

describe("ListRow", () => {
  it("identity truncates with a title, trailing never shrinks, min height is a variable", () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <ul>
        <ListRow as="li" leading={<span>★</span>} trailing={<button>Edit</button>} description="desc" minHeight="lg" onSelect={onSelect} data-testid="row">
          Repository name that is long
        </ListRow>
        <ListRow as="li" minHeight={56} title={false} selected data-testid="row2"><b>rich</b></ListRow>
      </ul>
    );
    const row = screen.getByTestId("row");
    expect(row.tagName).toBe("LI");
    expect(row).toHaveClass("vf-list-row", "vf-list-row--selectable");
    expect(row.style.getPropertyValue("--vf-list-row-min-height")).toBe("48px");
    expect(row.querySelector(".vf-list-row__text")).toHaveAttribute("title", "Repository name that is long");
    expect(row.querySelector(".vf-list-row__description")).toHaveTextContent("desc");
    expect(row.querySelector(".vf-list-row__trailing button")).toHaveTextContent("Edit");
    const row2 = screen.getByTestId("row2");
    expect(row2.style.getPropertyValue("--vf-list-row-min-height")).toBe("56px");
    expect(row2.querySelector(".vf-list-row__text")).not.toHaveAttribute("title");
    expect(row2).toHaveClass("vf-list-row--selected");
    expect(row2).toHaveAttribute("aria-current", "true");
    const d = css("data-display.css");
    expect(d).toMatch(/\.vf-list-row__identity \{[^}]*flex: 1 1 0;[^}]*min-width: 0;/);
    expect(d).toMatch(/\.vf-list-row__trailing \{[^}]*flex: none;[^}]*white-space: nowrap;/);
    expect(d).toMatch(/\.vf-list-row__text,\n\.vf-list-row__description \{[^}]*text-overflow: ellipsis;[^}]*white-space: nowrap;/);
  });

  it("onSelect works by click and keyboard; a trailing control click does not select", async () => {
    const onSelect = vi.fn();
    const onEdit = vi.fn((e: React.MouseEvent) => e.stopPropagation());
    renderWithTheme(
      <ListRow onSelect={onSelect} trailing={<button onClick={onEdit}>Edit</button>} data-testid="row">x</ListRow>
    );
    await userEvent.click(screen.getByRole("button", { name: "Edit" }));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
    await userEvent.click(screen.getByTestId("row"));
    expect(onSelect).toHaveBeenCalledTimes(1);
    screen.getByTestId("row").focus();
    await userEvent.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(2);
  });
});

describe("SettingsRow", () => {
  it("labels the control by the row name and description, stacks below md by default", () => {
    renderWithTheme(
      <SettingsRow label="Auto-save" description="Write every change to disk." status={<span>Saved</span>}>
        <Switch checked onCheckedChange={() => {}} />
      </SettingsRow>
    );
    const row = document.querySelector(".vf-settings-row")!;
    expect(row).toHaveClass("vf-settings-row--stack-md");
    const control = screen.getByRole("switch");
    expect(control).toHaveAccessibleName("Auto-save");
    expect(control).toHaveAccessibleDescription("Write every change to disk.");
    expect(row.querySelector(".vf-settings-row__status")).toHaveTextContent("Saved");
    const f = css("form-advanced.css");
    expect(f).toMatch(/@media \(max-width: 767\.98px\) \{\n  \.vf-settings-row--stack-md \{ grid-template-columns: minmax\(0, 1fr\); \}/);
  });

  it("does not relabel a control that has its own label; controlWidth and stackBelow='never'", () => {
    renderWithTheme(
      <SettingsRow label="Name" stackBelow="never" controlWidth="320px">
        <Input label="Display name" value="" onValueChange={() => {}} />
      </SettingsRow>
    );
    const row = document.querySelector(".vf-settings-row") as HTMLElement;
    expect(row.className).not.toMatch(/stack-/);
    expect(row.style.getPropertyValue("--vf-settings-row-control")).toBe("320px");
    expect(screen.getByRole("textbox")).toHaveAccessibleName("Display name");
  });
});

describe("fullWidth fields", () => {
  it("Input, Textarea and Select add the full-width wrapper class", () => {
    renderWithTheme(
      <>
        <Input aria-label="a" fullWidth />
        <Textarea aria-label="b" fullWidth />
        <Select aria-label="c" fullWidth options={[{ value: "1", label: "One" }]} />
        <Input aria-label="d" />
      </>
    );
    const fields = document.querySelectorAll(".vf-field");
    expect(fields[0]).toHaveClass("vf-field--full");
    expect(fields[1]).toHaveClass("vf-field--full");
    expect(fields[2]).toHaveClass("vf-field--full");
    expect(fields[3]).not.toHaveClass("vf-field--full");
    expect(css("form.css")).toMatch(/\.vf-field--full \{\n  width: 100%;\n  flex: 1 1 auto;\n  min-width: 0;/);
  });
});

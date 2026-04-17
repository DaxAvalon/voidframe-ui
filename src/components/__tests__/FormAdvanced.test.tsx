import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import {
  CheckboxGroup,
  PasswordInput,
  PinInput,
  SegmentedControl,
  Switch,
  TagInput,
} from "../FormAdvanced";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Switch", () => {
  it("aliases Toggle — same role + checked state", () => {
    renderWithTheme(<Switch aria-label="X" defaultChecked={false} />);
    expect(screen.getByRole("switch")).toHaveAttribute("aria-checked", "false");
  });
  it("forwards to Toggle controllable API", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Switch aria-label="X" defaultChecked={false} onChange={onChange} />
    );
    screen.getByRole("switch").click();
    expect(onChange).toHaveBeenCalledWith(true);
  });
});

describe("CheckboxGroup", () => {
  const opts = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
    { value: "c", label: "C" },
  ];

  it("renders role=group + aria-labelledby when label given", () => {
    renderWithTheme(
      <CheckboxGroup label="CATS" options={opts} defaultValue={[]} />
    );
    const group = screen.getByRole("group");
    const labelId = group.getAttribute("aria-labelledby");
    expect(labelId).toBeTruthy();
    expect(document.getElementById(labelId!)).toHaveTextContent("CATS");
  });

  it("uncontrolled: adds + removes from defaultValue", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <CheckboxGroup options={opts} defaultValue={["a"]} onChange={onChange} />
    );
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
    await userEvent.click(boxes[1]!);
    expect(onChange).toHaveBeenLastCalledWith(["a", "b"]);
    await userEvent.click(boxes[0]!);
    expect(onChange).toHaveBeenLastCalledWith(["b"]);
  });

  it("controlled: reflects parent value", async () => {
    function Ctl() {
      const [v, setV] = useState<string[]>([]);
      return (
        <>
          <CheckboxGroup options={opts} value={v} onChange={setV} />
          <button onClick={() => setV(["a", "c"])} data-testid="set">
            set
          </button>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    await userEvent.click(screen.getByTestId("set"));
    const boxes = screen.getAllByRole("checkbox");
    expect(boxes[0]).toHaveAttribute("aria-checked", "true");
    expect(boxes[1]).toHaveAttribute("aria-checked", "false");
    expect(boxes[2]).toHaveAttribute("aria-checked", "true");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <CheckboxGroup label="CATS" options={opts} defaultValue={[]} />
    );
    await expectNoA11yViolations(container);
  });
});

describe("SegmentedControl", () => {
  const opts = [
    { value: "grid", label: "Grid" },
    { value: "list", label: "List" },
    { value: "card", label: "Card" },
  ];

  it("renders role=radiogroup with role=radio items", () => {
    renderWithTheme(<SegmentedControl options={opts} defaultValue="list" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const items = screen.getAllByRole("radio");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-checked", "true");
    expect(items[0]).toHaveAttribute("aria-checked", "false");
  });

  it("click selects option", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <SegmentedControl options={opts} defaultValue="grid" onChange={onChange} />
    );
    await userEvent.click(screen.getByRole("radio", { name: "Card" }));
    expect(onChange).toHaveBeenCalledWith("card");
  });

  it("ArrowRight wraps past end", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <SegmentedControl options={opts} defaultValue="card" onChange={onChange} />
    );
    const group = screen.getByRole("radiogroup");
    group.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("grid");
  });

  it("Home jumps to first enabled", async () => {
    const mixed = [
      { value: "a", label: "A", disabled: true },
      { value: "b", label: "B" },
      { value: "c", label: "C" },
    ];
    const onChange = vi.fn();
    renderWithTheme(
      <SegmentedControl options={mixed} defaultValue="c" onChange={onChange} />
    );
    const group = screen.getByRole("radiogroup");
    group.focus();
    await userEvent.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith("b");
  });

  it("skips disabled on arrow nav", async () => {
    const mixed = [
      { value: "a", label: "A" },
      { value: "b", label: "B", disabled: true },
      { value: "c", label: "C" },
    ];
    const onChange = vi.fn();
    renderWithTheme(
      <SegmentedControl options={mixed} defaultValue="a" onChange={onChange} />
    );
    const group = screen.getByRole("radiogroup");
    group.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("c");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <SegmentedControl options={opts} defaultValue="grid" />
    );
    await expectNoA11yViolations(container);
  });
});

describe("PasswordInput", () => {
  it("renders type=password by default", () => {
    renderWithTheme(<PasswordInput label="PW" defaultVisible={false} />);
    const input = screen.getByLabelText("PW") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("toggles to type=text when visibility button clicked", async () => {
    renderWithTheme(<PasswordInput label="PW" />);
    const input = screen.getByLabelText("PW") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: /show password/i });
    expect(input.type).toBe("password");
    await userEvent.click(toggle);
    expect(input.type).toBe("text");
    expect(
      screen.getByRole("button", { name: /hide password/i })
    ).toBeInTheDocument();
  });

  it("respects defaultVisible", () => {
    renderWithTheme(<PasswordInput label="PW" defaultVisible />);
    expect((screen.getByLabelText("PW") as HTMLInputElement).type).toBe("text");
  });

  it("hides toggle when visibilityToggle=false", () => {
    renderWithTheme(<PasswordInput label="PW" visibilityToggle={false} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fires onChange and onValueChange when typing", async () => {
    const onChange = vi.fn();
    const onValueChange = vi.fn();
    renderWithTheme(
      <PasswordInput label="PW" onChange={onChange} onValueChange={onValueChange} />
    );
    const input = screen.getByLabelText("PW");
    await userEvent.type(input, "abc");
    expect(onChange).toHaveBeenCalled();
    expect(onValueChange).toHaveBeenLastCalledWith("abc");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<PasswordInput label="Password" />);
    await expectNoA11yViolations(container);
  });
});

describe("PinInput", () => {
  it("renders `length` slots", () => {
    renderWithTheme(<PinInput length={4} label="Code" />);
    expect(screen.getAllByRole("textbox")).toHaveLength(4);
  });

  it("typing advances focus to the next slot", async () => {
    renderWithTheme(<PinInput length={4} label="Code" />);
    const slots = screen.getAllByRole("textbox");
    slots[0]!.focus();
    await userEvent.keyboard("1");
    expect(document.activeElement).toBe(slots[1]);
  });

  it("only accepts digits when type=numeric", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <PinInput length={3} label="Code" type="numeric" onChange={onChange} />
    );
    const slots = screen.getAllByRole("textbox");
    slots[0]!.focus();
    await userEvent.keyboard("a");
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.keyboard("5");
    expect(onChange).toHaveBeenCalledWith("5");
  });

  it("Backspace on empty slot moves focus back", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <PinInput length={3} label="Code" defaultValue="12" onChange={onChange} />
    );
    const slots = screen.getAllByRole("textbox");
    slots[2]!.focus();
    await userEvent.keyboard("{Backspace}");
    expect(document.activeElement).toBe(slots[1]);
    expect(onChange).toHaveBeenLastCalledWith("1");
  });

  it("ArrowLeft/Right navigate between slots", async () => {
    renderWithTheme(<PinInput length={4} label="Code" />);
    const slots = screen.getAllByRole("textbox");
    slots[2]!.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(slots[1]);
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    expect(document.activeElement).toBe(slots[3]);
  });

  it("fires onComplete exactly once when fully filled", async () => {
    const onComplete = vi.fn();
    renderWithTheme(
      <PinInput length={3} label="C" onComplete={onComplete} type="numeric" />
    );
    const slots = screen.getAllByRole("textbox");
    slots[0]!.focus();
    await userEvent.keyboard("123");
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(onComplete).toHaveBeenCalledWith("123");
  });

  it("paste splits across slots", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <PinInput length={6} label="C" type="numeric" onChange={onChange} />
    );
    const slots = screen.getAllByRole("textbox");
    slots[0]!.focus();
    await userEvent.paste("123456");
    expect(onChange).toHaveBeenLastCalledWith("123456");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<PinInput length={4} label="Code" />);
    await expectNoA11yViolations(container);
  });
});

describe("TagInput", () => {
  it("commits on Enter", async () => {
    const onChange = vi.fn();
    renderWithTheme(<TagInput label="TAGS" onChange={onChange} />);
    const field = screen.getByRole("textbox");
    await userEvent.type(field, "react{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["react"]);
  });

  it("commits on configured delimiter (comma)", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput
        label="TAGS"
        onChange={onChange}
        delimiters={["Enter", ","]}
      />
    );
    const field = screen.getByRole("textbox");
    await userEvent.type(field, "react,");
    expect(onChange).toHaveBeenLastCalledWith(["react"]);
  });

  it("dedupes case-insensitively by default", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput label="T" defaultValue={["React"]} onChange={onChange} />
    );
    const field = screen.getByRole("textbox");
    await userEvent.type(field, "react{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("removes last tag when Backspace on empty draft", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput label="T" defaultValue={["a", "b"]} onChange={onChange} />
    );
    const field = screen.getByRole("textbox");
    field.focus();
    await userEvent.keyboard("{Backspace}");
    expect(onChange).toHaveBeenLastCalledWith(["a"]);
  });

  it("explicit remove button removes the chip", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput label="T" defaultValue={["a", "b", "c"]} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Remove b" }));
    expect(onChange).toHaveBeenLastCalledWith(["a", "c"]);
  });

  it("respects maxTags", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput
        label="T"
        defaultValue={["a", "b"]}
        maxTags={2}
        onChange={onChange}
      />
    );
    const field = screen.getByRole("textbox");
    await userEvent.type(field, "c{Enter}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("validate rejects invalid entries (draft stays so user can fix)", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput
        label="T"
        onChange={onChange}
        validate={(t) => t.includes("@") || "must be an email"}
      />
    );
    const field = screen.getByRole("textbox") as HTMLInputElement;
    await userEvent.type(field, "not-email{Enter}");
    expect(onChange).not.toHaveBeenCalled();
    // On rejection the draft is preserved so the user can edit rather than retype.
    expect(field.value).toBe("not-email");
    await userEvent.clear(field);
    await userEvent.type(field, "a@b.com{Enter}");
    expect(onChange).toHaveBeenLastCalledWith(["a@b.com"]);
  });

  it("multi-item paste splits on comma/newline and adds all", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput label="T" onChange={onChange} />
    );
    const field = screen.getByRole("textbox");
    // Simulate pasting comma-separated text
    const clipboardData = {
      getData: () => "one, two, three",
    };
    field.focus();
    // Use fireEvent for paste
    const { fireEvent: fe } = await import("@testing-library/react");
    fe.paste(field, { clipboardData } as any);
    expect(onChange).toHaveBeenCalledWith(["one", "two", "three"]);
  });

  it("paste respects maxTags limit", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput label="T" maxTags={2} onChange={onChange} />
    );
    const field = screen.getByRole("textbox");
    const clipboardData = {
      getData: () => "a, b, c, d",
    };
    field.focus();
    const { fireEvent: fe } = await import("@testing-library/react");
    fe.paste(field, { clipboardData } as any);
    const last = onChange.mock.calls.at(-1)![0];
    expect(last.length).toBeLessThanOrEqual(2);
  });

  it("paste with validate skips invalid entries", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TagInput
        label="T"
        onChange={onChange}
        validate={(t) => t.length > 1}
      />
    );
    const field = screen.getByRole("textbox");
    const clipboardData = {
      getData: () => "ok, x, good",
    };
    field.focus();
    const { fireEvent: fe } = await import("@testing-library/react");
    fe.paste(field, { clipboardData } as any);
    expect(onChange).toHaveBeenCalledWith(["ok", "good"]);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <TagInput label="Tags" defaultValue={["alpha", "beta"]} />
    );
    await expectNoA11yViolations(container);
  });
});

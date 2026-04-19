// Phase 2 invariant: stateful components support controlled and uncontrolled.
// Each controllable component is exercised both ways, plus the change callback.

import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { Checkbox } from "../FormExtended";
import { RadioGroup } from "../FormExtended";
import { Toggle } from "../Form";
import { Collapsible } from "../Interactive";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Toggle — controllable", () => {
  it("uncontrolled: starts at defaultChecked and toggles internally", async () => {
    const onChange = vi.fn();
    renderWithTheme(<Toggle defaultChecked={false} onValueChange={onChange} />);
    const sw = screen.getByRole("switch");
    expect(sw).toHaveAttribute("aria-checked", "false");
    await userEvent.click(sw);
    expect(sw).toHaveAttribute("aria-checked", "true");
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it("controlled: ignores internal state, reflects `checked` prop", async () => {
    function Ctl() {
      const [v, setV] = useState(false);
      return (
        <>
          <Toggle checked={v} onValueChange={setV} />
          <span data-testid="state">{String(v)}</span>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    const sw = screen.getByRole("switch");
    expect(screen.getByTestId("state")).toHaveTextContent("false");
    await userEvent.click(sw);
    expect(screen.getByTestId("state")).toHaveTextContent("true");
    expect(sw).toHaveAttribute("aria-checked", "true");
  });
});

describe("Checkbox — controllable", () => {
  it("uncontrolled with defaultChecked", async () => {
    renderWithTheme(<Checkbox defaultChecked />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("aria-checked", "true");
    await userEvent.click(cb);
    expect(cb).toHaveAttribute("aria-checked", "false");
  });

  it("controlled honors parent state", async () => {
    function Ctl() {
      const [v, setV] = useState(true);
      return <Checkbox checked={v} onValueChange={setV} />;
    }
    renderWithTheme(<Ctl />);
    const cb = screen.getByRole("checkbox");
    expect(cb).toHaveAttribute("aria-checked", "true");
    await userEvent.click(cb);
    expect(cb).toHaveAttribute("aria-checked", "false");
  });
});

describe("RadioGroup — controllable", () => {
  const opts = [
    { value: "a", label: "A" },
    { value: "b", label: "B" },
  ];

  it("uncontrolled defaults to defaultValue", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RadioGroup options={opts} defaultValue="a" onValueChange={onChange} />
    );
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    await userEvent.click(radios[1]!);
    expect(onChange).toHaveBeenCalledWith("b");
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
  });

  it("controlled reflects parent value", async () => {
    function Ctl() {
      const [v, setV] = useState("a");
      return (
        <>
          <RadioGroup options={opts} value={v} onValueChange={setV} />
          <button onClick={() => setV("b")} data-testid="set-b">
            set b
          </button>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toHaveAttribute("aria-checked", "true");
    await userEvent.click(screen.getByTestId("set-b"));
    expect(radios[1]).toHaveAttribute("aria-checked", "true");
  });
});

describe("Collapsible — controllable", () => {
  it("uncontrolled starts closed, opens on click", async () => {
    renderWithTheme(<Collapsible title="X">body</Collapsible>);
    expect(screen.queryByText("body")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("controlled `open` overrides internal state", async () => {
    function Ctl() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Collapsible title="X" open={open} onOpenChange={setOpen}>
            body
          </Collapsible>
          <button onClick={() => setOpen(true)} data-testid="open-it">
            open
          </button>
        </>
      );
    }
    renderWithTheme(<Ctl />);
    expect(screen.queryByText("body")).not.toBeInTheDocument();
    await userEvent.click(screen.getByTestId("open-it"));
    expect(screen.getByText("body")).toBeInTheDocument();
  });
});

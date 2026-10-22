import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { SegmentedControl } from "../FormAdvanced";
import { Kbd, Tabs } from "../Interactive";
import { ToggleGroup } from "../ToggleGroup";
import { Wizard } from "../Wizard";
import { DatePicker } from "../DatePicker";
import { Slider } from "../FormExtended";
import { Countdown, countdownTone } from "../TimeDisplays";
import { isoMonth, parseISODate, toISODate } from "../../utils/date";

describe("SegmentedControl wrap and description", () => {
  it("adds wrap/full classes and describes options", () => {
    renderWithTheme(
      <SegmentedControl
        wrap
        fullWidth
        aria-label="Quality"
        options={[
          { value: "hi", label: "High", description: "48 kHz" },
          { value: "lo", label: "Low" },
        ]}
      />
    );
    const group = screen.getByRole("radiogroup", { name: "Quality" });
    expect(group).toHaveClass("vf-segmented--wrap", "vf-segmented--full");
    const hi = screen.getByRole("radio", { name: "High" });
    expect(hi).toHaveClass("vf-segmented__item--described");
    expect(screen.getByText("48 kHz").id).toBe(hi.getAttribute("aria-describedby"));
    expect(screen.getByRole("radio", { name: "Low" })).not.toHaveAttribute("aria-describedby");
  });
});

describe("Tabs variant, wrap and tone", () => {
  it("applies the plain variant, list wrap and trigger tones", () => {
    const { container } = renderWithTheme(
      <Tabs defaultValue="a" variant="plain">
        <Tabs.List wrap aria-label="Steps">
          <Tabs.Trigger value="a" tone="success">Done</Tabs.Trigger>
          <Tabs.Trigger value="b" tone="danger">Failing</Tabs.Trigger>
          <Tabs.Trigger value="c">Plain</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Panel value="a">A</Tabs.Panel>
      </Tabs>
    );
    expect(container.querySelector(".vf-tabs")).toHaveClass("vf-tabs--plain");
    expect(screen.getByRole("tablist")).toHaveClass("vf-tabs__list--wrap");
    expect(screen.getByRole("tab", { name: "Done" })).toHaveAttribute("data-tone", "success");
    expect(screen.getByRole("tab", { name: "Failing" })).toHaveAttribute("data-tone", "danger");
    expect(screen.getByRole("tab", { name: "Plain" })).not.toHaveAttribute("data-tone");
  });
});

describe("ToggleGroup max", () => {
  it("ignores activation at the cap and allows deselecting", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ToggleGroup
        max={2}
        value={["a", "b"]}
        onValueChange={onChange}
        items={[
          { key: "a", label: "A" },
          { key: "b", label: "B" },
          { key: "c", label: "C" },
        ]}
      />
    );
    fireEvent.click(screen.getByRole("button", { name: "C" }));
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onChange).toHaveBeenCalledWith(["b"]);
  });
});

describe("Wizard skip and labels", () => {
  it("names steps by label, localises buttons, and skips optional steps", () => {
    const onSkip = vi.fn();
    const onComplete = vi.fn();
    renderWithTheme(
      <Wizard onSkip={onSkip} onComplete={onComplete} canAdvance={(id) => id !== "b"}>
        <Wizard.Step id="a" label="Account">A</Wizard.Step>
        <Wizard.Step id="b" label="Avatar" optional>B</Wizard.Step>
        <Wizard.Step id="c" label="Review">C</Wizard.Step>
        <Wizard.Footer>
          <Wizard.StepIndicator />
          <Wizard.Previous />
          <Wizard.Skip />
          <Wizard.Next />
        </Wizard.Footer>
      </Wizard>
    );
    expect(screen.getByRole("group", { name: "Account" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Step 1 of 3");
    expect(screen.queryByRole("button", { name: "Skip" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByRole("group", { name: "Avatar" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(onSkip).toHaveBeenCalledWith("b");
    expect(screen.getByRole("group", { name: "Review" })).toBeInTheDocument();
    expect(screen.getByText("Avatar")).toHaveAttribute("data-skipped");
    expect(screen.getByRole("button", { name: "Finish" })).toBeInTheDocument();
  });
});

describe("DatePicker string mode and ISO helpers", () => {
  it("round-trips local yyyy-MM-dd without UTC drift", () => {
    expect(toISODate(new Date(2026, 2, 5, 23, 30))).toBe("2026-03-05");
    expect(toISODate(null)).toBeNull();
    expect(isoMonth(new Date(2026, 11, 31))).toBe("2026-12");
    expect(parseISODate("2026-03-05")).toEqual(new Date(2026, 2, 5));
    expect(parseISODate("2026-03")).toEqual(new Date(2026, 2, 1));
    expect(parseISODate("2026-02-30")).toBeNull();
    expect(parseISODate("nope")).toBeNull();
  });

  it("binds valueAsString and emits onValueAsStringChange", async () => {
    const onIso = vi.fn();
    renderWithTheme(<DatePicker label="Due" valueAsString="2026-03-05" onValueAsStringChange={onIso} />);
    const input = screen.getByLabelText("Due") as HTMLInputElement;
    expect(input.value).toBe("2026-03-05");
    await userEvent.clear(input);
    await userEvent.type(input, "2026-03-09{Enter}");
    expect(onIso).toHaveBeenCalledWith("2026-03-09");
    await userEvent.clear(input);
    await userEvent.keyboard("{Enter}");
    expect(onIso).toHaveBeenCalledWith(null);
  });
});

describe("Slider valueText, Kbd size, Countdown", () => {
  it("sets aria-valuetext and shows the text readout", () => {
    renderWithTheme(<Slider label="Gain" value={-6} min={-60} max={0} showValue valueText={(v) => `${v} dB`} onValueChange={() => undefined} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "-6 dB");
    expect(screen.getByText("-6 dB")).toBeInTheDocument();
  });

  it("Kbd size classes", () => {
    renderWithTheme(<Kbd size="lg">K</Kbd>);
    expect(screen.getByText("K")).toHaveClass("vf-kbd--lg");
    renderWithTheme(<Kbd>M</Kbd>);
    expect(screen.getByText("M")).not.toHaveClass("vf-kbd--md");
  });

  it("Countdown follows remainingSeconds with threshold tones and hidden", () => {
    expect(countdownTone(100, { warn: 60, danger: 10 })).toBe("neutral");
    expect(countdownTone(30, { warn: 60, danger: 10 })).toBe("warning");
    expect(countdownTone(5, { warn: 60, danger: 10 })).toBe("danger");
    const { container, rerender } = renderWithTheme(
      <Countdown remainingSeconds={30} thresholds={{ warn: 60, danger: 10 }} data-testid="c" />
    );
    const el = screen.getByTestId("c");
    expect(el).toHaveAttribute("data-remaining-ms", "30000");
    expect(el).toHaveAttribute("data-tone", "warning");
    expect(el).toHaveTextContent("0:30");
    rerender(<Countdown remainingSeconds={5} thresholds={{ warn: 60, danger: 10 }} hidden data-testid="c" />);
    expect(screen.getByTestId("c")).toHaveAttribute("hidden");
    expect(screen.getByTestId("c")).toHaveClass("vf-countdown--danger");
    expect(container.querySelectorAll("span").length).toBeGreaterThan(0);
  });
});

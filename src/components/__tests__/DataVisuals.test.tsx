import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { BarList, DayDots, ScaleInput, StatusLine, StreakBadge, TagGroup, TargetProgress, targetState } from "../DataVisuals";

describe("BarList", () => {
  it("scales bars to the largest value, sorts and applies tones", () => {
    const onClick = vi.fn();
    const { container } = renderWithTheme(
      <BarList
        sort="desc"
        items={[
          { label: "Alpha", value: 20, tone: "success" },
          { label: "Beta", value: 50, meta: "min" },
          { label: "Gamma", value: 10, onClick },
        ]}
      />
    );
    const rows = container.querySelectorAll(".vf-bar-list__row");
    expect(rows[0]!.textContent).toContain("Beta");
    expect((rows[0]!.querySelector(".vf-bar-list__bar") as HTMLElement).style.width).toBe("100%");
    expect((rows[2]!.querySelector(".vf-bar-list__bar") as HTMLElement).style.width).toBe("20%");
    expect(rows[1]).toHaveAttribute("data-tone", "success");
    fireEvent.click(screen.getByRole("button", { name: "Gamma" }));
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText("min")).toBeInTheDocument();
  });
});

describe("TargetProgress", () => {
  it("derives met / near / missed and renders the marker", () => {
    expect(targetState(10, 10)).toBe("success");
    expect(targetState(9.5, 10)).toBe("warning");
    expect(targetState(5, 10)).toBe("danger");
    expect(targetState(5, 10, "at-most")).toBe("success");
    expect(targetState(10.5, 10, "at-most")).toBe("warning");
    const { container } = renderWithTheme(<TargetProgress label="Noise floor" value={-55} target={-60} direction="at-most" unit="dB" showDelta />);
    const meter = screen.getByRole("meter", { name: "Noise floor" });
    expect(meter).toHaveAttribute("data-state", "danger");
    expect(meter.getAttribute("aria-valuetext")).toContain("target missed");
    expect(screen.getByText(/\(\+5 dB\)/)).toBeInTheDocument();
    expect(container.querySelector(".vf-target-progress__marker")).not.toBeNull();
  });
});

describe("DayDots and StreakBadge", () => {
  it("summarises done days and renders states; streak pluralises", () => {
    const { container } = renderWithTheme(<DayDots values={[true, false, 3, null, 0]} labels={["Mon", "Tue", "Wed", "Thu", "Fri"]} />);
    expect(screen.getByRole("img", { name: "Last 5 days: 2 of 4 done" })).toBeInTheDocument();
    const states = Array.from(container.querySelectorAll(".vf-day-dots__dot")).map((d) => d.getAttribute("data-state"));
    expect(states).toEqual(["done", "missed", "done", "unknown", "missed"]);
    renderWithTheme(<StreakBadge count={1} best={12} />);
    expect(screen.getByText("day")).toBeInTheDocument();
    expect(screen.getByText("· best 12")).toBeInTheDocument();
    renderWithTheme(<StreakBadge count={7} unit="week" />);
    expect(screen.getByText("weeks")).toBeInTheDocument();
  });
});

describe("ScaleInput", () => {
  it("renders a radio group with labels, selects on click and moves with arrows", () => {
    const onChange = vi.fn();
    renderWithTheme(<ScaleInput label="Mood" min={1} max={5} labels={{ 1: "Low", 5: "High" }} onValueChange={onChange} endLabels={["Low", "High"]} name="mood" />);
    const group = screen.getByRole("radiogroup", { name: "Mood" });
    expect(screen.getAllByRole("radio")).toHaveLength(5);
    fireEvent.click(screen.getByRole("radio", { name: "3" }));
    expect(onChange).toHaveBeenCalledWith(3);
    expect(screen.getByRole("radio", { name: "3" })).toHaveAttribute("aria-checked", "true");
    fireEvent.keyDown(group, { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith(4);
    fireEvent.keyDown(group, { key: "End" });
    expect(onChange).toHaveBeenLastCalledWith(5);
    expect(screen.getByRole("radio", { name: "5, High" })).toHaveAttribute("aria-checked", "true");
    expect((document.querySelector('input[name="mood"]') as HTMLInputElement).value).toBe("5");
  });
});

describe("StatusLine", () => {
  it("picks the live role from the tone and renders an action", () => {
    renderWithTheme(<StatusLine tone="danger" action={<button type="button">Retry</button>}>Disk full</StatusLine>);
    expect(screen.getByRole("alert")).toHaveTextContent("Disk full");
    renderWithTheme(<StatusLine tone="success">Saved</StatusLine>);
    expect(screen.getByRole("status")).toHaveTextContent("Saved");
    renderWithTheme(<StatusLine tone="warning" live="none" data-testid="quiet">Low battery</StatusLine>);
    expect(screen.getByTestId("quiet")).not.toHaveAttribute("role");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});

describe("TagGroup", () => {
  it("folds the overflow behind +N more and expands", () => {
    const onSelect = vi.fn();
    renderWithTheme(<TagGroup tags={["a", "b", "c", "d", "e", "f", "g"]} max={5} onSelect={onSelect} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    fireEvent.click(screen.getByRole("button", { name: "+2 more" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(7);
    fireEvent.click(screen.getByRole("button", { name: "Show fewer" }));
    expect(screen.getAllByRole("listitem")).toHaveLength(5);
    fireEvent.click(screen.getByText("b"));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ label: "b" }), 1);
    renderWithTheme(<TagGroup tags={["x", "y", "z"]} max={2} expandable={false} />);
    expect(screen.getByText("+1 more").tagName).toBe("SPAN");
  });
});

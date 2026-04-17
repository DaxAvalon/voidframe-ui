import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";
import { CronBuilder, getNextRuns } from "../CronBuilder";

describe("CronBuilder", () => {
  it("renders in 'both' mode by default", () => {
    renderWithTheme(<CronBuilder />);
    // Visual fields visible
    expect(screen.getByText("Minute")).toBeInTheDocument();
    expect(screen.getByText("Hour")).toBeInTheDocument();
    // Raw input visible
    expect(screen.getByLabelText("Cron expression")).toBeInTheDocument();
  });

  it("mode='visual' shows only visual", () => {
    renderWithTheme(<CronBuilder mode="visual" />);
    expect(screen.getByText("Minute")).toBeInTheDocument();
    expect(screen.queryByLabelText("Cron expression")).not.toBeInTheDocument();
  });

  it("mode='raw' shows only raw", () => {
    renderWithTheme(<CronBuilder mode="raw" />);
    expect(screen.queryByText("Minute")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Cron expression")).toBeInTheDocument();
  });

  it("visual selection produces correct pattern", async () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <CronBuilder mode="both" onValueChange={handleChange} />
    );
    // Change minute to interval
    const minuteType = screen.getByLabelText("Minute type");
    await userEvent.selectOptions(minuteType, "interval");
    expect(handleChange).toHaveBeenCalled();
    const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1]![0] as string;
    expect(lastCall).toContain("*/");
  });

  it("raw typing fires onValueChange", async () => {
    const handleChange = vi.fn();
    renderWithTheme(
      <CronBuilder mode="raw" onValueChange={handleChange} />
    );
    const input = screen.getByLabelText("Cron expression");
    await userEvent.clear(input);
    await userEvent.type(input, "0 0 * * *");
    expect(handleChange).toHaveBeenCalled();
  });

  it("works as controlled component", () => {
    function Wrapper() {
      const [val, setVal] = useState("0 0 * * *");
      return (
        <CronBuilder
          value={val}
          onValueChange={setVal}
          mode="raw"
        />
      );
    }
    renderWithTheme(<Wrapper />);
    const input = screen.getByLabelText("Cron expression") as HTMLInputElement;
    expect(input.value).toBe("0 0 * * *");
  });

  it("uncontrolled defaultValue", () => {
    renderWithTheme(
      <CronBuilder defaultValue="5 4 * * *" mode="raw" />
    );
    const input = screen.getByLabelText("Cron expression") as HTMLInputElement;
    expect(input.value).toBe("5 4 * * *");
  });

  it("preset buttons set expression", async () => {
    const handleChange = vi.fn();
    renderWithTheme(<CronBuilder onValueChange={handleChange} />);
    const preset = screen.getByText("Every hour");
    await userEvent.click(preset);
    expect(handleChange).toHaveBeenCalledWith("0 * * * *");
  });

  it("preview shows next run times", () => {
    renderWithTheme(
      <CronBuilder
        defaultValue="0 0 * * *"
        showPreview
        previewCount={3}
      />
    );
    const times = document.querySelectorAll(".vf-cron-builder__preview-time");
    expect(times.length).toBe(3);
  });

  it("showPreview={false} hides preview", () => {
    renderWithTheme(
      <CronBuilder defaultValue="0 0 * * *" showPreview={false} />
    );
    const preview = document.querySelector(".vf-cron-builder__preview");
    expect(preview).not.toBeInTheDocument();
  });

  it("shows error for invalid expression", async () => {
    renderWithTheme(<CronBuilder defaultValue="invalid" mode="raw" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Invalid cron expression"
    );
  });

  it("disabled prop disables inputs", () => {
    renderWithTheme(<CronBuilder disabled mode="raw" />);
    const input = screen.getByLabelText("Cron expression") as HTMLInputElement;
    expect(input).toBeDisabled();
  });

  it.each(["sm", "md"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(<CronBuilder size={size} />);
    expect(
      container.querySelector(`.vf-cron-builder--${size}`)
    ).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <CronBuilder defaultValue="0 0 * * *" />
    );
    await expectNoA11yViolations(container);
  });
});

describe("getNextRuns", () => {
  it("returns correct count of dates for simple expressions", () => {
    const results = getNextRuns("* * * * *", 3);
    expect(results.length).toBe(3);
  });
});

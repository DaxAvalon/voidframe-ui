import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RatingInput } from "../RatingInput";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("RatingInput", () => {
  it("renders a slider with count stars", () => {
    renderWithTheme(<RatingInput label="Score" count={5} />);
    const slider = screen.getByRole("slider", { name: "Score" });
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuemax", "5");
    expect(slider).toHaveAttribute("aria-valuenow", "0");
  });

  it("ArrowRight increments by 1", async () => {
    const onChange = vi.fn();
    renderWithTheme(<RatingInput label="Score" onChange={onChange} />);
    const slider = screen.getByRole("slider");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("allowHalf uses 0.5 steps", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RatingInput label="Score" allowHalf onChange={onChange} />
    );
    const slider = screen.getByRole("slider");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith(0.5);
  });

  it("End sets value to count", async () => {
    const onChange = vi.fn();
    renderWithTheme(<RatingInput label="Score" count={5} onChange={onChange} />);
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith(5);
  });

  it("Home sets value to 0", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RatingInput label="Score" defaultValue={3} onChange={onChange} />
    );
    screen.getByRole("slider").focus();
    await userEvent.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it("clicking a star sets the value to that index + 1", async () => {
    const onChange = vi.fn();
    renderWithTheme(<RatingInput label="Score" onChange={onChange} />);
    const stars = screen
      .getByRole("slider")
      .querySelectorAll(".vf-rating-input__star");
    await userEvent.click(stars[2] as HTMLElement);
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("readOnly ignores keyboard input", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <RatingInput label="Score" defaultValue={2} readOnly onChange={onChange} />
    );
    const slider = screen.getByRole("slider");
    slider.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onChange).not.toHaveBeenCalled();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<RatingInput label="Score" />);
    await expectNoA11yViolations(container);
  });
});

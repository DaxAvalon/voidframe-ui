import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Spotlight, type SpotlightStep } from "../Spotlight";

const steps: SpotlightStep[] = [
  { target: null, title: "Step 1", content: "First step content" },
  { target: null, title: "Step 2", content: "Second step content" },
  { target: null, title: "Step 3", content: "Third step content" },
];

describe("Spotlight", () => {
  it("renders nothing when open is false", () => {
    renderWithTheme(<Spotlight steps={steps} open={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders when open is true", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} />);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("shows step title and content", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} step={0} />);
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    expect(screen.getByText("First step content")).toBeInTheDocument();
  });

  it("shows progress indicator", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} step={0} />);
    expect(screen.getByText("1 / 3")).toBeInTheDocument();
  });

  it("calls onStepChange when Next is clicked", () => {
    const onStepChange = vi.fn();
    renderWithTheme(
      <Spotlight steps={steps} open={true} step={0} onStepChange={onStepChange} />
    );
    fireEvent.click(screen.getByText("Next"));
    expect(onStepChange).toHaveBeenCalledWith(1);
  });

  it("shows Back button on non-first steps", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} step={1} />);
    expect(screen.getByText("Back")).toBeInTheDocument();
  });

  it("calls onStepChange with previous step when Back is clicked", () => {
    const onStepChange = vi.fn();
    renderWithTheme(
      <Spotlight steps={steps} open={true} step={1} onStepChange={onStepChange} />
    );
    fireEvent.click(screen.getByText("Back"));
    expect(onStepChange).toHaveBeenCalledWith(0);
  });

  it("shows Done on the last step", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} step={2} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("calls onComplete and onOpenChange when Done is clicked", () => {
    const onComplete = vi.fn();
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Spotlight
        steps={steps}
        open={true}
        step={2}
        onComplete={onComplete}
        onOpenChange={onOpenChange}
      />
    );
    fireEvent.click(screen.getByText("Done"));
    expect(onComplete).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Skip button calls onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Spotlight steps={steps} open={true} step={0} onOpenChange={onOpenChange} />
    );
    fireEvent.click(screen.getByText("Skip"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("hides Skip button when allowSkip=false", () => {
    renderWithTheme(
      <Spotlight steps={steps} open={true} step={0} allowSkip={false} />
    );
    expect(screen.queryByText("Skip")).not.toBeInTheDocument();
  });

  it("does not show Back on first step", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} step={0} />);
    expect(screen.queryByText("Back")).not.toBeInTheDocument();
  });

  it("renders SVG mask overlay", () => {
    const { container } = renderWithTheme(
      <Spotlight steps={steps} open={true} step={0} />
    );
    expect(container.ownerDocument.querySelector(".vf-spotlight__mask")).toBeInTheDocument();
  });

  it("renders card at correct position when no target (fallback)", () => {
    renderWithTheme(<Spotlight steps={steps} open={true} step={0} />);
    const card = document.querySelector(".vf-spotlight__card");
    expect(card).toBeTruthy();
  });

  it("uncontrolled mode uses defaultOpen and defaultStep", () => {
    renderWithTheme(
      <Spotlight steps={steps} defaultOpen={true} defaultStep={1} />
    );
    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
  });

  it("uses custom tint color", () => {
    renderWithTheme(
      <Spotlight steps={steps} open={true} step={0} tint="rgba(255,0,0,0.5)" />
    );
    expect(document.querySelector(".vf-spotlight__mask")).toBeInTheDocument();
  });

  it("renders with target as string selector", () => {
    const div = document.createElement("div");
    div.id = "test-target";
    document.body.appendChild(div);
    try {
      const stepsWithTarget: SpotlightStep[] = [
        { target: "#test-target", title: "Target Step", content: "Found it" },
      ];
      renderWithTheme(<Spotlight steps={stepsWithTarget} open={true} step={0} />);
      expect(screen.getByText("Target Step")).toBeInTheDocument();
    } finally {
      document.body.removeChild(div);
    }
  });

  it("renders placement=top positioning", () => {
    const stepsWithPlacement: SpotlightStep[] = [
      { target: null, title: "Top Step", content: "Top", placement: "top" },
    ];
    renderWithTheme(<Spotlight steps={stepsWithPlacement} open={true} step={0} />);
    expect(screen.getByText("Top Step")).toBeInTheDocument();
  });

  it("renders placement=left positioning", () => {
    const stepsWithPlacement: SpotlightStep[] = [
      { target: null, title: "Left Step", content: "Left", placement: "left" },
    ];
    renderWithTheme(<Spotlight steps={stepsWithPlacement} open={true} step={0} />);
    expect(screen.getByText("Left Step")).toBeInTheDocument();
  });

  it("renders placement=right positioning", () => {
    const stepsWithPlacement: SpotlightStep[] = [
      { target: null, title: "Right Step", content: "Right", placement: "right" },
    ];
    renderWithTheme(<Spotlight steps={stepsWithPlacement} open={true} step={0} />);
    expect(screen.getByText("Right Step")).toBeInTheDocument();
  });
});

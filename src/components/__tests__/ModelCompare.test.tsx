import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ModelCompare, type ModelCompareModel, type ModelCompareResponse } from "../ModelCompare";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const MODELS: [ModelCompareModel, ModelCompareModel] = [
  { id: "a", name: "Model Alpha" },
  { id: "b", name: "Model Beta" },
];

describe("ModelCompare", () => {
  it("renders two panels with model names", () => {
    renderWithTheme(<ModelCompare models={MODELS} />);
    expect(screen.getByText("Model Alpha")).toBeInTheDocument();
    expect(screen.getByText("Model Beta")).toBeInTheDocument();
  });

  it("renders a prompt input", () => {
    renderWithTheme(<ModelCompare models={MODELS} />);
    expect(screen.getByLabelText("Prompt")).toBeInTheDocument();
  });

  it("renders model icons", () => {
    const models: [ModelCompareModel, ModelCompareModel] = [
      { id: "a", name: "Alpha", icon: <span data-testid="icon-a">A</span> },
      { id: "b", name: "Beta", icon: <span data-testid="icon-b">B</span> },
    ];
    renderWithTheme(<ModelCompare models={models} />);
    expect(screen.getByTestId("icon-a")).toBeInTheDocument();
    expect(screen.getByTestId("icon-b")).toBeInTheDocument();
  });

  it("fires onSubmit with prompt value", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(
      <ModelCompare models={MODELS} defaultPrompt="Hello" onSubmit={onSubmit} />
    );
    await userEvent.click(screen.getByText("Submit"));
    expect(onSubmit).toHaveBeenCalledWith("Hello");
  });

  it("supports controlled prompt", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ModelCompare models={MODELS} prompt="test" onPromptChange={onChange} />
    );
    expect(screen.getByLabelText("Prompt")).toHaveValue("test");
  });

  it("supports uncontrolled defaultPrompt", () => {
    renderWithTheme(
      <ModelCompare models={MODELS} defaultPrompt="default" />
    );
    expect(screen.getByLabelText("Prompt")).toHaveValue("default");
  });

  it("shows response content in correct panel", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "Answer from Alpha", status: "complete" },
      { modelId: "b", content: "Answer from Beta", status: "complete" },
    ];
    renderWithTheme(<ModelCompare models={MODELS} responses={responses} />);
    expect(screen.getByText("Answer from Alpha")).toBeInTheDocument();
    expect(screen.getByText("Answer from Beta")).toBeInTheDocument();
  });

  it("applies streaming class for streaming status", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "...", status: "streaming" },
    ];
    renderWithTheme(<ModelCompare models={MODELS} responses={responses} />);
    const panels = document.querySelectorAll(".vf-model-compare__panel");
    const streamingPanel = Array.from(panels).find((p) =>
      p.className.includes("streaming")
    );
    expect(streamingPanel).toBeTruthy();
  });

  it("renders complete status without special class", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "Done", status: "complete" },
    ];
    renderWithTheme(<ModelCompare models={MODELS} responses={responses} />);
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("applies error class and shows error message", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "", status: "error", error: "Rate limited" },
    ];
    renderWithTheme(<ModelCompare models={MODELS} responses={responses} />);
    expect(screen.getByText("Rate limited")).toBeInTheDocument();
    const panels = document.querySelectorAll(".vf-model-compare__panel");
    const errorPanel = Array.from(panels).find((p) =>
      p.className.includes("error")
    );
    expect(errorPanel).toBeTruthy();
  });

  it("shows metrics when showMetrics is true", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "ok", status: "complete", tokens: { input: 10, output: 20 }, latency: 150 },
    ];
    renderWithTheme(<ModelCompare models={MODELS} responses={responses} showMetrics />);
    expect(screen.getByText("10in / 20out")).toBeInTheDocument();
    expect(screen.getByText("150ms")).toBeInTheDocument();
  });

  it("renders empty state when both idle", () => {
    renderWithTheme(<ModelCompare models={MODELS} />);
    const panels = document.querySelectorAll(".vf-model-compare__panel");
    expect(panels).toHaveLength(2);
  });

  it.each(["sm", "md"] as const)("applies size class %s", (size) => {
    const { root } = renderWithTheme(
      <ModelCompare models={MODELS} size={size} />
    );
    expect(root().className).toContain(`vf-model-compare--${size}`);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<ModelCompare models={MODELS} />);
    await expectNoA11yViolations(container);
  });

  it("syncScroll=true mirrors scrollTop from one panel to the other", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "long content A", status: "complete" },
      { modelId: "b", content: "long content B", status: "complete" },
    ];
    renderWithTheme(
      <ModelCompare models={MODELS} responses={responses} syncScroll />
    );
    const panels = document.querySelectorAll<HTMLDivElement>(
      ".vf-model-compare__panel-content"
    );
    expect(panels).toHaveLength(2);
    const [panelA, panelB] = [panels[0]!, panels[1]!];

    Object.defineProperty(panelA, "scrollTop", { value: 120, writable: true, configurable: true });
    fireEvent.scroll(panelA);
    expect(panelB.scrollTop).toBe(120);
  });

  it("syncScroll=false (default) does not mirror scrollTop", () => {
    const responses: ModelCompareResponse[] = [
      { modelId: "a", content: "long content A", status: "complete" },
      { modelId: "b", content: "long content B", status: "complete" },
    ];
    renderWithTheme(
      <ModelCompare models={MODELS} responses={responses} />
    );
    const panels = document.querySelectorAll<HTMLDivElement>(
      ".vf-model-compare__panel-content"
    );
    const [panelA, panelB] = [panels[0]!, panels[1]!];

    Object.defineProperty(panelA, "scrollTop", { value: 120, writable: true, configurable: true });
    fireEvent.scroll(panelA);
    expect(panelB.scrollTop).toBe(0);
  });
});

/**
 * @vitest-environment happy-dom
 */
import { render, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import {
  VoidframeReactFlowTheme,
  useVoidframeReactFlowStyles,
} from "../ReactFlowTheme";

afterEach(cleanup);

describe("VoidframeReactFlowTheme", () => {
  it("renders children inside a host div with [data-vf-reactflow]", () => {
    const { container } = render(
      <VoidframeReactFlowTheme>
        <div data-testid="rf-child">flow</div>
      </VoidframeReactFlowTheme>
    );
    const host = container.querySelector("[data-vf-reactflow]");
    expect(host).not.toBeNull();
    expect(host?.querySelector('[data-testid="rf-child"]')).not.toBeNull();
  });

  it("forwards `className` and merges with the canonical class", () => {
    const { container } = render(
      <VoidframeReactFlowTheme className="my-flow">
        <div />
      </VoidframeReactFlowTheme>
    );
    const host = container.querySelector("[data-vf-reactflow]");
    expect(host?.className).toContain("vf-reactflow-theme");
    expect(host?.className).toContain("my-flow");
  });

  it("applies `vars` as inline CSS custom properties", () => {
    const { container } = render(
      <VoidframeReactFlowTheme vars={{ "--vf-accent": "rebeccapurple" }}>
        <div />
      </VoidframeReactFlowTheme>
    );
    const host = container.querySelector("[data-vf-reactflow]") as HTMLElement;
    expect(host?.style.getPropertyValue("--vf-accent")).toBe("rebeccapurple");
  });
});

describe("useVoidframeReactFlowStyles", () => {
  it("returns style objects keyed by reactflow-surface", () => {
    let captured: ReturnType<typeof useVoidframeReactFlowStyles> | null = null;
    function Probe() {
      captured = useVoidframeReactFlowStyles();
      return null;
    }
    render(<Probe />);
    expect(captured).not.toBeNull();
    expect(captured!.controls.background).toBe("var(--vf-bg-2)");
    expect(captured!.miniMap.background).toBe("var(--vf-bg-2)");
    expect(captured!.background.background).toBe("var(--vf-bg-1)");
  });
});

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
} from "../Resizable";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Resizable", () => {
  it("assigns equal sizes when no defaults are provided", () => {
    const { container } = renderWithTheme(
      <ResizableGroup>
        <ResizablePanel data-testid="p1" />
        <ResizableHandle />
        <ResizablePanel data-testid="p2" />
      </ResizableGroup>
    );
    const p1 = container.querySelector('[data-testid="p1"]') as HTMLElement;
    const p2 = container.querySelector('[data-testid="p2"]') as HTMLElement;
    expect(p1.style.flex).toMatch(/^50 1 0(px)?$/);
    expect(p2.style.flex).toMatch(/^50 1 0(px)?$/);
  });

  it("keyboard arrow resizes adjacent panels", async () => {
    const onLayout = vi.fn();
    const { container } = renderWithTheme(
      <ResizableGroup onLayout={onLayout}>
        <ResizablePanel />
        <ResizableHandle keyboardStep={5} />
        <ResizablePanel />
      </ResizableGroup>
    );
    const handle = container.querySelector(".vf-resizable__handle") as HTMLElement;
    handle.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onLayout).toHaveBeenCalled();
    const last = onLayout.mock.calls.at(-1)![0];
    expect(last[0]).toBeCloseTo(55, 0);
    expect(last[1]).toBeCloseTo(45, 0);
  });

  it("handle exposes role=separator with orientation", () => {
    renderWithTheme(
      <ResizableGroup direction="vertical">
        <ResizablePanel />
        <ResizableHandle data-testid="h" />
        <ResizablePanel />
      </ResizableGroup>
    );
    const h = screen.getByRole("separator");
    expect(h).toHaveAttribute("aria-orientation", "horizontal");
  });
});

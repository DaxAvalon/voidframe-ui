import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  ResizableGroup,
  ResizablePanel,
  ResizableHandle,
  ResizableBox,
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

  it("pointer drag and release resizes panels", () => {
    const onLayout = vi.fn();
    const { container } = renderWithTheme(
      <ResizableGroup onLayout={onLayout}>
        <ResizablePanel />
        <ResizableHandle />
        <ResizablePanel />
      </ResizableGroup>
    );
    const handle = container.querySelector(".vf-resizable__handle") as HTMLElement;
    // Mock pointer capture APIs (not in happy-dom)
    handle.setPointerCapture = vi.fn();
    handle.releasePointerCapture = vi.fn();
    // Mock getBoundingClientRect for the handle's parent
    vi.spyOn(handle.parentElement!, "getBoundingClientRect").mockReturnValue({
      width: 800, height: 400, x: 0, y: 0, top: 0, left: 0, right: 800, bottom: 400, toJSON: () => {},
    });
    fireEvent.pointerDown(handle, { clientX: 400, clientY: 200, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 450, clientY: 200, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 450, clientY: 200, pointerId: 1 });
    expect(onLayout).toHaveBeenCalled();
  });

  it("vertical keyboard ArrowDown resizes", async () => {
    const onLayout = vi.fn();
    const { container } = renderWithTheme(
      <ResizableGroup direction="vertical" onLayout={onLayout}>
        <ResizablePanel />
        <ResizableHandle keyboardStep={5} />
        <ResizablePanel />
      </ResizableGroup>
    );
    const handle = container.querySelector(".vf-resizable__handle") as HTMLElement;
    handle.focus();
    await userEvent.keyboard("{ArrowDown}");
    expect(onLayout).toHaveBeenCalled();
  });
});

describe("ResizableBox", () => {
  it("renders at the default size", () => {
    const { container } = renderWithTheme(
      <ResizableBox defaultWidth={240} defaultHeight={120}>
        content
      </ResizableBox>
    );
    const box = container.querySelector(".vf-resizable-box") as HTMLElement;
    expect(box.style.width).toBe("240px");
    expect(box.style.height).toBe("120px");
  });

  it("axis=x exposes only the width grip", () => {
    const { container } = renderWithTheme(
      <ResizableBox axis="x" defaultWidth={200} defaultHeight={100} />
    );
    expect(container.querySelector(".vf-resizable-box__grip--right")).toBeTruthy();
    expect(container.querySelector(".vf-resizable-box__grip--bottom")).toBeFalsy();
    expect(container.querySelector(".vf-resizable-box__grip--corner")).toBeFalsy();
  });

  it("axis=y exposes only the height grip", () => {
    const { container } = renderWithTheme(
      <ResizableBox axis="y" defaultWidth={200} defaultHeight={100} />
    );
    expect(container.querySelector(".vf-resizable-box__grip--right")).toBeFalsy();
    expect(container.querySelector(".vf-resizable-box__grip--bottom")).toBeTruthy();
    expect(container.querySelector(".vf-resizable-box__grip--corner")).toBeFalsy();
  });

  it("axis=both exposes right, bottom, and corner grips", () => {
    const { container } = renderWithTheme(
      <ResizableBox axis="both" defaultWidth={200} defaultHeight={100} />
    );
    expect(container.querySelector(".vf-resizable-box__grip--right")).toBeTruthy();
    expect(container.querySelector(".vf-resizable-box__grip--bottom")).toBeTruthy();
    expect(container.querySelector(".vf-resizable-box__grip--corner")).toBeTruthy();
  });

  it("corner drag resizes both dimensions and clamps to min", () => {
    const onResize = vi.fn();
    const { container } = renderWithTheme(
      <ResizableBox
        defaultWidth={200}
        defaultHeight={100}
        minWidth={80}
        minHeight={60}
        onResize={onResize}
      />
    );
    const corner = container.querySelector(
      ".vf-resizable-box__grip--corner"
    ) as HTMLElement;
    fireEvent.pointerDown(corner, { clientX: 100, clientY: 100, pointerId: 1 });
    fireEvent.pointerMove(corner, { clientX: 50, clientY: 50, pointerId: 1 });
    fireEvent.pointerUp(corner, { clientX: 50, clientY: 50, pointerId: 1 });
    expect(onResize).toHaveBeenCalled();
    const last = onResize.mock.calls.at(-1)![0];
    expect(last.width).toBeGreaterThanOrEqual(80);
    expect(last.height).toBeGreaterThanOrEqual(60);
  });
});

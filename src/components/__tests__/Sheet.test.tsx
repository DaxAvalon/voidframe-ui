import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Sheet } from "../DrawerCompound";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Sheet smooth drag", () => {
  it("tracks the pointer continuously while the handle is dragged", async () => {
    const user = userEvent.setup();
    renderWithTheme(
      <Sheet snapPoints={[0.4, 0.9]} defaultSnap={0}>
        <Sheet.Trigger>Open</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Handle data-testid="handle" />
          <Sheet.Header>
            <Sheet.Title>Panel</Sheet.Title>
          </Sheet.Header>
          <Sheet.Body>body</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    const handle = screen.getByTestId("handle");
    // Start drag, move up (dy < 0 → taller sheet).
    fireEvent.pointerDown(handle, {
      clientX: 100,
      clientY: 500,
      pointerId: 1,
    });
    fireEvent.pointerMove(handle, {
      clientX: 100,
      clientY: 400,
      pointerId: 1,
    });
    const panel = screen.getByRole("dialog");
    // While dragging, the panel must use data-dragging and px-based height,
    // proving we're no longer stuck on the discrete snap steps.
    expect(panel.getAttribute("data-dragging")).toBe("true");
    expect(panel.style.height.endsWith("px")).toBe(true);
    fireEvent.pointerUp(handle, {
      clientX: 100,
      clientY: 400,
      pointerId: 1,
    });
    expect(panel.getAttribute("data-dragging")).toBeNull();
  });

  it("closes the sheet when dragged down past the smallest snap", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Sheet
        snapPoints={[0.4, 0.9]}
        defaultSnap={0}
        onOpenChange={onOpenChange}
      >
        <Sheet.Trigger>Open</Sheet.Trigger>
        <Sheet.Content>
          <Sheet.Handle data-testid="handle" />
          <Sheet.Body>body</Sheet.Body>
        </Sheet.Content>
      </Sheet>
    );
    await user.click(screen.getByRole("button", { name: "Open" }));
    onOpenChange.mockClear();
    const handle = screen.getByTestId("handle");
    fireEvent.pointerDown(handle, {
      clientX: 0,
      clientY: 0,
      pointerId: 1,
    });
    // Dragging down past 0.4 * 0.6 = 0.24 of viewport should close.
    fireEvent.pointerUp(handle, {
      clientX: 0,
      clientY: window.innerHeight * 0.5,
      pointerId: 1,
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

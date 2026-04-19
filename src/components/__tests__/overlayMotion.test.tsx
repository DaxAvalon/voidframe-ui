// Phase 6 invariant: Modal/Drawer/ConfirmDialog support `motion={false}` to
// skip enter/exit animations cleanly (e.g. for tests, reduced-motion users
// who want zero animation even via CSS, or specific UX contexts).
//
// With motion=false the component falls back to its synchronous
// null-when-closed path. With motion=true (default) it uses Presence so
// the overlay stays mounted through exit animations.

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Modal } from "../Interactive";
import { ConfirmDialog, Drawer } from "../Overlay";

describe("Modal — motion", () => {
  it("motion=true (default) renders via Presence when open", () => {
    render(
      <Modal open onDismiss={() => {}} title="X">
        hi
      </Modal>
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("motion=false renders synchronously when open", () => {
    render(
      <Modal open onDismiss={() => {}} title="X" motion={false}>
        hi
      </Modal>
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("motion=false returns nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onDismiss={() => {}} title="X" motion={false}>
        hi
      </Modal>
    );
    expect(screen.queryByText("hi")).not.toBeInTheDocument();
    // Portal renders nothing too — body is clean aside from the wrapper.
    expect(container.firstChild).toBeNull();
  });

  it("motion=true: no animation/transition in test env → unmounts synchronously when closed", () => {
    // happy-dom's getComputedStyle returns empty; Presence sees no animation
    // and falls through to synchronous unmount. Verify.
    const { rerender } = render(
      <Modal open onDismiss={() => {}} title="X">
        content
      </Modal>
    );
    expect(screen.getByText("content")).toBeInTheDocument();
    rerender(
      <Modal open={false} onDismiss={() => {}} title="X">
        content
      </Modal>
    );
    expect(screen.queryByText("content")).not.toBeInTheDocument();
  });
});

describe("Drawer — motion", () => {
  it("motion=false renders synchronously when open", () => {
    render(
      <Drawer open onDismiss={() => {}} title="X" motion={false}>
        drawer-body
      </Drawer>
    );
    expect(screen.getByText("drawer-body")).toBeInTheDocument();
  });

  it("motion=false returns nothing when closed", () => {
    render(
      <Drawer open={false} onDismiss={() => {}} title="X" motion={false}>
        drawer-body
      </Drawer>
    );
    expect(screen.queryByText("drawer-body")).not.toBeInTheDocument();
  });
});

describe("ConfirmDialog — motion", () => {
  it("motion=false renders synchronously when open", () => {
    render(
      <ConfirmDialog
        open
        motion={false}
        title="Confirm"
        message="body-msg"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("body-msg")).toBeInTheDocument();
  });

  it("motion=false returns nothing when closed", () => {
    render(
      <ConfirmDialog
        open={false}
        motion={false}
        title="Confirm"
        message="body-msg"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText("body-msg")).not.toBeInTheDocument();
  });
});

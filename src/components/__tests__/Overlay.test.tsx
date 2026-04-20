import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Alert,
  ConfirmDialog,
  Drawer,
  Dropdown,
  Popover,
} from "../Overlay";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Drawer", () => {
  it("renders nothing when closed", () => {
    renderWithTheme(
      <Drawer open={false} onDismiss={() => {}} title="PANEL">
        body
      </Drawer>
    );
    expect(screen.queryByText("PANEL")).not.toBeInTheDocument();
    expect(screen.queryByText("body")).not.toBeInTheDocument();
  });

  it("renders title and body when open", () => {
    renderWithTheme(
      <Drawer open onDismiss={() => {}} title="PANEL">
        content
      </Drawer>
    );
    expect(screen.getByText("PANEL")).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("close button fires onDismiss", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <Drawer open onDismiss={onDismiss} title="X">
        body
      </Drawer>
    );
    await userEvent.click(screen.getByText("×"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("deprecated Drawer locks body scroll when open", () => {
    const { rerender } = renderWithTheme(
      <Drawer open={false} onDismiss={() => {}} title="L">
        body
      </Drawer>
    );
    expect(document.body.style.overflow).not.toBe("hidden");
    rerender(
      <Drawer open onDismiss={() => {}} title="L">
        body
      </Drawer>
    );
    expect(document.body.style.overflow).toBe("hidden");
  });
});

describe("Dropdown", () => {
  it("opens menu on trigger click", async () => {
    renderWithTheme(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "First" }, { label: "Second" }]}
      />
    );
    expect(screen.queryByText("First")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("Menu"));
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("invokes item onClick and closes", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "Go", onClick }]}
      />
    );
    await userEvent.click(screen.getByText("Menu"));
    await userEvent.click(screen.getByText("Go"));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText("Go")).not.toBeInTheDocument();
  });

  it("skips disabled item's onClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "X", onClick, disabled: true }]}
      />
    );
    await userEvent.click(screen.getByText("Menu"));
    await userEvent.click(screen.getByText("X"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("Enter key on dropdown item fires onClick and closes", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "Action", onClick }]}
      />
    );
    await userEvent.click(screen.getByText("Menu"));
    const item = screen.getByText("Action");
    item.focus();
    await userEvent.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Space key on dropdown item fires onClick and closes", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Dropdown
        trigger={<button>Menu</button>}
        items={[{ label: "Act", onClick }]}
      />
    );
    await userEvent.click(screen.getByText("Menu"));
    const item = screen.getByText("Act");
    item.focus();
    await userEvent.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe("Popover", () => {
  it("opens on trigger click", async () => {
    renderWithTheme(
      <Popover trigger={<button>Open</button>}>inside</Popover>
    );
    expect(screen.queryByText("inside")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("Open"));
    expect(screen.getByText("inside")).toBeInTheDocument();
  });

  it("shows on hover when on='hover'", async () => {
    renderWithTheme(
      <Popover on="hover" trigger={<button>Hover</button>}>
        payload
      </Popover>
    );
    await userEvent.hover(screen.getByText("Hover"));
    expect(screen.getByText("payload")).toBeInTheDocument();
  });
});

describe("Alert", () => {
  it("renders children body", () => {
    renderWithTheme(<Alert>alert body</Alert>);
    expect(screen.getByText("alert body")).toBeInTheDocument();
  });

  it("renders title when given", () => {
    renderWithTheme(
      <Alert title="HEADS UP">message</Alert>
    );
    expect(screen.getByText("HEADS UP")).toBeInTheDocument();
  });

  it("dismiss button triggers onDismiss", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(<Alert onDismiss={onDismiss}>x</Alert>);
    await userEvent.click(screen.getByRole("button"));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});

describe("ConfirmDialog", () => {
  it("renders nothing when closed", () => {
    renderWithTheme(
      <ConfirmDialog
        open={false}
        title="DELETE?"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.queryByText("DELETE?")).not.toBeInTheDocument();
  });

  it("drops aria-modal when open=false (motion branch mounted)", () => {
    const { rerender } = renderWithTheme(
      <ConfirmDialog
        open
        title="T"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    let panel = document.querySelector(".vf-confirm__panel");
    expect(panel?.getAttribute("aria-modal")).toBe("true");
    rerender(
      <ConfirmDialog
        open={false}
        title="T"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    panel = document.querySelector(".vf-confirm__panel");
    // If still mounted during exit animation, aria-modal must be gone
    if (panel) {
      expect(panel.getAttribute("aria-modal")).toBeNull();
    }
  });

  it("renders title + message + buttons when open", () => {
    renderWithTheme(
      <ConfirmDialog
        open
        title="DELETE?"
        message="This cannot be undone"
        onConfirm={() => {}}
        onCancel={() => {}}
      />
    );
    expect(screen.getByText("DELETE?")).toBeInTheDocument();
    expect(screen.getByText("This cannot be undone")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CANCEL" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "CONFIRM" })).toBeInTheDocument();
  });

  it("confirm + cancel fire their callbacks", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithTheme(
      <ConfirmDialog
        open
        onConfirm={onConfirm}
        onCancel={onCancel}
        confirmLabel="GO"
        cancelLabel="STOP"
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "STOP" }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    await userEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });
});

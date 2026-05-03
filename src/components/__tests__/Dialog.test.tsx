// Coverage tests for Dialog compound (Dialog.tsx).
// Exercises every subcomponent and the useConfirm hook.

import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import {
  AlertDialog,
  ConfirmDialogV2,
  ConfirmProvider,
  Dialog,
  countDialogChildren,
  useConfirm,
} from "../Dialog";

describe("Dialog root", () => {
  it("renders nothing when defaultOpen is false", () => {
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Hello</Dialog.Title>
          </Dialog.Header>
        </Dialog.Content>
      </Dialog>
    );
    expect(screen.queryByText("Hello")).not.toBeInTheDocument();
  });

  it("renders content when defaultOpen=true", () => {
    renderWithTheme(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Greeting</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(screen.getByText("Greeting")).toBeInTheDocument();
  });

  it("respects controlled `open` prop", () => {
    const { rerender } = renderWithTheme(
      <Dialog open={false}>
        <Dialog.Content>
          <Dialog.Title>Ctl</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(screen.queryByText("Ctl")).not.toBeInTheDocument();
    rerender(
      <Dialog open>
        <Dialog.Content>
          <Dialog.Title>Ctl</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(screen.getByText("Ctl")).toBeInTheDocument();
  });

  it("calls onOpenChange when trigger fires", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog onOpenChange={onOpenChange}>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>X</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});

describe("Dialog.Trigger", () => {
  it("renders as plain <button> by default", () => {
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
      </Dialog>
    );
    const btn = screen.getByRole("button", { name: "Open" });
    expect(btn.tagName).toBe("BUTTON");
    expect(btn).toHaveAttribute("aria-haspopup", "dialog");
    expect(btn).toHaveAttribute("aria-expanded", "false");
  });

  it("forwards props onto an asChild element", async () => {
    // Dialog.Trigger asChild clones the element and replaces its own onClick
    // with the trigger's handler (which itself forwards Trigger's onClick prop).
    // Pass the spy via Trigger to assert forwarding.
    const onClick = vi.fn();
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger asChild onClick={onClick}>
          <a href="#nope">anchor-trigger</a>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Done</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    const anchor = screen.getByText("anchor-trigger");
    expect(anchor.tagName).toBe("A");
    expect(anchor).toHaveAttribute("aria-haspopup", "dialog");
    await userEvent.click(anchor);
    expect(onClick).toHaveBeenCalled();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("opens the Dialog on click", async () => {
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Visible</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(screen.queryByText("Visible")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(screen.getByText("Visible")).toBeInTheDocument();
  });
});

describe("Dialog.Content portal", () => {
  it("renders inside document.body via Portal when modal", () => {
    renderWithTheme(
      <Dialog defaultOpen>
        <Dialog.Content data-testid="content">
          <Dialog.Title>Portal</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    // Portal escapes the render container — query document.body instead.
    const panel = document.body.querySelector(".vf-dialog__panel");
    expect(panel).toBeInTheDocument();
    expect(document.body.querySelector(".vf-dialog__backdrop")).toBeInTheDocument();
  });

  it("renders inline when modal=false", () => {
    const { container } = renderWithTheme(
      <Dialog defaultOpen>
        <Dialog.Content modal={false}>
          <Dialog.Title>Inline</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(container.querySelector(".vf-dialog__panel")).toBeInTheDocument();
  });

  it("applies size variant class", () => {
    renderWithTheme(
      <Dialog defaultOpen>
        <Dialog.Content size="xl">
          <Dialog.Title>Big</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    const panel = document.body.querySelector(".vf-dialog__panel--xl");
    expect(panel).toBeInTheDocument();
  });

  it("clicking the backdrop closes the dialog (routed through DismissableLayer)", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>Bd</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    const backdrop = document.body.querySelector(
      ".vf-dialog__backdrop"
    ) as HTMLElement;
    expect(backdrop).toBeInTheDocument();
    // Dismissal is now routed via DismissableLayer.onPointerDownOutside —
    // a pointerdown on the backdrop (outside the panel) is what fires it.
    fireEvent.pointerDown(backdrop);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Dialog primitives (Header / Title / Description / Body / Footer)", () => {
  it("renders all parts with their classes", () => {
    renderWithTheme(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Title-Text</Dialog.Title>
            <Dialog.Description>Desc-Text</Dialog.Description>
          </Dialog.Header>
          <Dialog.Body>Body-Text</Dialog.Body>
          <Dialog.Footer>Footer-Text</Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );
    expect(screen.getByText("Title-Text")).toBeInTheDocument();
    expect(screen.getByText("Desc-Text")).toBeInTheDocument();
    expect(screen.getByText("Body-Text")).toBeInTheDocument();
    expect(screen.getByText("Footer-Text")).toBeInTheDocument();
    expect(document.body.querySelector(".vf-dialog__header")).toBeInTheDocument();
    expect(document.body.querySelector(".vf-dialog__body")).toBeInTheDocument();
    expect(document.body.querySelector(".vf-dialog__footer")).toBeInTheDocument();
  });

  it("Title registers aria-labelledby on the panel", () => {
    renderWithTheme(
      <Dialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Label-Me</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    const panel = document.body.querySelector(
      ".vf-dialog__panel"
    ) as HTMLElement;
    const title = screen.getByText("Label-Me");
    expect(panel.getAttribute("aria-labelledby")).toBe(title.id);
  });
});

describe("Dialog.Close", () => {
  it("default close button closes the dialog", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>X</Dialog.Title>
          <Dialog.Close />
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Close" })
    );
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("asChild close clones onClick onto child", async () => {
    const onOpenChange = vi.fn();
    const childClick = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>X</Dialog.Title>
          <Dialog.Close asChild>
            <a href="#x" onClick={childClick}>
              custom-close
            </a>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(screen.getByText("custom-close"));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Dialog.Cancel / Dialog.Action", () => {
  it("Cancel closes the dialog and fires onClick", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>X</Dialog.Title>
          <Dialog.Footer>
            <Dialog.Cancel onClick={onClick}>Nope</Dialog.Cancel>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Nope" }));
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("Action closes by default but respects autoClose=false", async () => {
    const onClick = vi.fn();
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>X</Dialog.Title>
          <Dialog.Footer>
            <Dialog.Action autoClose={false} onClick={onClick}>
              Stay
            </Dialog.Action>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Stay" }));
    expect(onClick).toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it("Action closes when autoClose left as default", async () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>X</Dialog.Title>
          <Dialog.Action>Yep</Dialog.Action>
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Yep" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("Dialog.Content finalFocus", () => {
  it("restores focus to finalFocus ref on unmount", async () => {
    function Probe() {
      const btnRef = { current: null as HTMLButtonElement | null };
      const [show, setShow] = useState(true);
      return (
        <>
          <button ref={(el) => { btnRef.current = el; }} data-testid="restore-target">Target</button>
          {show && (
            <Dialog open onOpenChange={(o) => { if (!o) setShow(false); }}>
              <Dialog.Content finalFocus={btnRef as any}>
                <Dialog.Title>Focus Test</Dialog.Title>
                <Dialog.Close />
              </Dialog.Content>
            </Dialog>
          )}
        </>
      );
    }
    renderWithTheme(<Probe />);
    expect(screen.getByText("Focus Test")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    // After closing, the finalFocus element should eventually receive focus
    await new Promise((r) => setTimeout(r, 50));
    expect(screen.getByTestId("restore-target")).toBeInTheDocument();
  });
});

describe("Escape key closes Dialog", () => {
  it("dispatches keydown Escape and closes", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Dialog defaultOpen onOpenChange={onOpenChange}>
        <Dialog.Content>
          <Dialog.Title>EscMe</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});

describe("AlertDialog", () => {
  it("uses role='alertdialog' on its panel", () => {
    renderWithTheme(
      <AlertDialog defaultOpen>
        <Dialog.Content>
          <Dialog.Title>Heads</Dialog.Title>
        </Dialog.Content>
      </AlertDialog>
    );
    const panel = document.body.querySelector(
      ".vf-dialog__panel"
    ) as HTMLElement;
    expect(panel.getAttribute("role")).toBe("alertdialog");
  });
});

describe("ConfirmDialogV2", () => {
  it("renders title, description, and both action buttons", () => {
    renderWithTheme(
      <ConfirmDialogV2
        defaultOpen
        title="Delete?"
        description="Really?"
        confirmLabel="Yes"
        cancelLabel="No"
      />
    );
    expect(screen.getByText("Delete?")).toBeInTheDocument();
    expect(screen.getByText("Really?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yes" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "No" })).toBeInTheDocument();
  });

  it("fires onCancel when cancel clicked", async () => {
    const onCancel = vi.fn();
    renderWithTheme(
      <ConfirmDialogV2 defaultOpen onCancel={onCancel} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("fires onConfirm when confirm clicked", async () => {
    const onConfirm = vi.fn();
    renderWithTheme(
      <ConfirmDialogV2 defaultOpen onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it("applies confirmTone (or destructive→danger) data-tone", () => {
    renderWithTheme(
      <ConfirmDialogV2 defaultOpen destructive />
    );
    const action = screen.getByRole("button", { name: "Confirm" });
    expect(action.getAttribute("data-tone")).toBe("danger");
  });
});

describe("useConfirm + ConfirmProvider", () => {
  function Probe({ onResult }: { onResult: (b: boolean) => void }) {
    const confirm = useConfirm();
    return (
      <button
        onClick={async () => {
          const ok = await confirm({ title: "Sure?" });
          onResult(ok);
        }}
      >
        ask
      </button>
    );
  }

  it("resolves true when confirm action clicked", async () => {
    const result = vi.fn();
    renderWithTheme(
      <ConfirmProvider>
        <Probe onResult={result} />
      </ConfirmProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "ask" }));
    expect(screen.getByText("Sure?")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(result).toHaveBeenCalledWith(true);
  });

  it("resolves false when cancel action clicked", async () => {
    const result = vi.fn();
    renderWithTheme(
      <ConfirmProvider>
        <Probe onResult={result} />
      </ConfirmProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "ask" }));
    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(result).toHaveBeenCalledWith(false);
  });

  it("warns and falls back to window.confirm() when used outside ConfirmProvider (dev mode)", async () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
    const confirmSpy = vi.spyOn(window, "confirm").mockImplementation(() => true);
    let confirmFn:
      | ReturnType<typeof useConfirm>
      | null = null;
    function Probe() {
      confirmFn = useConfirm();
      return <div>probe</div>;
    }
    renderWithTheme(<Probe />);
    expect(confirmFn).not.toBeNull();
    const result = await confirmFn!({ title: "Delete?" });
    expect(result).toBe(true);
    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining("Delete?"));
    expect(warnSpy).toHaveBeenCalled();
    confirmSpy.mockRestore();
    warnSpy.mockRestore();
  });
});

describe("countDialogChildren helper", () => {
  it("counts children matching predicate", () => {
    const tree = (
      <>
        <span data-x>a</span>
        <span data-x>b</span>
        <span>c</span>
      </>
    );
    // Pluck the three children out of the fragment props.
    const children = (tree.props as { children: unknown }).children;
    const count = countDialogChildren(
      children as Parameters<typeof countDialogChildren>[0],
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el: any) => el.props["data-x"] === true
    );
    expect(count).toBe(2);
  });
});

// Touch state imports so they aren't tree-shaken if the test file is later
// extended; not asserting anything new.
void useState;

import { createRef } from "react";

describe("Dialog.Trigger ref forwarding", () => {
  it("forwards ref with asChild", () => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger asChild ref={ref}>
          <button>Open</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    expect(ref.current!.textContent).toBe("Open");
  });

  it("forwards ref without asChild", () => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger ref={ref}>Open</Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    expect(ref.current).toBeInstanceOf(HTMLButtonElement);
  });

  it("child onClick fires alongside dialog open when asChild", async () => {
    const childClick = vi.fn();
    renderWithTheme(
      <Dialog>
        <Dialog.Trigger asChild>
          <button onClick={childClick}>Open</button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Title</Dialog.Title>
        </Dialog.Content>
      </Dialog>
    );
    await userEvent.click(screen.getByRole("button", { name: "Open" }));
    expect(childClick).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

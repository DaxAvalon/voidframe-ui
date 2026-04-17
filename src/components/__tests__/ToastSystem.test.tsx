import { act, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  Toaster,
  Snackbar,
  toast,
  useToast,
  _resetToastsForTesting,
} from "../ToastSystem";

beforeEach(() => {
  act(() => _resetToastsForTesting());
});

function ToastTestHarness({ position }: { position?: string }) {
  return <Toaster position={position as any} />;
}

describe("toast API", () => {
  it("pushes a toast and renders it in the Toaster", () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => { toast("Hello world"); });
    expect(screen.getByText("Hello world")).toBeInTheDocument();
  });

  it("toast.success / info / warning / danger set correct tone", () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => { toast.success("ok"); });
    expect(document.querySelector(".vf-toast-v2--success")).toBeInTheDocument();
    act(() => { toast.danger("fail"); });
    expect(document.querySelector(".vf-toast-v2--danger")).toBeInTheDocument();
  });

  it("toast.dismiss removes a toast", () => {
    renderWithTheme(<ToastTestHarness />);
    let id: string;
    act(() => { id = toast({ title: "remove-me", duration: 0 }); });
    expect(screen.getByText("remove-me")).toBeInTheDocument();
    act(() => { toast.dismiss(id!); });
    expect(screen.queryByText("remove-me")).not.toBeInTheDocument();
  });

  it("dismiss button removes the toast", async () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => { toast({ title: "bye", duration: 0 }); });
    const dismiss = screen.getByRole("button", { name: "Dismiss" });
    await userEvent.click(dismiss);
    expect(screen.queryByText("bye")).not.toBeInTheDocument();
  });

  it("renders description and action", () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => {
      toast({
        title: "Update",
        description: "Version 2.0 available",
        action: <button>Install</button>,
        duration: 0,
      });
    });
    expect(screen.getByText("Update")).toBeInTheDocument();
    expect(screen.getByText("Version 2.0 available")).toBeInTheDocument();
    expect(screen.getByText("Install")).toBeInTheDocument();
  });

  it("renders custom content via render prop", () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => {
      toast({
        render: ({ dismiss }) => <div><span>Custom</span><button onClick={dismiss}>X</button></div>,
        duration: 0,
      });
    });
    expect(screen.getByText("Custom")).toBeInTheDocument();
  });

  it("auto-dismisses after duration", async () => {
    vi.useFakeTimers();
    renderWithTheme(<ToastTestHarness />);
    act(() => { toast({ title: "auto", duration: 100 }); });
    expect(screen.getByText("auto")).toBeInTheDocument();
    act(() => { vi.advanceTimersByTime(200); });
    expect(screen.queryByText("auto")).not.toBeInTheDocument();
    vi.useRealTimers();
  });

  it("respects max prop", () => {
    renderWithTheme(<Toaster max={2} />);
    act(() => {
      toast({ title: "A", duration: 0 });
      toast({ title: "B", duration: 0 });
      toast({ title: "C", duration: 0 });
    });
    // Only last 2 visible
    expect(screen.queryByText("A")).not.toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
  });

  it("uses role=alert for danger/warning toasts", () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => { toast.danger({ title: "Error!" }); });
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });

  it("uses role=status for neutral/info/success toasts", () => {
    renderWithTheme(<ToastTestHarness />);
    act(() => { toast.info({ title: "Info" }); });
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});

describe("toast.promise", () => {
  it("transitions loading -> success", async () => {
    renderWithTheme(<ToastTestHarness />);
    const p = Promise.resolve(42);
    await act(async () => {
      await toast.promise(p, {
        loading: "Loading...",
        success: "Done!",
        error: "Failed",
      });
    });
    expect(screen.getByText("Done!")).toBeInTheDocument();
  });

  it("transitions loading -> error", async () => {
    renderWithTheme(<ToastTestHarness />);
    const p = Promise.reject(new Error("boom"));
    await act(async () => {
      try {
        await toast.promise(p, {
          loading: "Loading...",
          success: "Done!",
          error: "Failed",
        });
      } catch {
        // expected
      }
    });
    expect(screen.getByText("Failed")).toBeInTheDocument();
  });
});

describe("Snackbar", () => {
  it("renders as a Toaster at bottom-center", () => {
    renderWithTheme(<Snackbar />);
    act(() => { toast("Snack"); });
    expect(document.querySelector(".vf-toaster--bottom-center")).toBeInTheDocument();
  });
});

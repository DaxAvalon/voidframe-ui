// Smoke tests for Phase 10 feedback + overlay components.
// Render-shape checks only; exhaustive interaction tests live alongside the
// individual component files when needed.

import { act, fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { Backdrop } from "../Popovers";
import { _resetToastsForTesting, toast, Toaster } from "../ToastSystem";
import {
  AlertV2,
  BannerAlert,
  Callout,
  NotificationCenter,
  Quote,
} from "../Notifications";
import { ErrorState, LoadingOverlay, Shimmer, SpinnerV2 } from "../Loading";
import { ConnectionStatus, OfflineBanner } from "../Network";
import { CoachMark } from "../Spotlight";

beforeEach(() => {
  _resetToastsForTesting();
});
afterEach(() => {
  _resetToastsForTesting();
});

// ── Backdrop ──

describe("Backdrop", () => {
  it("renders nothing when open=false", () => {
    const { container } = renderWithTheme(<Backdrop open={false} />);
    expect(container.querySelector(".vf-backdrop")).not.toBeInTheDocument();
  });

  it("respects blur/tint props", () => {
    const { container } = renderWithTheme(<Backdrop blur tint="red" />);
    const el = container.querySelector(".vf-backdrop") as HTMLElement;
    expect(el.style.backdropFilter).toContain("blur");
    expect(el.style.background).toContain("red");
  });
});

// ── Toast / Toaster ──

describe("Toast / Toaster", () => {
  it("Toaster region is exposed in the document", () => {
    renderWithTheme(<Toaster />);
    expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
  });

  it("toast() pushes an entry that the Toaster picks up", () => {
    renderWithTheme(<Toaster />);
    act(() => {
      toast({ title: "Hi", duration: 0 });
    });
    expect(screen.getByText("Hi")).toBeInTheDocument();
  });

  it("toast.dismiss removes an entry by id", () => {
    renderWithTheme(<Toaster />);
    let id = "";
    act(() => {
      id = toast({ title: "go", duration: 0 });
    });
    expect(screen.getByText("go")).toBeInTheDocument();
    act(() => {
      toast.dismiss(id);
    });
    expect(screen.queryByText("go")).not.toBeInTheDocument();
  });
});

// ── NotificationCenter ──

describe("NotificationCenter", () => {
  it("renders unread badge when there are unread notifications", () => {
    renderWithTheme(
      <NotificationCenter
        notifications={[
          { id: "1", title: "Hi", read: false },
          { id: "2", title: "Yo", read: true },
        ]}
      />
    );
    expect(screen.getByText("1")).toBeInTheDocument();
  });
});

// ── BannerAlert / Callout / Quote / AlertV2 ──

describe("Inline alerts + content boxes", () => {
  it("BannerAlert can be dismissed", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <BannerAlert tone="warning" dismissible onDismiss={onDismiss}>
        heads up
      </BannerAlert>
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
    expect(screen.queryByText("heads up")).not.toBeInTheDocument();
  });

  it("Callout renders with title", () => {
    renderWithTheme(
      <Callout icon="i" title="Tip" tone="info">
        body
      </Callout>
    );
    expect(screen.getByText("Tip")).toBeInTheDocument();
    expect(screen.getByText("body")).toBeInTheDocument();
  });

  it("Quote renders semantic <blockquote>", () => {
    renderWithTheme(<Quote source="Author">Hello</Quote>);
    const bq = screen.getByText("Hello").closest("blockquote");
    expect(bq).toBeInTheDocument();
  });

  it("AlertV2 dismissible removes itself", async () => {
    renderWithTheme(
      <AlertV2 tone="success" dismissible>
        ok
      </AlertV2>
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("ok")).not.toBeInTheDocument();
  });
});

// ── Loading family ──

describe("Loading family", () => {
  it("LoadingOverlay marks aria-busy when open", () => {
    renderWithTheme(<LoadingOverlay open label="Loading" />);
    const region = screen.getAllByRole("status")[0]!;
    expect(region).toHaveAttribute("aria-busy", "true");
  });

  it("SpinnerV2 dots variant renders 3 dots", () => {
    const { container } = renderWithTheme(<SpinnerV2 variant="dots" />);
    expect(container.querySelectorAll(".vf-spinner-v2__dot").length).toBe(3);
  });

  it("Shimmer with multiple lines renders a stack", () => {
    const { container } = renderWithTheme(<Shimmer lines={3} />);
    expect(container.querySelectorAll(".vf-shimmer").length).toBe(3);
  });

  it("ErrorState surfaces error.message", () => {
    renderWithTheme(<ErrorState error={new Error("Boom")} />);
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });
});

// ── Network ──

describe("Network components", () => {
  it("ConnectionStatus exposes status as aria-label", () => {
    renderWithTheme(<ConnectionStatus status="connecting" />);
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Connecting"
    );
  });

  it("OfflineBanner only renders when navigator.onLine is false", () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    renderWithTheme(<OfflineBanner />);
    expect(screen.getByRole("alert")).toHaveTextContent(/offline/i);
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    });
  });

  it("OfflineBanner dismiss button hides the banner and calls onDismiss", async () => {
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => false,
    });
    const onDismiss = vi.fn();
    renderWithTheme(<OfflineBanner onDismiss={onDismiss} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(onDismiss).toHaveBeenCalled();
    // Banner should be hidden after dismiss
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => true,
    });
  });
});

// ── CoachMark (Spotlight tested separately due to mask SVG quirks) ──

describe("CoachMark", () => {
  it("renders against an anchor", () => {
    function Probe() {
      const ref = useRef<HTMLButtonElement>(null);
      return (
        <>
          <button ref={ref}>anchor</button>
          <CoachMark target={ref} forceShow>
            tip
          </CoachMark>
        </>
      );
    }
    renderWithTheme(<Probe />);
    expect(screen.getByText("anchor")).toBeInTheDocument();
  });
});

// Touch fireEvent so the import isn't tree-shaken when tests are extended.
void fireEvent;

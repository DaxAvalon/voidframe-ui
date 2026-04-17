import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { CopyButton } from "../CopyButton";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const writeTextMock = vi.fn<(text: string) => Promise<void>>();

beforeEach(() => {
  writeTextMock.mockReset().mockResolvedValue(undefined);
  Object.defineProperty(navigator, "clipboard", {
    value: { writeText: writeTextMock },
    writable: true,
    configurable: true,
  });
});

/** Click the button and flush all pending microtasks so the async
 *  clipboard handler resolves before assertions run. */
async function clickAndFlush(el: HTMLElement) {
  await act(async () => {
    fireEvent.click(el);
  });
}

describe("CopyButton", () => {
  it("renders button with copy icon and default label", () => {
    renderWithTheme(<CopyButton text="hello" />);
    const btn = screen.getByRole("button", { name: "Copy" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveTextContent("\u2398");
    expect(btn).toHaveTextContent("Copy");
  });

  it("renders custom label text", () => {
    renderWithTheme(<CopyButton text="hello" label="Copy URL" />);
    expect(
      screen.getByRole("button", { name: "Copy URL" })
    ).toBeInTheDocument();
  });

  it("copies text to clipboard on click", async () => {
    renderWithTheme(<CopyButton text="secret" />);
    await clickAndFlush(screen.getByRole("button", { name: "Copy" }));
    expect(writeTextMock).toHaveBeenCalledWith("secret");
  });

  it("shows copied state after click", async () => {
    renderWithTheme(<CopyButton text="x" />);
    await clickAndFlush(screen.getByRole("button", { name: "Copy" }));
    const btn = screen.getByRole("button", { name: "Copied" });
    expect(btn).toHaveTextContent("\u2713");
    expect(btn).toHaveClass("vf-copy-button--copied");
  });

  it("shows custom copiedLabel in copied state", async () => {
    renderWithTheme(<CopyButton text="x" copiedLabel="Done!" />);
    await clickAndFlush(screen.getByRole("button", { name: "Copy" }));
    expect(
      screen.getByRole("button", { name: "Done!" })
    ).toHaveTextContent("Done!");
  });

  it("returns to default state after copiedDuration", async () => {
    vi.useFakeTimers();
    renderWithTheme(<CopyButton text="x" copiedDuration={500} />);
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy" }));
    });
    expect(
      screen.getByRole("button", { name: "Copied" })
    ).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    vi.useRealTimers();
  });

  it("fires onCopy with text after success", async () => {
    const onCopy = vi.fn();
    renderWithTheme(<CopyButton text="payload" onCopy={onCopy} />);
    await clickAndFlush(screen.getByRole("button", { name: "Copy" }));
    expect(onCopy).toHaveBeenCalledWith("payload");
  });

  it("fires onError when clipboard write fails", async () => {
    const error = new Error("denied");
    writeTextMock.mockRejectedValueOnce(error);
    const onError = vi.fn();
    renderWithTheme(<CopyButton text="x" onError={onError} />);
    await clickAndFlush(screen.getByRole("button", { name: "Copy" }));
    expect(onError).toHaveBeenCalledWith(error);
  });

  it("disabled prevents copying", async () => {
    const onCopy = vi.fn();
    renderWithTheme(<CopyButton text="x" disabled onCopy={onCopy} />);
    await clickAndFlush(screen.getByRole("button", { name: "Copy" }));
    expect(writeTextMock).not.toHaveBeenCalled();
    expect(onCopy).not.toHaveBeenCalled();
  });

  it.each(["default", "ghost", "accent"] as const)(
    "renders variant=%s class",
    (variant) => {
      renderWithTheme(<CopyButton text="x" variant={variant} />);
      expect(screen.getByRole("button", { name: "Copy" })).toHaveClass(
        `vf-copy-button--${variant}`
      );
    }
  );

  it.each(["sm", "md", "lg"] as const)(
    "renders size=%s class",
    (size) => {
      renderWithTheme(<CopyButton text="x" size={size} />);
      expect(screen.getByRole("button", { name: "Copy" })).toHaveClass(
        `vf-copy-button--${size}`
      );
    }
  );

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<CopyButton text="hello" />);
    await expectNoA11yViolations(container);
  });
});

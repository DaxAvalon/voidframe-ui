import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { ErrorBoundary } from "../../primitives/ErrorBoundary";
import { DevErrorFallback } from "../ErrorBoundary";

function Boom({ when }: { when: boolean }) {
  if (when) throw new Error("kaboom");
  return <div data-testid="ok">ok</div>;
}

describe("ErrorBoundary + DevErrorFallback", () => {
  it("ErrorBoundary renders DevErrorFallback when child throws", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const { container } = renderWithTheme(
      <ErrorBoundary
        fallback={(err, reset) => (
          <DevErrorFallback error={err} reset={reset} />
        )}
      >
        <Boom when={true} />
      </ErrorBoundary>
    );
    expect(container.querySelector(".vf-error-boundary")).toBeTruthy();
    expect(container.textContent).toContain("kaboom");
    spy.mockRestore();
  });

  it("calls onError with the error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onError = vi.fn();
    renderWithTheme(
      <ErrorBoundary onError={onError} fallback={null}>
        <Boom when={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBeInstanceOf(Error);
    spy.mockRestore();
  });

  it("Reset button on DevErrorFallback invokes reset()", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();
    const { getByRole } = renderWithTheme(
      <DevErrorFallback error={new Error("fake")} reset={reset} />
    );
    fireEvent.click(getByRole("button", { name: /reset/i }));
    expect(reset).toHaveBeenCalledTimes(1);
    spy.mockRestore();
  });

  it("auto-resets when resetKeys change", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    function Harness() {
      const [k, setK] = useState(0);
      const [crash, setCrash] = useState(true);
      return (
        <div>
          <button
            type="button"
            data-testid="advance"
            onClick={() => {
              setCrash(false);
              setK(1);
            }}
          />
          <ErrorBoundary
            resetKeys={[k]}
            fallback={(err, reset) => (
              <DevErrorFallback error={err} reset={reset} />
            )}
          >
            <Boom when={crash} />
          </ErrorBoundary>
        </div>
      );
    }
    const { getByTestId, queryByTestId } = renderWithTheme(<Harness />);
    expect(queryByTestId("ok")).toBeNull();
    fireEvent.click(getByTestId("advance"));
    expect(getByTestId("ok")).toBeTruthy();
    spy.mockRestore();
  });

  it("renders error name and stack details", () => {
    const err = new Error("fake message");
    err.name = "MyError";
    const { container } = renderWithTheme(
      <DevErrorFallback error={err} reset={() => {}} />
    );
    expect(container.textContent).toContain("MyError");
    expect(container.textContent).toContain("fake message");
    expect(container.querySelector(".vf-error-boundary__details")).toBeTruthy();
  });
});

import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ErrorBoundary } from "../ErrorBoundary";

function Thrower({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) throw new Error("kaboom");
  return <div>ok</div>;
}

describe("ErrorBoundary", () => {
  let errSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    // React logs caught errors to console.error — silence for clean output.
    errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    errSpy.mockRestore();
  });

  it("renders children normally when no error", () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>
    );
    expect(screen.getByText("ok")).toBeInTheDocument();
  });

  it("renders the fallback node when a child throws", () => {
    render(
      <ErrorBoundary fallback={<div>fallback</div>}>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(screen.getByText("fallback")).toBeInTheDocument();
  });

  it("invokes onError with the error", () => {
    const onError = vi.fn();
    render(
      <ErrorBoundary onError={onError}>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    );
    expect(onError).toHaveBeenCalledTimes(1);
    expect(onError.mock.calls[0]![0]).toBeInstanceOf(Error);
  });

  it("supports functional fallback with reset", () => {
    function App() {
      const [key, setKey] = useState(0);
      return (
        <ErrorBoundary
          key={key}
          fallback={(error, reset) => (
            <div>
              <span>err: {error.message}</span>
              <button
                onClick={() => {
                  reset();
                  setKey(key + 1);
                }}
              >
                retry
              </button>
            </div>
          )}
        >
          <Thrower shouldThrow={key === 0} />
        </ErrorBoundary>
      );
    }
    render(<App />);
    expect(screen.getByText(/err: kaboom/)).toBeInTheDocument();
    fireEvent.click(screen.getByText("retry"));
    expect(screen.getByText("ok")).toBeInTheDocument();
  });
});

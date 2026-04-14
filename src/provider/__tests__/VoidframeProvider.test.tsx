import { describe, expect, it } from "vitest";
import { render, renderHook, screen } from "@testing-library/react";
import { VoidframeProvider, useTokens } from "../VoidframeProvider";
import { defaultTokens } from "../../tokens";

describe("VoidframeProvider", () => {
  it("renders children", () => {
    render(
      <VoidframeProvider>
        <div>hi</div>
      </VoidframeProvider>
    );
    expect(screen.getByText("hi")).toBeInTheDocument();
  });

  it("provides default tokens when no theme given", () => {
    const { result } = renderHook(() => useTokens(), {
      wrapper: ({ children }) => (
        <VoidframeProvider>{children}</VoidframeProvider>
      ),
    });
    expect(result.current.bg0).toBe(defaultTokens.bg0);
  });

  it("merges theme overrides", () => {
    const { result } = renderHook(() => useTokens(), {
      wrapper: ({ children }) => (
        <VoidframeProvider theme={{ green: "#86efac" }}>
          {children}
        </VoidframeProvider>
      ),
    });
    expect(result.current.green).toBe("#86efac");
    expect(result.current.bg0).toBe(defaultTokens.bg0);
  });
});

describe("useTokens (no provider)", () => {
  it("falls back to defaultTokens outside a provider", () => {
    const { result } = renderHook(() => useTokens());
    expect(result.current).toEqual(defaultTokens);
  });
});

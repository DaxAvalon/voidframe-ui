import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ThemeScope,
  ThemeSelector,
  VoidframeProvider,
  darkTheme,
  lightTheme,
  midnightTheme,
  useTokens,
  useThemeScope,
  useThemePersistence,
  tokensToCssVars,
} from "../../index";
import { renderWithTheme } from "../../../test/renderWithTheme";

function setMatchMedia(matches: Record<string, boolean>) {
  const listeners: Array<(e: MediaQueryListEvent) => void> = [];
  const impl = vi.fn((q: string) => {
    const match = matches[q] ?? false;
    return {
      matches: match,
      media: q,
      addEventListener: (_ev: string, cb: (e: MediaQueryListEvent) => void) =>
        listeners.push(cb),
      removeEventListener: (
        _ev: string,
        cb: (e: MediaQueryListEvent) => void
      ) => {
        const idx = listeners.indexOf(cb);
        if (idx >= 0) listeners.splice(idx, 1);
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });
  return { impl, listeners };
}

describe("VoidframeProvider — extended controls", () => {
  it("reflects density + contrast + direction + motion via data attrs", () => {
    const { container } = render(
      <VoidframeProvider
        density="compact"
        contrast="high"
        direction="rtl"
        reducedMotion="always"
      >
        <div />
      </VoidframeProvider>
    );
    const root = container.querySelector(".vf-root");
    expect(root).toHaveAttribute("data-vf-density", "compact");
    expect(root).toHaveAttribute("data-vf-contrast", "high");
    expect(root).toHaveAttribute("data-vf-motion", "always");
    expect(root).toHaveAttribute("dir", "rtl");
  });

  it("omits default-value data attrs so :root styles win", () => {
    const { container } = render(
      <VoidframeProvider>
        <div />
      </VoidframeProvider>
    );
    const root = container.querySelector(".vf-root");
    expect(root).not.toHaveAttribute("data-vf-density");
    expect(root).not.toHaveAttribute("data-vf-contrast");
    expect(root).not.toHaveAttribute("data-vf-motion");
  });

  it("resolves themeName='system' to the OS preference", () => {
    setMatchMedia({ "(prefers-color-scheme: light)": true });
    const { container } = render(
      <VoidframeProvider themeName="system">
        <div />
      </VoidframeProvider>
    );
    expect(container.querySelector(".vf-root")).toHaveAttribute(
      "data-vf-theme",
      "light"
    );
  });

  it("sets data-vf-theme to the named theme", () => {
    const { container } = render(
      <VoidframeProvider themeName="midnight">
        <div />
      </VoidframeProvider>
    );
    expect(container.querySelector(".vf-root")).toHaveAttribute(
      "data-vf-theme",
      "midnight"
    );
  });

  it("exposes resolved scope via useThemeScope", () => {
    const captured: Array<string | undefined> = [];
    function Probe() {
      const scope = useThemeScope();
      captured.push(scope?.themeName);
      return null;
    }
    render(
      <VoidframeProvider themeName="light" density="spacious">
        <Probe />
      </VoidframeProvider>
    );
    expect(captured[0]).toBe("light");
  });

  it("accepts a full token set via the `theme` prop and emits CSS vars", () => {
    const { container } = render(
      <VoidframeProvider theme={midnightTheme}>
        <div />
      </VoidframeProvider>
    );
    const root = container.querySelector(".vf-root") as HTMLElement;
    expect(root.style.getPropertyValue("--vf-bg-0")).toBe(
      midnightTheme.bg0
    );
  });

  it("accepts partial token overrides and merges over default", () => {
    const { container } = render(
      <VoidframeProvider theme={{ green: "#00ff00" }}>
        <div />
      </VoidframeProvider>
    );
    const root = container.querySelector(".vf-root") as HTMLElement;
    expect(root.style.getPropertyValue("--vf-green")).toBe("#00ff00");
  });
});

describe("ThemeScope", () => {
  it("re-emits CSS custom properties on its own wrapper", () => {
    const { container } = renderWithTheme(
      <ThemeScope theme={lightTheme}>
        <div>inner</div>
      </ThemeScope>
    );
    const scope = container.querySelector(".vf-theme-scope") as HTMLElement;
    expect(scope).toBeInTheDocument();
    expect(scope.style.getPropertyValue("--vf-bg-0")).toBe(lightTheme.bg0);
  });

  it("inline mode renders a span", () => {
    const { container } = renderWithTheme(
      <ThemeScope themeName="midnight" inline>
        inline
      </ThemeScope>
    );
    expect(container.querySelector("span.vf-theme-scope")).toBeInTheDocument();
  });

  it("provides the scoped tokens via useTokens", () => {
    let captured = "";
    function Probe() {
      captured = useTokens().bg0;
      return null;
    }
    renderWithTheme(
      <ThemeScope themeName="light">
        <Probe />
      </ThemeScope>
    );
    expect(captured).toBe(lightTheme.bg0);
  });
});

describe("tokensToCssVars", () => {
  it("converts numeric sizes to px", () => {
    const out = tokensToCssVars({ sp4: 8 }) as Record<string, string>;
    expect(out["--vf-sp-4"]).toBe("8px");
  });

  it("leaves colors as strings", () => {
    const out = tokensToCssVars({ green: "#4ade80" }) as Record<
      string,
      string
    >;
    expect(out["--vf-green"]).toBe("#4ade80");
  });

  it("leaves line-height unitless", () => {
    const out = tokensToCssVars({ lineHeight: 1.6 }) as Record<string, number>;
    expect(out["--vf-line-height"]).toBe(1.6);
  });
});

describe("useThemePersistence", () => {
  it("reads and writes through injected storage", () => {
    const store = new Map<string, string>();
    const storage = {
      get: (k: string) => store.get(k) ?? null,
      set: (k: string, v: string) => {
        store.set(k, v);
      },
      remove: (k: string) => {
        store.delete(k);
      },
    };
    const { result } = renderHook(() =>
      useThemePersistence({ storage, defaultTheme: "dark" })
    );
    expect(result.current.theme).toBe("dark");
    act(() => result.current.setTheme("light"));
    expect(result.current.theme).toBe("light");
    expect(store.get("voidframe-theme")).toBe("light");
    act(() => result.current.clearTheme());
    expect(result.current.theme).toBe("dark");
    expect(store.has("voidframe-theme")).toBe(false);
  });

  it("honors the allowed list", () => {
    const store = new Map<string, string>([
      ["voidframe-theme", "bogus"],
    ]);
    const storage = {
      get: (k: string) => store.get(k) ?? null,
      set: (k: string, v: string) => {
        store.set(k, v);
      },
      remove: (k: string) => {
        store.delete(k);
      },
    };
    const { result } = renderHook(() =>
      useThemePersistence<"dark" | "light" | "system">({
        storage,
        defaultTheme: "system",
        allowed: ["dark", "light", "system"] as const,
      })
    );
    expect(result.current.theme).toBe("system");
  });
});

describe("ThemeSelector", () => {
  it("emits onChange for segmented variant", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ThemeSelector
        onValueChange={onChange}
        themes={[
          { id: "dark", label: "Dark" },
          { id: "light", label: "Light" },
          { id: "system", label: "Auto" },
        ]}
        defaultValue="dark"
      />
    );
    await userEvent.click(screen.getByRole("radio", { name: /Light/ }));
    expect(onChange).toHaveBeenCalledWith("light");
  });

  it("renders dropdown variant when requested", () => {
    renderWithTheme(
      <ThemeSelector
        kind="dropdown"
        defaultValue="dark"
        themes={[
          { id: "dark", label: "Dark" },
          { id: "light", label: "Light" },
        ]}
      />
    );
    expect(screen.getByRole("combobox", { name: /Theme/ })).toBeInTheDocument();
  });
});

describe("Built-in themes", () => {
  it("exposes dark/light/midnight token sets", () => {
    expect(darkTheme.bg0).toMatch(/^#/);
    expect(lightTheme.bg0).toMatch(/^#/);
    expect(midnightTheme.bg0).toBe("#000000");
  });

  it("tokens include semantic aliases", () => {
    expect(darkTheme.success).toBe(darkTheme.green);
    expect(midnightTheme.info).toBe(midnightTheme.blue);
  });
});

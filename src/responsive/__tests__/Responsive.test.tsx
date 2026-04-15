import { describe, expect, it, vi } from "vitest";
import { screen, act } from "@testing-library/react";
import {
  BREAKPOINTS,
  Hide,
  ResponsiveBox,
  Show,
  isResponsiveObject,
  normalizeResponsive,
  pickResponsive,
  useBreakpoint,
  useDeviceType,
  useResponsive,
} from "../index";
import { renderWithTheme } from "../../../test/renderWithTheme";

interface FakeMql {
  matches: boolean;
  media: string;
  listeners: Array<(e: MediaQueryListEvent) => void>;
}

function installMatchMedia(initialWidth: number) {
  const entries = new Map<string, FakeMql>();
  const objects = new Map<string, MediaQueryList>();
  let width = initialWidth;
  const recomputeMatches = () => {
    for (const [query, entry] of entries.entries()) {
      const parsed = query.match(/min-width:\s*(\d+)px/);
      const minPx = parsed ? parseFloat(parsed[1]!) : 0;
      entry.matches = width >= minPx;
      const obj = objects.get(query) as
        | (MediaQueryList & { matches: boolean })
        | undefined;
      if (obj) (obj as { matches: boolean }).matches = entry.matches;
    }
  };
  const impl = vi.fn((query: string) => {
    const existing = objects.get(query);
    if (existing) return existing;
    const parsed = query.match(/min-width:\s*(\d+)px/);
    const minPx = parsed ? parseFloat(parsed[1]!) : 0;
    const entry: FakeMql = {
      matches: width >= minPx,
      media: query,
      listeners: [],
    };
    entries.set(query, entry);
    const obj = {
      matches: entry.matches,
      media: query,
      addEventListener: (_ev: string, cb: (e: MediaQueryListEvent) => void) =>
        entry.listeners.push(cb),
      removeEventListener: (
        _ev: string,
        cb: (e: MediaQueryListEvent) => void
      ) => {
        const idx = entry.listeners.indexOf(cb);
        if (idx >= 0) entry.listeners.splice(idx, 1);
      },
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
    objects.set(query, obj);
    return obj;
  });
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    writable: true,
    value: impl,
  });
  return {
    setWidth(next: number) {
      width = next;
      const prev = new Map(
        [...entries.entries()].map(([k, v]) => [k, v.matches])
      );
      recomputeMatches();
      for (const [query, entry] of entries.entries()) {
        if (prev.get(query) !== entry.matches) {
          entry.listeners.forEach((cb) =>
            cb({ matches: entry.matches, media: query } as MediaQueryListEvent)
          );
        }
      }
    },
  };
}

describe("Responsive helpers", () => {
  it("detects a responsive object literal", () => {
    expect(isResponsiveObject({ base: 1, md: 2 })).toBe(true);
    expect(isResponsiveObject(1)).toBe(false);
    expect(isResponsiveObject("x")).toBe(false);
    expect(isResponsiveObject({ foo: 1 } as never)).toBe(false);
  });

  it("picks the closest active-or-lower value", () => {
    expect(pickResponsive({ base: 1, md: 2, xl: 4 }, "base")).toBe(1);
    expect(pickResponsive({ base: 1, md: 2, xl: 4 }, "md")).toBe(2);
    expect(pickResponsive({ base: 1, md: 2, xl: 4 }, "lg")).toBe(2);
    expect(pickResponsive({ base: 1, md: 2, xl: 4 }, "xxl")).toBe(4);
    expect(pickResponsive(7, "md")).toBe(7);
  });

  it("normalizes to a sparse ladder", () => {
    const n = normalizeResponsive({ base: 1, lg: 3 });
    expect(n.base).toBe(1);
    expect(n.md).toBeUndefined();
    expect(n.lg).toBe(3);
  });
});

describe("useBreakpoint + useResponsive + useDeviceType", () => {
  it("reports 'base' below sm", () => {
    installMatchMedia(320);
    let captured = "";
    let device = "";
    function Probe() {
      captured = useBreakpoint();
      device = useDeviceType();
      return null;
    }
    renderWithTheme(<Probe />);
    expect(captured).toBe("base");
    expect(device).toBe("mobile");
  });

  it("resolves to lg on a 1024px viewport", () => {
    installMatchMedia(BREAKPOINTS.lg + 50);
    let bp = "";
    let device = "";
    function Probe() {
      bp = useBreakpoint();
      device = useDeviceType();
      return null;
    }
    renderWithTheme(<Probe />);
    expect(bp).toBe("lg");
    expect(device).toBe("desktop");
  });

  it("useResponsive picks the right ladder step", () => {
    installMatchMedia(BREAKPOINTS.md);
    let resolved: unknown = null;
    function Probe() {
      resolved = useResponsive({ base: "sm", md: "md", lg: "lg" });
      return null;
    }
    renderWithTheme(<Probe />);
    expect(resolved).toBe("md");
  });

  it("updates when the viewport changes", () => {
    const ctl = installMatchMedia(320);
    let bp = "";
    function Probe() {
      bp = useBreakpoint();
      return null;
    }
    renderWithTheme(<Probe />);
    expect(bp).toBe("base");
    act(() => ctl.setWidth(1100));
    expect(bp).toBe("lg");
  });
});

describe("Show / Hide", () => {
  it("applies the expected CSS class per variant", () => {
    const { container } = renderWithTheme(
      <>
        <Show above="md">desktop</Show>
        <Hide below="md">hide mobile</Hide>
        <Show between={["sm", "lg"]}>tablet band</Show>
      </>
    );
    expect(container.querySelector(".vf-show--above-md")).toBeInTheDocument();
    expect(container.querySelector(".vf-hide--below-md")).toBeInTheDocument();
    expect(
      container.querySelector(".vf-show--between-sm-lg")
    ).toBeInTheDocument();
  });

  it("renders children directly (display: contents wrapper)", () => {
    renderWithTheme(
      <Show above="md">
        <span>desktop content</span>
      </Show>
    );
    expect(screen.getByText("desktop content")).toBeInTheDocument();
  });
});

describe("ResponsiveBox", () => {
  it("resolves JS responsive props at the active breakpoint", () => {
    installMatchMedia(BREAKPOINTS.lg);
    const { container } = renderWithTheme(
      <ResponsiveBox
        display="grid"
        columns={{ base: 1, md: 2, lg: 4 }}
        gap={{ base: 4, lg: 12 }}
        p={{ base: 8, md: 16 }}
      >
        <div>one</div>
        <div>two</div>
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.display).toBe("grid");
    expect(box.style.gridTemplateColumns).toContain("repeat(4");
    expect(box.style.gap).toBe("12px");
    expect(box.style.padding).toBe("16px");
  });

  it("accepts a plain value alongside responsive ones", () => {
    installMatchMedia(320);
    const { container } = renderWithTheme(
      <ResponsiveBox display="flex" direction="column" gap={8}>
        x
      </ResponsiveBox>
    );
    const box = container.querySelector(".vf-responsive-box") as HTMLElement;
    expect(box.style.display).toBe("flex");
    expect(box.style.flexDirection).toBe("column");
    expect(box.style.gap).toBe("8px");
  });
});

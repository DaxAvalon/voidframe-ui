import { describe, expect, it, beforeEach } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  ProfilerScope,
  useRenderProfiler,
  getProfilerStore,
} from "../index";

function HookHarness({ id }: { id: string }) {
  const stats = useRenderProfiler(id);
  return <span data-testid="renders">{stats.renderCount}</span>;
}

describe("useRenderProfiler / ProfilerScope", () => {
  beforeEach(() => {
    getProfilerStore().clear();
  });

  it("records a mount render in the store", () => {
    renderWithTheme(
      <ProfilerScope id="alpha">
        <div>alpha</div>
      </ProfilerScope>
    );
    const stats = getProfilerStore().get("alpha");
    expect(stats).toBeDefined();
    expect(stats!.renderCount).toBeGreaterThan(0);
  });

  it("hook returns empty snapshot for unknown ids", () => {
    const { getByTestId } = renderWithTheme(<HookHarness id="never" />);
    expect(Number(getByTestId("renders").textContent)).toBe(0);
  });

  it("hook returns current store snapshot when called after scope mounts", () => {
    // Pre-populate the store so the harness reads it on its first render.
    getProfilerStore().clear();
    renderWithTheme(
      <ProfilerScope id="beta">
        <div>beta</div>
      </ProfilerScope>
    );
    const before = getProfilerStore().get("beta")?.renderCount ?? 0;
    const { getByTestId } = renderWithTheme(<HookHarness id="beta" />);
    expect(Number(getByTestId("renders").textContent)).toBe(before);
  });

  it("renders children unchanged when disabled", () => {
    const { getByTestId } = renderWithTheme(
      <ProfilerScope id="disabled-scope" enabled={false}>
        <span data-testid="child">hi</span>
      </ProfilerScope>
    );
    expect(getByTestId("child").textContent).toBe("hi");
    expect(getProfilerStore().get("disabled-scope")).toBeUndefined();
  });
});

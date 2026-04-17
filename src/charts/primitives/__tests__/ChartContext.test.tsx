import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../../test/renderWithTheme";
import { useChart, useOptionalChart, ChartContext, DEFAULT_MARGINS } from "../ChartContext";

function ProbeRequired({ onCtx }: { onCtx: (ctx: ReturnType<typeof useChart>) => void }) {
  const ctx = useChart();
  onCtx(ctx);
  return null;
}

function ProbeOptional({
  onCtx,
}: {
  onCtx: (ctx: ReturnType<typeof useOptionalChart>) => void;
}) {
  const ctx = useOptionalChart();
  onCtx(ctx);
  return null;
}

describe("ChartContext", () => {
  it("useChart throws when used outside ChartFrame", () => {
    expect(() =>
      renderWithTheme(<ProbeRequired onCtx={() => {}} />)
    ).toThrow("Chart primitives must be rendered inside a <ChartFrame>.");
  });

  it("useOptionalChart returns null when used outside ChartFrame", () => {
    let captured: ReturnType<typeof useOptionalChart> = {} as never;
    renderWithTheme(<ProbeOptional onCtx={(ctx) => (captured = ctx)} />);
    expect(captured).toBeNull();
  });

  it("useOptionalChart returns context when inside provider", () => {
    let captured: ReturnType<typeof useOptionalChart> = null;
    const value = {
      width: 400,
      height: 200,
      innerWidth: 340,
      innerHeight: 156,
      margins: DEFAULT_MARGINS,
    };
    renderWithTheme(
      <ChartContext.Provider value={value}>
        <ProbeOptional onCtx={(ctx) => (captured = ctx)} />
      </ChartContext.Provider>
    );
    expect(captured).not.toBeNull();
    expect(captured!.width).toBe(400);
  });

  it("DEFAULT_MARGINS has expected structure", () => {
    expect(DEFAULT_MARGINS).toEqual({
      top: 12,
      right: 16,
      bottom: 32,
      left: 44,
    });
  });
});

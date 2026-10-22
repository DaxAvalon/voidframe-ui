// One Tooltip: the portaled overlay is what every entry exports under the
// plain name; the former inline variant survives only as InlineTooltip.
import { act, fireEvent, screen } from "@testing-library/react";
import { createRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import * as root from "../../index";
import * as data from "../../subpaths/data";
import * as overlays from "../../subpaths/overlays";
import { Tooltip } from "../Popovers";

describe("Tooltip exports", () => {
  it("is the same component from the root, data and overlays entries", () => {
    expect(root.Tooltip).toBe(Tooltip);
    expect(data.Tooltip).toBe(Tooltip);
    expect(overlays.Tooltip).toBe(Tooltip);
    expect(root.TooltipV2).toBe(Tooltip);
    expect(root.InlineTooltip).toBeDefined();
    expect(root.InlineTooltip).not.toBe(Tooltip);
  });
});

describe("Tooltip behaviour", () => {
  it("portals the bubble and accepts the legacy position alias", async () => {
    vi.useFakeTimers();
    const { container } = renderWithTheme(
      <div style={{ overflow: "hidden" }}>
        <Tooltip content="tip" position="bottom" openDelay={0}>
          <button>hover</button>
        </Tooltip>
      </div>
    );
    fireEvent.mouseEnter(screen.getByRole("button"));
    act(() => {
      vi.runAllTimers();
    });
    const bubble = document.body.querySelector('[role="tooltip"]')!;
    expect(bubble).not.toBeNull();
    expect(container.contains(bubble)).toBe(false); // outside the clipping ancestor
    expect(bubble.className).toContain("vf-tooltip-v2");
    vi.useRealTimers();
  });

  it("wraps a non-element child in an anchor span instead of throwing", () => {
    renderWithTheme(<Tooltip content="tip">plain text</Tooltip>);
    const anchor = screen.getByText("plain text");
    expect(anchor.tagName).toBe("SPAN");
    expect(anchor.className).toContain("vf-tooltip__anchor");
  });

  it("supports controlled open and bubble className/style", () => {
    const onOpenChange = vi.fn();
    renderWithTheme(
      <Tooltip content="tip" open onOpenChange={onOpenChange} className="my-tip" style={{ maxWidth: 100 }}>
        <button>t</button>
      </Tooltip>
    );
    const bubble = document.body.querySelector('[role="tooltip"]') as HTMLElement;
    expect(bubble).toHaveClass("my-tip");
    expect(bubble.style.maxWidth).toBe("100px");
    expect(screen.getByRole("button")).toHaveAttribute("aria-describedby", bubble.id);
  });

  it("forwards its ref to the trigger element", () => {
    const ref = createRef<HTMLElement>();
    renderWithTheme(
      <Tooltip content="tip" ref={ref}>
        <button>t</button>
      </Tooltip>
    );
    expect(ref.current?.tagName).toBe("BUTTON");
  });
});

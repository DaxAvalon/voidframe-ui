import { afterEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockCodeEditor, MockPopoverV2, MockTooltip, mockMermaidLoader } from "../mocks";
import { installResizeObserver, setupVoidframeTestEnv } from "../env";
import { Mermaid } from "../../components/RichEmbed";

describe("interactive editor mocks", () => {
  it("MockCodeEditor is a textarea that forwards onValueChange, placeholder and aria-label", async () => {
    const onValueChange = vi.fn();
    render(<MockCodeEditor value="" onValueChange={onValueChange} placeholder="Paste JSON" aria-label="Config" language="json" />);
    const input = screen.getByRole("textbox", { name: "Config" });
    expect(input).toHaveAttribute("placeholder", "Paste JSON");
    expect(screen.getByTestId("vf-mock-codeeditor")).toHaveAttribute("data-language", "json");
    await userEvent.type(input, "{{");
    expect(onValueChange).toHaveBeenCalledWith("{");
    const un = render(<MockCodeEditor defaultValue="x" onValueChange={onValueChange} />);
    const box = within(un.container).getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(box, { target: { value: "xy" } });
    expect(box.value).toBe("xy");
  });

  it("MockTooltip and MockPopoverV2 render content inline", () => {
    render(
      <>
        <MockTooltip content="Help text">
          <button type="button">Trigger</button>
        </MockTooltip>
        <MockPopoverV2>
          <MockPopoverV2.Trigger>
            <button type="button">Open</button>
          </MockPopoverV2.Trigger>
          <MockPopoverV2.Content>Popover body</MockPopoverV2.Content>
        </MockPopoverV2>
      </>
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Help text");
    expect(screen.getByRole("dialog")).toHaveTextContent("Popover body");
  });
});

describe("mockMermaidLoader", () => {
  it("records initialize and render calls and feeds Mermaid", async () => {
    const mock = mockMermaidLoader({ svg: "<svg><text>diagram</text></svg>" });
    render(<Mermaid chart="graph TD; A-->B;" loader={mock.loader} theme="dark" />);
    await waitFor(() => expect(mock.renderCalls).toHaveLength(1));
    expect(mock.renderCalls[0]!.src).toBe("graph TD; A-->B;");
    expect(mock.initializeCalls[0]).toMatchObject({ theme: "dark" });
    const failing = mockMermaidLoader({ error: new Error("bad chart") });
    render(<Mermaid chart="nope" loader={failing.loader} />);
    await waitFor(() => expect(screen.getByText(/bad chart/)).toBeInTheDocument());
  });
});

describe("environment installers", () => {
  const originalRO = (globalThis as { ResizeObserver?: unknown }).ResizeObserver;
  afterEach(() => {
    (globalThis as { ResizeObserver?: unknown }).ResizeObserver = originalRO;
  });

  it("installResizeObserver records targets and triggers callbacks", () => {
    const ctl = installResizeObserver({ force: true });
    const cb = vi.fn();
    const el = document.createElement("div");
    const ro = new ResizeObserver(cb);
    ro.observe(el);
    expect(ctl.observed()).toEqual([el]);
    ctl.trigger();
    expect(cb).toHaveBeenCalledWith([expect.objectContaining({ target: el })], ro);
    ro.disconnect();
    expect(ctl.observed()).toEqual([]);
    ctl.restore();
    expect((globalThis as { ResizeObserver?: unknown }).ResizeObserver).toBe(originalRO);
  });

  it("setupVoidframeTestEnv installs everything and restores", () => {
    const hadIO = typeof (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver;
    const env = setupVoidframeTestEnv({ width: 390, forceResizeObserver: true });
    expect(window.matchMedia("(min-width: 768px)").matches).toBe(false);
    env.matchMedia.setWidth(1200);
    expect(window.matchMedia("(min-width: 768px)").matches).toBe(true);
    expect(typeof ResizeObserver).toBe("function");
    expect(typeof IntersectionObserver).toBe("function");
    expect(typeof Element.prototype.scrollIntoView).toBe("function");
    env.restore();
    expect(typeof (globalThis as { IntersectionObserver?: unknown }).IntersectionObserver).toBe(hadIO);
  });
});

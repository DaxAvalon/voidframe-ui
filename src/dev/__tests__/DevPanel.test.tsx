import { describe, expect, it, beforeEach, vi } from "vitest";
import { act, fireEvent } from "@testing-library/react";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { DevPanel, ProfilerScope, getProfilerStore } from "../index";
import { _resetWarnings, warn, warnOnce } from "../../utils/warn";

describe("DevPanel", () => {
  beforeEach(() => {
    _resetWarnings();
    getProfilerStore().clear();
  });

  it("renders title and all four tabs", () => {
    const { container } = renderWithTheme(<DevPanel />);
    const tabs = container.querySelectorAll(".vf-dev-panel__tab");
    expect(tabs.length).toBe(4);
    expect(container.querySelector(".vf-dev-panel__title")).toBeTruthy();
  });

  it("applies position modifier class", () => {
    const { container } = renderWithTheme(<DevPanel position="tl" />);
    expect(container.querySelector(".vf-dev-panel--tl")).toBeTruthy();
  });

  it("collapses and expands", () => {
    const { container } = renderWithTheme(<DevPanel />);
    const toggle = container.querySelector(
      ".vf-dev-panel__toggle"
    ) as HTMLButtonElement;
    expect(container.querySelector(".vf-dev-panel--collapsed")).toBeNull();
    fireEvent.click(toggle);
    expect(container.querySelector(".vf-dev-panel--collapsed")).toBeTruthy();
    fireEvent.click(toggle);
    expect(container.querySelector(".vf-dev-panel--collapsed")).toBeNull();
  });

  it("switches between tabs", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="renders" />);
    const tabs = container.querySelectorAll(".vf-dev-panel__tab");
    fireEvent.click(tabs[1] as HTMLElement); // warnings
    expect(
      (tabs[1] as HTMLElement).getAttribute("aria-selected")
    ).toBe("true");
  });

  it("shows captured warnings on the Warnings tab", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warnOnce("devpanel-test", "devpanel-test: synthetic");
    const { container } = renderWithTheme(<DevPanel defaultTab="warnings" />);
    expect(container.textContent).toContain("devpanel-test: synthetic");
    spy.mockRestore();
  });

  it("lists profiler scopes on the Renders tab", () => {
    const { container } = renderWithTheme(
      <>
        <ProfilerScope id="panel-test">
          <div>child</div>
        </ProfilerScope>
        <DevPanel defaultTab="renders" />
      </>
    );
    expect(container.textContent).toContain("panel-test");
  });

  it("starts collapsed when defaultCollapsed is true", () => {
    const { container } = renderWithTheme(<DevPanel defaultCollapsed />);
    expect(container.querySelector(".vf-dev-panel--collapsed")).toBeTruthy();
    expect(container.querySelector(".vf-dev-panel__tabs")).toBeNull();
  });

  it("renders custom title", () => {
    const { container } = renderWithTheme(<DevPanel title="Custom" />);
    expect(container.textContent).toContain("Custom");
  });

  it("shows version on About tab", () => {
    const { container } = renderWithTheme(
      <DevPanel defaultTab="about" version="2.0.0" />
    );
    expect(container.textContent).toContain("2.0.0");
    expect(container.textContent).toContain("voidframe");
  });

  it("shows Theme tab with token info", () => {
    const { container } = renderWithTheme(<DevPanel defaultTab="theme" />);
    expect(container.textContent).toContain("tokens");
  });

  it("clears warnings via action button", () => {
    const spy = vi.spyOn(console, "warn").mockImplementation(() => {});
    warn(false, "clearable-warning");
    const { container } = renderWithTheme(<DevPanel defaultTab="warnings" />);
    expect(container.textContent).toContain("clearable-warning");
    const clearBtn = container.querySelector(
      ".vf-dev-panel__action"
    ) as HTMLButtonElement;
    act(() => {
      fireEvent.click(clearBtn);
    });
    expect(container.textContent).not.toContain("clearable-warning");
    spy.mockRestore();
  });
});

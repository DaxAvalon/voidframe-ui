import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  HelpTooltip,
  ContextHelp,
  Changelog,
  WhatsNewPopover,
} from "../HelpChangelog";

describe("HelpTooltip", () => {
  it("renders trigger button with ? icon", () => {
    renderWithTheme(<HelpTooltip content="Help text" />);
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("shows tooltip on hover", async () => {
    const { container } = renderWithTheme(
      <HelpTooltip content="Tooltip content" />
    );
    const wrapper = container.querySelector(".vf-help-tooltip")!;
    await userEvent.hover(wrapper);
    expect(container.querySelector(".vf-help-tooltip--open")).toBeInTheDocument();
  });

  it("applies placement class", () => {
    const { container } = renderWithTheme(
      <HelpTooltip content="x" placement="bottom" />
    );
    expect(container.querySelector(".vf-help-tooltip--bottom")).toBeInTheDocument();
  });
});

describe("ContextHelp", () => {
  it("renders when open", () => {
    renderWithTheme(<ContextHelp open>Help body</ContextHelp>);
    expect(screen.getByText("Help body")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("renders nothing when closed", () => {
    const { container } = renderWithTheme(
      <ContextHelp open={false}>Hidden</ContextHelp>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("fires onClose", async () => {
    const onClose = vi.fn();
    renderWithTheme(<ContextHelp onClose={onClose}>Body</ContextHelp>);
    await userEvent.click(screen.getByRole("button", { name: "Close help" }));
    expect(onClose).toHaveBeenCalled();
  });

  it("sets data-for attribute", () => {
    const { container } = renderWithTheme(
      <ContextHelp for="field-1">Body</ContextHelp>
    );
    expect(container.querySelector("[data-for='field-1']")).toBeInTheDocument();
  });
});

describe("Changelog", () => {
  const entries = [
    {
      version: "2.0.0",
      date: "2026-01-15",
      changes: [
        { kind: "added" as const, description: "New feature" },
        { kind: "fixed" as const, description: "Bug fix" },
      ],
    },
    {
      version: "1.0.0",
      changes: [{ description: "Initial release" }],
    },
  ];

  it("renders title and entries", () => {
    renderWithTheme(<Changelog entries={entries} />);
    expect(screen.getByText("Changelog")).toBeInTheDocument();
    expect(screen.getByText("2.0.0")).toBeInTheDocument();
  });

  it("shows changes for expanded entries", () => {
    renderWithTheme(<Changelog entries={entries} />);
    expect(screen.getByText("New feature")).toBeInTheDocument();
    expect(screen.getByText("Bug fix")).toBeInTheDocument();
  });

  it("toggles entries on click", async () => {
    renderWithTheme(<Changelog entries={entries} />);
    // Click the first entry to collapse it
    const buttons = screen.getAllByRole("button");
    await userEvent.click(buttons[0]!);
    expect(screen.queryByText("New feature")).not.toBeInTheDocument();
  });

  it("collapsed mode shows only first entry expanded", () => {
    renderWithTheme(<Changelog entries={entries} collapsed />);
    expect(screen.getByText("New feature")).toBeInTheDocument();
    expect(screen.queryByText("Initial release")).not.toBeInTheDocument();
  });

  it("renders date and kind badges", () => {
    renderWithTheme(<Changelog entries={entries} />);
    expect(screen.getByText("2026-01-15")).toBeInTheDocument();
    expect(screen.getByText("added")).toBeInTheDocument();
    expect(screen.getByText("fixed")).toBeInTheDocument();
  });
});

describe("WhatsNewPopover", () => {
  const features = [
    { title: "Dark mode", description: "New dark theme" },
    { title: "Search", icon: "S" },
  ];

  it("renders when open", () => {
    renderWithTheme(
      <WhatsNewPopover version="1.0" features={features} open />
    );
    expect(screen.getByText("Dark mode")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("v1.0")).toBeInTheDocument();
  });

  it("fires onDismiss on close", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <WhatsNewPopover version="1.0" features={features} open onDismiss={onDismiss} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("fires onDismiss via CTA button", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <WhatsNewPopover version="1.0" features={features} open onDismiss={onDismiss} />
    );
    await userEvent.click(screen.getByText("Got it"));
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders feature icon and description elements", () => {
    const { container } = renderWithTheme(
      <WhatsNewPopover
        version="2.0"
        features={[
          { title: "Feature A", icon: "X", description: "Desc A" },
        ]}
        open
      />
    );
    expect(container.querySelector(".vf-whats-new__feature-icon")).toBeInTheDocument();
    expect(screen.getByText("Desc A")).toBeInTheDocument();
    expect(container.querySelector(".vf-whats-new__feature-desc")).toBeInTheDocument();
  });
});

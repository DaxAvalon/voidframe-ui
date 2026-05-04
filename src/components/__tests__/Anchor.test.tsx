import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Anchor, type AnchorItem } from "../Anchor";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

const items: AnchorItem[] = [
  { key: "intro", label: "Introduction", href: "#intro" },
  { key: "install", label: "Installation", href: "#install" },
  { key: "usage", label: "Usage", href: "#usage" },
];

const nestedItems: AnchorItem[] = [
  {
    key: "getting-started",
    label: "Getting Started",
    href: "#getting-started",
    children: [
      { key: "prereqs", label: "Prerequisites", href: "#prereqs" },
      { key: "setup", label: "Setup", href: "#setup" },
    ],
  },
  { key: "api", label: "API Reference", href: "#api" },
];

describe("Anchor", () => {
  it("renders all items as links", () => {
    renderWithTheme(<Anchor items={items} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveTextContent("Introduction");
    expect(links[1]).toHaveTextContent("Installation");
    expect(links[2]).toHaveTextContent("Usage");
  });

  it("items have correct href attributes", () => {
    renderWithTheme(<Anchor items={items} />);
    const links = screen.getAllByRole("link");
    expect(links[0]).toHaveAttribute("href", "#intro");
    expect(links[1]).toHaveAttribute("href", "#install");
    expect(links[2]).toHaveAttribute("href", "#usage");
  });

  it("nested items render indented", () => {
    renderWithTheme(<Anchor items={nestedItems} />);
    const nestedLis = document.querySelectorAll(".vf-anchor__item--nested");
    expect(nestedLis.length).toBe(2); // prereqs + setup
  });

  it("click on item fires onActiveChange with key", async () => {
    const onActiveChange = vi.fn();
    renderWithTheme(
      <Anchor items={items} onActiveChange={onActiveChange} />,
    );
    await userEvent.click(screen.getByText("Installation"));
    expect(onActiveChange).toHaveBeenCalledWith("install");
  });

  it("controlled: activeKey determines which item has active class", () => {
    renderWithTheme(<Anchor items={items} activeKey="usage" />);
    const usageLink = screen.getByText("Usage");
    expect(usageLink).toHaveClass("vf-anchor__link--active");
    const introLink = screen.getByText("Introduction");
    expect(introLink).not.toHaveClass("vf-anchor__link--active");
  });

  it("uncontrolled: defaultActiveKey sets initial active", () => {
    renderWithTheme(<Anchor items={items} defaultActiveKey="install" />);
    const installLink = screen.getByText("Installation");
    expect(installLink).toHaveClass("vf-anchor__link--active");
  });

  it.each(["line", "dot", "none"] as const)(
    'indicator="%s" applies correct class',
    (variant) => {
      renderWithTheme(
        <Anchor items={items} activeKey="intro" indicator={variant} />,
      );
      const nav = screen.getByRole("navigation");
      expect(nav).toHaveClass(`vf-anchor--indicator-${variant}`);
      if (variant === "none") {
        expect(
          document.querySelector(".vf-anchor__indicator"),
        ).not.toBeInTheDocument();
      } else {
        expect(
          document.querySelector(`.vf-anchor__indicator--${variant}`),
        ).toBeInTheDocument();
      }
    },
  );

  it('orientation="horizontal" renders horizontal layout', () => {
    renderWithTheme(<Anchor items={items} orientation="horizontal" />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("vf-anchor--horizontal");
  });

  it("affix={true} applies affix CSS class", () => {
    renderWithTheme(<Anchor items={items} affix />);
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveClass("vf-anchor--affix");
  });

  it("renders nested structure correctly (2 levels)", () => {
    renderWithTheme(<Anchor items={nestedItems} />);
    const links = screen.getAllByRole("link");
    // 3 top-level + nested: getting-started, prereqs, setup, api
    expect(links).toHaveLength(4);
    expect(links[0]).toHaveTextContent("Getting Started");
    expect(links[1]).toHaveTextContent("Prerequisites");
    expect(links[2]).toHaveTextContent("Setup");
    expect(links[3]).toHaveTextContent("API Reference");
  });

  it("empty items array renders nav with empty list", () => {
    renderWithTheme(<Anchor items={[]} />);
    const nav = screen.getByRole("navigation");
    expect(nav).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    const list = nav.querySelector(".vf-anchor__list");
    expect(list).toBeInTheDocument();
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <Anchor items={items} activeKey="intro" />,
    );
    await expectNoA11yViolations(container);
    // Verify role and aria-label
    const nav = screen.getByRole("navigation");
    expect(nav).toHaveAttribute("aria-label", "Table of contents");
  });

  it("observes target sections via IntersectionObserver and sets active when one intersects", () => {
    type IOCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;
    let capturedCallback: IOCallback | null = null;
    const observedTargets: Element[] = [];
    const originalIO = globalThis.IntersectionObserver;
    // @ts-expect-error — test stub
    globalThis.IntersectionObserver = class {
      constructor(cb: IOCallback) {
        capturedCallback = cb;
      }
      observe(el: Element) {
        observedTargets.push(el);
      }
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    };

    try {
      const onActiveChange = vi.fn();
      // Mount target sections for the anchor to observe.
      document.body.innerHTML = "";
      for (const it of items) {
        const el = document.createElement("section");
        el.id = it.href.replace(/^#/, "");
        document.body.appendChild(el);
      }

      renderWithTheme(
        <Anchor items={items} onActiveChange={onActiveChange} />,
      );

      // Every `#id` target should have been observed.
      expect(observedTargets).toHaveLength(items.length);
      expect(capturedCallback).toBeTruthy();

      // Simulate the "install" section scrolling into view.
      const target = observedTargets.find(
        (el) => (el as HTMLElement).id === "install",
      );
      expect(target).toBeTruthy();
      act(() => {
        capturedCallback!([
          {
            target: target!,
            isIntersecting: true,
            intersectionRatio: 1,
          } as Partial<IntersectionObserverEntry>,
        ]);
      });
      expect(onActiveChange).toHaveBeenCalledWith("install");
    } finally {
      globalThis.IntersectionObserver = originalIO;
      document.body.innerHTML = "";
    }
  });
});

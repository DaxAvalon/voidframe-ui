import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Identicon,
  OrganizationCard,
  PresenceList,
  TeamCard,
  UserCard,
} from "../Identity";
import {
  BigNumber,
  CurrencyDisplay,
  NumberDisplay,
  PercentDisplay,
} from "../Numeric";
import {
  Countdown,
  DurationDisplay,
  RelativeTime,
  TimeZoneSelect,
} from "../TimeDisplays";
import {
  Changelog,
  ContextHelp,
  HelpTooltip,
  WhatsNewPopover,
} from "../HelpChangelog";
import { Barcode, QRCode } from "../Encoding";
import { ColorSwatch, Palette } from "../ColorTools";
import { LegalText } from "../RichEmbed";
import { DashboardGrid, WidgetShell, packLayout } from "../Widget";
import { PrintLayout } from "../Print";
import { renderWithTheme } from "../../../test/renderWithTheme";

// ── Identity ──

describe("UserCard / TeamCard / OrganizationCard", () => {
  it("UserCard renders name + status dot + actions", () => {
    renderWithTheme(
      <UserCard
        user={{
          name: "Ada Lovelace",
          title: "Engineer",
          status: "online",
        }}
        actions={<button type="button">Follow</button>}
      />
    );
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Engineer")).toBeInTheDocument();
    expect(screen.getByLabelText("online")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Follow" })).toBeInTheDocument();
  });
  it("UserCard onSelect makes it a button", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <UserCard user={{ name: "Ada" }} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSelect).toHaveBeenCalled();
  });
  it("TeamCard renders member count and description", () => {
    renderWithTheme(
      <TeamCard
        team={{
          name: "Platform",
          description: "Infra team",
          memberCount: 8,
        }}
      />
    );
    expect(screen.getByText("Platform")).toBeInTheDocument();
    expect(screen.getByText("8 members")).toBeInTheDocument();
  });
  it("OrganizationCard renders website link", () => {
    renderWithTheme(
      <OrganizationCard
        organization={{ name: "Acme", website: "https://acme.test" }}
      />
    );
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      "https://acme.test"
    );
  });
});

describe("Identicon", () => {
  it("is deterministic for the same value", () => {
    const a = renderWithTheme(<Identicon value="alice@example.com" />);
    const html1 = a.container.innerHTML;
    a.unmount();
    const b = renderWithTheme(<Identicon value="alice@example.com" />);
    expect(b.container.innerHTML).toBe(html1);
  });
});

describe("PresenceList", () => {
  it("groups by status when enabled", () => {
    renderWithTheme(
      <PresenceList
        groupByStatus
        users={[
          { id: "1", name: "Offline user", status: "offline" },
          { id: "2", name: "Online user", status: "online" },
        ]}
      />
    );
    const items = screen.getAllByRole("listitem");
    expect(items[0]?.textContent).toContain("Online user");
    expect(items[1]?.textContent).toContain("Offline user");
  });
  it("truncates with +N more", () => {
    renderWithTheme(
      <PresenceList
        maxVisible={1}
        users={[
          { id: "1", name: "One", status: "online" },
          { id: "2", name: "Two", status: "online" },
          { id: "3", name: "Three", status: "online" },
        ]}
      />
    );
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });
});

// ── Numeric ──

describe("NumberDisplay / CurrencyDisplay / PercentDisplay", () => {
  it("NumberDisplay formats locale number", () => {
    renderWithTheme(<NumberDisplay value={1234567} locale="en-US" />);
    expect(screen.getByText("1,234,567")).toBeInTheDocument();
  });
  it("CurrencyDisplay applies auto tone for positive values", () => {
    const { container } = renderWithTheme(
      <CurrencyDisplay value={42} autoTone />
    );
    expect(container.querySelector(".vf-currency")).toHaveClass(
      "vf-currency--success"
    );
  });
  it("PercentDisplay treats value as already-in-percent by default", () => {
    renderWithTheme(<PercentDisplay value={50} locale="en-US" />);
    expect(screen.getByText("50.0%")).toBeInTheDocument();
  });
  it('PercentDisplay with basis="fraction" converts 0-1 ratio', () => {
    renderWithTheme(
      <PercentDisplay value={0.1234} basis="fraction" locale="en-US" />
    );
    expect(screen.getByText("12.3%")).toBeInTheDocument();
  });
});

describe("BigNumber", () => {
  it("renders value, unit, and delta", () => {
    renderWithTheme(
      <BigNumber
        label="Users"
        value="12,345"
        unit="total"
        delta="+5%"
        deltaTone="success"
      />
    );
    expect(screen.getByText("Users")).toBeInTheDocument();
    expect(screen.getByText("12,345")).toBeInTheDocument();
    expect(screen.getByText("total")).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });
});

// ── Time ──

describe("TimeZoneSelect", () => {
  it("emits onChange when a zone is chosen", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <TimeZoneSelect
        zones={["UTC", "Europe/London", "Asia/Tokyo"]}
        defaultValue="UTC"
        onValueChange={onChange}
      />
    );
    await userEvent.selectOptions(
      screen.getByRole("listbox"),
      "Asia/Tokyo"
    );
    expect(onChange).toHaveBeenCalledWith("Asia/Tokyo");
  });
});

describe("RelativeTime", () => {
  it("formats a past time", () => {
    const now = Date.now();
    renderWithTheme(
      <RelativeTime date={now - 65_000} now={now} updateInterval={0} />
    );
    expect(screen.getByRole("time").textContent).toMatch(/minute/);
  });
});

describe("DurationDisplay", () => {
  it("formats seconds as mm:ss by default", () => {
    renderWithTheme(<DurationDisplay seconds={125} />);
    expect(screen.getByText("02:05")).toBeInTheDocument();
  });
  it("formats as long prose", () => {
    renderWithTheme(<DurationDisplay seconds={3661} format="long" />);
    expect(screen.getByText(/1 hour 1 minute 1 second/)).toBeInTheDocument();
  });
});

describe("Countdown", () => {
  it("shows 0:00 after target time", () => {
    const target = Date.now() - 10_000;
    renderWithTheme(<Countdown target={target} />);
    const el = screen.getByText("00:00");
    expect(el).toBeInTheDocument();
  });
});

// ── Help / Changelog / Whats New ──

describe("HelpTooltip", () => {
  it("renders a button and hidden tooltip content", () => {
    const { container } = renderWithTheme(
      <HelpTooltip content="This is a note." />
    );
    expect(screen.getByRole("button", { name: "Help" })).toBeInTheDocument();
    const tip = container.querySelector(".vf-help-tooltip__content");
    expect(tip).toHaveAttribute("aria-hidden", "true");
    expect(tip?.textContent).toBe("This is a note.");
  });
});

describe("ContextHelp", () => {
  it("does not render when closed", () => {
    const { queryByRole } = renderWithTheme(
      <ContextHelp open={false}>body</ContextHelp>
    );
    expect(queryByRole("complementary")).not.toBeInTheDocument();
  });
  it("renders body when open", () => {
    renderWithTheme(<ContextHelp>body copy</ContextHelp>);
    expect(screen.getByText("body copy")).toBeInTheDocument();
  });
});

describe("Changelog", () => {
  it("toggles entries on click", async () => {
    renderWithTheme(
      <Changelog
        collapsed
        entries={[
          {
            version: "1.0.0",
            changes: [{ kind: "added", description: "First" }],
          },
          {
            version: "0.9.0",
            changes: [{ kind: "fixed", description: "Bug" }],
          },
        ]}
      />
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.queryByText("Bug")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("0.9.0"));
    expect(screen.getByText("Bug")).toBeInTheDocument();
  });
});

describe("WhatsNewPopover", () => {
  it("persists dismissal via custom storage", async () => {
    const onDismiss = vi.fn();
    const store = new Map<string, string>();
    const storage = {
      get: (k: string) => store.get(k) ?? null,
      set: (k: string, v: string) => {
        store.set(k, v);
      },
    };
    const { rerender, queryByRole } = renderWithTheme(
      <WhatsNewPopover
        version="1.0.0"
        storage={storage}
        features={[{ title: "New widget" }]}
        onDismiss={onDismiss}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Got it" }));
    expect(onDismiss).toHaveBeenCalled();
    expect(store.get("vf-whatsnew")).toBe("1.0.0");
    rerender(
      <WhatsNewPopover
        version="1.0.0"
        storage={storage}
        features={[{ title: "New widget" }]}
      />
    );
    expect(queryByRole("dialog")).not.toBeInTheDocument();
  });
});

// ── Encoding ──

describe("QRCode / Barcode", () => {
  it("QRCode renders with aria-label referencing value", () => {
    renderWithTheme(<QRCode value="https://example.com" size={120} />);
    expect(
      screen.getByLabelText(/QR code encoding https:\/\/example.com/)
    ).toBeInTheDocument();
  });
  it("QRCode uses the provided matrix dimensions", () => {
    const matrix = [
      [true, false],
      [false, true],
    ];
    const { container } = renderWithTheme(
      <QRCode value="x" matrix={matrix} size={40} />
    );
    // 2x2 = 4 cells + 0 logo overlay.
    const cells = container.querySelectorAll(".vf-qrcode > span");
    expect(cells).toHaveLength(4);
  });
  it("Barcode renders with text label", () => {
    renderWithTheme(<Barcode value="SKU-001" format="code128" />);
    expect(screen.getByText("SKU-001")).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Barcode \(code128\) encoding SKU-001/)
    ).toBeInTheDocument();
  });
});

// ── Color ──

describe("ColorSwatch / Palette", () => {
  it("ColorSwatch fires onSelect", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <ColorSwatch color="#ff0000" onSelect={onSelect} showLabel />
    );
    await userEvent.click(screen.getByRole("button", { name: "#ff0000" }));
    expect(onSelect).toHaveBeenCalled();
  });
  it("ColorSwatch without onSelect is not disabled and not focusable", () => {
    renderWithTheme(<ColorSwatch color="#111" />);
    // No button should render for display-only swatches.
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const el = document.querySelector(".vf-color-swatch") as HTMLElement;
    expect(el).toBeTruthy();
    expect(el.tagName).toBe("DIV");
    expect(el.hasAttribute("data-disabled")).toBe(false);
  });

  it("Palette emits color + index on click", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <Palette
        colors={["#111", "#222", { color: "#333", label: "Three" }]}
        onSelect={onSelect}
      />
    );
    await userEvent.click(screen.getAllByRole("button")[2]!);
    expect(onSelect).toHaveBeenCalledWith("#333", 2);
  });
});

// ── LegalText ──

describe("LegalText", () => {
  it("renders children", () => {
    renderWithTheme(<LegalText>By continuing, you agree.</LegalText>);
    expect(screen.getByText(/By continuing/)).toBeInTheDocument();
  });
});

// ── Widget ──

describe("WidgetShell", () => {
  it("renders loading state", () => {
    renderWithTheme(<WidgetShell loading title="Stats">body</WidgetShell>);
    expect(screen.getByText("Loading…")).toBeInTheDocument();
    expect(screen.queryByText("body")).not.toBeInTheDocument();
  });
  it("renders error state", () => {
    renderWithTheme(
      <WidgetShell error="boom" title="Stats">
        body
      </WidgetShell>
    );
    expect(screen.getByText("boom")).toBeInTheDocument();
  });
  it("renders empty state when no children", () => {
    renderWithTheme(
      <WidgetShell title="Stats" empty="No data">
        {null}
      </WidgetShell>
    );
    expect(screen.getByText("No data")).toBeInTheDocument();
  });
});

describe("DashboardGrid + packLayout", () => {
  it("packLayout distributes ids across columns", () => {
    const layout = packLayout(["a", "b", "c", "d"], 8, { w: 4, h: 2 });
    expect(layout).toHaveLength(4);
    expect(layout[0]).toEqual({ id: "a", x: 0, y: 0, w: 4, h: 2 });
    expect(layout[1]).toEqual({ id: "b", x: 4, y: 0, w: 4, h: 2 });
    expect(layout[2]).toEqual({ id: "c", x: 0, y: 2, w: 4, h: 2 });
  });
  it("renders cells via renderItem", () => {
    renderWithTheme(
      <DashboardGrid
        items={packLayout(["a", "b"], 12)}
        renderItem={(id) => <span>cell {id}</span>}
      />
    );
    expect(screen.getByText("cell a")).toBeInTheDocument();
    expect(screen.getByText("cell b")).toBeInTheDocument();
  });

  it("renders a resize grip per cell when resizable", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={packLayout(["a", "b"], 12)}
        onLayoutChange={() => undefined}
        resizable
        renderItem={(id) => <span>cell {id}</span>}
      />
    );
    const grips = container.querySelectorAll(".vf-dashboard-grid__resize");
    expect(grips).toHaveLength(2);
  });

  it("does not render resize grips when resizable is false", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={packLayout(["a"], 12)}
        renderItem={(id) => <span>cell {id}</span>}
      />
    );
    expect(
      container.querySelector(".vf-dashboard-grid__resize")
    ).toBeFalsy();
  });

  it("places cards at sub-cell coordinates and respects fixed bounds", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={[{ id: "a", x: 3, y: 2, w: 6, h: 4 }]}
        cols={24}
        cellSize={32}
        gap={4}
        bounds={{ rows: 12 }}
        renderItem={(id) => <span>cell {id}</span>}
      />
    );
    const card = container.querySelector(
      ".vf-dashboard-grid__cell"
    ) as HTMLElement;
    expect(card.style.left).toBe(`${3 * 36}px`);
    expect(card.style.top).toBe(`${2 * 36}px`);
    expect(card.style.width).toBe(`${6 * 36 - 4}px`);
    expect(card.style.height).toBe(`${4 * 36 - 4}px`);
  });

  it("renders no overlay or drop target before any drag begins", () => {
    const { container } = renderWithTheme(
      <DashboardGrid
        items={[{ id: "a", x: 0, y: 0, w: 4, h: 3 }]}
        renderItem={(id) => <span>cell {id}</span>}
      />
    );
    expect(
      container.querySelector(".vf-dashboard-grid__drop-target")
    ).toBeFalsy();
    expect(
      container.classList.contains("vf-dashboard-grid--dragging")
    ).toBe(false);
  });
});

// ── Print ──

describe("PrintLayout", () => {
  it("renders with title and header by default", () => {
    renderWithTheme(
      <PrintLayout title="Report">
        <p>content</p>
      </PrintLayout>
    );
    expect(screen.getByRole("heading", { name: "Report" })).toBeInTheDocument();
    expect(screen.getByText("content")).toBeInTheDocument();
  });
});

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  NotificationCenter,
  BannerAlert,
  Callout,
  Quote,
  AlertV2,
} from "../Notifications";

describe("NotificationCenter", () => {
  const items = [
    { id: "1", title: "New message", read: false },
    { id: "2", title: "Update available", read: true },
  ];

  it("shows badge with unread count", () => {
    renderWithTheme(<NotificationCenter notifications={items} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("opens panel on trigger click", async () => {
    renderWithTheme(<NotificationCenter notifications={items} />);
    await userEvent.click(screen.getByRole("button", { name: /Notifications.*1 unread/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("New message")).toBeInTheDocument();
    expect(screen.getByText("Update available")).toBeInTheDocument();
  });

  it("shows empty state when no notifications", async () => {
    renderWithTheme(<NotificationCenter notifications={[]} />);
    await userEvent.click(screen.getByRole("button", { name: "Notifications" }));
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("fires onDismiss", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <NotificationCenter notifications={items} onDismiss={onDismiss} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    const dismissBtns = screen.getAllByRole("button", { name: "Dismiss notification" });
    await userEvent.click(dismissBtns[0]!);
    expect(onDismiss).toHaveBeenCalledWith("1");
  });

  it("fires onMarkAllRead", async () => {
    const onMarkAllRead = vi.fn();
    renderWithTheme(
      <NotificationCenter notifications={items} onMarkAllRead={onMarkAllRead} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    await userEvent.click(screen.getByText("Mark all read"));
    expect(onMarkAllRead).toHaveBeenCalled();
  });

  it("fires onMarkRead when clicking a notification", async () => {
    const onMarkRead = vi.fn();
    renderWithTheme(
      <NotificationCenter notifications={items} onMarkRead={onMarkRead} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    await userEvent.click(screen.getByText("New message"));
    expect(onMarkRead).toHaveBeenCalledWith("1");
  });

  it("uses custom unreadCount", () => {
    renderWithTheme(
      <NotificationCenter notifications={items} unreadCount={5} />
    );
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders description and time for notifications", async () => {
    const itemsWithMeta = [
      {
        id: "1",
        title: "Alert",
        description: "Something happened",
        time: new Date(2026, 0, 1, 10, 30),
        read: false,
        tone: "warning" as const,
      },
    ];
    renderWithTheme(
      <NotificationCenter notifications={itemsWithMeta} />
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    expect(screen.getByText("Something happened")).toBeInTheDocument();
    // Time should be formatted
    expect(document.querySelector(".vf-notif-center__time")).toBeInTheDocument();
  });

  it("uses custom renderNotification", async () => {
    const singleItem = [{ id: "1", title: "Custom note", read: false }];
    renderWithTheme(
      <NotificationCenter
        notifications={singleItem}
        renderNotification={(n) => <div data-testid="custom">{n.title} custom</div>}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    expect(screen.getByTestId("custom")).toHaveTextContent("Custom note custom");
  });

  it("portals the open panel to document.body (escapes clipping ancestors)", async () => {
    renderWithTheme(
      <div data-testid="clip" style={{ overflow: "hidden", position: "relative" }}>
        <NotificationCenter notifications={items} />
      </div>
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    const panel = screen.getByRole("dialog");
    expect(screen.getByTestId("clip").contains(panel)).toBe(false);
    expect(document.body.contains(panel)).toBe(true);
  });

  it("does not close when clicking inside the portaled panel", async () => {
    renderWithTheme(<NotificationCenter notifications={items} />);
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    await userEvent.click(screen.getByText("New message"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes on outside click when portaled", async () => {
    renderWithTheme(
      <div>
        <button type="button">outside</button>
        <NotificationCenter notifications={items} />
      </div>
    );
    await userEvent.click(screen.getByRole("button", { name: /Notifications/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "outside" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});

describe("BannerAlert", () => {
  it("renders with correct tone", () => {
    const { container } = renderWithTheme(
      <BannerAlert tone="warning">Watch out</BannerAlert>
    );
    expect(container.querySelector(".vf-banner-alert--warning")).toBeInTheDocument();
    expect(screen.getByText("Watch out")).toBeInTheDocument();
  });

  it("uses role=alert for danger/warning, role=status for info/success", () => {
    const { unmount } = renderWithTheme(
      <BannerAlert tone="danger">Error</BannerAlert>
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    unmount();
    renderWithTheme(<BannerAlert tone="info">Info</BannerAlert>);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("dismiss button hides the banner and fires onDismiss", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <BannerAlert dismissible onDismiss={onDismiss}>
        Dismissible
      </BannerAlert>
    );
    expect(screen.getByText("Dismissible")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Dismissible")).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("renders icon and action slots", () => {
    renderWithTheme(
      <BannerAlert icon="!" action={<button>Fix</button>}>Body</BannerAlert>
    );
    expect(screen.getByText("!")).toBeInTheDocument();
    expect(screen.getByText("Fix")).toBeInTheDocument();
  });
});

describe("Callout", () => {
  it("renders with tone class", () => {
    const { container } = renderWithTheme(
      <Callout tone="success" title="Done">Content</Callout>
    );
    expect(container.querySelector(".vf-callout--success")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
    expect(screen.getByText("Content")).toBeInTheDocument();
  });

  it("renders icon", () => {
    renderWithTheme(<Callout icon="I">Text</Callout>);
    expect(screen.getByText("I")).toBeInTheDocument();
  });
});

describe("Quote", () => {
  it("renders blockquote with body", () => {
    const { container } = renderWithTheme(
      <Quote source="Author" cite="https://example.com">
        Wise words
      </Quote>
    );
    expect(container.querySelector("blockquote")).toBeInTheDocument();
    expect(screen.getByText("Wise words")).toBeInTheDocument();
    expect(screen.getByText("Author")).toBeInTheDocument();
  });

  it("renders non-string cite as <cite>", () => {
    const { container } = renderWithTheme(
      <Quote cite={<a href="#">Link</a>}>Text</Quote>
    );
    expect(container.querySelector("cite")).toBeInTheDocument();
  });
});

describe("AlertV2", () => {
  it("renders with title and body", () => {
    renderWithTheme(<AlertV2 title="Warning" tone="warning">Details</AlertV2>);
    expect(screen.getByText("Warning")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
  });

  it("dismisses on button click", async () => {
    const onDismiss = vi.fn();
    renderWithTheme(
      <AlertV2 title="Alert" dismissible onDismiss={onDismiss}>Body</AlertV2>
    );
    await userEvent.click(screen.getByRole("button", { name: "Dismiss" }));
    expect(screen.queryByText("Alert")).not.toBeInTheDocument();
    expect(onDismiss).toHaveBeenCalled();
  });

  it("uses role=alert for danger tone", () => {
    renderWithTheme(<AlertV2 tone="danger" title="Err" />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
  });
});

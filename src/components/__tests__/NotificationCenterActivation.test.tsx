import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { NotificationCenter, type NotificationItem } from "../Notifications";

const items: NotificationItem[] = [
  { id: "a", title: "Build failed", description: "main · 3 min ago", icon: <span data-testid="icon">!</span>, href: "/builds/1" },
  { id: "b", title: "Review requested", onSelect: () => {}, avatar: <span data-testid="avatar">S</span> },
  { id: "c", title: "Plain note", read: true },
];

describe("NotificationCenter activation", () => {
  it("rows with a destination render a link or button, show icon/avatar, and fire onSelect plus onMarkRead", async () => {
    const onSelect = vi.fn();
    const onMarkRead = vi.fn();
    const perItem = vi.fn();
    const withPerItem = items.map((n) => (n.id === "b" ? { ...n, onSelect: perItem } : n));
    renderWithTheme(<NotificationCenter notifications={withPerItem} onSelect={onSelect} onMarkRead={onMarkRead} kind="dropdown" />);
    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    const link = screen.getByRole("link", { name: /Build failed/ });
    expect(link).toHaveAttribute("href", "/builds/1");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByTestId("avatar")).toBeInTheDocument();
    link.addEventListener("click", (e) => e.preventDefault());
    await userEvent.click(link);
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "a" }));
    expect(onMarkRead).toHaveBeenCalledWith("a");
    const btn = screen.getByRole("button", { name: "Review requested" });
    btn.focus();
    await userEvent.keyboard("{Enter}");
    expect(perItem).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "b" }));
  });

  it("unread rows with a destination get a Mark read control that does not activate", async () => {
    const onSelect = vi.fn();
    const onMarkRead = vi.fn();
    renderWithTheme(<NotificationCenter notifications={items} onSelect={onSelect} onMarkRead={onMarkRead} kind="dropdown" />);
    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    const mark = screen.getByTestId("vf-notification-mark-read-button-a");
    expect(mark).toHaveAccessibleName("Mark read: Build failed");
    await userEvent.click(mark);
    expect(onMarkRead).toHaveBeenCalledWith("a");
    expect(onSelect).not.toHaveBeenCalled();
    // The read row has no mark-read control.
    expect(screen.queryByTestId("vf-notification-mark-read-button-c")).toBeNull();
  });

  it("rows without a destination keep the click-to-mark-read behaviour", async () => {
    const onMarkRead = vi.fn();
    const onSelect = vi.fn();
    renderWithTheme(<NotificationCenter notifications={[{ id: "c", title: "Plain note" }]} onMarkRead={onMarkRead} kind="dropdown" />);
    await userEvent.click(screen.getByRole("button", { name: /notifications/i }));
    expect(screen.queryByRole("link")).toBeNull();
    await userEvent.click(screen.getByText("Plain note"));
    expect(onMarkRead).toHaveBeenCalledWith("c");
    expect(onSelect).not.toHaveBeenCalled();
    expect(document.querySelector(".vf-notif-center__item")).toHaveAttribute("data-read", "false");
  });
});

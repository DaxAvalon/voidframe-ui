import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { SessionList, type ChatSessionEntry } from "../ChatSession";
import { Sidebar } from "../Sidebar";
import { NavItem } from "../Navigation";

const sessions: ChatSessionEntry[] = [
  { id: "a", title: "Refactor billing", unreadCount: 3, status: "awaiting", accent: "var(--vf-purple)", meta: "opus", renderActions: (s) => <button aria-label={`More ${s.id}`}>…</button> },
  { id: "b", title: "Draft release notes", status: "typing" },
  { id: "c", title: "Done thing", lastMessage: "Shipped." },
  { id: "d", title: "Archived thing", lastMessage: "old" },
];

describe("SessionList agent sidebar", () => {
  it("shows unread count, status, accent, meta and per-row actions", () => {
    renderWithTheme(<SessionList sessions={sessions} groupBy="none" />);
    const a = screen.getByRole("option", { name: /Refactor billing/ }) as HTMLElement;
    expect(a).toHaveClass("vf-session-item--unread", "vf-session-item--awaiting", "vf-session-item--accented");
    expect(a).toHaveAttribute("data-unread", "3");
    expect(a).toHaveAttribute("data-status", "awaiting");
    expect(a.style.getPropertyValue("--vf-session-accent")).toBe("var(--vf-purple)");
    expect(a.querySelector(".vf-session-item__unread")).toHaveTextContent("3");
    expect(a.querySelector(".vf-session-item__meta")).toHaveTextContent("opus");
    expect(a.querySelector(".vf-session-item__button")).toHaveAttribute("aria-label", "Refactor billing, 3 unread, waiting for you");
    expect(a.querySelector(".vf-session-item__preview--status")).toHaveTextContent("waiting for you");
    expect(screen.getByRole("button", { name: "More a" })).toBeInTheDocument();
    const b = screen.getByRole("option", { name: /Draft release notes/ });
    expect(b.querySelector(".vf-session-item__status-indicator")).toBeTruthy();
    const c = screen.getByRole("option", { name: /Done thing/ });
    expect(c).not.toHaveClass("vf-session-item--unread");
    expect(c.querySelector(".vf-session-item__preview")).toHaveTextContent("Shipped.");
  });

  it("custom groups render in order, collapse, and leave the rest under the ungrouped label", async () => {
    renderWithTheme(
      <SessionList
        sessions={sessions}
        groups={[
          { id: "attention", label: "Needs attention", ids: ["a", "b"] },
          { id: "done", label: "Done", ids: ["c"], defaultOpen: false },
        ]}
        ungroupedLabel="Archived"
      />
    );
    const groups = document.querySelectorAll(".vf-session-list__group");
    expect(Array.from(groups).map((g) => g.getAttribute("aria-label"))).toEqual(["Needs attention", "Done", "Archived"]);
    expect(groups[1]).toHaveAttribute("data-open", "false");
    expect(screen.queryByRole("option", { name: /Done thing/ })).toBeNull();
    const toggle = screen.getByRole("button", { name: /Done/ });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(toggle);
    expect(screen.getByRole("option", { name: /Done thing/ })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /Needs attention/ }));
    expect(screen.queryByRole("option", { name: /Refactor billing/ })).toBeNull();
    expect(screen.getByRole("option", { name: /Archived thing/ })).toBeInTheDocument();
  });

  it("groupBy still works without custom groups", () => {
    renderWithTheme(<SessionList sessions={sessions} groupBy="none" />);
    expect(document.querySelectorAll(".vf-session-list__group-toggle").length).toBe(0);
    expect(screen.getAllByRole("option").length).toBe(4);
  });
});

describe("NavItem meta", () => {
  it("renders a trailing meta slot after the badge; the rail hides it in CSS", () => {
    renderWithTheme(
      <Sidebar>
        <NavItem href="/x" badge={2} meta="12:40">Chat</NavItem>
      </Sidebar>
    );
    const item = screen.getByRole("link", { name: /Chat/ });
    expect(item.querySelector(".vf-nav-item__meta")).toHaveTextContent("12:40");
    expect(item.querySelector(".vf-nav-item__badge")?.nextElementSibling).toHaveClass("vf-nav-item__meta");
  });
});

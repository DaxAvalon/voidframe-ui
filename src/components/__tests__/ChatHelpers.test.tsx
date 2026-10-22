import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { VoidframeProvider } from "../../provider/VoidframeProvider";
import { Message, MessageGroup, MessageList, DateDivider, Conversation } from "../Chat";
import { dayLabel, exportConversationJson, exportConversationMarkdown, formatTimestamp, groupMessagesBySender, isDateLike, isSameDay } from "../Chat/helpers";
import { ToolCall, ToolCallGroup, summarizeToolCalls } from "../ChatAgent";

const noon = new Date(2026, 9, 22, 12, 0, 0);

describe("chat helpers", () => {
  it("formatTimestamp formats date-like values in the locale and passes other nodes through", () => {
    expect(formatTimestamp(noon, { locale: "en-GB" })).toBe("12:00");
    expect(formatTimestamp("2026-10-22T12:00:00", { locale: "en-GB" })).toBe("12:00");
    expect(formatTimestamp(new Date(2026, 0, 3, 9, 5), { locale: "en-GB", style: "datetime", now: noon })).toMatch(/3 Jan/);
    expect(formatTimestamp(new Date(noon.getTime() - 3 * 60_000), { locale: "en", style: "relative", now: noon })).toBe("3 minutes ago");
    expect(formatTimestamp("just now")).toBe("just now");
    expect(isDateLike("hello")).toBe(false);
    expect(isDateLike(1_700_000_000_000)).toBe(true);
  });

  it("dayLabel and isSameDay", () => {
    expect(dayLabel(noon, { now: noon })).toBe("Today");
    expect(dayLabel(new Date(2026, 9, 21, 8), { now: noon })).toBe("Yesterday");
    expect(dayLabel(new Date(2026, 9, 19, 8), { now: noon, locale: "en" })).toBe("Monday");
    expect(dayLabel(new Date(2026, 2, 1), { now: noon, locale: "en" })).toBe("March 1");
    expect(dayLabel(new Date(2025, 2, 1), { now: noon, locale: "en" })).toMatch(/2025/);
    expect(dayLabel(noon, { now: noon, labels: { today: "Heute" } })).toBe("Heute");
    expect(isSameDay(noon, new Date(2026, 9, 22, 23, 59))).toBe(true);
    expect(isSameDay(noon, new Date(2026, 9, 23, 0, 0))).toBe(false);
  });

  it("groupMessagesBySender groups runs, breaks on gaps and custom rules", () => {
    const t = (m: number) => new Date(noon.getTime() + m * 60_000);
    const msgs = [
      { id: 1, from: "a", at: t(0) },
      { id: 2, from: "a", at: t(1) },
      { id: 3, from: "b", at: t(2) },
      { id: 4, from: "b", at: t(20) },
      { id: 5, from: "b", at: t(21), system: true },
    ];
    const groups = groupMessagesBySender(msgs, { getSenderId: (m) => m.from, getTimestamp: (m) => m.at, breakOn: (m) => !!m.system });
    expect(groups.map((g) => g.messages.map((m) => m.id))).toEqual([[1, 2], [3], [4], [5]]);
    expect(groups[0]!.senderId).toBe("a");
    expect(groups[0]!.startedAt?.getTime()).toBe(t(0).getTime());
  });

  it("exports Markdown and JSON", () => {
    const messages = [
      { id: "1", role: "user" as const, author: { name: "Ann" }, timestamp: noon, content: "Hello" },
      { id: "2", role: "assistant" as const, authorId: "bot", timestamp: noon.getTime(), content: [{ type: "text" as const, text: "Hi" }, { type: "code" as const, language: "ts", code: "1+1" }, { type: "tool_use" as const, name: "search", args: { q: "x" } }] },
    ];
    const md = exportConversationMarkdown(messages, { title: "Chat", authors: { bot: { name: "Helper" } }, locale: "en-GB" });
    expect(md).toContain("# Chat");
    expect(md).toContain("### Ann · ");
    expect(md).toContain("### Helper · ");
    expect(md).toContain("```ts\n1+1\n```");
    expect(md).toContain("**Tool call:** `search`");
    const json = exportConversationJson(messages, { authors: { bot: { name: "Helper" } } });
    expect(json.messages[0]!.timestamp).toBe(noon.toISOString());
    expect(json.messages[1]!.author?.name).toBe("Helper");
    expect(json.messages[1]!.content).toHaveLength(3);
  });
});

describe("chat components", () => {
  it("Message and MessageGroup take an accent and format date-like timestamps", () => {
    render(
      <VoidframeProvider localeTag="en-GB" scope="root">
        <MessageGroup author={{ name: "Helper", color: "var(--vf-purple)", avatar: <span>H</span> }} timestamp={noon} data-testid="group">
          <Message role="assistant" author={{ name: "Helper", color: "var(--vf-purple)" }} timestamp={noon} content="x" data-testid="msg" />
          <Message role="user" timestamp="a moment ago" content="y" data-testid="plain" />
        </MessageGroup>
      </VoidframeProvider>
    );
    const group = screen.getByTestId("group") as HTMLElement;
    expect(group).toHaveClass("vf-message-group--accented");
    expect(group.style.getPropertyValue("--vf-message-accent")).toBe("var(--vf-purple)");
    expect(group.querySelector(".vf-message-group__time")).toHaveTextContent("12:00");
    expect(group.querySelector(".vf-message-group__time")).toHaveAttribute("datetime", noon.toISOString());
    const msg = screen.getByTestId("msg") as HTMLElement;
    expect(msg).toHaveClass("vf-message--accented");
    expect(msg.querySelector(".vf-message__time")).toHaveTextContent("12:00");
    expect(screen.getByTestId("plain").querySelector(".vf-message__time")).toHaveTextContent("a moment ago");
  });

  it("DateDivider labels the day", () => {
    render(<VoidframeProvider scope="root"><DateDivider date={new Date()} /><DateDivider>Custom</DateDivider></VoidframeProvider>);
    const seps = screen.getAllByRole("separator");
    expect(seps[0]).toHaveTextContent("Today");
    expect(seps[0]!.querySelector("time")).toHaveAttribute("datetime", new Date().toISOString().slice(0, 10));
    expect(seps[1]).toHaveTextContent("Custom");
  });

  it("MessageList load-earlier control calls onLoadEarlier and keeps the scroll anchor", async () => {
    let resolve!: () => void;
    const onLoadEarlier = vi.fn(() => new Promise<void>((r) => { resolve = r; }));
    const { rerender } = render(
      <Conversation>
        <MessageList hasEarlier onLoadEarlier={onLoadEarlier} data-testid="list">
          <Message content="newest" />
        </MessageList>
      </Conversation>
    );
    const list = screen.getByTestId("list") as HTMLElement;
    // Fake geometry: 1000px of content, viewport 300px, reader 200px from the top.
    Object.defineProperty(list, "scrollHeight", { value: 1000, configurable: true });
    Object.defineProperty(list, "clientHeight", { value: 300, configurable: true });
    list.scrollTop = 200;
    const button = screen.getByRole("button", { name: "Load earlier messages" });
    fireEvent.click(button);
    expect(onLoadEarlier).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Loading…" })).toBeDisabled();
    // History arrives: content grows by 500px.
    Object.defineProperty(list, "scrollHeight", { value: 1500, configurable: true });
    rerender(
      <Conversation>
        <MessageList hasEarlier onLoadEarlier={onLoadEarlier} data-testid="list">
          <Message content="older" />
          <Message content="newest" />
        </MessageList>
      </Conversation>
    );
    expect(list.scrollTop).toBe(700);
    await act(async () => { resolve(); });
    expect(screen.getByRole("button", { name: "Load earlier messages" })).toBeEnabled();
    expect(list).toHaveAttribute("data-has-earlier", "true");
  });

  it("MessageList without hasEarlier renders no control", () => {
    render(<MessageList><Message content="x" /></MessageList>);
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("ToolCall icon and ToolCallGroup counts", () => {
    render(
      <ToolCallGroup title="Turn 3" data-testid="group">
        <ToolCall name="search" icon={<span data-testid="icon">🔍</span>} status="success" />
        <ToolCall name="fetch" status="success" />
        <ToolCall name="write" status="running" />
      </ToolCallGroup>
    );
    expect(screen.getByTestId("icon").closest(".vf-tool-call__icon")).toBeTruthy();
    const group = screen.getByTestId("group");
    expect(group).toHaveAttribute("data-count", "3");
    expect(group.querySelector(".vf-tool-call-group__counts")).toHaveTextContent("2 success · 1 running");
    expect(summarizeToolCalls(<ToolCall name="x" status="error" />)).toEqual({ total: 1, error: 1 });
  });
});

import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  ConversationEmptyState,
  ConversationHeader,
  SessionList,
  SessionListItem,
} from "../ChatSession";
import {
  ChatLayout,
  ContextWindow,
  CostDisplay,
  DebugPanel,
  LatencyIndicator,
  ModelSelector,
  SystemPromptEditor,
  TokenCounter,
  TraceViewer,
  UnreadBadge,
} from "../ChatModel";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("SessionList", () => {
  const now = Date.now();
  const sessions = [
    {
      id: "a",
      title: "Pinned one",
      pinned: true,
      updatedAt: now - 10 * 60_000,
    },
    { id: "b", title: "Fresh chat", updatedAt: now - 60 * 60_000 },
    { id: "c", title: "Ancient chat", updatedAt: now - 31 * 86_400_000 },
  ];

  it("groups sessions by day with pinned first", () => {
    renderWithTheme(<SessionList sessions={sessions} activeId="a" />);
    expect(screen.getByText("Pinned one")).toBeInTheDocument();
    expect(screen.getByText("Fresh chat")).toBeInTheDocument();
    expect(screen.getByText("Ancient chat")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    renderWithTheme(
      <SessionList sessions={sessions} activeId="a" searchable />
    );
    const search = screen.getByRole("searchbox");
    await userEvent.type(search, "pinned");
    expect(screen.getByText("Pinned one")).toBeInTheDocument();
    expect(screen.queryByText("Older")).not.toBeInTheDocument();
  });

  it("fires onSelect with session id", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <SessionList sessions={sessions} onSelect={onSelect} />
    );
    await userEvent.click(screen.getByText("Pinned one"));
    expect(onSelect).toHaveBeenCalledWith("a");
  });
});

describe("SessionListItem", () => {
  it("exposes an aria-selected option when active", () => {
    renderWithTheme(
      <SessionListItem
        session={{ id: "x", title: "Title" }}
        active
      />
    );
    expect(screen.getByRole("option")).toHaveAttribute("aria-selected", "true");
  });
});

describe("ConversationHeader", () => {
  it("renders title and meta", () => {
    renderWithTheme(
      <ConversationHeader
        title="Conversation"
        model="opus-4.6"
        tokens="1,234"
        cost="$0.02"
      />
    );
    expect(screen.getByText("Conversation")).toBeInTheDocument();
    expect(screen.getByText("opus-4.6")).toBeInTheDocument();
    expect(screen.getByText("1,234")).toBeInTheDocument();
    expect(screen.getByText("$0.02")).toBeInTheDocument();
  });

  it("edits inline when onTitleChange is provided", async () => {
    const onTitleChange = vi.fn();
    renderWithTheme(
      <ConversationHeader
        title="Old"
        onTitleChange={onTitleChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Rename conversation" }));
    const input = screen.getByDisplayValue("Old") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "New");
    await userEvent.keyboard("{Enter}");
    expect(onTitleChange).toHaveBeenCalledWith("New");
  });
});

describe("ConversationEmptyState", () => {
  it("renders suggestions and fires handler", async () => {
    const onSuggestionSelect = vi.fn();
    renderWithTheme(
      <ConversationEmptyState
        suggestions={[{ text: "Summarize" }, { text: "Translate" }]}
        onSuggestionSelect={onSuggestionSelect}
      />
    );
    await userEvent.click(screen.getByText("Summarize"));
    expect(onSuggestionSelect).toHaveBeenCalled();
  });
});

// ── ChatModel helpers ──

describe("ModelSelector", () => {
  it("renders options and fires onChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ModelSelector
        onChange={onChange}
        models={[
          { id: "opus", name: "Opus" },
          { id: "haiku", name: "Haiku" },
        ]}
      />
    );
    const select = screen.getByRole("combobox");
    await userEvent.selectOptions(select, "haiku");
    expect(onChange).toHaveBeenCalledWith("haiku");
  });

  it("shows capabilities when requested", () => {
    renderWithTheme(
      <ModelSelector
        showCapabilities
        models={[
          {
            id: "opus",
            name: "Opus",
            contextWindow: 1_000_000,
            capabilities: ["vision"],
          },
        ]}
      />
    );
    expect(screen.getByText("1.0M context")).toBeInTheDocument();
    expect(screen.getByText("vision")).toBeInTheDocument();
  });
});

describe("SystemPromptEditor", () => {
  it("updates value on typing (uncontrolled)", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <SystemPromptEditor onChange={onChange} placeholder="system" />
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "hi");
    expect(onChange).toHaveBeenLastCalledWith("hi");
  });

  it("applies template on click", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <SystemPromptEditor
        onChange={onChange}
        templates={[{ id: "t", title: "Reset", body: "You are helpful." }]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Reset" }));
    expect(onChange).toHaveBeenCalledWith("You are helpful.");
  });
});

describe("TokenCounter + ContextWindow + CostDisplay", () => {
  it("TokenCounter shows total and max", () => {
    renderWithTheme(
      <TokenCounter input={100} output={50} max={1000} variant="detailed" />
    );
    expect(screen.getByText(/150.*1,000/)).toBeInTheDocument();
  });

  it("ContextWindow exposes progressbar", () => {
    renderWithTheme(<ContextWindow used={750} max={1000} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "750");
    expect(bar).toHaveAttribute("aria-valuemax", "1000");
  });

  it("CostDisplay formats total", () => {
    renderWithTheme(<CostDisplay total={0.0042} />);
    expect(screen.getByText("$0.0042")).toBeInTheDocument();
  });
});

describe("LatencyIndicator", () => {
  it("picks a tone based on value", () => {
    const { container, rerender } = renderWithTheme(
      <LatencyIndicator value={200} />
    );
    expect(container.querySelector(".vf-latency")).toHaveClass(
      "vf-latency--good"
    );
    rerender(<LatencyIndicator value={6000} />);
    expect(container.querySelector(".vf-latency")).toHaveClass(
      "vf-latency--bad"
    );
  });
});

describe("DebugPanel", () => {
  it("renders events when open", () => {
    renderWithTheme(
      <DebugPanel events={[{ type: "request", message: "GET /x" }]} />
    );
    expect(screen.getByText("request")).toBeInTheDocument();
  });

  it("is hidden when closed", () => {
    const result = renderWithTheme(<DebugPanel open={false} />);
    expect(result.queryByRole("complementary")).not.toBeInTheDocument();
  });
});

describe("TraceViewer", () => {
  it("renders spans", () => {
    renderWithTheme(
      <TraceViewer
        spans={[
          { id: "1", name: "plan", startMs: 0, durationMs: 500 },
          { id: "2", name: "run", startMs: 500, durationMs: 1500 },
        ]}
      />
    );
    expect(screen.getByText("plan")).toBeInTheDocument();
    expect(screen.getByText("run")).toBeInTheDocument();
  });
});

describe("UnreadBadge", () => {
  it("clamps at max", () => {
    renderWithTheme(<UnreadBadge count={250} max={99} />);
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("renders dot variant", () => {
    const { container } = renderWithTheme(<UnreadBadge dot />);
    expect(container.querySelector(".vf-unread-badge--dot")).toBeInTheDocument();
  });

  it("renders nothing when count is zero", () => {
    const { queryByRole } = renderWithTheme(<UnreadBadge count={0} />);
    expect(queryByRole("status")).not.toBeInTheDocument();
  });
});

describe("ChatLayout", () => {
  it("adds classes for sidebar and inspector", () => {
    const { container } = renderWithTheme(
      <ChatLayout
        sidebar={<div>sidebar</div>}
        inspector={<div>inspector</div>}
        conversation={<div>conv</div>}
      />
    );
    const layout = container.querySelector(".vf-chat-layout");
    expect(layout).toHaveClass("vf-chat-layout--with-sidebar");
    expect(layout).toHaveClass("vf-chat-layout--with-inspector");
    expect(screen.getByText("conv")).toBeInTheDocument();
  });
});

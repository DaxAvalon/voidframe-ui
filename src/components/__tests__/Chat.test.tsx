import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Conversation,
  Message,
  MessageActions,
  MessageContent,
  MessageEdit,
  MessageFeedback,
  MessageGroup,
  MessageList,
  ReactionBar,
  ReasoningTrace,
  StreamingText,
  ThinkingIndicator,
} from "../Chat";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Conversation + MessageList", () => {
  it("renders an empty state when no messages", () => {
    renderWithTheme(
      <Conversation emptyState={<p>No messages</p>}>
      </Conversation>
    );
    expect(screen.getByText("No messages")).toBeInTheDocument();
  });

  it("renders children and sets role=log on MessageList", () => {
    renderWithTheme(
      <Conversation>
        <MessageList>
          <Message role="user" content="hi" />
        </MessageList>
      </Conversation>
    );
    expect(screen.getByRole("log")).toBeInTheDocument();
  });

  it("reflects status on the root element", () => {
    const { container } = renderWithTheme(
      <Conversation status="streaming">
        <div>loading</div>
      </Conversation>
    );
    expect(container.querySelector(".vf-conversation")).toHaveAttribute(
      "data-status",
      "streaming"
    );
  });
});

describe("Message", () => {
  it("renders text content and role", () => {
    const { container } = renderWithTheme(
      <Message role="assistant" content="Hello world" />
    );
    expect(screen.getByText("Hello world")).toBeInTheDocument();
    expect(container.querySelector(".vf-message")).toHaveAttribute(
      "data-role",
      "assistant"
    );
  });

  it("renders author info when provided", () => {
    renderWithTheme(
      <Message role="assistant" author={{ name: "Claude" }} content="hi" />
    );
    expect(screen.getByText("Claude")).toBeInTheDocument();
  });

  it("shows edited label in footer", () => {
    renderWithTheme(
      <Message role="user" content="hi" edited actions={<span>x</span>} />
    );
    expect(screen.getByText("(edited)")).toBeInTheDocument();
  });
});

describe("MessageGroup", () => {
  it("renders header when author/timestamp given", () => {
    renderWithTheme(
      <MessageGroup author={{ name: "Claude" }} timestamp="12:34">
        <Message role="assistant" content="a" />
      </MessageGroup>
    );
    expect(screen.getByText("Claude")).toBeInTheDocument();
    expect(screen.getByText("12:34")).toBeInTheDocument();
  });
});

describe("MessageContent", () => {
  it("renders a string content as plain text by default", () => {
    renderWithTheme(<MessageContent content="plain content" />);
    expect(screen.getByText("plain content")).toBeInTheDocument();
  });

  it("shows a cursor when streaming", () => {
    const { container } = renderWithTheme(
      <MessageContent content="partial" streaming />
    );
    expect(
      container.querySelector(".vf-message-content__cursor")
    ).toBeInTheDocument();
  });

  it("renders message parts", () => {
    renderWithTheme(
      <MessageContent
        content={[
          { type: "text", text: "hello" },
          { type: "code", language: "ts", code: "const x = 1;" },
          { type: "tool_use", name: "search_web" },
        ]}
      />
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
    expect(screen.getByText("→ search_web")).toBeInTheDocument();
  });
});

describe("StreamingText", () => {
  it("renders instant text immediately", () => {
    renderWithTheme(<StreamingText text="immediate" />);
    expect(screen.getByText("immediate")).toBeInTheDocument();
  });

  it("hides cursor when done", () => {
    const { container } = renderWithTheme(
      <StreamingText text="done" cursor />
    );
    const cursor = container.querySelector(".vf-streaming-text__cursor");
    expect(cursor).toHaveClass("vf-streaming-text__cursor--done");
  });
});

describe("ThinkingIndicator", () => {
  it("renders role=status", () => {
    renderWithTheme(<ThinkingIndicator />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("shows duration when provided", () => {
    renderWithTheme(<ThinkingIndicator duration={3200} />);
    expect(screen.getByText("3.2s")).toBeInTheDocument();
  });
});

describe("ReasoningTrace", () => {
  it("is collapsed by default", () => {
    renderWithTheme(
      <ReasoningTrace content="secret">inner</ReasoningTrace>
    );
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("expands on click and exposes aria-expanded", async () => {
    renderWithTheme(<ReasoningTrace content="secret" />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("secret")).toBeInTheDocument();
  });
});

describe("MessageActions", () => {
  it("renders action buttons inside a toolbar", () => {
    renderWithTheme(
      <MessageActions>
        <MessageActions.Copy />
        <MessageActions.Regenerate />
      </MessageActions>
    );
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copy" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Regenerate" })
    ).toBeInTheDocument();
  });

  it("fires onClick from a specific action", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <MessageActions>
        <MessageActions.Copy onClick={onClick} />
      </MessageActions>
    );
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("MessageActions.Regenerate invokes Conversation onRegenerate by default", async () => {
    const onRegenerate = vi.fn();
    renderWithTheme(
      <Conversation onRegenerate={onRegenerate}>
        <MessageActions>
          <MessageActions.Regenerate />
        </MessageActions>
      </Conversation>
    );
    await userEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    expect(onRegenerate).toHaveBeenCalledTimes(1);
  });

  it("MessageActions.Retry invokes Conversation onRetry by default", async () => {
    const onRetry = vi.fn();
    renderWithTheme(
      <Conversation onRetry={onRetry}>
        <MessageActions>
          <MessageActions.Retry />
        </MessageActions>
      </Conversation>
    );
    await userEvent.click(screen.getByRole("button", { name: "Retry" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("MessageActions.Stop invokes Conversation onStop by default", async () => {
    const onStop = vi.fn();
    renderWithTheme(
      <Conversation onStop={onStop}>
        <MessageActions>
          <MessageActions.Stop />
        </MessageActions>
      </Conversation>
    );
    await userEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalledTimes(1);
  });

  it("explicit onClick on Regenerate takes precedence over Conversation onRegenerate (no double-fire)", async () => {
    const explicit = vi.fn();
    const fromContext = vi.fn();
    renderWithTheme(
      <Conversation onRegenerate={fromContext}>
        <MessageActions>
          <MessageActions.Regenerate onClick={explicit} />
        </MessageActions>
      </Conversation>
    );
    await userEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    expect(explicit).toHaveBeenCalledTimes(1);
    expect(fromContext).not.toHaveBeenCalled();
  });
});

describe("MessageFeedback", () => {
  it("emits thumbs up / down", async () => {
    const onChange = vi.fn();
    renderWithTheme(<MessageFeedback onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Thumbs up" }));
    expect(onChange).toHaveBeenCalledWith("up");
  });

  it("toggles off when same direction clicked twice (uncontrolled)", async () => {
    const onChange = vi.fn();
    renderWithTheme(<MessageFeedback onValueChange={onChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Thumbs up" }));
    await userEvent.click(screen.getByRole("button", { name: "Thumbs up" }));
    expect(onChange).toHaveBeenLastCalledWith(null);
  });

  it("shows reasons on thumbs down and tracks selected reason", async () => {
    const onReasonSelect = vi.fn();
    const reasons = [
      { id: "wrong", label: "Wrong answer" },
      { id: "harmful", label: "Harmful" },
    ];
    renderWithTheme(
      <MessageFeedback reasons={reasons} onReasonSelect={onReasonSelect} />
    );
    // Reasons not visible until thumbs down
    expect(screen.queryByText("Wrong answer")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Thumbs down" }));
    expect(screen.getByText("Wrong answer")).toBeInTheDocument();
    // Click a reason — aria-checked becomes true
    const wrongBtn = screen.getByRole("radio", { name: "Wrong answer" });
    expect(wrongBtn).toHaveAttribute("aria-checked", "false");
    await userEvent.click(wrongBtn);
    expect(wrongBtn).toHaveAttribute("aria-checked", "true");
    expect(onReasonSelect).toHaveBeenCalledWith("wrong");
    // Other reason stays unchecked
    expect(screen.getByRole("radio", { name: "Harmful" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
  });

  it("supports controlled selectedReason", () => {
    const reasons = [
      { id: "wrong", label: "Wrong answer" },
      { id: "harmful", label: "Harmful" },
    ];
    renderWithTheme(
      <MessageFeedback
        value="down"
        reasons={reasons}
        selectedReason="harmful"
      />
    );
    expect(screen.getByRole("radio", { name: "Wrong answer" })).toHaveAttribute(
      "aria-checked",
      "false"
    );
    expect(screen.getByRole("radio", { name: "Harmful" })).toHaveAttribute(
      "aria-checked",
      "true"
    );
  });
});

describe("ReactionBar", () => {
  it("renders reactions with counts", () => {
    renderWithTheme(
      <ReactionBar
        reactions={[
          { emoji: "👍", count: 2, reacted: true },
          { emoji: "❤", count: 1 },
        ]}
      />
    );
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("invokes onReact / onUnreact based on state", async () => {
    const onReact = vi.fn();
    const onUnreact = vi.fn();
    renderWithTheme(
      <ReactionBar
        onReact={onReact}
        onUnreact={onUnreact}
        reactions={[
          { emoji: "👍", count: 2, reacted: true },
          { emoji: "❤", count: 1 },
        ]}
      />
    );
    const [first, second] = screen.getAllByRole("button");
    await userEvent.click(first!);
    expect(onUnreact).toHaveBeenCalledWith("👍");
    await userEvent.click(second!);
    expect(onReact).toHaveBeenCalledWith("❤");
  });
});

describe("MessageEdit", () => {
  it("saves on cmd+Enter", async () => {
    const onSave = vi.fn();
    renderWithTheme(
      <MessageEdit value="hello" onValueChange={() => {}} onSave={onSave} />
    );
    const textarea = screen.getByRole("textbox");
    textarea.focus();
    await userEvent.keyboard("{Meta>}{Enter}{/Meta}");
    expect(onSave).toHaveBeenCalledWith("hello");
  });

  it("cancels on Escape", async () => {
    const onCancel = vi.fn();
    renderWithTheme(
      <MessageEdit value="hi" onValueChange={() => {}} onCancel={onCancel} />
    );
    const textarea = screen.getByRole("textbox");
    textarea.focus();
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalled();
  });
});

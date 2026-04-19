import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  MentionInput,
  SlashCommandInput,
  type MentionOption,
  type SlashCommandOption,
} from "../MentionInput";
import { renderWithTheme } from "../../../test/renderWithTheme";

const people: MentionOption[] = [
  { value: "alice", label: "Alice" },
  { value: "bob", label: "Bob", description: "Engineer" },
  { value: "charlie", label: "Charlie" },
];

async function nextTick(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("MentionInput", () => {
  it("renders a textarea", () => {
    renderWithTheme(<MentionInput label="Message" options={people} />);
    expect(screen.getByLabelText("Message")).toBeInTheDocument();
  });

  it("typing @ opens the suggestions popover", async () => {
    renderWithTheme(<MentionInput label="Message" options={people} />);
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "hi @");
    await nextTick();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("filters suggestions by typed query", async () => {
    renderWithTheme(<MentionInput label="Message" options={people} />);
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "@al");
    await nextTick();
    const opts = screen.getAllByRole("option").map((o) => o.textContent);
    expect(opts.some((t) => t?.includes("Alice"))).toBe(true);
    expect(opts.some((t) => t?.includes("Bob"))).toBe(false);
  });

  it("ArrowDown+Enter inserts the highlighted mention", async () => {
    const onChange = vi.fn();
    const onMention = vi.fn();
    renderWithTheme(
      <MentionInput
        label="Message"
        options={people}
        onChange={onChange}
        onMention={onMention}
      />
    );
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "@");
    await nextTick();
    await userEvent.keyboard("{Enter}");
    expect(onMention).toHaveBeenCalledTimes(1);
    const [opt, ctx] = onMention.mock.calls[0]!;
    expect(opt).toEqual(people[0]);
    expect(ctx).toMatchObject({ triggerIndex: expect.any(Number), caret: expect.any(Number), text: expect.any(String) });
    // Last onChange value should include the inserted mention.
    const last = onChange.mock.calls.at(-1)![0];
    expect(last).toContain("@Alice");
  });

  it("Escape closes the popover without inserting", async () => {
    renderWithTheme(<MentionInput label="Message" options={people} />);
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "@");
    await nextTick();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("does not trigger when @ is in the middle of a word", async () => {
    renderWithTheme(<MentionInput label="Message" options={people} />);
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "email@domain");
    await nextTick();
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows 'No matches' when filter has no results", async () => {
    renderWithTheme(<MentionInput label="Message" options={people} />);
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "@zzzzz");
    await nextTick();
    expect(screen.getByText("No matches")).toBeInTheDocument();
  });

  it("disabled option mouseDown does not insert mention", async () => {
    const disabled: MentionOption[] = [
      { value: "alice", label: "Alice", disabled: true },
    ];
    const onMention = vi.fn();
    renderWithTheme(
      <MentionInput label="Message" options={disabled} onMention={onMention} />
    );
    const ta = screen.getByLabelText("Message") as HTMLTextAreaElement;
    await userEvent.type(ta, "@");
    await nextTick();
    const opt = screen.getByRole("option");
    expect(opt).toHaveAttribute("aria-disabled", "true");
  });
});

describe("SlashCommandInput", () => {
  it("/ triggers a command menu", async () => {
    const cmds: SlashCommandOption[] = [
      { value: "bold", label: "Bold" },
      { value: "italic", label: "Italic" },
    ];
    renderWithTheme(<SlashCommandInput label="Doc" commands={cmds} />);
    const ta = screen.getByLabelText("Doc") as HTMLTextAreaElement;
    await userEvent.type(ta, "/");
    await nextTick();
    expect(screen.getByRole("listbox")).toBeInTheDocument();
  });

  it("selecting a command invokes its action and onCommand", async () => {
    const action = vi.fn();
    const onCommand = vi.fn();
    const cmds: SlashCommandOption[] = [
      { value: "bold", label: "Bold", action },
    ];
    renderWithTheme(
      <SlashCommandInput label="Doc" commands={cmds} onCommand={onCommand} />
    );
    const ta = screen.getByLabelText("Doc") as HTMLTextAreaElement;
    await userEvent.type(ta, "/");
    await nextTick();
    await userEvent.keyboard("{Enter}");
    expect(action).toHaveBeenCalled();
    expect(onCommand).toHaveBeenCalledWith(cmds[0]);
  });

  it("action receives live {text, triggerIndex, caret} matching the textarea state", async () => {
    const action = vi.fn();
    const cmds: SlashCommandOption[] = [
      { value: "bold", label: "Bold", action },
    ];
    renderWithTheme(<SlashCommandInput label="Doc" commands={cmds} />);
    const ta = screen.getByLabelText("Doc") as HTMLTextAreaElement;
    // Type "hello " then the trigger "/" then the filter query "b"
    await userEvent.type(ta, "hello /b");
    await nextTick();
    await userEvent.keyboard("{Enter}");
    expect(action).toHaveBeenCalledTimes(1);
    const arg = action.mock.calls[0]![0] as {
      text: string;
      triggerIndex: number;
      caret: number;
    };
    expect(arg.text).toBe("hello /b");
    // "/" lives at index 6 (after "hello ")
    expect(arg.triggerIndex).toBe(6);
    // caret sits just after "b" — index 8
    expect(arg.caret).toBe(8);
  });
});

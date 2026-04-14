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
    expect(onMention).toHaveBeenCalledWith(people[0]);
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
});

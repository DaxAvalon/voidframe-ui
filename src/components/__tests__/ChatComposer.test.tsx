import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Composer,
  ComposerAttachment,
  Mention,
  PromptTemplateEditor,
  PromptTemplateList,
  RegenerateButton,
  SlashCommandPicker,
  StopButton,
  SubmitButton,
  SuggestionChips,
} from "../ChatComposer";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Composer", () => {
  it("submits on Enter", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(
      <Composer onSubmit={onSubmit}>
        <Composer.Input />
        <Composer.Submit />
      </Composer>
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "hello");
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).toHaveBeenCalledWith("hello");
  });

  it("inserts newline on Shift+Enter and does not submit", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(
      <Composer onSubmit={onSubmit}>
        <Composer.Input />
        <Composer.Submit />
      </Composer>
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    await userEvent.type(textarea, "a");
    await userEvent.keyboard("{Shift>}{Enter}{/Shift}");
    await userEvent.type(textarea, "b");
    expect(onSubmit).not.toHaveBeenCalled();
    expect(textarea.value).toContain("\n");
  });

  it("submit becomes stop when streaming", async () => {
    const onStop = vi.fn();
    renderWithTheme(
      <Composer status="streaming" onStop={onStop}>
        <Composer.Input defaultValue="x" />
        <Composer.Submit />
      </Composer>
    );
    const btn = screen.getByRole("button", { name: "Stop" });
    await userEvent.click(btn);
    expect(onStop).toHaveBeenCalled();
  });

  it("renders token counter", () => {
    renderWithTheme(
      <Composer defaultValue="hi" maxLength={100}>
        <Composer.Input />
        <Composer.TokenCounter />
      </Composer>
    );
    expect(screen.getByText(/2.*100/)).toBeInTheDocument();
  });
});

describe("ComposerAttachment", () => {
  it("shows progress and fires onRemove", async () => {
    const onRemove = vi.fn();
    renderWithTheme(
      <ComposerAttachment name="a.png" progress={42} onRemove={onRemove} />
    );
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    await userEvent.click(
      screen.getByRole("button", { name: "Remove attachment" })
    );
    expect(onRemove).toHaveBeenCalled();
  });
});

describe("SubmitButton / StopButton / RegenerateButton", () => {
  it("SubmitButton toggles label and handler based on status", async () => {
    const onSubmit = vi.fn();
    const onStop = vi.fn();
    const { rerender } = renderWithTheme(
      <SubmitButton status="idle" onSubmit={onSubmit} onStop={onStop} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Send" }));
    expect(onSubmit).toHaveBeenCalled();
    rerender(
      <SubmitButton status="streaming" onSubmit={onSubmit} onStop={onStop} />
    );
    await userEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalled();
  });

  it("StopButton + RegenerateButton fire handlers", async () => {
    const onStop = vi.fn();
    const onRegenerate = vi.fn();
    renderWithTheme(<StopButton onStop={onStop} />);
    await userEvent.click(screen.getByRole("button", { name: "Stop" }));
    expect(onStop).toHaveBeenCalled();
    renderWithTheme(<RegenerateButton onRegenerate={onRegenerate} />);
    await userEvent.click(screen.getByRole("button", { name: "Regenerate" }));
    expect(onRegenerate).toHaveBeenCalled();
  });
});

describe("SuggestionChips", () => {
  it("renders suggestions and emits onSelect", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <SuggestionChips
        suggestions={["Summarize", "Translate"]}
        onSelect={onSelect}
      />
    );
    await userEvent.click(screen.getByText("Summarize"));
    expect(onSelect).toHaveBeenCalledWith("Summarize", 0);
  });
});

describe("PromptTemplateList + Editor", () => {
  it("selects a template from the list", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <PromptTemplateList
        onSelect={onSelect}
        templates={[
          {
            id: "t1",
            title: "Summarize",
            body: "Summarize {{topic}}",
            description: "TL;DR",
          },
        ]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: /Summarize/ }));
    expect(onSelect).toHaveBeenCalled();
  });

  it("editor saves with extracted variables", async () => {
    const onSave = vi.fn();
    renderWithTheme(<PromptTemplateEditor onSave={onSave} />);
    const textboxes = screen.getAllByRole("textbox");
    fireEvent.change(textboxes[0]!, { target: { value: "Explain" } });
    fireEvent.change(textboxes[2]!, {
      target: { value: "Explain {{topic}} for {{audience}}" },
    });
    await userEvent.click(screen.getByRole("button", { name: "Save" }));
    expect(onSave).toHaveBeenCalled();
    const saved = onSave.mock.calls[0]![0];
    expect(saved.variables).toEqual(["topic", "audience"]);
  });
});

describe("SlashCommandPicker", () => {
  it("filters commands by input", () => {
    renderWithTheme(
      <SlashCommandPicker
        commands={[
          { id: "help", command: "help" },
          { id: "clear", command: "clear" },
        ]}
        filter="cle"
      />
    );
    expect(screen.queryByText("/help")).not.toBeInTheDocument();
    expect(screen.getByText("/clear")).toBeInTheDocument();
  });

  it("calls onSelect for chosen command", async () => {
    const onSelect = vi.fn();
    renderWithTheme(
      <SlashCommandPicker
        commands={[{ id: "help", command: "help" }]}
        onSelect={onSelect}
      />
    );
    await userEvent.click(screen.getByRole("option"));
    expect(onSelect).toHaveBeenCalledWith({ id: "help", command: "help" });
  });
});

describe("Mention", () => {
  it("renders with a sigil per kind", () => {
    const { rerender, container } = renderWithTheme(
      <Mention value="alice" kind="user" />
    );
    expect(container.querySelector(".vf-mention__sigil")?.textContent).toBe(
      "@"
    );
    rerender(<Mention value="channel" kind="channel" />);
    expect(container.querySelector(".vf-mention__sigil")?.textContent).toBe(
      "#"
    );
  });

  it("becomes an anchor when href is given", () => {
    renderWithTheme(
      <Mention value="alice" href="/u/alice" />
    );
    expect(screen.getByRole("link")).toHaveAttribute("href", "/u/alice");
  });
});

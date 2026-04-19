// Coverage tests for ChatComposer.tsx — slash commands, toolbar, footer, mic, attach, disabled

import { screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  Composer,
  ComposerMicButton,
} from "../ChatComposer";

describe("Composer slash command detection", () => {
  it("fires onSlashCommand when /word is typed then Space", async () => {
    const onSlashCommand = vi.fn();
    renderWithTheme(
      <Composer onSlashCommand={onSlashCommand}>
        <Composer.Input />
      </Composer>
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    // Type /help then Space
    fireEvent.change(textarea, { target: { value: "/help" } });
    // Set selectionStart to end of input
    Object.defineProperty(textarea, "selectionStart", { value: 5, configurable: true });
    fireEvent.keyDown(textarea, { key: " " });
    expect(onSlashCommand).toHaveBeenCalledWith("help");
  });

  it("does not fire onSlashCommand for regular text", async () => {
    const onSlashCommand = vi.fn();
    renderWithTheme(
      <Composer onSlashCommand={onSlashCommand}>
        <Composer.Input />
      </Composer>
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "hello" } });
    Object.defineProperty(textarea, "selectionStart", { value: 5, configurable: true });
    fireEvent.keyDown(textarea, { key: " " });
    expect(onSlashCommand).not.toHaveBeenCalled();
  });
});

describe("Composer disabled state", () => {
  it("does not submit when disabled", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(
      <Composer onSubmit={onSubmit} disabled defaultValue="test">
        <Composer.Input />
        <Composer.Submit />
      </Composer>
    );
    const btn = screen.getByRole("button", { name: "Send" });
    expect(btn).toBeDisabled();
  });

  it("does not submit empty value", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(
      <Composer onSubmit={onSubmit}>
        <Composer.Input />
        <Composer.Submit />
      </Composer>
    );
    const btn = screen.getByRole("button", { name: "Send" });
    expect(btn).toBeDisabled();
  });
});

describe("Composer.Toolbar and Footer", () => {
  it("Toolbar renders with toolbar role", () => {
    renderWithTheme(
      <Composer>
        <Composer.Toolbar data-testid="tb">
          <button>Bold</button>
        </Composer.Toolbar>
        <Composer.Input />
      </Composer>
    );
    expect(screen.getByTestId("tb").getAttribute("role")).toBe("toolbar");
    expect(screen.getByTestId("tb")).toHaveAttribute("aria-label", "Composer actions");
  });

  it("Footer renders children", () => {
    renderWithTheme(
      <Composer>
        <Composer.Input />
        <Composer.Footer data-testid="ft">Footer text</Composer.Footer>
      </Composer>
    );
    expect(screen.getByTestId("ft").textContent).toBe("Footer text");
  });
});

describe("Composer.AttachButton and SlashButton", () => {
  it("AttachButton renders with default label", () => {
    renderWithTheme(
      <Composer>
        <Composer.AttachButton />
        <Composer.Input />
      </Composer>
    );
    expect(screen.getByRole("button", { name: "Attach file" })).toBeInTheDocument();
  });

  it("SlashButton renders with default label", () => {
    renderWithTheme(
      <Composer>
        <Composer.SlashButton />
        <Composer.Input />
      </Composer>
    );
    expect(screen.getByRole("button", { name: "Slash commands" })).toBeInTheDocument();
  });
});

describe("Composer.Submit in streaming mode", () => {
  it("renders stop icon when streaming", () => {
    renderWithTheme(
      <Composer status="streaming" defaultValue="test">
        <Composer.Input />
        <Composer.Submit />
      </Composer>
    );
    const btn = screen.getByRole("button", { name: "Stop" });
    expect(btn.textContent).toBe("■");
    expect(btn).not.toBeDisabled();
  });
});

describe("Composer.Input submitOnEnter=false", () => {
  it("does not submit on Enter when submitOnEnter=false", async () => {
    const onSubmit = vi.fn();
    renderWithTheme(
      <Composer onSubmit={onSubmit} submitOnEnter={false}>
        <Composer.Input />
      </Composer>
    );
    const textarea = screen.getByRole("textbox");
    await userEvent.type(textarea, "hello");
    await userEvent.keyboard("{Enter}");
    expect(onSubmit).not.toHaveBeenCalled();
  });
});

describe("Composer showCount", () => {
  it("TokenCounter shows current length without max", () => {
    renderWithTheme(
      <Composer defaultValue="hi" showCount>
        <Composer.Input />
        <Composer.TokenCounter />
      </Composer>
    );
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

describe("Composer controlled value", () => {
  it("uses controlled value prop", () => {
    renderWithTheme(
      <Composer value="controlled">
        <Composer.Input />
      </Composer>
    );
    const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
    expect(textarea.value).toBe("controlled");
  });

  it("onChange fires when typing", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <Composer onValueChange={onChange}>
        <Composer.Input />
      </Composer>
    );
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "x" } });
    expect(onChange).toHaveBeenCalledWith("x");
  });
});

describe("Composer form submit", () => {
  it("submits on form submit event", () => {
    const onSubmit = vi.fn();
    const { container } = renderWithTheme(
      <Composer onSubmit={onSubmit} defaultValue="test">
        <Composer.Input />
        <Composer.Submit />
      </Composer>
    );
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    expect(onSubmit).toHaveBeenCalledWith("test");
  });

  it("streaming class applied when status=streaming", () => {
    const { container } = renderWithTheme(
      <Composer status="streaming">
        <Composer.Input />
      </Composer>
    );
    expect(container.querySelector(".vf-composer--streaming")).toBeInTheDocument();
  });

  it("disabled class applied when disabled", () => {
    const { container } = renderWithTheme(
      <Composer disabled>
        <Composer.Input />
      </Composer>
    );
    expect(container.querySelector(".vf-composer--disabled")).toBeInTheDocument();
  });
});

describe("ComposerMicButton", () => {
  it("toggles recording on click", async () => {
    const onRecordStart = vi.fn();
    const onRecordStop = vi.fn();
    renderWithTheme(
      <ComposerMicButton onRecordStart={onRecordStart} onRecordStop={onRecordStop} />
    );
    const btn = screen.getByRole("button", { name: "Start recording" });
    expect(btn).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(btn);
    expect(onRecordStart).toHaveBeenCalled();
  });

  it("shows waveform when recording", () => {
    renderWithTheme(
      <ComposerMicButton recording waveform={<div data-testid="wf">wave</div>} />
    );
    expect(screen.getByTestId("wf")).toBeInTheDocument();
  });

  it("hides waveform when not recording", () => {
    renderWithTheme(
      <ComposerMicButton recording={false} waveform={<div data-testid="wf">wave</div>} />
    );
    expect(screen.queryByTestId("wf")).not.toBeInTheDocument();
  });

  it("transcribing adds transcribing class", () => {
    const { container } = renderWithTheme(
      <ComposerMicButton transcribing />
    );
    expect(container.querySelector(".vf-composer__mic--transcribing")).toBeInTheDocument();
  });
});

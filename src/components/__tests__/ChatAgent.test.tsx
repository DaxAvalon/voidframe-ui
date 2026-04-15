import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AgentStep,
  AgentTrace,
  PlanDisplay,
  ToolCall,
  ToolCallGroup,
} from "../ChatAgent";
import {
  Attachment,
  AttachmentList,
  CodeAttachment,
  FileAttachment,
  ImageAttachment,
} from "../ChatAttachments";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("ToolCall", () => {
  it("renders name and status", () => {
    renderWithTheme(<ToolCall name="search_web" status="running" />);
    expect(screen.getByText("search_web")).toBeInTheDocument();
    const toggle = screen.getByRole("button", { expanded: false });
    expect(toggle).toBeInTheDocument();
  });

  it("toggles args + result on expand", async () => {
    renderWithTheme(
      <ToolCall
        name="search_web"
        status="complete"
        args={{ q: "hello" }}
        result="OK"
      />
    );
    const trigger = screen.getByRole("button", { expanded: false });
    await userEvent.click(trigger);
    expect(screen.getByText("Arguments")).toBeInTheDocument();
    expect(screen.getByText("Result")).toBeInTheDocument();
  });

  it("shows retry for error status", async () => {
    const onRetry = vi.fn();
    renderWithTheme(
      <ToolCall
        name="t"
        status="error"
        errorMessage="boom"
        onRetry={onRetry}
        defaultExpanded
      />
    );
    const retry = screen.getByRole("button", { name: "Retry" });
    await userEvent.click(retry);
    expect(onRetry).toHaveBeenCalled();
  });
});

describe("ToolCallGroup", () => {
  it("renders children under a title", () => {
    renderWithTheme(
      <ToolCallGroup title="Searching" status="running">
        <ToolCall name="a" />
        <ToolCall name="b" />
      </ToolCallGroup>
    );
    expect(screen.getByText("Searching")).toBeInTheDocument();
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
  });
});

describe("AgentStep", () => {
  it("collapses body by default", () => {
    renderWithTheme(
      <AgentStep title="Analyze" status="complete">
        inner
      </AgentStep>
    );
    expect(screen.queryByText("inner")).not.toBeInTheDocument();
  });

  it("expands and shows children + output", async () => {
    renderWithTheme(
      <AgentStep title="Analyze" output="done">
        <span>extra</span>
      </AgentStep>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("done")).toBeInTheDocument();
    expect(screen.getByText("extra")).toBeInTheDocument();
  });
});

describe("AgentTrace", () => {
  it("shows token and cost metrics", () => {
    renderWithTheme(
      <AgentTrace
        tokens={{ input: 100, output: 50 }}
        cost="$0.001"
        duration={2500}
        steps={<div>step</div>}
      />
    );
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText("$0.001")).toBeInTheDocument();
    expect(screen.getByText("2.5s")).toBeInTheDocument();
    expect(screen.getByText("step")).toBeInTheDocument();
  });
});

describe("PlanDisplay", () => {
  it("renders steps with status markers", () => {
    renderWithTheme(
      <PlanDisplay
        steps={[
          { id: "1", title: "Step 1", status: "done" },
          { id: "2", title: "Step 2", status: "active" },
          { id: "3", title: "Step 3", status: "pending" },
        ]}
      />
    );
    expect(screen.getByText("Step 1")).toBeInTheDocument();
    const active = screen.getByText("Step 2").closest("li");
    expect(active).toHaveAttribute("data-status", "active");
  });

  it("fires onStepClick", async () => {
    const onStepClick = vi.fn();
    renderWithTheme(
      <PlanDisplay
        steps={[{ id: "1", title: "A" }]}
        onStepClick={onStepClick}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onStepClick).toHaveBeenCalledWith("1");
  });
});

// ── Attachments ──

describe("AttachmentList + Attachment", () => {
  it("wraps items in role=list", () => {
    renderWithTheme(
      <AttachmentList>
        <Attachment name="a.txt" size="2KB" />
      </AttachmentList>
    );
    expect(screen.getByRole("list")).toBeInTheDocument();
  });

  it("fires open and remove handlers", async () => {
    const onOpen = vi.fn();
    const onRemove = vi.fn();
    renderWithTheme(
      <Attachment
        name="a.txt"
        onOpen={onOpen}
        onRemove={onRemove}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Open a.txt" }));
    expect(onOpen).toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Remove" }));
    expect(onRemove).toHaveBeenCalled();
  });
});

describe("ImageAttachment", () => {
  it("renders an img with alt text", () => {
    renderWithTheme(
      <ImageAttachment src="http://x/img.png" alt="preview" />
    );
    expect(screen.getByAltText("preview")).toBeInTheDocument();
  });
});

describe("FileAttachment", () => {
  it("uses extension as icon label when provided", () => {
    renderWithTheme(
      <FileAttachment name="report.pdf" extension="pdf" />
    );
    expect(screen.getByText("PDF")).toBeInTheDocument();
  });
});

describe("CodeAttachment", () => {
  it("truncates long code to the configured lines", () => {
    const long = Array.from({ length: 20 }).map((_, i) => `line ${i}`).join("\n");
    const { container } = renderWithTheme(
      <CodeAttachment code={long} lines={5} language="ts" filename="x.ts" />
    );
    expect(screen.getByText("x.ts")).toBeInTheDocument();
    expect(container.textContent).toContain("line 0");
    expect(container.textContent).toContain("…");
    expect(container.textContent).not.toContain("line 19");
  });
});

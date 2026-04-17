import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  MockDataGrid,
  MockCalendar,
  MockRichTextEditor,
  MockMarkdownEditor,
  MockCodeEditor,
  MockConversation,
  mockComponents,
} from "../mocks";

describe("Mock components", () => {
  it("MockDataGrid renders with data-testid", () => {
    render(<MockDataGrid columns={[]} data={[1, 2, 3]} />);
    expect(screen.getByTestId("vf-mock-datagrid")).toBeInTheDocument();
  });

  it("MockDataGrid exposes data props", () => {
    render(<MockDataGrid columns={["a"]} data={[1, 2]} />);
    expect(screen.getByTestId("vf-mock-datagrid")).toHaveAttribute("data-data", "1,2");
  });

  it("MockCalendar renders", () => {
    render(<MockCalendar />);
    expect(screen.getByTestId("vf-mock-calendar")).toBeInTheDocument();
  });

  it("MockRichTextEditor renders", () => {
    render(<MockRichTextEditor value="hello" />);
    expect(screen.getByTestId("vf-mock-richtexteditor")).toBeInTheDocument();
  });

  it("MockMarkdownEditor renders", () => {
    render(<MockMarkdownEditor />);
    expect(screen.getByTestId("vf-mock-markdowneditor")).toBeInTheDocument();
  });

  it("MockCodeEditor renders with language", () => {
    render(<MockCodeEditor language="typescript" />);
    const el = screen.getByTestId("vf-mock-codeeditor");
    expect(el).toHaveAttribute("data-language", "typescript");
  });

  it("MockConversation renders", () => {
    render(<MockConversation />);
    expect(screen.getByTestId("vf-mock-conversation")).toBeInTheDocument();
  });

  it("all mocks have displayName", () => {
    expect(MockDataGrid.displayName).toBe("MockDataGrid");
    expect(MockCalendar.displayName).toBe("MockCalendar");
    expect(MockRichTextEditor.displayName).toBe("MockRichTextEditor");
    expect(MockMarkdownEditor.displayName).toBe("MockMarkdownEditor");
    expect(MockCodeEditor.displayName).toBe("MockCodeEditor");
    expect(MockConversation.displayName).toBe("MockConversation");
  });

  it("mockComponents object contains all mocks", () => {
    expect(mockComponents).toHaveProperty("DataGrid");
    expect(mockComponents).toHaveProperty("Calendar");
    expect(mockComponents).toHaveProperty("RichTextEditor");
    expect(mockComponents).toHaveProperty("MarkdownEditor");
    expect(mockComponents).toHaveProperty("CodeEditor");
    expect(mockComponents).toHaveProperty("Conversation");
  });
});

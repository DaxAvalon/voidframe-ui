import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Citation,
  CitationList,
  RAGContext,
  SourceCard,
  SourceGrid,
} from "../ChatCitations";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Citation", () => {
  it("renders index as text", () => {
    renderWithTheme(<Citation index={3} source={{ title: "Example" }} />);
    expect(screen.getByText("[3]")).toBeInTheDocument();
  });

  it("becomes a button when onClick given", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Citation index={1} source={{ title: "X" }} onClick={onClick} />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledWith({ title: "X" });
  });
});

describe("CitationList", () => {
  it("renders one entry per source", () => {
    renderWithTheme(
      <CitationList
        sources={[
          { id: 1, title: "First source" },
          { id: 2, title: "Second source" },
        ]}
      />
    );
    expect(screen.getByText("First source")).toBeInTheDocument();
    expect(screen.getByText("Second source")).toBeInTheDocument();
  });

  it("calls onSourceClick when provided", async () => {
    const onSourceClick = vi.fn();
    renderWithTheme(
      <CitationList
        onSourceClick={onSourceClick}
        sources={[{ id: "a", title: "One" }]}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onSourceClick).toHaveBeenCalledWith({ id: "a", title: "One" });
  });
});

describe("SourceCard", () => {
  it("renders a link when url is provided", () => {
    renderWithTheme(
      <SourceCard title="Example" url="https://example.com" snippet="body" />
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(screen.getByText("Example")).toBeInTheDocument();
  });

  it("becomes a button with onOpen", async () => {
    const onOpen = vi.fn();
    renderWithTheme(<SourceCard title="Example" onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onOpen).toHaveBeenCalled();
  });
});

describe("SourceGrid", () => {
  it("renders one card per source", () => {
    renderWithTheme(
      <SourceGrid
        sources={[
          { id: 1, title: "First" },
          { id: 2, title: "Second" },
        ]}
      />
    );
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
  });

  it("applies custom columns to grid style", () => {
    const { container } = renderWithTheme(
      <SourceGrid
        columns={3}
        sources={[{ id: 1, title: "A" }]}
      />
    );
    const grid = container.querySelector(".vf-source-grid") as HTMLElement;
    expect(grid.style.gridTemplateColumns).toContain("repeat(3");
  });
});

describe("RAGContext", () => {
  it("shows collapsed summary by default", () => {
    renderWithTheme(
      <RAGContext
        chunks={[
          { source: "Doc A", content: "hidden body" },
        ]}
      />
    );
    expect(screen.queryByText("hidden body")).not.toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("expands on click", async () => {
    renderWithTheme(
      <RAGContext
        chunks={[{ source: "Doc A", content: "hidden body" }]}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("hidden body")).toBeInTheDocument();
  });

  it("displays chunk score when provided", async () => {
    renderWithTheme(
      <RAGContext
        chunks={[{ source: "Doc B", content: "body", score: 0.95 }]}
      />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(screen.getByText("0.95")).toBeInTheDocument();
  });
});

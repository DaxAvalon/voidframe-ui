import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";
import { CSVViewer, parseCSV } from "../CSVViewer";

const csvString = `Name,Age,City
Alice,30,NYC
Bob,25,LA
Charlie,35,Chicago`;

const csvArray = [
  ["Name", "Age", "City"],
  ["Alice", "30", "NYC"],
  ["Bob", "25", "LA"],
];

describe("CSVViewer", () => {
  it("renders from CSV string", () => {
    renderWithTheme(<CSVViewer data={csvString} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("renders from 2D array", () => {
    renderWithTheme(<CSVViewer data={csvArray} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("uses first row as header", () => {
    renderWithTheme(<CSVViewer data={csvString} />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Age")).toBeInTheDocument();
    expect(screen.getByText("City")).toBeInTheDocument();
  });

  it("hasHeader={false} generates A,B,C headers", () => {
    const noHeaderData = "Alice,30,NYC\nBob,25,LA";
    renderWithTheme(<CSVViewer data={noHeaderData} hasHeader={false} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.getByText("C")).toBeInTheDocument();
    // Data should still appear
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("auto-detects comma delimiter", () => {
    renderWithTheme(<CSVViewer data={csvString} />);
    // Columns should be split correctly
    expect(screen.getByText("NYC")).toBeInTheDocument();
  });

  it("handles quoted fields with commas", () => {
    const quoted = `Name,Address\nAlice,"123 Main St, Apt 4"\nBob,"456 Oak Ave"`;
    renderWithTheme(<CSVViewer data={quoted} />);
    expect(screen.getByText("123 Main St, Apt 4")).toBeInTheDocument();
  });

  it("right-aligns numbers", () => {
    const { container } = renderWithTheme(<CSVViewer data={csvString} />);
    const numberCells = container.querySelectorAll(
      ".vf-csv-viewer__cell--number"
    );
    expect(numberCells.length).toBeGreaterThan(0);
  });

  it("displays row numbers by default", () => {
    const { container } = renderWithTheme(<CSVViewer data={csvString} />);
    const rowNums = container.querySelectorAll(".vf-csv-viewer__row-number");
    // Header + 3 data rows
    expect(rowNums.length).toBe(4);
  });

  it("hides row numbers when showRowNumbers={false}", () => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} showRowNumbers={false} />
    );
    const rowNums = container.querySelectorAll(".vf-csv-viewer__row-number");
    expect(rowNums.length).toBe(0);
  });

  it("highlights row with highlightRow", () => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} highlightRow={1} />
    );
    const highlighted = container.querySelectorAll(
      ".vf-csv-viewer__row--highlighted"
    );
    expect(highlighted.length).toBe(1);
  });

  it("highlights column with highlightColumn", () => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} highlightColumn={0} />
    );
    const highlighted = container.querySelectorAll(
      ".vf-csv-viewer__cell--highlighted"
    );
    expect(highlighted.length).toBeGreaterThan(0);
  });

  it("fires onCellClick with row, col, value", async () => {
    const handleClick = vi.fn();
    renderWithTheme(
      <CSVViewer data={csvString} onCellClick={handleClick} />
    );
    await userEvent.click(screen.getByText("Alice"));
    expect(handleClick).toHaveBeenCalledWith(0, 0, "Alice");
  });

  it("applies sticky header class", () => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} stickyHeader />
    );
    expect(
      container.querySelector(".vf-csv-viewer__header--sticky")
    ).toBeInTheDocument();
  });

  it("applies striped rows", () => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} striped />
    );
    const striped = container.querySelectorAll(
      ".vf-csv-viewer__row--striped"
    );
    expect(striped.length).toBeGreaterThan(0);
  });

  it("shows stats footer", () => {
    renderWithTheme(<CSVViewer data={csvString} showStats />);
    expect(screen.getByText("3 rows, 3 columns")).toBeInTheDocument();
  });

  it("applies compact class", () => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} compact />
    );
    expect(
      container.querySelector(".vf-csv-viewer--compact")
    ).toBeInTheDocument();
  });

  it.each(["sm", "md"] as const)("size=%s applies class", (size) => {
    const { container } = renderWithTheme(
      <CSVViewer data={csvString} size={size} />
    );
    expect(
      container.querySelector(`.vf-csv-viewer--${size}`)
    ).toBeInTheDocument();
  });

  it("has no a11y violations (table with thead/tbody)", async () => {
    const { container } = renderWithTheme(<CSVViewer data={csvString} />);
    await expectNoA11yViolations(container);
  });
});

describe("parseCSV", () => {
  it("handles quoted fields with embedded delimiters", () => {
    const result = parseCSV('a,"b,c",d', ",");
    expect(result).toEqual([["a", "b,c", "d"]]);
  });

  it("handles escaped quotes", () => {
    const result = parseCSV('a,"b""c",d', ",");
    expect(result).toEqual([["a", 'b"c', "d"]]);
  });
});

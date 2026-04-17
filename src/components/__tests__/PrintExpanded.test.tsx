// Expanded tests for Print components — covering PrintLayout variants and PrintButton behavior

import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useRef } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { PrintLayout, PrintButton } from "../Print";

describe("PrintLayout", () => {
  it("renders title and subtitle in header", () => {
    renderWithTheme(
      <PrintLayout title="Report" subtitle="Q1 2024">
        Body
      </PrintLayout>
    );
    expect(screen.getByText("Report")).toBeInTheDocument();
    expect(screen.getByText("Q1 2024")).toBeInTheDocument();
  });

  it("hides header when includeHeader=false", () => {
    renderWithTheme(
      <PrintLayout title="Hidden" includeHeader={false}>
        Body
      </PrintLayout>
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
  });

  it("renders footer when includeFooter=true", () => {
    renderWithTheme(
      <PrintLayout includeFooter footer="Page 1 of 3">
        Body
      </PrintLayout>
    );
    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("hides footer by default", () => {
    renderWithTheme(
      <PrintLayout footer="Hidden footer">Body</PrintLayout>
    );
    expect(screen.queryByText("Hidden footer")).not.toBeInTheDocument();
  });

  it("applies break class", () => {
    const { container } = renderWithTheme(
      <PrintLayout pageBreakInside="auto">Body</PrintLayout>
    );
    expect(
      container.querySelector(".vf-print-layout--break-auto")
    ).toBeInTheDocument();
  });

  it("sets data-print-layout attribute", () => {
    const { container } = renderWithTheme(
      <PrintLayout>Body</PrintLayout>
    );
    expect(container.querySelector("[data-print-layout]")).toBeInTheDocument();
  });
});

describe("PrintButton", () => {
  it("renders with default text", () => {
    renderWithTheme(<PrintButton />);
    expect(screen.getByRole("button", { name: "Print" })).toBeInTheDocument();
  });

  it("renders custom children", () => {
    renderWithTheme(<PrintButton>Export PDF</PrintButton>);
    expect(screen.getByRole("button", { name: "Export PDF" })).toBeInTheDocument();
  });

  it("calls window.print when clicked without target", async () => {
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    renderWithTheme(<PrintButton />);
    await userEvent.click(screen.getByRole("button"));
    expect(printSpy).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("calls onClick handler", async () => {
    const onClick = vi.fn();
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    renderWithTheme(<PrintButton onClick={onClick} />);
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("does not print when onClick prevents default", async () => {
    const printSpy = vi.fn();
    vi.stubGlobal("print", printSpy);
    renderWithTheme(
      <PrintButton onClick={(e) => e.preventDefault()} />
    );
    await userEvent.click(screen.getByRole("button"));
    expect(printSpy).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

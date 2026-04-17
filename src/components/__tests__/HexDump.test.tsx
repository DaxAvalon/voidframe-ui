import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";
import { HexDump } from "../HexDump";

describe("HexDump", () => {
  const sampleData = new Uint8Array([
    0x48, 0x65, 0x6c, 0x6c, 0x6f, 0x00, 0x01, 0xff,
  ]);

  it("renders from Uint8Array", () => {
    renderWithTheme(<HexDump data={sampleData} />);
    expect(screen.getByText("48")).toBeInTheDocument();
    expect(screen.getByText("65")).toBeInTheDocument();
  });

  it("renders from number array", () => {
    renderWithTheme(<HexDump data={[0x41, 0x42, 0x43]} />);
    expect(screen.getByText("41")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("defaults to 16 bytes per row", () => {
    const data = new Uint8Array(32);
    for (let i = 0; i < 32; i++) data[i] = i;
    const { container } = renderWithTheme(<HexDump data={data} />);
    const rows = container.querySelectorAll(".vf-hex-dump__row");
    expect(rows.length).toBe(2);
  });

  it("respects custom bytesPerRow", () => {
    const data = new Uint8Array(16);
    const { container } = renderWithTheme(
      <HexDump data={data} bytesPerRow={8} />
    );
    const rows = container.querySelectorAll(".vf-hex-dump__row");
    expect(rows.length).toBe(2);
  });

  it("shows hex offset by default", () => {
    renderWithTheme(<HexDump data={sampleData} />);
    expect(screen.getByText("0000")).toBeInTheDocument();
  });

  it("shows decimal offset when offsetBase='decimal'", () => {
    renderWithTheme(<HexDump data={sampleData} offsetBase="decimal" />);
    // 8 bytes total -> padding is 1 digit, offset starts at "0"
    const offsets = document.querySelectorAll(".vf-hex-dump__row .vf-hex-dump__offset");
    expect(offsets.length).toBeGreaterThan(0);
    // Should be numeric, not hex
    expect(offsets[0]?.textContent).toMatch(/^\d+$/);
  });

  it("hides offset when showOffset={false}", () => {
    const { container } = renderWithTheme(
      <HexDump data={sampleData} showOffset={false} />
    );
    const offsets = container.querySelectorAll(".vf-hex-dump__offset");
    expect(offsets.length).toBe(0);
  });

  it("shows printable ASCII characters", () => {
    // H=0x48, e=0x65
    const { container } = renderWithTheme(<HexDump data={sampleData} />);
    // Skip header, get the row's ASCII section
    const asciiSections = container.querySelectorAll(".vf-hex-dump__row .vf-hex-dump__ascii");
    expect(asciiSections.length).toBeGreaterThan(0);
    const text = asciiSections[0]?.textContent ?? "";
    expect(text).toContain("H");
    expect(text).toContain("e");
  });

  it("shows non-printable as '.'", () => {
    const { container } = renderWithTheme(<HexDump data={sampleData} />);
    const nonPrintable = container.querySelectorAll(
      ".vf-hex-dump__char--nonprintable"
    );
    expect(nonPrintable.length).toBeGreaterThan(0);
    expect(nonPrintable[0]?.textContent).toBe(".");
  });

  it("hides ASCII when showAscii={false}", () => {
    const { container } = renderWithTheme(
      <HexDump data={sampleData} showAscii={false} />
    );
    // Only the header ASCII should be absent too
    const asciiSections = container.querySelectorAll(".vf-hex-dump__ascii");
    expect(asciiSections.length).toBe(0);
  });

  it("applies highlighted class for highlightRanges", () => {
    const { container } = renderWithTheme(
      <HexDump
        data={sampleData}
        highlightRanges={[{ start: 0, end: 3 }]}
      />
    );
    const highlighted = container.querySelectorAll(
      ".vf-hex-dump__byte--highlighted"
    );
    // 3 hex bytes + 3 ASCII chars
    expect(highlighted.length).toBe(6);
  });

  it("fires onByteClick with offset", () => {
    const handleClick = vi.fn();
    const { container } = renderWithTheme(
      <HexDump data={sampleData} onByteClick={handleClick} />
    );
    const byte = container.querySelector(
      '.vf-hex-dump__byte[data-offset="2"]'
    );
    fireEvent.click(byte!);
    expect(handleClick).toHaveBeenCalledWith(2);
  });

  it("fires onByteHover with offset on enter and null on leave", () => {
    const handleHover = vi.fn();
    const { container } = renderWithTheme(
      <HexDump data={sampleData} onByteHover={handleHover} />
    );
    const byte = container.querySelector(
      '.vf-hex-dump__byte[data-offset="1"]'
    );
    fireEvent.mouseEnter(byte!);
    expect(handleHover).toHaveBeenCalledWith(1);
    fireEvent.mouseLeave(byte!);
    expect(handleHover).toHaveBeenCalledWith(null);
  });

  it("applies selected class for selectedRange", () => {
    const { container } = renderWithTheme(
      <HexDump data={sampleData} selectedRange={[1, 3]} />
    );
    const selected = container.querySelectorAll(
      ".vf-hex-dump__byte--selected"
    );
    // 3 hex bytes + 3 ASCII chars
    expect(selected.length).toBe(6);
  });

  it("groups bytes by groupSize", () => {
    const { container } = renderWithTheme(
      <HexDump data={sampleData} groupSize={4} />
    );
    const seps = container.querySelectorAll(".vf-hex-dump__group-sep");
    // 8 bytes / 4 = 2 groups, so 1 separator
    expect(seps.length).toBe(1);
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(<HexDump data={sampleData} />);
    await expectNoA11yViolations(container);
  });
});

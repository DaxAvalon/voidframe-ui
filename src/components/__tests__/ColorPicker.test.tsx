import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  ColorPicker,
  hexToRgba,
  rgbaToHex,
  rgbaToHsla,
  hslaToRgba,
} from "../ColorPicker";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("color conversions", () => {
  it("hexToRgba supports 3/6/8 digit forms", () => {
    expect(hexToRgba("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(hexToRgba("#ff8800")).toEqual({ r: 255, g: 136, b: 0, a: 1 });
    const rgba = hexToRgba("#ff000080");
    expect(rgba?.r).toBe(255);
    expect(rgba?.a).toBeCloseTo(0.5, 1);
  });

  it("rgbaToHex pads and omits alpha when opaque", () => {
    expect(rgbaToHex({ r: 0, g: 0, b: 0, a: 1 })).toBe("#000000");
    expect(rgbaToHex({ r: 255, g: 255, b: 255, a: 1 })).toBe("#ffffff");
    expect(rgbaToHex({ r: 255, g: 0, b: 0, a: 0.5 })).toBe("#ff000080");
  });

  it("round-trips through HSL", () => {
    const hsla = rgbaToHsla({ r: 255, g: 136, b: 0, a: 1 });
    const back = hslaToRgba(hsla);
    expect(Math.round(back.r)).toBe(255);
    expect(Math.round(back.g)).toBe(136);
    expect(Math.round(back.b)).toBe(0);
  });
});

describe("ColorPicker", () => {
  it("renders hex + sliders", () => {
    renderWithTheme(<ColorPicker label="Accent" defaultValue="#ff8800" />);
    expect((screen.getByLabelText("Hex color") as HTMLInputElement).value).toBe(
      "#ff8800"
    );
    expect(screen.getByLabelText("Hue")).toBeInTheDocument();
    expect(screen.getByLabelText("Saturation")).toBeInTheDocument();
    expect(screen.getByLabelText("Lightness")).toBeInTheDocument();
  });

  it("alpha slider only appears with allowAlpha", () => {
    const { rerender } = renderWithTheme(
      <ColorPicker label="Accent" />
    );
    expect(screen.queryByLabelText("Alpha")).not.toBeInTheDocument();
    rerender(<ColorPicker label="Accent" allowAlpha />);
    expect(screen.getByLabelText("Alpha")).toBeInTheDocument();
  });

  it("typing a valid hex updates onChange", async () => {
    const onChange = vi.fn();
    renderWithTheme(<ColorPicker label="Accent" onChange={onChange} />);
    const input = screen.getByLabelText("Hex color") as HTMLInputElement;
    await userEvent.clear(input);
    await userEvent.type(input, "#00ff00");
    expect(onChange).toHaveBeenLastCalledWith("#00ff00");
  });

  it("dragging the hue slider emits a color", () => {
    const onChange = vi.fn();
    renderWithTheme(<ColorPicker label="Accent" onChange={onChange} />);
    const hue = screen.getByLabelText("Hue") as HTMLInputElement;
    fireEvent.change(hue, { target: { value: "120" } });
    expect(onChange).toHaveBeenCalled();
    const last = onChange.mock.calls.at(-1)![0];
    expect(typeof last).toBe("string");
    expect(last).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("clicking a swatch applies that color", async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <ColorPicker
        label="Accent"
        swatches={["#ff0000", "#00ff00", "#0000ff"]}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "#00ff00" }));
    expect(onChange).toHaveBeenLastCalledWith("#00ff00");
  });

  it("has no a11y violations", async () => {
    const { container } = renderWithTheme(
      <ColorPicker label="Accent" swatches={["#ff0000"]} />
    );
    await expectNoA11yViolations(container);
  });
});

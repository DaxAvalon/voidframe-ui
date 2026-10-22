import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { VoidframeProvider, useTheme } from "../VoidframeProvider";
import { ThemeSelector } from "../../components/ThemeSelector";
import { THEME_OPTIONS } from "../../themes";

function Probe() {
  const { themeName, resolvedThemeName, setThemeName } = useTheme();
  return (
    <div>
      <span data-testid="name">{String(themeName)}</span>
      <span data-testid="resolved">{resolvedThemeName}</span>
      <button onClick={() => setThemeName("light")}>light</button>
    </div>
  );
}

describe("useTheme", () => {
  it("uncontrolled provider owns the name; setThemeName updates it and the data attribute", async () => {
    const onChange = vi.fn();
    render(
      <VoidframeProvider defaultThemeName="midnight" onThemeNameChange={onChange} scope="root">
        <Probe />
      </VoidframeProvider>
    );
    expect(screen.getByTestId("name")).toHaveTextContent("midnight");
    expect(document.querySelector(".vf-root")).toHaveAttribute("data-vf-theme", "midnight");
    await userEvent.click(screen.getByRole("button", { name: "light" }));
    expect(screen.getByTestId("name")).toHaveTextContent("light");
    expect(document.querySelector(".vf-root")).toHaveAttribute("data-vf-theme", "light");
    expect(onChange).toHaveBeenCalledWith("light");
  });

  it("controlled provider only reports; the parent decides", async () => {
    const onChange = vi.fn();
    render(
      <VoidframeProvider themeName="dark" onThemeNameChange={onChange} scope="root">
        <Probe />
      </VoidframeProvider>
    );
    await userEvent.click(screen.getByRole("button", { name: "light" }));
    expect(onChange).toHaveBeenCalledWith("light");
    expect(screen.getByTestId("name")).toHaveTextContent("dark");
  });

  it("outside a provider it reports dark and warns on set", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    render(<Probe />);
    expect(screen.getByTestId("name")).toHaveTextContent("dark");
    act(() => screen.getByRole("button", { name: "light" }).click());
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it("ThemeSelector connected binds to the provider and lists THEME_OPTIONS by default", async () => {
    render(
      <VoidframeProvider defaultThemeName="dark" scope="root">
        <ThemeSelector connected kind="list" />
        <Probe />
      </VoidframeProvider>
    );
    const radios = screen.getAllByRole("radio");
    expect(radios.length).toBe(THEME_OPTIONS.length);
    expect(screen.getByRole("radio", { name: /^Dark/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByText("Follow the operating system's light or dark setting.")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: /^Booth/ }));
    expect(screen.getByTestId("name")).toHaveTextContent("booth");
    expect(screen.getByRole("radio", { name: /^Booth/ })).toHaveAttribute("aria-checked", "true");
    expect(document.querySelector(".vf-theme-selector--list")).toBeTruthy();
  });

  it("explicit value still wins over connected", () => {
    render(
      <VoidframeProvider defaultThemeName="dark" scope="root">
        <ThemeSelector connected value="grey" />
      </VoidframeProvider>
    );
    expect(screen.getByRole("radio", { name: /^Grey/ })).toHaveAttribute("aria-checked", "true");
  });
});

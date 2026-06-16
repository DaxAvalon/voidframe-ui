import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "../../test/renderWithTheme";
import AiConsole from "../showcase/AiConsole";

describe("AI Console showcase", () => {
  it("mounts the full composition without crashing", () => {
    renderWithTheme(<AiConsole />);
    // Header + transcript content from the assembled components.
    expect(screen.getAllByText("deploy-bot").length).toBeGreaterThan(0);
    expect(screen.getByText(/CI is red on main/)).toBeTruthy();
  });

  it("renders the agent trace steps and plan", () => {
    renderWithTheme(<AiConsole />);
    expect(screen.getByText("Inspect CI logs")).toBeTruthy();
    expect(screen.getByText("Reproduce locally")).toBeTruthy();
    expect(screen.getByText(/Open a PR with the fix/)).toBeTruthy();
  });

  it("renders the status bar metrics", () => {
    renderWithTheme(<AiConsole />);
    expect(screen.getByText("MODEL")).toBeTruthy();
    // Appears in both the header badge and the status bar.
    expect(screen.getAllByText("claude-opus-4").length).toBeGreaterThan(0);
  });
});

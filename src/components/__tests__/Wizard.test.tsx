import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Wizard } from "../Wizard";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Wizard", () => {
  it("shows only the active step", () => {
    renderWithTheme(
      <Wizard defaultValue="a">
        <Wizard.Step id="a">A content</Wizard.Step>
        <Wizard.Step id="b">B content</Wizard.Step>
      </Wizard>
    );
    expect(screen.getByText("A content")).toBeInTheDocument();
    expect(screen.queryByText("B content")).not.toBeInTheDocument();
  });

  it("Next advances, Previous rewinds", async () => {
    renderWithTheme(
      <Wizard defaultValue="a">
        <Wizard.Step id="a">A</Wizard.Step>
        <Wizard.Step id="b">B</Wizard.Step>
        <Wizard.Footer>
          <Wizard.Previous />
          <Wizard.Next />
        </Wizard.Footer>
      </Wizard>
    );
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("B")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Back" }));
    expect(screen.getByText("A")).toBeInTheDocument();
  });

  it("canAdvance=false disables Next", () => {
    renderWithTheme(
      <Wizard defaultValue="a" canAdvance={() => false}>
        <Wizard.Step id="a">A</Wizard.Step>
        <Wizard.Step id="b">B</Wizard.Step>
        <Wizard.Footer>
          <Wizard.Next />
        </Wizard.Footer>
      </Wizard>
    );
    expect(screen.getByRole("button", { name: "Next" })).toBeDisabled();
  });

  it("fires onComplete on final Next", async () => {
    const onComplete = vi.fn();
    renderWithTheme(
      <Wizard defaultValue="b" onComplete={onComplete}>
        <Wizard.Step id="a">A</Wizard.Step>
        <Wizard.Step id="b">B</Wizard.Step>
        <Wizard.Footer>
          <Wizard.Next />
        </Wizard.Footer>
      </Wizard>
    );
    await userEvent.click(screen.getByRole("button", { name: "Finish" }));
    expect(onComplete).toHaveBeenCalled();
  });

  it("StepIndicator reflects current position", () => {
    renderWithTheme(
      <Wizard defaultValue="b">
        <Wizard.Step id="a">A</Wizard.Step>
        <Wizard.Step id="b">B</Wizard.Step>
        <Wizard.Step id="c">C</Wizard.Step>
        <Wizard.StepIndicator />
      </Wizard>
    );
    expect(screen.getByRole("status")).toHaveTextContent("Step 2 of 3");
  });
});

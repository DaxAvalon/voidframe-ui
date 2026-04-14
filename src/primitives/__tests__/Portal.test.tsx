import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Portal } from "../Portal";

describe("Portal", () => {
  it("renders children into document.body by default", () => {
    render(
      <Portal>
        <div data-testid="p">hello</div>
      </Portal>
    );
    const el = screen.getByTestId("p");
    expect(el.parentElement).toBe(document.body);
  });

  it("respects a custom container", () => {
    const container = document.createElement("div");
    container.id = "custom";
    document.body.appendChild(container);

    render(
      <Portal container={container}>
        <span data-testid="p">x</span>
      </Portal>
    );

    expect(screen.getByTestId("p").parentElement).toBe(container);
    document.body.removeChild(container);
  });
});

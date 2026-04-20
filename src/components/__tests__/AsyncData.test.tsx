import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { AsyncData } from "../AsyncData";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("AsyncData", () => {
  it("renders children when data is present", () => {
    renderWithTheme(
      <AsyncData status="success" data={{ name: "Alice" }} empty={<div>empty</div>}>
        {(d) => <div>{(d as { name: string }).name}</div>}
      </AsyncData>
    );
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("status=success with undefined data renders the empty slot", () => {
    renderWithTheme(
      <AsyncData status="success" empty={<div>No rows yet</div>}>
        {(d) => <div>has data: {String(d)}</div>}
      </AsyncData>
    );
    expect(screen.getByText("No rows yet")).toBeInTheDocument();
  });

  it("renders loading slot", () => {
    renderWithTheme(
      <AsyncData status="loading" loading={<div>Wait</div>}>
        {() => null}
      </AsyncData>
    );
    expect(screen.getByText("Wait")).toBeInTheDocument();
  });
});

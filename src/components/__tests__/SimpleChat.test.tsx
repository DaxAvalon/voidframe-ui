import { describe, expect, it } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { SimpleChat } from "../ChatModel";

describe("SimpleChat", () => {
  it("renders the conversation slot", () => {
    const { getByText } = renderWithTheme(
      <SimpleChat conversation={<div>transcript</div>} />
    );
    expect(getByText("transcript")).toBeInTheDocument();
  });

  it("renders a header when provided", () => {
    const { container, getByText } = renderWithTheme(
      <SimpleChat
        header={<span>Session A</span>}
        conversation={<div>transcript</div>}
      />
    );
    expect(getByText("Session A")).toBeInTheDocument();
    expect(
      container.querySelector(".vf-simple-chat__header")
    ).toBeInTheDocument();
  });

  it("omits the header element when no header prop is passed", () => {
    const { container } = renderWithTheme(
      <SimpleChat conversation={<div>transcript</div>} />
    );
    expect(
      container.querySelector(".vf-simple-chat__header")
    ).toBeNull();
  });

  it("uses the documented root class", () => {
    const { container } = renderWithTheme(
      <SimpleChat conversation={<div>x</div>} />
    );
    expect(container.querySelector(".vf-simple-chat")).toBeInTheDocument();
  });
});

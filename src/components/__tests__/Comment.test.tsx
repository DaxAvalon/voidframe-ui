import { describe, expect, it } from "vitest";
import { screen } from "@testing-library/react";
import { Comment, CommentList } from "../Comment";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { expectNoA11yViolations } from "../../../test/axe";

describe("Comment", () => {
  it("renders author", () => {
    renderWithTheme(<Comment author="Alice" content="Hello" />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
  });

  it("renders avatar from URL string", () => {
    const { container } = renderWithTheme(
      <Comment author="Bob" avatar="https://example.com/bob.jpg" content="Hi" />
    );
    const img = container.querySelector(
      ".vf-comment__avatar-img"
    ) as HTMLImageElement;
    expect(img).toBeInTheDocument();
    expect(img.src).toContain("bob.jpg");
  });

  it("renders avatar as ReactNode", () => {
    renderWithTheme(
      <Comment
        author="Carol"
        avatar={<span data-testid="avatar-node">C</span>}
        content="Hey"
      />
    );
    expect(screen.getByTestId("avatar-node")).toBeInTheDocument();
  });

  it("renders content body", () => {
    renderWithTheme(
      <Comment author="Dan" content={<p>My comment text</p>} />
    );
    expect(screen.getByText("My comment text")).toBeInTheDocument();
  });

  it("renders datetime", () => {
    renderWithTheme(
      <Comment author="Eve" content="Test" datetime="2 hours ago" />
    );
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("renders actions", () => {
    renderWithTheme(
      <Comment
        author="Frank"
        content="Test"
        actions={<button>Reply</button>}
      />
    );
    expect(
      screen.getByRole("button", { name: "Reply" })
    ).toBeInTheDocument();
  });

  it("renders nested children as replies with indentation", () => {
    const { container } = renderWithTheme(
      <Comment author="Grace" content="Parent">
        <Comment author="Heidi" content="Reply" />
      </Comment>
    );
    const replies = container.querySelector(".vf-comment__replies");
    expect(replies).toBeInTheDocument();
    expect(screen.getByText("Heidi")).toBeInTheDocument();
  });

  it("supports 3-deep nesting", () => {
    renderWithTheme(
      <Comment author="L1" content="Level 1">
        <Comment author="L2" content="Level 2">
          <Comment author="L3" content="Level 3" />
        </Comment>
      </Comment>
    );
    expect(screen.getByText("L1")).toBeInTheDocument();
    expect(screen.getByText("L2")).toBeInTheDocument();
    expect(screen.getByText("L3")).toBeInTheDocument();
  });

  it("CommentList wraps comments", () => {
    const { container } = renderWithTheme(
      <CommentList>
        <Comment author="A" content="One" />
        <Comment author="B" content="Two" />
      </CommentList>
    );
    expect(
      container.querySelector(".vf-comment-list")
    ).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
  });

  it("renders cleanly without optional props", () => {
    renderWithTheme(<Comment author="Solo" content="Just text" />);
    expect(screen.getByText("Solo")).toBeInTheDocument();
    expect(screen.getByText("Just text")).toBeInTheDocument();
  });

  it("has no a11y violations with role=article", async () => {
    const { container } = renderWithTheme(
      <Comment author="Test" content="A11y check" />
    );
    expect(screen.getByRole("article")).toBeInTheDocument();
    await expectNoA11yViolations(container);
  });
});

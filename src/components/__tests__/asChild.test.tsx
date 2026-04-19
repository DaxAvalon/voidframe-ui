import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Badge } from "../Badge";
import { Button } from "../Button";
import { Card } from "../Card";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Button asChild", () => {
  it("renders the child element instead of <button>", () => {
    renderWithTheme(
      <Button asChild>
        <a href="/">Home</a>
      </Button>
    );
    expect(screen.getByRole("link", { name: "Home" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("passes onClick down to the child", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <Button asChild onClick={onClick}>
        <a href="/">Click</a>
      </Button>
    );
    await userEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("merges Button classes onto the child", () => {
    renderWithTheme(
      <Button asChild>
        <a href="/">x</a>
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveClass("vf-button");
    expect(link).toHaveClass("vf-button--outline");
    expect(link).toHaveClass("vf-button--md");
  });
});

describe("Badge asChild", () => {
  it("renders the child element instead of <span>", () => {
    renderWithTheme(
      <Badge asChild>
        <a href="/v">v1.0</a>
      </Badge>
    );
    expect(screen.getByRole("link", { name: "v1.0" })).toBeInTheDocument();
  });
});

describe("Card asChild", () => {
  it("renders the child element instead of <div>", () => {
    renderWithTheme(
      <Card asChild>
        <article data-testid="art">content</article>
      </Card>
    );
    expect(screen.getByTestId("art").tagName).toBe("ARTICLE");
  });
});

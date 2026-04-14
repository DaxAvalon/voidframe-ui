import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Avatar,
  AvatarGroup,
  Code,
  EmptyState,
  KeyValue,
  List,
  Skeleton,
  Spinner,
  Tag,
  Timeline,
  Tooltip,
} from "../DataExtended";
import { renderWithTheme } from "../../../test/renderWithTheme";

describe("Avatar", () => {
  it("renders initials from name", () => {
    renderWithTheme(<Avatar name="Alice Brown" />);
    expect(screen.getByText("AB")).toBeInTheDocument();
  });

  it("falls back to ? when no name or src", () => {
    renderWithTheme(<Avatar />);
    expect(screen.getByText("?")).toBeInTheDocument();
  });

  it("renders image when src given", () => {
    const { container } = renderWithTheme(<Avatar src="/x.png" name="x" />);
    expect(container.querySelector("img")).toBeInTheDocument();
  });
});

describe("AvatarGroup", () => {
  it("renders up to `max` avatars + overflow counter", () => {
    renderWithTheme(
      <AvatarGroup
        items={[
          { name: "Alice Aaa" },
          { name: "Bob Bbb" },
          { name: "Charlie Ccc" },
          { name: "Diana Ddd" },
        ]}
        max={2}
      />
    );
    // Visible initials for the first two, then "+2" overflow counter.
    expect(screen.getByText("AA")).toBeInTheDocument();
    expect(screen.getByText("BB")).toBeInTheDocument();
    expect(screen.queryByText("CC")).not.toBeInTheDocument();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});

describe("Tag", () => {
  it("renders content", () => {
    renderWithTheme(<Tag>deploy</Tag>);
    expect(screen.getByText("deploy")).toBeInTheDocument();
  });

  it("shows remove button when onRemove given", async () => {
    const onRemove = vi.fn();
    renderWithTheme(<Tag onRemove={onRemove}>x</Tag>);
    await userEvent.click(screen.getByText("×"));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });
});

describe("Tooltip", () => {
  it("shows content on hover", async () => {
    renderWithTheme(
      <Tooltip content="tip">
        <button>hover me</button>
      </Tooltip>
    );
    await userEvent.hover(screen.getByRole("button"));
    expect(screen.getByText("tip")).toBeInTheDocument();
  });

  it("hides on unhover", async () => {
    renderWithTheme(
      <Tooltip content="tip">
        <button>hover me</button>
      </Tooltip>
    );
    await userEvent.hover(screen.getByRole("button"));
    await userEvent.unhover(screen.getByRole("button"));
    expect(screen.queryByText("tip")).not.toBeInTheDocument();
  });
});

describe("Code", () => {
  it("renders inline `<code>`", () => {
    const { container } = renderWithTheme(<Code inline>x</Code>);
    expect(container.querySelector("code")).toBeInTheDocument();
  });

  it("renders block `<pre>` by default", () => {
    const { container } = renderWithTheme(<Code>x</Code>);
    expect(container.querySelector("pre")).toBeInTheDocument();
  });
});

describe("Timeline", () => {
  it("renders each event title", () => {
    renderWithTheme(
      <Timeline events={[{ title: "Alpha" }, { title: "Beta" }]} />
    );
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });
});

describe("Skeleton", () => {
  it("renders `lines` placeholder rows", () => {
    const { root } = renderWithTheme(<Skeleton lines={3} />);
    // Skeleton renders 3 line divs + one <style> tag child
    const lineDivs = Array.from(root().children).filter(
      (c) => c.tagName === "DIV"
    );
    expect(lineDivs).toHaveLength(3);
  });
});

describe("EmptyState", () => {
  it("renders title and description", () => {
    renderWithTheme(<EmptyState title="NO DATA" description="Add some" />);
    expect(screen.getByText("NO DATA")).toBeInTheDocument();
    expect(screen.getByText("Add some")).toBeInTheDocument();
  });
});

describe("List", () => {
  it("renders each item", () => {
    renderWithTheme(<List items={["a", "b", "c"]} />);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
  });

  it("omits markers when marker={false}", () => {
    const { container } = renderWithTheme(
      <List marker={false} items={["a"]} />
    );
    // Only the item container, no marker span
    expect(container.querySelectorAll("div > div > span")).toHaveLength(0);
  });
});

describe("KeyValue", () => {
  it("renders each key and value", () => {
    renderWithTheme(
      <KeyValue
        items={[
          { key: "ENV", value: "prod" },
          { key: "VERSION", value: "1.0" },
        ]}
      />
    );
    expect(screen.getByText("ENV")).toBeInTheDocument();
    expect(screen.getByText("prod")).toBeInTheDocument();
    expect(screen.getByText("VERSION")).toBeInTheDocument();
  });
});

describe("Spinner", () => {
  it("renders", () => {
    const { container } = renderWithTheme(<Spinner />);
    // Fragment: spinner div + style tag
    expect(container.querySelector("div")).toBeInTheDocument();
  });
});

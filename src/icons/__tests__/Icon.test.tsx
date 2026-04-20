import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "../../../test/renderWithTheme";
import {
  Icon,
  IconButton,
  IconGroup,
  adaptIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  CheckIcon,
  SearchIcon,
  SpinnerIcon,
  XIcon,
} from "..";

describe("Icon primitive", () => {
  it("is decorative by default (aria-hidden, no role)", () => {
    const { container } = renderWithTheme(
      <Icon>
        <path d="M4 4h16v16H4z" />
      </Icon>
    );
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).not.toHaveAttribute("role");
  });

  it("gains role=img and aria-label when label supplied", () => {
    renderWithTheme(
      <Icon label="Compass">
        <circle cx="12" cy="12" r="9" />
      </Icon>
    );
    const svg = screen.getByRole("img", { name: "Compass" });
    expect(svg).toBeInTheDocument();
  });

  it("applies size classes", () => {
    const { container } = renderWithTheme(<Icon size="lg" />);
    expect(container.querySelector("svg")).toHaveClass("vf-icon--lg");
  });

  it("applies numeric size as width/height", () => {
    const { container } = renderWithTheme(<Icon size={48} />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("width", "48");
    expect(svg).toHaveAttribute("height", "48");
  });

  it("composes flipX/flipY/rotate as transforms", () => {
    const { container } = renderWithTheme(
      <Icon flipX rotate={90} />
    );
    const svg = container.querySelector("svg") as SVGElement;
    const style = svg.getAttribute("style") ?? "";
    expect(style).toContain("scaleX(-1)");
    expect(style).toContain("rotate(90deg)");
  });

  it("spin/pulse toggle CSS classes", () => {
    const { container, rerender } = renderWithTheme(<Icon spin />);
    expect(container.querySelector("svg")).toHaveClass("vf-icon--spin");
    rerender(<Icon pulse />);
    expect(container.querySelector("svg")).toHaveClass("vf-icon--pulse");
  });

  it("marks directional icons with a data attribute for RTL mirroring", () => {
    const { container } = renderWithTheme(<Icon directional />);
    expect(container.querySelector("svg")).toHaveAttribute(
      "data-directional",
      "true"
    );
  });
});

describe("Bundled icon set", () => {
  it("SearchIcon renders with its default label", () => {
    renderWithTheme(<SearchIcon />);
    expect(screen.getByRole("img", { name: "Search" })).toBeInTheDocument();
  });

  it("XIcon and CheckIcon render without error", () => {
    const a = renderWithTheme(<XIcon />);
    expect(a.getByRole("img", { name: "Close" })).toBeInTheDocument();
    a.unmount();
    const b = renderWithTheme(<CheckIcon />);
    expect(b.getByRole("img", { name: "Check" })).toBeInTheDocument();
  });

  it("ChevronRightIcon and ArrowRightIcon are marked directional", () => {
    const chev = renderWithTheme(<ChevronRightIcon />);
    expect(chev.container.querySelector("svg")).toHaveAttribute(
      "data-directional",
      "true"
    );
    chev.unmount();
    const arrow = renderWithTheme(<ArrowRightIcon />);
    expect(arrow.container.querySelector("svg")).toHaveAttribute(
      "data-directional",
      "true"
    );
  });

  it("SpinnerIcon accepts spin prop", () => {
    const { container } = renderWithTheme(<SpinnerIcon spin />);
    expect(container.querySelector("svg")).toHaveClass("vf-icon--spin");
  });

  it("icon labels can be overridden", () => {
    renderWithTheme(<SearchIcon label="Find" />);
    expect(screen.getByRole("img", { name: "Find" })).toBeInTheDocument();
  });
});

describe("IconButton", () => {
  it("renders as button with aria-label", () => {
    renderWithTheme(
      <IconButton aria-label="Close">
        <XIcon />
      </IconButton>
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    renderWithTheme(
      <IconButton aria-label="Send" onClick={onClick}>
        <SearchIcon />
      </IconButton>
    );
    await userEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalled();
  });

  it("aria-pressed reflects active", () => {
    renderWithTheme(
      <IconButton aria-label="Toggle" active>
        <CheckIcon />
      </IconButton>
    );
    expect(screen.getByRole("button")).toHaveAttribute("aria-pressed", "true");
  });

  it("renders tooltip node when provided", () => {
    renderWithTheme(
      <IconButton aria-label="Search" tooltip="Search the docs">
        <SearchIcon />
      </IconButton>
    );
    expect(screen.getByRole("tooltip")).toHaveTextContent("Search the docs");
  });

  it("warns in dev when aria-label is missing", async () => {
    const { _resetWarnings } = await import("../../utils/warn");
    _resetWarnings();
    const spy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    renderWithTheme(
      <IconButton>
        <XIcon />
      </IconButton>
    );
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe("IconGroup", () => {
  it("renders children inline", () => {
    renderWithTheme(
      <IconGroup>
        <SearchIcon />
        <span data-testid="label">file.ts</span>
      </IconGroup>
    );
    expect(screen.getByTestId("label")).toBeInTheDocument();
  });

  it("interleaves a separator between children", () => {
    const { container } = renderWithTheme(
      <IconGroup separator={<span>·</span>}>
        <SearchIcon />
        <SearchIcon />
        <SearchIcon />
      </IconGroup>
    );
    expect(container.querySelectorAll(".vf-icon-group__sep")).toHaveLength(2);
  });
});

describe("adaptIcon", () => {
  it("wraps a third-party icon and applies voidframe sizing/label", () => {
    const FakeLucide = () => <path data-testid="external" d="M0 0h24v24H0z" />;
    const Wrapped = adaptIcon(FakeLucide, { defaultLabel: "Fake" });
    renderWithTheme(<Wrapped size="xl" />);
    const svg = screen.getByRole("img", { name: "Fake" });
    expect(svg).toHaveClass("vf-icon--xl");
    expect(screen.getByTestId("external")).toBeInTheDocument();
  });
});

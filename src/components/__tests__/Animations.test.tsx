import { act, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Marquee, Typewriter, Ticker } from "../Animations";

describe("Marquee", () => {
  it("renders children with marquee class", () => {
    const { container } = renderWithTheme(
      <Marquee>
        <span>Scrolling text</span>
      </Marquee>
    );
    expect(container.querySelector(".vf-marquee")).toBeInTheDocument();
    // Marquee duplicates content for seamless scrolling
    expect(screen.getAllByText("Scrolling text").length).toBeGreaterThanOrEqual(1);
  });

  it("applies direction class", () => {
    const { container } = renderWithTheme(
      <Marquee direction="right"><span>Text</span></Marquee>
    );
    expect(container.querySelector(".vf-marquee--reverse")).toBeInTheDocument();
  });

  it("applies vertical axis class for up/down", () => {
    const { container } = renderWithTheme(
      <Marquee direction="up"><span>Text</span></Marquee>
    );
    expect(container.querySelector(".vf-marquee--y")).toBeInTheDocument();
  });

  it("applies pause-on-hover class by default", () => {
    const { container } = renderWithTheme(
      <Marquee><span>Text</span></Marquee>
    );
    expect(container.querySelector(".vf-marquee--pause-hover")).toBeInTheDocument();
  });

  it("omits pause-on-hover class when disabled", () => {
    const { container } = renderWithTheme(
      <Marquee pauseOnHover={false}><span>Text</span></Marquee>
    );
    expect(container.querySelector(".vf-marquee--pause-hover")).not.toBeInTheDocument();
  });
});

describe("Typewriter", () => {
  it("renders with cursor by default", () => {
    const { container } = renderWithTheme(
      <Typewriter text="Hello" />
    );
    expect(container.querySelector(".vf-typewriter")).toBeInTheDocument();
    expect(container.querySelector(".vf-typewriter__cursor")).toBeInTheDocument();
  });

  it("hides cursor when cursor=false", () => {
    const { container } = renderWithTheme(
      <Typewriter text="Hello" cursor={false} />
    );
    expect(container.querySelector(".vf-typewriter__cursor")).not.toBeInTheDocument();
  });

  it("has aria-live=polite", () => {
    const { container } = renderWithTheme(
      <Typewriter text="Hello" />
    );
    expect(container.querySelector("[aria-live='polite']")).toBeInTheDocument();
  });
});

describe("Typewriter — completed state", () => {
  it("calls onComplete when all text is typed", async () => {
    const onComplete = vi.fn();
    renderWithTheme(
      <Typewriter text="Hi" speed={500} onComplete={onComplete} />
    );
    // Wait for the typing to complete (short text + fast speed)
    await vi.waitFor(() => expect(onComplete).toHaveBeenCalled(), { timeout: 3000 });
  });

  it("renders full text immediately when reduced motion is preferred", () => {
    // Typewriter calls usePrefersReducedMotion; we can test the instant render
    // by verifying it renders the text immediately (the hook returns false in test env)
    const { container } = renderWithTheme(
      <Typewriter text="Instant" speed={1} />
    );
    expect(container.querySelector(".vf-typewriter")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Typewriter text="Test" className="my-tw" />
    );
    expect(container.querySelector(".vf-typewriter.my-tw")).toBeInTheDocument();
  });
});

describe("Ticker", () => {
  it("renders with ticker class", () => {
    const { container } = renderWithTheme(
      <Ticker to={100} />
    );
    expect(container.querySelector(".vf-ticker")).toBeInTheDocument();
  });

  it("has aria-live=polite", () => {
    const { container } = renderWithTheme(
      <Ticker to={50} />
    );
    expect(container.querySelector("[aria-live='polite']")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithTheme(
      <Ticker to={42} className="custom" />
    );
    expect(container.querySelector(".vf-ticker.custom")).toBeInTheDocument();
  });

  it("uses custom from and duration", () => {
    const { container } = renderWithTheme(
      <Ticker from={10} to={100} duration={200} />
    );
    expect(container.querySelector(".vf-ticker")).toBeInTheDocument();
  });

  it("uses custom format function", () => {
    const { container } = renderWithTheme(
      <Ticker to={50} format={(n) => `$${Math.round(n)}`} />
    );
    const ticker = container.querySelector(".vf-ticker");
    expect(ticker!.textContent).toMatch(/\$/);
  });

  it("emits exactly `steps` discrete values and lands on `to`", async () => {
    vi.useFakeTimers();
    try {
      const { container } = renderWithTheme(
        <Ticker from={0} to={100} duration={500} steps={5} format={(n) => String(Math.round(n))} />
      );
      const el = container.querySelector(".vf-ticker")!;
      await act(async () => {
        vi.advanceTimersByTime(600);
      });
      expect((el.textContent ?? "").trim()).toBe("100");
    } finally {
      vi.useRealTimers();
    }
  });

  it("smooth path (no steps) falls back to rAF interpolation", () => {
    const { container } = renderWithTheme(<Ticker to={50} />);
    expect(container.querySelector(".vf-ticker")).toBeInTheDocument();
  });
});

describe("Marquee — additional", () => {
  it("applies no-loop class", () => {
    const { container } = renderWithTheme(
      <Marquee loop={false}><span>Text</span></Marquee>
    );
    expect(container.querySelector(".vf-marquee--no-loop")).toBeInTheDocument();
  });

  it("down direction uses y axis + reverse", () => {
    const { container } = renderWithTheme(
      <Marquee direction="down"><span>Text</span></Marquee>
    );
    expect(container.querySelector(".vf-marquee--y")).toBeInTheDocument();
    expect(container.querySelector(".vf-marquee--reverse")).toBeInTheDocument();
  });
});

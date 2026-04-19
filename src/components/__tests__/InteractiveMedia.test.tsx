// Smoke tests for Phase 11 interactive + media components. Render-shape
// checks and the small handful of behaviour guarantees that don't depend on
// timers / canvas / native media events.

import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";

import { Carousel, CarouselImageGallery } from "../Carousel";
import { Lightbox, ImageGallery } from "../Lightbox";
import { Accordion } from "../Accordion";
import { Swipeable, SwipeActions, Zoomable } from "../Gestures";
import { Sortable, ReorderList } from "../DragDrop";
import { Marquee, Ticker, Typewriter } from "../Animations";
import { Image } from "../Image";
import { AudioPlayer, VideoPlayer, VoiceWaveform } from "../MediaPlayer";
import { DocumentPreview, IFrame } from "../Embed";
import {
  Clipboard,
  ReactionPicker,
  ScrollIndicator,
  ShareButton,
} from "../Utility";

// ── Carousel ──

describe("Carousel", () => {
  it("renders slides and dots", () => {
    renderWithTheme(
      <Carousel slides={[<div key="a">A</div>, <div key="b">B</div>]} />
    );
    expect(screen.getByRole("region", { name: undefined })).toBeInTheDocument();
    expect(screen.getAllByRole("tab").length).toBe(2);
  });

  it("Next button advances slide", async () => {
    const onSlideChange = vi.fn();
    renderWithTheme(
      <Carousel
        slides={[<div key="a">A</div>, <div key="b">B</div>]}
        onSlideChange={onSlideChange}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "Next slide" }));
    expect(onSlideChange).toHaveBeenLastCalledWith(1);
  });

  it("CarouselImageGallery renders alt text on each image", () => {
    renderWithTheme(
      <CarouselImageGallery
        images={[
          { src: "/a.png", alt: "a-alt" },
          { src: "/b.png", alt: "b-alt" },
        ]}
      />
    );
    expect(screen.getByAltText("a-alt")).toBeInTheDocument();
    expect(screen.getByAltText("b-alt")).toBeInTheDocument();
  });
});

// ── Lightbox / ImageGallery ──

describe("Lightbox + ImageGallery", () => {
  it("Lightbox renders nothing when closed", () => {
    renderWithTheme(
      <Lightbox
        open={false}
        onOpenChange={() => {}}
        images={[{ src: "/x.png", alt: "x" }]}
      />
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Lightbox renders a dialog when open", () => {
    renderWithTheme(
      <Lightbox
        open
        onOpenChange={() => {}}
        images={[{ src: "/x.png", alt: "first" }]}
      />
    );
    expect(screen.getByRole("dialog", { name: "first" })).toBeInTheDocument();
  });

  it("ImageGallery cell click opens Lightbox", async () => {
    renderWithTheme(
      <ImageGallery
        images={[
          { src: "/a.png", alt: "a" },
          { src: "/b.png", alt: "b" },
        ]}
      />
    );
    await userEvent.click(screen.getAllByRole("button")[0]!);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});

// ── Accordion ──

describe("Accordion", () => {
  it("toggles a single-mode item open/closed", async () => {
    renderWithTheme(
      <Accordion type="single" defaultValue="a">
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>A body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>B</Accordion.Trigger>
          <Accordion.Content>B body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
    expect(screen.getByText("A body")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /^B/ }));
    expect(screen.getByText("B body")).toBeInTheDocument();
    expect(screen.queryByText("A body")).not.toBeInTheDocument();
  });

  it("multiple-mode keeps prior items open", async () => {
    renderWithTheme(
      <Accordion type="multiple">
        <Accordion.Item value="a">
          <Accordion.Trigger>A</Accordion.Trigger>
          <Accordion.Content>A body</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="b">
          <Accordion.Trigger>B</Accordion.Trigger>
          <Accordion.Content>B body</Accordion.Content>
        </Accordion.Item>
      </Accordion>
    );
    await userEvent.click(screen.getByRole("button", { name: /^A/ }));
    await userEvent.click(screen.getByRole("button", { name: /^B/ }));
    expect(screen.getByText("A body")).toBeInTheDocument();
    expect(screen.getByText("B body")).toBeInTheDocument();
  });
});

// ── Swipeable / SwipeActions / Zoomable ──

describe("Gestures", () => {
  it("Swipeable detects horizontal swipe", () => {
    const onSwipeRight = vi.fn();
    const { container } = renderWithTheme(
      <Swipeable onSwipeRight={onSwipeRight}>
        <div>x</div>
      </Swipeable>
    );
    const el = container.querySelector(".vf-swipeable") as HTMLElement;
    fireEvent.pointerDown(el, { clientX: 0, clientY: 0 });
    fireEvent.pointerUp(el, { clientX: 80, clientY: 0 });
    expect(onSwipeRight).toHaveBeenCalled();
  });

  it("SwipeActions exposes leading/trailing buttons", () => {
    renderWithTheme(
      <SwipeActions
        leadingActions={
          <SwipeActions.Action tone="success">Archive</SwipeActions.Action>
        }
        trailingActions={
          <SwipeActions.Action tone="danger">Delete</SwipeActions.Action>
        }
      >
        <div>row</div>
      </SwipeActions>
    );
    expect(screen.getByRole("button", { name: "Archive" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("Zoomable +/- buttons change the scale", async () => {
    const onScaleChange = vi.fn();
    renderWithTheme(
      <Zoomable defaultScale={1} onScaleChange={onScaleChange}>
        <div style={{ width: 40, height: 40 }} />
      </Zoomable>
    );
    await userEvent.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(onScaleChange).toHaveBeenCalled();
    expect(onScaleChange.mock.calls.at(-1)![0]).toBeGreaterThan(1);
  });
});

// ── Sortable ──

describe("Sortable", () => {
  it("keyboard ArrowDown reorders the focused item", async () => {
    function Probe() {
      const [items, setItems] = useState(["a", "b", "c"]);
      return (
        <Sortable
          value={items}
          getKey={(x) => x}
          onValueChange={setItems}
          renderItem={(item, _, { dragHandleProps }) => (
            <span {...dragHandleProps}>{item}</span>
          )}
        />
      );
    }
    renderWithTheme(<Probe />);
    const handles = screen.getAllByRole("button", { name: /^Drag/ });
    handles[0]!.focus();
    fireEvent.keyDown(handles[0]!, { key: "ArrowDown" });
    // After moving "a" down by one, the rendered order should be b,a,c
    const rendered = screen.getAllByRole("listitem").map((el) => el.textContent);
    expect(rendered).toEqual(["b", "a", "c"]);
  });

  it("ReorderList is a Sortable alias", () => {
    renderWithTheme(
      <ReorderList
        value={["x"]}
        getKey={(x) => x}
        onValueChange={() => {}}
        renderItem={(it) => <span>{it}</span>}
      />
    );
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});

// ── Marquee / Typewriter / Ticker ──

describe("Animation atoms", () => {
  it("Marquee renders content twice for the loop track", () => {
    const { container } = renderWithTheme(<Marquee>hello</Marquee>);
    const groups = container.querySelectorAll(".vf-marquee__group");
    expect(groups.length).toBe(2);
  });

  it("Typewriter renders a span with aria-live=polite", () => {
    const { container } = renderWithTheme(<Typewriter text="Hi" speed={1000} />);
    expect(container.querySelector(".vf-typewriter")).toHaveAttribute("aria-live", "polite");
  });

  it("Ticker renders the formatted number on first paint", () => {
    renderWithTheme(<Ticker from={5} to={10} duration={1} />);
    expect(screen.getByText(/^[0-9]/)).toBeInTheDocument();
  });
});

// ── Image ──

describe("Image", () => {
  it("renders src + alt", () => {
    renderWithTheme(<Image src="/x.png" alt="picture" />);
    expect(screen.getByAltText("picture")).toBeInTheDocument();
  });

  it("falls back to provided URL when img errors", () => {
    renderWithTheme(<Image src="/missing.png" alt="picture" fallback="/fallback.png" />);
    const img = screen.getByAltText("picture") as HTMLImageElement;
    fireEvent.error(img);
    expect(
      (screen.getByAltText("picture") as HTMLImageElement).src
    ).toContain("/fallback.png");
  });
});

// ── MediaPlayer ──

describe("MediaPlayer", () => {
  it("VideoPlayer (custom controls) renders Play button", () => {
    renderWithTheme(<VideoPlayer src="/clip.mp4" />);
    expect(screen.getByRole("button", { name: /Play|Pause/ })).toBeInTheDocument();
  });

  it("AudioPlayer (custom controls) exposes a Volume slider", () => {
    renderWithTheme(<AudioPlayer src="/clip.mp3" />);
    expect(screen.getByLabelText("Volume")).toBeInTheDocument();
  });

  it("VoiceWaveform draws bars", () => {
    const { container } = renderWithTheme(
      <VoiceWaveform audioData={[0.1, 0.4, 0.9, 0.3]} bars={4} />
    );
    expect(container.querySelectorAll("svg rect").length).toBe(4);
  });
});

// ── Embed family ──

describe("Embed family", () => {
  it("IFrame renders with title + sandbox", () => {
    const { container } = renderWithTheme(
      <IFrame src="/x" title="External" />
    );
    const f = container.querySelector("iframe") as HTMLIFrameElement;
    expect(f.title).toBe("External");
    expect(f.getAttribute("sandbox")).toContain("allow-scripts");
  });

  it("DocumentPreview shows filename + size", () => {
    renderWithTheme(
      <DocumentPreview filename="report.pdf" size={1024 * 50} kind="pdf" />
    );
    expect(screen.getByText("report.pdf")).toBeInTheDocument();
    expect(screen.getByText(/PDF/)).toBeInTheDocument();
  });
});

// ── Utility ──

describe("Utility", () => {
  it("Clipboard default button toggles label after copy", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
    });
    renderWithTheme(<Clipboard value="hi" resetMs={50} />);
    await userEvent.click(screen.getByRole("button", { name: "Copy" }));
    expect(await screen.findByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("ShareButton falls back to clipboard when navigator.share is missing", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    Object.defineProperty(navigator, "share", {
      configurable: true,
      value: undefined,
    });
    renderWithTheme(<ShareButton url="https://example.com" />);
    await userEvent.click(screen.getByRole("button", { name: "Share" }));
    expect(writeText).toHaveBeenCalledWith("https://example.com");
  });

  it("ScrollIndicator renders a progressbar", () => {
    renderWithTheme(<ScrollIndicator />);
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });

  it("ReactionPicker fires onReact", async () => {
    const onReact = vi.fn();
    renderWithTheme(
      <ReactionPicker
        onReact={onReact}
        reactions={[{ id: "thumbsup", label: "👍" }]}
      />
    );
    await userEvent.click(screen.getByRole("button", { name: "👍" }));
    expect(onReact).toHaveBeenCalledWith("thumbsup");
  });
});

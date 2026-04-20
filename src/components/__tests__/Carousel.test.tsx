import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Carousel, CarouselImageGallery } from "../Carousel";

describe("Carousel", () => {
  it("renders slides via shorthand prop", () => {
    renderWithTheme(
      <Carousel slides={[<div key="a">Slide A</div>, <div key="b">Slide B</div>]} />
    );
    expect(screen.getByText("Slide A")).toBeInTheDocument();
  });

  it("Carousel with defaultIndex=2 scrolls to slide 2 after mount", async () => {
    // Spy the prototype BEFORE render so we capture the mount rAF.
    const scrollSpy = vi
      .spyOn(HTMLElement.prototype, "scrollTo")
      .mockImplementation(() => {});
    try {
      renderWithTheme(
        <Carousel
          defaultIndex={2}
          slides={[
            <div key="1">S1</div>,
            <div key="2">S2</div>,
            <div key="3">S3</div>,
          ]}
        />
      );
      // Wait for two animation frames so the rAF-scheduled scroll runs.
      await new Promise<void>((r) =>
        requestAnimationFrame(() => requestAnimationFrame(() => r()))
      );
      expect(scrollSpy).toHaveBeenCalled();
    } finally {
      scrollSpy.mockRestore();
    }
  });

  it("ArrowRight advances the index", async () => {
    const onSlideChange = vi.fn();
    renderWithTheme(
      <Carousel
        slides={[<div key="1">S1</div>, <div key="2">S2</div>, <div key="3">S3</div>]}
        onSlideChange={onSlideChange}
      />
    );
    const viewport = document.querySelector(".vf-carousel__viewport") as HTMLElement;
    viewport.focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(onSlideChange).toHaveBeenCalledWith(1);
  });

  it("ArrowLeft goes back from index 1", async () => {
    const onSlideChange = vi.fn();
    renderWithTheme(
      <Carousel
        defaultIndex={1}
        slides={[<div key="1">S1</div>, <div key="2">S2</div>, <div key="3">S3</div>]}
        onSlideChange={onSlideChange}
      />
    );
    const viewport = document.querySelector(".vf-carousel__viewport") as HTMLElement;
    viewport.focus();
    await userEvent.keyboard("{ArrowLeft}");
    expect(onSlideChange).toHaveBeenCalledWith(0);
  });

  it("Home jumps to first slide", async () => {
    const onSlideChange = vi.fn();
    renderWithTheme(
      <Carousel
        defaultIndex={2}
        slides={[<div key="1">S1</div>, <div key="2">S2</div>, <div key="3">S3</div>]}
        onSlideChange={onSlideChange}
      />
    );
    const viewport = document.querySelector(".vf-carousel__viewport") as HTMLElement;
    viewport.focus();
    await userEvent.keyboard("{Home}");
    expect(onSlideChange).toHaveBeenCalledWith(0);
  });

  it("End jumps to last slide", async () => {
    const onSlideChange = vi.fn();
    renderWithTheme(
      <Carousel
        slides={[<div key="1">S1</div>, <div key="2">S2</div>, <div key="3">S3</div>]}
        onSlideChange={onSlideChange}
      />
    );
    const viewport = document.querySelector(".vf-carousel__viewport") as HTMLElement;
    viewport.focus();
    await userEvent.keyboard("{End}");
    expect(onSlideChange).toHaveBeenCalledWith(2);
  });

  it("auto-play advances slides", () => {
    vi.useFakeTimers();
    const onSlideChange = vi.fn();
    renderWithTheme(
      <Carousel
        autoPlay
        interval={100}
        slides={[<div key="1">S1</div>, <div key="2">S2</div>]}
        onSlideChange={onSlideChange}
      />
    );
    vi.advanceTimersByTime(250);
    expect(onSlideChange).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it("compound API (<Carousel.Viewport>) honors slidesPerView and gap from the parent", () => {
    const { container } = renderWithTheme(
      <Carousel slidesPerView={3} gap={24}>
        <Carousel.Viewport>
          <Carousel.Slide>A</Carousel.Slide>
          <Carousel.Slide>B</Carousel.Slide>
          <Carousel.Slide>C</Carousel.Slide>
        </Carousel.Viewport>
      </Carousel>
    );
    const viewport = container.querySelector<HTMLDivElement>(
      ".vf-carousel__viewport"
    );
    expect(viewport).toBeTruthy();
    // gap should land on the computed style (either as gap or column-gap).
    expect(viewport!.style.gap).toBe("24px");
    // gridAutoColumns should reflect the 3 slides per viewport.
    expect(viewport!.style.gridAutoColumns).toContain("3");
  });

  it("compound API inline style merges with the computed slidesPerView/gap style (caller override wins)", () => {
    const { container } = renderWithTheme(
      <Carousel slidesPerView={2} gap={12}>
        <Carousel.Viewport style={{ background: "red" }}>
          <Carousel.Slide>A</Carousel.Slide>
          <Carousel.Slide>B</Carousel.Slide>
        </Carousel.Viewport>
      </Carousel>
    );
    const viewport = container.querySelector<HTMLDivElement>(
      ".vf-carousel__viewport"
    );
    expect(viewport).toBeTruthy();
    expect(viewport!.style.gap).toBe("12px");
    expect(viewport!.style.background).toBe("red");
  });
});

describe("CarouselImageGallery", () => {
  it("renders images with captions", () => {
    renderWithTheme(
      <CarouselImageGallery
        images={[
          { src: "/a.jpg", alt: "Image A", caption: "Caption A" },
          { src: "/b.jpg", alt: "Image B" },
        ]}
      />
    );
    expect(screen.getByAltText("Image A")).toBeInTheDocument();
    expect(screen.getByText("Caption A")).toBeInTheDocument();
    expect(screen.getByAltText("Image B")).toBeInTheDocument();
  });
});

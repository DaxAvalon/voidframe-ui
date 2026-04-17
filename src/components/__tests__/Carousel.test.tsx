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

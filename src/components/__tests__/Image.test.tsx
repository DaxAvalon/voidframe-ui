import { fireEvent, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { renderWithTheme } from "../../../test/renderWithTheme";
import { Image } from "../Image";

describe("Image", () => {
  it("renders with src and alt", () => {
    const { container } = renderWithTheme(
      <Image src="photo.jpg" alt="A photo" />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    expect(img.src).toContain("photo.jpg");
    expect(img.alt).toBe("A photo");
  });

  it("uses lazy loading by default", () => {
    const { container } = renderWithTheme(
      <Image src="photo.jpg" alt="test" />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    expect(img.loading).toBe("lazy");
  });

  it("renders string fallback on error", () => {
    const { container } = renderWithTheme(
      <Image src="broken.jpg" alt="test" fallback="fallback.jpg" />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    fireEvent.error(img);
    // After error, should show fallback image
    const fallbackImg = container.querySelector(".vf-image--fallback") as HTMLImageElement;
    expect(fallbackImg.src).toContain("fallback.jpg");
  });

  it("renders ReactNode fallback on error", () => {
    const { container } = renderWithTheme(
      <Image src="broken.jpg" alt="test" fallback={<span>No image</span>} />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    fireEvent.error(img);
    expect(screen.getByText("No image")).toBeInTheDocument();
    expect(container.querySelector(".vf-image--fallback-node")).toBeInTheDocument();
  });

  it("calls onError when image fails", () => {
    const onError = vi.fn();
    const { container } = renderWithTheme(
      <Image src="broken.jpg" alt="test" onError={onError} />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    fireEvent.error(img);
    expect(onError).toHaveBeenCalled();
  });

  it("calls onLoad when image loads", () => {
    const onLoad = vi.fn();
    const { container } = renderWithTheme(
      <Image src="photo.jpg" alt="test" onLoad={onLoad} />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    fireEvent.load(img);
    expect(onLoad).toHaveBeenCalled();
  });

  it("renders blur placeholder before load", () => {
    const { container } = renderWithTheme(
      <Image
        src="photo.jpg"
        alt="test"
        placeholder="blur"
        blurDataUrl="data:image/png;base64,abc"
      />
    );
    expect(container.querySelector(".vf-image-wrapper--blurring")).toBeInTheDocument();
    expect(container.querySelector(".vf-image__placeholder")).toBeInTheDocument();
  });

  it("removes blur class after load", () => {
    const { container } = renderWithTheme(
      <Image
        src="photo.jpg"
        alt="test"
        placeholder="blur"
        blurDataUrl="data:image/png;base64,abc"
      />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    fireEvent.load(img);
    expect(container.querySelector(".vf-image-wrapper--blurring")).not.toBeInTheDocument();
  });

  it("renders custom placeholder URL", () => {
    const { container } = renderWithTheme(
      <Image src="photo.jpg" alt="test" placeholder="placeholder.jpg" />
    );
    const ph = container.querySelector(".vf-image__placeholder") as HTMLImageElement;
    expect(ph.src).toContain("placeholder.jpg");
  });

  it("applies aspectRatio, width, height styles", () => {
    const { container } = renderWithTheme(
      <Image
        src="photo.jpg"
        alt="test"
        width={200}
        height={150}
        aspectRatio="16 / 9"
      />
    );
    const wrapper = container.querySelector(".vf-image-wrapper") as HTMLElement;
    expect(wrapper.style.aspectRatio).toBe("16 / 9");
    expect(wrapper.style.width).toBe("200px");
    expect(wrapper.style.height).toBe("150px");
  });

  it("applies objectFit style", () => {
    const { container } = renderWithTheme(
      <Image src="photo.jpg" alt="test" objectFit="contain" />
    );
    const img = container.querySelector(".vf-image") as HTMLImageElement;
    expect(img.style.objectFit).toBe("contain");
  });
});

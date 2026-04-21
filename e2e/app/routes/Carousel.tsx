import { useState } from "react";
import { Carousel } from "voidframe-ui";

export default function CarouselRoute() {
  const [index, setIndex] = useState(0);
  return (
    <>
      <Carousel
        slidesPerView={1}
        controls="both"
        loop
        onSlideChange={setIndex}
      >
        <Carousel.Viewport>
          <Carousel.Slide>Slide 1</Carousel.Slide>
          <Carousel.Slide>Slide 2</Carousel.Slide>
          <Carousel.Slide>Slide 3</Carousel.Slide>
        </Carousel.Viewport>
        <Carousel.Prev />
        <Carousel.Next />
        <Carousel.Dots />
      </Carousel>
      <span data-testid="index">{index}</span>
      <button data-testid="outside">outside</button>
    </>
  );
}

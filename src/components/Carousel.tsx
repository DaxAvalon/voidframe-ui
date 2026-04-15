"use client";

// Phase 11 — Carousel + CarouselImage
//
// Scroll-snap-based carousel. Uses native overflow + scroll-snap so touch +
// trackpad inertia "just works"; arrow keys / Prev / Next nudge by one slide.

import {
  Children,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useId } from "../hooks/useId";
import { cx } from "../utils/cx";

export type CarouselAlign = "start" | "center" | "end";
export type CarouselControls = "arrows" | "dots" | "both" | "none";

interface CarouselContextValue {
  index: number;
  setIndex: (n: number) => void;
  total: number;
  registerSlide: (id: string) => void;
  unregisterSlide: (id: string) => void;
  align: CarouselAlign;
  loop: boolean;
  viewportRef: React.MutableRefObject<HTMLDivElement | null>;
  scrollToIndex: (n: number) => void;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);
function useCarousel(): CarouselContextValue {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error("Carousel.* must be inside <Carousel>");
  return ctx;
}

export interface CarouselProps extends HTMLAttributes<HTMLDivElement> {
  /** Slide-array shorthand. Compound subcomponents take precedence. */
  slides?: ReactNode[];
  autoPlay?: boolean;
  /** Auto-advance interval in ms. Default 4000. */
  interval?: number;
  pauseOnHover?: boolean;
  loop?: boolean;
  /** Visible slides per viewport. */
  slidesPerView?: number;
  gap?: number | string;
  align?: CarouselAlign;
  onSlideChange?: (index: number) => void;
  controls?: CarouselControls;
  defaultIndex?: number;
  index?: number;
  children?: ReactNode;
  style?: CSSProperties;
}

function CarouselRoot({
  slides,
  autoPlay,
  interval = 4000,
  pauseOnHover = true,
  loop,
  slidesPerView = 1,
  gap = 12,
  align = "start",
  onSlideChange,
  controls = "both",
  defaultIndex = 0,
  index: indexProp,
  children,
  className,
  style,
  ...props
}: CarouselProps) {
  const [internal, setInternal] = useState(defaultIndex);
  const index = indexProp ?? internal;

  const slideIds = useRef<string[]>([]);
  const [, force] = useState(0);
  const registerSlide = useCallback((id: string) => {
    if (!slideIds.current.includes(id)) {
      slideIds.current = [...slideIds.current, id];
      force((n) => n + 1);
    }
  }, []);
  const unregisterSlide = useCallback((id: string) => {
    if (slideIds.current.includes(id)) {
      slideIds.current = slideIds.current.filter((x) => x !== id);
      force((n) => n + 1);
    }
  }, []);

  const total = slides?.length ?? slideIds.current.length;

  const setIndex = useCallback(
    (n: number) => {
      const clamped = loop
        ? ((n % total) + total) % total
        : Math.max(0, Math.min(total - 1, n));
      if (indexProp === undefined) setInternal(clamped);
      onSlideChange?.(clamped);
    },
    [loop, total, indexProp, onSlideChange]
  );

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const scrollToIndex = useCallback(
    (n: number) => {
      const vp = viewportRef.current;
      if (!vp) return;
      const child = vp.children[n] as HTMLElement | undefined;
      if (!child) return;
      vp.scrollTo({
        left: child.offsetLeft - vp.offsetLeft,
        behavior: "smooth",
      });
    },
    []
  );

  // Sync DOM scroll when index changes externally.
  useEffect(() => {
    scrollToIndex(index);
  }, [index, scrollToIndex]);

  // Auto-play.
  const [hovered, setHovered] = useState(false);
  useEffect(() => {
    if (!autoPlay || hovered || total <= 1) return;
    const tick = setInterval(() => setIndex(index + 1), interval);
    return () => clearInterval(tick);
  }, [autoPlay, hovered, total, interval, index, setIndex]);

  const ctx = useMemo<CarouselContextValue>(
    () => ({
      index,
      setIndex,
      total,
      registerSlide,
      unregisterSlide,
      align,
      loop: !!loop,
      viewportRef,
      scrollToIndex,
    }),
    [index, setIndex, total, registerSlide, unregisterSlide, align, loop, scrollToIndex]
  );

  const showArrows = controls === "arrows" || controls === "both";
  const showDots = controls === "dots" || controls === "both";

  return (
    <CarouselContext.Provider value={ctx}>
      <div
        role="region"
        aria-roledescription="carousel"
        className={cx("vf-carousel", className)}
        style={style}
        onMouseEnter={pauseOnHover ? () => setHovered(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setHovered(false) : undefined}
        onFocus={pauseOnHover ? () => setHovered(true) : undefined}
        onBlur={pauseOnHover ? () => setHovered(false) : undefined}
        {...props}
      >
        {children ?? (
          <>
            <CarouselViewport
              style={{
                gap: typeof gap === "number" ? `${gap}px` : gap,
                gridAutoColumns: `calc((100% - (${slidesPerView - 1} * ${typeof gap === "number" ? `${gap}px` : gap})) / ${slidesPerView})`,
              }}
            >
              {(slides ?? []).map((s, i) => (
                <CarouselSlide key={i}>{s}</CarouselSlide>
              ))}
            </CarouselViewport>
            {showArrows && (
              <>
                <CarouselPrev />
                <CarouselNext />
              </>
            )}
            {showDots && <CarouselDots />}
          </>
        )}
      </div>
    </CarouselContext.Provider>
  );
}

// ── Viewport / Slide ─────────────────────────────────────────

const CarouselViewport = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CarouselViewport({ className, style, children, ...props }, ref) {
    const ctx = useCarousel();
    const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        ctx.setIndex(ctx.index + 1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        ctx.setIndex(ctx.index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        ctx.setIndex(0);
      } else if (e.key === "End") {
        e.preventDefault();
        ctx.setIndex(ctx.total - 1);
      }
    };
    return (
      <div
        ref={(node) => {
          ctx.viewportRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
        }}
        role="group"
        aria-roledescription="slides"
        tabIndex={0}
        className={cx("vf-carousel__viewport", className)}
        style={{
          scrollSnapType: "x mandatory",
          ...style,
        }}
        onKeyDown={onKey}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CarouselViewport.displayName = "CarouselViewport";

const CarouselSlide = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CarouselSlide({ className, children, ...props }, ref) {
    const ctx = useCarousel();
    const id = useId();
    useEffect(() => {
      ctx.registerSlide(id);
      return () => ctx.unregisterSlide(id);
    }, [ctx.registerSlide, ctx.unregisterSlide, id]);
    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cx("vf-carousel__slide", className)}
        style={{ scrollSnapAlign: ctx.align }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CarouselSlide.displayName = "CarouselSlide";

// ── Controls ─────────────────────────────────────────────────

function CarouselPrev({
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useCarousel();
  return (
    <button
      type="button"
      aria-label="Previous slide"
      className={cx("vf-carousel__prev", className)}
      onClick={() => ctx.setIndex(ctx.index - 1)}
      disabled={!ctx.loop && ctx.index === 0}
      {...props}
    >
      ‹
    </button>
  );
}

function CarouselNext({
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useCarousel();
  return (
    <button
      type="button"
      aria-label="Next slide"
      className={cx("vf-carousel__next", className)}
      onClick={() => ctx.setIndex(ctx.index + 1)}
      disabled={!ctx.loop && ctx.index >= ctx.total - 1}
      {...props}
    >
      ›
    </button>
  );
}

function CarouselDots({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  const ctx = useCarousel();
  return (
    <div
      role="tablist"
      aria-label="Slide selection"
      className={cx("vf-carousel__dots", className)}
      {...props}
    >
      {Array.from({ length: ctx.total }).map((_, i) => (
        <button
          key={i}
          role="tab"
          type="button"
          aria-selected={ctx.index === i}
          aria-label={`Slide ${i + 1}`}
          className={cx(
            "vf-carousel__dot",
            ctx.index === i && "vf-carousel__dot--active"
          )}
          onClick={() => ctx.setIndex(i)}
        />
      ))}
    </div>
  );
}

export const Carousel = Object.assign(CarouselRoot, {
  Viewport: CarouselViewport,
  Slide: CarouselSlide,
  Prev: CarouselPrev,
  Next: CarouselNext,
  Dots: CarouselDots,
});

// ── CarouselImage ────────────────────────────────────────────

export interface CarouselImage {
  src: string;
  alt: string;
  caption?: ReactNode;
}

export interface CarouselImageProps extends Omit<CarouselProps, "slides" | "children"> {
  images: CarouselImage[];
  /** Apply a subtle Ken Burns zoom while a slide is active. */
  kenBurns?: boolean;
}

export function CarouselImageGallery({
  images,
  kenBurns,
  ...props
}: CarouselImageProps) {
  void Children; // silence unused import for tree-shaking guard
  void isValidElement;
  return (
    <Carousel
      {...props}
      slides={images.map((img, i) => (
        <figure key={i} className="vf-carousel__figure">
          <img
            src={img.src}
            alt={img.alt}
            className={cx(
              "vf-carousel__img",
              kenBurns && "vf-carousel__img--ken-burns"
            )}
          />
          {img.caption && (
            <figcaption className="vf-carousel__caption">{img.caption}</figcaption>
          )}
        </figure>
      ))}
    />
  );
}

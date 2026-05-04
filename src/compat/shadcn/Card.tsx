"use client";

// shadcn-shaped Card. shadcn separates Card / CardHeader / CardTitle /
// CardDescription / CardContent / CardFooter as flat exports.
// Voidframe's Card has built-in title/subtitle/header-right slots; we
// expose lightweight wrappers that compose the same DOM structure
// shadcn consumers expect.

import { forwardRef, type HTMLAttributes } from "react";
import { Card as VFCard } from "../../components/Card";
import { cx } from "../../utils/cx";

export const Card = VFCard;

/** Top section of the card containing title and description. */
export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cx("vf-card__header", className)} {...props} />;
  }
);
CardHeader.displayName = "CardHeader";

/** Heading for the card. Renders an `<h3>` inside `CardHeader`. */
export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return <h3 ref={ref} className={cx("vf-card__title", className)} {...props} />;
  }
);
CardTitle.displayName = "CardTitle";

/** Muted subtitle paragraph rendered below the card title. */
export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cx("vf-card__subtitle", className)} {...props} />;
  }
);
CardDescription.displayName = "CardDescription";

/** Main body area of the card for primary content. */
export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cx("vf-card__content", className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

/** Bottom slot for card actions or metadata. */
export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cx("vf-card__footer", className)} {...props} />;
  }
);
CardFooter.displayName = "CardFooter";

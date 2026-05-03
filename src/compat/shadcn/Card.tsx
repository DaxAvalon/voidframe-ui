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

export const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardHeader({ className, ...props }, ref) {
    return <div ref={ref} className={cx("vf-card__header", className)} {...props} />;
  }
);
CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function CardTitle({ className, ...props }, ref) {
    return <h3 ref={ref} className={cx("vf-card__title", className)} {...props} />;
  }
);
CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...props }, ref) {
    return <p ref={ref} className={cx("vf-card__subtitle", className)} {...props} />;
  }
);
CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardContent({ className, ...props }, ref) {
    return <div ref={ref} className={cx("vf-card__content", className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  function CardFooter({ className, ...props }, ref) {
    return <div ref={ref} className={cx("vf-card__footer", className)} {...props} />;
  }
);
CardFooter.displayName = "CardFooter";

"use client";

// shadcn-shaped Button — drop-in for migrating apps. Maps shadcn's
// `variant="default"` / `variant="link"` to voidframe equivalents.
// `variant="destructive"` already exists in voidframe (v1.1) and
// passes through unchanged.

import { forwardRef } from "react";
import {
  Button as VFButton,
  type ButtonProps as VFButtonProps,
  type ButtonVariant as VFButtonVariant,
} from "../../components/Button";
import type { ComponentType } from "react";
import { Link } from "../../components/Link";

export type ShadcnButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
export type ShadcnButtonSize = "default" | "sm" | "lg" | "icon";

export interface ButtonProps extends Omit<VFButtonProps, "variant" | "size"> {
  variant?: ShadcnButtonVariant;
  size?: ShadcnButtonSize;
}

const VARIANT_MAP: Record<ShadcnButtonVariant, VFButtonVariant> = {
  default: "solid",
  destructive: "destructive",
  outline: "outline",
  secondary: "subtle",
  ghost: "ghost",
  link: "ghost", // visual handled below by switching to <Link>
};

const SIZE_MAP: Record<ShadcnButtonSize, "sm" | "md" | "lg" | "icon"> = {
  default: "md",
  sm: "sm",
  lg: "lg",
  icon: "icon",
};

/**
 * shadcn-shaped Button. Forwards to voidframe's Button with a shape /
 * variant translation. `variant="link"` renders as voidframe's `Link`
 * primitive so semantic markup matches shadcn's behavior.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ variant = "default", size = "default", ...props }, ref) {
    if (variant === "link") {
      const { children, ...rest } = props;
      return (
        <Link
          variant="inline"
          // Use a ghost button under the hood for non-anchor cases via Slot,
          // but the most ergonomic shadcn-link parity is just the link primitive.
          {...(rest as Record<string, unknown>)}
        >
          {children}
        </Link>
      );
    }
    return (
      <VFButton
        ref={ref}
        variant={VARIANT_MAP[variant]}
        size={SIZE_MAP[size]}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

// Re-export Link as a polymorphic helper consumers expect from shadcn.
export const ButtonLink = Link as ComponentType<unknown>;

"use client";

// shadcn-shaped Dialog — flat named exports backed by voidframe's
// compound `Dialog.*`. Same DOM, same a11y, just a flat naming
// pattern that matches shadcn / Radix codebases.

// Use named imports rather than `Dialog.X` property access so
// vite-plugin-dts can resolve the types when emitting subpath
// declarations. The compound `Dialog` is also re-exported below for
// consumers who prefer the dotted form.
export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
  DialogClose,
} from "../../components/Dialog";
export type { DialogProps } from "../../components/Dialog";

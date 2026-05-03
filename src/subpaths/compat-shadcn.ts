// shadcn/Radix migration compat layer. Flat named exports mirroring the
// shadcn-ui-style `@/components/ui/*` API surface, backed by voidframe
// internals. Use this subpath when migrating an existing shadcn / Radix
// codebase to voidframe with minimal call-site churn.
//
//   // Before (shadcn):
//   import { Button } from "@/components/ui/button";
//   import { Dialog, DialogTrigger, DialogContent } from "@/components/ui/dialog";
//
//   // After (voidframe-ui):
//   import {
//     Button,
//     Dialog,
//     DialogTrigger,
//     DialogContent,
//   } from "voidframe-ui/compat-shadcn";
//
// All wrappers are static — no runtime translation cost beyond a thin
// alias. The voidframe primitives provide the actual behavior; this
// layer just renames + reshapes a few prop unions for parity.

export * from "../compat/shadcn";

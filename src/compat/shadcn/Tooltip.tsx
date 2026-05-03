"use client";

// shadcn-shaped Tooltip. Voidframe ships both the prop-based `Tooltip`
// AND the compound `TooltipRoot` / `TooltipTrigger` / `TooltipContent`
// (added in v1.1 Phase C1). The shadcn flat naming maps to the compound
// trio; the existing voidframe `TooltipProvider` is re-exported as-is.

export {
  TooltipRoot as Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "../../components/Popovers";

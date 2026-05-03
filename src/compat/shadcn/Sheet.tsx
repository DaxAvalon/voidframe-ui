"use client";

// shadcn-shaped Sheet — backed by voidframe's DrawerV2 compound. shadcn
// names → voidframe:
//
//   Sheet               → DrawerV2 (root)
//   SheetTrigger        → DrawerV2.Trigger
//   SheetContent        → DrawerV2.Content
//   SheetHeader         → DrawerV2.Header
//   SheetTitle          → DrawerV2.Title
//   SheetDescription    → DrawerV2.Description
//   SheetFooter         → DrawerV2.Footer
//   SheetClose          → DrawerV2.Close
//
// `side` (left|right|top|bottom) is supported on both root and Content
// since v1.1 Phase B4.

import {
  DrawerRoot,
  DrawerTrigger,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
  DrawerClose,
} from "../../components/DrawerCompound";

export const Sheet = DrawerRoot;
export const SheetTrigger = DrawerTrigger;
export const SheetContent = DrawerContent;
export const SheetHeader = DrawerHeader;
export const SheetTitle = DrawerTitle;
// Voidframe's DrawerV2 ships `.Body` instead of `.Description`. Aliasing
// keeps shadcn-pattern call sites resolving even though the slot is named
// differently in voidframe.
export const SheetDescription = DrawerBody;
export const SheetBody = DrawerBody;
export const SheetFooter = DrawerFooter;
export const SheetClose = DrawerClose;

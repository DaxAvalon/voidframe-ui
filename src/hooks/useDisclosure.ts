"use client";

// ═══════════════════════════════════════════════════════════════
// useDisclosure — shared controlled/uncontrolled open state
// ═══════════════════════════════════════════════════════════════
//
// Every collapsible container (Sidebar.Section, Card, FormStructure,
// Accordion, Collapsible, DrawerV2, Dialog, Popover, Menu, …) needs
// the same controlled/uncontrolled `open` state pattern. Rather than
// reinvent it per component, call this hook and forward its
// `{ open, setOpen, toggle }` tuple.

import { useCallback } from "react";
import { useControllableState } from "./useControllableState";

export interface UseDisclosureOptions {
  /** Controlled state. When provided, `defaultOpen` is ignored. */
  open?: boolean;
  /** Uncontrolled initial state. Defaults to `false`. */
  defaultOpen?: boolean;
  /** Fires whenever open state changes (controlled or uncontrolled). */
  onOpenChange?: (open: boolean) => void;
}

export interface DisclosureState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
  close: () => void;
  open_: () => void;
}

export function useDisclosure(options: UseDisclosureOptions = {}): DisclosureState {
  const { open: controlled, defaultOpen = false, onOpenChange } = options;
  const [open, setOpen] = useControllableState<boolean>({
    value: controlled,
    defaultValue: defaultOpen,
    onChange: onOpenChange,
  });
  const toggle = useCallback(() => setOpen(!open), [open, setOpen]);
  const close = useCallback(() => setOpen(false), [setOpen]);
  const openFn = useCallback(() => setOpen(true), [setOpen]);
  return { open, setOpen, toggle, close, open_: openFn };
}

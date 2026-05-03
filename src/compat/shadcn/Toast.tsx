"use client";

// shadcn-shaped Toast — backed by voidframe's `Toaster` + `toast`. The
// shadcn `useToast` hook returns `{ toast, dismiss }`; we wrap the
// imperative voidframe API in that shape. Sonner-style aliases (e.g.
// `toast.error`) already exist in voidframe (v1.1 Phase B10).

import { Toaster as VFToaster, toast as vfToast } from "../../components/ToastSystem";

export const Toaster = VFToaster;
export { vfToast as toast };

/**
 * shadcn's `useToast` returns `{ toast, dismiss }`. Consumers do
 *
 *     const { toast } = useToast();
 *     toast({ title: "Saved" });
 *
 * Voidframe's `toast` is a module-level imperative function; we simply
 * close over it in the hook return so the migration source stays
 * compatible.
 */
export function useToast() {
  return {
    toast: vfToast,
    dismiss: vfToast.dismiss,
  };
}

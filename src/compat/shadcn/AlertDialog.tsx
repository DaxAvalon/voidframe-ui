"use client";

// shadcn-shaped AlertDialog — backed by voidframe's AlertDialog. The
// shadcn API has compound members (Trigger / Content / Header / Title /
// Description / Footer / Action / Cancel) — voidframe's AlertDialog
// shares this shape via the underlying Dialog compound.

// AlertDialog doesn't have its own compound members — it shares Dialog's
// trigger/content/header/title/description/footer/action/cancel slots.
// shadcn naming maps directly to those underlying named exports.
import {
  AlertDialog as VFAlertDialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogAction,
  DialogCancel,
} from "../../components/Dialog";

export const AlertDialog = VFAlertDialog;
export const AlertDialogTrigger = DialogTrigger;
export const AlertDialogContent = DialogContent;
export const AlertDialogHeader = DialogHeader;
export const AlertDialogTitle = DialogTitle;
export const AlertDialogDescription = DialogDescription;
export const AlertDialogFooter = DialogFooter;
export const AlertDialogAction = DialogAction;
export const AlertDialogCancel = DialogCancel;

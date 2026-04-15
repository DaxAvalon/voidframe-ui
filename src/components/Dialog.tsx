"use client";

// Phase 10 — Dialog (compound modal) + AlertDialog + useConfirm
//
// Composes Portal + FocusScope + DismissableLayer + Presence. Keeps the
// existing simple `<Modal>` (in Interactive.tsx) untouched; consumers who
// want compound semantics import `<Dialog>` (or its `<AlertDialog>` cousin)
// from here.

import {
  Children,
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { Presence } from "../primitives/Presence";
import { cx } from "../utils/cx";

export type DialogSize = "sm" | "md" | "lg" | "xl" | "full";

interface DialogContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerId: string;
  contentId: string;
  titleId: string;
  descriptionId: string;
  variant: "dialog" | "alertdialog";
  hasTitle: boolean;
  hasDescription: boolean;
  registerTitle: (id: string | null) => void;
  registerDescription: (id: string | null) => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);
function useDialog(): DialogContextValue {
  const ctx = useContext(DialogContext);
  if (!ctx) throw new Error("Dialog.* must be used inside <Dialog>");
  return ctx;
}

export interface DialogProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** "alertdialog" tweaks role + initial focus for destructive flows. */
  variant?: "dialog" | "alertdialog";
  children?: ReactNode;
}

/**
 * A modal overlay anchored to the viewport with a focus trap and escape-to-close behavior.
 * Pair with Dialog.Trigger and Dialog.Content to compose a dismissible modal surface.
 */
function DialogRoot({
  open,
  defaultOpen,
  onOpenChange,
  variant = "dialog",
  children,
}: DialogProps) {
  const [internal, setInternal] = useState(defaultOpen ?? false);
  const isOpen = open ?? internal;
  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next);
      onOpenChange?.(next);
    },
    [open, onOpenChange]
  );
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const titleId = `${baseId}-title`;
  const descriptionId = `${baseId}-description`;
  const [titleAttachedId, setTitleAttachedId] = useState<string | null>(null);
  const [descAttachedId, setDescAttachedId] = useState<string | null>(null);
  const value: DialogContextValue = useMemo(
    () => ({
      open: isOpen,
      setOpen,
      triggerId,
      contentId,
      titleId,
      descriptionId,
      variant,
      hasTitle: titleAttachedId !== null,
      hasDescription: descAttachedId !== null,
      registerTitle: setTitleAttachedId,
      registerDescription: setDescAttachedId,
    }),
    [
      isOpen,
      setOpen,
      triggerId,
      contentId,
      titleId,
      descriptionId,
      variant,
      titleAttachedId,
      descAttachedId,
    ]
  );
  return <DialogContext.Provider value={value}>{children}</DialogContext.Provider>;
}

// ── Trigger ───────────────────────────────────────────────────

export interface DialogTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const DialogTrigger = forwardRef<HTMLElement, DialogTriggerProps>(
  function DialogTrigger({ asChild, onClick, children, ...props }, ref) {
    const ctx = useDialog();
    const handle = (e: React.MouseEvent<HTMLElement>) => {
      ctx.setOpen(true);
      onClick?.(e);
    };
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      return cloneElement(child, {
        id: ctx.triggerId,
        "aria-haspopup": "dialog",
        "aria-expanded": ctx.open,
        "aria-controls": ctx.contentId,
        onClick: handle,
        ...props,
      });
    }
    return (
      <button
        ref={ref as never}
        type="button"
        id={ctx.triggerId}
        aria-haspopup="dialog"
        aria-expanded={ctx.open}
        aria-controls={ctx.contentId}
        onClick={handle}
        {...props}
      >
        {children}
      </button>
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";

// ── Content ───────────────────────────────────────────────────

export interface DialogContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: DialogSize;
  /** Disable focus trap. Default false. */
  trapFocus?: boolean;
  /** Disable focus restore on close. */
  restoreFocus?: boolean;
  onEscape?: (e: KeyboardEvent) => void;
  onInteractOutside?: (e: PointerEvent) => void;
  /** When false, the dialog renders inline without a Portal. */
  modal?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
  function DialogContent(
    {
      size = "md",
      trapFocus = true,
      restoreFocus = true,
      onEscape,
      onInteractOutside,
      modal = true,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const ctx = useDialog();
    const inner = (
      <div className="vf-dialog">
        <div
          className="vf-dialog__backdrop"
          onClick={() => ctx.setOpen(false)}
          aria-hidden="true"
        />
        <DismissableLayer
          onEscapeKeyDown={(e) => {
            onEscape?.(e);
            if (!e.defaultPrevented) ctx.setOpen(false);
          }}
          onPointerDownOutside={(e) => {
            onInteractOutside?.(e);
            if (!e.defaultPrevented) ctx.setOpen(false);
          }}
        >
          <FocusScope
            ref={ref as never}
            trapped={trapFocus}
            autoFocus
            restoreFocus={restoreFocus}
            loop
            id={ctx.contentId}
            role={ctx.variant === "alertdialog" ? "alertdialog" : "dialog"}
            aria-modal={modal || undefined}
            aria-labelledby={ctx.hasTitle ? ctx.titleId : undefined}
            aria-describedby={ctx.hasDescription ? ctx.descriptionId : undefined}
            className={cx("vf-dialog__panel", `vf-dialog__panel--${size}`, className)}
            style={style}
            {...(props as HTMLAttributes<HTMLDivElement>)}
          >
            {children}
          </FocusScope>
        </DismissableLayer>
      </div>
    );
    const presence = <Presence present={ctx.open}>{inner}</Presence>;
    return modal ? <Portal>{presence}</Portal> : presence;
  }
);
DialogContent.displayName = "DialogContent";

// ── Header / Title / Description / Body / Footer / Close / Cancel / Action ─

function DialogHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-dialog__header", className)} {...props} />;
}

const DialogTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function DialogTitle({ className, id, ...props }, ref) {
    const ctx = useDialog();
    const finalId = id ?? ctx.titleId;
    // Capture the stable register fn to avoid re-running this effect every
    // time `ctx` gets a new identity from the provider's state updates.
    const register = ctx.registerTitle;
    useEffect(() => {
      register(finalId);
      return () => register(null);
    }, [register, finalId]);
    return (
      <h2
        ref={ref}
        id={finalId}
        className={cx("vf-dialog__title", className)}
        {...props}
      />
    );
  }
);
DialogTitle.displayName = "DialogTitle";

const DialogDescription = forwardRef<
  HTMLParagraphElement,
  HTMLAttributes<HTMLParagraphElement>
>(function DialogDescription({ className, id, ...props }, ref) {
  const ctx = useDialog();
  const finalId = id ?? ctx.descriptionId;
  const register = ctx.registerDescription;
  useEffect(() => {
    register(finalId);
    return () => register(null);
  }, [register, finalId]);
  return (
    <p
      ref={ref}
      id={finalId}
      className={cx("vf-dialog__description", className)}
      {...props}
    />
  );
});
DialogDescription.displayName = "DialogDescription";

function DialogBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-dialog__body", className)} {...props} />;
}

function DialogFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-dialog__footer", className)} {...props} />;
}

export interface DialogCloseProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

function DialogClose({
  asChild,
  onClick,
  children,
  ...props
}: DialogCloseProps) {
  const ctx = useDialog();
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    ctx.setOpen(false);
    onClick?.(e);
  };
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      ...props,
      onClick: handle,
    });
  }
  return (
    <button
      type="button"
      aria-label="Close"
      className="vf-dialog__close"
      onClick={handle}
      {...props}
    >
      {children ?? "×"}
    </button>
  );
}

const DialogCancel = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function DialogCancel({ className, onClick, children, ...props }, ref) {
  const ctx = useDialog();
  return (
    <button
      ref={ref}
      type="button"
      className={cx("vf-button", "vf-button--ghost", className)}
      onClick={(e) => {
        onClick?.(e);
        ctx.setOpen(false);
      }}
      {...props}
    >
      {children ?? "Cancel"}
    </button>
  );
});
DialogCancel.displayName = "DialogCancel";

const DialogAction = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { autoClose?: boolean }
>(function DialogAction(
  { className, onClick, children, autoClose = true, ...props },
  ref
) {
  const ctx = useDialog();
  return (
    <button
      ref={ref}
      type="button"
      className={cx("vf-button", className)}
      onClick={(e) => {
        onClick?.(e);
        if (autoClose) ctx.setOpen(false);
      }}
      {...props}
    >
      {children ?? "OK"}
    </button>
  );
});
DialogAction.displayName = "DialogAction";

// ── Compound ──────────────────────────────────────────────────

/**
 * Modal overlay with focus trap, escape-to-close, and portaled content.
 * Controlled via `open` / `onOpenChange`. Compose with `Dialog.Trigger`,
 * `Dialog.Content`, `Dialog.Header`, `Dialog.Footer`, and the action
 * sub-components for confirm flows.
 */
export const Dialog = Object.assign(DialogRoot, {
  Trigger: DialogTrigger,
  Content: DialogContent,
  Header: DialogHeader,
  Title: DialogTitle,
  Description: DialogDescription,
  Body: DialogBody,
  Footer: DialogFooter,
  Close: DialogClose,
  Cancel: DialogCancel,
  Action: DialogAction,
});

// ── AlertDialog ───────────────────────────────────────────────

export interface AlertDialogProps extends Omit<DialogProps, "variant"> {}

export function AlertDialog(props: AlertDialogProps) {
  return <DialogRoot {...props} variant="alertdialog" />;
}

// ── ConfirmDialog (compound + props API) ──────────────────────

export interface ConfirmDialogPropsV2 {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmTone?: "neutral" | "danger" | "success";
  destructive?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

export function ConfirmDialogV2({
  open,
  defaultOpen,
  onOpenChange,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  confirmTone,
  destructive,
  onConfirm,
  onCancel,
}: ConfirmDialogPropsV2) {
  return (
    <AlertDialog
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <Dialog.Content size="sm">
        <Dialog.Header>
          <Dialog.Title>{title}</Dialog.Title>
          {description && <Dialog.Description>{description}</Dialog.Description>}
        </Dialog.Header>
        <Dialog.Footer>
          <Dialog.Cancel onClick={() => onCancel?.()}>{cancelLabel}</Dialog.Cancel>
          <Dialog.Action
            data-tone={confirmTone ?? (destructive ? "danger" : undefined)}
            onClick={() => onConfirm?.()}
          >
            {confirmLabel}
          </Dialog.Action>
        </Dialog.Footer>
      </Dialog.Content>
    </AlertDialog>
  );
}

// ── useConfirm hook + ConfirmProvider ─────────────────────────

interface ConfirmRequest extends Omit<ConfirmDialogPropsV2, "open" | "onConfirm" | "onCancel"> {
  resolve: (ok: boolean) => void;
}

interface ConfirmContextValue {
  confirm: (opts?: Omit<ConfirmDialogPropsV2, "open" | "onConfirm" | "onCancel">) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextValue | null>(null);

export interface ConfirmProviderProps {
  children?: ReactNode;
}

export function ConfirmProvider({ children }: ConfirmProviderProps) {
  const [request, setRequest] = useState<ConfirmRequest | null>(null);
  const confirm = useCallback(
    (opts?: Omit<ConfirmDialogPropsV2, "open" | "onConfirm" | "onCancel">): Promise<boolean> =>
      new Promise((resolve) => {
        setRequest({ ...opts, resolve });
      }),
    []
  );
  const onConfirm = () => {
    request?.resolve(true);
    setRequest(null);
  };
  const onCancel = () => {
    request?.resolve(false);
    setRequest(null);
  };
  const value = useMemo<ConfirmContextValue>(() => ({ confirm }), [confirm]);
  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {request && (
        <ConfirmDialogV2
          open
          title={request.title}
          description={request.description}
          confirmLabel={request.confirmLabel}
          cancelLabel={request.cancelLabel}
          confirmTone={request.confirmTone}
          destructive={request.destructive}
          onConfirm={onConfirm}
          onCancel={onCancel}
          onOpenChange={(next) => {
            if (!next) onCancel();
          }}
        />
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): (opts?: Omit<ConfirmDialogPropsV2, "open" | "onConfirm" | "onCancel">) => Promise<boolean> {
  const ctx = useContext(ConfirmContext);
  if (!ctx)
    throw new Error("useConfirm() requires <ConfirmProvider> in the tree.");
  return ctx.confirm;
}

// Helper to count children of a specific type inside Content.
export function countDialogChildren(
  parent: ReactNode,
  predicate: (el: ReactElement) => boolean
): number {
  let n = 0;
  Children.forEach(parent, (child) => {
    if (isValidElement(child) && predicate(child)) n++;
  });
  return n;
}

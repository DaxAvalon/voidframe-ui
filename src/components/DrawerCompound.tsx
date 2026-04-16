"use client";

// Phase 10 — DrawerV2 (compound) + Sheet (mobile bottom sheet)
//
// Same primitive composition as Dialog. Renamed `DrawerV2` to keep the
// existing simple `<Drawer>` (Overlay.tsx) untouched.

import {
  cloneElement,
  createContext,
  forwardRef,
  isValidElement,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from "react";
import { useId } from "../hooks/useId";
import { DismissableLayer } from "../primitives/DismissableLayer";
import { FocusScope } from "../primitives/FocusScope";
import { Portal } from "../primitives/Portal";
import { Presence } from "../primitives/Presence";
import { cx } from "../utils/cx";

export type DrawerSide = "left" | "right" | "top" | "bottom";

interface DrawerContextValue {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerId: string;
  contentId: string;
  titleId: string;
  side: DrawerSide;
  modal: boolean;
}

const DrawerContext = createContext<DrawerContextValue | null>(null);
function useDrawerCtx(): DrawerContextValue {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("DrawerV2.* must be used inside <DrawerV2>");
  return ctx;
}

export interface DrawerV2Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  side?: DrawerSide;
  modal?: boolean;
  children?: ReactNode;
}

/**
 * A side-anchored panel that slides in from the top, right, bottom, or left.
 * Use with DrawerV2.Trigger and DrawerV2.Content to compose dismissible off-canvas surfaces.
 */
function DrawerRoot({
  open,
  defaultOpen,
  onOpenChange,
  side = "right",
  modal = true,
  children,
}: DrawerV2Props) {
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
  const value = useMemo<DrawerContextValue>(
    () => ({ open: isOpen, setOpen, triggerId, contentId, titleId, side, modal }),
    [isOpen, setOpen, triggerId, contentId, titleId, side, modal]
  );
  return <DrawerContext.Provider value={value}>{children}</DrawerContext.Provider>;
}

const DrawerTrigger = forwardRef<HTMLElement, { asChild?: boolean } & HTMLAttributes<HTMLElement>>(
  function DrawerTrigger({ asChild, onClick, children, ...props }, ref) {
    const ctx = useDrawerCtx();
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
DrawerTrigger.displayName = "DrawerV2Trigger";

export interface DrawerV2ContentProps extends HTMLAttributes<HTMLDivElement> {
  size?: number | string;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  /** Expand to full-width below the `md` breakpoint. Default true. */
  adaptive?: boolean;
  onEscape?: (e: KeyboardEvent) => void;
  onInteractOutside?: (e: PointerEvent) => void;
  children?: ReactNode;
}

const DrawerContent = forwardRef<HTMLDivElement, DrawerV2ContentProps>(
  function DrawerContent(
    {
      size = 360,
      trapFocus = true,
      restoreFocus = true,
      adaptive = true,
      onEscape,
      onInteractOutside,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const ctx = useDrawerCtx();
    const dimension =
      ctx.side === "left" || ctx.side === "right" ? "width" : "height";
    const merged: CSSProperties = {
      [dimension]: typeof size === "number" ? `${size}px` : size,
      ...style,
    };
    const inner = (
      <div className={cx("vf-drawer-v2", `vf-drawer-v2--${ctx.side}`)}>
        {ctx.modal && (
          <div
            className="vf-drawer-v2__backdrop"
            aria-hidden="true"
            onClick={() => ctx.setOpen(false)}
          />
        )}
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
            role="dialog"
            aria-modal={ctx.modal || undefined}
            aria-labelledby={ctx.titleId}
            className={cx(
              "vf-drawer-v2__panel",
              `vf-drawer-v2__panel--${ctx.side}`,
              adaptive && "vf-drawer-v2__panel--adaptive",
              className
            )}
            style={merged}
            data-adaptive={adaptive ? "true" : undefined}
            {...(props as HTMLAttributes<HTMLDivElement>)}
          >
            {children}
          </FocusScope>
        </DismissableLayer>
      </div>
    );
    const presence = <Presence present={ctx.open}>{inner}</Presence>;
    return ctx.modal ? <Portal>{presence}</Portal> : presence;
  }
);
DrawerContent.displayName = "DrawerV2Content";

function DrawerHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-drawer-v2__header", className)} {...props} />;
}

const DrawerTitle = forwardRef<HTMLHeadingElement, HTMLAttributes<HTMLHeadingElement>>(
  function DrawerTitle({ id, className, ...props }, ref) {
    const ctx = useDrawerCtx();
    return (
      <h2
        ref={ref}
        id={id ?? ctx.titleId}
        className={cx("vf-drawer-v2__title", className)}
        {...props}
      />
    );
  }
);
DrawerTitle.displayName = "DrawerV2Title";

function DrawerBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-drawer-v2__body", className)} {...props} />;
}

function DrawerFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-drawer-v2__footer", className)} {...props} />;
}

function DrawerClose({
  asChild,
  onClick,
  children,
  ...props
}: { asChild?: boolean } & HTMLAttributes<HTMLElement>) {
  const ctx = useDrawerCtx();
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    ctx.setOpen(false);
    onClick?.(e);
  };
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, { ...props, onClick: handle });
  }
  return (
    <button
      type="button"
      aria-label="Close"
      className="vf-drawer-v2__close"
      onClick={handle}
      {...props}
    >
      {children ?? "×"}
    </button>
  );
}

/**
 * Side-anchored panel (top / right / bottom / left) with focus trap
 * and escape-to-close. Controlled via `open` / `onOpenChange`. Compose
 * with `DrawerV2.Trigger`, `DrawerV2.Content`, and the header/body/
 * footer sub-components.
 */
DrawerRoot.displayName = "DrawerV2";
export const DrawerV2 = Object.assign(DrawerRoot, {
  Trigger: DrawerTrigger,
  Content: DrawerContent,
  Header: DrawerHeader,
  Title: DrawerTitle,
  Body: DrawerBody,
  Footer: DrawerFooter,
  Close: DrawerClose,
});

// ── Sheet (mobile bottom drawer with snap points) ────────────

interface SheetContextValue extends DrawerContextValue {
  snapIndex: number;
  setSnapIndex: (i: number) => void;
  snapPoints: number[];
  /** Live drag offset (px). Positive = dragged down. `null` when not dragging. */
  dragPx: number | null;
  setDragPx: (next: number | null) => void;
}

const SheetContext = createContext<SheetContextValue | null>(null);
function useSheet(): SheetContextValue {
  const ctx = useContext(SheetContext);
  if (!ctx) throw new Error("Sheet.* must be inside <Sheet>");
  return ctx;
}

export interface SheetProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Heights (0..1 of viewport). Default `[0.4, 0.9]`. */
  snapPoints?: number[];
  defaultSnap?: number;
  modal?: boolean;
  children?: ReactNode;
}

function SheetRoot({
  open,
  defaultOpen,
  onOpenChange,
  snapPoints = [0.4, 0.9],
  defaultSnap = 0,
  modal = true,
  children,
}: SheetProps) {
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
  const [snapIndex, setSnapIndex] = useState<number>(defaultSnap);
  const [dragPx, setDragPx] = useState<number | null>(null);
  const value = useMemo<SheetContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      triggerId,
      contentId,
      titleId,
      side: "bottom",
      modal,
      snapIndex,
      setSnapIndex,
      snapPoints,
      dragPx,
      setDragPx,
    }),
    [isOpen, setOpen, triggerId, contentId, titleId, modal, snapIndex, snapPoints, dragPx]
  );
  return <SheetContext.Provider value={value}>{children}</SheetContext.Provider>;
}

function SheetTrigger({ asChild, onClick, children, ...props }: { asChild?: boolean } & HTMLAttributes<HTMLElement>) {
  const ctx = useSheet();
  const handle = (e: React.MouseEvent<HTMLElement>) => {
    ctx.setOpen(true);
    onClick?.(e);
  };
  if (asChild && isValidElement(children)) {
    const child = children as ReactElement<Record<string, unknown>>;
    return cloneElement(child, {
      id: ctx.triggerId,
      onClick: handle,
      ...props,
    });
  }
  return (
    <button type="button" id={ctx.triggerId} onClick={handle} {...props}>
      {children}
    </button>
  );
}

function SheetContent({
  className,
  style,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useSheet();
  const heightRatio = ctx.snapPoints[ctx.snapIndex] ?? 0.4;
  // While dragging, override the snap-based height with a continuous px value
  // so the panel tracks the pointer smoothly.
  const vh = typeof window !== "undefined" ? window.innerHeight : 800;
  const baseHeight = heightRatio * vh;
  const dragging = ctx.dragPx !== null;
  const liveHeight = Math.max(60, Math.min(vh, baseHeight - (ctx.dragPx ?? 0)));
  const mergedStyle: CSSProperties = dragging
    ? { height: `${liveHeight}px`, transition: "none", ...style }
    : { height: `${heightRatio * 100}vh`, ...style };
  const inner = (
    <div className="vf-sheet">
      {ctx.modal && (
        <div
          className="vf-sheet__backdrop"
          aria-hidden="true"
          onClick={() => ctx.setOpen(false)}
        />
      )}
      <DismissableLayer onDismiss={() => ctx.setOpen(false)}>
        <FocusScope
          trapped
          autoFocus
          restoreFocus
          loop
          id={ctx.contentId}
          role="dialog"
          aria-modal={ctx.modal || undefined}
          aria-labelledby={ctx.titleId}
          className={cx("vf-sheet__panel", className)}
          style={mergedStyle}
          data-dragging={dragging || undefined}
          {...props}
        >
          {children}
        </FocusScope>
      </DismissableLayer>
    </div>
  );
  return (
    <Portal>
      <Presence present={ctx.open}>{inner}</Presence>
    </Portal>
  );
}

function SheetHandle(props: HTMLAttributes<HTMLDivElement>) {
  const ctx = useSheet();
  const startY = useRef<number | null>(null);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    startY.current = e.clientY;
    ctx.setDragPx(0);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    ctx.setDragPx(e.clientY - startY.current);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (startY.current === null) return;
    const dy = e.clientY - startY.current;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    const startRatio = ctx.snapPoints[ctx.snapIndex] ?? 0.4;
    const endRatio = Math.max(0, startRatio - dy / vh);
    // Close if user dragged past 60% of the smallest snap.
    const smallest = ctx.snapPoints[0] ?? 0.4;
    if (endRatio < smallest * 0.6) {
      ctx.setOpen(false);
    } else {
      // Snap to nearest point.
      let nearest = 0;
      let best = Infinity;
      ctx.snapPoints.forEach((p, i) => {
        const d = Math.abs(p - endRatio);
        if (d < best) { best = d; nearest = i; }
      });
      if (nearest !== ctx.snapIndex) ctx.setSnapIndex(nearest);
    }
    startY.current = null;
    ctx.setDragPx(null);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };

  return (
    <div
      role="separator"
      aria-orientation="horizontal"
      aria-label="Drag to resize"
      className="vf-sheet__handle"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      {...props}
    />
  );
}

function SheetHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-sheet__header", className)} {...props} />;
}

function SheetBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cx("vf-sheet__body", className)} {...props} />;
}

function SheetTitle({ id, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  const ctx = useSheet();
  return (
    <h2
      id={id ?? ctx.titleId}
      className={cx("vf-sheet__title", className)}
      {...props}
    />
  );
}

export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Content: SheetContent,
  Handle: SheetHandle,
  Header: SheetHeader,
  Body: SheetBody,
  Title: SheetTitle,
});


"use client";

// Phase 10 — Popover (compound), Tooltip + TooltipProvider, HoverCard
//
// All three are anchored overlays. We keep the floating-position math minimal
// (no floating-ui dep): position relative to the trigger's bounding rect,
// compute placement/offset, and flip when there's no room.

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
  useRef,
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
import {
  computeAnchoredPosition,
  type AnchorPosition,
  type Placement,
} from "../utils/anchor";
import { cx } from "../utils/cx";

export type { Placement, AnchorPosition };

interface AnchoredOverlayContext {
  open: boolean;
  setOpen: (next: boolean) => void;
  triggerId: string;
  contentId: string;
  setTriggerEl: (el: HTMLElement | null) => void;
  triggerEl: HTMLElement | null;
}

// ── Popover ──────────────────────────────────────────────────

const PopoverContext = createContext<AnchoredOverlayContext | null>(null);
function usePopoverCtx(): AnchoredOverlayContext {
  const ctx = useContext(PopoverContext);
  if (!ctx) throw new Error("Popover.* must be used inside <Popover>");
  return ctx;
}

export interface PopoverV2Props {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function PopoverRoot({ open, defaultOpen, onOpenChange, children }: PopoverV2Props) {
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
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const value = useMemo<AnchoredOverlayContext>(
    () => ({ open: isOpen, setOpen, triggerId, contentId, triggerEl, setTriggerEl }),
    [isOpen, setOpen, triggerId, contentId, triggerEl]
  );
  return <PopoverContext.Provider value={value}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps extends HTMLAttributes<HTMLElement> {
  asChild?: boolean;
}

const PopoverTrigger = forwardRef<HTMLElement, PopoverTriggerProps>(
  function PopoverTrigger({ asChild, onClick, children, ...props }, ref) {
    const ctx = usePopoverCtx();
    const handle = (e: React.MouseEvent<HTMLElement>) => {
      ctx.setOpen(!ctx.open);
      onClick?.(e);
    };
    const captureRef = (node: HTMLElement | null) => {
      ctx.setTriggerEl(node);
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    };
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      return cloneElement(child, {
        ref: captureRef,
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
        ref={captureRef as never}
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
PopoverTrigger.displayName = "PopoverTrigger";

export interface PopoverContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
  modal?: boolean;
  arrow?: boolean;
  children?: ReactNode;
}

const PopoverContent = forwardRef<HTMLDivElement, PopoverContentProps>(
  function PopoverContent(
    { placement = "bottom-start", offset = 4, modal, arrow, className, style, children, ...props },
    ref
  ) {
    const ctx = usePopoverCtx();
    const contentRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<AnchorPosition | null>(null);

    useEffect(() => {
      if (!ctx.open || !ctx.triggerEl || !contentRef.current) return;
      const update = () => {
        const trig = ctx.triggerEl!.getBoundingClientRect();
        const el = contentRef.current!;
        const size = { width: el.offsetWidth, height: el.offsetHeight };
        setPos(computeAnchoredPosition(trig, size, placement, offset));
      };
      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [ctx.open, ctx.triggerEl, placement, offset]);

    if (!ctx.open) return null;

    const inline: CSSProperties = pos
      ? { position: "fixed", top: pos.top, left: pos.left, ...style }
      : { position: "fixed", top: -9999, left: -9999, ...style };

    const inner = (
      <DismissableLayer onDismiss={() => ctx.setOpen(false)}>
        <FocusScope
          ref={(node) => {
            (contentRef as { current: HTMLDivElement | null }).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
          }}
          trapped={!!modal}
          autoFocus={!!modal}
          restoreFocus={!!modal}
          loop={!!modal}
          id={ctx.contentId}
          role="dialog"
          aria-labelledby={ctx.triggerId}
          className={cx("vf-popover-v2", placement && `vf-popover-v2--${placement}`, className)}
          style={inline}
          data-side={pos?.side}
          {...props}
        >
          {children}
          {arrow && pos && (
            <span aria-hidden="true" className={cx("vf-popover-v2__arrow", `vf-popover-v2__arrow--${pos.side}`)} />
          )}
        </FocusScope>
      </DismissableLayer>
    );
    return <Portal>{inner}</Portal>;
  }
);
PopoverContent.displayName = "PopoverContent";

export const PopoverV2 = Object.assign(PopoverRoot, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
});

// ── Tooltip ──────────────────────────────────────────────────

interface TooltipProviderValue {
  delayDuration: number;
  skipDelayDuration: number;
  lastClosedAt: number;
  setLastClosedAt: (n: number) => void;
}

const TooltipProviderCtx = createContext<TooltipProviderValue | null>(null);

export interface TooltipProviderProps {
  delayDuration?: number;
  skipDelayDuration?: number;
  children?: ReactNode;
}

export function TooltipProvider({
  delayDuration = 300,
  skipDelayDuration = 200,
  children,
}: TooltipProviderProps) {
  const lastClosed = useRef(0);
  const value = useMemo<TooltipProviderValue>(
    () => ({
      delayDuration,
      skipDelayDuration,
      lastClosedAt: lastClosed.current,
      setLastClosedAt: (n) => {
        lastClosed.current = n;
      },
    }),
    [delayDuration, skipDelayDuration]
  );
  return <TooltipProviderCtx.Provider value={value}>{children}</TooltipProviderCtx.Provider>;
}

export interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  placement?: Placement;
  offset?: number;
  openDelay?: number;
  closeDelay?: number;
  /** Override aria pattern. Default infers from focusability. */
  asAriaLabel?: boolean;
}

export function Tooltip({
  content,
  children,
  placement = "top",
  offset = 6,
  openDelay,
  closeDelay = 100,
  asAriaLabel,
}: TooltipProps) {
  const provider = useContext(TooltipProviderCtx);
  const effectiveOpenDelay =
    openDelay ??
    (provider
      ? Date.now() - provider.lastClosedAt < provider.skipDelayDuration
        ? 0
        : provider.delayDuration
      : 300);
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<AnchorPosition | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  const cancelTimers = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const show = () => {
    cancelTimers();
    openTimer.current = setTimeout(() => setOpen(true), effectiveOpenDelay);
  };
  const hide = () => {
    cancelTimers();
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      provider?.setLastClosedAt(Date.now());
    }, closeDelay);
  };

  useEffect(() => {
    if (!open || !triggerRef.current || !contentRef.current) return;
    const trig = triggerRef.current.getBoundingClientRect();
    const el = contentRef.current;
    const size = { width: el.offsetWidth, height: el.offsetHeight };
    setPos(computeAnchoredPosition(trig, size, placement, offset));
  }, [open, placement, offset]);

  useEffect(() => () => cancelTimers(), []);

  if (!isValidElement(children)) {
    throw new Error("Tooltip expects a single React element as a child.");
  }
  const child = children as ReactElement<Record<string, unknown>>;
  const captureRef = (node: HTMLElement | null) => {
    triggerRef.current = node;
    const childRef = (child as { ref?: React.Ref<HTMLElement> }).ref;
    if (typeof childRef === "function") childRef(node);
    else if (childRef && typeof childRef === "object")
      (childRef as { current: HTMLElement | null }).current = node;
  };

  const childProps: Record<string, unknown> = {
    ref: captureRef,
    onMouseEnter: (e: React.MouseEvent) => {
      show();
      const original = (child.props as Record<string, unknown>)
        .onMouseEnter as ((e: React.MouseEvent) => void) | undefined;
      original?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      hide();
      const original = (child.props as Record<string, unknown>)
        .onMouseLeave as ((e: React.MouseEvent) => void) | undefined;
      original?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      show();
      const original = (child.props as Record<string, unknown>)
        .onFocus as ((e: React.FocusEvent) => void) | undefined;
      original?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      hide();
      const original = (child.props as Record<string, unknown>)
        .onBlur as ((e: React.FocusEvent) => void) | undefined;
      original?.(e);
    },
  };
  if (asAriaLabel && typeof content === "string") {
    childProps["aria-label"] = content;
  } else {
    childProps["aria-describedby"] = tooltipId;
  }

  const inline: CSSProperties = pos
    ? { position: "fixed", top: pos.top, left: pos.left }
    : { position: "fixed", top: -9999, left: -9999 };

  return (
    <>
      {cloneElement(child, childProps)}
      {open && (
        <Portal>
          <div
            ref={contentRef}
            id={tooltipId}
            role="tooltip"
            className="vf-tooltip-v2"
            style={inline}
            data-side={pos?.side}
            onMouseEnter={cancelTimers}
            onMouseLeave={hide}
          >
            {content}
          </div>
        </Portal>
      )}
    </>
  );
}

// ── HoverCard ────────────────────────────────────────────────

interface HoverCardContextValue extends AnchoredOverlayContext {
  openDelay: number;
  closeDelay: number;
  scheduleOpen: () => void;
  scheduleClose: () => void;
}

const HoverCardContext = createContext<HoverCardContextValue | null>(null);
function useHoverCard(): HoverCardContextValue {
  const ctx = useContext(HoverCardContext);
  if (!ctx) throw new Error("HoverCard.* must be used inside <HoverCard>");
  return ctx;
}

export interface HoverCardProps {
  openDelay?: number;
  closeDelay?: number;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: ReactNode;
}

function HoverCardRoot({
  openDelay = 400,
  closeDelay = 200,
  open,
  defaultOpen,
  onOpenChange,
  children,
}: HoverCardProps) {
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
  const [triggerEl, setTriggerEl] = useState<HTMLElement | null>(null);
  const openTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (openTimer.current) clearTimeout(openTimer.current);
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };
  const scheduleOpen = () => {
    cancel();
    openTimer.current = setTimeout(() => setOpen(true), openDelay);
  };
  const scheduleClose = () => {
    cancel();
    closeTimer.current = setTimeout(() => setOpen(false), closeDelay);
  };
  useEffect(() => () => cancel(), []);
  const value = useMemo<HoverCardContextValue>(
    () => ({
      open: isOpen,
      setOpen,
      triggerId,
      contentId,
      triggerEl,
      setTriggerEl,
      openDelay,
      closeDelay,
      scheduleOpen,
      scheduleClose,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isOpen, triggerId, contentId, triggerEl, openDelay, closeDelay]
  );
  return <HoverCardContext.Provider value={value}>{children}</HoverCardContext.Provider>;
}

const HoverCardTrigger = forwardRef<HTMLElement, { asChild?: boolean } & HTMLAttributes<HTMLElement>>(
  function HoverCardTrigger({ asChild, children, ...props }, ref) {
    const ctx = useHoverCard();
    const captureRef = (node: HTMLElement | null) => {
      ctx.setTriggerEl(node);
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLElement | null }).current = node;
    };
    const binds = {
      onMouseEnter: ctx.scheduleOpen,
      onMouseLeave: ctx.scheduleClose,
      onFocus: ctx.scheduleOpen,
      onBlur: ctx.scheduleClose,
    };
    if (asChild && isValidElement(children)) {
      const child = children as ReactElement<Record<string, unknown>>;
      return cloneElement(child, {
        ref: captureRef,
        id: ctx.triggerId,
        ...binds,
        ...props,
      });
    }
    return (
      <span
        ref={captureRef as never}
        id={ctx.triggerId}
        {...binds}
        {...props}
      >
        {children}
      </span>
    );
  }
);
HoverCardTrigger.displayName = "HoverCardTrigger";

export interface HoverCardContentProps extends HTMLAttributes<HTMLDivElement> {
  placement?: Placement;
  offset?: number;
  children?: ReactNode;
}

const HoverCardContent = forwardRef<HTMLDivElement, HoverCardContentProps>(
  function HoverCardContent(
    { placement = "bottom", offset = 8, className, style, children, ...props },
    ref
  ) {
    const ctx = useHoverCard();
    const contentRef = useRef<HTMLDivElement>(null);
    const [pos, setPos] = useState<AnchorPosition | null>(null);
    useEffect(() => {
      if (!ctx.open || !ctx.triggerEl || !contentRef.current) return;
      const update = () => {
        const trig = ctx.triggerEl!.getBoundingClientRect();
        const el = contentRef.current!;
        setPos(computeAnchoredPosition(trig, { width: el.offsetWidth, height: el.offsetHeight }, placement, offset));
      };
      update();
      window.addEventListener("scroll", update, true);
      window.addEventListener("resize", update);
      return () => {
        window.removeEventListener("scroll", update, true);
        window.removeEventListener("resize", update);
      };
    }, [ctx.open, ctx.triggerEl, placement, offset]);
    if (!ctx.open) return null;
    const inline: CSSProperties = pos
      ? { position: "fixed", top: pos.top, left: pos.left, ...style }
      : { position: "fixed", top: -9999, left: -9999, ...style };
    return (
      <Portal>
        <div
          ref={(node) => {
            (contentRef as { current: HTMLDivElement | null }).current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
          }}
          id={ctx.contentId}
          role="dialog"
          aria-labelledby={ctx.triggerId}
          className={cx("vf-hovercard", className)}
          style={inline}
          data-side={pos?.side}
          onMouseEnter={() => {
            // Cancel any pending close so users can move into the card.
            ctx.scheduleOpen();
          }}
          onMouseLeave={ctx.scheduleClose}
          {...props}
        >
          {children}
        </div>
      </Portal>
    );
  }
);
HoverCardContent.displayName = "HoverCardContent";

export const HoverCard = Object.assign(HoverCardRoot, {
  Trigger: HoverCardTrigger,
  Content: HoverCardContent,
});

// ── Backdrop ─────────────────────────────────────────────────

export interface BackdropProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  blur?: boolean;
  tint?: string;
}

export const Backdrop = forwardRef<HTMLDivElement, BackdropProps>(function Backdrop(
  { open = true, blur, tint, className, style, ...props },
  ref
) {
  if (!open) return null;
  const merged: CSSProperties = {
    ...(tint ? { background: tint } : {}),
    ...(blur ? { backdropFilter: "blur(4px)" } : {}),
    ...style,
  };
  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={cx("vf-backdrop", className)}
      style={merged}
      {...props}
    />
  );
});
Backdrop.displayName = "Backdrop";

// Re-export Children for tests that walk subtrees.
export { Children };

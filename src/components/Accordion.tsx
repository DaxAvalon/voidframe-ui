"use client";

// Phase 11 — Accordion (compound) + Collapsible upgrade
//
// Accordion manages a single or multiple expanded items per WAI-ARIA pattern.
// Each Item has a Trigger that toggles its Content. Keyboard:
//   ArrowDown / ArrowUp — move between triggers
//   Home / End          — first / last trigger
//   Enter / Space       — toggle current item

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

export type AccordionType = "single" | "multiple";

interface AccordionContextValue {
  type: AccordionType;
  value: string[];
  toggle: (v: string) => void;
  collapsible: boolean;
  registerTrigger: (id: string, ref: HTMLElement | null) => void;
  triggerRefs: React.MutableRefObject<Map<string, HTMLElement>>;
  triggerOrder: string[];
}

const AccordionContext = createContext<AccordionContextValue | null>(null);
function useAccordion(): AccordionContextValue {
  const ctx = useContext(AccordionContext);
  if (!ctx) throw new Error("Accordion.* must be inside <Accordion>");
  return ctx;
}

interface ItemContextValue {
  value: string;
  isOpen: boolean;
  triggerId: string;
  contentId: string;
  toggle: () => void;
  registerTrigger: (ref: HTMLElement | null) => void;
}

const ItemContext = createContext<ItemContextValue | null>(null);
function useItem(): ItemContextValue {
  const ctx = useContext(ItemContext);
  if (!ctx) throw new Error("Accordion.Trigger/Content must be inside Accordion.Item");
  return ctx;
}

export interface AccordionProps extends HTMLAttributes<HTMLDivElement> {
  type?: AccordionType;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  collapsible?: boolean;
  children?: ReactNode;
  style?: CSSProperties;
}

function AccordionRoot({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  className,
  children,
  ...props
}: AccordionProps) {
  const [internal, setInternal] = useState<string[]>(() => {
    if (defaultValue === undefined) return [];
    return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
  });
  const current = useMemo<string[]>(() => {
    if (value === undefined) return internal;
    return Array.isArray(value) ? value : value ? [value] : [];
  }, [value, internal]);

  const setValueInternal = useCallback(
    (next: string[]) => {
      if (value === undefined) setInternal(next);
      const emit = type === "single" ? next[0] ?? "" : next;
      onValueChange?.(emit);
    },
    [value, type, onValueChange]
  );

  const toggle = useCallback(
    (v: string) => {
      const isOpen = current.includes(v);
      let next: string[];
      if (type === "single") {
        if (isOpen) next = collapsible ? [] : current;
        else next = [v];
      } else {
        next = isOpen ? current.filter((x) => x !== v) : [...current, v];
      }
      setValueInternal(next);
    },
    [current, type, collapsible, setValueInternal]
  );

  const triggerRefs = useRef<Map<string, HTMLElement>>(new Map());
  const [triggerOrder, setTriggerOrder] = useState<string[]>([]);
  const registerTrigger = useCallback((id: string, ref: HTMLElement | null) => {
    if (ref) {
      triggerRefs.current.set(id, ref);
      setTriggerOrder((prev) => (prev.includes(id) ? prev : [...prev, id]));
    } else {
      triggerRefs.current.delete(id);
      setTriggerOrder((prev) => prev.filter((x) => x !== id));
    }
  }, []);

  const ctxValue = useMemo<AccordionContextValue>(
    () => ({
      type,
      value: current,
      toggle,
      collapsible,
      registerTrigger,
      triggerRefs,
      triggerOrder,
    }),
    [type, current, toggle, collapsible, registerTrigger, triggerOrder]
  );

  return (
    <AccordionContext.Provider value={ctxValue}>
      <div
        className={cx("vf-accordion", `vf-accordion--${type}`, className)}
        {...props}
      >
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export interface AccordionItemProps extends HTMLAttributes<HTMLDivElement> {
  value: string;
  disabled?: boolean;
  children?: ReactNode;
}

function AccordionItem({
  value,
  disabled,
  className,
  children,
  ...props
}: AccordionItemProps) {
  const ctx = useAccordion();
  const isOpen = ctx.value.includes(value);
  const baseId = useId();
  const triggerId = `${baseId}-trigger`;
  const contentId = `${baseId}-content`;
  const itemValue = useMemo<ItemContextValue>(
    () => ({
      value,
      isOpen,
      triggerId,
      contentId,
      toggle: () => !disabled && ctx.toggle(value),
      registerTrigger: (ref) => ctx.registerTrigger(value, ref),
    }),
    [value, isOpen, triggerId, contentId, disabled, ctx]
  );
  return (
    <ItemContext.Provider value={itemValue}>
      <div
        data-state={isOpen ? "open" : "closed"}
        data-disabled={disabled || undefined}
        className={cx(
          "vf-accordion__item",
          isOpen && "vf-accordion__item--open",
          disabled && "vf-accordion__item--disabled",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ItemContext.Provider>
  );
}

const AccordionTrigger = forwardRef<HTMLButtonElement, HTMLAttributes<HTMLButtonElement>>(
  function AccordionTrigger({ className, children, onKeyDown, ...props }, ref) {
    const accordion = useAccordion();
    const item = useItem();
    const innerRef = useRef<HTMLButtonElement | null>(null);
    // Register the trigger element exactly once after mount; deregister on
    // unmount. Avoids re-registering on every render (which used to oscillate
    // through the `triggerOrder` state and cause an update-depth loop).
    useEffect(() => {
      item.registerTrigger(innerRef.current);
      return () => item.registerTrigger(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const captureRef = (node: HTMLButtonElement | null) => {
      innerRef.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLButtonElement | null }).current = node;
    };
    const handleKey = (e: KeyboardEvent<HTMLButtonElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      const order = accordion.triggerOrder;
      const idx = order.indexOf(item.value);
      const focusByIdx = (i: number) => {
        const next = order[Math.max(0, Math.min(order.length - 1, i))];
        if (!next) return;
        const el = accordion.triggerRefs.current.get(next);
        el?.focus();
      };
      if (e.key === "ArrowDown") {
        e.preventDefault();
        focusByIdx(idx + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        focusByIdx(idx - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusByIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusByIdx(order.length - 1);
      }
    };
    return (
      <button
        ref={captureRef}
        type="button"
        id={item.triggerId}
        aria-controls={item.contentId}
        aria-expanded={item.isOpen}
        className={cx(
          "vf-accordion__trigger",
          item.isOpen && "vf-accordion__trigger--open",
          className
        )}
        onClick={item.toggle}
        onKeyDown={handleKey}
        {...props}
      >
        <span className="vf-accordion__trigger-label">{children}</span>
        <span aria-hidden="true" className="vf-accordion__caret">
          {item.isOpen ? "▾" : "▸"}
        </span>
      </button>
    );
  }
);
AccordionTrigger.displayName = "AccordionTrigger";

function AccordionContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const item = useItem();
  if (!item.isOpen) return null;
  return (
    <div
      id={item.contentId}
      role="region"
      aria-labelledby={item.triggerId}
      className={cx("vf-accordion__content", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export const Accordion = Object.assign(AccordionRoot, {
  Item: AccordionItem,
  Trigger: AccordionTrigger,
  Content: AccordionContent,
});

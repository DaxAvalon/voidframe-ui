"use client";

// DecisionBar — the actions of an approval or review surface (approve,
// decline with a reason, escalate) with an optional "blocked because" state
// and per-action confirmation; DecisionCard frames one request with its
// requester, expiry and details.

import { forwardRef, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";
import type { Tone } from "../types";
import { Button, type ButtonVariant } from "./Button";
import { ConfirmDialogV2 } from "./Dialog";

export interface DecisionAction {
  id: string;
  label: ReactNode;
  tone?: Tone;
  variant?: ButtonVariant;
  disabled?: boolean;
  /** Ask before deciding; `reason` makes the dialog collect one and pass it to `onDecide`. */
  confirm?: {
    title?: ReactNode;
    description?: ReactNode;
    confirmLabel?: string;
    requireText?: string;
    reason?: { label: ReactNode; required?: boolean; placeholder?: string };
    acknowledge?: ReactNode;
  };
}

export interface DecisionBarProps extends Omit<HTMLAttributes<HTMLDivElement>, "onChange"> {
  actions: DecisionAction[];
  /** Why no decision can be taken right now; disables every action and shows the reason. */
  blocked?: ReactNode;
  /** Fires with the action id and the reason the dialog collected (if any). */
  onDecide: (id: string, reason?: string) => void | Promise<void>;
  /** Right-align the buttons. Default true. */
  alignEnd?: boolean;
  /** Content before the buttons (expiry, a count). */
  children?: ReactNode;
}

export const DecisionBar = forwardRef<HTMLDivElement, DecisionBarProps>(function DecisionBar(
  { actions, blocked, onDecide, alignEnd = true, className, children, ...props },
  ref
) {
  const [pending, setPending] = useState<DecisionAction | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const decide = async (id: string, reason?: string) => {
    setBusy(id);
    try {
      await onDecide(id, reason);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-label="Decision"
      className={cx("vf-decision-bar", alignEnd && "vf-decision-bar--end", blocked && "vf-decision-bar--blocked", className)}
      data-blocked={blocked ? "true" : undefined}
      {...props}
    >
      {children && <div className="vf-decision-bar__lead">{children}</div>}
      {blocked && (
        <p className="vf-decision-bar__blocked" role="status">
          {blocked}
        </p>
      )}
      <div className="vf-decision-bar__actions">
        {actions.map((a) => (
          <Button
            key={a.id}
            variant={a.variant ?? (a.tone === "danger" ? "outline" : a.tone === "success" ? "solid" : "outline")}
            tone={a.tone}
            disabled={!!blocked || a.disabled || busy !== null}
            loading={busy === a.id}
            data-action={a.id}
            onClick={() => (a.confirm ? setPending(a) : void decide(a.id))}
          >
            {a.label}
          </Button>
        ))}
      </div>
      {pending && (
        <ConfirmDialogV2
          open
          title={pending.confirm?.title ?? pending.label}
          description={pending.confirm?.description}
          confirmLabel={pending.confirm?.confirmLabel ?? (typeof pending.label === "string" ? pending.label : "Confirm")}
          confirmTone={pending.tone === "danger" ? "danger" : pending.tone === "success" ? "success" : "neutral"}
          requireText={pending.confirm?.requireText}
          reason={pending.confirm?.reason}
          acknowledge={pending.confirm?.acknowledge}
          closeOnConfirm={false}
          onConfirm={async (reason) => {
            await decide(pending.id, reason);
            setPending(null);
          }}
          onOpenChange={(open) => {
            if (!open) setPending(null);
          }}
        />
      )}
    </div>
  );
});
DecisionBar.displayName = "DecisionBar";

export interface DecisionCardProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  title: ReactNode;
  /** Who asked, and when. */
  requester?: ReactNode;
  requestedAt?: ReactNode;
  /** When the request lapses; rendered as a `<time>` when a Date is given. */
  expiresAt?: Date | string;
  /** Badge-like status shown beside the title ("Pending", "Escalated"). */
  status?: ReactNode;
  /** The request's details: a diff, a description list, a table. */
  children?: ReactNode;
  /** Props for the embedded DecisionBar. Omit to render the card without actions. */
  decision?: Omit<DecisionBarProps, "children">;
}

export const DecisionCard = forwardRef<HTMLElement, DecisionCardProps>(function DecisionCard(
  { title, requester, requestedAt, expiresAt, status, children, decision, className, ...props },
  ref
) {
  const expiry =
    expiresAt instanceof Date ? (
      <time dateTime={expiresAt.toISOString()}>{expiresAt.toLocaleString()}</time>
    ) : (
      expiresAt
    );
  return (
    <article ref={ref} className={cx("vf-decision-card", className)} aria-label={typeof title === "string" ? title : undefined} {...props}>
      <header className="vf-decision-card__header">
        <h3 className="vf-decision-card__title">{title}</h3>
        {status && <div className="vf-decision-card__status">{status}</div>}
      </header>
      {(requester || requestedAt || expiresAt) && (
        <dl className="vf-decision-card__meta">
          {requester && (
            <div className="vf-decision-card__meta-item">
              <dt>Requested by</dt>
              <dd>{requester}</dd>
            </div>
          )}
          {requestedAt && (
            <div className="vf-decision-card__meta-item">
              <dt>Requested</dt>
              <dd>{requestedAt}</dd>
            </div>
          )}
          {expiresAt && (
            <div className="vf-decision-card__meta-item">
              <dt>Expires</dt>
              <dd>{expiry}</dd>
            </div>
          )}
        </dl>
      )}
      {children && <div className="vf-decision-card__details">{children}</div>}
      {decision && <DecisionBar {...decision} className={cx("vf-decision-card__bar", decision.className)} />}
    </article>
  );
});
DecisionCard.displayName = "DecisionCard";

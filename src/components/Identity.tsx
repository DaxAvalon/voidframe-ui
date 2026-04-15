// Phase 13 — Identity cards + Identicon + presence list

import {
  forwardRef,
  useMemo,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cx } from "../utils/cx";

// ── UserCard ────────────────────────────────────────────────

export interface UserCardUser {
  id?: string;
  name: ReactNode;
  email?: ReactNode;
  avatar?: ReactNode;
  role?: ReactNode;
  title?: ReactNode;
  team?: ReactNode;
  status?: "online" | "away" | "busy" | "offline";
}

export interface UserCardProps extends HTMLAttributes<HTMLElement> {
  user: UserCardUser;
  actions?: ReactNode;
  compact?: boolean;
  onSelect?: () => void;
}

export const UserCard = forwardRef<HTMLElement, UserCardProps>(function UserCard(
  { user, actions, compact, onSelect, className, ...props },
  ref
) {
  const body = (
    <>
      <div className="vf-user-card__avatar" aria-hidden="true">
        {user.avatar ?? initials(user.name)}
        {user.status && (
          <span
            className={cx(
              "vf-user-card__status-dot",
              `vf-user-card__status-dot--${user.status}`
            )}
            aria-label={user.status}
          />
        )}
      </div>
      <div className="vf-user-card__body">
        <div className="vf-user-card__name">{user.name}</div>
        {user.title && <div className="vf-user-card__title">{user.title}</div>}
        {user.role && <div className="vf-user-card__role">{user.role}</div>}
        {user.team && <div className="vf-user-card__team">{user.team}</div>}
        {user.email && <div className="vf-user-card__email">{user.email}</div>}
      </div>
      {actions && <div className="vf-user-card__actions">{actions}</div>}
    </>
  );
  if (onSelect) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cx(
          "vf-user-card",
          compact && "vf-user-card--compact",
          "vf-user-card--button",
          className
        )}
        onClick={onSelect}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        {body}
      </button>
    );
  }
  return (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className={cx(
        "vf-user-card",
        compact && "vf-user-card--compact",
        className
      )}
      {...props}
    >
      {body}
    </article>
  );
});
UserCard.displayName = "UserCard";

// ── TeamCard ────────────────────────────────────────────────

export interface TeamCardTeam {
  id?: string;
  name: ReactNode;
  description?: ReactNode;
  memberCount?: number;
  lead?: ReactNode;
  avatar?: ReactNode;
  members?: ReactNode;
}

export interface TeamCardProps extends HTMLAttributes<HTMLElement> {
  team: TeamCardTeam;
  actions?: ReactNode;
  onSelect?: () => void;
}

export const TeamCard = forwardRef<HTMLElement, TeamCardProps>(function TeamCard(
  { team, actions, onSelect, className, ...props },
  ref
) {
  const body = (
    <>
      <div className="vf-team-card__avatar" aria-hidden="true">
        {team.avatar ?? initials(team.name)}
      </div>
      <div className="vf-team-card__body">
        <div className="vf-team-card__name">{team.name}</div>
        {team.description && (
          <div className="vf-team-card__description">{team.description}</div>
        )}
        <div className="vf-team-card__meta">
          {team.memberCount !== undefined && (
            <span className="vf-team-card__count">
              {team.memberCount} members
            </span>
          )}
          {team.lead && (
            <span className="vf-team-card__lead">Lead: {team.lead}</span>
          )}
        </div>
        {team.members && (
          <div className="vf-team-card__members">{team.members}</div>
        )}
      </div>
      {actions && <div className="vf-team-card__actions">{actions}</div>}
    </>
  );
  if (onSelect) {
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type="button"
        className={cx("vf-team-card", "vf-team-card--button", className)}
        onClick={onSelect}
        {...(props as HTMLAttributes<HTMLButtonElement>)}
      >
        {body}
      </button>
    );
  }
  return (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className={cx("vf-team-card", className)}
      {...props}
    >
      {body}
    </article>
  );
});
TeamCard.displayName = "TeamCard";

// ── OrganizationCard ────────────────────────────────────────

export interface OrganizationCardOrg {
  id?: string;
  name: ReactNode;
  description?: ReactNode;
  website?: string;
  logo?: ReactNode;
  members?: number;
  plan?: ReactNode;
}

export interface OrganizationCardProps extends HTMLAttributes<HTMLElement> {
  organization: OrganizationCardOrg;
  actions?: ReactNode;
  onSelect?: () => void;
}

export const OrganizationCard = forwardRef<HTMLElement, OrganizationCardProps>(
  function OrganizationCard(
    { organization, actions, onSelect, className, ...props },
    ref
  ) {
    const body = (
      <>
        <div className="vf-org-card__logo" aria-hidden="true">
          {organization.logo ?? initials(organization.name)}
        </div>
        <div className="vf-org-card__body">
          <div className="vf-org-card__name">{organization.name}</div>
          {organization.description && (
            <div className="vf-org-card__description">
              {organization.description}
            </div>
          )}
          <div className="vf-org-card__meta">
            {organization.members !== undefined && (
              <span className="vf-org-card__count">
                {organization.members} members
              </span>
            )}
            {organization.plan && (
              <span className="vf-org-card__plan">{organization.plan}</span>
            )}
            {organization.website && (
              <a
                className="vf-org-card__website"
                href={organization.website}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
              >
                {organization.website.replace(/^https?:\/\//, "")}
              </a>
            )}
          </div>
        </div>
        {actions && <div className="vf-org-card__actions">{actions}</div>}
      </>
    );
    if (onSelect) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={cx("vf-org-card", "vf-org-card--button", className)}
          onClick={onSelect}
          {...(props as HTMLAttributes<HTMLButtonElement>)}
        >
          {body}
        </button>
      );
    }
    return (
      <article
        ref={ref as React.Ref<HTMLElement>}
        className={cx("vf-org-card", className)}
        {...props}
      >
        {body}
      </article>
    );
  }
);
OrganizationCard.displayName = "OrganizationCard";

// ── Identicon ───────────────────────────────────────────────
// Deterministic 5x5 mirrored pattern from a hash of `value`.

export interface IdenticonProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "color"> {
  value: string;
  size?: number;
  /** Background color; defaults to transparent-ish. */
  background?: string;
}

export const Identicon = forwardRef<HTMLDivElement, IdenticonProps>(
  function Identicon(
    { value, size = 40, background = "var(--vf-bg-1)", className, style, ...props },
    ref
  ) {
    const { pattern, color } = useMemo(() => buildIdenticon(value), [value]);
    const cell = Math.max(2, Math.floor(size / 5));
    return (
      <div
        ref={ref}
        role="img"
        aria-label={`Identicon for ${value}`}
        className={cx("vf-identicon", className)}
        style={{
          width: size,
          height: size,
          background,
          display: "inline-grid",
          gridTemplateColumns: `repeat(5, ${cell}px)`,
          gridTemplateRows: `repeat(5, ${cell}px)`,
          ...style,
        }}
        {...props}
      >
        {pattern.map((on, i) => (
          <span
            key={i}
            style={{
              background: on ? color : "transparent",
            }}
          />
        ))}
      </div>
    );
  }
);
Identicon.displayName = "Identicon";

function buildIdenticon(input: string): { pattern: boolean[]; color: string } {
  // djb2 hash
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  const rand = (i: number) => ((hash >>> i) & 0xff) / 255;
  const pattern: boolean[] = [];
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const mc = c > 2 ? 4 - c : c;
      const idx = r * 3 + mc;
      pattern.push(((hash >>> idx) & 1) === 1);
    }
  }
  const palette = [
    "#4ade80",
    "#60a5fa",
    "#f472b6",
    "#fbbf24",
    "#a78bfa",
    "#2dd4bf",
    "#fb7185",
  ];
  const color = palette[Math.floor(rand(0) * palette.length)] ?? palette[0]!;
  return { pattern, color };
}

// ── PresenceList ────────────────────────────────────────────

export type PresenceStatus = "online" | "away" | "busy" | "offline";

export interface PresenceUser {
  id: string;
  name: ReactNode;
  avatar?: ReactNode;
  status: PresenceStatus;
  statusMessage?: ReactNode;
}

export interface PresenceListProps extends HTMLAttributes<HTMLDivElement> {
  users: PresenceUser[];
  maxVisible?: number;
  onUserClick?: (id: string) => void;
  groupByStatus?: boolean;
}

const STATUS_ORDER: PresenceStatus[] = ["online", "busy", "away", "offline"];

export const PresenceList = forwardRef<HTMLDivElement, PresenceListProps>(
  function PresenceList(
    { users, maxVisible, onUserClick, groupByStatus = false, className, ...props },
    ref
  ) {
    const sorted = useMemo(() => {
      if (!groupByStatus) return users;
      return [...users].sort(
        (a, b) =>
          STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status)
      );
    }, [users, groupByStatus]);

    const visible = maxVisible ? sorted.slice(0, maxVisible) : sorted;
    const hidden = maxVisible ? Math.max(0, sorted.length - maxVisible) : 0;

    return (
      <div
        ref={ref}
        role="list"
        aria-label="Presence list"
        className={cx("vf-presence-list", className)}
        {...props}
      >
        {visible.map((u) => (
          <button
            key={u.id}
            type="button"
            role="listitem"
            className={cx(
              "vf-presence-list__item",
              `vf-presence-list__item--${u.status}`
            )}
            onClick={() => onUserClick?.(u.id)}
            disabled={!onUserClick}
          >
            <span
              className={cx(
                "vf-presence-list__dot",
                `vf-presence-list__dot--${u.status}`
              )}
              aria-label={u.status}
            />
            <span className="vf-presence-list__avatar" aria-hidden="true">
              {u.avatar ?? initials(u.name)}
            </span>
            <span className="vf-presence-list__body">
              <span className="vf-presence-list__name">{u.name}</span>
              {u.statusMessage && (
                <span className="vf-presence-list__message">
                  {u.statusMessage}
                </span>
              )}
            </span>
          </button>
        ))}
        {hidden > 0 && (
          <div className="vf-presence-list__more">+{hidden} more</div>
        )}
      </div>
    );
  }
);
PresenceList.displayName = "PresenceList";

function initials(name: ReactNode): string {
  if (typeof name !== "string") return "•";
  const words = name.trim().split(/\s+/).slice(0, 2);
  return words.map((w) => w[0]?.toUpperCase() ?? "").join("") || "•";
}

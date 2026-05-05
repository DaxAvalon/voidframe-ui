"use client";

import { forwardRef, memo, useState, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface CommentProps extends Omit<HTMLAttributes<HTMLElement>, "content"> {
  author: string;
  avatar?: string | ReactNode;
  content: ReactNode;
  datetime?: string;
  actions?: ReactNode;
  children?: ReactNode;
}

const CommentImpl = forwardRef<HTMLElement, CommentProps>(function Comment(
  { author, avatar, content, datetime, actions, children, className, style, ...props },
  ref
) {
  const avatarNode =
    avatar == null ? null : typeof avatar === "string" ? (
      <img
        className="vf-comment__avatar-img"
        src={avatar}
        alt={`${author}'s avatar`}
      />
    ) : (
      avatar
    );

  return (
    <article
      ref={ref}
      className={cx("vf-comment", className)}
      style={style}
      role="article"
      {...props}
    >
      {avatarNode && (
        <div className="vf-comment__avatar">{avatarNode}</div>
      )}
      <div className="vf-comment__body">
        <div className="vf-comment__header">
          <span className="vf-comment__author">{author}</span>
          {datetime && (
            <time className="vf-comment__datetime">{datetime}</time>
          )}
        </div>
        <div className="vf-comment__content">{content}</div>
        {actions && <div className="vf-comment__actions">{actions}</div>}
        {children && <div className="vf-comment__replies">{children}</div>}
      </div>
    </article>
  );
});
CommentImpl.displayName = "Comment";
/**
 * Single comment card: avatar, author, timestamp, body, and optional action
 * rail (reply / react / edit / delete).
 */
export const Comment = memo(CommentImpl);
(Comment as unknown as { displayName: string }).displayName = "Comment";

export interface CommentData {
  id: string;
  parentId?: string | null;
  [key: string]: unknown;
}

export interface CommentListProps extends HTMLAttributes<HTMLDivElement> {
  /** Flat array of comments with parentId references for threading. */
  comments?: CommentData[];
  /** Render function for each comment. Receives the comment data and its depth level. */
  renderComment?: (comment: CommentData, depth: number) => ReactNode;
  /** Maximum nesting depth. Default 5. */
  maxDepth?: number;
  /** Auto-collapse replies beyond this depth. Default Infinity (no auto-collapse). */
  defaultCollapsedDepth?: number;
  /** Called when user clicks "Load more". */
  onLoadMore?: () => void;
  /** Show load-more button. */
  hasMore?: boolean;
  /** Show loading spinner in load-more area. */
  loading?: boolean;
  /** @deprecated Pass Comment components as children for simple (non-threaded) lists. */
  children?: ReactNode;
}

function buildTree(comments: CommentData[]): Map<string | null, CommentData[]> {
  const map = new Map<string | null, CommentData[]>();
  for (const c of comments) {
    const parentKey = c.parentId ?? null;
    if (!map.has(parentKey)) map.set(parentKey, []);
    map.get(parentKey)!.push(c);
  }
  return map;
}

/** Collapsible wrapper for deeply-nested threads. */
function CollapsibleThread({
  id,
  defaultOpen,
  children,
}: {
  id: string;
  defaultOpen: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const regionId = `${id}-replies`;
  return (
    <>
      <button
        type="button"
        className={cx("vf-comment-list__toggle", open && "vf-comment-list__toggle--open")}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={regionId}
      >
        {open ? "Hide replies" : "Show replies"}
      </button>
      {open && (
        <div id={regionId} role="group">
          {children}
        </div>
      )}
    </>
  );
}

function ThreadRenderer({
  tree,
  parentId,
  depth,
  maxDepth,
  collapsedDepth,
  renderComment,
}: {
  tree: Map<string | null, CommentData[]>;
  parentId: string | null;
  depth: number;
  maxDepth: number;
  collapsedDepth: number;
  renderComment: (comment: CommentData, depth: number) => ReactNode;
}) {
  const children = tree.get(parentId) ?? [];
  if (children.length === 0 || depth > maxDepth) return null;
  return (
    <>
      {children.map((c) => {
        const nested = (
          <ThreadRenderer
            tree={tree}
            parentId={c.id}
            depth={depth + 1}
            maxDepth={maxDepth}
            collapsedDepth={collapsedDepth}
            renderComment={renderComment}
          />
        );
        const shouldCollapse = depth >= collapsedDepth;
        return (
          <div
            key={c.id}
            className="vf-comment-list__thread"
            style={{
              paddingInlineStart: depth > 0 ? "var(--vf-sp-5)" : undefined,
            }}
          >
            {renderComment(c, depth)}
            {shouldCollapse && nested ? (
              <CollapsibleThread id={c.id} defaultOpen={false}>
                {nested}
              </CollapsibleThread>
            ) : (
              nested
            )}
          </div>
        );
      })}
    </>
  );
}

const CommentListImpl = forwardRef<HTMLDivElement, CommentListProps>(
  function CommentList(
    {
      comments,
      renderComment,
      maxDepth = 5,
      defaultCollapsedDepth = Infinity,
      onLoadMore,
      hasMore,
      loading,
      children,
      className,
      style,
      ...props
    },
    ref
  ) {
    const useThreaded = comments != null && renderComment != null;
    const tree = useThreaded ? buildTree(comments) : null;

    return (
      <div
        ref={ref}
        className={cx("vf-comment-list", className)}
        style={style}
        {...props}
      >
        {useThreaded && tree ? (
          <ThreadRenderer
            tree={tree}
            parentId={null}
            depth={0}
            maxDepth={maxDepth}
            collapsedDepth={defaultCollapsedDepth}
            renderComment={renderComment}
          />
        ) : (
          children
        )}
        {hasMore && (
          <div className="vf-comment-list__load-more">
            {loading ? (
              <span className="vf-comment-list__spinner" aria-label="Loading more comments" />
            ) : (
              <button
                type="button"
                className="vf-comment-list__load-more-btn"
                onClick={onLoadMore}
              >
                Load more
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);
CommentListImpl.displayName = "CommentList";
/**
 * Threaded comment list with optional load-more affordance.
 *
 * **Threaded mode:** pass `comments` (flat array with `parentId` references)
 * and `renderComment` to build a nested tree automatically. Replies indent
 * up to `maxDepth` levels and auto-collapse beyond `defaultCollapsedDepth`.
 *
 * **Simple mode (deprecated):** pass `Comment` components as `children` for
 * a flat, non-threaded list. This form is backwards-compatible but will not
 * receive new threading features.
 */
export const CommentList = memo(CommentListImpl);
(CommentList as unknown as { displayName: string }).displayName =
  "CommentList";

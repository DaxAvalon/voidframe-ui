"use client";

import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";
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

export interface CommentListProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CommentListImpl = forwardRef<HTMLDivElement, CommentListProps>(
  function CommentList({ children, className, style, ...props }, ref) {
    return (
      <div
        ref={ref}
        className={cx("vf-comment-list", className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    );
  }
);
CommentListImpl.displayName = "CommentList";
/**
 * Vertical list of `Comment`s with threading and load-more affordances.
 */
export const CommentList = memo(CommentListImpl);
(CommentList as unknown as { displayName: string }).displayName =
  "CommentList";

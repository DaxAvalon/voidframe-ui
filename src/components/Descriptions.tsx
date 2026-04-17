"use client";

import { forwardRef, memo, type HTMLAttributes, type ReactNode } from "react";
import { cx } from "../utils/cx";

export interface DescriptionItem {
  key: string;
  label: string;
  value: ReactNode;
  span?: number;
}

export interface DescriptionsProps extends HTMLAttributes<HTMLDivElement> {
  title?: string;
  items: DescriptionItem[];
  columns?: number;
  layout?: "horizontal" | "vertical";
  bordered?: boolean;
  size?: "sm" | "md" | "lg";
  colon?: boolean;
}

const DescriptionsImpl = forwardRef<HTMLDivElement, DescriptionsProps>(
  function Descriptions(
    {
      title,
      items,
      columns = 3,
      layout = "horizontal",
      bordered = false,
      size = "md",
      colon = true,
      className,
      style,
      ...props
    },
    ref
  ) {
    return (
      <div
        ref={ref}
        className={cx(
          "vf-descriptions",
          `vf-descriptions--${size}`,
          `vf-descriptions--${layout}`,
          bordered && "vf-descriptions--bordered",
          className
        )}
        style={style}
        {...props}
      >
        {title && <div className="vf-descriptions__title">{title}</div>}
        <dl
          className="vf-descriptions__list"
          style={{
            gridTemplateColumns:
              layout === "horizontal"
                ? `repeat(${columns}, auto 1fr)`
                : `repeat(${columns}, 1fr)`,
          }}
        >
          {items.map((item) => {
            const spanStyle =
              item.span && item.span > 1
                ? layout === "horizontal"
                  ? { gridColumn: `span ${item.span * 2}` }
                  : { gridColumn: `span ${item.span}` }
                : undefined;

            if (layout === "vertical") {
              return (
                <div
                  key={item.key}
                  className="vf-descriptions__item"
                  style={spanStyle}
                >
                  <dt className="vf-descriptions__label">
                    {item.label}
                    {colon && ":"}
                  </dt>
                  <dd className="vf-descriptions__value">{item.value}</dd>
                </div>
              );
            }

            // Horizontal: dt and dd are siblings in the grid
            return (
              <div
                key={item.key}
                className="vf-descriptions__item"
                style={spanStyle}
              >
                <dt className="vf-descriptions__label">
                  {item.label}
                  {colon && ":"}
                </dt>
                <dd className="vf-descriptions__value">{item.value}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    );
  }
);
DescriptionsImpl.displayName = "Descriptions";
export const Descriptions = memo(DescriptionsImpl);
(Descriptions as unknown as { displayName: string }).displayName =
  "Descriptions";

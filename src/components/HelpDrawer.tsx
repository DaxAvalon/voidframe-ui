"use client";

// HelpDrawer — "what is this and where do I start": orientation text, a
// numbered workflow and the glossary, in a side drawer.

import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { DrawerV2, type DrawerSide } from "./DrawerCompound";
import { Stepper } from "./Navigation";
import { GlossaryList, type GlossaryListProps } from "./Glossary";
import { cx } from "../utils/cx";

export interface HelpWorkflowStep {
  label: ReactNode;
  description?: ReactNode;
}

export interface HelpDrawerProps extends Omit<HTMLAttributes<HTMLDivElement>, "title"> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Element that opens the drawer (rendered through `DrawerV2.Trigger`). */
  trigger?: ReactNode;
  title?: ReactNode;
  /** Opening paragraph(s): what this screen is for. */
  orientation?: ReactNode;
  orientationTitle?: ReactNode;
  /** Numbered steps: where to start and what comes next. */
  workflow?: HelpWorkflowStep[];
  workflowTitle?: ReactNode;
  /** Step the user is on (0-based), to highlight it in the workflow. Default none. */
  currentStep?: number;
  /** Render the glossary from the enclosing `GlossaryProvider`; pass props to configure it. */
  glossary?: boolean | GlossaryListProps;
  glossaryTitle?: ReactNode;
  side?: DrawerSide;
  size?: number | string;
  /** Extra content after the built-in sections. */
  children?: ReactNode;
}

/**
 * Side drawer that explains a screen: orientation, a `Stepper`-rendered
 * workflow and the `GlossaryList`. Built on `DrawerV2`; wrap the app in a
 * `GlossaryProvider` so the glossary and inline `Term`s agree.
 */
export const HelpDrawer = forwardRef<HTMLDivElement, HelpDrawerProps>(function HelpDrawer(
  {
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    title = "Help",
    orientation,
    orientationTitle = "What this is",
    workflow,
    workflowTitle = "Where to start",
    currentStep,
    glossary,
    glossaryTitle = "Glossary",
    side = "right",
    size = 400,
    className,
    children,
    ...rest
  },
  ref
) {
  const glossaryProps = typeof glossary === "object" ? glossary : undefined;
  return (
    <DrawerV2 open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} side={side}>
      {trigger ? <DrawerV2.Trigger>{trigger}</DrawerV2.Trigger> : null}
      <DrawerV2.Content size={size} className={cx("vf-help-drawer", className)}>
        <DrawerV2.Header className="vf-help-drawer__header">
          <DrawerV2.Title>{title}</DrawerV2.Title>
          <DrawerV2.Close aria-label="Close help">×</DrawerV2.Close>
        </DrawerV2.Header>
        <DrawerV2.Body>
          <div ref={ref} className="vf-help-drawer__sections" {...rest}>
            {orientation !== undefined && orientation !== null ? (
              <section className="vf-help-drawer__section" aria-label={typeof orientationTitle === "string" ? orientationTitle : undefined}>
                {orientationTitle ? <h3 className="vf-help-drawer__heading">{orientationTitle}</h3> : null}
                <div className="vf-help-drawer__orientation">{orientation}</div>
              </section>
            ) : null}
            {workflow && workflow.length > 0 ? (
              <section className="vf-help-drawer__section" aria-label={typeof workflowTitle === "string" ? workflowTitle : undefined}>
                {workflowTitle ? <h3 className="vf-help-drawer__heading">{workflowTitle}</h3> : null}
                <Stepper orientation="vertical" current={currentStep ?? -1} className="vf-help-drawer__workflow">
                  {workflow.map((step, i) => (
                    <Stepper.Step key={i} label={step.label} description={step.description} />
                  ))}
                </Stepper>
              </section>
            ) : null}
            {glossary ? (
              <section className="vf-help-drawer__section" aria-label={typeof glossaryTitle === "string" ? glossaryTitle : undefined}>
                {glossaryTitle ? <h3 className="vf-help-drawer__heading">{glossaryTitle}</h3> : null}
                <GlossaryList {...glossaryProps} />
              </section>
            ) : null}
            {children}
          </div>
        </DrawerV2.Body>
      </DrawerV2.Content>
    </DrawerV2>
  );
});
HelpDrawer.displayName = "HelpDrawer";

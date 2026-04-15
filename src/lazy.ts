"use client";

// Phase 20 — Lazy-loaded component wrappers
//
// React.lazy boundaries around the heaviest components in the library.
// Consumers wrap a rendered <Suspense> around these to defer the
// component's code-split chunk until the consumer actually opens /
// mounts it. Typical win is 15-40KB of gzipped JS per heavy component
// shaved off the initial bundle.

import { lazy, type ComponentType } from "react";

type L<P> = ComponentType<P>;

// Overlay-heavy
export const LazyModal: L<
  import("./components/Interactive").ModalProps
> = lazy(() =>
  import("./components/Interactive").then((m) => ({ default: m.Modal }))
);

export const LazyDialog = lazy(() =>
  import("./components/Dialog").then((m) => ({
    default: m.Dialog as unknown as ComponentType<unknown>,
  }))
);

export const LazyDrawer: L<
  import("./components/Overlay").DrawerProps
> = lazy(() =>
  import("./components/Overlay").then((m) => ({ default: m.Drawer }))
);

export const LazyLightbox: L<
  import("./components/Lightbox").LightboxProps
> = lazy(() =>
  import("./components/Lightbox").then((m) => ({ default: m.Lightbox }))
);

// Data-grid / tables
export const LazyDataGrid = lazy(() =>
  import("./components/DataGrid").then((m) => ({
    default: m.DataGrid as unknown as ComponentType<unknown>,
  }))
);

export const LazyTreeTable = lazy(() =>
  import("./components/TreeTable").then((m) => ({
    default: m.TreeTable as unknown as ComponentType<unknown>,
  }))
);

export const LazyGantt: L<
  import("./components/Gantt").GanttProps
> = lazy(() =>
  import("./components/Gantt").then((m) => ({ default: m.Gantt }))
);

export const LazyKanban: L<
  import("./components/Kanban").KanbanProps
> = lazy(() =>
  import("./components/Kanban").then((m) => ({ default: m.Kanban }))
);

// Rich editors
export const LazyCodeEditor: L<
  import("./components/CodeEditor").CodeEditorProps
> = lazy(() =>
  import("./components/CodeEditor").then((m) => ({ default: m.CodeEditor }))
);

export const LazyMarkdownEditor: L<
  import("./components/MarkdownEditor").MarkdownEditorProps
> = lazy(() =>
  import("./components/MarkdownEditor").then((m) => ({
    default: m.MarkdownEditor,
  }))
);

export const LazyRichTextEditor: L<
  import("./components/RichTextEditor").RichTextEditorProps
> = lazy(() =>
  import("./components/RichTextEditor").then((m) => ({
    default: m.RichTextEditor,
  }))
);

// Date / calendar
export const LazyDatePicker: L<
  import("./components/DatePicker").DatePickerProps
> = lazy(() =>
  import("./components/DatePicker").then((m) => ({ default: m.DatePicker }))
);

export const LazyDateRangePicker: L<
  import("./components/DatePicker").DateRangePickerProps
> = lazy(() =>
  import("./components/DatePicker").then((m) => ({
    default: m.DateRangePicker,
  }))
);

export const LazyCalendar: L<
  import("./components/Calendar").CalendarProps
> = lazy(() =>
  import("./components/Calendar").then((m) => ({ default: m.Calendar }))
);

// Charts / heavy visualizations
export const LazySparkline: L<
  import("./components/Charts").SparklineProps
> = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.Sparkline }))
);

export const LazyHeatmap: L<
  import("./components/Charts").HeatmapProps
> = lazy(() =>
  import("./components/Charts").then((m) => ({ default: m.Heatmap }))
);

// Capture / media-heavy
export const LazySignaturePad: L<
  import("./components/SignaturePad").SignaturePadProps
> = lazy(() =>
  import("./components/SignaturePad").then((m) => ({ default: m.SignaturePad }))
);

export const LazyImageCropper: L<
  import("./components/ImageCropper").ImageCropperProps
> = lazy(() =>
  import("./components/ImageCropper").then((m) => ({ default: m.ImageCropper }))
);

export const LazyVideoPlayer: L<
  import("./components/MediaPlayer").VideoPlayerProps
> = lazy(() =>
  import("./components/MediaPlayer").then((m) => ({ default: m.VideoPlayer }))
);

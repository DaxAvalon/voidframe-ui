import { lazy, type LazyExoticComponent, type ComponentType } from "react";

// Route manifest. Each entry maps a route name to a dynamic import of the
// corresponding fixture component. Playwright navigates to `#/<name>`.
export const routes: Record<string, LazyExoticComponent<ComponentType>> = {
  Dialog: lazy(() => import("./routes/Dialog")),
  DrawerV2: lazy(() => import("./routes/DrawerV2")),
  Sheet: lazy(() => import("./routes/Sheet")),
  Popover: lazy(() => import("./routes/Popover")),
  Tooltip: lazy(() => import("./routes/Tooltip")),
  HoverCard: lazy(() => import("./routes/HoverCard")),
  Menu: lazy(() => import("./routes/Menu")),
  MenuBar: lazy(() => import("./routes/MenuBar")),
  Popconfirm: lazy(() => import("./routes/Popconfirm")),
  Tabs: lazy(() => import("./routes/Tabs")),
  Accordion: lazy(() => import("./routes/Accordion")),
  Combobox: lazy(() => import("./routes/Combobox")),
  MultiSelect: lazy(() => import("./routes/MultiSelect")),
  Slider: lazy(() => import("./routes/Slider")),
  DatePicker: lazy(() => import("./routes/DatePicker")),
  DateRangePicker: lazy(() => import("./routes/DateRangePicker")),
  RadioGroup: lazy(() => import("./routes/RadioGroup")),
  DataGrid: lazy(() => import("./routes/DataGrid")),
  TreeView: lazy(() => import("./routes/TreeView")),
  Sortable: lazy(() => import("./routes/Sortable")),
  Pagination: lazy(() => import("./routes/Pagination")),
  CopyButton: lazy(() => import("./routes/CopyButton")),
  SignaturePad: lazy(() => import("./routes/SignaturePad")),
  ImageCropper: lazy(() => import("./routes/ImageCropper")),
  FileUpload: lazy(() => import("./routes/FileUpload")),
};

export const routeNames = Object.keys(routes);

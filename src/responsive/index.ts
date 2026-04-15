// Phase 16 — responsive system barrel

export {
  BREAKPOINTS,
  BREAKPOINT_ORDER,
  normalizeResponsive,
  pickResponsive,
  isResponsiveObject,
} from "./breakpoints";
export type { Breakpoint, Responsive } from "./breakpoints";

export {
  useBreakpoint,
  useResponsive,
  useDeviceType,
} from "./useBreakpoint";
export type { DeviceType } from "./useBreakpoint";

export { useContainerQuery } from "./useContainerQuery";
export type { ContainerQueryMap } from "./useContainerQuery";

export { Show, Hide } from "./Show";
export type { ShowProps, HideProps } from "./Show";

export { ResponsiveBox } from "./ResponsiveBox";
export type { ResponsiveBoxProps } from "./ResponsiveBox";

import { warnOnce } from "./warn";

/**
 * Warn (once) that a prop is deprecated and will be removed.
 *
 * @example
 * if (oldName !== undefined) deprecatedProp("Button", "old", "new", "v2.0");
 */
export function deprecatedProp(
  component: string,
  oldName: string,
  newName: string,
  version: string
): void {
  warnOnce(
    `deprecated:${component}:${oldName}`,
    `<${component}> prop "${oldName}" is deprecated and will be removed in ${version}. Use "${newName}" instead.`
  );
}

/**
 * Warn (once) that a component is deprecated.
 */
export function deprecatedComponent(
  component: string,
  replacement: string,
  version: string
): void {
  warnOnce(
    `deprecated-component:${component}`,
    `<${component}> is deprecated and will be removed in ${version}. Use <${replacement}> instead.`
  );
}

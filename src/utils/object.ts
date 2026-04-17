// ═══════════════════════════════════════════════════════════════
// object — pick, omit, splitProps
// Typed object partitioning utilities.
// ═══════════════════════════════════════════════════════════════

/**
 * Return a new object with only the specified keys.
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  for (const key of keys) {
    if (key in obj) {
      result[key] = obj[key];
    }
  }
  return result;
}

/**
 * Return a new object without the specified keys.
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> {
  const result = { ...obj };
  for (const key of keys) {
    delete result[key];
  }
  return result as Omit<T, K>;
}

/**
 * Split an object into two: [picked, rest].
 *
 * @example
 * const [styleProps, rest] = splitProps(props, ["color", "size"]);
 */
export function splitProps<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[],
): [Pick<T, K>, Omit<T, K>] {
  return [pick(obj, keys), omit(obj, keys)];
}

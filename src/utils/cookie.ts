// ═══════════════════════════════════════════════════════════════
// cookie — read / write / delete browser cookies
// URL-encodes names and values. Works with document.cookie.
// ═══════════════════════════════════════════════════════════════

export interface CookieOptions {
  path?: string;
  domain?: string;
  maxAge?: number;
  expires?: Date;
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
}

/**
 * Get a single cookie value by name, or null if not found.
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = parseCookies();
  return cookies[name] ?? null;
}

/**
 * Set a cookie with optional configuration.
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {},
): void {
  if (typeof document === "undefined") return;

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

  if (options.path) cookie += `; path=${options.path}`;
  if (options.domain) cookie += `; domain=${options.domain}`;
  if (options.maxAge !== undefined) cookie += `; max-age=${options.maxAge}`;
  if (options.expires) cookie += `; expires=${options.expires.toUTCString()}`;
  if (options.secure) cookie += "; secure";
  if (options.sameSite) cookie += `; samesite=${options.sameSite}`;

  document.cookie = cookie;
}

/**
 * Delete a cookie by setting its expiry to the past.
 */
export function deleteCookie(
  name: string,
  options: Pick<CookieOptions, "path" | "domain"> = {},
): void {
  setCookie(name, "", {
    ...options,
    expires: new Date(0),
  });
}

/**
 * Return all cookies as a plain object.
 */
export function getAllCookies(): Record<string, string> {
  if (typeof document === "undefined") return {};
  return parseCookies();
}

/**
 * Check whether a cookie exists.
 */
export function hasCookie(name: string): boolean {
  return getCookie(name) !== null;
}

// ── helpers ──────────────────────────────────────────────────

function parseCookies(): Record<string, string> {
  const result: Record<string, string> = {};
  const raw = document.cookie;
  if (!raw) return result;

  for (const pair of raw.split(";")) {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) continue;
    const key = decodeURIComponent(pair.slice(0, eqIndex).trim());
    const val = decodeURIComponent(pair.slice(eqIndex + 1).trim());
    result[key] = val;
  }
  return result;
}

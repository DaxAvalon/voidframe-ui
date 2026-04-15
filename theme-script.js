// Voidframe — pre-hydration theme script
//
// Drop into <head> (inline or as a separate <script>) so the chosen
// theme is applied before React hydrates — no flash.
//
//   <script src="/node_modules/voidframe/theme-script.js"></script>
//
// or inline via Next.js / Remix patterns — see README.
//
// Reads `voidframe-theme` from localStorage and mirrors it as
// `data-vf-theme` on <html>. Keep the key in sync with the one you
// pass to `useThemePersistence({ key: "..." })`.

(function voidframeThemeScript() {
  try {
    var key = "voidframe-theme";
    var t = localStorage.getItem(key);
    if (!t) {
      // Honor OS preference as a fallback so SSR pages match at first paint.
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    } else if (t === "system") {
      t = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark";
    }
    document.documentElement.setAttribute("data-vf-theme", t);
  } catch (e) {
    /* localStorage blocked; fall through */
  }
})();

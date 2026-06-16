import type { ReactNode } from "react";
import type { Metadata } from "next";
import { VoidframeProvider } from "voidframe-ui";
import "voidframe-ui/styles.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Voidframe App",
  description: "A Next.js app pre-wired with voidframe-ui.",
};

// Pre-hydration theme script. Mirrors the `voidframe-theme` localStorage value
// (or the OS preference) onto <html data-vf-theme> before first paint so
// server-rendered pages don't flash the wrong theme. Keep the key in sync with
// useThemePersistence({ key: "voidframe-theme" }). This is the App Router
// placement of the shipped voidframe-ui/theme-script.js.
const themeScript = `(function(){try{var k="voidframe-theme",t=localStorage.getItem(k);if(!t||t==="system"){t=window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches?"light":"dark";}document.documentElement.setAttribute("data-vf-theme",t);}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <VoidframeProvider>{children}</VoidframeProvider>
      </body>
    </html>
  );
}

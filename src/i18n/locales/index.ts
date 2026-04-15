// Phase 17 — locale pack barrel
//
// Each locale is ~2-4KB. Consumers should import only what they need:
//
//   import { ja } from "voidframe/locales";
//   <VoidframeProvider locale={ja} />

export type { LocalePack } from "./types";
export { en } from "./en";
export { es } from "./es";
export { fr } from "./fr";
export { de } from "./de";
export { ja } from "./ja";
export { zhCN } from "./zh-CN";
export { ar } from "./ar";
export { he } from "./he";
export { enXA } from "./en-XA";

// Convenience: a registry for demo / dev UX.
import { en } from "./en";
import { es } from "./es";
import { fr } from "./fr";
import { de } from "./de";
import { ja } from "./ja";
import { zhCN } from "./zh-CN";
import { ar } from "./ar";
import { he } from "./he";
import { enXA } from "./en-XA";
import type { LocalePack } from "./types";

export const LOCALE_PACKS: Record<string, LocalePack> = {
  en,
  es,
  fr,
  de,
  ja,
  "zh-CN": zhCN,
  ar,
  he,
  "en-XA": enXA,
};

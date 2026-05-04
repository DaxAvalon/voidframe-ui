import { describe, expect, it } from "vitest";
import { enMessages } from "../messages";
import { de } from "../locales/de";
import { fr } from "../locales/fr";
import { zhCN } from "../locales/zh-CN";
import { es } from "../locales/es";
import { ja } from "../locales/ja";
import { ar } from "../locales/ar";
import { he } from "../locales/he";

const LOCALE_PACKS = { de, fr, zhCN, es, ja, ar, he };

describe("i18n locale packs", () => {
  for (const [name, pack] of Object.entries(LOCALE_PACKS)) {
    describe(name, () => {
      it("has messages object", () => {
        expect(pack.messages).toBeDefined();
        expect(typeof pack.messages).toBe("object");
      });

      it("pluralize returns a string for any count", () => {
        if (pack.pluralize) {
          expect(typeof pack.pluralize(0, { zero: "z", one: "o", other: "m" })).toBe("string");
          expect(typeof pack.pluralize(1, { one: "o", other: "m" })).toBe("string");
          expect(typeof pack.pluralize(5, { one: "o", other: "m" })).toBe("string");
        }
      });

      it("formatRelativeTime returns a string", () => {
        if (pack.formatRelativeTime) {
          const result = pack.formatRelativeTime(
            new Date(Date.now() - 60_000)
          );
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        }
      });

      it("message template functions execute without error", () => {
        const msg = pack.messages as Record<string, Record<string, unknown>>;
        for (const group of Object.values(msg)) {
          if (typeof group !== "object" || !group) continue;
          for (const val of Object.values(group)) {
            if (typeof val === "function") {
              const result = (val as (a: Record<string, unknown>) => string)({
                n: 3,
                current: 1,
                total: 10,
                count: 5,
                label: "x",
                name: "y",
                value: "z",
                max: 10,
                maxBytes: 10485760,
              });
              expect(typeof result).toBe("string");
            }
          }
        }
      });

      it("covers every key in the English defaults", () => {
        const en = enMessages as Record<string, Record<string, unknown>>;
        const locale = pack.messages as Record<string, Record<string, unknown>>;
        const missing: string[] = [];
        for (const [group, keys] of Object.entries(en)) {
          if (typeof keys !== "object" || !keys) continue;
          // Skip array-valued groups (months, days) — checked by length
          if (Array.isArray(keys)) continue;
          for (const key of Object.keys(keys)) {
            if (!locale[group] || !(key in locale[group])) {
              missing.push(`${group}.${key}`);
            }
          }
        }
        if (missing.length > 0) {
          throw new Error(
            `Locale "${name}" is missing ${missing.length} message keys:\n` +
              missing.map((k) => `  ${k}`).join("\n")
          );
        }
      });
    });
  }
});

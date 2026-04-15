import type { PartialMessages } from "../messages";

export interface LocalePack {
  /** BCP-47 locale tag (e.g. "es-ES", "zh-CN"). */
  locale: string;
  /** Writing direction. */
  direction: "ltr" | "rtl";
  /** 0 = Sunday … 1 = Monday … 6 = Saturday. */
  firstDayOfWeek: number;
  /** Partial message overrides. */
  messages: PartialMessages;
}

// Pseudolocale for text-expansion / diacritic stress-testing.

import { enMessages } from "../messages";
import { pseudolocalize } from "../pseudo";
import type { LocalePack } from "./types";

export const enXA: LocalePack = {
  locale: "en-XA",
  direction: "ltr",
  firstDayOfWeek: 0,
  messages: pseudolocalize(enMessages),
};

# Copy tone and glyph vocabulary

Voidframe's built-in text is short, plain and literal. These are the rules the
components follow, so an app that writes its own copy next to them reads as one
voice.

## Words

- **Say what it is, not how to feel about it.** "3 of 5 passed", not "Great, almost there!".
  No streaks, confetti or praise; a count, a verdict word and a sentence the reader can act on.
- **Lower-case status words, sentence-case labels.** Tone words read as "ok", "warning",
  "alert", "info" (`StatusStrip`); verdicts render as the badge word in the theme's label case.
- **One sentence of explanation**, in the active voice, naming the fix: "Allow the microphone in
  the address bar." Not "Permission error".
- **Numbers with units, units with a space:** `−6.0 dBFS`, `48 kHz`, `6 ms`, `0 dropouts`.
  Ranges with an arrow: `00:01.000 → 00:04.000`.
- **Every user-visible string in a component comes from the message catalogue** (`useMessages`,
  `messages.ts`), with English as the default. Apps override by passing a `locale` pack or
  `messages` to `VoidframeProvider`. A test (`src/__tests__/noHardcodedCopy.test.ts`) keeps the
  listed components honest.

## Glyphs

Since 1.4.0 the library uses monochrome text-presentation glyphs only: no emoji, no colour
glyphs, nothing that depends on the platform's emoji font.

| Meaning | Glyph | Where |
|---|---|---|
| pass / done | `✓` | Verdict, CheckList, Combobox check |
| fail / remove | `✕` | Verdict, close buttons |
| warn | `!` | Verdict |
| flagged / reviewer mark | `⚑` | Verdict, Transcript |
| skipped / none | `–` (en dash) | Verdict |
| pending / running | `…` | Verdict |
| request / response | `→` `←` | EventTimeline |
| separator | `·` (middle dot) | StatusStrip, summaries |
| minus | `−` (U+2212) | every negative number in meters and clocks |
| infinity | `∞` | meters at silence |
| drag handle | `⠿` | WidgetShell |

`MINUS`, `INFINITY`, `MIDDLE_DOT` and `withMinus()` are exported from the root for app code that
formats its own numbers. `formatDb` and `formatClock(seconds, { signed: true })` already use the
true minus sign.

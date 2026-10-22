import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Guard: user-visible words in these components come from the message
// catalogue (`useMessages`), not from literals in the component source.
// Each entry names a file and the English literals that must not reappear
// as JSX text or string values.
const FORBIDDEN: Array<[file: string, patterns: RegExp[]]> = [
  ["src/components/Wizard.tsx", [/["'`>]Back["'`<]/, /["'`>]Next["'`<]/, /["'`>]Finish["'`<]/, /["'`>]Skip["'`<]/, /Step \$\{/]],
  ["src/components/FormExtended.tsx", [/DROP FILES HERE/, /\?\? "Drop files here/]],
  ["src/components/DevTools.tsx", [/Press a key combination/, /["'>]unassigned["'<]/, /["'>]Already assigned["'<]/]],
  ["src/components/StatusStrip.tsx", [/return "ok";/, /return "alert";/]],
  ["src/components/WaveformStrip.tsx", [/"Pickup flag"/, /take\$\{/, /marker\$\{/]],
  ["src/components/TransportStrip.tsx", [/>elapsed </, />remaining </]],
  ["src/components/CountdownDial.tsx", [/\} seconds`/]],
  ["src/components/Verdict.tsx", [/>measured </, />required </]],
  ["src/components/AudioLevelMeter.tsx", [/`Peak hold /]],
  ["src/charts/CalendarHeatmap.tsx", [/\["Mon", "Wed", "Fri"\]/, /"Jan", "Feb"/]],
];

describe("component copy comes from the message catalogue", () => {
  for (const [file, patterns] of FORBIDDEN) {
    it(file, () => {
      const src = readFileSync(resolve(process.cwd(), file), "utf8");
      for (const re of patterns) expect(src, `${file} contains ${re}`).not.toMatch(re);
      expect(src, `${file} should use useMessages`).toMatch(/useMessages/);
    });
  }

  it("numeric formatters use a true minus sign", () => {
    const meter = readFileSync(resolve(process.cwd(), "src/components/AudioLevelMeter.tsx"), "utf8");
    expect(meter).toMatch(/\\u2212|MINUS/);
    const clock = readFileSync(resolve(process.cwd(), "src/components/TransportStrip.tsx"), "utf8");
    expect(clock).toMatch(/MINUS/);
  });
});

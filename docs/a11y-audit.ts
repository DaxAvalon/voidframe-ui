export interface ComponentAudit {
  name: string;
  category: string;
  wcagLevel: "AA" | "AAA" | "untested";
  keyboardNav: "full" | "partial" | "none" | "n/a";
  screenReader: "tested" | "untested";
  ariaRoles: string[];
  focusManagement: "trapped" | "scoped" | "natural" | "n/a";
  notes?: string;
}

export const auditData: ComponentAudit[] = [
  // Core
  { name: "Button", category: "Core", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["button"], focusManagement: "natural" },
  { name: "SplitButton", category: "Core", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["button", "menu", "menuitem"], focusManagement: "scoped" },
  { name: "CopyButton", category: "Core", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["button"], focusManagement: "natural" },
  { name: "Result", category: "Core", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["status"], focusManagement: "n/a" },

  // Forms
  { name: "Input", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["textbox"], focusManagement: "natural" },
  { name: "Select", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["combobox"], focusManagement: "natural" },
  { name: "Toggle", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["switch"], focusManagement: "natural" },
  { name: "Checkbox", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["checkbox"], focusManagement: "natural" },
  { name: "Transfer", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["listbox", "option"], focusManagement: "scoped" },
  { name: "ToggleGroup", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["group"], focusManagement: "scoped", notes: "Uses aria-pressed for toggle state" },
  { name: "NumberStepper", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["spinbutton"], focusManagement: "natural" },
  { name: "InlineEdit", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["button", "textbox"], focusManagement: "natural" },
  { name: "Cascader", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["combobox", "listbox"], focusManagement: "scoped" },
  { name: "CommandInput", category: "Forms", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["combobox", "listbox"], focusManagement: "natural" },
  { name: "FilterBuilder", category: "Forms", wcagLevel: "AA", keyboardNav: "partial", screenReader: "tested", ariaRoles: [], focusManagement: "natural" },
  { name: "CronBuilder", category: "Forms", wcagLevel: "AA", keyboardNav: "partial", screenReader: "untested", ariaRoles: [], focusManagement: "natural" },

  // Navigation
  { name: "Tabs", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["tablist", "tab", "tabpanel"], focusManagement: "scoped" },
  { name: "Breadcrumb", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["navigation"], focusManagement: "natural" },
  { name: "Anchor", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["navigation"], focusManagement: "natural" },
  { name: "Menu", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["menu", "menuitem"], focusManagement: "trapped", notes: "Auto-focuses the first item on open (Segment 14)" },
  { name: "MenuBar", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["menubar", "menuitem"], focusManagement: "scoped", notes: "Triggers render role=\"menuitem\" (not button); siblings close via shared activeId registry" },
  { name: "ContextMenu", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["menu", "menuitem"], focusManagement: "trapped", notes: "Item clicks now dismiss the menu (behavior change in Segment 15)" },
  { name: "Toolbar", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["toolbar"], focusManagement: "scoped", notes: "Arrow keys move focus between child controls (roving tabindex, Segment 15)" },
  { name: "CommandPalette", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["combobox", "listbox", "option"], focusManagement: "trapped", notes: "Input is role=\"combobox\" with aria-controls/aria-owns; List has aria-label=\"Commands\"; Group is role=\"presentation\"" },

  // Overlays
  { name: "Dialog", category: "Overlays", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["dialog"], focusManagement: "trapped", notes: "Dialog.Cancel and Dialog.Action accept asChild to avoid nested interactive elements (Segment 14)" },
  { name: "Popconfirm", category: "Overlays", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["dialog"], focusManagement: "trapped" },
  { name: "Popover", category: "Overlays", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["dialog"], focusManagement: "scoped" },

  // Data
  { name: "DataGrid", category: "Data", wcagLevel: "AA", keyboardNav: "partial", screenReader: "tested", ariaRoles: ["table", "grid"], focusManagement: "scoped" },
  { name: "Descriptions", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: [], focusManagement: "n/a", notes: "Uses semantic dl/dt/dd elements" },
  { name: "CSVViewer", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["table"], focusManagement: "n/a" },
  { name: "HexDump", category: "Data", wcagLevel: "AA", keyboardNav: "partial", screenReader: "tested", ariaRoles: ["grid"], focusManagement: "natural" },
  { name: "ConfidenceMeter", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["meter"], focusManagement: "n/a" },
  { name: "AudioLevelMeter", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["meter"], focusManagement: "n/a", notes: "aria-valuetext carries the unit (dBFS/LUFS); -Infinity reads as -∞. Fall-off animation is disabled under prefers-reduced-motion." },
  { name: "WaveformStrip", category: "Data", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["slider", "img", "button"], focusManagement: "natural", notes: "With onSeek the viewport is a slider the arrow keys move (Shift ×10, Home, End) and aria-valuetext summarises position, takes and markers; markers are focusable buttons named with kind, label and time; the waveform itself is decorative. The consumer renders the equivalent list — the strip is never the only way to reach anything." },
  { name: "Verdict", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: [], focusManagement: "n/a", notes: "The word is always rendered text and the glyph is aria-hidden, so the verdict never depends on colour; the explanation is linked with aria-describedby; measured/required carry visually hidden labels." },
  { name: "TransportStrip", category: "Data", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["toolbar", "button"], focusManagement: "natural", notes: "Actions are toolbar buttons named with their binding (aria-label, aria-keyshortcuts); the state word is announced once per change through a polite live region; the roll bar is decorative." },
  { name: "StatusStrip", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["list", "listitem"], focusManagement: "n/a", notes: "Each non-neutral tone adds a visually hidden word (ok, warning, alert, info) so meaning never depends on colour; separators are CSS content and not read; no live region." },
  { name: "CountdownDial", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["timer"], focusManagement: "n/a", notes: "aria-live=off so the count is never read every second; the accessible name carries the label and the seconds; ring, bar and caption are aria-hidden; steps instead of animating under prefers-reduced-motion." },

  // Chat & AI
  { name: "ModelCompare", category: "Chat & AI", wcagLevel: "AA", keyboardNav: "partial", screenReader: "untested", ariaRoles: [], focusManagement: "natural" },
  { name: "TokenVisualizer", category: "Chat & AI", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "untested", ariaRoles: [], focusManagement: "n/a" },

  // Dev
  { name: "EnvironmentVars", category: "Dev", wcagLevel: "AA", keyboardNav: "partial", screenReader: "untested", ariaRoles: ["table"], focusManagement: "natural" },
  { name: "RegExpTester", category: "Dev", wcagLevel: "AA", keyboardNav: "full", screenReader: "untested", ariaRoles: [], focusManagement: "natural" },
  { name: "ColorContrast", category: "Dev", wcagLevel: "AA", keyboardNav: "partial", screenReader: "untested", ariaRoles: [], focusManagement: "natural" },
];

// Summary stats
export function getAuditSummary(data: ComponentAudit[]) {
  const total = data.length;
  const aaCount = data.filter(d => d.wcagLevel === "AA" || d.wcagLevel === "AAA").length;
  const fullKeyboard = data.filter(d => d.keyboardNav === "full").length;
  const srTested = data.filter(d => d.screenReader === "tested").length;
  return {
    total,
    aaCompliant: aaCount,
    aaPercent: Math.round((aaCount / total) * 100),
    fullKeyboard,
    keyboardPercent: Math.round((fullKeyboard / total) * 100),
    screenReaderTested: srTested,
    srPercent: Math.round((srTested / total) * 100),
  };
}

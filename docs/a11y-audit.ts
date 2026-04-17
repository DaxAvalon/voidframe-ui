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
  { name: "Menu", category: "Navigation", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["menu", "menuitem"], focusManagement: "trapped" },

  // Overlays
  { name: "Dialog", category: "Overlays", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["dialog"], focusManagement: "trapped" },
  { name: "Popconfirm", category: "Overlays", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["dialog"], focusManagement: "trapped" },
  { name: "Popover", category: "Overlays", wcagLevel: "AA", keyboardNav: "full", screenReader: "tested", ariaRoles: ["dialog"], focusManagement: "scoped" },

  // Data
  { name: "DataGrid", category: "Data", wcagLevel: "AA", keyboardNav: "partial", screenReader: "tested", ariaRoles: ["table", "grid"], focusManagement: "scoped" },
  { name: "Descriptions", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: [], focusManagement: "n/a", notes: "Uses semantic dl/dt/dd elements" },
  { name: "CSVViewer", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["table"], focusManagement: "n/a" },
  { name: "HexDump", category: "Data", wcagLevel: "AA", keyboardNav: "partial", screenReader: "tested", ariaRoles: ["grid"], focusManagement: "natural" },
  { name: "ConfidenceMeter", category: "Data", wcagLevel: "AA", keyboardNav: "n/a", screenReader: "tested", ariaRoles: ["meter"], focusManagement: "n/a" },

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

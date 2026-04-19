import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL(".", import.meta.url).pathname, "../..");
const inv = JSON.parse(fs.readFileSync(path.join(root, "docs/data/props.json"), "utf8"));
if (!Array.isArray(inv)) {
  console.error("SHAPE DRIFT: props.json is no longer an array — update this script.");
  process.exit(1);
}

function bucketFor(comp) {
  const file = comp.file || "";
  const name = comp.name;
  // Path wins over name regex
  if (file.includes("/charts/")) return "charts";
  if (file.includes("/primitives/")) return "primitives";
  if (file.includes("/dev/")) return "dev";
  if (file.includes("/Chat/")) return "chat";
  if (file.includes("/Viewers/")) return "viewers";
  if (file.includes("/icons/")) return "icons";
  if (/Icon$/.test(name) && name !== "Icon") return "icons";
  // Name-based
  if (/^(Form|Input|Checkbox|Radio|Switch|Select|Combobox|Date|Time|Color|File|Signature|Rating|Mask|Search|Password|Currency|Phone|Mention|Textarea|Label|Field|MultiSelect|Cascader|TreeSelect|NumberStepper|SlashCommandInput|CommandInput|CronBuilder|FilterBuilder)/.test(name)) return "forms";
  if (/^(Table|DataGrid|Tree|Virtual|List|Kanban|Masonry|Descriptions|CSV)/.test(name)) return "data";
  if (/^(Dialog|Drawer|Popover|Modal|Sheet|Toast|Tooltip|Menu|Command|Spotlight|Overlay|Popconfirm|ConfirmDialog|HelpChangelog|ShortcutGuide)/.test(name)) return "overlays";
  if (/^(Nav|Breadcrumb|Tabs|Tab$|Link|Anchor|Step|Wizard|AppShell|SkipToContent)/.test(name)) return "navigation";
  if (/^(Chat|Message|Reaction|Composer|SessionList|ModelPicker)/.test(name)) return "chat";
  if (/(Chart|Graph|Plot|Map|Heatmap|Sparkline)/.test(name)) return "domain-charts";
  if (/^(Timeline|Calendar|Gantt|Activity|OrgChart|HorizontalTimeline|Comment|TimeDisplays|TimeSince|Capture|DragDrop|Gestures|Notification)/.test(name)) return "domain-data";
  if (/^(Image|Video|Audio|Media|Carousel|Lightbox|Gallery|SignaturePad|ImageCropper|RichEmbed|MarkdownEditor|RichTextEditor|CodeEditor|Encoding|HexDump|Print)/.test(name)) return "media";
  if (/^(Button|Badge|Card|Text|Heading|Typography|Divider|Separator|Stack|Container|Box|Avatar|Alert|Result|Accordion|Toggle|Pagination|CopyButton|FloatingActionButton|SplitButton|InlineEdit|Spinner|Skeleton|Shimmer|Progress|LoadingDots|Kbd|Mark|Code|AsyncData|Animations|Transition)/.test(name)) return "core";
  if (/^(Layout|Grid|Flex|Dashboard|Responsive|Splitter|Resizable|ScrollArea|Affix|BackgroundPattern|Widget|VoidframeProvider|ThemeScope)/.test(name)) return "layout";
  if (/^(Help|About|Theme|Environment|DevTool|RegExpTester|ColorContrast|ColorTools|ModelCompare|TokenVisualizer|ConfidenceMeter|LiveIndicator|Metrics|Numeric|Countdown|Duration|RelativeTime)/.test(name)) return "utility";
  return "misc";
}

const buckets = {};
for (const comp of inv) {
  const b = bucketFor(comp);
  (buckets[b] ||= []).push({ name: comp.name, file: comp.file || "", propCount: (comp.props || []).length });
}
for (const k of Object.keys(buckets)) buckets[k].sort((a, b) => b.propCount - a.propCount);

fs.writeFileSync(path.join(root, "plans/audits/31-component-index.json"), JSON.stringify(buckets, null, 2));
console.log("total:", inv.length);
for (const [b, xs] of Object.entries(buckets).sort((a, b) => b[1].length - a[1].length)) console.log(b.padEnd(14), xs.length);

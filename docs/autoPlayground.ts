import type { ComponentDoc, PropDoc } from "../src/dev";

/**
 * Generate a default playground code snippet for a component
 * based on its extracted prop documentation.
 */
export function generatePlaygroundCode(doc: ComponentDoc): string | null {
  if (!doc.props || doc.props.length === 0) return null;

  const name = doc.name;
  const requiredProps = doc.props.filter((p) => p.required);
  const optionalHighlights = doc.props.filter(
    (p) =>
      !p.required &&
      ["variant", "size", "tone", "status", "mode", "orientation", "label"].includes(p.name),
  );

  // Build props string
  const propsEntries: string[] = [];

  for (const prop of requiredProps) {
    const val = getDefaultValueForProp(prop);
    if (val) propsEntries.push(`${prop.name}=${val}`);
  }

  // Add a few interesting optional props with example values
  for (const prop of optionalHighlights.slice(0, 3)) {
    const val = getExampleValueForProp(prop);
    if (val) propsEntries.push(`${prop.name}=${val}`);
  }

  const propsStr = propsEntries.length > 0 ? " " + propsEntries.join(" ") : "";

  // Determine if component needs children
  const hasChildren = doc.props.some((p) => p.name === "children");

  if (hasChildren) {
    return `<${name}${propsStr}>\n  Sample content\n</${name}>`;
  }
  return `<${name}${propsStr} />`;
}

/**
 * Return a JSX attribute value string including the { } wrapper.
 * e.g. '{"hello"}' or '{42}' or '{[...]}' or '{() => {}}'
 */
function getDefaultValueForProp(prop: PropDoc): string | null {
  const t = prop.type?.toLowerCase() ?? "";

  // Arrays / objects
  if (prop.name === "items" && t.includes("array"))
    return '{[{ key: "a", label: "Alpha" }, { key: "b", label: "Beta" }, { key: "c", label: "Charlie" }]}';
  if (prop.name === "options" && t.includes("array"))
    return '{[{ value: "a", label: "Alpha" }, { value: "b", label: "Beta" }]}';
  if (prop.name === "data" && t.includes("string[][]"))
    return '{[["Name", "Age"], ["Alice", "30"], ["Bob", "25"]]}';
  if (prop.name === "data" && t.includes("uint8array"))
    return "{new Uint8Array([72, 101, 108, 108, 111, 32, 87, 111, 114, 108, 100])}";
  if (prop.name === "tokens" && t.includes("array"))
    return '{["Hello", " ", "world", "!", " ", "This", " ", "is", " ", "a", " ", "test"]}';
  if (prop.name === "models")
    return '{[{ id: "a", name: "Model A" }, { id: "b", name: "Model B" }]}';
  if (prop.name === "fields" && t.includes("array"))
    return '{[{ key: "name", label: "Name", type: "string" }, { key: "age", label: "Age", type: "number" }]}';
  if (prop.name === "events" && t.includes("array"))
    return '{[{ key: "1", label: "Start", status: "completed" }, { key: "2", label: "Middle", status: "active" }, { key: "3", label: "End", status: "pending" }]}';
  if (prop.name === "variables" && t.includes("array"))
    return '{[{ key: "API_KEY", value: "sk-1234", secret: true }, { key: "PORT", value: "3000" }]}';

  // Callbacks
  if (prop.name === "onSubmit" || prop.name === "onConfirm" || prop.name === "onClick")
    return '{() => alert("Clicked!")}';
  if (prop.name === "onSave") return '{(v) => alert("Saved: " + v)}';
  if (prop.name === "onAction") return '{(key) => alert("Action: " + key)}';
  if (prop.name.startsWith("on") && (t.includes("=>") || t.includes("function"))) return "{() => {}}";

  // Strings — use JSX string syntax (quotes, no braces)
  if (prop.name === "value" && t.includes("string")) return '"Hello world"';
  if (prop.name === "text") return '"Copy this text"';
  if (prop.name === "title") return '"Title"';
  if (prop.name === "label") return '"Label"';
  if (prop.name === "author") return '"Alice"';
  if (prop.name === "content" && t.includes("string")) return '"This is the content"';
  if (prop.name === "status") return '"success"';
  if (prop.name === "foreground") return '"#000000"';
  if (prop.name === "background") return '"#ffffff"';
  if (prop.name === "before") return '"https://via.placeholder.com/300x200/111/333?text=Before"';
  if (prop.name === "after") return '"https://via.placeholder.com/300x200/111/666?text=After"';
  if (prop.name === "pattern") return '"\\d+"';
  if (prop.name === "testString") return '"The answer is 42 and also 100"';
  if (prop.name === "expression") return '"0 * * * *"';
  if (prop.name === "src" && t === "string") return '"https://via.placeholder.com/200"';
  if (prop.name === "href" && t === "string") return '"#"';
  if (prop.name === "name" && t === "string") return '"Example"';
  if (prop.name === "description" && t === "string") return '"A description"';
  if (prop.name === "placeholder" && t === "string") return '"Type here..."';

  // Numbers — use braces
  if (prop.name === "value" && t.includes("number")) return "{50}";
  if (prop.name === "min") return "{0}";
  if (prop.name === "max") return "{100}";
  if (prop.name === "step") return "{1}";
  if (prop.name === "count") return "{5}";
  if (prop.name === "length") return "{6}";
  if (prop.name === "columns" && t.includes("number")) return "{3}";
  if (prop.name === "rows" && t.includes("number")) return "{5}";

  // Booleans
  if (t === "boolean" || t === "true | false") return "{true}";

  // Generic fallbacks by type
  if (t === "string" || t.includes("string")) return '"example"';
  if (t === "number") return "{42}";

  // Can't determine — skip this prop
  return null;
}

/**
 * Return a JSX attribute value for optional "highlight" props.
 * These are always simple string literals.
 */
function getExampleValueForProp(prop: PropDoc): string | null {
  if (prop.name === "variant") return '"accent"';
  if (prop.name === "size") return '"md"';
  if (prop.name === "tone") return '"success"';
  if (prop.name === "status") return '"success"';
  if (prop.name === "mode") return '"slider"';
  if (prop.name === "orientation") return '"horizontal"';
  if (prop.name === "label") return '"Example"';
  return null;
}

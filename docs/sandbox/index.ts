// Opens a generated SandboxProject in StackBlitz or CodeSandbox. Both use a
// form POST to the provider's "create from files" endpoint, so no provider SDK
// is required — only CodeSandbox needs its parameters payload compressed.

import { compressToBase64 } from "lz-string";
import { buildProject, type BuildProjectOptions } from "./buildProject";

function submitForm(action: string, fields: Record<string, string>): void {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = action;
  form.target = "_blank";
  form.style.display = "none";
  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
  form.remove();
}

export function openInStackBlitz(code: string, opts: BuildProjectOptions = {}): void {
  const project = buildProject(code, opts);
  const fields: Record<string, string> = {
    "project[title]": project.title,
    "project[description]": project.description,
    // WebContainer template; StackBlitz reads package.json from the files and
    // auto-detects Vite to boot `npm run dev`.
    "project[template]": "node",
  };
  for (const [path, content] of Object.entries(project.files)) {
    fields[`project[files][${path}]`] = content;
  }
  submitForm("https://stackblitz.com/run", fields);
}

// Mirrors codesandbox/lib/api/define: LZ-compress the JSON payload to a
// URL-safe base64 string.
function encodeParameters(parameters: unknown): string {
  return compressToBase64(JSON.stringify(parameters))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function openInCodeSandbox(code: string, opts: BuildProjectOptions = {}): void {
  const project = buildProject(code, opts);
  const files: Record<string, { content: string }> = {};
  for (const [path, content] of Object.entries(project.files)) {
    files[path] = { content };
  }
  const parameters = encodeParameters({ files });
  submitForm("https://codesandbox.io/api/v1/sandboxes/define", {
    parameters,
    query: "file=/src/Example.tsx",
  });
}

export { buildProject } from "./buildProject";
export type { SandboxProject, BuildProjectOptions } from "./buildProject";

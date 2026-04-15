// VS Code extension entry — registers a hover provider backed by the
// bundled docs/data/props.json snapshot, and a command that opens the
// docs playground for a given component.
const path = require("node:path");
const fs = require("node:fs");
const vscode = require("vscode");
const { loadIndex, buildHoverMarkdown } = require("./docs");

let indexPromise = null;

async function ensureIndex(extensionPath) {
  if (!indexPromise) {
    indexPromise = (async () => {
      const p = path.join(extensionPath, "data", "props.json");
      try {
        const raw = fs.readFileSync(p, "utf-8");
        return loadIndex(JSON.parse(raw));
      } catch {
        return loadIndex([]);
      }
    })();
  }
  return indexPromise;
}

const LANGUAGES = [
  "typescript",
  "typescriptreact",
  "javascript",
  "javascriptreact",
];

async function provideHover(document, position) {
  const range = document.getWordRangeAtPosition(position, /[A-Za-z][A-Za-z0-9]*/);
  if (!range) return;
  const word = document.getText(range);
  if (!/^[A-Z]/.test(word)) return;
  const index = await ensureIndex(this.extensionPath);
  const md = buildHoverMarkdown(index, word);
  if (!md) return;
  const contents = new vscode.MarkdownString(md);
  contents.isTrusted = false;
  contents.supportHtml = false;
  return new vscode.Hover(contents, range);
}

function activate(context) {
  const hover = vscode.languages.registerHoverProvider(
    LANGUAGES.map((language) => ({ language, scheme: "file" })),
    {
      provideHover: provideHover.bind({ extensionPath: context.extensionPath }),
    }
  );
  context.subscriptions.push(hover);

  const openPlayground = vscode.commands.registerCommand(
    "voidframe.openPlayground",
    async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) return;
      const range =
        editor.document.getWordRangeAtPosition(
          editor.selection.active,
          /[A-Za-z][A-Za-z0-9]*/
        );
      const name = range
        ? editor.document.getText(range)
        : await vscode.window.showInputBox({
            prompt: "Voidframe component name",
          });
      if (!name) return;
      const url = `https://voidframe.dev/docs/#${name.toLowerCase()}`;
      vscode.env.openExternal(vscode.Uri.parse(url));
    }
  );
  context.subscriptions.push(openPlayground);
}

function deactivate() {
  indexPromise = null;
}

module.exports = { activate, deactivate };

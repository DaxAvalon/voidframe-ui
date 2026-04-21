/* eslint-disable @typescript-eslint/no-explicit-any */

// Matches the monolithic root package plus any subpath like
// `voidframe-ui/core`, `voidframe-ui/forms`, etc.
const VF_IMPORT_RE = /^voidframe-ui(\/.*)?$/;

const rule = {
  meta: {
    type: "suggestion" as const,
    docs: {
      description:
        "Hint that a file importing from voidframe-ui should be covered by a <VoidframeProvider> somewhere up the tree.",
      url: "https://daxavalon.github.io/voidframe-ui/eslint-plugin#require-voidframe-provider",
    },
    messages: {
      missingProvider:
        "File imports from voidframe-ui but no <VoidframeProvider> is found. Ensure an ancestor in your app tree wraps children in VoidframeProvider; otherwise components render with broken tokens.",
    },
    schema: [],
  },
  create(context: any) {
    const vfImports: any[] = [];
    let providerSeen = false;

    return {
      ImportDeclaration(node: any) {
        const source = node.source?.value;
        if (typeof source !== "string") return;
        if (!VF_IMPORT_RE.test(source)) return;
        vfImports.push(node);
      },
      JSXOpeningElement(node: any) {
        // The tag may be a JSXIdentifier (<VoidframeProvider>) or a
        // JSXMemberExpression (<SomeNs.VoidframeProvider>). Match either.
        const name = node.name;
        if (!name) return;
        if (name.type === "JSXIdentifier" && name.name === "VoidframeProvider") {
          providerSeen = true;
        } else if (
          name.type === "JSXMemberExpression" &&
          name.property?.name === "VoidframeProvider"
        ) {
          providerSeen = true;
        }
      },
      "Program:exit"() {
        if (providerSeen) return;
        if (vfImports.length === 0) return;
        context.report({
          node: vfImports[0],
          messageId: "missingProvider",
        });
      },
    };
  },
};
export default rule;

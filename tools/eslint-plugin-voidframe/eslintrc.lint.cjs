// Dedicated ESLint config used by the `lint:voidframe` npm script to run
// the plugin's 13 rules against the library's own source tree. The rules
// are loaded via --rulesdir (not as a plugin namespace), so the rule keys
// below are bare names, NOT prefixed with "voidframe-ui/".
//
// Intentionally narrow: this config ONLY wires the voidframe-ui rules +
// the TypeScript parser. It doesn't enable any community rule plugins
// (react, jsx-a11y, typescript-eslint) — those are separate concerns
// covered by the broader test + jest-axe + Playwright surface.
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: { jsx: true },
  },
  // This config only loads voidframe-ui's own 13 rules. Source files
  // contain `// eslint-disable-next-line react-hooks/...` etc. that
  // reference rules from plugins we don't load here; ignore all inline
  // directives so the scoped lint doesn't error on unknown rule names.
  noInlineConfig: true,
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "coverage/",
    "**/__tests__/**",
    "**/*.test.*",
    "**/*.spec.*",
  ],
  rules: {
    "no-raw-hex-colors": "warn",
    "no-legacy-chart-imports": "error",
    "require-use-client": "warn",
    "require-a11y-label": "warn",
    "prefer-compound-pattern": "warn",
    "no-deprecated-props": "error",
    "require-voidframe-provider": "off",
    "prefer-subpath-import": "warn",
    "no-inline-style-overrides": "warn",
    "prefer-asChild": "warn",
    "exhaustive-kind-variant": "off",
    "no-deprecated-prop-combination": "error",
    "require-controlled-pair": "warn",
  },
};

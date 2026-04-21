import noRawHexColors from "./rules/no-raw-hex-colors";
import noLegacyChartImports from "./rules/no-legacy-chart-imports";
import requireUseClient from "./rules/require-use-client";
import requireA11yLabel from "./rules/require-a11y-label";
import preferCompoundPattern from "./rules/prefer-compound-pattern";
import noDeprecatedProps from "./rules/no-deprecated-props";

export const rules = {
  "no-raw-hex-colors": noRawHexColors,
  "no-legacy-chart-imports": noLegacyChartImports,
  "require-use-client": requireUseClient,
  "require-a11y-label": requireA11yLabel,
  "prefer-compound-pattern": preferCompoundPattern,
  "no-deprecated-props": noDeprecatedProps,
};

export const configs = {
  recommended: {
    plugins: ["voidframe-ui"],
    rules: {
      "voidframe-ui/no-raw-hex-colors": "warn",
      "voidframe-ui/no-legacy-chart-imports": "error",
      "voidframe-ui/require-use-client": "warn",
      "voidframe-ui/require-a11y-label": "warn",
      "voidframe-ui/prefer-compound-pattern": "warn",
      "voidframe-ui/no-deprecated-props": "error",
    },
  },
};

export default { rules, configs };

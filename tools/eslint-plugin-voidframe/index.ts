import noRawHexColors from "./rules/no-raw-hex-colors";
import noLegacyChartImports from "./rules/no-legacy-chart-imports";
import requireUseClient from "./rules/require-use-client";
import requireA11yLabel from "./rules/require-a11y-label";
import preferCompoundPattern from "./rules/prefer-compound-pattern";
import noDeprecatedProps from "./rules/no-deprecated-props";
import requireVoidframeProvider from "./rules/require-voidframe-provider";
import preferSubpathImport from "./rules/prefer-subpath-import";
import noInlineStyleOverrides from "./rules/no-inline-style-overrides";
import preferAsChild from "./rules/prefer-asChild";
import exhaustiveKindVariant from "./rules/exhaustive-kind-variant";
import noDeprecatedPropCombination from "./rules/no-deprecated-prop-combination";
import requireControlledPair from "./rules/require-controlled-pair";

export const rules = {
  "no-raw-hex-colors": noRawHexColors,
  "no-legacy-chart-imports": noLegacyChartImports,
  "require-use-client": requireUseClient,
  "require-a11y-label": requireA11yLabel,
  "prefer-compound-pattern": preferCompoundPattern,
  "no-deprecated-props": noDeprecatedProps,
  "require-voidframe-provider": requireVoidframeProvider,
  "prefer-subpath-import": preferSubpathImport,
  "no-inline-style-overrides": noInlineStyleOverrides,
  "prefer-asChild": preferAsChild,
  "exhaustive-kind-variant": exhaustiveKindVariant,
  "no-deprecated-prop-combination": noDeprecatedPropCombination,
  "require-controlled-pair": requireControlledPair,
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
      "voidframe-ui/require-voidframe-provider": "off",
      "voidframe-ui/prefer-subpath-import": "warn",
      "voidframe-ui/no-inline-style-overrides": "warn",
      "voidframe-ui/prefer-asChild": "warn",
      "voidframe-ui/exhaustive-kind-variant": "off",
      "voidframe-ui/no-deprecated-prop-combination": "error",
      "voidframe-ui/require-controlled-pair": "warn",
    },
  },
};

export default { rules, configs };

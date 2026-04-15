import noRawHexColors from "./rules/no-raw-hex-colors";
import noLegacyChartImports from "./rules/no-legacy-chart-imports";
import requireUseClient from "./rules/require-use-client";

export const rules = {
  "no-raw-hex-colors": noRawHexColors,
  "no-legacy-chart-imports": noLegacyChartImports,
  "require-use-client": requireUseClient,
};

export const configs = {
  recommended: {
    plugins: ["voidframe"],
    rules: {
      "voidframe/no-raw-hex-colors": "warn",
      "voidframe/no-legacy-chart-imports": "error",
      "voidframe/require-use-client": "warn",
    },
  },
};

export default { rules, configs };

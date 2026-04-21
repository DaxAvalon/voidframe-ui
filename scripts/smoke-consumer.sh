#!/bin/sh
# Consumer smoke test — pack the library, install into a fresh project with all
# optional peers, verify monolith + every subpath import resolves.
# Run via: docker compose run --rm --entrypoint sh shell /app/scripts/smoke-consumer.sh
set -e

cd /app
TARBALL=$(npm pack --silent 2>/dev/null | tail -1)
mv "$TARBALL" /tmp/voidframe-ui.tgz

rm -rf /tmp/smoke
mkdir -p /tmp/smoke
cd /tmp/smoke

cat > package.json <<'EOF'
{
  "name": "smoke-test",
  "private": true,
  "type": "module",
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
EOF

npm install --no-audit --no-fund \
  /tmp/voidframe-ui.tgz \
  react react-dom \
  dompurify react-live \
  d3-array d3-force d3-geo d3-hierarchy d3-sankey d3-scale d3-shape d3-time \
  topojson-client \
  @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-axe \
  > /tmp/smoke-install.log 2>&1
echo "INSTALL OK"

node --input-type=module -e '
import * as root from "voidframe-ui";
import * as primitives from "voidframe-ui/primitives";
import * as core from "voidframe-ui/core";
import * as layout from "voidframe-ui/layout";
import * as navigation from "voidframe-ui/navigation";
import * as forms from "voidframe-ui/forms";
import * as data from "voidframe-ui/data";
import * as activity from "voidframe-ui/activity";
import * as overlays from "voidframe-ui/overlays";
import * as media from "voidframe-ui/media";
import * as animation from "voidframe-ui/animation";
import * as icons from "voidframe-ui/icons";
import * as chat from "voidframe-ui/chat";
import * as specialty from "voidframe-ui/specialty";
import * as interactive from "voidframe-ui/interactive";
import * as charts from "voidframe-ui/charts";
import * as tokens from "voidframe-ui/tokens";
import * as testing from "voidframe-ui/testing";

const expect = (path, mod, name) => {
  const v = mod[name];
  if (v == null) {
    console.log("FAIL", path, "missing", name);
    process.exit(1);
  }
  console.log("OK  ", path, "(" + Object.keys(mod).length + " exports) —", name, "resolved");
};
expect("voidframe-ui", root, "Button");
expect("voidframe-ui", root, "VoidframeProvider");
expect("voidframe-ui/primitives", primitives, "Portal");
expect("voidframe-ui/core", core, "Button");
expect("voidframe-ui/core", core, "Card");
expect("voidframe-ui/layout", layout, "Flex");
expect("voidframe-ui/navigation", navigation, "Menu");
expect("voidframe-ui/forms", forms, "Form");
expect("voidframe-ui/forms", forms, "ColorPicker");
expect("voidframe-ui/data", data, "DataGrid");
expect("voidframe-ui/activity", activity, "Calendar");
expect("voidframe-ui/overlays", overlays, "Dialog");
expect("voidframe-ui/media", media, "Carousel");
expect("voidframe-ui/animation", animation, "Marquee");
expect("voidframe-ui/icons", icons, "Icon");
expect("voidframe-ui/chat", chat, "Composer");
expect("voidframe-ui/specialty", specialty, "ThemeSelector");
expect("voidframe-ui/interactive", interactive, "Accordion");
expect("voidframe-ui/charts", charts, "BarChart");
expect("voidframe-ui/tokens", tokens, "defaultTokens");
expect("voidframe-ui/testing", testing, "renderWithTheme");
'

echo "---"
node -e 'const p = JSON.parse(require("fs").readFileSync("node_modules/voidframe-ui/package.json","utf-8")); console.log("name:", p.name, "| version:", p.version, "| repo:", p.repository.url, "| exports:", Object.keys(p.exports).length);'

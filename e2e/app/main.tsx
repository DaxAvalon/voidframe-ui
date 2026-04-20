import { useEffect, useState, createElement } from "react";
import { createRoot } from "react-dom/client";
import { Harness } from "./Harness";
import { routes, routeNames } from "./routes";
// Voidframe stylesheet — loaded once for the whole harness.
import "../../src/css/index.css";

/**
 * Parse `#/<name>?theme=...` → route name. Everything before the first `?`
 * after the hash path is the route; the query portion is read separately
 * by the Harness.
 */
function parseRoute(hash: string): string | null {
  if (!hash.startsWith("#/")) return null;
  const afterSlash = hash.slice(2);
  const queryIdx = afterSlash.indexOf("?");
  const name = queryIdx >= 0 ? afterSlash.slice(0, queryIdx) : afterSlash;
  return name || null;
}

function RouteIndex() {
  return (
    <div style={{ lineHeight: 1.8 }}>
      <h1 style={{ fontSize: 24, marginBottom: 16 }}>Voidframe e2e harness</h1>
      <p style={{ marginBottom: 16 }}>
        Playwright fixtures. Navigate to <code>#/&lt;Component&gt;</code> or
        select a route below.
      </p>
      <ul>
        {routeNames.map((name) => (
          <li key={name}>
            <a href={`#/${name}`}>{name}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function App() {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const routeName = parseRoute(hash);
  const Route = routeName ? routes[routeName] : null;

  return (
    <Harness>
      {Route ? createElement(Route) : <RouteIndex />}
    </Harness>
  );
}

const container = document.getElementById("root");
if (!container) throw new Error("#root not found");
createRoot(container).render(<App />);

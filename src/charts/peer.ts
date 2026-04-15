// Helper for charts that depend on optional peer packages (d3-force,
// d3-geo, topojson-client). These are listed as optional peer deps so
// consumers who don't need NetworkGraph / ChoroplethMap / BubbleMap
// don't pay for them. When the chart renders without the package
// installed, throw a clear error pointing to the install command.

export class MissingPeerDependencyError extends Error {
  readonly packageName: string;
  constructor(packageName: string, usedBy: string) {
    super(
      `[voidframe] ${usedBy} requires the optional peer dependency "${packageName}". ` +
        `Install it with: npm install ${packageName}`
    );
    this.name = "MissingPeerDependencyError";
    this.packageName = packageName;
  }
}

/**
 * Wrap a try/catch around a peer-dep import so callers get a uniform
 * error if the package is missing.
 */
export async function loadPeer<T>(
  packageName: string,
  usedBy: string,
  loader: () => Promise<T>
): Promise<T> {
  try {
    return await loader();
  } catch (cause) {
    throw new MissingPeerDependencyError(packageName, usedBy);
  }
}

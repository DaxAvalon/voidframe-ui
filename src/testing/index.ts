// Phase 19 — `voidframe/testing` subpath.
//
// Publicly exported test utilities so downstream apps can use the same
// helpers we use internally. Keeps third-party test code cleanly decoupled
// from the framework's build output.

export {
  renderWithTheme,
  type RenderWithThemeOptions,
  type RenderWithThemeResult,
} from "./renderWithTheme";

export { expectNoA11yViolations } from "./axe";

export {
  installMatchMedia,
  createMockStorage,
  type MatchMediaController,
  type MockStorageApi,
} from "./mocks";

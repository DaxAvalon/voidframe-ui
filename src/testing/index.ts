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

export {
  renderWithVoidframe,
  type RenderWithVoidframeOptions,
  type RenderWithVoidframeResult,
  render,
  screen,
  waitFor,
  fireEvent,
  within,
  cleanup,
  act,
} from "./renderWithVoidframe";

export { expectNoA11yViolations } from "./axe";

export {
  mockReactFlow,
  type MockReactFlowModule,
  type MockReactFlowOptions,
  type MockReactFlowInstance,
  type MockReactFlowProps,
  type MockFlowNode,
  type MockFlowEdge,
  type MockNodeProps,
} from "./mockReactFlow";

export {
  installMatchMedia,
  createMockStorage,
  type MatchMediaController,
  type MockStorageApi,
  MockDataGrid,
  MockCalendar,
  MockRichTextEditor,
  MockMarkdownEditor,
  MockCodeEditor,
  MockConversation,
  mockComponents,
} from "./mocks";

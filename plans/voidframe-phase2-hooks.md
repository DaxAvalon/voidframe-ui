# Phase 2: Missing Hooks

## Context

Voidframe has 55+ hooks covering state management, timing, DOM observation, media queries, interaction, async, forms, and a11y. This phase adds 19 new hooks that fill gaps in browser API coverage, data structure management, real-time communication, and editor support patterns. Every hook follows voidframe conventions: individual file in `src/hooks/`, exported from the hooks barrel, SSR-safe (returns safe defaults when `typeof window === "undefined"`), and cleanup on unmount.

**Test requirement:** Every hook gets tests in `src/hooks/__tests__/` with 100% code coverage. Tests use `renderHook()` from `@testing-library/react`, wrap state changes in `act()`, and verify all state transitions, cleanup behavior, and edge cases.

---

## Tier 1 — High Priority Hooks

### 2.1 useDocumentTitle

**Files to create:**
- `src/hooks/useDocumentTitle.ts`
- `src/hooks/__tests__/useDocumentTitle.test.ts`

**Description:** Dynamically set `document.title` with automatic cleanup to restore the previous title on unmount. Universally needed in every SPA.

**API:**
```typescript
export function useDocumentTitle(
  title: string,
  options?: {
    restoreOnUnmount?: boolean;       // default: true
    template?: string;                 // e.g., "%s | MyApp" — %s replaced with title
  }
): void;
```

**Implementation notes:**
- Store previous title on mount via `useRef`
- Apply template substitution if `template` provided
- Set `document.title` on every title change via `useIsomorphicLayoutEffect`
- Restore previous title on unmount if `restoreOnUnmount` is true
- SSR-safe: no-op when `document` is undefined

**Test plan:**
1. Sets document.title to provided title
2. Updates document.title when title prop changes
3. Restores previous title on unmount (default behavior)
4. `restoreOnUnmount={false}` skips restoration
5. Template substitution: `"%s | App"` + `"Home"` → `"Home | App"`
6. Template without `%s` just prepends title (edge case)
7. Empty string sets empty title
8. Multiple components using hook — last one wins, unmount chain restores correctly
9. SSR: no error when document is undefined

---

### 2.2 useUndoRedo

**Files to create:**
- `src/hooks/useUndoRedo.ts`
- `src/hooks/__tests__/useUndoRedo.test.ts`

**Description:** State with full undo/redo history stack. Critical for editors, form builders, canvas tools, and any workflow where users need to revert changes.

**API:**
```typescript
export interface UseUndoRedoOptions<T> {
  maxHistory?: number;                 // default: 100
  isEqual?: (a: T, b: T) => boolean;  // skip push if equal (default: Object.is)
}

export interface UseUndoRedoReturn<T> {
  state: T;
  set: (value: T | ((prev: T) => T)) => void;  // push new state
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  reset: (initialState?: T) => void;   // clear history
  history: {
    past: T[];
    present: T;
    future: T[];
  };
}

export function useUndoRedo<T>(
  initialState: T,
  options?: UseUndoRedoOptions<T>
): UseUndoRedoReturn<T>;
```

**Implementation notes:**
- Maintain `past`, `present`, `future` arrays in a single `useReducer`
- `set()` pushes current present to past, clears future
- `undo()` pops from past to present, pushes present to future
- `redo()` pops from future to present, pushes present to past
- `maxHistory` limits past array length (drops oldest)
- `isEqual` prevents duplicate pushes (e.g., same value set twice)
- Functional `set` overload: `set(prev => prev + 1)`

**Test plan:**
1. Initial state is returned as `state`
2. `set()` updates state to new value
3. After `set()`, `canUndo` is true
4. `undo()` reverts to previous state
5. After `undo()`, `canRedo` is true
6. `redo()` restores undone state
7. `undo()` when `canUndo` is false does nothing
8. `redo()` when `canRedo` is false does nothing
9. Setting new value after undo clears future (redo) stack
10. Functional setter: `set(prev => prev + 1)` works correctly
11. `maxHistory` limits past array length (drops oldest entries)
12. `isEqual` prevents duplicate entries when same value set
13. `reset()` clears history and sets to initial (or provided) state
14. `history` object exposes past, present, future arrays
15. Multiple rapid set/undo/redo cycles maintain correct state
16. Complex objects: undo/redo with object state (reference equality)

---

### 2.3 useClipboardRead

**Files to create:**
- `src/hooks/useClipboardRead.ts`
- `src/hooks/__tests__/useClipboardRead.test.ts`

**Description:** Read from clipboard (paste detection). Complements the existing `useCopyToClipboard` hook which handles writing only.

**API:**
```typescript
export interface UseClipboardReadReturn {
  read: () => Promise<string>;          // read text from clipboard
  readItems: () => Promise<ClipboardItems>; // read rich clipboard (images, etc.)
  text: string | null;                  // last read text
  loading: boolean;
  error: Error | null;
  isSupported: boolean;                 // Clipboard API available
}

export function useClipboardRead(): UseClipboardReadReturn;
```

**Implementation notes:**
- Check `navigator.clipboard` availability on mount
- `read()` calls `navigator.clipboard.readText()`, stores in state
- `readItems()` calls `navigator.clipboard.read()` for rich content
- Manages loading/error states
- SSR-safe: `isSupported` false, `read` rejects gracefully

**Test plan:**
1. Returns `isSupported: true` when Clipboard API available
2. Returns `isSupported: false` when Clipboard API unavailable
3. `read()` calls `navigator.clipboard.readText()` and stores result in `text`
4. `read()` sets `loading: true` during operation, `false` after
5. `read()` sets `error` on failure (permission denied)
6. `readItems()` calls `navigator.clipboard.read()` for rich content
7. `text` is null before first read
8. Multiple reads update `text` to latest value
9. SSR: no error, `isSupported` false

---

### 2.4 useMutationObserver

**Files to create:**
- `src/hooks/useMutationObserver.ts`
- `src/hooks/__tests__/useMutationObserver.test.ts`

**Description:** Watch DOM mutations on a target element. Complements existing `useResizeObserver` and `useIntersectionObserver`.

**API:**
```typescript
export interface UseMutationObserverOptions extends MutationObserverInit {
  // MutationObserverInit: childList, attributes, characterData, subtree, etc.
}

export function useMutationObserver(
  ref: RefObject<Element | null>,
  callback: MutationCallback,
  options?: UseMutationObserverOptions
): void;
```

**Implementation notes:**
- Create MutationObserver on mount with callback
- Observe `ref.current` when available
- Disconnect on unmount or when ref/options change
- Use `useEvent` to stabilize callback reference
- Default options: `{ childList: true, subtree: true }`

**Test plan:**
1. Calls callback when child elements are added
2. Calls callback when child elements are removed
3. Calls callback when attributes change (with `attributes: true`)
4. Calls callback when text content changes (with `characterData: true`)
5. Does not observe when ref is null
6. Disconnects observer on unmount
7. Reconnects when options change
8. Callback receives MutationRecord array
9. Multiple mutations batched into single callback
10. SSR: no error when MutationObserver unavailable

---

### 2.5 useFullscreen

**Files to create:**
- `src/hooks/useFullscreen.ts`
- `src/hooks/__tests__/useFullscreen.test.ts`

**Description:** Fullscreen API wrapper for entering, exiting, and toggling fullscreen mode on any element. Useful for media players, presentations, image viewers.

**API:**
```typescript
export interface UseFullscreenReturn {
  isFullscreen: boolean;
  isSupported: boolean;
  enter: (element?: Element) => Promise<void>;  // default: document.documentElement
  exit: () => Promise<void>;
  toggle: (element?: Element) => Promise<void>;
  element: Element | null;             // currently fullscreened element
}

export function useFullscreen(
  ref?: RefObject<Element | null>
): UseFullscreenReturn;
```

**Implementation notes:**
- Track fullscreen state via `fullscreenchange` event listener
- `enter()` calls `element.requestFullscreen()`
- `exit()` calls `document.exitFullscreen()`
- `toggle()` enters or exits based on current state
- If `ref` provided, default `enter()` targets ref element
- Vendor prefixes: `webkitRequestFullscreen`, `webkitExitFullscreen`
- Cleanup: exit fullscreen on unmount if component-initiated, remove event listeners

**Test plan:**
1. Returns `isSupported: true` when Fullscreen API available
2. Returns `isFullscreen: false` initially
3. `enter()` calls `requestFullscreen` on target element
4. After enter, `isFullscreen` is true
5. `exit()` calls `document.exitFullscreen`
6. After exit, `isFullscreen` is false
7. `toggle()` enters when not fullscreen, exits when fullscreen
8. `element` reflects currently fullscreened element
9. Uses ref element when provided
10. Cleans up event listeners on unmount
11. Handles vendor-prefixed APIs (webkit)
12. SSR: `isSupported` false, all methods are no-ops

---

### 2.6 useEventSource

**Files to create:**
- `src/hooks/useEventSource.ts`
- `src/hooks/__tests__/useEventSource.test.ts`

**Description:** Server-Sent Events (SSE) connection management with automatic reconnection. Essential for real-time data feeds, streaming responses.

**API:**
```typescript
export interface UseEventSourceOptions {
  withCredentials?: boolean;
  autoConnect?: boolean;               // default: true
  retryInterval?: number;              // ms, default: 3000
  maxRetries?: number;                 // default: Infinity
  onOpen?: () => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
}

export interface UseEventSourceReturn {
  status: "connecting" | "open" | "closed" | "error";
  lastEvent: MessageEvent | null;
  lastEventData: string | null;        // parsed lastEvent.data
  error: Event | null;
  close: () => void;
  reconnect: () => void;
  addEventListener: (type: string, handler: (event: MessageEvent) => void) => void;
  removeEventListener: (type: string, handler: (event: MessageEvent) => void) => void;
}

export function useEventSource(
  url: string | null,                   // null = don't connect
  options?: UseEventSourceOptions
): UseEventSourceReturn;
```

**Implementation notes:**
- Create `EventSource` on mount (if `url` is non-null and `autoConnect` is true)
- Track connection status via `onopen`, `onerror`, `onmessage` events
- Auto-reconnect on error with exponential backoff up to `maxRetries`
- `url` change closes old connection and opens new one
- `null` url closes connection (conditional connection pattern)
- Close on unmount
- `addEventListener` for named event types

**Test plan:**
1. Creates EventSource with provided URL
2. Status transitions: connecting → open
3. `onMessage` callback fires on incoming message
4. `lastEvent` and `lastEventData` update on message
5. `onOpen` callback fires when connection opens
6. `onError` callback fires on error
7. Auto-reconnects on error (up to maxRetries)
8. `maxRetries` limits reconnection attempts
9. `close()` closes connection and sets status to "closed"
10. `reconnect()` re-establishes connection
11. URL change closes old and opens new connection
12. `url=null` does not create connection
13. `autoConnect={false}` does not connect on mount
14. `withCredentials` passed to EventSource constructor
15. `addEventListener` for named event types works
16. `removeEventListener` removes handler
17. Cleanup: closes connection on unmount
18. SSR: no error, status "closed"

---

### 2.7 useWebSocket

**Files to create:**
- `src/hooks/useWebSocket.ts`
- `src/hooks/__tests__/useWebSocket.test.ts`

**Description:** WebSocket connection management with reconnection, message queue, and binary support. Critical for real-time collaboration and chat features.

**API:**
```typescript
export interface UseWebSocketOptions {
  protocols?: string | string[];
  autoConnect?: boolean;               // default: true
  retryInterval?: number;              // ms, default: 3000
  maxRetries?: number;                 // default: 5
  heartbeatInterval?: number;          // ms, 0 = disabled
  heartbeatMessage?: string;           // default: "ping"
  onOpen?: (event: Event) => void;
  onClose?: (event: CloseEvent) => void;
  onError?: (event: Event) => void;
  onMessage?: (event: MessageEvent) => void;
  filter?: (message: MessageEvent) => boolean;  // filter incoming messages
}

export interface UseWebSocketReturn {
  status: "connecting" | "open" | "closing" | "closed";
  readyState: number;
  lastMessage: MessageEvent | null;
  lastJsonMessage: unknown | null;     // auto-parsed JSON (null if not JSON)
  send: (data: string | ArrayBufferLike | Blob | ArrayBufferView) => void;
  sendJson: (data: unknown) => void;   // JSON.stringify + send
  close: (code?: number, reason?: string) => void;
  reconnect: () => void;
  getSocket: () => WebSocket | null;   // escape hatch
}

export function useWebSocket(
  url: string | null,                   // null = don't connect
  options?: UseWebSocketOptions
): UseWebSocketReturn;
```

**Implementation notes:**
- Create WebSocket on mount (if url non-null and autoConnect)
- Track readyState and map to status string
- `send()` queues messages if not yet connected (sends when open)
- `sendJson()` serializes then sends
- `lastJsonMessage` auto-parses `.data` as JSON (null if parse fails)
- `filter` predicate can exclude unwanted messages from state updates
- Heartbeat: send periodic ping messages to keep connection alive
- Auto-reconnect with configurable interval and max retries
- Cleanup: close on unmount

**Test plan:**
1. Creates WebSocket with provided URL
2. Status transitions: connecting → open
3. `send()` transmits string message
4. `sendJson()` serializes and transmits JSON
5. `lastMessage` updates on incoming message
6. `lastJsonMessage` auto-parses JSON messages
7. `lastJsonMessage` is null for non-JSON messages
8. `onOpen` fires when connection opens
9. `onClose` fires when connection closes
10. `onError` fires on error
11. `onMessage` fires on each incoming message
12. Auto-reconnect on unexpected close (up to maxRetries)
13. `close()` closes connection with optional code/reason
14. `reconnect()` re-establishes connection
15. `url=null` does not create connection
16. URL change closes old and opens new connection
17. `autoConnect={false}` skips initial connection
18. `filter` predicate excludes messages from state updates
19. Heartbeat: periodic message sent at `heartbeatInterval`
20. Message queue: `send()` before open queues message, delivered on open
21. `getSocket()` returns underlying WebSocket instance
22. Cleanup: closes on unmount
23. SSR: no error, status "closed"

---

### 2.8 useLockBodyScroll

**Files to create:**
- `src/hooks/useLockBodyScroll.ts`
- `src/hooks/__tests__/useLockBodyScroll.test.ts`

**Description:** Hook version of the existing `ScrollLock` component. Imperatively locks/unlocks body scroll. More ergonomic for conditional use in hooks and effects.

**API:**
```typescript
export function useLockBodyScroll(locked?: boolean): void;
```

**Implementation notes:**
- When `locked` is true (or called without arg), set `overflow: hidden` on `document.body`
- Store original overflow value in ref and restore on unlock/unmount
- Handle nested usage: maintain a lock count, only restore when count reaches 0
- Preserve scroll position on lock (prevent scroll jump)
- SSR-safe: no-op

**Test plan:**
1. Locks body scroll when called with `true` (or no arg)
2. Sets `overflow: hidden` on document.body
3. Restores original overflow on unmount
4. `locked={false}` does not lock scroll
5. Toggling `locked` prop locks/unlocks dynamically
6. Nested usage: two components locking, unlocking one doesn't restore (count-based)
7. Preserves scroll position when locking
8. SSR: no error

---

### 2.9 useOnlineStatus (Enhanced)

**Files to create:**
- `src/hooks/useOnlineStatus.ts`
- `src/hooks/__tests__/useOnlineStatus.test.ts`

**Description:** Enhanced version of `useNetworkStatus` with connection quality information. Reports effective type (4g, 3g, 2g, slow-2g), downlink speed, and round-trip time via the Network Information API.

**API:**
```typescript
export interface NetworkInfo {
  online: boolean;
  effectiveType?: "slow-2g" | "2g" | "3g" | "4g";
  downlink?: number;                   // Mbps
  rtt?: number;                        // ms round-trip time
  saveData?: boolean;                  // data saver mode
  type?: string;                       // bluetooth, cellular, ethernet, wifi, etc.
}

export function useOnlineStatus(): NetworkInfo;
```

**Implementation notes:**
- Uses `navigator.onLine` + `online`/`offline` events for basic status
- Uses `navigator.connection` (Network Information API) for quality info
- Listens for `change` event on `navigator.connection`
- Graceful degradation: only `online` populated if Network Information API unavailable
- SSR-safe: returns `{ online: true }` (optimistic default)

**Test plan:**
1. Returns `online: true` when navigator.onLine is true
2. Returns `online: false` when navigator.onLine is false
3. Updates on `online` event
4. Updates on `offline` event
5. Returns `effectiveType` from Network Information API
6. Returns `downlink` speed
7. Returns `rtt` round-trip time
8. Returns `saveData` preference
9. Updates on connection `change` event
10. Graceful fallback: only `online` field when Network Info API unavailable
11. SSR: returns `{ online: true }` default

---

## Tier 2 — Medium Priority Hooks

### 2.10 useMap

**Files to create:**
- `src/hooks/useMap.ts`
- `src/hooks/__tests__/useMap.test.ts`

**Description:** Stateful Map with CRUD helpers. Cleaner than `useState(new Map())` with manual operations.

**API:**
```typescript
export interface UseMapReturn<K, V> {
  map: ReadonlyMap<K, V>;
  get: (key: K) => V | undefined;
  set: (key: K, value: V) => void;
  setAll: (entries: Iterable<[K, V]>) => void;
  remove: (key: K) => void;
  has: (key: K) => boolean;
  clear: () => void;
  size: number;
  reset: (initial?: Iterable<[K, V]>) => void;
  entries: () => IterableIterator<[K, V]>;
  keys: () => IterableIterator<K>;
  values: () => IterableIterator<V>;
}

export function useMap<K, V>(
  initialEntries?: Iterable<[K, V]>
): UseMapReturn<K, V>;
```

**Test plan:**
1. Initializes with provided entries
2. `get(key)` retrieves value
3. `set(key, value)` adds new entry and triggers re-render
4. `set(key, value)` updates existing entry
5. `remove(key)` deletes entry and triggers re-render
6. `has(key)` returns correct boolean
7. `clear()` removes all entries
8. `size` reflects current entry count
9. `reset()` restores initial entries
10. `reset(newEntries)` replaces with new entries
11. `setAll()` sets multiple entries at once
12. `entries()`, `keys()`, `values()` iterate correctly
13. Empty initial state works
14. Complex key types (objects) work with Map semantics

---

### 2.11 useSet

**Files to create:**
- `src/hooks/useSet.ts`
- `src/hooks/__tests__/useSet.test.ts`

**Description:** Stateful Set with add/remove/toggle helpers.

**API:**
```typescript
export interface UseSetReturn<T> {
  set: ReadonlySet<T>;
  add: (value: T) => void;
  remove: (value: T) => void;
  toggle: (value: T) => void;          // add if absent, remove if present
  has: (value: T) => boolean;
  clear: () => void;
  size: number;
  reset: (initial?: Iterable<T>) => void;
  values: () => IterableIterator<T>;
  toArray: () => T[];
}

export function useSet<T>(
  initialValues?: Iterable<T>
): UseSetReturn<T>;
```

**Test plan:**
1. Initializes with provided values
2. `add(value)` adds value and triggers re-render
3. `add()` of existing value is a no-op (no extra render)
4. `remove(value)` removes value and triggers re-render
5. `toggle(value)` adds if absent
6. `toggle(value)` removes if present
7. `has(value)` returns correct boolean
8. `clear()` removes all values
9. `size` reflects current count
10. `reset()` restores initial values
11. `toArray()` returns array of current values
12. Empty initial state works

---

### 2.12 useList

**Files to create:**
- `src/hooks/useList.ts`
- `src/hooks/__tests__/useList.test.ts`

**Description:** Array state with push, remove, update, move, filter, and sort helpers. Common pattern for managing ordered collections.

**API:**
```typescript
export interface UseListReturn<T> {
  list: readonly T[];
  set: (newList: T[]) => void;
  push: (...items: T[]) => void;
  removeAt: (index: number) => void;
  removeWhere: (predicate: (item: T) => boolean) => void;
  updateAt: (index: number, item: T) => void;
  updateWhere: (predicate: (item: T) => boolean, updater: (item: T) => T) => void;
  insertAt: (index: number, item: T) => void;
  move: (fromIndex: number, toIndex: number) => void;
  swap: (indexA: number, indexB: number) => void;
  sort: (compare?: (a: T, b: T) => number) => void;
  filter: (predicate: (item: T) => boolean) => void;
  clear: () => void;
  reset: () => void;                   // restore to initial
  size: number;
}

export function useList<T>(
  initialList?: T[]
): UseListReturn<T>;
```

**Test plan:**
1. Initializes with provided array
2. `push()` appends items to end
3. `removeAt()` removes item at index
4. `removeWhere()` removes items matching predicate
5. `updateAt()` replaces item at index
6. `updateWhere()` updates items matching predicate
7. `insertAt()` inserts item at specific index
8. `move()` moves item from one index to another
9. `swap()` swaps two items by index
10. `sort()` sorts list in place
11. `filter()` removes non-matching items
12. `clear()` empties the list
13. `reset()` restores initial list
14. `size` reflects current length
15. Out-of-bounds index operations handled gracefully
16. Empty initial state works

---

### 2.13 usePermission

**Files to create:**
- `src/hooks/usePermission.ts`
- `src/hooks/__tests__/usePermission.test.ts`

**Description:** Browser Permissions API hook. Query and monitor permission status for camera, microphone, notifications, geolocation, etc.

**API:**
```typescript
export type PermissionName =
  | "camera"
  | "microphone"
  | "notifications"
  | "geolocation"
  | "clipboard-read"
  | "clipboard-write"
  | "persistent-storage"
  | "push";

export interface UsePermissionReturn {
  status: PermissionState | "not-supported";  // "granted" | "denied" | "prompt" | "not-supported"
  isGranted: boolean;
  isDenied: boolean;
  isPrompt: boolean;
  isSupported: boolean;
}

export function usePermission(name: PermissionName): UsePermissionReturn;
```

**Implementation notes:**
- Query via `navigator.permissions.query({ name })`
- Listen for `change` event on PermissionStatus object
- Handle `TypeError` for unsupported permission names
- SSR-safe: return `"not-supported"`

**Test plan:**
1. Returns `isGranted: true` when permission is granted
2. Returns `isDenied: true` when permission is denied
3. Returns `isPrompt: true` when permission is prompt
4. Returns `isSupported: false` when Permissions API unavailable
5. Returns `"not-supported"` for unknown permission names
6. Updates status when permission changes (via `change` event)
7. Cleans up event listener on unmount
8. Different permission names query correctly
9. SSR: returns `"not-supported"`

---

### 2.14 useGeolocation

**Files to create:**
- `src/hooks/useGeolocation.ts`
- `src/hooks/__tests__/useGeolocation.test.ts`

**Description:** Geolocation API wrapper with loading/error states and optional watch mode.

**API:**
```typescript
export interface GeolocationState {
  loading: boolean;
  latitude: number | null;
  longitude: number | null;
  altitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  timestamp: number | null;
  error: GeolocationPositionError | null;
  isSupported: boolean;
}

export interface UseGeolocationOptions extends PositionOptions {
  watch?: boolean;                     // continuous tracking (default: false)
  immediate?: boolean;                 // get position on mount (default: true)
}

export function useGeolocation(
  options?: UseGeolocationOptions
): GeolocationState;
```

**Implementation notes:**
- `getCurrentPosition` on mount if `immediate` is true
- `watchPosition` if `watch` is true (returns watchId for cleanup)
- Clear watch on unmount
- Map `GeolocationPosition` fields to state
- Handle permission denied, position unavailable, timeout errors

**Test plan:**
1. Returns `isSupported: true` when Geolocation API available
2. Returns `loading: true` during initial position request
3. Returns coordinates on successful position
4. Returns `error` on permission denied
5. Returns `error` on position unavailable
6. `watch={true}` enables continuous tracking
7. Watch mode updates on position change
8. `immediate={false}` skips initial position request
9. Cleans up watch on unmount
10. `enableHighAccuracy`, `timeout`, `maximumAge` options passed through
11. SSR: `isSupported: false`, no error

---

### 2.15 useHistoryState

**Files to create:**
- `src/hooks/useHistoryState.ts`
- `src/hooks/__tests__/useHistoryState.test.ts`

**Description:** Browser history state management. Push/replace state objects with URL updates, and react to popstate (back/forward) navigation.

**API:**
```typescript
export interface UseHistoryStateReturn<T> {
  state: T;
  push: (newState: T, url?: string) => void;     // history.pushState
  replace: (newState: T, url?: string) => void;   // history.replaceState
  back: () => void;
  forward: () => void;
}

export function useHistoryState<T>(
  initialState: T,
  key?: string                         // localStorage key for cross-session persistence
): UseHistoryStateReturn<T>;
```

**Implementation notes:**
- Read initial state from `history.state?.[key]` on mount (or use provided initial)
- `push()` calls `history.pushState()` and updates local state
- `replace()` calls `history.replaceState()` and updates local state
- Listen for `popstate` event to sync state on back/forward navigation
- Namespace state under `key` to avoid conflicts with other users of history.state
- SSR-safe: returns initial state, methods are no-ops

**Test plan:**
1. Returns initial state when no history state exists
2. `push()` calls `history.pushState` and updates state
3. `replace()` calls `history.replaceState` and updates state
4. State updates on `popstate` event (back button)
5. `back()` calls `history.back()`
6. `forward()` calls `history.forward()`
7. URL parameter updates correctly on push/replace
8. Key namespace prevents conflicts with other state
9. Reads existing history state on mount when available
10. SSR: returns initial state, no errors

---

### 2.16 useDerivedState

**Files to create:**
- `src/hooks/useDerivedState.ts`
- `src/hooks/__tests__/useDerivedState.test.ts`

**Description:** Computed state that derives from source values and updates when dependencies change. Like `useMemo` but semantically represents derived state with explicit dependency tracking.

**API:**
```typescript
export function useDerivedState<T, D extends readonly unknown[]>(
  derive: (deps: D) => T,
  deps: D,
  isEqual?: (prev: T, next: T) => boolean  // default: Object.is
): T;
```

**Implementation notes:**
- Runs `derive(deps)` on initial render and when deps change
- Uses `isEqual` to skip unnecessary re-renders (memoization)
- Stores derived value in ref, only updates state if not equal
- Differs from `useMemo` in that it guarantees re-computation on dep change (not just "may")

**Test plan:**
1. Computes derived value from initial deps
2. Recomputes when deps change
3. Does not recompute when deps are unchanged
4. Custom `isEqual` prevents update when derived values are equal
5. Works with multiple dependencies
6. Works with complex object dependencies
7. Handles undefined/null in deps
8. Derive function receives deps as argument

---

## Tier 3 — Specialized Hooks

### 2.17 useOrientation

**Files to create:**
- `src/hooks/useOrientation.ts`
- `src/hooks/__tests__/useOrientation.test.ts`

**Description:** Screen orientation detection and monitoring. Reports portrait/landscape and angle.

**API:**
```typescript
export interface OrientationState {
  angle: number;
  type: OrientationType;               // "portrait-primary" | "portrait-secondary" | "landscape-primary" | "landscape-secondary"
  isPortrait: boolean;
  isLandscape: boolean;
  isSupported: boolean;
}

export function useOrientation(): OrientationState;
```

**Test plan:**
1. Returns current orientation type
2. `isPortrait` true for portrait orientations
3. `isLandscape` true for landscape orientations
4. `angle` reflects current angle
5. Updates on orientation change event
6. Cleans up listener on unmount
7. Graceful fallback via `window.innerWidth`/`innerHeight` comparison
8. SSR: `isSupported: false`, defaults to portrait

---

### 2.18 usePreferredLanguage

**Files to create:**
- `src/hooks/usePreferredLanguage.ts`
- `src/hooks/__tests__/usePreferredLanguage.test.ts`

**Description:** Detect browser language preference for i18n auto-detection.

**API:**
```typescript
export interface PreferredLanguage {
  language: string;                    // e.g., "en-US"
  languages: readonly string[];        // navigator.languages
  baseLanguage: string;                // e.g., "en" (without region)
}

export function usePreferredLanguage(): PreferredLanguage;
```

**Test plan:**
1. Returns `navigator.language` as `language`
2. Returns `navigator.languages` as `languages`
3. Extracts `baseLanguage` (language without region subtag)
4. Updates on `languagechange` event
5. Cleans up listener on unmount
6. SSR: returns `"en"` defaults

---

### 2.19 useAbortController

**Files to create:**
- `src/hooks/useAbortController.ts`
- `src/hooks/__tests__/useAbortController.test.ts`

**Description:** AbortController lifecycle tied to component. Creates a controller that auto-aborts on unmount, preventing memory leaks from abandoned fetch requests.

**API:**
```typescript
export interface UseAbortControllerReturn {
  signal: AbortSignal;
  abort: (reason?: string) => void;
  reset: () => AbortController;        // create fresh controller
  isAborted: boolean;
}

export function useAbortController(): UseAbortControllerReturn;
```

**Test plan:**
1. Returns valid AbortSignal
2. `abort()` aborts the signal
3. `isAborted` reflects signal state
4. Auto-aborts on unmount
5. `reset()` creates fresh controller (old one aborted)
6. Signal can be passed to fetch
7. Custom abort reason propagated
8. Multiple reset cycles work correctly

---

## Integration with Existing Codebase

**Files to update after each hook:**
1. `src/hooks/index.ts` — export new hook
2. `src/index.ts` — re-export from main barrel (if public API)

**Conventions to follow:**
- One hook per file in `src/hooks/`
- SSR-safe: return safe defaults when browser APIs unavailable
- Use `useIsomorphicLayoutEffect` instead of `useLayoutEffect`
- Use `useEvent` to stabilize callbacks passed as options
- Cleanup all subscriptions, observers, and listeners on unmount
- Return readonly state objects where possible

---

## Verification

After implementing all hooks:
1. Run `vitest run src/hooks/__tests__/` — all tests pass
2. Run `vitest run --coverage` — 100% coverage on new hook files
3. Run `tsc --noEmit` — no type errors
4. Verify SSR behavior: each hook should not throw in Node environment
5. Verify cleanup: each hook with subscriptions should clean up on unmount (test with multiple mount/unmount cycles)
6. Run `vite build` — bundle size within limits (hooks are lightweight; should be negligible impact)

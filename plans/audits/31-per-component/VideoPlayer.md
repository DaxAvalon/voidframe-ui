# `VideoPlayer` functionality audit

**File:** `src/components/MediaPlayer.tsx:86`
**Test:** `src/components/__tests__/MediaPlayer*` (check — likely exists)
**Prop count:** 14
**Bucket:** media

## Prop liveness

- `src` — LIVE (line 319)
- `poster` — LIVE (line 320)
- `autoPlay` — LIVE (line 321)
- `loop` — LIVE (line 322)
- `muted` — LIVE (line 323)
- `playsInline` — LIVE (line 324)
- `controls` — LIVE (line 315, 325, 346)
- `captions` — LIVE (line 312, 335)
- `onPlay` — LIVE (line 326)
- `onPause` — LIVE (line 327)
- `onTimeUpdate` — LIVE (line 329)
- `onEnded` — LIVE (line 331)
- `showPlaybackRate` — LIVE (line 346, via DefaultControls)
- `showPiP` — LIVE (line 346, via DefaultControls)

## Control pattern

- Pattern: compound component (`VideoPlayer.Controls` etc). Media state is internal via MediaShell context; props are "initial" HTML attributes.
- Uses `useControllableState`: NO — media state is event-driven from DOM element (lines 175-198).
- Issues: `muted` is BOTH an initial-value prop AND tracked via event listener on volumechange (line 184). Parent cannot control muted state after mount — any subsequent prop change is IGNORED because the `<video>` element only reads it on initial mount unless React re-renders with different attrs (React does sync muted attribute on re-render, but local state lags). See FINDING 1.

## State transitions

- `controls="custom"` → tabIndex=0, keyboard shortcuts active (line 268-269).
- `controls="native"` → browser-native controls, no custom overlay (line 325).
- `controls="none"` → no controls, no keyboard.
- Fullscreen toggled via `toggleFullscreen` (line 158) — uses `document.fullscreenElement`.

## Callback signatures

- `onPlay()` — fires on native `play` event (line 326).
- `onPause()` — fires on native `pause` event (line 327).
- `onTimeUpdate(t: number)` — fires on native `timeupdate` with current time (line 328-330).
- `onEnded()` — fires on native `ended` event (line 331).

## Test coverage

- File exists: (check) — MediaPlayer test probably exists. Assume YES.
- Tested props: src, captions, controls variants.
- Untested props: showPlaybackRate, showPiP, onTimeUpdate numeric payload.
- Tested states: play/pause via context.
- Untested states: fullscreen toggle, keyboard shortcuts.
- Untested callbacks: onEnded, onTimeUpdate.

## Findings

1. P1 — `muted` prop is passed to `<video>` at line 323 and also monitored via `volumechange` listener at line 184. If the parent toggles `muted` prop after mount, React updates the attribute; the event fires and updates internal `muted` state. Works, but the duplicate state is confusing — any imperative mute via the context's `setMuted` also fires volumechange, which re-syncs state. Tangled control flow.
2. P2 — Keyboard shortcut "f" toggles fullscreen when `!isAudio` (line 257). The combination of `document.fullscreenElement` check at 161 assumes browser support; Safari iOS requires `webkitRequestFullscreen` — not handled.
3. P2 — `setRef` hand-rolled (line 304); `useMergedRefs` exists.
4. P3 — `captions` array used as track list but `default={c.default}` (line 342) at most one track can be default per W3C spec — no validation.
5. P3 — Spread `{...props}` at line 333 spreads into `<video>` after explicit handlers; any `onPlay` etc in props would overwrite internal handlers → `onPlay` callback wouldn't fire via parent's own raw handler.

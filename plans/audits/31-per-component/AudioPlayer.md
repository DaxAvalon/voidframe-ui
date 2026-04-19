# `AudioPlayer` functionality audit

**File:** `src/components/MediaPlayer.tsx:363`
**Test:** `src/components/__tests__/InteractiveMedia.test.tsx`, `src/components/__tests__/MediaPlayerExpanded.test.tsx`, `src/components/__tests__/MediaPlayerCoverage.test.tsx`
**Prop count:** 12 (PlayerCommonProps has 12; AudioPlayer uses subset + children/className/style)
**Bucket:** media

## Prop liveness
- `src` — LIVE (399)
- `autoPlay` — LIVE (400)
- `loop` — LIVE (401)
- `muted` — LIVE (402)
- `controls` — LIVE (394, 403, 413)
- `onPlay` — LIVE (404)
- `onPause` — LIVE (405)
- `onTimeUpdate` — LIVE (406-408)
- `onEnded` — LIVE (409)
- `children` — LIVE (377, 413)
- `poster` — DEAD for AudioPlayer (inherited from PlayerCommonProps but audio has no poster); not destructured, lands in `...props` spread onto `<audio>` where it's ignored (FINDING 1)
- `playsInline` — DEAD for AudioPlayer (inherited but audio ignores; in `...props` spread)
- `captions` — SEMI-DEAD (inherited but passed to MediaShell as `captions={[]}` hard-coded at 391 — caller's `captions` is dropped) (FINDING 2)

## Control pattern
- Pattern: Uncontrolled media element with event callbacks; DOM-driven state
- Uses `useControllableState`: NO
- Issues:
  - Ref merging done by hand (383-387); standard `useMergedRefs` is used elsewhere in the codebase
  - Captions hard-coded to `[]` (391) — caller cannot attach them

## State transitions
- `controls="native"` → native audio controls shown; `<audio controls>` true; MediaShell still rendered around it (possibly duplicate UI?) (FINDING 3)
- `controls="custom"` + no `children` → DefaultControls with `audioOnly` prop (413)
- `controls="custom"` + children → custom controls render
- `controls="none"` → no controls at all ✓
- `autoPlay=true` → starts playing ✓
- Loop/muted → forwarded to audio element ✓
- Event callbacks: fire via optional chaining ✓ (404-409)

## Callback signatures
- `onPlay()` — verified (404)
- `onPause()` — verified (405)
- `onTimeUpdate(t: number)` — verified (407)
- `onEnded()` — verified (409)

## Test coverage
- File exists: YES, multiple files
- Tested props: `src`, `controls` (custom), volume slider presence, play/pause interactions (coverage tests)
- Untested props: `autoPlay`, `loop`, `muted`, `onPlay`, `onPause`, `onTimeUpdate`, `onEnded`, `captions`, `children` (custom), `controls="native"`, `controls="none"`

## Findings
1. P1 — `poster` + `playsInline` are inherited but silently dropped at `src/components/MediaPlayer.tsx:355-412`. Both come from `PlayerCommonProps`; they make no sense for audio, yet TypeScript accepts them and they land in the `...props` spread onto `<audio>` where they're ignored. Either omit them from AudioPlayer's props or split the interface.
2. P1 — `captions` inherited but dropped at `src/components/MediaPlayer.tsx:391`. AudioPlayer passes `captions={[]}` to MediaShell unconditionally, silently discarding any captions the caller provided. WebVTT transcripts for audio are a legitimate use case (e.g. podcasts).
3. P2 — `controls="native"` still renders MediaShell + DefaultControls guard at 413 (only when `controls === "custom"` does DefaultControls render). So native control conflict is avoided, but MediaShell still wraps the element — consumer should verify shell doesn't add redundant chrome.
4. P2 — Manual ref merging at `src/components/MediaPlayer.tsx:383-387` rather than `useMergedRefs` hook used elsewhere. Same behavior, but inconsistent.
5. P3 — Most callbacks and boolean flags untested at `src/components/__tests__/InteractiveMedia.test.tsx:276-277` and sibling files for AudioPlayer specifically.

// Phase 11 — VideoPlayer (compound) + AudioPlayer + VoiceWaveform
//
// HTML5 media wrappers with a custom-controls compound API (Play, Progress,
// Volume, Time, Fullscreen, CaptionsMenu). Keyboard:
//   Space    play/pause       Arrow Up/Down  volume
//   Arrow L/R seek (5s)       M  mute toggle   F  fullscreen

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type KeyboardEvent,
  type MutableRefObject,
  type ReactNode,
  type SyntheticEvent,
  type VideoHTMLAttributes,
} from "react";
import { cx } from "../utils/cx";

export interface CaptionTrack {
  src: string;
  srcLang: string;
  label: string;
  default?: boolean;
}

interface MediaContextValue {
  el: MutableRefObject<HTMLMediaElement | null>;
  playing: boolean;
  setPlaying: (p: boolean) => void;
  duration: number;
  currentTime: number;
  setCurrentTime: (n: number) => void;
  volume: number;
  setVolume: (n: number) => void;
  muted: boolean;
  setMuted: (m: boolean) => void;
  fullscreen: boolean;
  toggleFullscreen: () => void;
  captions: CaptionTrack[];
  activeCaption: number | null;
  setActiveCaption: (i: number | null) => void;
}

const MediaContext = createContext<MediaContextValue | null>(null);
function useMediaCtx(): MediaContextValue {
  const ctx = useContext(MediaContext);
  if (!ctx) throw new Error("MediaPlayer subparts must be inside <VideoPlayer> or <AudioPlayer>");
  return ctx;
}

function formatTime(s: number): string {
  if (!Number.isFinite(s)) return "0:00";
  const total = Math.max(0, Math.floor(s));
  const m = Math.floor(total / 60);
  const sec = total % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

interface PlayerCommonProps {
  src: string;
  poster?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  playsInline?: boolean;
  controls?: "custom" | "native" | "none";
  captions?: CaptionTrack[];
  onPlay?: () => void;
  onPause?: () => void;
  onTimeUpdate?: (t: number) => void;
  onEnded?: () => void;
}

// ── VideoPlayer ──────────────────────────────────────────────

export interface VideoPlayerProps
  extends PlayerCommonProps,
    Omit<VideoHTMLAttributes<HTMLVideoElement>, keyof PlayerCommonProps | "controls"> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

function MediaShell({
  el,
  captions,
  className,
  style,
  children,
  controls = "custom",
  isAudio,
}: {
  el: MutableRefObject<HTMLMediaElement | null>;
  captions: CaptionTrack[];
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  controls?: "custom" | "native" | "none";
  isAudio?: boolean;
}) {
  const [playing, setPlayingInternal] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTimeInternal] = useState(0);
  const [volume, setVolumeInternal] = useState(1);
  const [muted, setMutedInternal] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [activeCaption, setActiveCaption] = useState<number | null>(null);

  const setPlaying = useCallback((p: boolean) => {
    const m = el.current;
    if (!m) return;
    if (p) m.play().catch(() => {});
    else m.pause();
  }, [el]);

  const setCurrentTime = useCallback(
    (n: number) => {
      const m = el.current;
      if (!m) return;
      m.currentTime = Math.max(0, Math.min(m.duration || 0, n));
    },
    [el]
  );

  const setVolume = useCallback(
    (n: number) => {
      const m = el.current;
      if (!m) return;
      m.volume = Math.max(0, Math.min(1, n));
      m.muted = n === 0;
    },
    [el]
  );

  const setMuted = useCallback(
    (mtd: boolean) => {
      const m = el.current;
      if (!m) return;
      m.muted = mtd;
    },
    [el]
  );

  const toggleFullscreen = useCallback(() => {
    const m = el.current as HTMLVideoElement | null;
    if (!m) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void m.requestFullscreen?.();
    }
  }, [el]);

  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  // Sync state from media element events.
  useEffect(() => {
    const m = el.current;
    if (!m) return;
    const onPlay = () => setPlayingInternal(true);
    const onPause = () => setPlayingInternal(false);
    const onTime = () => setCurrentTimeInternal(m.currentTime);
    const onDur = () => setDuration(m.duration || 0);
    const onVol = () => {
      setVolumeInternal(m.volume);
      setMutedInternal(m.muted);
    };
    m.addEventListener("play", onPlay);
    m.addEventListener("pause", onPause);
    m.addEventListener("timeupdate", onTime);
    m.addEventListener("loadedmetadata", onDur);
    m.addEventListener("volumechange", onVol);
    return () => {
      m.removeEventListener("play", onPlay);
      m.removeEventListener("pause", onPause);
      m.removeEventListener("timeupdate", onTime);
      m.removeEventListener("loadedmetadata", onDur);
      m.removeEventListener("volumechange", onVol);
    };
  }, [el]);

  const value = useMemo<MediaContextValue>(
    () => ({
      el,
      playing,
      setPlaying,
      duration,
      currentTime,
      setCurrentTime,
      volume,
      setVolume,
      muted,
      setMuted,
      fullscreen,
      toggleFullscreen,
      captions,
      activeCaption,
      setActiveCaption,
    }),
    [
      el,
      playing,
      setPlaying,
      duration,
      currentTime,
      setCurrentTime,
      volume,
      setVolume,
      muted,
      setMuted,
      fullscreen,
      toggleFullscreen,
      captions,
      activeCaption,
    ]
  );

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const m = el.current;
    if (!m) return;
    if (e.key === " ") {
      e.preventDefault();
      setPlaying(!playing);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      setCurrentTime(currentTime + 5);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setCurrentTime(currentTime - 5);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setVolume(volume + 0.1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setVolume(volume - 0.1);
    } else if (e.key === "m" || e.key === "M") {
      e.preventDefault();
      setMuted(!muted);
    } else if (!isAudio && (e.key === "f" || e.key === "F")) {
      e.preventDefault();
      toggleFullscreen();
    }
  };

  return (
    <MediaContext.Provider value={value}>
      <div
        className={cx("vf-media", isAudio && "vf-media--audio", className)}
        style={style}
        tabIndex={controls === "custom" ? 0 : undefined}
        onKeyDown={controls === "custom" ? handleKey : undefined}
        role={controls === "custom" ? "group" : undefined}
        aria-label={controls === "custom" ? (isAudio ? "Audio player" : "Video player") : undefined}
      >
        {children}
      </div>
    </MediaContext.Provider>
  );
}

const VideoPlayerRoot = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  function VideoPlayer(
    {
      src,
      poster,
      autoPlay,
      loop,
      muted,
      playsInline = true,
      controls = "custom",
      captions = [],
      onPlay,
      onPause,
      onTimeUpdate,
      onEnded,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const el = useRef<HTMLMediaElement | null>(null);
    const setRef = (node: HTMLVideoElement | null) => {
      el.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLVideoElement | null }).current = node;
    };
    return (
      <MediaShell
        el={el}
        captions={captions}
        className={className}
        style={style}
        controls={controls}
      >
        <video
          ref={setRef}
          src={src}
          poster={poster}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          playsInline={playsInline}
          controls={controls === "native"}
          onPlay={() => onPlay?.()}
          onPause={() => onPause?.()}
          onTimeUpdate={(e: SyntheticEvent<HTMLVideoElement>) =>
            onTimeUpdate?.(e.currentTarget.currentTime)
          }
          onEnded={() => onEnded?.()}
          className="vf-media__el"
          {...props}
        >
          {captions.map((c, i) => (
            <track
              key={i}
              kind="subtitles"
              src={c.src}
              srcLang={c.srcLang}
              label={c.label}
              default={c.default}
            />
          ))}
        </video>
        {controls === "custom" && (children ?? <DefaultControls />)}
      </MediaShell>
    );
  }
);
VideoPlayerRoot.displayName = "VideoPlayer";

// ── AudioPlayer ─────────────────────────────────────────────

export interface AudioPlayerProps
  extends PlayerCommonProps,
    Omit<HTMLAttributes<HTMLAudioElement>, keyof PlayerCommonProps | "controls"> {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export const AudioPlayer = forwardRef<HTMLAudioElement, AudioPlayerProps>(
  function AudioPlayer(
    {
      src,
      autoPlay,
      loop,
      muted,
      controls = "custom",
      onPlay,
      onPause,
      onTimeUpdate,
      onEnded,
      className,
      style,
      children,
      ...props
    },
    ref
  ) {
    const el = useRef<HTMLMediaElement | null>(null);
    const setRef = (node: HTMLAudioElement | null) => {
      el.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as { current: HTMLAudioElement | null }).current = node;
    };
    return (
      <MediaShell
        el={el}
        captions={[]}
        className={className}
        style={style}
        controls={controls}
        isAudio
      >
        <audio
          ref={setRef}
          src={src}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls === "native"}
          onPlay={() => onPlay?.()}
          onPause={() => onPause?.()}
          onTimeUpdate={(e: SyntheticEvent<HTMLAudioElement>) =>
            onTimeUpdate?.(e.currentTarget.currentTime)
          }
          onEnded={() => onEnded?.()}
          className="vf-media__el"
          {...props}
        />
        {controls === "custom" && (children ?? <DefaultControls audioOnly />)}
      </MediaShell>
    );
  }
);
AudioPlayer.displayName = "AudioPlayer";

// ── Compound subparts ────────────────────────────────────────

function PlayButton({
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useMediaCtx();
  return (
    <button
      type="button"
      className={cx("vf-media__btn", className)}
      aria-label={ctx.playing ? "Pause" : "Play"}
      onClick={() => ctx.setPlaying(!ctx.playing)}
      {...props}
    >
      {ctx.playing ? "❚❚" : "▶"}
    </button>
  );
}

function ProgressBar({
  className,
  ...props
}: HTMLAttributes<HTMLInputElement>) {
  const ctx = useMediaCtx();
  return (
    <input
      type="range"
      min={0}
      max={ctx.duration || 0}
      step={0.1}
      value={ctx.currentTime}
      onChange={(e) => ctx.setCurrentTime(Number(e.target.value))}
      aria-label="Seek"
      className={cx("vf-media__progress", className)}
      {...props}
    />
  );
}

function VolumeControl({
  className,
  ...props
}: HTMLAttributes<HTMLInputElement>) {
  const ctx = useMediaCtx();
  return (
    <input
      type="range"
      min={0}
      max={1}
      step={0.05}
      value={ctx.muted ? 0 : ctx.volume}
      onChange={(e) => ctx.setVolume(Number(e.target.value))}
      aria-label="Volume"
      className={cx("vf-media__volume", className)}
      {...props}
    />
  );
}

function TimeDisplay({
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  const ctx = useMediaCtx();
  return (
    <span
      className={cx("vf-media__time", className)}
      aria-label="Playback time"
      {...props}
    >
      {formatTime(ctx.currentTime)} / {formatTime(ctx.duration)}
    </span>
  );
}

function FullscreenButton({
  className,
  ...props
}: HTMLAttributes<HTMLButtonElement>) {
  const ctx = useMediaCtx();
  return (
    <button
      type="button"
      className={cx("vf-media__btn", className)}
      aria-label={ctx.fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      onClick={ctx.toggleFullscreen}
      {...props}
    >
      ⛶
    </button>
  );
}

function CaptionsMenu({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const ctx = useMediaCtx();
  if (ctx.captions.length === 0) return null;
  return (
    <div
      role="group"
      aria-label="Captions"
      className={cx("vf-media__captions", className)}
      {...props}
    >
      <button
        type="button"
        className={cx(
          "vf-media__btn",
          ctx.activeCaption === null && "vf-media__btn--active"
        )}
        onClick={() => ctx.setActiveCaption(null)}
      >
        Off
      </button>
      {ctx.captions.map((c, i) => (
        <button
          key={c.srcLang}
          type="button"
          className={cx(
            "vf-media__btn",
            ctx.activeCaption === i && "vf-media__btn--active"
          )}
          onClick={() => ctx.setActiveCaption(i)}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}

function DefaultControls({ audioOnly }: { audioOnly?: boolean }) {
  return (
    <div className="vf-media__controls">
      <PlayButton />
      <ProgressBar />
      <TimeDisplay />
      <VolumeControl />
      {!audioOnly && <FullscreenButton />}
      <CaptionsMenu />
    </div>
  );
}

export const VideoPlayer = Object.assign(VideoPlayerRoot, {
  Play: PlayButton,
  Progress: ProgressBar,
  Volume: VolumeControl,
  Time: TimeDisplay,
  Fullscreen: FullscreenButton,
  CaptionsMenu,
});

// ── VoiceWaveform ───────────────────────────────────────────

export interface VoiceWaveformProps extends HTMLAttributes<HTMLDivElement> {
  /** Pre-decoded amplitudes (0..1). When supplied, takes precedence. */
  audioData?: Float32Array | number[];
  /** Audio URL to fetch + decode. Falls back to a placeholder if unsupported. */
  audioUrl?: string;
  /** Playback progress 0..1. */
  progress?: number;
  onSeek?: (progress: number) => void;
  height?: number;
  bars?: number;
  barWidth?: number;
  /** Spacing between bars in px. */
  gap?: number;
  /** Bar color override. */
  color?: string;
  /** Bar color of the played portion. */
  activeColor?: string;
}

export const VoiceWaveform = forwardRef<HTMLDivElement, VoiceWaveformProps>(
  function VoiceWaveform(
    {
      audioData,
      audioUrl,
      progress = 0,
      onSeek,
      height = 36,
      bars = 48,
      barWidth = 2,
      gap = 2,
      color,
      activeColor,
      className,
      style,
      ...props
    },
    ref
  ) {
    const [decoded, setDecoded] = useState<number[] | null>(null);

    useEffect(() => {
      if (audioData) return;
      if (!audioUrl) return;
      let cancelled = false;
      const ctxClass = (window as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
        .AudioContext ?? (window as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!ctxClass) return;
      const audioContext = new ctxClass();
      fetch(audioUrl)
        .then((r) => r.arrayBuffer())
        .then((buf) => audioContext.decodeAudioData(buf))
        .then((decodedBuf) => {
          if (cancelled) return;
          const channel = decodedBuf.getChannelData(0);
          const samplesPerBar = Math.max(1, Math.floor(channel.length / bars));
          const out: number[] = [];
          for (let i = 0; i < bars; i++) {
            let sum = 0;
            const start = i * samplesPerBar;
            const end = start + samplesPerBar;
            for (let j = start; j < end; j++) sum += Math.abs(channel[j] ?? 0);
            out.push(sum / samplesPerBar);
          }
          const max = Math.max(...out, 0.0001);
          setDecoded(out.map((v) => v / max));
        })
        .catch(() => setDecoded(null));
      return () => {
        cancelled = true;
        void audioContext.close();
      };
    }, [audioUrl, audioData, bars]);

    const data: number[] = audioData
      ? Array.from(audioData).slice(0, bars)
      : decoded ?? Array.from({ length: bars }, (_, i) => 0.2 + 0.6 * Math.sin(i / 3) ** 2);

    const totalWidth = data.length * barWidth + (data.length - 1) * gap;
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!onSeek) return;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      onSeek(Math.max(0, Math.min(1, x / rect.width)));
    };

    const merged: CSSProperties = {
      height,
      cursor: onSeek ? "pointer" : undefined,
      ...style,
    };

    return (
      <div
        ref={ref}
        role={onSeek ? "slider" : "img"}
        aria-valuemin={onSeek ? 0 : undefined}
        aria-valuemax={onSeek ? 1 : undefined}
        aria-valuenow={onSeek ? progress : undefined}
        aria-label="Voice waveform"
        className={cx("vf-voice-waveform", className)}
        style={merged}
        onClick={handleClick}
        {...props}
      >
        <svg
          width="100%"
          height={height}
          viewBox={`0 0 ${totalWidth} ${height}`}
          preserveAspectRatio="none"
        >
          {data.map((v, i) => {
            const x = i * (barWidth + gap);
            const h = Math.max(1, v * height);
            const y = (height - h) / 2;
            const isPlayed = i / Math.max(1, data.length - 1) < progress;
            const fill = isPlayed
              ? activeColor ?? "var(--vf-accent, var(--vf-green))"
              : color ?? "var(--vf-text-3)";
            return (
              <rect
                key={i}
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill={fill}
              />
            );
          })}
        </svg>
      </div>
    );
  }
);
VoiceWaveform.displayName = "VoiceWaveform";

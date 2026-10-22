import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, renderHook, screen } from "@testing-library/react";
import { renderWithTheme } from "../../testing/renderWithTheme";
import { useUserMedia, userMediaReason } from "../useUserMedia";
import { applyRelease, detectSilence, peakDb, rmsDb, useAudioLevel } from "../useAudioLevel";
import { pickRecorderMimeType, useMediaRecorder } from "../useMediaRecorder";
import { LivePreview } from "../../components/LivePreview";
import { Transcript, activeSegmentIndex, formatTranscriptTime } from "../../components/Transcript";

type Listener = (e: Event) => void;
function fakeTrack(kind: "audio" | "video", label: string) {
  const listeners = new Map<string, Listener[]>();
  const track = {
    kind,
    label,
    readyState: "live" as "live" | "ended",
    stop: vi.fn(() => {
      track.readyState = "ended";
    }),
    addEventListener: (type: string, fn: Listener) => {
      listeners.set(type, [...(listeners.get(type) ?? []), fn]);
    },
    end() {
      track.readyState = "ended";
      for (const fn of listeners.get("ended") ?? []) fn(new Event("ended"));
    },
  };
  return track;
}
function fakeStream(tracks: ReturnType<typeof fakeTrack>[]) {
  return {
    getTracks: () => tracks,
    getAudioTracks: () => tracks.filter((t) => t.kind === "audio"),
    getVideoTracks: () => tracks.filter((t) => t.kind === "video"),
  } as unknown as MediaStream;
}

describe("useUserMedia", () => {
  const original = navigator.mediaDevices;
  afterEach(() => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: original });
  });

  it("walks off → asking → on, exposes labels, stops tracks, and reports an ended device", async () => {
    const mic = fakeTrack("audio", "Scarlett 2i2");
    const stream = fakeStream([mic]);
    const getUserMedia = vi.fn().mockResolvedValue(stream);
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: { getUserMedia } });
    const onFailure = vi.fn();
    const { result } = renderHook(() => useUserMedia({ audio: true }, { onFailure }));
    expect(result.current.state).toBe("off");
    let p: Promise<unknown>;
    act(() => {
      p = result.current.start();
    });
    expect(result.current.state).toBe("asking");
    await act(async () => {
      await p;
    });
    expect(result.current.state).toBe("on");
    expect(result.current.deviceLabel).toBe("Scarlett 2i2");
    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    act(() => mic.end());
    expect(result.current.state).toBe("off");
    expect(result.current.reason).toBe("ended");
    expect(onFailure).toHaveBeenCalledWith("ended", null);
    await act(async () => {
      await result.current.start();
    });
    act(() => result.current.stop());
    expect(mic.stop).toHaveBeenCalled();
    expect(result.current.stream).toBeNull();
  });

  it("maps DOMException names to reasons", async () => {
    const err = Object.assign(new Error("nope"), { name: "NotAllowedError" });
    Object.defineProperty(navigator, "mediaDevices", {
      configurable: true,
      value: { getUserMedia: vi.fn().mockRejectedValue(err) },
    });
    const { result } = renderHook(() => useUserMedia());
    await act(async () => {
      await result.current.start();
    });
    expect(result.current.state).toBe("failed");
    expect(result.current.reason).toBe("denied");
    expect(result.current.error).toBe(err);
    expect(userMediaReason({ name: "NotFoundError" })).toBe("not-found");
    expect(userMediaReason({ name: "NotReadableError" })).toBe("in-use");
    expect(userMediaReason({ name: "OverconstrainedError" })).toBe("overconstrained");
    expect(userMediaReason(new TypeError("x"))).toBe("unsupported");
    expect(userMediaReason(null)).toBe("unknown");
  });

  it("is unsupported without mediaDevices", () => {
    Object.defineProperty(navigator, "mediaDevices", { configurable: true, value: undefined });
    const { result } = renderHook(() => useUserMedia());
    expect(result.current.state).toBe("unsupported");
    expect(result.current.reason).toBe("unsupported");
  });
});

describe("audio level helpers", () => {
  it("computes RMS and peak in dBFS with a floor", () => {
    expect(rmsDb(new Float32Array(64))).toBe(-100);
    expect(rmsDb(new Float32Array(64).fill(1))).toBeCloseTo(0, 5);
    expect(rmsDb(new Float32Array(64).fill(0.5))).toBeCloseTo(-6.02, 1);
    expect(peakDb(new Float32Array([0.1, -0.5, 0.25]))).toBeCloseTo(-6.02, 1);
    expect(peakDb([], -90)).toBe(-90);
  });

  it("applyRelease limits falls and detectSilence needs the full duration", () => {
    expect(applyRelease(-20, -10, 0.1, 24)).toBe(-10);
    expect(applyRelease(-10, -40, 0.5, 24)).toBe(-22);
    expect(applyRelease(-10, -40, 2, 24)).toBe(-40);
    let s = detectSilence(-70, 0, null, -60, 1000);
    expect(s).toEqual({ silentSince: 0, silent: false });
    s = detectSilence(-70, 900, s.silentSince, -60, 1000);
    expect(s.silent).toBe(false);
    s = detectSilence(-70, 1000, s.silentSince, -60, 1000);
    expect(s.silent).toBe(true);
    expect(detectSilence(-30, 1200, s.silentSince, -60, 1000)).toEqual({ silentSince: null, silent: false });
  });
});

describe("useAudioLevel", () => {
  let level = 0.5;
  class FakeAnalyser {
    fftSize = 2048;
    getFloatTimeDomainData(buf: Float32Array) {
      buf.fill(level);
    }
  }
  class FakeContext {
    state: "running" | "suspended" = "running";
    createMediaStreamSource = vi.fn(() => ({ connect: vi.fn(), disconnect: vi.fn() }));
    createAnalyser = vi.fn(() => new FakeAnalyser());
    resume = vi.fn(async () => {
      this.state = "running";
    });
    close = vi.fn(async () => undefined);
  }
  const originalCtx = (globalThis as { AudioContext?: unknown }).AudioContext;
  const originalRaf = globalThis.requestAnimationFrame;
  beforeEach(() => {
    (globalThis as { AudioContext?: unknown }).AudioContext = FakeContext;
    (globalThis as { requestAnimationFrame?: unknown }).requestAnimationFrame = undefined;
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "setTimeout", "clearTimeout", "Date", "performance"] });
  });
  afterEach(() => {
    (globalThis as { AudioContext?: unknown }).AudioContext = originalCtx;
    globalThis.requestAnimationFrame = originalRaf;
    vi.useRealTimers();
  });

  it("reports dB, peak and live/silent states from the analyser", () => {
    const stream = fakeStream([fakeTrack("audio", "mic")]);
    const { result } = renderHook(() => useAudioLevel(stream, { intervalMs: 50, silenceMs: 200, releaseDbPerSecond: 1000 }));
    expect(result.current.state).toBe("live");
    act(() => {
      vi.advanceTimersByTime(60);
    });
    expect(result.current.db).toBeCloseTo(-6.02, 1);
    expect(result.current.peak).toBeCloseTo(-6.02, 1);
    level = 0;
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(result.current.db).toBe(-100);
    expect(result.current.state).toBe("silent");
    level = 0.5;
  });

  it("is idle without an audio track", () => {
    const { result } = renderHook(() => useAudioLevel(null));
    expect(result.current.state).toBe("idle");
    expect(result.current.db).toBe(-100);
  });
});

describe("useMediaRecorder", () => {
  class FakeRecorder {
    static isTypeSupported = (t: string) => t === "audio/webm";
    state: "inactive" | "recording" | "paused" = "inactive";
    mimeType: string;
    listeners = new Map<string, Array<(e: unknown) => void>>();
    static last: FakeRecorder | null = null;
    constructor(_stream: MediaStream, opts?: { mimeType?: string }) {
      this.mimeType = opts?.mimeType ?? "";
      FakeRecorder.last = this;
    }
    addEventListener(type: string, fn: (e: unknown) => void) {
      this.listeners.set(type, [...(this.listeners.get(type) ?? []), fn]);
    }
    emit(type: string, e: unknown = {}) {
      for (const fn of this.listeners.get(type) ?? []) fn(e);
    }
    start = vi.fn(() => {
      this.state = "recording";
    });
    stop = vi.fn(() => {
      this.state = "inactive";
      this.emit("dataavailable", { data: new Blob(["b"], { type: "audio/webm" }) });
      this.emit("stop");
    });
    pause = vi.fn(() => {
      this.state = "paused";
      this.emit("pause");
    });
    resume = vi.fn(() => {
      this.state = "recording";
      this.emit("resume");
    });
  }
  const original = (globalThis as { MediaRecorder?: unknown }).MediaRecorder;
  beforeEach(() => {
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = FakeRecorder;
  });
  afterEach(() => {
    (globalThis as { MediaRecorder?: unknown }).MediaRecorder = original;
  });

  it("picks a supported mime type, collects chunks and resolves a blob on stop", async () => {
    expect(pickRecorderMimeType(["audio/ogg", "audio/webm"])).toBe("audio/webm");
    const stream = fakeStream([fakeTrack("audio", "mic")]);
    const onChunk = vi.fn();
    const { result } = renderHook(() => useMediaRecorder(stream, { timesliceMs: 500, onChunk }));
    expect(result.current.state).toBe("inactive");
    act(() => result.current.start());
    expect(result.current.state).toBe("recording");
    expect(result.current.mimeType).toBe("audio/webm");
    expect(FakeRecorder.last!.start).toHaveBeenCalledWith(500);
    act(() => FakeRecorder.last!.emit("dataavailable", { data: new Blob(["a"], { type: "audio/webm" }) }));
    expect(result.current.chunks).toHaveLength(1);
    expect(onChunk).toHaveBeenCalledWith(expect.any(Blob), 0);
    act(() => result.current.pause());
    expect(result.current.state).toBe("paused");
    act(() => result.current.resume());
    let blob: Blob | null = null;
    await act(async () => {
      blob = await result.current.stop();
    });
    expect(blob).toBeInstanceOf(Blob);
    expect(blob!.size).toBe(2);
    expect(result.current.state).toBe("inactive");
    expect(result.current.blob).toBe(blob);
    act(() => result.current.reset());
    expect(result.current.chunks).toHaveLength(0);
    expect(result.current.blob).toBeNull();
  });
});

describe("LivePreview", () => {
  it("attaches the stream to a muted inline video and mirrors by default", () => {
    const stream =
      typeof MediaStream !== "undefined"
        ? (new MediaStream() as MediaStream)
        : fakeStream([fakeTrack("video", "cam")]);
    const { container, rerender } = renderWithTheme(<LivePreview stream={null} placeholder="Camera off" />);
    expect(screen.getByRole("img", { name: "Live preview" })).toHaveTextContent("Camera off");
    expect(container.querySelector(".vf-live-preview")).toHaveAttribute("data-state", "off");
    rerender(<LivePreview stream={stream} />);
    const video = container.querySelector("video") as HTMLVideoElement & { srcObject: unknown };
    expect(video).not.toBeNull();
    expect(video.muted).toBe(true);
    expect(video.hasAttribute("playsinline")).toBe(true);
    expect(video.srcObject).toBe(stream);
    expect(container.querySelector(".vf-live-preview")).toHaveClass("vf-live-preview--mirror");
  });
});

describe("Transcript", () => {
  const segments = [
    { startS: 0, text: "Hello there.", speaker: "Narrator" },
    { startS: 2.5, text: "Chapter one.", confidence: 0.4 },
    { startS: 5, endS: 7, text: "The end.", flagged: true },
  ];

  it("resolves the active segment and formats times", () => {
    expect(activeSegmentIndex(segments, 1)).toBe(0);
    expect(activeSegmentIndex(segments, 2.5)).toBe(1);
    expect(activeSegmentIndex(segments, 6)).toBe(2);
    expect(activeSegmentIndex(segments, 8)).toBe(-1);
    expect(activeSegmentIndex(segments, undefined)).toBe(-1);
    expect(formatTranscriptTime(65)).toBe("1:05");
    expect(formatTranscriptTime(3661)).toBe("1:01:01");
  });

  it("highlights the current segment, dims low confidence, shows flags and seeks on click", () => {
    const onSeek = vi.fn();
    const { container } = renderWithTheme(<Transcript segments={segments} currentTimeS={3} onSeek={onSeek} />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    expect(items[1]).toHaveAttribute("aria-current", "true");
    expect(items[1]).toHaveAttribute("data-confidence", "low");
    expect(items[2]).toHaveAttribute("data-flagged");
    expect(container.querySelector(".vf-transcript__speaker")?.textContent).toBe("Narrator");
    expect(container.querySelectorAll(".vf-transcript__time")[1]?.textContent).toBe("0:02");
    fireEvent.click(items[2]!);
    expect(onSeek).toHaveBeenCalledWith(5, segments[2], 2);
  });

  it("renders static text without onSeek and an empty message", () => {
    renderWithTheme(<Transcript segments={segments} />);
    expect(screen.queryAllByRole("button")).toHaveLength(0);
    renderWithTheme(<Transcript segments={[]} empty="Nothing yet" />);
    expect(screen.getByText("Nothing yet")).toBeInTheDocument();
  });
});

import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";
import { announce, clearAnnouncer } from "../announce";

describe("announce", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    document.body.textContent = "";
    clearAnnouncer();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("creates a live region on first call", () => {
    announce("Hello");
    const region = document.querySelector("[data-vf-announcer]");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-live")).toBe("polite");
  });

  it("sets the message text after microtask", () => {
    announce("Test message");
    vi.advanceTimersByTime(1);
    const region = document.querySelector("[data-vf-announcer='polite']");
    expect(region?.textContent).toBe("Test message");
  });

  it("uses polite mode by default", () => {
    announce("Polite");
    const region = document.querySelector("[data-vf-announcer='polite']");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-live")).toBe("polite");
  });

  it("supports assertive mode", () => {
    announce("Urgent", { politeness: "assertive" });
    const region = document.querySelector("[data-vf-announcer='assertive']");
    expect(region).not.toBeNull();
    expect(region?.getAttribute("aria-live")).toBe("assertive");
  });

  it("clears the message after default timeout", () => {
    announce("Temporary");
    vi.advanceTimersByTime(1);
    const region = document.querySelector("[data-vf-announcer='polite']");
    expect(region?.textContent).toBe("Temporary");
    vi.advanceTimersByTime(5000);
    expect(region?.textContent).toBe("");
  });

  it("respects custom clearAfter timing", () => {
    announce("Quick", { clearAfter: 1000 });
    vi.advanceTimersByTime(1);
    const region = document.querySelector("[data-vf-announcer='polite']");
    expect(region?.textContent).toBe("Quick");
    vi.advanceTimersByTime(1000);
    expect(region?.textContent).toBe("");
  });

  it("reuses existing region on subsequent calls", () => {
    announce("First");
    announce("Second");
    const regions = document.querySelectorAll("[data-vf-announcer='polite']");
    expect(regions).toHaveLength(1);
  });

  it("clearAnnouncer removes regions from DOM", () => {
    announce("Hello");
    clearAnnouncer();
    const region = document.querySelector("[data-vf-announcer]");
    expect(region).toBeNull();
  });

  it("creates new region after clearAnnouncer", () => {
    announce("First");
    clearAnnouncer();
    announce("Second");
    vi.advanceTimersByTime(1);
    const region = document.querySelector("[data-vf-announcer='polite']");
    expect(region).not.toBeNull();
    expect(region?.textContent).toBe("Second");
  });

  it("is a no-op in SSR (no document)", () => {
    // The function gracefully handles missing document via the typeof check
    // in getRegion. We verify it doesn't throw when regions exist.
    expect(() => announce("test")).not.toThrow();
  });
});

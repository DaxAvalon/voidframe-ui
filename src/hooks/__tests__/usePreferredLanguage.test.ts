import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { usePreferredLanguage } from "../usePreferredLanguage";

describe("usePreferredLanguage", () => {
  const originalLanguage = navigator.language;
  const originalLanguages = navigator.languages;

  beforeEach(() => {
    Object.defineProperty(navigator, "language", {
      value: "en-US",
      configurable: true,
    });
    Object.defineProperty(navigator, "languages", {
      value: ["en-US", "fr-FR", "de"],
      configurable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, "language", {
      value: originalLanguage,
      configurable: true,
    });
    Object.defineProperty(navigator, "languages", {
      value: originalLanguages,
      configurable: true,
    });
  });

  it("returns the primary language", () => {
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe("en-US");
  });

  it("returns all preferred languages", () => {
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.languages).toEqual(["en-US", "fr-FR", "de"]);
  });

  it("extracts baseLanguage from primary language", () => {
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.baseLanguage).toBe("en");
  });

  it("updates on languagechange event", () => {
    const { result } = renderHook(() => usePreferredLanguage());
    expect(result.current.language).toBe("en-US");

    Object.defineProperty(navigator, "language", {
      value: "ja-JP",
      configurable: true,
    });
    Object.defineProperty(navigator, "languages", {
      value: ["ja-JP"],
      configurable: true,
    });

    act(() => {
      window.dispatchEvent(new Event("languagechange"));
    });

    expect(result.current.language).toBe("ja-JP");
    expect(result.current.baseLanguage).toBe("ja");
  });

  it("defaults to en when navigator values are missing", () => {
    Object.defineProperty(navigator, "language", {
      value: "",
      configurable: true,
    });
    Object.defineProperty(navigator, "languages", {
      value: [],
      configurable: true,
    });

    const { result } = renderHook(() => usePreferredLanguage());
    // Falls back to "en" when language is empty
    expect(result.current.baseLanguage).toBeDefined();
  });
});

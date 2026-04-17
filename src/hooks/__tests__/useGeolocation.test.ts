import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useGeolocation } from "../useGeolocation";

const mockCoords = {
  latitude: 51.5,
  longitude: -0.1,
  altitude: null,
  accuracy: 10,
  heading: null,
  speed: null,
};

function createMockGeolocation() {
  return {
    getCurrentPosition: vi.fn((success: PositionCallback) => {
      success({
        coords: mockCoords,
        timestamp: 1000,
      } as GeolocationPosition);
    }),
    watchPosition: vi.fn((success: PositionCallback) => {
      success({
        coords: mockCoords,
        timestamp: 1000,
      } as GeolocationPosition);
      return 1;
    }),
    clearWatch: vi.fn(),
  };
}

describe("useGeolocation", () => {
  let mockGeo: ReturnType<typeof createMockGeolocation>;

  beforeEach(() => {
    mockGeo = createMockGeolocation();
    Object.defineProperty(navigator, "geolocation", {
      value: mockGeo,
      configurable: true,
      writable: true,
    });
  });

  afterEach(() => {
    // Restore a stub so cleanup callbacks don't crash
    Object.defineProperty(navigator, "geolocation", {
      value: {
        getCurrentPosition: vi.fn(),
        watchPosition: vi.fn(() => 0),
        clearWatch: vi.fn(),
      },
      configurable: true,
      writable: true,
    });
  });

  it("isSupported is true when geolocation available", () => {
    const { result } = renderHook(() =>
      useGeolocation({ immediate: false })
    );
    expect(result.current.isSupported).toBe(true);
  });

  it("loading during request", () => {
    mockGeo.getCurrentPosition = vi.fn();
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.loading).toBe(true);
  });

  it("coordinates on success", () => {
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.latitude).toBe(51.5);
    expect(result.current.longitude).toBe(-0.1);
    expect(result.current.accuracy).toBe(10);
    expect(result.current.timestamp).toBe(1000);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("error on denied", () => {
    const mockError = {
      code: 1,
      message: "User denied",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;
    mockGeo.getCurrentPosition = vi.fn(
      (_success: PositionCallback, error?: PositionErrorCallback) => {
        error?.(mockError);
      }
    );
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.error).toBe(mockError);
    expect(result.current.loading).toBe(false);
  });

  it("error on unavailable", () => {
    const mockError = {
      code: 2,
      message: "Position unavailable",
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    } as GeolocationPositionError;
    mockGeo.getCurrentPosition = vi.fn(
      (_success: PositionCallback, error?: PositionErrorCallback) => {
        error?.(mockError);
      }
    );
    const { result } = renderHook(() => useGeolocation());
    expect(result.current.error?.code).toBe(2);
  });

  it("watch enables continuous tracking", () => {
    const { result } = renderHook(() => useGeolocation({ watch: true }));
    expect(mockGeo.watchPosition).toHaveBeenCalled();
    expect(result.current.latitude).toBe(51.5);
  });

  it("watch updates with new positions", () => {
    let successCallback: PositionCallback | null = null;
    mockGeo.watchPosition = vi.fn((success: PositionCallback) => {
      successCallback = success;
      success({
        coords: mockCoords,
        timestamp: 1000,
      } as GeolocationPosition);
      return 1;
    });
    const { result } = renderHook(() => useGeolocation({ watch: true }));
    expect(result.current.latitude).toBe(51.5);

    act(() => {
      successCallback!({
        coords: { ...mockCoords, latitude: 40.7, longitude: -74.0 },
        timestamp: 2000,
      } as GeolocationPosition);
    });
    expect(result.current.latitude).toBe(40.7);
    expect(result.current.longitude).toBe(-74.0);
  });

  it("immediate=false skips initial request", () => {
    renderHook(() => useGeolocation({ immediate: false }));
    expect(mockGeo.getCurrentPosition).not.toHaveBeenCalled();
    expect(mockGeo.watchPosition).not.toHaveBeenCalled();
  });

  it("cleans up watch on unmount", () => {
    const { unmount } = renderHook(() =>
      useGeolocation({ watch: true })
    );
    unmount();
    expect(mockGeo.clearWatch).toHaveBeenCalledWith(1);
  });

  it("passes options through", () => {
    renderHook(() =>
      useGeolocation({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    );
    expect(mockGeo.getCurrentPosition).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function),
      expect.objectContaining({
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      })
    );
  });

  it("SSR safe with isSupported false", () => {
    Object.defineProperty(navigator, "geolocation", {
      value: undefined,
      configurable: true,
      writable: true,
    });
    const { result } = renderHook(() =>
      useGeolocation({ immediate: false })
    );
    expect(result.current.isSupported).toBe(false);
    expect(result.current.loading).toBe(false);
  });
});

"use client";

import { useEffect, useRef, useState } from "react";

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
  watch?: boolean;
  immediate?: boolean;
}

const defaultState: GeolocationState = {
  loading: false,
  latitude: null,
  longitude: null,
  altitude: null,
  accuracy: null,
  heading: null,
  speed: null,
  timestamp: null,
  error: null,
  isSupported: false,
};

export function useGeolocation(
  options: UseGeolocationOptions = {}
): GeolocationState {
  const { watch = false, immediate = true, ...positionOptions } = options;
  const optionsRef = useRef(positionOptions);
  optionsRef.current = positionOptions;

  const [state, setState] = useState<GeolocationState>(() => {
    const isSupported =
      typeof navigator !== "undefined" && !!navigator.geolocation;
    return { ...defaultState, isSupported };
  });

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    let watchId: number | null = null;

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        loading: false,
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        altitude: position.coords.altitude,
        accuracy: position.coords.accuracy,
        heading: position.coords.heading,
        speed: position.coords.speed,
        timestamp: position.timestamp,
        error: null,
        isSupported: true,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      setState((prev) => ({
        ...prev,
        loading: false,
        error,
      }));
    };

    if (watch) {
      setState((prev) => ({ ...prev, loading: true }));
      watchId = navigator.geolocation.watchPosition(
        onSuccess,
        onError,
        optionsRef.current
      );
    } else if (immediate) {
      setState((prev) => ({ ...prev, loading: true }));
      navigator.geolocation.getCurrentPosition(
        onSuccess,
        onError,
        optionsRef.current
      );
    }

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watch, immediate]);

  return state;
}

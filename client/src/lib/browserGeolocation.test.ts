import { afterEach, describe, expect, test, vi } from "vitest";
import {
  readGeolocationPermission,
  requestBrowserGeolocation,
} from "./browserGeolocation";

const originalNavigator = globalThis.navigator;

afterEach(() => {
  vi.unstubAllGlobals();
  if (originalNavigator) {
    vi.stubGlobal("navigator", originalNavigator);
  }
});

function stubNavigator(value: unknown) {
  vi.stubGlobal("navigator", value);
}

describe("readGeolocationPermission", () => {
  test("ohne permissions API → unknown (kein Überraschungs-Prompt)", async () => {
    stubNavigator({});
    expect(await readGeolocationPermission()).toBe("unknown");
  });

  test("query wirft → unknown", async () => {
    stubNavigator({
      permissions: {
        query: vi.fn().mockRejectedValue(new Error("not supported")),
      },
    });
    expect(await readGeolocationPermission()).toBe("unknown");
  });

  test("gibt granted / prompt / denied durch", async () => {
    stubNavigator({
      permissions: {
        query: vi.fn().mockResolvedValue({ state: "granted" }),
      },
    });
    expect(await readGeolocationPermission()).toBe("granted");

    stubNavigator({
      permissions: {
        query: vi.fn().mockResolvedValue({ state: "denied" }),
      },
    });
    expect(await readGeolocationPermission()).toBe("denied");
  });
});

describe("requestBrowserGeolocation", () => {
  test("kein navigator.geolocation → unsupported", async () => {
    stubNavigator({});
    expect(await requestBrowserGeolocation()).toEqual({
      status: "unsupported",
    });
  });

  test("Permission denied → denied, Flow darf weiterlaufen", async () => {
    stubNavigator({
      geolocation: {
        getCurrentPosition: (
          _ok: PositionCallback,
          err: PositionErrorCallback
        ) => {
          err({ code: 1, message: "denied" } as GeolocationPositionError);
        },
      },
    });
    expect(await requestBrowserGeolocation()).toEqual({ status: "denied" });
  });

  test("ohne Koordinaten / POSITION_UNAVAILABLE → unavailable", async () => {
    stubNavigator({
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) => {
          ok({
            coords: { latitude: NaN, longitude: 7 } as GeolocationCoordinates,
            timestamp: 0,
          } as GeolocationPosition);
        },
      },
    });
    expect(await requestBrowserGeolocation()).toEqual({
      status: "unavailable",
    });

    stubNavigator({
      geolocation: {
        getCurrentPosition: (
          _ok: PositionCallback,
          err: PositionErrorCallback
        ) => {
          err({
            code: 2,
            message: "unavailable",
          } as GeolocationPositionError);
        },
      },
    });
    expect(await requestBrowserGeolocation()).toEqual({
      status: "unavailable",
    });
  });

  test("Timeout → timeout", async () => {
    stubNavigator({
      geolocation: {
        getCurrentPosition: (
          _ok: PositionCallback,
          err: PositionErrorCallback
        ) => {
          err({ code: 3, message: "timeout" } as GeolocationPositionError);
        },
      },
    });
    expect(await requestBrowserGeolocation()).toEqual({ status: "timeout" });
  });

  test("liefert lat/lng bei Erfolg", async () => {
    stubNavigator({
      geolocation: {
        getCurrentPosition: (ok: PositionCallback) => {
          ok({
            coords: {
              latitude: 51.5136,
              longitude: 7.4653,
            } as GeolocationCoordinates,
            timestamp: 0,
          } as GeolocationPosition);
        },
      },
    });
    expect(await requestBrowserGeolocation()).toEqual({
      status: "granted",
      coords: { lat: 51.5136, lng: 7.4653 },
    });
  });
});

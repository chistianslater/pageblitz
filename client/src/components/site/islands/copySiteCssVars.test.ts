import { afterEach, describe, expect, test } from "vitest";
import { copySiteCssVars } from "./copySiteCssVars";

describe("copySiteCssVars", () => {
  afterEach(() => {
    // @ts-expect-error – Test-Stub wieder entfernen, node-Umgebung hat kein document
    delete globalThis.document;
    // @ts-expect-error
    delete globalThis.getComputedStyle;
  });

  test("ohne document (SSR über renderToStaticMarkup) leeres Objekt", () => {
    expect(copySiteCssVars()).toEqual({});
  });

  test("ohne .pb-site leeres Objekt", () => {
    // @ts-expect-error – minimaler document-Stub
    globalThis.document = { querySelector: () => null };
    expect(copySiteCssVars()).toEqual({});
  });

  test("kopiert Inline --pb-* von .pb-site", () => {
    const store: Record<string, string> = {
      "--pb-font-body": '"Source Sans 3", sans-serif',
      "--pb-ink": "#191919",
      "color": "#000",
    };
    const names = Object.keys(store);
    const fakeStyle = {
      length: names.length,
      item: (i: number) => names[i] ?? "",
      getPropertyValue: (name: string) => store[name] ?? "",
    };
    // @ts-expect-error – minimaler document-Stub
    globalThis.document = {
      querySelector: (sel: string) =>
        sel === ".pb-site" ? { style: fakeStyle } : null,
    };
    expect(copySiteCssVars()).toEqual({
      "--pb-font-body": '"Source Sans 3", sans-serif',
      "--pb-ink": "#191919",
    });
  });

  test("fällt auf getComputedStyle zurück, wenn die Inline-Liste leer ist", () => {
    const computed: Record<string, string> = {
      "--pb-font-body": "Inter, sans-serif",
      "--pb-accent": "#C45C26",
    };
    const fakeStyle = {
      length: 0,
      item: () => "",
      getPropertyValue: () => "",
    };
    // @ts-expect-error
    globalThis.document = {
      querySelector: (sel: string) =>
        sel === ".pb-site" ? { style: fakeStyle } : null,
    };
    // @ts-expect-error
    globalThis.getComputedStyle = () => ({
      getPropertyValue: (name: string) => computed[name] ?? "",
    });
    expect(copySiteCssVars()["--pb-font-body"]).toBe("Inter, sans-serif");
    expect(copySiteCssVars()["--pb-accent"]).toBe("#C45C26");
  });
});

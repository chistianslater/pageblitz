import { describe, expect, test } from "vitest";
import { HERO_FILM } from "./meta";

describe("Hero Remotion-Film", () => {
  test("16:10, 30 fps, nahtloser Loop über 13 Sekunden", () => {
    expect(HERO_FILM.width / HERO_FILM.height).toBeCloseTo(16 / 10);
    expect(HERO_FILM.fps).toBe(30);
    expect(HERO_FILM.durationInFrames).toBe(390);
    expect(HERO_FILM.durationInFrames / HERO_FILM.fps).toBeCloseTo(13);
  });
});

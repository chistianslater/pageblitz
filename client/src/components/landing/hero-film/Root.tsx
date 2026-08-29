import { Composition } from "remotion";
import { HeroSiteBuild } from "./HeroSiteBuild";
import { HERO_FILM } from "./meta";

export function RemotionRoot() {
  return (
    <Composition
      id={HERO_FILM.id}
      component={HeroSiteBuild}
      durationInFrames={HERO_FILM.durationInFrames}
      fps={HERO_FILM.fps}
      width={HERO_FILM.width}
      height={HERO_FILM.height}
    />
  );
}

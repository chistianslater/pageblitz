import { useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { HeroSiteBuild } from "./HeroSiteBuild";
import { HERO_FILM } from "./meta";

/**
 * Remotion-Player nur für die Landing-Hero-Bühne. Wird von HeroBuild per
 * React.lazy() geladen, damit remotion/@remotion/player nicht im ersten
 * Paint von "/" landen.
 */
export default function HeroFilmPlayer() {
  const playerRef = useRef<PlayerRef>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) playerRef.current?.play();
        else playerRef.current?.pause();
      },
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={boxRef} className="lpb-player">
      <Player
        ref={playerRef}
        component={HeroSiteBuild}
        compositionWidth={HERO_FILM.width}
        compositionHeight={HERO_FILM.height}
        durationInFrames={HERO_FILM.durationInFrames}
        fps={HERO_FILM.fps}
        loop
        autoPlay
        controls={false}
        clickToPlay={false}
        spaceKeyToPlayOrPause={false}
        doubleClickToFullscreen={false}
        acknowledgeRemotionLicense
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

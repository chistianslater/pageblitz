import {
  AbsoluteFill,
  CanvasImage,
  Easing,
  Interactive,
  Sequence,
  interpolate,
  useCurrentFrame,
} from "remotion";
import {
  BETON,
  BODY,
  DISPLAY,
  FUGE,
  HERO_FILM,
  KOHLE,
  MINT,
  MONO,
  PUTZ,
  SIGNAL,
  STAUB,
  VOLT,
} from "./meta";

const FINAL_SRC = "/pack-previews/werkbank.webp";
const HERO_SRC = "/demo/werkbank-hero.webp";

const SPRING = { damping: 200 } as const;
const PUNCH = { damping: 12, mass: 0.7 } as const;
const clamp = {
  extrapolateLeft: "clamp" as const,
  extrapolateRight: "clamp" as const,
};

function FinalShot({
  mode,
}: {
  mode: "open" | "close";
}) {
  const frame = useCurrentFrame();
  const fade =
    mode === "open"
      ? 1
      : interpolate(frame, [0, 28], [0, 1], {
          ...clamp,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
        });
  const wipe = interpolate(frame, [0, 32], [100, 0], {
    ...clamp,
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      name="FinalShot"
      style={{
        opacity: fade,
        clipPath: mode === "close" ? `inset(0 ${wipe}% 0 0)` : undefined,
      }}
    >
      <CanvasImage
        name="LiveSite"
        src={FINAL_SRC}
        fit="cover"
        width={HERO_FILM.width}
        height={HERO_FILM.height}
        style={{
          width: "100%",
          height: "100%",
          objectPosition: "top",
        }}
      />
      {mode === "close" ? (
        <Interactive.Div
          name="WipeEdge"
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 8,
            left: interpolate(frame, [0, 32], [0, 100], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }) + "%",
            backgroundColor: SIGNAL,
            opacity: interpolate(frame, [0, 24, 32], [1, 1, 0], clamp),
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
}

function Rewind() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill name="Rewind" style={{ backgroundColor: KOHLE }}>
      <CanvasImage
        name="RewindSite"
        src={FINAL_SRC}
        fit="cover"
        width={HERO_FILM.width}
        height={HERO_FILM.height}
        style={{
          width: "100%",
          height: "100%",
          opacity: interpolate(frame, [0, 8, 22], [1, 1, 0], clamp),
          scale: interpolate(frame, [0, 10, 22], [1, 1.12, 0.92], {
            ...clamp,
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            output: "perceptual-scale",
          }),
          filter: `saturate(${interpolate(frame, [0, 16], [1, 0.2], clamp)}) contrast(${interpolate(frame, [0, 16], [1, 1.4], clamp)})`,
        }}
      />
      {[0, 1, 2, 3, 4, 5, 6].map(i => (
        <Interactive.Div
          key={i}
          name={`GlitchSlice-${i}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${(i / 7) * 100}%`,
            height: `${100 / 7}%`,
            overflow: "hidden",
            opacity: interpolate(frame, [4, 8, 18], [0, 1, 0], clamp),
            translate: interpolate(
              frame,
              [4, 18],
              ["0px 0px", `${i % 2 === 0 ? 48 : -56}px 0px`],
              { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }
            ),
          }}
        >
          <CanvasImage
            src={FINAL_SRC}
            fit="cover"
            width={HERO_FILM.width}
            height={HERO_FILM.height}
            style={{
              position: "absolute",
              top: `${-(i / 7) * HERO_FILM.height}px`,
              width: "100%",
              height: `${HERO_FILM.height}px`,
              filter: i % 2 === 0 ? "hue-rotate(-20deg)" : "hue-rotate(18deg)",
            }}
          />
        </Interactive.Div>
      ))}
      <Interactive.Div
        name="VoltFlash"
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: VOLT,
          opacity: interpolate(frame, [6, 9, 14], [0, 0.55, 0], clamp),
        }}
      />
      <Interactive.Div
        name="Scan"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: SIGNAL,
          top: interpolate(frame, [0, 22], ["0%", "100%"], {
            ...clamp,
            easing: Easing.linear,
          }),
          opacity: interpolate(frame, [0, 4, 20], [0, 1, 0], clamp),
        }}
      />
    </AbsoluteFill>
  );
}

function BlueprintGrid() {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 12, 70, 90], [0, 0.22, 0.12, 0], clamp);
  return (
    <AbsoluteFill name="Grid" style={{ pointerEvents: "none" }}>
      {Array.from({ length: 12 }, (_, i) => (
        <Interactive.Div
          key={`col-${i}`}
          name={`Col-${i + 1}`}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: `${(i / 12) * 100}%`,
            width: 1,
            backgroundColor: FUGE,
            opacity,
            scale: interpolate(frame, [0, 16], [0.2, 1], {
              ...clamp,
              easing: Easing.spring(SPRING),
              output: "perceptual-scale",
            }),
          }}
        />
      ))}
      {Array.from({ length: 6 }, (_, i) => (
        <Interactive.Div
          key={`row-${i}`}
          name={`Row-${i + 1}`}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: `${((i + 1) / 7) * 100}%`,
            height: 1,
            backgroundColor: FUGE,
            opacity,
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

function StatusChip() {
  const frame = useCurrentFrame();
  const labels = ["LAYOUT", "COPY", "PHOTO", "LIVE"] as const;
  const idx = Math.min(
    labels.length - 1,
    Math.max(
      0,
      Math.floor(interpolate(frame, [0, 40, 90, 140, 200], [0, 1, 2, 3, 3], clamp))
    )
  );
  const live = idx === 3;
  return (
    <Interactive.Div
      name="Status"
      style={{
        position: "absolute",
        top: 28,
        right: 28,
        padding: "10px 18px",
        borderRadius: 64,
        backgroundColor: live ? MINT : KOHLE,
        color: live ? "#000" : PUTZ,
        fontFamily: BODY,
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.14em",
        zIndex: 8,
        opacity: interpolate(frame, [0, 10], [0, 1], clamp),
        translate: interpolate(frame, [0, 14], ["12px -8px", "0px 0px"], {
          ...clamp,
          easing: Easing.spring(SPRING),
        }),
      }}
    >
      {labels[idx]}
    </Interactive.Div>
  );
}

function Cursor() {
  const frame = useCurrentFrame();
  const x = interpolate(
    frame,
    [0, 18, 48, 90, 130, 170],
    [920, 140, 220, 280, 980, 340],
    { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }
  );
  const y = interpolate(
    frame,
    [0, 18, 48, 90, 130, 170],
    [80, 70, 210, 360, 180, 430],
    { ...clamp, easing: Easing.bezier(0.16, 1, 0.3, 1) }
  );
  const click = interpolate(
    frame,
    [16, 20, 24, 86, 90, 94, 126, 130, 134],
    [1, 0.72, 1, 1, 0.7, 1, 1, 0.7, 1],
    { ...clamp, output: "perceptual-scale" }
  );
  return (
    <Interactive.Div
      name="Cursor"
      style={{
        position: "absolute",
        width: 22,
        height: 22,
        borderRadius: 99,
        border: `2px solid ${PUTZ}`,
        backgroundColor: SIGNAL,
        zIndex: 12,
        left: x,
        top: y,
        scale: interpolate(frame, [0, 10, 190, 210], [0, click, click, 0], {
          ...clamp,
          easing: Easing.spring(SPRING),
          output: "perceptual-scale",
        }),
        opacity: interpolate(frame, [0, 8, 190, 210], [0, 1, 1, 0], clamp),
        boxShadow: `0 0 0 6px rgba(255,77,0,0.28)`,
      }}
    />
  );
}

function TypeLine({
  name,
  text,
  top,
  delay,
  accent,
  outline,
}: {
  name: string;
  text: string;
  top: number;
  delay: number;
  accent?: boolean;
  outline?: boolean;
}) {
  const frame = useCurrentFrame();
  const local = frame - delay;
  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left: 96,
        top,
        fontFamily: DISPLAY,
        fontSize: 64,
        lineHeight: 0.84,
        letterSpacing: "-0.04em",
        textTransform: "uppercase",
        color: accent ? SIGNAL : outline ? "transparent" : PUTZ,
        WebkitTextStroke: outline ? `2px ${PUTZ}` : undefined,
        opacity: interpolate(local, [0, 8], [0, 1], clamp),
        translate: interpolate(local, [0, 16], ["0px 36px", "0px 0px"], {
          ...clamp,
          easing: Easing.spring(accent ? PUNCH : SPRING),
        }),
        scale: interpolate(local, [0, 16], [0.72, 1], {
          ...clamp,
          easing: Easing.spring(accent ? PUNCH : SPRING),
          output: "perceptual-scale",
        }),
      }}
    >
      {text}
    </Interactive.Div>
  );
}

function ServiceCard({
  idx,
  title,
  delay,
}: {
  idx: string;
  title: string;
  delay: number;
}) {
  const frame = useCurrentFrame();
  const local = frame - delay;
  return (
    <Interactive.Div
      name={`Card-${idx}`}
      style={{
        flex: 1,
        backgroundColor: PUTZ,
        borderTop: `4px solid ${SIGNAL}`,
        padding: "16px 14px 18px",
        opacity: interpolate(local, [0, 8], [0, 1], clamp),
        translate: interpolate(local, [0, 16], ["0px 28px", "0px 0px"], {
          ...clamp,
          easing: Easing.spring(SPRING),
        }),
        scale: interpolate(local, [0, 16], [0.88, 1], {
          ...clamp,
          easing: Easing.spring(SPRING),
          output: "perceptual-scale",
        }),
      }}
    >
      <Interactive.Div
        name={`CardIdx-${idx}`}
        style={{
          fontFamily: DISPLAY,
          fontSize: 28,
          lineHeight: 0.8,
          color: SIGNAL,
          letterSpacing: "-0.06em",
        }}
      >
        {idx}
      </Interactive.Div>
      <Interactive.Div
        name={`CardTitle-${idx}`}
        style={{
          marginTop: 10,
          fontFamily: DISPLAY,
          fontSize: 16,
          textTransform: "uppercase",
          letterSpacing: "-0.02em",
          color: KOHLE,
        }}
      >
        {title}
      </Interactive.Div>
    </Interactive.Div>
  );
}

function SiteBuild() {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      name="Site"
      style={{
        backgroundColor: BETON,
        scale: interpolate(frame, [170, 220], [1, 1.04], {
          ...clamp,
          easing: Easing.bezier(0.16, 1, 0.3, 1),
          output: "perceptual-scale",
        }),
      }}
    >
      <BlueprintGrid />
      <Interactive.Div
        name="Rail"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          width: 52,
          backgroundColor: KOHLE,
          zIndex: 4,
          translate: interpolate(frame, [4, 22], ["-52px 0px", "0px 0px"], {
            ...clamp,
            easing: Easing.spring(SPRING),
          }),
        }}
      >
        <Interactive.Div
          name="RailLabel"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: PUTZ,
            fontFamily: MONO,
            fontSize: 11,
            letterSpacing: "0.32em",
            textTransform: "uppercase",
            writingMode: "vertical-rl",
            rotate: "180deg",
          }}
        >
          Schreinerei · Dortmund
        </Interactive.Div>
      </Interactive.Div>

      <Interactive.Div
        name="Nav"
        style={{
          position: "absolute",
          top: 0,
          left: 52,
          right: 0,
          height: 64,
          display: "flex",
          alignItems: "center",
          padding: "0 36px",
          backgroundColor: "rgba(232,230,225,0.92)",
          borderBottom: `2px solid ${KOHLE}`,
          zIndex: 5,
          translate: interpolate(frame, [10, 28], ["0px -64px", "0px 0px"], {
            ...clamp,
            easing: Easing.spring(SPRING),
          }),
        }}
      >
        <Interactive.Div
          name="Logo"
          style={{
            fontFamily: DISPLAY,
            fontSize: 20,
            letterSpacing: "-0.03em",
            textTransform: "uppercase",
            color: KOHLE,
          }}
        >
          Brandt.
        </Interactive.Div>
        {(["Arbeit", "Werkstatt", "Kontakt"] as const).map((label, i) => (
          <Interactive.Div
            key={label}
            name={`Nav-${label}`}
            style={{
              marginLeft: i === 0 ? "auto" : 22,
              fontFamily: MONO,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: KOHLE,
              textDecoration: i === 0 ? "underline" : "none",
              textDecorationColor: SIGNAL,
              textUnderlineOffset: 6,
              opacity: interpolate(frame, [16 + i * 4, 26 + i * 4], [0, 1], clamp),
            }}
          >
            {label}
          </Interactive.Div>
        ))}
      </Interactive.Div>

      <Interactive.Div
        name="HeroCopy"
        style={{
          position: "absolute",
          top: 88,
          left: 52,
          right: "38%",
          bottom: 210,
          backgroundColor: KOHLE,
        }}
      >
        <TypeLine name="H1a" text="Maßarbeit" top={48} delay={32} />
        <TypeLine name="H1b" text="aus Holz." top={118} delay={46} outline />
        <TypeLine name="H1c" text="Punkt." top={188} delay={62} accent />
        <Interactive.Div
          name="Sub"
          style={{
            position: "absolute",
            left: 96,
            top: 278,
            maxWidth: 420,
            color: STAUB,
            fontFamily: BODY,
            fontSize: 16,
            lineHeight: 1.45,
            opacity: interpolate(frame, [78, 92], [0, 1], clamp),
            translate: interpolate(frame, [78, 96], ["0px 16px", "0px 0px"], {
              ...clamp,
              easing: Easing.spring(SPRING),
            }),
          }}
        >
          Schreinerei in Dortmund. Unikate aus Massivholz — gebaut wie ein
          Werkstück, nicht wie eine Website.
        </Interactive.Div>
        <Interactive.Div
          name="Cta"
          style={{
            position: "absolute",
            left: 96,
            top: 360,
            padding: "16px 26px",
            backgroundColor: SIGNAL,
            color: KOHLE,
            fontFamily: MONO,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            opacity: interpolate(frame, [88, 100], [0, 1], clamp),
            scale: interpolate(frame, [88, 108], [0.8, 1], {
              ...clamp,
              easing: Easing.spring(PUNCH),
              output: "perceptual-scale",
            }),
          }}
        >
          Projekt anfragen
        </Interactive.Div>
      </Interactive.Div>

      <Interactive.Div
        name="PhotoClip"
        style={{
          position: "absolute",
          top: 64,
          right: 0,
          width: "42%",
          height: "58%",
          overflow: "hidden",
          clipPath: "polygon(18% 0, 100% 0, 100% 100%, 0 100%)",
          borderLeft: `10px solid ${SIGNAL}`,
          translate: interpolate(frame, [96, 124], ["48% 0px", "0px 0px"], {
            ...clamp,
            easing: Easing.spring(SPRING),
          }),
          opacity: interpolate(frame, [96, 110], [0, 1], clamp),
        }}
      >
        <CanvasImage
          name="HeroPhoto"
          src={HERO_SRC}
          fit="cover"
          width={640}
          height={520}
          style={{
            width: "100%",
            height: "100%",
            filter: "saturate(0.72) contrast(1.08)",
            scale: interpolate(frame, [96, 180], [1.16, 1], {
              ...clamp,
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              output: "perceptual-scale",
            }),
          }}
        />
      </Interactive.Div>

      <Interactive.Div
        name="Marquee"
        style={{
          position: "absolute",
          left: 36,
          right: -20,
          top: 492,
          padding: "14px 0",
          backgroundColor: KOHLE,
          color: PUTZ,
          rotate: "-1.5deg",
          overflow: "hidden",
          zIndex: 6,
          opacity: interpolate(frame, [118, 132], [0, 1], clamp),
          translate: interpolate(frame, [118, 138], ["0px 24px", "0px 0px"], {
            ...clamp,
            easing: Easing.spring(SPRING),
          }),
        }}
      >
        <Interactive.Div
          name="MarqueeTrack"
          style={{
            fontFamily: DISPLAY,
            fontSize: 18,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            whiteSpace: "nowrap",
            translate: interpolate(
              frame,
              [118, 260],
              ["0px 0px", "-520px 0px"],
              { easing: Easing.linear }
            ),
          }}
        >
          Massivholz · Furnier · Beschlag · Unikat ·{" "}
          <span style={{ color: SIGNAL }}>Punkt.</span> · Massivholz · Furnier ·
          Beschlag · Unikat · <span style={{ color: SIGNAL }}>Punkt.</span>
        </Interactive.Div>
      </Interactive.Div>

      <Interactive.Div
        name="Cards"
        style={{
          position: "absolute",
          left: 72,
          right: 28,
          bottom: 18,
          height: 118,
          display: "flex",
          gap: 12,
        }}
      >
        <ServiceCard idx="01" title="Möbel" delay={128} />
        <ServiceCard idx="02" title="Türen" delay={136} />
        <ServiceCard idx="03" title="Einbauten" delay={144} />
        <ServiceCard idx="04" title="Restauration" delay={152} />
      </Interactive.Div>

      <StatusChip />
      <Cursor />
    </AbsoluteFill>
  );
}

/**
 * Cinematic loop: fertige Website → Glitch-Rewind → Werkbank baut sich
 * auf (Rail, Nav, stacked Display, Diagonal-Foto, Marquee, Index-Karten)
 * → Wipe auf den echten Screenshot → Hold. Frame 0 und Frame Ende sind
 * derselbe Live-Shot, damit Player-Loop und LCP-Poster zusammenpassen.
 */
export function HeroSiteBuild() {
  return (
    <AbsoluteFill
      name="HeroSiteBuild"
      style={{
        backgroundColor: KOHLE,
        fontFamily: BODY,
        overflow: "hidden",
      }}
    >
      <Sequence name="OpenHold" durationInFrames={46} layout="absolute-fill">
        <FinalShot mode="open" />
      </Sequence>
      <Sequence
        name="Rewind"
        from={40}
        durationInFrames={26}
        layout="absolute-fill"
      >
        <Rewind />
      </Sequence>
      <Sequence
        name="Build"
        from={56}
        durationInFrames={268}
        layout="absolute-fill"
      >
        <SiteBuild />
      </Sequence>
      <Sequence
        name="Reveal"
        from={300}
        durationInFrames={90}
        layout="absolute-fill"
      >
        <FinalShot mode="close" />
      </Sequence>
    </AbsoluteFill>
  );
}

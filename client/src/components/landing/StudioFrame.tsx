import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const STAGE_PACKS: ReadonlyArray<{ id: string; name: string }> = [
  { id: "werkbank", name: "Werkbank" },
  { id: "patina", name: "Patina" },
  { id: "kanzlei", name: "Kanzlei" },
  { id: "gusto", name: "Gusto" },
];

/**
 * Stilisierter Studio-Rahmen für den Hero: links die echte Checkliste des
 * Studios (Titel/Hinweise wie `shared/onboardingV2/checklist.ts`, Reihenfolge
 * `CHECKLIST_ORDER`), rechts der Device-Rahmen mit einer Pack-Vorschau.
 *
 * Einzige erklärende Bewegung der Landingpage: die Checkliste füllt sich
 * Punkt für Punkt, am Ende erscheint „Live". Bei `prefers-reduced-motion`
 * bleibt der Endzustand stehen (kein Timer).
 */
const STEPS = [
  {
    title: "Stil",
    hint: "Passt der Look? Zwischen passenden Stilen wechseln.",
  },
  { title: "Fotos", hint: "Eigene Fotos, Google-Fotos oder Stockbilder." },
  { title: "Texte", hint: "Überschriften und Über-uns prüfen." },
  { title: "Angebot", hint: "Leistungen, Speisekarte oder Preisliste." },
  {
    title: "Rechtliches",
    hint: "Impressum-Angaben — Pflicht vorm Freischalten.",
  },
  { title: "Extras", hint: "Kontaktformular, Galerie, Buchung & mehr." },
] as const;

const STEP_MS = 2200;
const HOLD_MS = 4200;

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function StudioFrame() {
  const reduced = usePrefersReducedMotion();
  // Anzahl erledigter Punkte (0..6); 6 = alles erledigt → „Live".
  const [done, setDone] = useState(0);

  useEffect(() => {
    if (reduced) {
      setDone(STEPS.length);
      return;
    }
    let timer: ReturnType<typeof setTimeout>;
    const tick = (n: number) => {
      setDone(n);
      const next = n >= STEPS.length ? 0 : n + 1;
      timer = setTimeout(
        () => tick(next),
        n >= STEPS.length ? HOLD_MS : STEP_MS
      );
    };
    timer = setTimeout(() => tick(1), 900);
    return () => clearTimeout(timer);
  }, [reduced]);

  const isLive = done >= STEPS.length;

  return (
    <div
      className="grid overflow-hidden rounded-[14px] border border-lp-line bg-lp-surface lg:grid-cols-[12.5rem_1fr]"
      aria-label="Vorschau des Pageblitz-Studios: Checkliste und Website-Vorschau"
      role="img"
    >
      {/* Rail */}
      <div className="flex flex-col gap-4 border-b border-lp-line p-4 lg:border-b-0 lg:border-r lg:p-5">
        <div>
          <p className="lp-kicker">Checkliste</p>
          <p className="mt-1 truncate text-[0.95rem] font-medium tracking-[-0.01em]">
            Schreinerei Brandt
          </p>
        </div>
        <ol className="grid grid-cols-2 gap-x-4 lg:grid-cols-1 lg:gap-x-0">
          {STEPS.map((step, index) => {
            const status = index < done ? "done" : "open";
            const current = index === done && !isLive;
            return (
              <li
                key={step.title}
                data-status={status}
                aria-current={current ? "step" : undefined}
                className={`grid grid-cols-[1.75rem_1fr_auto] items-center gap-2 border-t border-lp-line py-2.5 ${
                  current ? "bg-lp-canvas -mx-2 px-2" : ""
                } lg:last:border-b`}
              >
                <span
                  className={`lp-check-num text-[1.15rem] tabular-nums ${
                    status === "done" ? "text-lp-accent" : "text-lp-muted"
                  }`}
                >
                  {index + 1}
                </span>
                <span
                  className="min-w-0 truncate text-[0.9rem] font-semibold leading-tight"
                  title={step.hint}
                >
                  {step.title}
                </span>
                <span className="lp-check-mark inline-flex h-5 w-5 items-center justify-center rounded-full bg-lp-accent text-lp-accent-ink">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
              </li>
            );
          })}
        </ol>
        <div
          className={`mt-auto hidden items-center gap-2 text-[0.8rem] lg:flex ${
            isLive ? "text-lp-accent" : "text-lp-muted"
          }`}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isLive ? "bg-lp-accent" : "bg-lp-line"
            }`}
          />
          {isLive ? "Live" : "In Arbeit"}
        </div>
      </div>

      {/* Stage */}
      <div className="flex flex-col gap-3 bg-lp-canvas p-3 sm:p-4">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex overflow-hidden rounded-full border border-lp-line text-[0.75rem]">
            <span className="bg-lp-ink px-3 py-1 text-lp-canvas">Desktop</span>
            <span className="px-3 py-1 text-lp-muted">Mobil</span>
          </span>
          <span
            className={`rounded-full border px-3 py-1 text-[0.75rem] font-medium transition-colors duration-300 ${
              isLive
                ? "border-lp-accent bg-lp-accent text-lp-accent-ink"
                : "border-lp-line text-lp-muted"
            }`}
          >
            {isLive ? "Freigeschaltet" : "Website freischalten"}
          </span>
        </div>
        <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] border border-lp-line bg-white shadow-[0_24px_48px_-28px_rgba(29,26,23,0.45)]">
          <img
            src="/pack-previews/werkbank.webp"
            width={800}
            height={500}
            alt="Vorschau einer mit Pageblitz erstellten Website im Style Pack Werkbank"
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="block h-full w-full object-cover object-top"
          />
        </div>
        <p className="text-[0.75rem] text-lp-muted">
          Stil: <span className="text-lp-ink">Werkbank</span> · 1 von 14
        </p>
        {/* Stil-Wechsel wie im Studio (Stil-Panel): vier der 14 Packs als
            Miniaturen, das aktive mit Akzentrahmen — füllt die Bühne unter dem
            Desktop-Rahmen mit echtem Material statt Leerraum. */}
        <ul
          className="mt-auto grid grid-cols-4 gap-2 border-t border-lp-line pt-3"
          aria-label="Weitere Style Packs"
        >
          {STAGE_PACKS.map(pack => (
            <li key={pack.id} className="min-w-0">
              <span
                className={`block overflow-hidden rounded-[6px] border bg-white ${
                  pack.id === "werkbank"
                    ? "border-lp-accent ring-1 ring-lp-accent"
                    : "border-lp-line"
                }`}
              >
                <img
                  src={`/pack-previews/${pack.id}.webp`}
                  width={320}
                  height={200}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="block aspect-[16/10] w-full object-cover object-top"
                />
              </span>
              <span className="mt-1 block truncate text-[0.7rem] text-lp-muted">
                {pack.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

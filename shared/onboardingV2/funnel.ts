/**
 * Studio-/Signup-Funnel: stabile Step-Namen, Reihenfolge und Aggregation.
 *
 * Identität ist `sessionKey` (sha256 des Preview-Tokens bzw. anonymes
 * 64-Hex vor der Website). Keine E-Mails, keine IPs, keine Klartext-Tokens.
 * Zählung ist volumenbasiert (DISTINCT sessionKey je Step) — nicht jeder
 * frühe Landing-Event teilt den Key mit späteren Studio-Events.
 */

export const STUDIO_FUNNEL_STEPS = [
  "landing_start",
  "studio_opened",
  "step_style",
  "step_photos",
  "step_texts",
  "step_offer",
  "step_legal",
  "step_addons",
  "email_captured",
  "checkout_started",
  "paid_or_live",
] as const;

/** Seitlicher Ausstieg, nicht Teil der linearen Drop-off-Kette. */
export const STUDIO_FUNNEL_SIDE_STEPS = ["abandoned_preview"] as const;

export type StudioFunnelLinearStep = (typeof STUDIO_FUNNEL_STEPS)[number];
export type StudioFunnelSideStep = (typeof STUDIO_FUNNEL_SIDE_STEPS)[number];
export type StudioFunnelStep = StudioFunnelLinearStep | StudioFunnelSideStep;

/** Steps, die der Client tracken darf — paid_or_live nur serverseitig. */
export const STUDIO_FUNNEL_PUBLIC_STEPS = [
  "landing_start",
  "studio_opened",
  "step_style",
  "step_photos",
  "step_texts",
  "step_offer",
  "step_legal",
  "step_addons",
  "email_captured",
  "checkout_started",
  "abandoned_preview",
] as const;

export type StudioFunnelPublicStep =
  (typeof STUDIO_FUNNEL_PUBLIC_STEPS)[number];

export const STUDIO_FUNNEL_LABELS: Record<StudioFunnelStep, string> = {
  landing_start: "Landing / Start",
  studio_opened: "Studio geöffnet",
  step_style: "Design",
  step_photos: "Fotos",
  step_texts: "Texte",
  step_offer: "Angebot",
  step_legal: "Rechtliches",
  step_addons: "Extras",
  email_captured: "E-Mail erfasst",
  checkout_started: "Checkout gestartet",
  paid_or_live: "Bezahlt / live",
  abandoned_preview: "Preview abgelaufen",
};

const LINEAR = new Set<string>(STUDIO_FUNNEL_STEPS);
const SIDE = new Set<string>(STUDIO_FUNNEL_SIDE_STEPS);
const PUBLIC = new Set<string>(STUDIO_FUNNEL_PUBLIC_STEPS);

export function isStudioFunnelStep(value: string): value is StudioFunnelStep {
  return LINEAR.has(value) || SIDE.has(value);
}

export function isStudioFunnelPublicStep(
  value: string
): value is StudioFunnelPublicStep {
  return PUBLIC.has(value);
}

export interface FunnelStepStat {
  step: StudioFunnelStep;
  label: string;
  count: number;
  /** Wie viele Session-Keys vom vorherigen Step hier fehlen. */
  dropOffCount: number;
  /** 0–1, null beim ersten Step oder wenn der vorherige Count 0 ist. */
  dropOffRate: number | null;
}

export interface StudioFunnelAggregate {
  steps: FunnelStepStat[];
  abandoned: FunnelStepStat;
}

function stat(
  step: StudioFunnelStep,
  count: number,
  dropOffCount: number,
  dropOffRate: number | null
): FunnelStepStat {
  return {
    step,
    label: STUDIO_FUNNEL_LABELS[step],
    count,
    dropOffCount,
    dropOffRate,
  };
}

/**
 * Baut die Admin-Auswertung aus Roh-Counts. Unbekannte Keys werden
 * ignoriert; fehlende Steps zählen als 0. Drop-off wird gegen den
 * vorherigen linearen Step gerechnet und bei negativem Delta auf 0
 * geklemmt (optionale Steps können hinter späteren liegen).
 */
export function aggregateStudioFunnel(
  countsByStep: Partial<Record<string, number>>
): StudioFunnelAggregate {
  const steps: FunnelStepStat[] = [];
  for (let i = 0; i < STUDIO_FUNNEL_STEPS.length; i++) {
    const step = STUDIO_FUNNEL_STEPS[i];
    const count = Number(countsByStep[step] ?? 0);
    if (i === 0) {
      steps.push(stat(step, count, 0, null));
      continue;
    }
    const prev = Number(countsByStep[STUDIO_FUNNEL_STEPS[i - 1]] ?? 0);
    const dropOffCount = Math.max(0, prev - count);
    const dropOffRate = prev > 0 ? dropOffCount / prev : null;
    steps.push(stat(step, count, dropOffCount, dropOffRate));
  }
  return {
    steps,
    abandoned: stat(
      "abandoned_preview",
      Number(countsByStep.abandoned_preview ?? 0),
      0,
      null
    ),
  };
}

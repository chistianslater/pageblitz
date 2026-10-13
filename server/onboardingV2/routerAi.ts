import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { publicProcedure } from "../_core/trpc";
import { getBusinessById } from "../db";
import {
  DEFAULT_DESIGN_PROFILE,
  type DesignProfile,
} from "../../shared/siteContract/designProfile";
import type { WebsiteDataV2 } from "../../shared/siteContract/types";
import { getSystem, type DesignSystemId } from "../../shared/designSystems";
import {
  AiChatHistorySchema,
  SECTION_LABELS,
  SYSTEM_LOOK_MESSAGE,
  type AiThemePatch,
} from "../../shared/onboardingV2/aiEdit";
import { styleSuggestionSystems } from "./aiEditPrompt";
import { applyTheme } from "./applyPatch";
import {
  assertAiEditQuota,
  proposeAiEdit,
  storeProposal,
  takeProposal,
  takeProposalEntry,
} from "./aiEdit";
import { loadStudioWebsite } from "./ownership";
import { chatLabel } from "./versions";
import {
  assertNotGenerating,
  persistDoc,
  requireDoc,
  tokenInput,
} from "./state";

const PROPOSAL_EXPIRED_MESSAGE =
  "Der Vorschlag ist abgelaufen — bitte erneut anfragen.";

/**
 * KI-Chat-Prozeduren des Studios ("Was soll anders sein?", Spec §5).
 * `aiEdit` persistiert NIE selbst — bei einem Inhalts-Vorschlag wird das neue
 * Dokument nur server-seitig zwischengespeichert (TTL 10 min, siehe
 * `./aiEdit`) und erst durch den expliziten `applyAiEdit`-Aufruf über
 * `persistDoc` geschrieben.
 */

export { SYSTEM_LOOK_MESSAGE };

const ELEMENT_LABELS: Record<string, string> = {
  "hero-media": "Hero-Bild",
  "about-media": "Über-uns-Bild",
};

/**
 * Wendet einen Ein-/Ausblende-Patch des KI-Assistenten an und liefert eine
 * deutsche Änderungsliste für die Chat-Karte. Beide Sektionslisten werden
 * auf tatsächlich vorhandene Typen gefiltert und dedupliziert — die KI kann
 * nichts verstecken/ordnen, was es nicht gibt. Farbe, Schrift und Layout
 * kennt der Patch nicht (Farbstimmung des Systems).
 */
export function applyAiTheme(
  doc: WebsiteDataV2,
  theme: AiThemePatch
): { next: WebsiteDataV2; summary: string[] } {
  const summary: string[] = [];
  let base = doc;
  // Set<string>: sectionOrder erlaubt schema-seitig auch "pageHeader"
  // (SECTION_TYPES) — der Filter wirft es hier ohnehin raus.
  const presentTypes = new Set<string>(doc.sections.map(s => s.type));
  if (theme.hiddenSections !== undefined) {
    const hidden = Array.from(new Set(theme.hiddenSections)).filter(t =>
      presentTypes.has(t)
    );
    const before = new Set(doc.hiddenSections ?? []);
    const after = new Set<string>(hidden);
    for (const t of hidden) {
      if (!before.has(t)) summary.push(`„${SECTION_LABELS[t]}“ ausgeblendet`);
    }
    for (const t of before) {
      if (!after.has(t))
        summary.push(`„${SECTION_LABELS[t]}“ wieder eingeblendet`);
    }
    base = { ...base };
    if (hidden.length > 0) base.hiddenSections = hidden;
    else delete base.hiddenSections;
  }
  if (theme.sectionOrder !== undefined) {
    const order = Array.from(new Set(theme.sectionOrder)).filter(t =>
      presentTypes.has(t)
    );
    base = { ...base };
    if (order.length > 0) {
      base.sectionOrder = order;
      summary.push(
        `Reihenfolge angepasst: ${order.map(t => SECTION_LABELS[t]).join(" → ")}`
      );
    } else {
      delete base.sectionOrder;
      summary.push("Reihenfolge auf Standard zurückgesetzt");
    }
  }
  let designProfile: DesignProfile | undefined;
  if (theme.hiddenElements !== undefined) {
    // Einzeln ausgeblendete Elemente („Bild weg, Text breiter") leben im
    // designProfile — nicht-destruktiv, die Bilder bleiben gespeichert.
    const beforeEl = new Set(doc.designProfile?.hiddenElements ?? []);
    const afterEl = Array.from(new Set(theme.hiddenElements));
    for (const el of afterEl) {
      if (!beforeEl.has(el))
        summary.push(
          `${ELEMENT_LABELS[el] ?? el} ausgeblendet — Text nutzt die volle Breite`
        );
    }
    for (const el of beforeEl) {
      if (!afterEl.includes(el))
        summary.push(`${ELEMENT_LABELS[el] ?? el} wieder eingeblendet`);
    }
    designProfile = { ...(doc.designProfile ?? DEFAULT_DESIGN_PROFILE) };
    if (afterEl.length > 0) designProfile.hiddenElements = afterEl;
    else delete designProfile.hiddenElements;
  }
  return { next: applyTheme(base, { designProfile }), summary };
}

/**
 * Stil-Vorschlag der KI (E5): nur ein freigeschaltetes System aus dem
 * Branchen-Tripel, nie das aktuelle — sonst eine ehrliche Ablehnung.
 */
function styleOutcome(
  doc: WebsiteDataV2,
  category: string,
  suggestion: { system: string; reason: string }
):
  | { kind: "style"; system: DesignSystemId; name: string; reason: string }
  | { kind: "reject"; reason: string } {
  const allowed = styleSuggestionSystems(doc, category);
  const system = allowed.find(id => id === suggestion.system);
  const def = system ? getSystem(system) : undefined;
  if (!system || !def) {
    return {
      kind: "reject",
      reason:
        "Dafür habe ich gerade kein passenderes Design — im Stil-Panel kannst du alle Designs und Farbstimmungen ansehen.",
    };
  }
  return { kind: "style", system, name: def.name, reason: suggestion.reason };
}

export const aiProcedures = {
  aiEdit: publicProcedure
    .input(
      tokenInput.extend({
        message: z.string().min(3).max(500),
        // Unterseiten-Scope (Plan B6 Task 5): Slug der gerade in der
        // Vorschau gewählten Unterseite — Format wie PageSchema.slug; ob die
        // Seite existiert, prüft proposeAiEdit (BAD_REQUEST).
        pageSlug: z
          .string()
          .regex(/^[a-z0-9-]{2,40}$/)
          .optional(),
        // Rückfragen-Dialog (2026-08-30): vorherige Wortwechsel dieses
        // Wunschs (Wunsch → Rückfrage → Antwort) — nur vom Client gehalten,
        // nie persistiert.
        history: AiChatHistorySchema.optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      const doc = await requireDoc(loaded);
      assertAiEditQuota(loaded.website.id);

      const business = await getBusinessById(loaded.website.businessId);
      const category = doc.businessCategory ?? business?.category ?? "";

      const result = await proposeAiEdit({
        doc,
        message: input.message,
        category,
        businessWebsite: business?.website ?? null,
        ...(input.pageSlug !== undefined ? { pageSlug: input.pageSlug } : {}),
        ...(input.history !== undefined ? { history: input.history } : {}),
      });

      if (result.kind === "content") {
        const proposalId = storeProposal(
          loaded.website.id,
          result.next,
          input.message
        );
        return {
          kind: "content" as const,
          proposalId,
          diff: result.diff,
        };
      }
      if (result.kind === "theme") {
        // Ein-/Ausblenden wird SOFORT angewandt — jederzeit revidierbar,
        // ein Bestätigen-Zwang würde den „KI passt es an“-Fluss nur bremsen.
        const { next, summary } = applyAiTheme(doc, result.theme);
        if (summary.length === 0) {
          return {
            kind: "reject" as const,
            reason: result.skippedLook
              ? SYSTEM_LOOK_MESSAGE
              : "Diesen Design-Wunsch konnte ich keiner Einstellung zuordnen — probiere es im Stil-Panel.",
          };
        }
        await persistDoc(input.token, loaded, next, {
          trigger: "chat",
          label: chatLabel(input.message),
        });
        return {
          kind: "theme" as const,
          // Die KI-Begründung nennt ggf. auch die verworfene Farbe — dann
          // steht stattdessen der Hinweis zur Farbstimmung.
          reason: result.skippedLook ? SYSTEM_LOOK_MESSAGE : result.reason,
          summary,
        };
      }
      if (result.kind === "style") {
        return styleOutcome(doc, category, result);
      }
      if (result.kind === "question") {
        return { kind: "question" as const, question: result.question };
      }
      return { kind: "reject" as const, reason: result.reason };
    }),

  /** Übernimmt einen zuvor per aiEdit vorgeschlagenen Inhalt — Write-Guard über persistDoc, wie jede andere Studio-Mutation. */
  applyAiEdit: publicProcedure
    .input(tokenInput.extend({ proposalId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      // Gleiche Sperre wie requireDoc (aiEdit): kein Übernehmen in ein
      // Dokument, das der laufende Generierungs-Job gleich überschreibt.
      await assertNotGenerating(loaded.website.id);
      const proposal = takeProposalEntry(input.proposalId, loaded.website.id);
      if (!proposal) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: PROPOSAL_EXPIRED_MESSAGE,
        });
      }
      return persistDoc(input.token, loaded, proposal.next, {
        trigger: "chat",
        label: proposal.label ?? chatLabel(proposal.message),
      });
    }),

  /** Verwirft einen Vorschlag explizit (z. B. Klick auf "Verwerfen") — idempotent, kein Fehler bei bereits abgelaufenem/unbekanntem Vorschlag. */
  discardAiEdit: publicProcedure
    .input(tokenInput.extend({ proposalId: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      const loaded = await loadStudioWebsite(input.token, ctx.user);
      takeProposal(input.proposalId, loaded.website.id);
      return { ok: true as const };
    }),
};

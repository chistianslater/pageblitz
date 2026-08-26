import React, { useState } from "react";
import {
  Bot,
  CalendarDays,
  Files,
  Images,
  MessageSquareText,
  ReceiptText,
  UsersRound,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import type {
  AddonsPatch,
  PagesPatch,
  TeamPatch,
} from "@shared/onboardingV2/patches";
import type {
  Page,
  SectionOf,
  WebsiteDataV2,
} from "@shared/siteContract/types";
import {
  ADDON_KEYS,
  ADDON_NAMES,
  addonPrice,
  BOOKABLE_ADDON_KEYS,
  calcTotalCents,
  formatEuro,
  sanitizeAddOns,
  type AddOnFlags,
  type AddOnKey,
  type BillingInterval,
} from "@shared/pricing";
import { PanelFrame } from "./PanelFrame";
import { TeamEditor } from "./TeamEditor";
import { validateTeam, type TeamValue } from "./teamLogic";
import { PagesEditor } from "./PagesEditor";
import { syncLinkedSections, validatePages } from "./pagesLogic";

/**
 * Bindbare Add-ons: Seit Plan B3 schaltet der Zahlungs-Webhook auch KI-Chat
 * und Terminbuchung frei, seit Plan B5 zusätzlich Team, seit Plan B6
 * Unterseiten — alle acht Extras zählen damit in Preis und Summe. `BOOKABLE_ADDON_KEYS` und `sanitizeAddOns`
 * kommen aus @shared/pricing (Finding I1) — dieselbe Quelle der Wahrheit wie
 * der Server (routerCommerce.ts), damit UI-Sperre und serverseitige
 * Ablehnung nie auseinanderlaufen können. `COMING_SOON_KEYS` bleibt als
 * generischer Mechanismus stehen — seit Plan B6 sind alle acht Extras
 * buchbar, die Liste ist also aktuell leer (keine Zeile rendert).
 */
const TOGGLEABLE_KEYS: readonly AddOnKey[] = BOOKABLE_ADDON_KEYS;
const COMING_SOON_KEYS: AddOnKey[] = ADDON_KEYS.filter(
  k => !BOOKABLE_ADDON_KEYS.includes(k)
);

const ADDON_META: Record<
  AddOnKey,
  { icon: LucideIcon; description: string; benefit: string }
> = {
  contactForm: {
    icon: MessageSquareText,
    description:
      "Besucher senden dir strukturierte Anfragen direkt über deine Website.",
    benefit: "Weniger Hürden bis zur Anfrage",
  },
  gallery: {
    icon: Images,
    description:
      "Zeige Projekte, Räume, Arbeiten oder Impressionen in einer Bildergalerie.",
    benefit: "Arbeit sichtbar beweisen",
  },
  menu: {
    icon: UtensilsCrossed,
    description:
      "Pflege Speisen, Kategorien, Beschreibungen und Preise übersichtlich.",
    benefit: "Angebot direkt verständlich",
  },
  pricelist: {
    icon: ReceiptText,
    description:
      "Veröffentliche Leistungen und Preise transparent in eigenen Kategorien.",
    benefit: "Weniger Rückfragen zu Preisen",
  },
  aiChat: {
    icon: Bot,
    description:
      "Der KI-Chat beantwortet Besucherfragen zu deinem Betrieb rund um die Uhr.",
    benefit: "Interessenten sofort abholen",
  },
  booking: {
    icon: CalendarDays,
    description:
      "Kunden wählen selbst einen freien Termin – ohne Telefon und Hin und Her.",
    benefit: "Termine auch außerhalb der Öffnungszeiten",
  },
  team: {
    icon: UsersRound,
    description:
      "Stelle Mitarbeiter mit Name, Rolle und Foto als eigene Sektion vor.",
    benefit: "Persönlichkeit und Vertrauen",
  },
  subpages: {
    icon: Files,
    description:
      "Ergänze eigene Seiten für Leistungen, Über uns oder weitere Themen.",
    benefit: "Mehr Raum für wichtige Inhalte",
  },
};

/** Reine Ableitung: bestehende Team-Sektion → Entwurf; ohne Sektion eine leere Mitgliederliste (analog offerFromDoc in OfferPanel.tsx). */
export function teamFromDoc(doc: WebsiteDataV2): TeamValue {
  const team = doc.sections.find(
    (s): s is SectionOf<"team"> => s.type === "team"
  );
  if (!team) return { members: [] };
  return {
    ...(team.headline !== undefined ? { headline: team.headline } : {}),
    members: team.members,
  };
}

/** Reine Ableitung: vorhandene Unterseiten (`pages[]`) → Entwurf; ohne Feld eine leere Liste (analog teamFromDoc). */
export function pagesFromDoc(doc: WebsiteDataV2): Page[] {
  return doc.pages ?? [];
}

/**
 * Pure: zieht den lokalen Entwurf nach, wenn sich der Server-Stand
 * (`addOns`-Prop aus dem Studio-State) zwischen zwei Renders geändert hat —
 * nach dem Checkout kommt er aus `subscriptions.addOns`, wo auch Dashboard-
 * Kauf und Stripe-Webhook hinschreiben (Review-Fund B6 Task 6). Nur die
 * geänderten Keys werden übernommen; alles, was der Nutzer im Panel bereits
 * umgeschaltet hat, bleibt. Ohne Änderung kommt der Entwurf unverändert
 * (gleiche Referenz) zurück. Fehlende Keys zählen als false.
 */
export function reconcileAddOnDraft(
  draft: AddOnFlags,
  prevServer: AddOnFlags,
  nextServer: AddOnFlags
): AddOnFlags {
  let next: AddOnFlags | null = null;
  for (const key of ADDON_KEYS) {
    const before = prevServer[key] === true;
    const after = nextServer[key] === true;
    if (before === after) continue;
    next = { ...(next ?? draft), [key]: after };
  }
  return next ?? draft;
}

interface AddonsListProps {
  value: AddOnFlags;
  onToggle: (k: AddOnKey) => void;
  interval: BillingInterval;
}

/** Reine Darstellung: Schalter je bindbarem Add-on mit Preis, gesperrte "bald verfügbar"-Zeilen, Gesamtsumme inkl. Basispreis. */
export function AddonsList({ value, onToggle, interval }: AddonsListProps) {
  const total = calcTotalCents(interval, sanitizeAddOns(value));
  const activeCount = TOGGLEABLE_KEYS.filter(key => value[key]).length;
  return (
    <div className="pb-studio-addon-wrap">
      <ul className="pb-studio-addon-grid" aria-label="Extras">
        {TOGGLEABLE_KEYS.map(key => {
          const meta = ADDON_META[key];
          const Icon = meta.icon;
          const active = value[key] === true;
          return (
            <li
              className="pb-studio-addon-card"
              data-active={active || undefined}
              key={key}
            >
              <div className="pb-studio-addon-card-head">
                <span className="pb-studio-addon-icon">
                  <Icon aria-hidden="true" />
                </span>
                <span className="pb-studio-addon-price">
                  + {formatEuro(addonPrice(key))}/Monat
                </span>
              </div>
              <h3>{ADDON_NAMES[key]}</h3>
              <p>{meta.description}</p>
              <span className="pb-studio-addon-benefit">{meta.benefit}</span>
              <button
                type="button"
                className="pb-studio-addon-toggle"
                aria-pressed={active}
                onClick={() => onToggle(key)}
              >
                {active ? "Ausgewählt" : "Hinzufügen"}
              </button>
            </li>
          );
        })}
        {COMING_SOON_KEYS.map(key => (
          <li className="pb-studio-addon-card" key={key} data-locked="true">
            <h3>{ADDON_NAMES[key]}</h3>
            <p>Bald verfügbar.</p>
          </li>
        ))}
      </ul>
      <div className="pb-studio-addon-total">
        <span>
          {activeCount === 0
            ? "Keine Extras ausgewählt"
            : `${activeCount} Extra${activeCount === 1 ? "" : "s"} ausgewählt`}
        </span>
        <span>
          Gesamt: <strong>{formatEuro(total)}</strong>/Monat
        </span>
      </div>
    </div>
  );
}

interface AddonsPanelProps {
  token: string;
  doc: WebsiteDataV2;
  /**
   * Server-Stand der Flags (`state.addOns`): vor dem Checkout der Entwurf
   * aus onboarding_responses, danach `subscriptions.addOns` bzw. das
   * Dokument (server/onboardingV2/state.ts `resolveAddOns`). Der lokale
   * Entwurf startet hiervon und folgt Änderungen der Prop
   * (`reconcileAddOnDraft`).
   */
  addOns: AddOnFlags;
  /**
   * true nach dem Checkout (website.status !== "preview"): Änderungen an den
   * Extras werden sofort über Stripe abgerechnet (Plan B6 Task 6,
   * server/onboardingV2/addOnFlags.ts) — das Panel sagt das vorher an.
   */
  live?: boolean;
  onApplied: () => void;
  onClose: () => void;
  /** Geführter Modus: nach Prüfung weiter zum Freischalten. */
  onNext?: () => void;
  onPreviewFocus?: (anchor: string) => void;
}

export function AddonsPanel({
  token,
  doc,
  addOns,
  live = false,
  onApplied,
  onClose,
  onNext,
  onPreviewFocus,
}: AddonsPanelProps) {
  const [value, setValue] = useState<AddOnFlags>(() => sanitizeAddOns(addOns));
  // Server-Stand, aus dem der Entwurf zuletzt abgeleitet wurde — ändert er
  // sich (Reload des Studio-States nach Dashboard-Kauf/Webhook/eigenem
  // Speichern), wird der Entwurf während des Renders nachgezogen (React-
  // Muster „State an Prop-Änderung anpassen“, kein Effekt nötig).
  const [syncedFrom, setSyncedFrom] = useState<AddOnFlags>(addOns);
  if (syncedFrom !== addOns) {
    setSyncedFrom(addOns);
    const reconciled = reconcileAddOnDraft(value, syncedFrom, addOns);
    if (reconciled !== value) setValue(reconciled);
  }
  const [team, setTeam] = useState<TeamValue>(() => teamFromDoc(doc));
  const [pages, setPages] = useState<Page[]>(() => pagesFromDoc(doc));

  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();
  const updateTeam = trpc.onboardingV2.updateTeam.useMutation();
  const updatePages = trpc.onboardingV2.updatePages.useMutation();
  const busy = updateAddons.isPending;
  const teamBusy = updateTeam.isPending;
  const pagesBusy = updatePages.isPending;
  const teamErrors = validateTeam(team.members);
  const pagesErrors = validatePages(pages);

  const handleToggle = (key: AddOnKey) => {
    setValue(prev => ({ ...prev, [key]: !prev[key] }));
    const anchor: Record<AddOnKey, string> = {
      contactForm: "kontakt",
      gallery: "galerie",
      menu: "speisekarte",
      pricelist: "preisliste",
      aiChat: "kontakt",
      booking: "kontakt",
      team: "team",
      subpages: "leistungen",
    };
    onPreviewFocus?.(anchor[key]);
  };

  const handleSave = () => {
    const patch: AddonsPatch = {
      contactForm: !!value.contactForm,
      gallery: !!value.gallery,
      menu: !!value.menu,
      pricelist: !!value.pricelist,
      aiChat: !!value.aiChat,
      booking: !!value.booking,
      // Team ist seit Plan B5 buchbar (BOOKABLE_ADDON_KEYS, @shared/pricing)
      // — der Schalter setzt hier nur das Abrechnungs-Flag `addOnTeam`.
      // Die Mitglieder selbst pflegt der "Team pflegen"-Unterbereich unten
      // (eigene "Übernehmen"-Mutation onboardingV2.updateTeam), analog zum
      // getrennten Verwaltungsort von Galerie-Flag (hier) und
      // Galerie-Inhalt (Fotos-Panel).
      team: !!value.team,
      // Unterseiten (Plan B6 Task 5) wie Team: Schalter = Abrechnungs-Flag
      // `addOnSubpages`, die Seiten selbst pflegt der Unterbereich
      // "Unterseiten pflegen" (eigene Mutation onboardingV2.updatePages).
      subpages: !!value.subpages,
    };
    updateAddons.mutate(
      { token, addOns: patch },
      {
        onSuccess: () => {
          onApplied();
          onNext?.();
        },
      }
    );
  };

  // Kontakt/Galerie auf Unterseiten spiegeln die Startseite — vor dem
  // Speichern aus dem aktuellen Dokument auffrischen (pagesLogic.ts).
  const handlePagesSave = () => {
    const patch: PagesPatch = { pages: syncLinkedSections(pages, doc) };
    updatePages.mutate({ token, patch }, { onSuccess: onApplied });
  };

  const handleTeamSave = () => {
    const patch: TeamPatch = {
      members: team.members,
      ...(team.headline !== undefined ? { headline: team.headline } : {}),
    };
    updateTeam.mutate({ token, patch }, { onSuccess: onApplied });
  };

  return (
    <PanelFrame
      step="Schritt 6 · optional"
      title="Extras wählen"
      panelId="addons"
      onClose={onClose}
      intro="Mach aus deiner Website ein Werkzeug: mehr Anfragen, direkte Termine und mehr Raum für deine Inhalte. Du kannst alles später ändern."
      footer={
        <>
          <button
            type="button"
            className="pb-studio-btn"
            data-variant="ghost"
            onClick={onClose}
          >
            Schließen
          </button>
          <button
            type="button"
            className="pb-studio-btn"
            disabled={busy}
            onClick={handleSave}
          >
            {busy
              ? "Bitte warten…"
              : onNext
                ? "Auswahl speichern & weiter"
                : "Speichern"}
          </button>
        </>
      }
    >
      <AddonsList value={value} onToggle={handleToggle} interval="yearly" />
      <p style={{ color: "var(--st-muted)", fontSize: "0.85rem" }}>
        Kontaktformular erscheint sofort in der Vorschau; KI-Chat &amp;
        Terminbuchung werden nach der Freischaltung aktiv (die Vorschau zeigt
        schon jetzt die Buttons). Nicht gebuchte Inhalte (Galerie, Speisekarte,
        Preisliste, Team, Unterseiten) bleiben gespeichert und werden nur
        ausgeblendet.
      </p>
      {live && (
        <p style={{ color: "var(--st-muted)", fontSize: "0.85rem" }}>
          Deine Website ist freigeschaltet: Änderungen an den Extras werden beim
          Speichern sofort über dein Abo anteilig abgerechnet bzw.
          gutgeschrieben.
        </p>
      )}
      {updateAddons.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateAddons.error.message}
        </p>
      )}
      {value.team && (
        <div className="pb-studio-rows">
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Team pflegen
          </h3>
          <TeamEditor token={token} value={team} onChange={setTeam} />
          <button
            type="button"
            className="pb-studio-btn"
            disabled={teamBusy || teamErrors.length > 0}
            onClick={handleTeamSave}
          >
            {teamBusy ? "Bitte warten…" : "Übernehmen"}
          </button>
          {updateTeam.error && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              {updateTeam.error.message}
            </p>
          )}
        </div>
      )}
      {value.subpages && (
        <div className="pb-studio-rows">
          <h3 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>
            Unterseiten pflegen
          </h3>
          <PagesEditor value={pages} onChange={setPages} doc={doc} />
          <button
            type="button"
            className="pb-studio-btn"
            disabled={pagesBusy || pagesErrors.length > 0}
            onClick={handlePagesSave}
          >
            {pagesBusy ? "Bitte warten…" : "Übernehmen"}
          </button>
          {updatePages.error && (
            <p role="alert" style={{ color: "var(--st-warn)" }}>
              {updatePages.error.message}
            </p>
          )}
        </div>
      )}
    </PanelFrame>
  );
}

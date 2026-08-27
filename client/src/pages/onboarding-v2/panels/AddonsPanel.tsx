import React, { useEffect, useState } from "react";
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
import { motionSafeScrollBehavior } from "@/lib/motion";
import {
  ADDON_EDITORS,
  extraEditIntent,
} from "@shared/onboardingV2/addonEditors";
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
  focusKey?: AddOnKey | null;
  /**
   * Gebuchtes Extra: Klick auf Karte/Titel/Bearbeiten öffnet den Inhalt
   * statt nur den Kauf-Toggle umzuschalten.
   */
  onEditExtra?: (k: AddOnKey) => void;
}

/** Reine Darstellung: Schalter je bindbarem Add-on mit Preis, gesperrte "bald verfügbar"-Zeilen, Gesamtsumme inkl. Basispreis. */
export function AddonsList({
  value,
  onToggle,
  interval,
  focusKey = null,
  onEditExtra,
}: AddonsListProps) {
  const total = calcTotalCents(interval, sanitizeAddOns(value));
  const activeCount = TOGGLEABLE_KEYS.filter(key => value[key]).length;
  return (
    <div className="pb-studio-addon-wrap">
      <ul className="pb-studio-addon-grid" aria-label="Extras">
        {TOGGLEABLE_KEYS.map(key => {
          const meta = ADDON_META[key];
          const Icon = meta.icon;
          const active = value[key] === true;
          const canEdit = active && !!onEditExtra;
          const editKind = extraEditIntent(key).kind;
          return (
            <li
              id={`pb-addon-${key}`}
              className="pb-studio-addon-card"
              data-active={active || undefined}
              data-focused={focusKey === key || undefined}
              data-has-editor={canEdit || undefined}
              key={key}
              onClick={
                canEdit
                  ? event => {
                      if (
                        (event.target as HTMLElement).closest(
                          ".pb-studio-addon-toggle"
                        )
                      ) {
                        return;
                      }
                      onEditExtra?.(key);
                    }
                  : undefined
              }
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
              <div className="pb-studio-addon-actions">
                {canEdit && (
                  <button
                    type="button"
                    className="pb-studio-addon-edit"
                    data-open-extra={key}
                    data-edit-kind={editKind}
                    onClick={event => {
                      event.stopPropagation();
                      onEditExtra?.(key);
                    }}
                  >
                    Bearbeiten
                  </button>
                )}
                <button
                  type="button"
                  className="pb-studio-addon-toggle"
                  aria-pressed={active}
                  onClick={event => {
                    event.stopPropagation();
                    onToggle(key);
                  }}
                >
                  {active ? "Ausgewählt" : "Hinzufügen"}
                </button>
              </div>
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
  chatWelcomeMessage?: string | null;
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
  /** Klick auf einen aktiven Extra-Step: Editor bzw. Karte direkt anspringen. */
  initialFocusKey?: AddOnKey | null;
  /**
   * Gebuchte Inhalts-Extras (Galerie, Speisekarte, Preisliste) können aus
   * diesem Panel ins echte Inhaltspanel wechseln.
   */
  onOpenExtraEditor?: (key: AddOnKey) => void;
}

export function AddonsPanel({
  token,
  doc,
  addOns,
  chatWelcomeMessage = null,
  live = false,
  onApplied,
  onClose,
  onNext,
  onPreviewFocus,
  initialFocusKey = null,
  onOpenExtraEditor,
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
  const readHeadline = (
    type: "contact" | "gallery" | "menu" | "pricelist"
  ) => {
    const section = doc.sections.find(item => item.type === type);
    return section && "headline" in section ? (section.headline ?? "") : "";
  };
  const [headings, setHeadings] = useState({
    contact: readHeadline("contact"),
    gallery: readHeadline("gallery"),
    menu: readHeadline("menu"),
    pricelist: readHeadline("pricelist"),
  });
  const [chatWelcome, setChatWelcome] = useState(chatWelcomeMessage ?? "");
  const [cardFocusKey, setCardFocusKey] = useState<AddOnKey | null>(null);
  const focusKey = cardFocusKey ?? initialFocusKey;

  const updateAddons = trpc.onboardingV2.updateAddons.useMutation();
  const updateTeam = trpc.onboardingV2.updateTeam.useMutation();
  const updatePages = trpc.onboardingV2.updatePages.useMutation();
  const updateAddonSettings =
    trpc.onboardingV2.updateAddonSettings.useMutation();
  const busy = updateAddons.isPending || updateAddonSettings.isPending;
  const teamBusy = updateTeam.isPending;
  const pagesBusy = updatePages.isPending;
  const teamErrors = validateTeam(team.members);
  const pagesErrors = validatePages(pages);

  useEffect(() => {
    setCardFocusKey(null);
  }, [initialFocusKey]);

  useEffect(() => {
    if (!initialFocusKey) return;
    const editorId = ADDON_EDITORS[initialFocusKey].editorDomId;
    const id = window.requestAnimationFrame(() => {
      const target =
        (editorId ? document.getElementById(editorId) : null) ??
        document.getElementById(`pb-addon-${initialFocusKey}`);
      target?.scrollIntoView({
        behavior: motionSafeScrollBehavior(),
        block: "center",
      });
    });
    return () => window.cancelAnimationFrame(id);
  }, [initialFocusKey]);

  const scrollToAddonEditor = (key: AddOnKey) => {
    const intent = extraEditIntent(key);
    if (intent.kind !== "scrollEditor") return;
    const target = document.getElementById(intent.editorDomId);
    target?.scrollIntoView({
      behavior: motionSafeScrollBehavior(),
      block: "center",
    });
  };

  const handleEditExtra = (key: AddOnKey) => {
    const intent = extraEditIntent(key);
    if (intent.kind === "openPanel") {
      onOpenExtraEditor?.(key);
      return;
    }
    setCardFocusKey(key);
    scrollToAddonEditor(key);
  };

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

  const handleSave = async () => {
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
    try {
      // Sequenziell statt Promise.all: beide Mutationen schreiben dasselbe
      // websiteData-Dokument und sollen sich nie gegenseitig überschreiben.
      await updateAddons.mutateAsync({ token, addOns: patch });
      await updateAddonSettings.mutateAsync({
        token,
        headings,
        chatWelcomeMessage: value.aiChat ? chatWelcome : undefined,
      });
      onApplied();
      onNext?.();
    } catch {
      // Fehler werden direkt an den jeweiligen Mutationskarten angezeigt.
    }
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

  const quickHeadingSettings = [
    {
      addOn: "contactForm" as const,
      section: "contact" as const,
      label: "Überschrift im Kontaktbereich",
    },
    {
      addOn: "gallery" as const,
      section: "gallery" as const,
      label: "Überschrift der Galerie",
    },
    {
      addOn: "menu" as const,
      section: "menu" as const,
      label: "Überschrift der Speisekarte",
    },
    {
      addOn: "pricelist" as const,
      section: "pricelist" as const,
      label: "Überschrift der Preisliste",
    },
  ].filter(
    setting =>
      value[setting.addOn] &&
      doc.sections.some(section => section.type === setting.section)
  );

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
      <AddonsList
        value={value}
        onToggle={handleToggle}
        interval="yearly"
        focusKey={focusKey}
        onEditExtra={handleEditExtra}
      />
      {onOpenExtraEditor &&
        (value.gallery || value.menu || value.pricelist) && (
          <section className="pb-studio-addon-settings">
            <div className="pb-studio-addon-settings-head">
              <div>
                <p className="pb-studio-kicker">Inhalte</p>
                <h3>Gebuchte Extras pflegen</h3>
              </div>
            </div>
            <div className="pb-studio-rows">
              {value.gallery && (
                <button
                  type="button"
                  className="pb-studio-btn"
                  onClick={() => onOpenExtraEditor("gallery")}
                >
                  Bildergalerie bearbeiten
                </button>
              )}
              {value.menu && (
                <button
                  type="button"
                  className="pb-studio-btn"
                  onClick={() => onOpenExtraEditor("menu")}
                >
                  Speisekarte bearbeiten
                </button>
              )}
              {value.pricelist && (
                <button
                  type="button"
                  className="pb-studio-btn"
                  onClick={() => onOpenExtraEditor("pricelist")}
                >
                  Preisliste bearbeiten
                </button>
              )}
            </div>
          </section>
        )}
      {(quickHeadingSettings.length > 0 ||
        value.aiChat ||
        value.booking ||
        value.contactForm) && (
        <section className="pb-studio-addon-settings">
          <div className="pb-studio-addon-settings-head">
            <div>
              <p className="pb-studio-kicker">Schnelleinstellungen</p>
              <h3>Direkt für den Start anpassen</h3>
            </div>
            <span>Alles später änderbar</span>
          </div>
          <div className="pb-studio-addon-settings-grid">
            {quickHeadingSettings.map(setting => (
              <label
                key={setting.section}
                id={
                  extraEditIntent(setting.addOn).kind === "scrollEditor"
                    ? `pb-addon-editor-${setting.addOn}`
                    : `pb-addon-heading-${setting.addOn}`
                }
                className="pb-studio-field"
                data-focused={
                  extraEditIntent(setting.addOn).kind === "scrollEditor" &&
                  focusKey === setting.addOn
                    ? true
                    : undefined
                }
              >
                <span>{setting.label}</span>
                <input
                  type="text"
                  className="pb-studio-input"
                  value={headings[setting.section]}
                  maxLength={120}
                  onChange={event =>
                    setHeadings(current => ({
                      ...current,
                      [setting.section]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
            {value.contactForm &&
              !quickHeadingSettings.some(s => s.addOn === "contactForm") && (
                <div
                  id="pb-addon-editor-contactForm"
                  className="pb-studio-addon-dashboard-note"
                  data-focused={
                    focusKey === "contactForm" ? true : undefined
                  }
                >
                  <MessageSquareText aria-hidden="true" />
                  <div>
                    <strong>Kontaktformular</strong>
                    <p>
                      Empfänger, Felder und Bestätigungstext stellst du im
                      Kundenbereich ein.
                    </p>
                  </div>
                </div>
              )}
            {value.aiChat && (
              <label
                id="pb-addon-editor-aiChat"
                className="pb-studio-field"
                data-focused={focusKey === "aiChat" ? true : undefined}
              >
                <span>Begrüßung im KI-Chat</span>
                <input
                  type="text"
                  className="pb-studio-input"
                  value={chatWelcome}
                  maxLength={512}
                  placeholder="Hallo! Wie kann ich Ihnen helfen?"
                  onChange={event => setChatWelcome(event.target.value)}
                />
              </label>
            )}
            {value.booking && (
              <div
                id="pb-addon-editor-booking"
                className="pb-studio-addon-dashboard-note"
                data-focused={focusKey === "booking" ? true : undefined}
              >
                <CalendarDays aria-hidden="true" />
                <div>
                  <strong>Terminbuchung</strong>
                  <p>
                    Dauer, freie Zeiten, Puffer und Benachrichtigungsadresse
                    stellst du nach der Freischaltung im Kunden-Dashboard ein.
                  </p>
                </div>
              </div>
            )}
          </div>
          <p className="pb-studio-addon-later">
            Du kannst nachher alles noch im Kunden-Dashboard bearbeiten.
          </p>
        </section>
      )}
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
      {updateAddonSettings.error && (
        <p role="alert" style={{ color: "var(--st-warn)" }}>
          {updateAddonSettings.error.message}
        </p>
      )}
      {value.team && (
        <div
          id="pb-addon-editor-team"
          className="pb-studio-rows pb-studio-addon-settings"
          data-focused={focusKey === "team" ? true : undefined}
        >
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
        <div
          id="pb-addon-editor-subpages"
          className="pb-studio-rows pb-studio-addon-settings"
          data-focused={focusKey === "subpages" ? true : undefined}
        >
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

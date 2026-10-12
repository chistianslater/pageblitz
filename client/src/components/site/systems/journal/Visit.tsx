import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import {
  coversToday,
  isPlaceholderHours,
  shortHours,
  telHref,
  whatsappHref,
} from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  chapterIndex,
  mailHref,
  mapsHref,
  primaryAction,
  newTabIfMaps,
} from "../shared";
import {
  JournalChapter,
  chapterLabel,
  sectionClass,
  type JournalSection,
} from "./sections";
import { SYS_ACTIONS, SYS_DOCK } from "../shared/dockAutoHide";

/**
 * Gut zu wissen, Besuch und Handy-Dock nach Systemblatt (Anker Aman
 * Venice, „Getting here"): Fragen als <details> mit Haarlinien und einem
 * Plus, das zum Minus wird; Besuch zentriert mit Name und Adresse,
 * Öffnungszeiten als Zeilen mit „heute", eine ruhige Karten-Fläche (kein
 * Google-Embed: keine Drittanbieter-Anfragen, keine Cookies) und
 * Textlinks. Erfunden wird nichts: Platzhalter-Zeiten der Erzeugung
 * erscheinen nie, ohne Adresse entfallen Karte und Route.
 */

type P<T extends JournalSection["type"]> = {
  section: Extract<JournalSection, { type: T }>;
  sections: readonly JournalSection[];
};

export function JournalFaq({ section, sections }: P<"faq">) {
  const { blueprint } = useSystem();
  const index = chapterIndex(sections, "faq");
  const id = SECTION_ANCHORS.faq;
  const label = chapterLabel("faq", blueprint);
  return (
    <section
      id={id}
      className={sectionClass("faq", index)}
      aria-labelledby={`${id}-titel`}
    >
      <div className="jr-wrap jr-split">
        <div className="jr-split-head">
          <JournalChapter
            id={id}
            index={index}
            label={label}
            title={section.headline || "Häufige Fragen"}
          />
        </div>
        <div className="jr-split-body jr-faq-list">
          {section.items.map((item, i) => (
            // Wie im Systemblatt steht die erste Antwort offen.
            <details
              className="jr-faq-item"
              key={`${item.question}-${i}`}
              open={i === 0 || undefined}
            >
              <summary>
                <span className="jr-faq-q">{rich(item.question)}</span>
                <span className="jr-faq-sign" aria-hidden="true" />
              </summary>
              <div className="jr-faq-a">
                <p>{rich(item.answer)}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

const CLOSED = /geschlossen|closed|ruhetag/i;
/** Generische Überschriften, die Journal durch eine sprechende ersetzt. */
const GENERIC_TITLE = /^(kontakt|contact)$/i;

/** Echte Öffnungszeiten — Platzhalter der Erzeugung zeigt Journal nie. */
export function shownHours(
  contact: SectionOf<"contact">
): { day: string; hours: string }[] {
  const hours = contact.openingHours ?? [];
  return isPlaceholderHours(hours) ? [] : hours;
}

function Hours({
  hours,
  label,
  showTitle,
}: {
  hours: { day: string; hours: string }[];
  label: string;
  showTitle: boolean;
}) {
  const { now } = useSystem();
  return (
    <div className="jr-hours">
      {showTitle && <h3 className="jr-kicker jr-hours-title">{label}</h3>}
      <dl aria-label={showTitle ? undefined : label}>
        {hours.map((entry, i) => {
          const today = coversToday(entry.day, now);
          const closed = CLOSED.test(entry.hours);
          return (
            <div
              key={`${entry.day}-${i}`}
              className="jr-hours-row"
              data-today={today ? "yes" : undefined}
            >
              <dt>
                {entry.day}
                {today && <em className="jr-today">heute</em>}
              </dt>
              <dd className={closed ? "jr-hours-closed" : undefined}>
                {closed ? "geschlossen" : shortHours(entry.hours)}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/** Ruhige Karten-Fläche (Haarlinien + Punkt), verlinkt auf die Route. */
function MapPlate({ address, label }: { address: string; label: string }) {
  return (
    <a
      className="jr-map"
      href={mapsHref(address)}
      aria-label={`${label}: ${address}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      <span className="jr-map-dot" aria-hidden="true" />
    </a>
  );
}

export function JournalContact({ section, sections }: P<"contact">) {
  const { data, blueprint, contactIsland } = useSystem();
  const index = chapterIndex(sections, "contact");
  const id = SECTION_ANCHORS.contact;
  const inquiry = blueprint.contactMode === "inquiry";
  const hours = shownHours(section);
  const hoursLabel = blueprint.hoursLabel ?? "Öffnungszeiten";
  const own = section.headline && !GENERIC_TITLE.test(section.headline.trim());
  const title = own
    ? section.headline!
    : inquiry
      ? "Kontakt und Anfahrt"
      : hours.length > 0
        ? `${hoursLabel} und Weg`
        : "Adresse und Weg";
  const address = addressLine(section);
  const place = [section.zip, section.city].filter(Boolean).join(" ");
  const tel = telHref(section.phone);
  const whatsapp = whatsappHref(section.phone);
  const routeLabel = inquiry ? "Anfahrt" : "Route planen";
  // Handwerk (EntryVisit, 2026-10-06): Man fragt ein Angebot an.
  const mail = mailHref(section.email);
  const inquiryHref =
    mailHref(
      section.email,
      `Anfrage über die Website – ${data.businessName}`
    ) ?? tel;
  // Titel nur, wenn die Kontakt-Insel wirklich erscheint (SiteIslands).
  const form = Boolean(contactIsland);
  return (
    <section
      id={id}
      className={sectionClass("contact", index)}
      aria-labelledby={`${id}-titel`}
      data-mode={inquiry ? "inquiry" : "visit"}
    >
      <div className="jr-wrap">
        <div className="jr-contact-head">
          <JournalChapter
            id={id}
            index={index}
            label={chapterLabel("contact", blueprint)}
            title={title}
          />
        </div>
        <div className="jr-contact-grid">
          <div className="jr-contact-main">
            {(section.street || place) && (
              <address className="jr-contact-address">
                <span className="jr-contact-name">{data.businessName}</span>
                {section.street && <span>{section.street}</span>}
                {place && <span>{place}</span>}
              </address>
            )}
            {blueprint.serviceArea && section.city && (
              <p className="jr-contact-area">
                Einsatzgebiet: {section.city} und Umgebung
              </p>
            )}
            {hours.length > 0 && (
              <Hours
                hours={hours}
                label={hoursLabel}
                showTitle={Boolean(own) || inquiry}
              />
            )}
            {inquiry && inquiryHref && (
              <p className="jr-contact-cta" {...SYS_ACTIONS}>
                <a className="jr-pill" href={inquiryHref}>
                  {blueprint.ctaText ?? "Anfrage senden"}
                </a>
              </p>
            )}
            <p className="jr-links jr-contact-links" {...SYS_ACTIONS}>
              {address && (
                <a
                  className="jr-link"
                  href={mapsHref(address)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {routeLabel}
                </a>
              )}
              {tel && section.phone && (
                <a className="jr-link" href={tel}>
                  {section.phone}
                </a>
              )}
              {mail && section.email && (
                <a className="jr-link" href={mail}>
                  {section.email.trim()}
                </a>
              )}
              {whatsapp && (
                <a
                  className="jr-link"
                  href={whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              )}
            </p>
          </div>
          {address && (
            <div className="jr-contact-map">
              <MapPlate address={address} label={routeLabel} />
            </div>
          )}
        </div>
        {/* Das Formular selbst ist die bestehende Kontakt-Insel
            (SiteIslands, data-island="contact"); die Hydration hängt sie
            an diesen Abschnitt (#kontakt) an. Hier nur ihr Titel. */}
        {form && (
          <h3 className="jr-kicker jr-contact-form">Nachricht schreiben</h3>
        )}
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a1 1 0 0 1-1 1A16 16 0 0 1 4 5a1 1 0 0 1 1-1" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.25" />
    </svg>
  );
}

/**
 * Handy-Dock (Systemblatt): Hauptaktion als dunkler Knopf über die Breite,
 * daneben ein quadratischer Anruf-Knopf. Ruft die Hauptaktion schon an
 * (Gastro „Tisch reservieren"), steht dort die Route.
 */
export function JournalDock({ anchorPrefix }: { anchorPrefix: string }) {
  const { data, blueprint } = useSystem();
  const contact = data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const action = primaryAction(data, blueprint, anchorPrefix);
  const tel = telHref(contact?.phone);
  const address = addressLine(contact);
  const second =
    tel && !action.href.startsWith("tel:")
      ? { href: tel, label: "Anrufen", icon: <PhoneIcon />, external: false }
      : address && !action.href.startsWith("https://www.google.com/maps")
        ? {
            href: mapsHref(address),
            label: "Route planen",
            icon: <PinIcon />,
            external: true,
          }
        : undefined;
  return (
    <nav className="jr-dock" aria-label="Schnellzugriff" {...SYS_DOCK}>
      <a className="jr-dock-main" href={action.href} {...newTabIfMaps(action.href)}>
        {action.label}
      </a>
      {second && (
        <a
          className="jr-dock-icon"
          href={second.href}
          aria-label={second.label}
          {...(second.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {second.icon}
        </a>
      )}
    </nav>
  );
}

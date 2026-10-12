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
import { addressLine, mailHref, mapsHref } from "../shared";
import { todayFact } from "./facts";
import { isRoundTheClock } from "../shared";
import {
  RasterChapter,
  chapterLabel,
  useChapterNo,
  type RasterSection,
  type SectionProps,
} from "./sections";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import { telLabel } from "../shared/contact";

/**
 * Gut zu wissen und Zeiten + Kontakt nach Systemblatt 7–9: Fragen als
 * Haarlinien-Zeilen (<details>, erste offen, „+" wird „–"); Kontakt mit
 * Status-Satz, Tabelle Mo–So (Heute mit Signal-Quadrat), Telefon groß,
 * Adresse, Textlinks und einer ruhigen Karten-Fläche ohne Google-Einbettung
 * (keine Drittanbieter-Anfragen). Nichts wird erfunden: Platzhalter-Zeiten
 * erscheinen nie, ohne Adresse entfallen Karte und Route, der Formular-Titel
 * nur, wenn die Kontakt-Insel wirklich rendert.
 */

export function RasterFaq({ section, sections }: SectionProps<"faq">) {
  const { blueprint } = useSystem();
  return (
    <RasterChapter
      id={SECTION_ANCHORS.faq}
      name="faq"
      no={useChapterNo(sections, "faq")}
      label={chapterLabel("faq", blueprint)}
      title={section.headline}
    >
      <div className="rs-faq">
        {section.items.map((item, i) => (
          // Wie im Systemblatt steht die erste Antwort offen.
          <details
            className="rs-faq-item"
            key={`${item.question}-${i}`}
            open={i === 0 || undefined}
          >
            <summary>
              <span className="rs-faq-q">{rich(item.question)}</span>
              <span className="rs-faq-sign" aria-hidden="true" />
            </summary>
            <div className="rs-faq-a">
              <p>{rich(item.answer)}</p>
            </div>
          </details>
        ))}
      </div>
    </RasterChapter>
  );
}

const CLOSED = /geschlossen|closed|ruhetag/i;
/** Generische Überschriften: dann trägt das Kapitel-Label die h2. */
const GENERIC_TITLE = /^(kontakt|contact)$/i;

/** Echte Öffnungszeiten — Platzhalter der Erzeugung zeigt Raster nie. */
function shownHours(contact: SectionOf<"contact">) {
  const hours = contact.openingHours ?? [];
  return isPlaceholderHours(hours) ? [] : hours;
}

/** Status-Satz über der Tabelle; Signal-Quadrat nur, wenn offen. */
function statusOf(
  contact: SectionOf<"contact">,
  now: Date
): { text: string; live: boolean } | undefined {
  if (isRoundTheClock(contact.openingHours))
    return { text: "Jetzt erreichbar, rund um die Uhr", live: true };
  const fact = todayFact(contact.openingHours, now);
  if (!fact) return undefined;
  return { text: fact, live: !/geschlossen/.test(fact) };
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
    <div className="rs-hours-box">
      {showTitle && <h3 className="rs-hours-title">{label}</h3>}
      <dl className="rs-hours" aria-label={showTitle ? undefined : label}>
        {hours.map((entry, i) => {
          const today = coversToday(entry.day, now);
          const closed = CLOSED.test(entry.hours);
          return (
            <div
              key={`${entry.day}-${i}`}
              className={
                today ? "rs-hours-row rs-hours-row--today" : "rs-hours-row"
              }
            >
              <dt>
                {entry.day}
                {today && <span className="rs-today"> · Heute</span>}
              </dt>
              <dd>{closed ? "geschlossen" : shortHours(entry.hours)}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

export function RasterContact({ section, sections }: SectionProps<"contact">) {
  const { data, blueprint, contactIsland, now } = useSystem();
  const inquiry = blueprint.contactMode === "inquiry";
  const hours = shownHours(section);
  const status = hours.length > 0 ? statusOf(section, now) : undefined;
  const hoursLabel = blueprint.hoursLabel ?? "Öffnungszeiten";
  const own =
    section.headline && !GENERIC_TITLE.test(section.headline.trim())
      ? section.headline
      : undefined;
  const address = addressLine(section);
  const route = address ? mapsHref(address) : undefined;
  const routeLabel = inquiry ? "Anfahrt" : "Route planen";
  const tel = telHref(section.phone);
  const whatsapp = whatsappHref(section.phone);
  const mail = mailHref(section.email);
  const inquiryHref =
    mailHref(
      section.email,
      `Anfrage über die Website – ${data.businessName}`
    ) ?? tel;
  const external = { target: "_blank", rel: "noopener noreferrer" } as const;
  return (
    <RasterChapter
      id={SECTION_ANCHORS.contact}
      name="contact"
      no={useChapterNo(sections, "contact")}
      label={chapterLabel("contact", blueprint)}
      title={own}
      full
    >
      <div className="rs-visit" data-mode={inquiry ? "inquiry" : "visit"}>
        {(status || hours.length > 0) && (
          <div className="rs-visit-times">
            {status && (
              <p className="rs-status">
                <span className={status.live ? "rs-live" : undefined}>
                  {status.text}
                </span>
              </p>
            )}
            {hours.length > 0 && (
              <Hours
                hours={hours}
                label={hoursLabel}
                showTitle={Boolean(own) || inquiry}
              />
            )}
          </div>
        )}
        <div className="rs-visit-reach" {...SYS_ACTIONS}>
          {tel && section.phone && (
            <a className="rs-phone" href={tel}>
              {section.phone.trim()}
            </a>
          )}
          {(address || (mail && section.email)) && (
            <address className="rs-address">
              {address && <span>{address}</span>}
              {mail && section.email && <span>{section.email.trim()}</span>}
            </address>
          )}
          {blueprint.serviceArea && section.city && (
            <p className="rs-area">
              Einsatzgebiet: {section.city} und Umgebung
            </p>
          )}
          {inquiry && inquiryHref && (
            <p>
              <a className="rs-btn" href={inquiryHref}>
                {telLabel(blueprint.ctaText ?? "Anfrage senden", inquiryHref)}
              </a>
            </p>
          )}
          {/* Route steht als Karten-Fläche unten (ein Tab-Halt statt zwei). */}
          {(mail || whatsapp) && (
            <p className="rs-links">
              {mail && (
                <a className="rs-link" href={mail}>
                  E-Mail schreiben
                </a>
              )}
              {whatsapp && (
                <a className="rs-link" href={whatsapp} {...external}>
                  WhatsApp
                </a>
              )}
            </p>
          )}
          {route && (
            <a
              className="rs-map"
              href={route}
              aria-label={`${routeLabel}: ${address}`}
              {...external}
            >
              <span className="rs-map-dot" aria-hidden="true" />
              <span className="rs-map-label" aria-hidden="true">
                {routeLabel}
              </span>
            </a>
          )}
        </div>
      </div>
      {/* Das Formular ist die bestehende Kontakt-Insel (SiteIslands,
          data-target="#kontakt"); die Hydration hängt sie an diesen
          Abschnitt an. Hier nur ihr Titel — und nur, wenn sie rendert. */}
      {contactIsland && <h3 className="rs-form-title">Nachricht schreiben</h3>}
    </RasterChapter>
  );
}

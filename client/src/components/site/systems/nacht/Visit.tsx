import React from "react";
import type { SectionOf } from "../../../../../../shared/siteContract/types";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import { telHref } from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import {
  addressLine,
  isMapsHref,
  mailHref,
  mapsHref,
  newTabIfMaps,
  systemHref,
} from "../shared";
import { SYS_ACTIONS } from "../shared/dockAutoHide";
import { telLabel } from "../shared/contact";
import { knowIcon } from "./content";
import { hostOf, hoursTable, nachtActions } from "./facts";
import { Icon, wayIcon } from "./icons";
import { NachtChapter, chapterTitle } from "./sections";

/**
 * Besuch nach Systemblatt 11/12/16: „Gut zu wissen" als Liste mit Symbol
 * im Kupferring, Zeiten-Tabelle mit „heute" und — nur wenn der Text sie
 * nennt — Küchenspalte (hoursTable/kitchenOf), Anfahrt als nachtfarbene
 * Kartenkachel ohne Einbettung (keine Drittanbieter-Anfrage) mit Adresse,
 * Telefon, E-Mail und „Route planen" (neuer Tab), Reservierung als tiefes
 * Band (Telefon groß + Buchungslink mit Zielhost).
 */

export function NachtKnow({ section }: { section: SectionOf<"faq"> }) {
  if (section.items.length === 0) return null;
  return (
    <NachtChapter type="faq" own={section.headline}>
      <ul className="nc-know">
        {section.items.map((item, i) => (
          <li className="nc-know-item" key={`${item.question}-${i}`}>
            <span className="nc-ring" aria-hidden="true">
              <Icon name={knowIcon(item.question)} />
            </span>
            <div>
              <h3 className="nc-item-title">{rich(item.question)}</h3>
              <p className="nc-item-text">{rich(item.answer)}</p>
            </div>
          </li>
        ))}
      </ul>
    </NachtChapter>
  );
}

/** Generische Überschriften: dann trägt die Nacht-Wortwahl („Anfahrt"). */
const GENERIC_TITLE = /^(kontakt|contact)$/i;

/** Längere Zeilenköpfe („Feiertage und Brückentage") dürfen umbrechen. */
const LONG_LABEL = 12;

const EXTERNAL = { target: "_blank", rel: "noopener noreferrer" } as const;

/**
 * Kontakt: links die Zeiten (eigene h2), rechts die Anfahrt (h2 des
 * Kapitels); ohne Zeiten nur die Anfahrt. Darunter — nur wenn die
 * Kontakt-Insel rendert — ihr Titel; die Insel selbst hängt die
 * Hydration an diese <section> (data-target="#kontakt").
 */
export function NachtContact({ section }: { section: SectionOf<"contact"> }) {
  const { data, blueprint, now, contactIsland } = useSystem();
  const own =
    section.headline && !GENERIC_TITLE.test(section.headline.trim())
      ? section.headline
      : undefined;
  const rows = hoursTable(section.openingHours, now);
  const kitchen = rows.some(r => r.kitchen);
  const address = addressLine(section);
  const route = address ? mapsHref(address) : undefined;
  const phone = section.phone?.trim();
  const tel = telHref(phone);
  const email = section.email?.trim();
  const mail = mailHref(email);
  const place = Boolean(address || tel || mail);
  const id = SECTION_ANCHORS.contact;
  const hoursId = place ? `${id}-zeiten` : `${id}-titel`;
  const hoursTitle = blueprint.hoursLabel ?? "Öffnungszeiten";
  return (
    <section
      id={id}
      className="nc-sec nc-contact"
      aria-labelledby={`${id}-titel`}
    >
      <div
        className={
          rows.length && place
            ? "nc-wrap nc-visit"
            : "nc-wrap nc-visit nc-visit--solo"
        }
      >
        {rows.length > 0 && (
          <div className="nc-visit-hours">
            <h2 className="nc-h2" id={hoursId}>
              {hoursTitle}
            </h2>
            <table className="nc-hours" aria-labelledby={hoursId}>
              {kitchen && (
                <thead>
                  <tr>
                    <th scope="col">Tag</th>
                    <th scope="col">Geöffnet</th>
                    <th scope="col">Küche</th>
                  </tr>
                </thead>
              )}
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={`${r.label}-${i}`}
                    className={
                      r.today ? "nc-now" : r.closed ? "nc-zu" : undefined
                    }
                  >
                    <th
                      scope="row"
                      className={
                        r.label.length > LONG_LABEL ? "nc-hd--long" : undefined
                      }
                    >
                      {r.label}
                      {r.today && <span className="nc-now-tag">heute</span>}
                    </th>
                    <td className={r.spans ? "nc-hv" : "nc-hv nc-hv--text"}>
                      {r.lines.map((l, k) => (
                        <span key={k}>{l}</span>
                      ))}
                    </td>
                    {kitchen && (
                      <td className="nc-hk">
                        {r.kitchen && `bis ${r.kitchen}`}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {place && (
          <div className="nc-visit-place">
            <h2 className="nc-h2" id={`${id}-titel`}>
              {rich(chapterTitle("contact", own, blueprint))}
            </h2>
            <div className="nc-map">
              {address && (
                <div className="nc-map-tile" aria-hidden="true">
                  <span className="nc-map-water" />
                  <span className="nc-map-pin" />
                </div>
              )}
              <div className="nc-map-body">
                {address && (
                  <p className="nc-map-adr">
                    {section.street?.trim()}
                    {section.street?.trim() && <br />}
                    {[section.zip, section.city].filter(Boolean).join(" ")}
                  </p>
                )}
                <div className="nc-map-ways" {...SYS_ACTIONS}>
                  {tel && phone && (
                    <a className="nc-way" href={tel}>
                      <Icon name="phone" />
                      {phone}
                    </a>
                  )}
                  {mail && email && (
                    <a className="nc-way" href={mail}>
                      <Icon name="mail" />
                      {email}
                    </a>
                  )}
                  {route && (
                    <a className="nc-btn nc-btn--s" href={route} {...EXTERNAL}>
                      <Icon name="pin" />
                      Route planen
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {!place && rows.length === 0 && (
          <h2 className="nc-h2" id={`${id}-titel`}>
            {rich(chapterTitle("contact", own, blueprint))}
          </h2>
        )}
      </div>
      {contactIsland && (
        <div className="nc-wrap">
          <h3 className="nc-form-title">Nachricht schreiben</h3>
        </div>
      )}
    </section>
  );
}

/**
 * Reservierung als tiefes Band (Systemblatt 11/16): Titel des Abschnitts,
 * „Anrufen" mit der Nummer groß, dann der Hauptknopf — eigenes Ziel, wenn
 * es trägt (systemHref), sonst der Hauptweg (nachtActions). Ruft der
 * Knopf nur an, steht die Nummer allein. Ein Buchungslink nennt seinen
 * Zielhost („öffnet tisch.weinberg.example").
 */
export function NachtCta({
  section,
  anchorPrefix,
}: {
  section: SectionOf<"cta">;
  anchorPrefix: string;
}) {
  const { data, blueprint } = useSystem();
  const ways = nachtActions(data, blueprint, anchorPrefix);
  const own = systemHref(section.ctaHref, data, anchorPrefix);
  const href = own ?? ways.primary?.href;
  const text = section.ctaText?.trim() || ways.primary?.label;
  const label = text && telLabel(text, href);
  const phone = ways.phone;
  const button =
    href && label && href !== phone?.href ? { href, label } : undefined;
  const host =
    button && !isMapsHref(button.href) ? hostOf(button.href) : undefined;
  return (
    <NachtChapter type="cta" title={section.headline} className="nc-band">
      {(phone || button) && (
        <div className="nc-band-ways" {...SYS_ACTIONS}>
          {phone && (
            <a className="nc-band-tel" href={phone.href}>
              <small>Anrufen</small>
              {phone.label}
            </a>
          )}
          {button && (
            <div className="nc-band-go">
              <a
                className="nc-btn nc-btn--p"
                href={button.href}
                {...newTabIfMaps(button.href)}
              >
                {button.label}
                <Icon name={wayIcon(button.href)} />
              </a>
              {host && <p className="nc-band-host">öffnet {host}</p>}
            </div>
          )}
        </div>
      )}
    </NachtChapter>
  );
}

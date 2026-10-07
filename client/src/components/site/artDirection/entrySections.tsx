/**
 * Abschnitte der Seiten mit den Einstiegen „Bühne"/„Farbfläche"
 * (2026-10-05/06). Die Packs rendern ihre Abschnitte sonst selbst; für die
 * neuen Einstiege gibt es eine gemeinsame, hochwertige Fassung — Farben und
 * Schriften kommen weiter aus den Pack-Variablen, die Sprache aus dem
 * Branchen-Bauplan (shared/stylePacks/blueprints.ts).
 *
 * Anker bleiben die alten (#leistungen, #galerie, #kontakt …): Studio,
 * Galerie-Lightbox und Kontaktformular-Insel hängen daran.
 */
import { galleryIsStock } from "../PhotoCredits";
import React, { createContext, useContext } from "react";
import type {
  SectionOf,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../shared/siteContract/types";
import {
  artComposition,
  entryVariantIndex,
} from "../../../../../shared/stylePacks/artDirection";
import {
  blueprintFor,
  type Blueprint,
} from "../../../../../shared/stylePacks/blueprints";
import { SECTION_ANCHORS } from "../engine";
import { LAYOUT_SLOT } from "../layoutSlots";
import { googleMapsUrl } from "../mapsLink";
import { rich } from "../richText";
import {
  EntryMenu,
  EntryMenuPlaceholder,
  gastroTrustFacts,
  menuPlaceholderShown,
  menuVisible,
} from "./entryGastro";
import {
  bandQuote,
  coversToday,
  isBandQuote,
  isPlaceholderHours,
  shortHours,
  telHref,
  whatsappHref,
} from "./heroFacts";

export type EntryComposition = "stage" | "colorfield";

/**
 * Gilt der neue Einstieg? Nur solange das Hero-Layout dazu passt — wählt der
 * Kunde im Studio ein anderes Layout, greift wieder der Pack-Look.
 */
export function activeEntry(data: WebsiteDataV2): EntryComposition | undefined {
  if (data.designRevision !== 2) return undefined;
  const profile = data.designProfile;
  const hero = data.sections.find(s => s.type === "hero");
  const hasImage =
    Boolean(hero && "imageUrl" in hero && hero.imageUrl) &&
    !profile?.hiddenElements?.includes("hero-media");
  if (!hasImage) return undefined;
  const preferred = artComposition(data);
  if (preferred === "stage" && profile?.heroLayout === "banner") return "stage";
  if (preferred === "colorfield" && profile?.heroLayout === "collage")
    return "colorfield";
  return undefined;
}

export type EntryState = {
  entry: EntryComposition;
  data: WebsiteDataV2;
  blueprint: Blueprint;
  /** Vorschau/Studio: Platzhalter für fehlende Extras zeigen. */
  preview: boolean;
  now: Date;
};

export const EntryContext = createContext<EntryState | undefined>(undefined);

/** Kontextwert für SiteRenderer — `undefined` = Pack rendert wie bisher. */
export function entryState(
  data: WebsiteDataV2,
  preview: boolean,
  now: Date
): EntryState | undefined {
  const entry = activeEntry(data);
  return entry
    ? {
        entry,
        data,
        blueprint: blueprintFor(
          data.businessCategory,
          data.businessName,
          data.blueprintFamily
        ),
        preview,
        now,
      }
    : undefined;
}

function Head({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="pb-entry-head">
      <h2>{rich(title)}</h2>
      {intro && <p>{rich(intro)}</p>}
    </header>
  );
}

/** Platzhalter nur in Vorschau/Studio — nie auf der Live-Seite. */
function Placeholder({
  title,
  text,
  kind,
}: {
  title: string;
  text: string;
  kind: "pricelist" | "team";
}) {
  return (
    <aside className="pb-entry-placeholder" data-kind={kind} aria-label={title}>
      <span className="pb-entry-placeholder-tag">Nur in deiner Vorschau</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {kind === "team" && (
        <span className="pb-entry-placeholder-faces" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
      )}
    </aside>
  );
}

function hasSection(data: WebsiteDataV2, type: SectionV2["type"]): boolean {
  return (
    data.sections.some(s => s.type === type) &&
    !data.hiddenSections?.includes(type)
  );
}

function formatRating(rating: number): string {
  return rating.toLocaleString("de-DE", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

function EntryServices({
  section,
  state,
}: {
  section: SectionOf<"services">;
  state: EntryState;
}) {
  const showPrices =
    state.preview &&
    state.blueprint.placeholders.includes("pricelist") &&
    !hasSection(state.data, "pricelist");
  return (
    <>
      <section
        id={SECTION_ANCHORS.services}
        className="pb-entry-services"
        data-entry={state.entry}
      >
        <Head title={section.headline ?? "Leistungen"} intro={section.intro} />
        <ol className="pb-entry-list" data-pb-slot={LAYOUT_SLOT.servicesItems}>
          {section.items.map((item, i) => (
            <li key={item.title}>
              <span className="pb-entry-index" aria-hidden="true">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pb-entry-copy">
                <h3>{item.title}</h3>
                {item.description && <p>{rich(item.description)}</p>}
              </div>
              {item.price && (
                <span className="pb-entry-price">{item.price}</span>
              )}
            </li>
          ))}
        </ol>
        {showPrices && (
          <Placeholder
            kind="pricelist"
            title="Deine Preise"
            text={state.blueprint.placeholderText.pricelist ?? ""}
          />
        )}
      </section>
      {menuPlaceholderShown(state) && <EntryMenuPlaceholder state={state} />}
    </>
  );
}

function EntryAbout({
  section,
  state,
}: {
  section: SectionOf<"about">;
  state: EntryState;
}) {
  const image =
    section.imageUrl &&
    !state.data.designProfile?.hiddenElements?.includes("about-media")
      ? section.imageUrl
      : undefined;
  const paragraphs = section.body.split(/\n{2,}/).filter(p => p.trim());
  return (
    <section
      id={SECTION_ANCHORS.about}
      className="pb-entry-about"
      data-entry={state.entry}
      data-image={image ? "yes" : "no"}
    >
      {image && (
        <figure className="pb-entry-about-media">
          <img src={image} alt="" loading="lazy" />
        </figure>
      )}
      <div className="pb-entry-about-copy">
        <Head title={section.headline ?? "Über uns"} />
        {paragraphs.map((p, i) => (
          <p key={i}>{rich(p)}</p>
        ))}
      </div>
    </section>
  );
}

function EntryGallery({
  section,
  state,
}: {
  section: SectionOf<"gallery">;
  state: EntryState;
}) {
  const showTeam =
    state.preview &&
    state.blueprint.placeholders.includes("team") &&
    !hasSection(state.data, "team");
  return (
    <>
      <section
        id={SECTION_ANCHORS.gallery}
        className="pb-entry-gallery"
        data-entry={state.entry}
      >
        <Head
          title={
            // Stockfotos nicht als „Referenzen" ausgeben (2026-10-07).
            galleryIsStock(state.data)
              ? "Einblicke"
              : (section.headline ?? "Einblicke")
          }
        />
        <div
          className="pb-entry-gallery-grid"
          data-pb-slot={LAYOUT_SLOT.galleryItems}
        >
          {section.images.map(image => (
            <figure key={image.url}>
              <img src={image.url} alt={image.alt ?? ""} loading="lazy" />
            </figure>
          ))}
        </div>
      </section>
      {showTeam && (
        <section className="pb-entry-team-slot" data-entry={state.entry}>
          <Placeholder
            kind="team"
            title="Euer Team"
            text={state.blueprint.placeholderText.team ?? ""}
          />
        </section>
      )}
    </>
  );
}

function EntryReviews({
  section,
  state,
}: {
  section: SectionOf<"testimonials">;
  state: EntryState;
}) {
  const google = state.data.google;
  // Das Zitat aus dem Band unter dem Einstieg nicht noch einmal zeigen.
  const band = bandQuote(
    section.items,
    google,
    entryVariantIndex(
      state.data.stylePackId,
      state.data.designProfile?.entryVariant
    )
  );
  return (
    <section
      id={SECTION_ANCHORS.testimonials}
      className="pb-entry-reviews"
      data-entry={state.entry}
    >
      <div className="pb-entry-reviews-score">
        <Head title={section.headline ?? "Bewertungen"} />
        {google && (
          <p
            className="pb-entry-score"
            aria-label={`${formatRating(google.rating)} von 5 Sternen bei ${google.reviewCount} Google-Bewertungen`}
          >
            <b aria-hidden="true">{formatRating(google.rating)}</b>
            <span aria-hidden="true">
              <span className="pb-entry-stars">★★★★★</span>
              {google.reviewCount.toLocaleString("de-DE")} Bewertungen auf
              Google
            </span>
          </p>
        )}
      </div>
      <div className="pb-entry-reviews-list">
        {section.items
          .filter(item => !isBandQuote(item, band))
          .slice(0, 3)
          .map((item, i) => (
            <blockquote key={i}>
              <p>{item.text}</p>
              <footer>{item.author} · Google-Bewertung</footer>
            </blockquote>
          ))}
      </div>
    </section>
  );
}

function EntryFaq({
  section,
  state,
}: {
  section: SectionOf<"faq">;
  state: EntryState;
}) {
  return (
    <section
      id={SECTION_ANCHORS.faq}
      className="pb-entry-faq"
      data-entry={state.entry}
    >
      <Head title={section.headline ?? "Gut zu wissen"} />
      <div className="pb-entry-faq-list">
        {section.items.map(item => (
          <details key={item.question}>
            <summary>{item.question}</summary>
            <p>{rich(item.answer)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function EntryVisit({
  section,
  state,
}: {
  section: SectionOf<"contact">;
  state: EntryState;
}) {
  const route = googleMapsUrl(section.street, section.zip, section.city);
  const tel = telHref(section.phone);
  const whatsapp = whatsappHref(section.phone);
  // Unterkunft/Sofort-Dienst: „Mo–Fr 9–17" passt nicht — Platzhalter weglassen.
  const hours =
    (state.blueprint.id === "stay" || state.blueprint.id === "urgent") &&
    isPlaceholderHours(section.openingHours)
      ? []
      : (section.openingHours ?? []);
  const place = [section.zip, section.city].filter(Boolean).join(" ");
  // Handwerk (2026-10-06): Man besucht keinen Laden, man fragt ein Angebot an.
  const inquiry = state.blueprint.contactMode === "inquiry";
  // Gastro (2026-10-06): „Tisch reservieren"/„Jetzt bestellen" per Anruf vorn.
  const hero = state.data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const callCta =
    state.blueprint.ctaAction === "tel" &&
    hero?.ctaText &&
    hero.ctaHref?.startsWith("tel:")
      ? { text: hero.ctaText, href: hero.ctaHref }
      : undefined;
  const inquiryHref = section.email
    ? `mailto:${section.email}?subject=${encodeURIComponent(`Anfrage über die Website – ${state.data.businessName}`)}`
    : tel;
  return (
    <section
      id={SECTION_ANCHORS.contact}
      className="pb-entry-visit"
      data-mode={inquiry ? "inquiry" : "visit"}
      data-entry={state.entry}
    >
      <div className="pb-entry-visit-main">
        <Head title={section.headline ?? "Kontakt"} />
        {(section.street || place) && (
          <address>
            {section.street && <span>{section.street}</span>}
            {place && <span>{place}</span>}
          </address>
        )}
        {state.blueprint.serviceArea && section.city && (
          <p className="pb-entry-area">
            Einsatzgebiet: {section.city} und Umgebung
          </p>
        )}
        <div className="pb-entry-visit-actions">
          {callCta && (
            <a
              className="pb-entry-btn pb-entry-btn-primary"
              href={callCta.href}
            >
              {callCta.text}
            </a>
          )}
          {inquiry && inquiryHref && (
            <a className="pb-entry-btn pb-entry-btn-primary" href={inquiryHref}>
              {state.blueprint.ctaText ?? "Anfrage senden"}
            </a>
          )}
          {route && (
            <a
              className={`pb-entry-btn${inquiry || callCta ? "" : " pb-entry-btn-primary"}`}
              href={route}
              target="_blank"
              rel="noopener noreferrer"
            >
              {inquiry ? "Anfahrt" : "Route planen"}
            </a>
          )}
          {tel && (
            <a className="pb-entry-btn" href={tel}>
              {section.phone}
            </a>
          )}
          {whatsapp && (
            <a
              className="pb-entry-btn"
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>
          )}
        </div>
        {section.email && (
          <p className="pb-entry-visit-mail">
            <a href={`mailto:${section.email}`}>{section.email}</a>
          </p>
        )}
      </div>
      {hours.length > 0 && (
        <div className="pb-entry-hours">
          <h3>{state.blueprint.hoursLabel ?? "Öffnungszeiten"}</h3>
          <dl>
            {hours.map(entry => {
              const today = coversToday(entry.day, state.now);
              return (
                <div key={entry.day} data-today={today ? "yes" : undefined}>
                  <dt>
                    {entry.day}
                    {today && <em>heute</em>}
                  </dt>
                  <dd>
                    {/geschlossen|closed|ruhetag/i.test(entry.hours)
                      ? "geschlossen"
                      : shortHours(entry.hours)}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      )}
    </section>
  );
}

function EntryProcess({
  section,
  state,
}: {
  section: SectionOf<"process">;
  state: EntryState;
}) {
  return (
    <section
      id={SECTION_ANCHORS.process}
      className="pb-entry-process"
      data-entry={state.entry}
    >
      <Head title={section.headline ?? "So läuft's ab"} />
      <ol className="pb-entry-steps">
        {section.steps.map((step, i) => (
          <li key={step.title}>
            <span className="pb-entry-step-num" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3>{step.title}</h3>
            {step.text && <p>{rich(step.text)}</p>}
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Abschnittstypen mit eigener Fassung bei den neuen Einstiegen. */
export const ENTRY_SECTION_TYPES = [
  "services",
  "about",
  "gallery",
  "testimonials",
  "faq",
  "contact",
  "process",
  "menu",
] as const;
type EntrySectionType = (typeof ENTRY_SECTION_TYPES)[number];

export function isEntrySection(
  section: unknown
): section is SectionOf<EntrySectionType> {
  const type = (section as { type?: unknown } | null)?.type;
  return (ENTRY_SECTION_TYPES as readonly unknown[]).includes(type);
}

function renderEntry(
  section: SectionOf<EntrySectionType>,
  state: EntryState
): React.ReactNode {
  switch (section.type) {
    case "services":
      return <EntryServices section={section} state={state} />;
    case "about":
      return <EntryAbout section={section} state={state} />;
    case "gallery":
      return <EntryGallery section={section} state={state} />;
    case "testimonials":
      return <EntryReviews section={section} state={state} />;
    case "faq":
      return <EntryFaq section={section} state={state} />;
    case "contact":
      return <EntryVisit section={section} state={state} />;
    case "process":
      return <EntryProcess section={section} state={state} />;
    case "menu":
      return <EntryMenu section={section} state={state} />;
  }
}

/**
 * Wählt zur Renderzeit zwischen Pack-Abschnitt und Einstiegs-Fassung.
 * Als Komponente, weil nur so der Kontext lesbar ist — die Packs rufen
 * `renderSection` als Funktion auf.
 */
export function EntrySectionSwitch({
  section,
  fallback,
  decorate,
}: {
  section: SectionOf<EntrySectionType>;
  fallback: () => React.ReactNode;
  decorate: (node: React.ReactNode) => React.ReactNode;
}) {
  const state = useContext(EntryContext);
  return <>{decorate(state ? renderEntry(section, state) : fallback())}</>;
}

/**
 * Vertrauensleiste unter dem Einstieg (Handwerk, 2026-10-06): nur Belegtes —
 * Google-Wert, Meistertitel aus dem Namen, Einsatzgebiet aus dem Ort.
 */
/** `weak` = Ort oder Bewertungszahl: allein tragen sie keine Leiste (2026-10-07). */
type Fact = { value: string; label: string; weak?: boolean };

/** Kontaktwege nur, wenn WhatsApp dabei ist — „Telefon & E-Mail" hat jeder. */
function channelFact(contact: SectionOf<"contact"> | undefined): Fact | null {
  if (!whatsappHref(contact?.phone)) return null;
  return { value: "Telefon & WhatsApp", label: "direkt erreichbar" };
}

export function trustFacts(data: WebsiteDataV2): Fact[] {
  // Die Google-Note steht schon im Einstieg — hier nur, was dort fehlt.
  const contact = data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const facts: Fact[] = [];
  if (/meister/i.test(data.businessName))
    facts.push({ value: "Meister", label: "Meisterbetrieb" });
  if (contact?.city)
    facts.push({ value: contact.city, label: "und Umgebung", weak: true });
  if (/notdienst/i.test(data.businessName))
    facts.push({ value: "Notdienst", label: "erreichbar" });
  const channel = channelFact(contact);
  if (channel) facts.push(channel);
  if (data.google && data.google.reviewCount > 0)
    facts.push({
      value: data.google.reviewCount.toLocaleString("de-DE"),
      label: "Bewertungen auf Google",
      // Steht schon im Einstieg — trägt die Leiste nicht allein.
      weak: true,
    });
  return facts.slice(0, 4);
}

/** Leiste für Betriebe mit Adresse (Praxis, Laden, Werkstatt …). */
export function visitTrustFacts(data: WebsiteDataV2): Fact[] {
  const contact = data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const facts: Fact[] = [];
  if (/meister/i.test(data.businessName))
    facts.push({ value: "Meister", label: "Meisterbetrieb" });
  if (contact?.street && contact.city)
    facts.push({ value: contact.city, label: contact.street, weak: true });
  if (data.amenities?.wheelchair)
    facts.push({ value: "Barrierefrei", label: "rollstuhlgerechter Eingang" });
  const channel = channelFact(contact);
  if (channel) facts.push(channel);
  if (data.google && data.google.reviewCount > 0)
    facts.push({
      value: data.google.reviewCount.toLocaleString("de-DE"),
      label: "Bewertungen auf Google",
      // Steht schon im Einstieg — trägt die Leiste nicht allein.
      weak: true,
    });
  return facts.slice(0, 4);
}

export function EntryTrust() {
  const state = useContext(EntryContext);
  if (!state?.blueprint.trust) return null;
  const facts =
    state.blueprint.id === "gastro"
      ? gastroTrustFacts(state.data)
      : state.blueprint.serviceArea
        ? trustFacts(state.data)
        : visitTrustFacts(state.data);
  // Ohne echten Fakt (nur Ort) keine Leiste — sonst steht Füllstoff da.
  if (facts.length < 2 || facts.every(f => (f as Fact).weak)) return null;
  return (
    <aside className="pb-entry-trust" aria-label="Auf einen Blick">
      {facts.map(fact => (
        <p key={fact.label}>
          <b>{fact.value}</b>
          <span>{fact.label}</span>
        </p>
      ))}
    </aside>
  );
}

/** Karten-Platzhalter direkt unter dem Einstieg (nur Vorschau, Gastro). */
export function EntryMenuSlot() {
  const state = useContext(EntryContext);
  // Mit Sortiment (Café/Bäckerei) steht der Platzhalter unter der Liste.
  return state &&
    menuPlaceholderShown(state) &&
    !hasSection(state.data, "services") ? (
    <EntryMenuPlaceholder state={state} />
  ) : null;
}

/**
 * Feste Leiste am unteren Rand (nur Handy): Anrufen · Termin · Route — die
 * drei Dinge, für die man eine Betriebsseite auf dem Handy öffnet.
 */
export function EntryDock() {
  const state = useContext(EntryContext);
  if (!state) return null;
  const contact = state.data.sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const hero = state.data.sections.find(
    (s): s is SectionOf<"hero"> => s.type === "hero"
  );
  const tel = telHref(contact?.phone);
  const route = googleMapsUrl(contact?.street, contact?.zip, contact?.city);
  const items: { label: string; href: string; external?: boolean }[] = [];
  const ctaHref = hero?.ctaHref ?? `#${SECTION_ANCHORS.contact}`;
  // Ruft die Hauptaktion schon an (Gastro: „Tisch reservieren"), entfällt
  // der eigene Anruf-Knopf.
  if (tel && !ctaHref.startsWith("tel:"))
    items.push({ label: "Anrufen", href: tel });
  if (hero?.ctaText)
    items.push({
      label: hero.ctaText,
      href: ctaHref,
      external: ctaHref.startsWith("http"),
    });
  const whatsapp = whatsappHref(contact?.phone);
  if (state.blueprint.id === "gastro" && menuVisible(state.data))
    items.push({ label: "Karte", href: `#${SECTION_ANCHORS.menu}` });
  if (state.blueprint.contactMode === "inquiry" && whatsapp)
    items.push({ label: "WhatsApp", href: whatsapp, external: true });
  else if (route && !ctaHref.startsWith("http") && items.length < 3)
    items.push({ label: "Route", href: route, external: true });
  if (items.length < 2) return null;
  return (
    <nav className="pb-entry-dock" aria-label="Schnellzugriff">
      {items.map(item => (
        <a
          key={item.label}
          href={item.href}
          data-primary={item.label === hero?.ctaText ? "yes" : undefined}
          {...(item.external
            ? { target: "_blank", rel: "noopener noreferrer" }
            : {})}
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}

const S = '.pb-site[data-pb-revision="2"]';
const INLINE =
  "max(var(--pb-shell-pad,6.5%),calc((100% - var(--pb-shell-outer,1600px))/2 + var(--pb-shell-pad,6.5%)))";
const BLOCKS =
  ":is(.pb-entry-services,.pb-entry-about,.pb-entry-gallery,.pb-entry-reviews,.pb-entry-faq,.pb-entry-visit,.pb-entry-team-slot)";

export const ENTRY_SECTIONS_CSS = `
${S} ${BLOCKS}{box-sizing:border-box;padding:clamp(72px,9vw,140px) ${INLINE};color:var(--pb-ink);background:var(--pb-canvas)}
${S} .pb-entry-head h2{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,500);color:var(--pb-ink);font-size:clamp(2.4rem,4.6vw,4.6rem);line-height:1.02;letter-spacing:-.035em}
${S} .pb-entry-head p{margin:18px 0 0;max-width:42ch;color:var(--pb-muted);font:400 clamp(1rem,1.2vw,1.15rem)/1.6 var(--pb-font-body)}
${S} .pb-entry-list{list-style:none;margin:0;padding:0}
${S} .pb-entry-list li{display:grid;grid-template-columns:56px minmax(0,1fr) auto;gap:8px 18px;align-items:baseline;padding:26px 0;border-bottom:1px solid var(--pb-line)}
${S} .pb-entry-index{font:500 13px/1 var(--pb-font-body);color:var(--pb-art-accent-text,var(--pb-accent));letter-spacing:.06em}
${S} .pb-entry-copy h3{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,600);font-size:clamp(1.35rem,2vw,1.9rem);line-height:1.15;letter-spacing:-.02em;color:var(--pb-ink)}
${S} .pb-entry-copy p{margin:8px 0 0;max-width:56ch;color:var(--pb-muted);font:400 16px/1.55 var(--pb-font-body)}
${S} .pb-entry-price{font:600 15px/1.3 var(--pb-font-body);white-space:nowrap;color:var(--pb-ink)}
${S} .pb-entry-services[data-entry="stage"]{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,6vw,96px);align-items:start}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-head{position:sticky;top:110px}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-head h2{font-size:clamp(2.6rem,5.4vw,5.6rem);line-height:.98;letter-spacing:-.045em}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-list{border-top:1px solid var(--pb-line)}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-placeholder{grid-column:2}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-head{margin-bottom:clamp(32px,4vw,56px)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-list li{grid-template-columns:minmax(0,1fr) auto;border-bottom:1.5px dotted color-mix(in srgb,var(--pb-ink) 30%,transparent)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-index{display:none}
${S} .pb-entry-placeholder{position:relative;margin-top:32px;padding:clamp(22px,3vw,34px);border:1.5px dashed color-mix(in srgb,var(--pb-ink) 35%,transparent);border-radius:14px;background:color-mix(in srgb,var(--pb-accent) 6%,transparent)}
${S} .pb-entry-placeholder h3{margin:12px 0 6px;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,600);font-size:clamp(1.3rem,2vw,1.8rem);line-height:1.15;color:var(--pb-ink)}
${S} .pb-entry-placeholder p{margin:0;max-width:60ch;color:var(--pb-muted);font:400 15px/1.55 var(--pb-font-body)}
${S} .pb-entry-placeholder-tag{display:inline-block;padding:4px 10px;border-radius:999px;background:var(--pb-accent);color:var(--pb-accent-contrast);font:600 11px/1.3 var(--pb-font-body);letter-spacing:.06em;text-transform:uppercase}
${S} .pb-entry-placeholder-faces{display:flex;gap:14px;margin-top:20px}
${S} .pb-entry-placeholder-faces i{width:72px;height:72px;border-radius:50%;background:color-mix(in srgb,var(--pb-ink) 10%,transparent);border:1.5px dashed color-mix(in srgb,var(--pb-ink) 30%,transparent)}
${S} .pb-entry-team-slot{padding-top:0!important}
${S} .pb-entry-about{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,6fr);gap:clamp(32px,6vw,96px);align-items:center;background:var(--pb-surface)}
${S} .pb-entry-about[data-image="no"]{grid-template-columns:minmax(0,1fr)}
${S} .pb-entry-about-media{margin:0;aspect-ratio:4/5;overflow:hidden;border-radius:16px}
${S} .pb-entry-about-media img{display:block;width:100%;height:100%;object-fit:cover}
${S} .pb-entry-about-copy p{margin:22px 0 0;max-width:52ch;color:var(--pb-ink);font:400 clamp(1.05rem,1.35vw,1.25rem)/1.65 var(--pb-font-body)}
${S} .pb-entry-about[data-entry="stage"] .pb-entry-about-media{order:2}
${S} .pb-entry-gallery .pb-entry-head{margin-bottom:clamp(28px,3.5vw,48px)}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid[data-pb-slot]{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-auto-rows:clamp(150px,17vw,260px)!important;gap:clamp(8px,1vw,14px)!important;columns:auto!important}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid[data-pb-slot]>figure{margin:0;overflow:hidden;border-radius:12px;grid-column:auto!important;width:auto!important;height:auto!important}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid[data-pb-slot]>figure:first-child{grid-column:span 2!important;grid-row:span 2}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid[data-pb-slot]>figure:first-child:nth-last-child(3)~figure{grid-column:span 2!important}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid img{display:block;width:100%;height:100%;object-fit:cover;transition:transform .6s var(--pb-art-ease,ease)}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid figure:hover img{transform:scale(1.03)}
${S} .pb-entry-reviews{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(32px,6vw,96px);align-items:start}
${S} .pb-entry-score{display:flex;align-items:center;gap:16px;margin:28px 0 0}
${S} .pb-entry-score b{font-family:var(--pb-font-display);font-weight:600;font-size:clamp(3.6rem,6vw,5.6rem);line-height:.9;letter-spacing:-.04em;color:var(--pb-ink)}
${S} .pb-entry-score>span{display:grid;gap:4px;font:400 14px/1.4 var(--pb-font-body);color:var(--pb-muted)}
${S} .pb-entry-stars{letter-spacing:2px;color:#e8a92e;font-size:15px}
${S} .pb-entry-reviews-list{display:grid;gap:18px}
${S} #bewertungen.pb-entry-reviews blockquote{margin:0;padding:clamp(22px,2.6vw,32px);border:1px solid var(--pb-line);border-radius:14px;background:var(--pb-surface);display:block}
${S} #bewertungen.pb-entry-reviews blockquote p{margin:0;max-width:none;font:400 clamp(1.05rem,1.3vw,1.2rem)/1.55 var(--pb-font-body);color:var(--pb-ink)}
${S} #bewertungen.pb-entry-reviews blockquote footer{margin-top:14px;padding:0;border:0;font:500 12px/1.4 var(--pb-font-body);letter-spacing:.08em;text-transform:uppercase;color:var(--pb-muted)}
${S} .pb-entry-faq{display:grid;grid-template-columns:minmax(0,4fr) minmax(0,8fr);gap:clamp(32px,6vw,96px);align-items:start;background:var(--pb-surface)}
${S} .pb-entry-faq-list{border-top:1px solid var(--pb-line)}
${S} .pb-entry-faq details{border-bottom:1px solid var(--pb-line)}
${S} .pb-entry-faq summary{list-style:none;display:flex;justify-content:space-between;gap:20px;padding:24px 0;cursor:pointer;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,600);font-size:clamp(1.1rem,1.6vw,1.4rem);line-height:1.3;color:var(--pb-ink)}
${S} .pb-entry-faq summary::-webkit-details-marker{display:none}
${S} .pb-entry-faq summary:after{content:'+';font:300 28px/1 var(--pb-font-body);color:var(--pb-art-accent-text,var(--pb-accent));transition:transform .2s}
${S} .pb-entry-faq details[open] summary:after{transform:rotate(45deg)}
${S} .pb-entry-faq details p{margin:0 0 24px;max-width:60ch;color:var(--pb-muted);font:400 16px/1.6 var(--pb-font-body)}
${S} .pb-entry-visit{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(32px,6vw,96px);align-items:start}
${S} .pb-entry-visit address{display:grid;gap:4px;margin:26px 0 0;font-family:var(--pb-font-display);font-weight:500;font-size:clamp(1.3rem,2vw,1.8rem);line-height:1.3;font-style:normal;color:var(--pb-ink)}
${S} .pb-entry-visit-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:28px}
${S} .pb-entry-btn{display:inline-flex;align-items:center;padding:15px 22px;border:1px solid var(--pb-ink);border-radius:var(--pb-radius-button,0);color:var(--pb-ink);font:500 15px/1.3 var(--pb-font-body);text-decoration:none;transition:background .2s,color .2s}
${S} .pb-entry-btn:hover{background:var(--pb-ink);color:var(--pb-canvas)}
${S} .pb-entry-btn-primary{background:var(--pb-accent);border-color:var(--pb-accent);color:var(--pb-accent-contrast)}
${S} .pb-entry-visit-mail{margin:18px 0 0;font:400 15px/1.5 var(--pb-font-body)}
${S} .pb-entry-visit-mail a{color:var(--pb-ink)}
${S} .pb-entry-hours{padding:clamp(22px,3vw,34px);border-radius:16px;background:var(--pb-surface)}
${S} .pb-entry-hours h3{margin:0 0 14px;font:600 13px/1.3 var(--pb-font-body);letter-spacing:.1em;text-transform:uppercase;color:var(--pb-muted)}
${S} .pb-entry-hours dl{margin:0}
${S} .pb-entry-hours dl>div{display:flex;justify-content:space-between;gap:16px;padding:10px 0;border-bottom:1px solid var(--pb-line);font:400 15px/1.4 var(--pb-font-body);color:var(--pb-muted)}
${S} .pb-entry-hours dl>div:last-child{border-bottom:0}
${S} .pb-entry-hours :is(dt,dd){margin:0}
${S} .pb-entry-hours [data-today] :is(dt,dd){font-weight:700;color:var(--pb-ink)}
${S} .pb-entry-hours em{margin-left:8px;padding:2px 8px;border-radius:999px;background:var(--pb-accent);color:var(--pb-accent-contrast);font:600 11px/1.4 var(--pb-font-body);font-style:normal;letter-spacing:.04em}
${S} .pb-entry-visit>.pb-island{grid-column:1/-1}
${S} .pb-entry-dock{display:none}
${S} .pb-entry-trust{box-sizing:border-box;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:0;padding:0 ${INLINE};background:var(--pb-surface,var(--pb-canvas));color:var(--pb-ink);border-bottom:1px solid var(--pb-line)}
${S} .pb-entry-trust p{margin:0;padding:clamp(22px,2.6vw,34px) clamp(14px,2vw,28px);border-left:1px solid var(--pb-line);display:grid;gap:4px}
${S} .pb-entry-trust p:first-child{border-left:0;padding-left:0}
${S} .pb-entry-trust b{font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,600);font-size:clamp(1.6rem,2.6vw,2.4rem);line-height:1;letter-spacing:-.02em}
${S} .pb-entry-trust span{font:400 13px/1.4 var(--pb-font-body);color:var(--pb-muted)}
${S} .pb-entry-trust b{color:var(--pb-ink)}
${S} .pb-entry-trust p:first-child b{color:var(--pb-art-accent-text,var(--pb-accent))}
${S} .pb-entry-process{box-sizing:border-box;padding:clamp(72px,9vw,140px) ${INLINE};background:var(--pb-surface);color:var(--pb-ink)}
${S} .pb-entry-process .pb-entry-head{margin-bottom:clamp(32px,4vw,56px)}
${S} .pb-entry-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:clamp(18px,2.4vw,32px);counter-reset:none}
${S} .pb-entry-steps li{position:relative;padding-top:22px;border-top:2px solid var(--pb-ink)}
${S} .pb-entry-step-num{display:block;margin-bottom:14px;font:600 13px/1 var(--pb-font-body);letter-spacing:.08em;color:var(--pb-art-accent-text,var(--pb-accent))}
${S} .pb-entry-steps h3{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,600);font-size:clamp(1.25rem,1.8vw,1.6rem);line-height:1.2;color:var(--pb-ink)}
${S} .pb-entry-steps p{margin:10px 0 0;color:var(--pb-muted);font:400 15px/1.55 var(--pb-font-body)}
${S} .pb-entry-area{margin:18px 0 0;font:500 15px/1.4 var(--pb-font-body);color:var(--pb-muted)}
${S} .pb-entry-quote{box-sizing:border-box;padding:clamp(72px,9vw,136px) ${INLINE};text-align:center}
${S} .pb-entry-quote blockquote{margin:0 auto;max-width:none;border:0;padding:0}
${S} .pb-entry-quote p{margin:0;font-family:var(--pb-font-display);font-weight:var(--pb-art-weight,500);font-size:clamp(1.8rem,3.6vw,3.4rem);line-height:1.12;letter-spacing:-.025em;text-wrap:balance;max-width:24ch;margin-inline:auto}
${S} .pb-entry-quote footer{margin-top:22px;font:500 12px/1.4 var(--pb-font-body);letter-spacing:.12em;text-transform:uppercase;opacity:.65}
${S} .pb-entry-quote[data-entry="stage"]{background:var(--pb-art-quote-bg,var(--pb-accent));color:var(--pb-art-quote-ink,var(--pb-art-on-accent,#111))}
${S} .pb-entry-quote[data-entry="stage"] blockquote::before{content:"";display:block;width:56px;height:3px;margin:0 auto clamp(22px,2.6vw,34px);background:var(--pb-art-quote-rule,transparent)}
${S} .pb-entry-quote[data-entry="colorfield"]{background:var(--pb-canvas);color:var(--pb-ink);border-bottom:1px solid var(--pb-line)}
/* Die Layout-Varianten (designProfileCss, mit !important) gelten den
   Pack-Listen; die Einstiegsliste hat ihre eigene Ordnung. */
${S} #leistungen.pb-entry-services .pb-entry-list[data-pb-slot]{display:block!important;gap:0!important;background:transparent!important}
${S} #leistungen.pb-entry-services[data-entry="colorfield"] .pb-entry-list[data-pb-slot]{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;column-gap:clamp(32px,6vw,96px)!important;row-gap:0!important}
${S} #leistungen.pb-entry-services .pb-entry-list[data-pb-slot]>li{grid-column:auto!important;width:auto!important}
@media(max-width:760px){
${S} #leistungen.pb-entry-services[data-entry="colorfield"] .pb-entry-list[data-pb-slot]{grid-template-columns:1fr!important}
${S} ${BLOCKS}{padding:64px var(--pb-shell-pad,6%)}
${S} :is(.pb-entry-services[data-entry="stage"],.pb-entry-about,.pb-entry-reviews,.pb-entry-faq,.pb-entry-visit){grid-template-columns:1fr;gap:28px}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-head{position:static}
${S} .pb-entry-services[data-entry="stage"] .pb-entry-placeholder{grid-column:1}
${S} .pb-entry-list li{grid-template-columns:36px minmax(0,1fr);padding:22px 0}
${S} .pb-entry-price{grid-column:2}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-list li{grid-template-columns:minmax(0,1fr)}
${S} .pb-entry-services[data-entry="colorfield"] .pb-entry-price{grid-column:1}
${S} .pb-entry-about[data-entry="stage"] .pb-entry-about-media{order:0}
${S} .pb-entry-about-media{aspect-ratio:4/3}
${S} #galerie.pb-entry-gallery .pb-entry-gallery-grid[data-pb-slot]{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-auto-rows:42vw!important}
${S} .pb-entry-trust{grid-auto-flow:row;grid-template-columns:1fr 1fr;padding:0 var(--pb-shell-pad,6%)}
${S} .pb-entry-trust p{padding:18px 12px 18px 0;border-left:0;border-top:1px solid var(--pb-line)}
${S} .pb-entry-trust p:nth-child(-n+2){border-top:0}
${S} .pb-entry-trust p:last-child:nth-child(odd){grid-column:1/-1}
${S} .pb-entry-process{padding:64px var(--pb-shell-pad,6%)}
${S} .pb-entry-dock{position:fixed;left:12px;right:12px;bottom:12px;z-index:60;display:grid;grid-auto-flow:column;grid-auto-columns:1fr;gap:6px;padding:6px;border-radius:16px;background:color-mix(in srgb,var(--pb-ink) 92%,transparent);backdrop-filter:blur(10px);box-shadow:0 14px 30px -12px rgba(0,0,0,.45)}
${S} .pb-entry-dock a{display:flex;align-items:center;justify-content:center;min-height:46px;border-radius:11px;color:var(--pb-canvas);font:600 14px/1.2 var(--pb-font-body);text-decoration:none;text-align:center;border:0!important;box-shadow:none!important;background-image:none!important}
${S} .pb-entry-dock a[data-primary]{background:var(--pb-accent);color:var(--pb-accent-contrast)}
${S}:has(.pb-entry-dock) footer{padding-bottom:84px}
}
`;

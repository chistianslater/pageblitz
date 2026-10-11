import React from "react";
import { SECTION_ANCHORS } from "../../engine";
import { rich } from "../../richText";
import {
  isPlaceholderHours,
  pickReviewQuote,
  shortHours,
  telHref,
} from "../../artDirection/heroFacts";
import { useSystem } from "../SystemContext";
import { addressLine, mailHref } from "../shared";
import { WerkstoffChapter, chapterTitle, type WerkstoffSection } from "./sections";

/**
 * Grundform aller Inhaltsabschnitte (W2): Kapitelkopf nach Systemblatt und
 * der Inhalt als ruhige Liste mit Tinte-Linien. Die eigenen Bausteine
 * (Leistungsliste, Ziffern, Werkbank-Raster, Zeiten mit Heute …) ersetzen
 * diese Form abschnittsweise in W4–W6. Nur echte Daten, nichts erfunden.
 */
type ContentSection = Exclude<
  WerkstoffSection,
  { type: "hero" | "pageHeader" | "notice" }
>;

type Row = { title: string; text?: string; meta?: string };

function Rows({ rows }: { rows: Row[] }) {
  if (!rows.length) return null;
  return (
    <ul className="ws-rows">
      {rows.map((r, i) => (
        <li key={`${r.title}-${i}`}>
          <h3 className="ws-row-title">{rich(r.title)}</h3>
          {r.meta && <span className="ws-data ws-row-meta">{r.meta}</span>}
          {r.text && <p className="ws-row-text">{rich(r.text)}</p>}
        </li>
      ))}
    </ul>
  );
}

function rowsOf(section: ContentSection): Row[] {
  switch (section.type) {
    case "services":
      return section.items.map(i => ({
        title: i.title,
        text: i.description,
        meta: i.price,
      }));
    case "process":
      return section.steps.map(s => ({ title: s.title, text: s.text }));
    case "usp":
      return section.items.map(i => ({ title: i.title, text: i.text }));
    case "faq":
      return section.items.map(i => ({ title: i.question, text: i.answer }));
    case "stats":
      return section.items.map(i => ({ title: i.value, text: i.label }));
    case "team":
      return section.members.map(m => ({ title: m.name, text: m.role }));
    case "partners":
      return section.items.map(p => ({ title: p.name }));
    case "pricelist":
    case "menu":
      return section.categories.flatMap(c =>
        c.items.map(i => ({ title: i.name, text: i.description, meta: i.price }))
      );
    default:
      return [];
  }
}

function introOf(section: ContentSection): string | undefined {
  if (section.type === "services") return section.intro;
  if (section.type === "about" || section.type === "story") return section.body;
  return undefined;
}

function ownTitle(section: ContentSection): string | undefined {
  return "headline" in section ? section.headline : undefined;
}

function Contact({ section }: { section: Extract<ContentSection, { type: "contact" }> }) {
  const { contactIsland } = useSystem();
  const address = addressLine(section);
  const tel = telHref(section.phone);
  const mail = mailHref(section.email);
  const hours =
    section.openingHours?.length && !isPlaceholderHours(section.openingHours)
      ? section.openingHours
      : [];
  return (
    <div className="ws-contact">
      {hours.length > 0 && (
        <ul className="ws-hours">
          {hours.map((h, i) => (
            <li key={`${h.day}-${i}`}>
              <span>{h.day}</span>
              <span>{shortHours(h.hours)}</span>
            </li>
          ))}
        </ul>
      )}
      <address className="ws-contact-lines">
        {address && <p className="ws-contact-address">{address}</p>}
        {tel && section.phone && (
          <p>
            <a className="ws-link" href={tel}>
              {section.phone.trim()}
            </a>
          </p>
        )}
        {mail && section.email && (
          <p>
            <a className="ws-link" href={mail}>
              {section.email.trim()}
            </a>
          </p>
        )}
      </address>
      {/* Formular = Kontakt-Insel (SiteIslands, data-target="#kontakt"). */}
      {contactIsland && <h3 className="ws-form-title">Nachricht schreiben</h3>}
    </div>
  );
}

export function WerkstoffBasic({
  section,
}: {
  section: ContentSection;
  sections: readonly WerkstoffSection[];
}) {
  const { blueprint } = useSystem();
  const title = chapterTitle(
    section.type,
    section.type === "quote" ? undefined : ownTitle(section),
    blueprint
  );
  const id = SECTION_ANCHORS[section.type];
  if (section.type === "quote") {
    return (
      <section id={id} className="ws-sec ws-quote" aria-label="Zitat">
        <div className="ws-wrap">
          <blockquote className="ws-quote-text">„{rich(section.text)}“</blockquote>
        </div>
      </section>
    );
  }
  if (section.type === "testimonials") {
    const quote = pickReviewQuote(section.items);
    return (
      <WerkstoffChapter id={id} name="testimonials" title={title}>
        {quote && (
          <figure className="ws-voice">
            <blockquote className="ws-quote-text">„{quote.text}“</blockquote>
            <figcaption className="ws-voice-who">{quote.author}</figcaption>
          </figure>
        )}
      </WerkstoffChapter>
    );
  }
  if (section.type === "gallery") {
    return (
      <WerkstoffChapter id={id} name="gallery" title={title}>
        <div className="ws-shots">
          {section.images.map((img, i) => (
            <figure key={`${img.url}-${i}`}>
              <img src={img.url} alt={img.alt} loading="lazy" width={800} height={600} />
              {img.caption && <figcaption className="ws-data">{img.caption}</figcaption>}
            </figure>
          ))}
        </div>
      </WerkstoffChapter>
    );
  }
  if (section.type === "cta") {
    return (
      <WerkstoffChapter id={id} name="cta" title={title}>
        <p>
          <a className="ws-btn" href={section.ctaHref ?? `#${SECTION_ANCHORS.contact}`}>
            {section.ctaText}
          </a>
        </p>
      </WerkstoffChapter>
    );
  }
  return (
    <WerkstoffChapter
      id={id}
      name={section.type}
      title={title}
      intro={introOf(section)}
    >
      {section.type === "contact" ? (
        <Contact section={section} />
      ) : (
        <Rows rows={rowsOf(section)} />
      )}
    </WerkstoffChapter>
  );
}

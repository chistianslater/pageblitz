import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { ZUNFT_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Unsere Geschichte",
  gallery: "Impressionen",
  testimonials: "Was Kunden sagen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Sortiment",
  pricelist: "Sortiment",
  team: "Team",
  cta: "Anfrage",
};

function renderLogo(data: WebsiteDataV2): React.ReactNode {
  if (data.logo?.kind === "font") {
    return (
      <span style={{ fontFamily: data.logo.font }}>{data.businessName}</span>
    );
  }
  if (data.logo?.kind === "image") {
    return <img src={data.logo.url} alt={data.businessName} />;
  }
  return data.businessName;
}

/** Letztes Wort der Headline kursiv in Bordeaux — der Rest bleibt Ofenschwarz. */
function renderHeadline(headline: string): React.ReactNode {
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return headline;
  const last = words[words.length - 1];
  const rest = words.slice(0, -1).join(" ");
  return (
    <>
      {rest} <em>{last}</em>
    </>
  );
}

/**
 * Extrahiert eine vierstellige Jahreszahl aus der Footer-Notiz (z. B. „seit
 * 1927"). Ohne erkennbares Jahr wird kein Stempel gerendert (siehe Brief).
 */
function extractYear(footerNote: string | undefined): string | undefined {
  if (!footerNote) return undefined;
  const match = footerNote.match(/(1[5-9]\d{2}|20\d{2})/);
  return match ? match[0] : undefined;
}

/** Ornament-Bordüre: letterspaced ◆-Reihe in Siegelgold über einer Gold-Linie. */
function OrnamentBorder(): React.ReactElement {
  return (
    <div className="pb-zf-borde" aria-hidden="true">
      {Array.from({ length: 40 }, () => "◆").join(" ")}
    </div>
  );
}

/** Doppel-Linien-Ornament unter der Nav: zwei dünne Ofenschwarz-Linien. */
function DoubleRule(): React.ReactElement {
  return <div className="pb-zf-rule2" aria-hidden="true" />;
}

/** Eine Punktlinien-Preistafel-Zeile: Name … gepunktete Füllung … Preis in Gold. */
function TafelRow({
  name,
  price,
}: {
  name: string;
  price: string;
}): React.ReactElement {
  return (
    <div className="pb-zf-tafel">
      <span>{name}</span>
      <i />
      <span className="pb-zf-price">{price}</span>
    </div>
  );
}

function renderSection(section: SectionV2): React.ReactNode {
  switch (section.type) {
    case "hero":
      return null; // eigenständig im Page-Layout gerendert
    case "services": {
      return (
        <section
          id={SECTION_ANCHORS.services}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-zf-intro">{section.intro}</p>}
          <div className="pb-zf-grid">
            {section.items.map(item => (
              <div className="pb-zf-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-zf-price">{item.price}</span>
                )}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "about": {
      return (
        <section
          id={SECTION_ANCHORS.about}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-zf-about">
            {section.imageUrl && (
              <img src={section.imageUrl} alt="" loading="lazy" />
            )}
            <p>{section.body}</p>
          </div>
        </section>
      );
    }
    case "gallery": {
      const title = section.headline ?? FALLBACK_TITLES.gallery;
      return (
        <section
          id={SECTION_ANCHORS.gallery}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-zf-gallery">
            {section.images.map(img => (
              <img key={img.url} src={img.url} alt={img.alt} loading="lazy" />
            ))}
          </div>
        </section>
      );
    }
    case "testimonials": {
      const title = section.headline ?? FALLBACK_TITLES.testimonials;
      return (
        <section
          id={SECTION_ANCHORS.testimonials}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-zf-quote" key={item.author}>
              <p>„{item.text}“</p>
              <footer>
                {item.author}
                {item.rating ? ` · ${item.rating}/5` : ""}
              </footer>
            </blockquote>
          ))}
        </section>
      );
    }
    case "contact": {
      const title = section.headline ?? FALLBACK_TITLES.contact;
      const addressLine = [section.zip, section.city].filter(Boolean).join(" ");
      return (
        <section
          id={SECTION_ANCHORS.contact}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-zf-contact">
            <address>
              {section.phone && (
                <p>
                  <a href={`tel:${section.phone}`}>{section.phone}</a>
                </p>
              )}
              {section.email && (
                <p>
                  <a href={`mailto:${section.email}`}>{section.email}</a>
                </p>
              )}
              {(section.street || addressLine) && (
                <p>
                  {section.street && <span>{section.street}</span>}
                  {section.street && addressLine && <br />}
                  {addressLine && <span>{addressLine}</span>}
                </p>
              )}
            </address>
            {section.openingHours && section.openingHours.length > 0 && (
              <table className="pb-zf-hours">
                <tbody>
                  {section.openingHours.map(oh => (
                    <tr key={oh.day}>
                      <td>{oh.day}</td>
                      <td>{oh.hours}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      );
    }
    case "faq": {
      const title = section.headline ?? FALLBACK_TITLES.faq;
      return (
        <section
          id={SECTION_ANCHORS.faq}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-zf-faq" key={item.question}>
              <strong>{item.question}</strong>
              <p>{item.answer}</p>
            </div>
          ))}
        </section>
      );
    }
    case "menu":
    case "pricelist": {
      const fallback =
        section.type === "menu"
          ? FALLBACK_TITLES.menu
          : FALLBACK_TITLES.pricelist;
      const title = section.headline ?? fallback;
      return (
        <section
          id={SECTION_ANCHORS[section.type]}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-zf-tafel-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <div className="pb-zf-tafel-item" key={item.name}>
                  <TafelRow name={item.name} price={item.price} />
                  {item.description && <p>{item.description}</p>}
                </div>
              ))}
            </div>
          ))}
        </section>
      );
    }
    case "team": {
      const title = section.headline ?? FALLBACK_TITLES.team;
      return (
        <section
          id={SECTION_ANCHORS.team}
          className="pb-zf-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-zf-team">
            {section.members.map(member => (
              <div className="pb-zf-member" key={member.name}>
                {member.imageUrl && (
                  <img src={member.imageUrl} alt="" loading="lazy" />
                )}
                <strong>{member.name}</strong>
                {member.role && <p>{member.role}</p>}
              </div>
            ))}
          </div>
        </section>
      );
    }
    case "cta": {
      return (
        <section
          id={SECTION_ANCHORS.cta}
          className="pb-zf-section pb-zf-cta-card"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-zf-cta" href={section.ctaHref ?? "#kontakt"}>
            {section.ctaText}
          </a>
        </section>
      );
    }
    default: {
      const exhaustive: never = section;
      return exhaustive;
    }
  }
}

const ZunftPage: React.FC<{
  data: WebsiteDataV2;
  basePath: string;
  now: Date;
}> = ({ data, basePath, now }) => {
  const sections = orderedSections(data);
  const navSections = sections.filter(s => s.type !== "hero");
  const half = Math.ceil(navSections.length / 2);
  const navLeft = navSections.slice(0, half);
  const navRight = navSections.slice(half);
  const hero = sections.find((s): s is SectionOf<"hero"> => s.type === "hero");
  const priceSection = sections.find(
    (s): s is SectionOf<"pricelist"> | SectionOf<"menu"> =>
      s.type === "pricelist" || s.type === "menu"
  );
  const previewItems = priceSection?.categories[0]?.items.slice(0, 2) ?? [];
  const year = extractYear(data.footerNote);
  const yearNow = now.getFullYear();

  return (
    <div className="pb-zunft">
      <OrnamentBorder />
      <nav className="pb-zf-nav">
        <div className="pb-zf-nav-links">
          {navLeft.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
        <span className="pb-zf-logo">{renderLogo(data)}</span>
        <div className="pb-zf-nav-links">
          {navRight.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
      </nav>
      <DoubleRule />
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-zf-hero">
          <h1 className="pb-zf-headline">
            {renderHeadline(hero.headline)}
            {year && (
              <span className="pb-zf-stamp" aria-hidden="true">
                Seit
                <br />
                {year}
              </span>
            )}
          </h1>
          {hero.subheadline && <p className="pb-zf-sub">{hero.subheadline}</p>}
          {previewItems.length > 0 && (
            <div className="pb-zf-tafel-preview">
              {previewItems.map(item => (
                <TafelRow key={item.name} name={item.name} price={item.price} />
              ))}
            </div>
          )}
          {hero.ctaText && (
            <a className="pb-zf-cta" href={hero.ctaHref ?? "#kontakt"}>
              {hero.ctaText}
            </a>
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-zf-footer">
        <p>
          {data.businessName} · © {yearNow} {data.businessName}
        </p>
        {data.footerNote && <p>{data.footerNote}</p>}
        <p>
          <a href={`${basePath}/impressum`}>Impressum</a> ·{" "}
          <a href={`${basePath}/datenschutz`}>Datenschutz</a>
        </p>
      </footer>
    </div>
  );
};

export const ZUNFT_MODULE: PackModule = {
  id: "zunft",
  css: ZUNFT_CSS,
  Page: ZunftPage,
};
PACK_MODULES.zunft = ZUNFT_MODULE;

import React from "react";
import type {
  SectionOf,
  SectionType,
  SectionV2,
  WebsiteDataV2,
} from "../../../../../../shared/siteContract/types";
import { orderedSections, SECTION_ANCHORS } from "../../engine";
import { PACK_MODULES, type PackModule } from "../../packRegistry";
import { SALON_NOIR_CSS } from "./css";

const FALLBACK_TITLES: Partial<Record<SectionType, string>> = {
  services: "Leistungen",
  about: "Über uns",
  gallery: "Galerie",
  testimonials: "Was Kundinnen und Kunden sagen",
  contact: "Kontakt",
  faq: "Häufige Fragen",
  menu: "Angebot",
  pricelist: "Preisliste",
  team: "Team",
  cta: "Termin",
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

/** Eine Preiszeile: Name links, Preis in Champagner rechts. */
function PriceRow({
  name,
  price,
}: {
  name: string;
  price: string;
}): React.ReactElement {
  return (
    <div className="pb-sn-price-row">
      <span>{name}</span>
      <span className="pb-sn-price">{price}</span>
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          {section.intro && <p className="pb-sn-intro">{section.intro}</p>}
          <div className="pb-sn-grid">
            {section.items.map(item => (
              <div className="pb-sn-card" key={item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                {item.price && (
                  <span className="pb-sn-price">{item.price}</span>
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <div className="pb-sn-about">
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sn-gallery">
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <blockquote className="pb-sn-quote" key={item.author}>
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sn-contact">
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
              <table className="pb-sn-hours">
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.items.map(item => (
            <div className="pb-sn-faq" key={item.question}>
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{title}</h2>
          {section.categories.map(cat => (
            <div className="pb-sn-price-category" key={cat.name}>
              <h3>{cat.name}</h3>
              {cat.items.map(item => (
                <PriceRow key={item.name} name={item.name} price={item.price} />
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
          className="pb-sn-section"
          key={section.type}
        >
          <h2>{title}</h2>
          <div className="pb-sn-team">
            {section.members.map(member => (
              <div className="pb-sn-member" key={member.name}>
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
          className="pb-sn-section pb-sn-cta-card"
          key={section.type}
        >
          <h2>{section.headline}</h2>
          <a className="pb-sn-cta" href={section.ctaHref ?? "#kontakt"}>
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

const SalonNoirPage: React.FC<{
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
  const contact = sections.find(
    (s): s is SectionOf<"contact"> => s.type === "contact"
  );
  const eyebrow = [data.businessCategory, contact?.city]
    .filter((v): v is string => Boolean(v))
    .join(" · ");
  const verticalLabel = [contact?.city, data.businessCategory]
    .filter((v): v is string => Boolean(v))
    .join(" · ");
  const year = now.getFullYear();

  return (
    <div className="pb-salon-noir">
      <div className="pb-sn-frame" aria-hidden="true" />
      <nav className="pb-sn-nav">
        <div className="pb-sn-nav-links">
          {navLeft.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
        <span className="pb-sn-logo">{renderLogo(data)}</span>
        <div className="pb-sn-nav-links">
          {navRight.map(s => (
            <a key={s.type} href={`#${SECTION_ANCHORS[s.type]}`}>
              {FALLBACK_TITLES[s.type] ?? s.type}
            </a>
          ))}
        </div>
      </nav>
      {hero && (
        <section id={SECTION_ANCHORS.hero} className="pb-sn-hero">
          <div className="pb-sn-hero-inner">
            <div className="pb-sn-copy">
              {eyebrow && <p className="pb-sn-eyebrow">{eyebrow}</p>}
              <h1>{hero.headline}</h1>
              {hero.subheadline && (
                <p className="pb-sn-sub">{hero.subheadline}</p>
              )}
              {hero.ctaText && (
                <a className="pb-sn-cta" href={hero.ctaHref ?? "#kontakt"}>
                  {hero.ctaText}
                </a>
              )}
            </div>
            <div
              className="pb-sn-photo"
              aria-hidden="true"
              style={
                hero.imageUrl
                  ? { backgroundImage: `url(${hero.imageUrl})` }
                  : undefined
              }
            />
          </div>
          {verticalLabel && (
            <p className="pb-sn-vert" aria-hidden="true">
              {verticalLabel}
            </p>
          )}
        </section>
      )}
      {sections
        .filter(s => s.type !== "hero")
        .map(section => renderSection(section))}
      <footer className="pb-sn-footer">
        <p>
          © {year} {data.businessName}
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

const SALON_NOIR_MODULE: PackModule = {
  id: "salon-noir",
  css: SALON_NOIR_CSS,
  Page: SalonNoirPage,
};
PACK_MODULES["salon-noir"] = SALON_NOIR_MODULE;

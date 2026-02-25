/**
 * ELEGANT Layout – Beauty, Friseur, Spa, Nail Studio
 * Typography: Cormorant Garamond (serif headlines) + Jost (body)
 * Feel: Luxurious, airy, feminine, editorial
 * Structure: Split hero, large imagery, generous whitespace, gold accents
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Scissors, Heart, Sparkles, Instagram, Quote } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";

const SERIF = "'Cormorant Garamond', Georgia, serif";
const SANS = "'Jost', 'Inter', sans-serif";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl: string;
  showActivateButton?: boolean;
  onActivate?: () => void;
  businessPhone?: string | null;
  businessAddress?: string | null;
  businessEmail?: string | null;
  openingHours?: string[];
}

export default function ElegantLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [] }: Props) {
  return (
    <div style={{ fontFamily: SANS, backgroundColor: cs.background, color: cs.text }}>
      <ElegantNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <ElegantHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} />}
          {section.type === "about" && <ElegantAbout section={section} cs={cs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <ElegantServices section={section} cs={cs} />}
          {section.type === "testimonials" && <ElegantTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <ElegantFAQ section={section} cs={cs} />}
          {section.type === "contact" && <ElegantContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />}
          {section.type === "cta" && <ElegantCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <ElegantFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function ElegantNav({ websiteData, cs, businessPhone }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null }) {
  return (
    <nav style={{ backgroundColor: cs.background, borderBottom: `1px solid ${cs.primary}22`, fontFamily: SANS }} className="sticky top-0 z-50 backdrop-blur-md bg-opacity-95">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex flex-col">
          <span style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 600, letterSpacing: "0.05em", color: cs.text }}>{websiteData.businessName}</span>
          {websiteData.tagline && <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 500 }}>{websiteData.tagline.split(" ").slice(0, 4).join(" ")}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.textLight, fontWeight: 500 }} className="hover:opacity-60 transition-opacity">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ fontSize: "0.8rem", color: cs.primary, letterSpacing: "0.05em", fontWeight: 500 }} className="hidden sm:flex items-center gap-2 hover:opacity-70 transition-opacity">
            <Phone className="h-3.5 w-3.5" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function ElegantHero({ section, cs, heroImageUrl, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.surface, minHeight: "92vh" }} className="flex items-center">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 py-16 grid lg:grid-cols-2 gap-16 items-center w-full">
        {/* Left: Text */}
        <div className="order-2 lg:order-1">
          <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary, marginBottom: "2rem" }} />
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1.5rem" }}>
            Willkommen
          </p>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.8rem, 5vw, 4.5rem)", fontWeight: 400, lineHeight: 1.1, color: cs.text, marginBottom: "1.5rem", fontStyle: "italic" }}>
            {section.headline}
          </h1>
          {section.subheadline && (
            <p style={{ fontFamily: SANS, fontSize: "1.05rem", lineHeight: 1.7, color: cs.textLight, marginBottom: "1rem", fontWeight: 300 }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "2.5rem", fontWeight: 300 }}>{section.content}</p>
          )}
          <div className="flex flex-wrap gap-4">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, fontFamily: SANS }} className="hover:opacity-90 transition-opacity">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `1px solid ${cs.primary}`, color: cs.primary, padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, fontFamily: SANS, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">
                Jetzt aktivieren
              </button>
            )}
          </div>
        </div>
        {/* Right: Image */}
        <div className="order-1 lg:order-2 relative">
          <div style={{ position: "absolute", top: "-1.5rem", right: "-1.5rem", width: "70%", height: "70%", backgroundColor: `${cs.primary}15`, zIndex: 0 }} />
          <img src={heroImageUrl} alt={section.headline || ""} style={{ position: "relative", zIndex: 1, width: "100%", aspectRatio: "4/5", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: "-1.5rem", left: "-1.5rem", width: "40%", height: "40%", border: `1px solid ${cs.primary}40`, zIndex: 0 }} />
        </div>
      </div>
    </section>
  );
}

function ElegantAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div className="relative">
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
          <div style={{ position: "absolute", bottom: "2rem", right: "-2rem", backgroundColor: cs.primary, padding: "1.5rem 2rem", textAlign: "center" }}>
            <p style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 600, color: "#fff", lineHeight: 1 }}>15+</p>
            <p style={{ fontFamily: SANS, fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.8)", marginTop: "0.25rem" }}>Jahre Erfahrung</p>
          </div>
        </div>
        <div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Über uns</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, marginBottom: "1.5rem", lineHeight: 1.2 }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "1rem", fontWeight: 300 }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight, fontWeight: 300 }}>{section.content}</p>}
          <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary, margin: "2rem 0" }} />
          <div className="flex items-center gap-4">
            <div style={{ width: "3rem", height: "3rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart className="h-5 w-5" style={{ color: cs.primary }} />
            </div>
            <p style={{ fontFamily: SERIF, fontSize: "1rem", fontStyle: "italic", color: cs.textLight }}>Leidenschaft für Schönheit & Wohlbefinden</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ElegantServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Unsere Leistungen</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, fontStyle: "italic" }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.textLight, marginTop: "1rem", fontWeight: 300 }}>{section.subheadline}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px" style={{ backgroundColor: `${cs.primary}20` }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2.5rem 2rem" }} className="hover:bg-opacity-90 transition-colors group">
              <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary, marginBottom: "1.5rem" }} />
              <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 600, color: cs.text, marginBottom: "0.75rem" }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.7, color: cs.textLight, fontWeight: 300 }}>{item.description}</p>
              {(item as any).price && <p style={{ fontFamily: SERIF, fontSize: "1.1rem", color: cs.primary, marginTop: "1.5rem", fontStyle: "italic" }}>ab {(item as any).price}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Stimmen unserer Kunden</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, fontStyle: "italic" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} style={{ padding: "2.5rem", border: `1px solid ${cs.primary}20`, position: "relative" }}>
              <Quote className="h-8 w-8 mb-4" style={{ color: `${cs.primary}40` }} />
              <p style={{ fontFamily: SERIF, fontSize: "1rem", lineHeight: 1.8, color: cs.text, fontStyle: "italic", marginBottom: "1.5rem" }}>{item.description || item.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "1rem", color: cs.primary }}>{(item.author || item.title || "K").charAt(0)}</span>
                </div>
                <div>
                  <p style={{ fontFamily: SANS, fontSize: "0.85rem", fontWeight: 600, color: cs.text }}>{item.author || item.title}</p>
                  <div className="flex gap-0.5 mt-0.5">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-3 w-3 fill-current" style={{ color: cs.primary }} />)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>FAQ</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 400, color: cs.text, fontStyle: "italic" }}>{section.headline}</h2>
        </div>
        <div className="space-y-0">
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: `1px solid ${cs.primary}20` }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left py-5 flex items-center justify-between" style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text, fontWeight: 500 }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.8, color: cs.textLight, paddingBottom: "1.25rem", fontWeight: 300 }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ElegantContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
        <div>
          <p style={{ fontSize: "0.75rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontFamily: SANS, fontWeight: 500, marginBottom: "1rem" }}>Kontakt</p>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 400, color: cs.text, marginBottom: "2rem", fontStyle: "italic" }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "2.5rem", fontWeight: 300 }}>{section.content}</p>}
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><Phone className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: cs.primary }} /><span style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><Mail className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.surface, padding: "3rem" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 400, color: cs.text, marginBottom: "1.5rem", fontStyle: "italic" }}>Öffnungszeiten</h3>
          {hours.length > 0 ? (
            <div className="space-y-2">
              {hours.map((h, i) => <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, fontWeight: 300 }}>{h}</p>)}
            </div>
          ) : (
            <div className="space-y-2">
              {["Mo – Fr: 09:00 – 18:00 Uhr", "Sa: 09:00 – 14:00 Uhr", "So: Geschlossen"].map((h, i) => (
                <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, fontWeight: 300 }}>{h}</p>
              ))}
            </div>
          )}
          <div style={{ width: "3rem", height: "1px", backgroundColor: cs.primary, margin: "2rem 0" }} />
          {phone && (
            <a href={`tel:${phone}`} style={{ display: "inline-block", backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, fontFamily: SANS }} className="hover:opacity-90 transition-opacity">
              Jetzt anrufen
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function ElegantCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, color: "#fff", fontStyle: "italic", marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginBottom: "2.5rem", fontWeight: 300 }}>{section.content}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: cs.primary, padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, fontFamily: SANS }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: "1px solid rgba(255,255,255,0.6)", color: "#fff", padding: "0.9rem 2.5rem", fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 500, fontFamily: SANS, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function ElegantFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: cs.text, padding: "3rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 600, color: "#fff", letterSpacing: "0.05em" }}>{websiteData.businessName}</p>
          <p style={{ fontFamily: SANS, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: `${cs.primary}`, marginTop: "0.25rem" }}>{websiteData.tagline?.split(" ").slice(0, 4).join(" ")}</p>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

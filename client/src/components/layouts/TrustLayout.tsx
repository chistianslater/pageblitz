/**
 * TRUST Layout – Medical, Legal, Financial, Consulting, Insurance
 * Typography: Libre Baskerville (headlines) + Source Sans Pro (body)
 * Feel: Authoritative, calm, institutional, premium
 * Structure: CENTERED headline hero → full-width photo band → stats bar → card-grid services
 * Deliberately different from CleanLayout (which uses split-hero)
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Shield, Award, Users, ArrowRight, Quote } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const SERIF = "var(--site-font-headline, 'Libre Baskerville', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Libre Baskerville', Georgia, serif))";
const BODY = "var(--site-font-body, 'Source Sans Pro', 'Helvetica Neue', sans-serif)";

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
  slug?: string | null;
  contactFormLocked?: boolean;
  logoUrl?: string | null;
  businessCategory?: string | null;
}

export default function TrustLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: "#ffffff", color: "#1a2332" }}>
      <TrustNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <TrustHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} businessPhone={businessPhone} businessCategory={businessCategory} />}
          {section.type === "about" && <TrustAbout section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <TrustServices section={section} cs={cs} />}
          {section.type === "testimonials" && <TrustTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <TrustFAQ section={section} cs={cs} />}
                    {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <TrustContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
              {contactFormLocked && (
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.78)",
                  backdropFilter: "blur(3px)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.75rem",
                  zIndex: 20,
                }}>
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    backgroundColor: "rgba(59,130,246,0.2)",
                    border: "1px solid rgba(59,130,246,0.5)",
                    borderRadius: "9999px",
                    padding: "0.5rem 1.25rem",
                  }}>
                    <span style={{ fontSize: "0.85rem", color: "#93c5fd", fontWeight: 700 }}>🔒 Kontaktformular</span>
                    <span style={{ fontSize: "0.8rem", color: "#60a5fa", backgroundColor: "rgba(59,130,246,0.25)", padding: "0.15rem 0.6rem", borderRadius: "9999px" }}>+4,90 €/Monat</span>
                  </div>
                  <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.65)", margin: 0 }}>Im nächsten Schritt aktivierbar</p>
                </div>
              )}
            </div>
          )}
          {section.type === "cta" && <TrustCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <TrustFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function TrustNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav style={{ backgroundColor: "#fff", borderBottom: `3px solid ${cs.primary}` }} className="sticky top-0 z-50">
      {/* Top bar */}
      <div style={{ backgroundColor: cs.primary, padding: "0.35rem 0" }}>
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6">
            {businessPhone && (
              <a href={`tel:${businessPhone}`} style={{ color: "#fff", fontSize: "0.8rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Phone className="h-3 w-3" /> {businessPhone}
              </a>
            )}
          </div>
          <span style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.75rem" }}>Ihr Vertrauen – unser Auftrag</span>
        </div>
      </div>
      {/* Main nav */}
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div>
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, color: "#1a2332", letterSpacing: "-0.02em" }}>{websiteData.businessName}</span>}
          {websiteData.tagline && <p style={{ fontSize: "0.65rem", color: cs.primary, letterSpacing: "0.05em", textTransform: "uppercase", marginTop: "1px" }}>{websiteData.tagline.slice(0, 50)}</p>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "FAQ", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase().replace(" ", "-")}`} style={{ fontSize: "0.85rem", color: "#4a5568", fontWeight: 500, letterSpacing: "0.02em" }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        <a href="#kontakt" style={{ backgroundColor: "#1a2332", color: "#fff", padding: "0.6rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.03em" }} className="hidden sm:block hover:opacity-80 transition-opacity">
          Termin anfragen
        </a>
      </div>
    </nav>
  );
}

function TrustHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData, businessPhone, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData; businessPhone?: string | null; businessCategory?: string | null }) {
  const heroStats = getIndustryStats(businessCategory || "");
  return (
    <section style={{ position: "relative", minHeight: "92vh", display: "flex", overflow: "hidden" }}>
      {/* LEFT: Dark panel with text – 55% width */}
      <div style={{
        position: "relative",
        zIndex: 2,
        width: "55%",
        backgroundColor: "#1a2332",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        padding: "5rem 4rem 5rem 6%",
        clipPath: "polygon(0 0, 100% 0, 88% 100%, 0 100%)",
      }}>
        {/* Accent line */}
        <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, marginBottom: "2rem" }} />
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <Shield className="h-3.5 w-3.5" style={{ color: cs.primary }} />
          <span style={{ fontSize: "0.72rem", color: cs.primary, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase" }}>Vertrauen seit Jahren</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.4rem, 4.5vw, 4rem)", fontWeight: 700, color: "#fff", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.5rem" }} className="hero-animate-headline">
          {section.headline}
        </h1>
        {section.subheadline && (
          <p style={{ fontSize: "1.05rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.75, maxWidth: "420px", marginBottom: "0.75rem" }}>{section.subheadline}</p>
        )}
        {section.content && (
          <p style={{ fontSize: "0.9rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.7, maxWidth: "400px", marginBottom: "2.5rem" }}>{section.content}</p>
        )}
        {(websiteData.googleRating || websiteData.googleReviewCount) && (
          <div style={{ marginBottom: "2rem" }}>
            <GoogleRatingBadge rating={websiteData.googleRating ?? undefined} reviewCount={websiteData.googleReviewCount ?? undefined} variant="dark" starColor={cs.primary} />
          </div>
        )}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          <a href="#kontakt" onClick={showActivateButton ? onActivate : undefined}
            style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2.2rem", fontSize: "0.95rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.5rem", letterSpacing: "0.02em" }}
            className="btn-premium transition-opacity hero-animate-cta">
            {section.ctaText || "Jetzt anfragen"} <ArrowRight className="h-4 w-4" />
          </a>
          {businessPhone && (
            <a href={`tel:${businessPhone}`}
              style={{ backgroundColor: "transparent", color: "rgba(255,255,255,0.85)", padding: "0.9rem 2rem", fontSize: "0.95rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.25)", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
              className="hover:border-white transition-colors hero-animate-cta">
              <Phone className="h-4 w-4" /> {businessPhone}
            </a>
          )}
        </div>
        {/* Stats row at bottom */}
        <div style={{ display: "flex", gap: "2.5rem", marginTop: "3rem", paddingTop: "2rem", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {heroStats.map(({ n, label }, i) => (
            <div key={i}>
              <div style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 700, color: cs.primary }}>{n}</div>
              <div style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</div>
            </div>
          ))}
        </div>
        {showActivateButton && (
          <button onClick={onActivate} style={{ marginTop: "1.5rem", backgroundColor: "rgba(255,255,255,0.1)", color: "#fff", padding: "0.7rem 1.5rem", fontSize: "0.85rem", fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)", cursor: "pointer", alignSelf: "flex-start" }}
            className="hover:bg-white hover:text-gray-900 transition-colors">
            Website aktivieren
          </button>
        )}
      </div>

      {/* RIGHT: Full-bleed photo – 45% + overlap */}
      <div style={{
        position: "absolute",
        right: 0,
        top: 0,
        bottom: 0,
        width: "50%",
        zIndex: 1,
      }}>
        <img src={heroImageUrl} alt={websiteData.businessName}
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          className="hero-animate-image" />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, #1a2332 0%, transparent 30%)" }} />
      </div>
    </section>
  );
}

function TrustAbout({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  return (
    <section style={{ padding: "5rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, marginBottom: "1.5rem" }} />
          <h2 data-reveal data-delay="0" style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 700, color: "#1a2332", lineHeight: 1.3, marginBottom: "1rem" }}>
            {section.headline}
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginTop: "2rem" }}>
            {["Zertifiziert & anerkannt", "Persönliche Betreuung", "Transparente Kommunikation"].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />
                <span style={{ fontSize: "0.9rem", color: "#4a5568" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          <p style={{ fontSize: "1.05rem", color: "#4a5568", lineHeight: 1.85, whiteSpace: "pre-line" }}>{section.content}</p>
        </div>
      </div>
    </section>
  );
}

function TrustServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section id="leistungen" style={{ padding: "5rem 0", backgroundColor: "#f7f9fc" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.75rem" }}>{section.headline}</h2>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto" }} />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", padding: "2rem", borderTop: `3px solid ${i === 0 ? cs.primary : "#e8edf3"}`, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}
              className="hover:shadow-lg transition-shadow group card-premium">
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Shield className="h-5 w-5" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.75rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.9rem", color: "#5a6a7e", lineHeight: 1.7 }}>{item.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "1.25rem", color: cs.primary, fontSize: "0.8rem", fontWeight: 600 }}
                className="group-hover:gap-2 transition-all">
                <span>Mehr erfahren</span> <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ padding: "5rem 0", backgroundColor: "#1a2332" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>{section.headline}</h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>Beispiel-Kundenstimmen</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "2rem", borderLeft: `3px solid ${cs.primary}` }}>
              <Quote className="h-6 w-6 mb-4" style={{ color: cs.primary, opacity: 0.6 }} />
              <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "0.95rem", lineHeight: 1.7, marginBottom: "1.5rem", fontStyle: "italic" }}>"{item.description}"</p>
              <div className="flex items-center justify-between">
                <span style={{ fontFamily: SERIF, fontWeight: 700, color: "#fff", fontSize: "0.9rem" }}>{item.author}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: item.rating || 5 }).map((_, j) => (
                    <Star key={j} className="h-3.5 w-3.5 fill-current" style={{ color: cs.primary }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section id="faq" style={{ padding: "5rem 0", backgroundColor: "#fff" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: "#1a2332", marginBottom: "0.5rem" }}>{section.headline}</h2>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, margin: "0 auto" }} />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #e8edf3" }}>
              <button onClick={() => setOpen(open === i ? null : i)}
                style={{ width: "100%", padding: "1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 700, color: "#1a2332", paddingRight: "2rem" }}>{item.question}</span>
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "#9aa5b4" }} />}
              </button>
              {open === i && (
                <div style={{ paddingBottom: "1.5rem" }}>
                  <p style={{ fontSize: "0.95rem", color: "#5a6a7e", lineHeight: 1.75 }}>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TrustCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ padding: "5rem 0", backgroundColor: cs.primary, textAlign: "center" }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 700, color: "#fff", marginBottom: "1rem" }}>{section.headline}</h2>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: "1.05rem", lineHeight: 1.7, marginBottom: "2.5rem" }}>{section.content}</p>
        <a href="#kontakt" onClick={showActivateButton ? onActivate : undefined}
          style={{ backgroundColor: "#fff", color: cs.primary, padding: "1rem 3rem", fontSize: "1rem", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "0.5rem" }}
          className="btn-premium transition-opacity">
          {section.ctaText || "Jetzt Kontakt aufnehmen"} <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </section>
  );
}

function TrustContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ padding: "5rem 0", backgroundColor: "#f7f9fc" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary, marginBottom: "1.5rem" }} />
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2rem", fontWeight: 700, color: "#1a2332", marginBottom: "1rem" }}>{section.headline}</h2>
          <p style={{ color: "#5a6a7e", fontSize: "1rem", lineHeight: 1.7, marginBottom: "2rem" }}>{section.content}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Phone className="h-4 w-4" style={{ color: cs.primary }} />
              </div>
              <a href={`tel:${phone}`} style={{ color: "#1a2332", fontWeight: 600 }}>{phone}</a>
            </div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <MapPin className="h-4 w-4" style={{ color: cs.primary }} />
              </div>
              <span style={{ color: "#4a5568" }}>{address}</span>
            </div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}12`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Clock className="h-4 w-4" style={{ color: cs.primary }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {hours.slice(0, 4).map((h, i) => <span key={i} style={{ fontSize: "0.85rem", color: "#4a5568" }}>{h}</span>)}
              </div>
            </div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "2.5rem", boxShadow: "0 4px 24px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 700, color: "#1a2332", marginBottom: "1.5rem" }}>Nachricht senden</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[{ label: "Name", type: "text" }, { label: "E-Mail", type: "email" }, { label: "Telefon", type: "tel" }].map(f => (
              <div key={f.label}>
                <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.4rem" }}>{f.label}</label>
                <input type={f.type} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e8edf3", fontSize: "0.95rem", outline: "none", backgroundColor: "#f7f9fc" }} />
              </div>
            ))}
            <div>
              <label style={{ fontSize: "0.8rem", fontWeight: 600, color: "#4a5568", textTransform: "uppercase", letterSpacing: "0.05em", display: "block", marginBottom: "0.4rem" }}>Anliegen</label>
              <textarea rows={4} style={{ width: "100%", padding: "0.75rem", border: "1px solid #e8edf3", fontSize: "0.95rem", outline: "none", resize: "vertical", backgroundColor: "#f7f9fc" }} />
            </div>
            <button style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.9rem", fontWeight: 700, fontSize: "0.95rem", border: "none", cursor: "pointer", width: "100%" }}
              className="btn-premium transition-opacity">
              {section.ctaText || "Anfrage senden"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function TrustFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: "#0f1724", padding: "3rem 0 1.5rem" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-3 gap-8 pb-6 mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <div>
            <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{websiteData.businessName}</span>
            {websiteData.tagline && <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.8rem", marginTop: "0.5rem" }}>{websiteData.tagline}</p>}
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Leistungen</p>
            {["Beratung", "Analyse", "Umsetzung", "Betreuung"].map(l => (
              <a key={l} href="#" style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "0.4rem" }} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
          <div>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.75rem" }}>Rechtliches</p>
            {["Impressum", "Datenschutz", "AGB"].map(l => (
              <a key={l} href="#" style={{ display: "block", color: "rgba(255,255,255,0.6)", fontSize: "0.85rem", marginBottom: "0.4rem" }} className="hover:text-white transition-colors">{l}</a>
            ))}
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem", textAlign: "center" }}>{websiteData.footer?.text || `© ${new Date().getFullYear()} ${websiteData.businessName}`}</p>
      </div>
    </footer>
  );
}

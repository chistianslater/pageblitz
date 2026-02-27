/**
 * BOLD Layout – Handwerk, Bau, Dachdecker, Elektriker, Sanitär
 * Typography: Oswald (headlines) + Barlow (body)
 * Feel: Strong, industrial, trustworthy, masculine
 * Structure: Full-bleed dark hero, large numbers, diagonal accents, high contrast
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Wrench, Shield, Award, Hammer, Truck } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const HEADING = "var(--site-font-headline, 'Oswald', 'Barlow Condensed', Impact, sans-serif)";
const BODY = "var(--site-font-body, 'Barlow', 'Inter', sans-serif)";

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
}

export default function BoldLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: cs.background, color: cs.text }}>
      <BoldNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <BoldHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <BoldAbout section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <BoldServices section={section} cs={cs} />}
          {section.type === "testimonials" && <BoldTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <BoldFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <BoldContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
          )}
          {section.type === "cta" && <BoldCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <BoldFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function BoldNav({ websiteData, cs, businessPhone }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null }) {
  return (
    <nav style={{ backgroundColor: "#0d0d0d", borderBottom: `3px solid ${cs.primary}` }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div style={{ width: "4px", height: "2rem", backgroundColor: cs.primary }} />
          <span style={{ fontFamily: HEADING, fontSize: "1.4rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#fff" }}>{websiteData.businessName}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontFamily: BODY, fontSize: "0.85rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 500 }} className="hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.6rem 1.5rem", fontFamily: HEADING, fontSize: "0.9rem", fontWeight: 600, letterSpacing: "0.08em" }} className="hidden sm:flex items-center gap-2 btn-premium transition-opacity">
            <Phone className="h-4 w-4" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function BoldHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ position: "relative", minHeight: "90vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Background image with dark overlay */}
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(105deg, rgba(0,0,0,0.92) 50%, rgba(0,0,0,0.5) 100%)" }} />
      {/* Diagonal accent */}
      <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "40%", background: `linear-gradient(105deg, transparent 0%, ${cs.primary}15 100%)` }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: cs.primary, padding: "0.4rem 1rem", marginBottom: "2rem" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#fff" }} />
          <span style={{ fontFamily: BODY, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#fff", fontWeight: 600 }}>Ihr Fachbetrieb</span>
        </div>
        <h1 style={{ fontFamily: HEADING, fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 700, lineHeight: 0.95, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "1.5rem" }} className="hero-animate-headline">
          {section.headline?.split(" ").map((word, i) => (
            <span key={i} style={{ display: "block", color: i === 1 ? cs.primary : "#fff" }}>{word}</span>
          ))}
        </h1>
        {section.subheadline && <p style={{ fontFamily: BODY, fontSize: "1.1rem", color: "rgba(255,255,255,0.75)", maxWidth: "600px", lineHeight: 1.7, marginBottom: "2.5rem" }}>{section.subheadline}</p>}
        <div className="flex flex-wrap gap-4">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" }} className="btn-premium transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "transparent" }} className="hover:bg-opacity-10 transition-opacity">
              Jetzt aktivieren
            </button>
          )}
        </div>
        {websiteData.googleRating && websiteData.googleReviewCount ? (
          <div style={{ marginTop: "2rem" }}>
            <GoogleRatingBadge rating={websiteData.googleRating} reviewCount={websiteData.googleReviewCount} variant="light" starColor={cs.primary} />
          </div>
        ) : null}
        {/* Trust bar */}
        <div className="flex flex-wrap gap-8 mt-8">
          {[{ icon: Shield, text: "Geprüfter Fachbetrieb" }, { icon: Award, text: "Über 15 Jahre Erfahrung" }, { icon: CheckCircle, text: "Kostenlose Beratung" }].map(({ icon: Icon, text }, i) => (
            <div key={i} className="flex items-center gap-2">
              <Icon className="h-5 w-5" style={{ color: cs.primary }} />
              <span style={{ fontFamily: BODY, fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldAbout({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const stats = [{ n: "500+", label: "Projekte" }, { n: "15+", label: "Jahre" }, { n: "100%", label: "Zufriedenheit" }];
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Über uns</span>
          </div>
          <h2 data-reveal data-delay="0" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "1.5rem", lineHeight: 1.05 }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: BODY, fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)" }}>{section.content}</p>}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {stats.map(({ n, label }, i) => (
            <div key={i} style={{ backgroundColor: i === 1 ? cs.primary : "#1a1a1a", padding: "2rem 1.5rem", textAlign: "center" }}>
              <p style={{ fontFamily: HEADING, fontSize: "2.5rem", fontWeight: 700, color: i === 1 ? "#fff" : cs.primary, lineHeight: 1 }}>{n}</p>
              <p style={{ fontFamily: BODY, fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: i === 1 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.5)", marginTop: "0.5rem" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="100" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: cs.text, textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface, padding: "2rem", borderLeft: `4px solid ${cs.primary}`, position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: "1rem", right: "1rem", fontFamily: HEADING, fontSize: "3rem", fontWeight: 700, color: `${cs.primary}15`, lineHeight: 1 }}>{String(i + 1).padStart(2, "0")}</div>
              <Wrench className="h-6 w-6 mb-3" style={{ color: cs.primary }} />
              <h3 style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 600, color: cs.text, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{item.title}</h3>
              <p style={{ fontFamily: BODY, fontSize: "0.9rem", lineHeight: 1.6, color: cs.textLight }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="200" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#1a1a1a", padding: "2rem", borderTop: `3px solid ${cs.primary}` }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" style={{ color: cs.primary }} />)}</div>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.75)", marginBottom: "1.5rem" }}>{item.description || item.title}</p>
              <p style={{ fontFamily: HEADING, fontSize: "0.9rem", fontWeight: 600, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.08em" }}>{item.author || item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 700, color: cs.text, textTransform: "uppercase" }}>{section.headline}</h2>
        </div>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex items-center justify-between" style={{ fontFamily: HEADING, fontSize: "1rem", fontWeight: 600, color: cs.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: BODY, fontSize: "0.9rem", lineHeight: 1.7, color: cs.textLight, padding: "0 1.5rem 1.5rem" }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BoldContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#0d0d0d", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <div style={{ width: "3rem", height: "3px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 600 }}>Kontakt</span>
          </div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "2rem", lineHeight: 1.05 }}>{section.headline}</h2>
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><div style={{ backgroundColor: cs.primary, padding: "0.5rem" }}><Phone className="h-4 w-4 text-white" /></div><a href={`tel:${phone}`} style={{ fontFamily: BODY, fontSize: "1rem", color: "#fff", fontWeight: 500 }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><div style={{ backgroundColor: cs.primary, padding: "0.5rem", flexShrink: 0 }}><MapPin className="h-4 w-4 text-white" /></div><span style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.75)" }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><div style={{ backgroundColor: cs.primary, padding: "0.5rem" }}><Mail className="h-4 w-4 text-white" /></div><a href={`mailto:${email}`} style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.75)" }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#1a1a1a", padding: "2.5rem", borderTop: `4px solid ${cs.primary}` }}>
          <h3 style={{ fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "1.5rem" }}>Öffnungszeiten</h3>
          <div className="space-y-2">
            {(hours.length > 0 ? hours : ["Mo – Fr: 07:00 – 17:00 Uhr", "Sa: 08:00 – 13:00 Uhr", "So: Notdienst"]).map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <div style={{ width: "6px", height: "6px", backgroundColor: cs.primary, flexShrink: 0 }} />
                <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.65)" }}>{h}</p>
              </div>
            ))}
          </div>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2rem" }} className="btn-premium transition-opacity">
              <Phone className="h-4 w-4" /> Jetzt anrufen
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function BoldCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "4rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginTop: "0.5rem" }}>{section.content}</p>}
        </div>
        <div className="flex flex-wrap gap-4 flex-shrink-0">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: cs.primary, padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: "2px solid #fff", color: "#fff", padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1rem", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function BoldFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: "#000", padding: "2.5rem 0", borderTop: `3px solid ${cs.primary}` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: HEADING, fontSize: "1.2rem", fontWeight: 700, color: "#fff", textTransform: "uppercase", letterSpacing: "0.08em" }}>{websiteData.businessName}</span>
        <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: BODY, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

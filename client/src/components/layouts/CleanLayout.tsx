/**
 * CLEAN Layout – Arzt, Zahnarzt, Beratung, Kanzlei, Versicherung
 * Typography: DM Serif Display (headlines) + DM Sans (body)
 * Feel: Trustworthy, professional, calm, clinical precision
 * Structure: Asymmetric hero with trust badges, icon-driven service grid, testimonial strip
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Shield, Award, Heart, Stethoscope, Users, Lock } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const SERIF = "var(--site-font-headline, 'DM Serif Display', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'DM Serif Display', Georgia, serif))";
const SANS = "var(--site-font-body, 'DM Sans', 'Inter', sans-serif)";

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

export default function CleanLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: SANS, backgroundColor: "#f8fafc", color: cs.text }}>
      <CleanNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <CleanHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} businessCategory={businessCategory} />}
          {section.type === "about" && <CleanAbout section={section} cs={cs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <CleanServices section={section} cs={cs} />}
          {section.type === "testimonials" && <CleanTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <CleanFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <CleanContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
          )}
          {section.type === "cta" && <CleanCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <CleanFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function CleanNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoUrl ? (
            <img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />
          ) : (
            <>
              <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "0.5rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: LOGO_FONT, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>{websiteData.businessName.charAt(0)}</span>
              </div>
              <div>
                <p style={{ fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700, color: cs.text, lineHeight: 1.2 }}>{websiteData.businessName}</p>
                {websiteData.tagline && <p style={{ fontFamily: SANS, fontSize: "0.7rem", color: cs.textLight }}>{websiteData.tagline.split(" ").slice(0, 4).join(" ")}</p>}
              </div>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href="#" style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, fontWeight: 500 }} className="hover:opacity-70 transition-opacity">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.6rem 1.25rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.85rem", fontWeight: 600 }} className="hidden sm:flex items-center gap-2 btn-premium transition-opacity">
            <Phone className="h-3.5 w-3.5" /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function CleanHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData, businessCategory }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData; businessCategory?: string | null }) {
  const stats4 = getIndustryStats(businessCategory || "", 4);
  return (
    <section style={{ backgroundColor: "#fff", padding: "4rem 0 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center">
        <div className="py-8">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: `${cs.primary}12`, borderRadius: "2rem", padding: "0.4rem 1rem", marginBottom: "1.5rem" }}>
            <CheckCircle className="h-3.5 w-3.5" style={{ color: cs.primary }} />
            <span style={{ fontFamily: SANS, fontSize: "0.75rem", color: cs.primary, fontWeight: 600 }}>Zertifizierter Fachbetrieb</span>
          </div>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.2rem, 4.5vw, 3.8rem)", fontWeight: 400, color: cs.text, lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.25rem" }} className="hero-animate-headline">{section.headline}</h1>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1.05rem", lineHeight: 1.7, color: cs.textLight, marginBottom: "2rem" }}>{section.subheadline}</p>}
          <div className="flex flex-wrap gap-3 mb-8">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.85rem 2rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600 }} className="btn-premium transition-opacity">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `1.5px solid ${cs.primary}`, color: cs.primary, padding: "0.85rem 2rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">
                Jetzt aktivieren
              </button>
            )}
          </div>
          {/* Trust badges */}
          <div className="flex flex-wrap gap-6">
            {[{ icon: Shield, text: "Datenschutz" }, { icon: Award, text: "Zertifiziert" }, { icon: Users, text: "1000+ Patienten" }].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: cs.primary }} />
                <span style={{ fontFamily: SANS, fontSize: "0.8rem", color: cs.textLight, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <div style={{ position: "absolute", inset: 0, backgroundColor: `${cs.primary}08`, borderRadius: "1.5rem", transform: "rotate(2deg)" }} />
          <img src={heroImageUrl} alt="" style={{ position: "relative", width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "1.5rem" }} />
        </div>
      </div>
      {/* Stats bar */}
      <div style={{ backgroundColor: cs.primary, marginTop: "4rem" }}>
        <div className="max-w-6xl mx-auto px-6 lg:px-8 py-5 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats4.map(({ n, label: l }, i) => (
            <div key={i} className="text-center">
              <p style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: "#fff", lineHeight: 1 }}>{n}</p>
              <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.75)", marginTop: "0.25rem" }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: "#f8fafc", padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, marginBottom: "1rem" }}>Über uns</p>
          <h2 data-reveal data-delay="0" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text, marginBottom: "1.5rem", lineHeight: 1.2 }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight }}>{section.content}</p>}
          <div className="mt-6 space-y-3">
            {["Persönliche Betreuung", "Modernste Ausstattung", "Flexible Terminvergabe"].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <CheckCircle className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />
                <span style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", borderRadius: "1.5rem", overflow: "hidden", boxShadow: "0 8px 40px rgba(0,0,0,0.08)" }}>
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
        </div>
      </div>
    </section>
  );
}

function CleanServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, marginBottom: "0.75rem" }}>Leistungen</p>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.textLight, marginTop: "0.75rem" }}>{section.subheadline}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#f8fafc", borderRadius: "1rem", padding: "2rem", border: `1px solid ${cs.primary}15` }} className="hover:shadow-md transition-shadow card-premium">
              <div style={{ width: "3rem", height: "3rem", borderRadius: "0.75rem", backgroundColor: `${cs.primary}15`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Heart className="h-5 w-5" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: SANS, fontSize: "1rem", fontWeight: 700, color: cs.text, marginBottom: "0.5rem" }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "0.875rem", lineHeight: 1.6, color: cs.textLight }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#f8fafc", padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text, textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" style={{ color: "#f59e0b" }} />)}</div>
              <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.7, color: cs.textLight, marginBottom: "1.25rem" }}>{item.description || item.title}</p>
              <div className="flex items-center gap-3">
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SANS, fontSize: "0.9rem", fontWeight: 700, color: cs.primary }}>{(item.author || item.title || "K").charAt(0)}</span>
                </div>
                <p style={{ fontFamily: SANS, fontSize: "0.85rem", fontWeight: 600, color: cs.text }}>{item.author || item.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 400, color: cs.text, textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} style={{ border: `1px solid ${cs.primary}20`, borderRadius: "0.75rem", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-5 py-4 flex items-center justify-between" style={{ fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, color: cs.text }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.7, color: cs.textLight, padding: "0 1.25rem 1.25rem" }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#f8fafc", padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, marginBottom: "1rem" }}>Kontakt</p>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text, marginBottom: "2rem" }}>{section.headline}</h2>
          <div className="space-y-4">
            {phone && <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><Phone className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text, fontWeight: 500 }}>{phone}</a></div>}
            {address && <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "start", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: cs.primary }} /><span style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{address}</span></div>}
            {email && <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><Mail className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" style={{ color: cs.primary }} />
            <h3 style={{ fontFamily: SANS, fontSize: "1.1rem", fontWeight: 700, color: cs.text }}>Öffnungszeiten</h3>
          </div>
          <div className="space-y-2">
            {(hours.length > 0 ? hours : ["Mo – Fr: 08:00 – 18:00 Uhr", "Sa: 09:00 – 13:00 Uhr", "So: Geschlossen"]).map((h, i) => (
              <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight }}>{h}</p>
            ))}
          </div>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, color: "#fff", padding: "0.85rem 2rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, marginTop: "2rem" }} className="btn-premium transition-opacity">
              <Phone className="h-4 w-4" /> Termin vereinbaren
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function CleanCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "4rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Lock className="h-8 w-8 mx-auto mb-4 text-white opacity-70" />
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "#fff", marginBottom: "1rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", color: "rgba(255,255,255,0.8)", marginBottom: "2rem" }}>{section.content}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: cs.primary, padding: "0.85rem 2.5rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 700 }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: "1.5px solid rgba(255,255,255,0.6)", color: "#fff", padding: "0.85rem 2.5rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function CleanFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: "#1e293b", padding: "2.5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: SERIF, fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{websiteData.businessName.charAt(0)}</span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, color: "#fff" }}>{websiteData.businessName}</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

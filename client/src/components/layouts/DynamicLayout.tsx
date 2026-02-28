/**
 * DYNAMIC Layout – Fitness, Sport, Yoga, Personal Training, Physiotherapie
 * Typography: Bebas Neue (headlines) + Rajdhani (body)
 * Feel: Energetic, motivating, action-oriented, high-performance
 * Structure: Diagonal cuts, full-bleed action photo, bold stats, vibrant accent colors
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Zap, Target, TrendingUp, Flame, Activity, Award } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";
import { getIndustryStats } from "@/lib/industryStats";

const HEADING = "var(--site-font-headline, 'Bebas Neue', 'Oswald', Impact, sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Bebas Neue', 'Oswald', Impact, sans-serif))";
const BODY = "var(--site-font-body, 'Rajdhani', 'Barlow', 'Inter', sans-serif)";

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

export default function DynamicLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
  businessCategory,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: "#0a0a0a", color: "#fff" }}>
      <DynamicNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <DynamicHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <DynamicAbout section={section} cs={cs} businessCategory={businessCategory} />}
          {(section.type === "services" || section.type === "features") && <DynamicServices section={section} cs={cs} />}
          {section.type === "testimonials" && <DynamicTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <DynamicFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <DynamicContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
          )}
          {section.type === "cta" && <DynamicCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <DynamicFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function DynamicNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "rgba(10,10,10,0.95)", backdropFilter: "blur(8px)" }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
          ) : (
            <>
              <Zap className="h-5 w-5" style={{ color: cs.primary }} />
              <span style={{ fontFamily: LOGO_FONT, fontSize: "1.6rem", letterSpacing: "0.08em", color: "#fff" }}>{websiteData.businessName.toUpperCase()}</span>
            </>
          )}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Training", "Über uns", "Kontakt"].map(label => (
            <a key={label} href="#" style={{ fontFamily: BODY, fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", fontWeight: 600 }} className="hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.6rem 1.25rem", fontFamily: HEADING, fontSize: "1rem", letterSpacing: "0.08em" }} className="hidden sm:flex items-center gap-2 btn-premium transition-opacity">
            <Phone className="h-4 w-4" /> Jetzt starten
          </a>
        )}
      </div>
    </nav>
  );
}

function DynamicHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ position: "relative", minHeight: "95vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center top" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.6) 50%, ${cs.primary}40 100%)` }} />
      {/* Diagonal cut overlay */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "120px", background: "#0a0a0a", clipPath: "polygon(0 60%, 100% 0, 100% 100%, 0 100%)" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 py-20 w-full">
        <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", border: `1px solid ${cs.primary}`, padding: "0.4rem 1rem", marginBottom: "2rem" }}>
          <Flame className="h-3.5 w-3.5" style={{ color: cs.primary }} />
          <span style={{ fontFamily: BODY, fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Jetzt durchstarten</span>
        </div>
        <h1 style={{ fontFamily: HEADING, fontSize: "clamp(4rem, 10vw, 9rem)", fontWeight: 400, lineHeight: 0.9, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "1.5rem" }} className="hero-animate-headline">
          {section.headline?.split(" ").slice(0, 2).join(" ")}
          <br />
          <span style={{ color: cs.primary, WebkitTextStroke: "2px transparent", textShadow: `0 0 30px ${cs.primary}60` }}>{section.headline?.split(" ").slice(2).join(" ") || "JETZT"}</span>
        </h1>
        {section.subheadline && <p style={{ fontFamily: BODY, fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", maxWidth: "550px", lineHeight: 1.6, marginBottom: "2.5rem", fontWeight: 500 }}>{section.subheadline}</p>}
        <div className="flex flex-wrap gap-4">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem 3rem", fontFamily: HEADING, fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase" }} className="btn-premium transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "1rem 3rem", fontFamily: HEADING, fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">
              Jetzt aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function DynamicAbout({ section, cs, businessCategory }: { section: WebsiteSection; cs: ColorScheme; businessCategory?: string | null }) {
  const icons = [Target, Award, TrendingUp, Flame];
  const stats = getIndustryStats(businessCategory || "");
  // Pad to 4 items for the 2x2 grid
  const stats4 = stats.length >= 4 ? stats : [...stats, ...stats].slice(0, 4);
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.5rem" }}>
            <Activity className="h-6 w-6" style={{ color: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Über uns</span>
          </div>
          <h2 data-reveal data-delay="0" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.95, marginBottom: "1.5rem" }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: BODY, fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.65)", marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{section.content}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats4.map(({ n, label: l }, i) => { const Icon = icons[i % icons.length]; return (
            <div key={i} style={{ backgroundColor: i === 0 ? cs.primary : "#1a1a1a", padding: "2rem", position: "relative", overflow: "hidden" }}>
              <Icon className="h-8 w-8 mb-2 opacity-30" style={{ color: i === 0 ? "#fff" : cs.primary }} />
              <p style={{ fontFamily: HEADING, fontSize: "2.5rem", color: i === 0 ? "#fff" : cs.primary, lineHeight: 1 }}>{n}</p>
              <p style={{ fontFamily: BODY, fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: i === 0 ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.45)", marginTop: "0.25rem" }}>{l}</p>
            </div>
          ); })}
        </div>
      </div>
    </section>
  );
}

function DynamicServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#0a0a0a", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
          <Zap className="h-6 w-6" style={{ color: cs.primary }} />
          <h2 data-reveal data-delay="100" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em" }}>{section.headline}</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#111", padding: "2rem", borderBottom: `3px solid ${cs.primary}`, position: "relative", overflow: "hidden" }} className="group hover:bg-opacity-80 transition-colors">
              <div style={{ position: "absolute", top: 0, right: 0, fontFamily: HEADING, fontSize: "5rem", color: `${cs.primary}08`, lineHeight: 1, pointerEvents: "none" }}>{String(i + 1).padStart(2, "0")}</div>
              <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                <Zap className="h-5 w-5" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: HEADING, fontSize: "1.3rem", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.75rem" }}>{item.title}</h3>
              <p style={{ fontFamily: BODY, fontSize: "0.9rem", lineHeight: 1.6, color: "rgba(255,255,255,0.55)", fontWeight: 500 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.05, backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="200" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(0,0,0,0.2)", padding: "2rem", backdropFilter: "blur(4px)" }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current text-yellow-300" />)}</div>
              <p style={{ fontFamily: BODY, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem", fontWeight: 500 }}>{item.description || item.title}</p>
              <p style={{ fontFamily: HEADING, fontSize: "1rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.08em" }}>{item.author || item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} style={{ borderLeft: `3px solid ${open === i ? cs.primary : "#333"}`, paddingLeft: "1.5rem", transition: "border-color 0.2s" }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left py-4 flex items-center justify-between" style={{ fontFamily: HEADING, fontSize: "1.1rem", color: "#fff", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-5 w-5 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5 flex-shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />}
              </button>
              {open === i && <p style={{ fontFamily: BODY, fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.55)", paddingBottom: "1rem", fontWeight: 500 }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DynamicContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#0a0a0a", padding: "5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "2rem", lineHeight: 0.95 }}>{section.headline}</h2>
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><div style={{ width: "3rem", height: "3rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-5 w-5 text-white" /></div><a href={`tel:${phone}`} style={{ fontFamily: BODY, fontSize: "1.1rem", color: "#fff", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><div style={{ width: "3rem", height: "3rem", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-5 w-5" style={{ color: cs.primary }} /></div><span style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><div style={{ width: "3rem", height: "3rem", backgroundColor: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /></div><a href={`mailto:${email}`} style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#111", padding: "2.5rem", borderTop: `4px solid ${cs.primary}` }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" style={{ color: cs.primary }} />
            <h3 style={{ fontFamily: HEADING, fontSize: "1.5rem", color: "#fff", letterSpacing: "0.05em" }}>Trainingszeiten</h3>
          </div>
          <div className="space-y-2">
            {(hours.length > 0 ? hours : ["Mo – Fr: 06:00 – 22:00 Uhr", "Sa – So: 08:00 – 20:00 Uhr"]).map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <div style={{ width: "6px", height: "6px", backgroundColor: cs.primary }} />
                <p style={{ fontFamily: BODY, fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", fontWeight: 500 }}>{h}</p>
              </div>
            ))}
          </div>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, color: "#fff", padding: "1rem 2.5rem", fontFamily: HEADING, fontSize: "1.1rem", letterSpacing: "0.08em", textTransform: "uppercase", marginTop: "2rem" }} className="btn-premium transition-opacity">
              <Zap className="h-4 w-4" /> Jetzt starten
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function DynamicCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: "#111", padding: "5rem 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "-50%", right: "-10%", width: "600px", height: "600px", borderRadius: "50%", backgroundColor: `${cs.primary}08` }} />
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: HEADING, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400, color: "#fff", textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.95 }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: BODY, fontSize: "1rem", color: "rgba(255,255,255,0.6)", marginTop: "1rem", fontWeight: 500 }}>{section.content}</p>}
        </div>
        <div className="flex flex-wrap gap-4 flex-shrink-0">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem 3rem", fontFamily: HEADING, fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "1rem 3rem", fontFamily: HEADING, fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase", backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function DynamicFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#000", padding: "2.5rem 0", borderTop: `3px solid ${cs.primary}` }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4" style={{ color: cs.primary }} />
          <span style={{ fontFamily: HEADING, fontSize: "1.3rem", color: "#fff", letterSpacing: "0.08em" }}>{websiteData.businessName.toUpperCase()}</span>
        </div>
        <p style={{ fontFamily: BODY, fontSize: "0.8rem", color: "rgba(255,255,255,0.3)", fontWeight: 500 }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: BODY, fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

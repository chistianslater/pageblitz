/**
 * VIBRANT Layout – Fitness, Gym, Sport, Yoga, Personal Training
 * Inspired by: High-energy fitness templates with bold typography and strong CTAs
 * Typography: Bebas Neue (headlines) + Inter (body)
 * Feel: Energetic, motivating, powerful, community-driven
 * Structure: Full-screen dark hero with large text, horizontal stats, program cards, transformation CTA
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Dumbbell, Zap, Target, TrendingUp, ArrowRight } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const DISPLAY = "'Bebas Neue', 'Impact', sans-serif";
const BODY = "var(--site-font-body, 'Inter', 'Helvetica Neue', sans-serif)";

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

export default function VibrantLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
}: Props) {
  const darkCs = { ...cs, background: "#0d0d0d", surface: "#161616", text: "#ffffff", textLight: "rgba(255,255,255,0.6)" };
  return (
    <div style={{ fontFamily: BODY, backgroundColor: darkCs.background, color: darkCs.text }}>
      <VibrantNav websiteData={websiteData} cs={darkCs} businessPhone={businessPhone} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <VibrantHero section={section} cs={darkCs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <VibrantAbout section={section} cs={darkCs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <VibrantServices section={section} cs={darkCs} />}
          {section.type === "testimonials" && <VibrantTestimonials section={section} cs={darkCs} />}
          {section.type === "faq" && <VibrantFAQ section={section} cs={darkCs} />}
          {section.type === "contact" && <VibrantContact section={section} cs={darkCs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />}
          {section.type === "cta" && <VibrantCTA section={section} cs={darkCs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <VibrantFooter websiteData={websiteData} cs={darkCs} slug={slug} />
    </div>
  );
}

function VibrantNav({ websiteData, cs, businessPhone }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null }) {
  return (
    <nav style={{ backgroundColor: "rgba(13,13,13,0.95)", backdropFilter: "blur(10px)", borderBottom: `1px solid rgba(255,255,255,0.05)`, fontFamily: BODY }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2rem", height: "2rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell className="h-4 w-4" style={{ color: "#000" }} />
          </div>
          <span style={{ fontFamily: DISPLAY, fontSize: "1.4rem", letterSpacing: "0.08em", color: cs.text, textTransform: "uppercase" }}>{websiteData.businessName}</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Programme", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.4)", fontWeight: 500 }} className="hover:text-white transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#000", padding: "0.6rem 1.5rem", fontSize: "0.8rem", letterSpacing: "0.1em", fontWeight: 700, textTransform: "uppercase" }} className="btn-premium transition-opacity">
            Jetzt starten
          </a>
        )}
      </div>
    </nav>
  );
}

function VibrantHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0 }}>
        <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 50%, rgba(0,0,0,0.3) 100%)" }} />
      </div>
      <div className="relative max-w-7xl mx-auto px-6 w-full py-20">
        <div style={{ maxWidth: "700px" }}>
          <div style={{ display: "inline-block", backgroundColor: cs.primary, padding: "0.3rem 0.9rem", marginBottom: "1.5rem" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "0.85rem", letterSpacing: "0.15em", color: "#000", textTransform: "uppercase" }}>Deine Transformation beginnt jetzt</span>
          </div>
          <h1 style={{ fontFamily: DISPLAY, fontSize: "clamp(4rem, 10vw, 9rem)", lineHeight: 0.85, letterSpacing: "0.02em", color: "#fff", textTransform: "uppercase", marginBottom: "1.5rem" }} className="hero-animate-headline">
            {section.headline}
          </h1>
          {section.subheadline && (
            <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "rgba(255,255,255,0.7)", marginBottom: "0.75rem", maxWidth: "500px" }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem", maxWidth: "500px" }}>{section.content}</p>
          )}
          {websiteData.googleRating && websiteData.googleReviewCount ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <GoogleRatingBadge rating={websiteData.googleRating} reviewCount={websiteData.googleReviewCount} variant="light" starColor={cs.primary} />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#000", padding: "1.1rem 3rem", fontSize: "0.9rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: "0.5rem" }} className="btn-premium transition-opacity">
                {section.ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `2px solid rgba(255,255,255,0.3)`, color: "#fff", padding: "1.1rem 3rem", fontSize: "0.9rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} className="hover:border-white transition-colors">
                Website aktivieren
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Stats bar */}
      <div style={{ position: "relative", backgroundColor: cs.primary, padding: "1.5rem 0" }}>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-4 gap-4">
          {[["500+", "Mitglieder"], ["15+", "Trainer"], ["50+", "Kurse/Woche"], ["98%", "Zufriedenheit"]].map(([num, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <p style={{ fontFamily: DISPLAY, fontSize: "2rem", color: "#000", lineHeight: 1 }}>{num}</p>
              <p style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(0,0,0,0.6)", marginTop: "0.2rem" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VibrantAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Über uns</span>
          <h2 data-reveal data-delay="0" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "1.5rem" }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontSize: "1rem", lineHeight: 1.8, color: "rgba(255,255,255,0.6)", marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(255,255,255,0.5)", marginBottom: "2rem" }}>{section.content}</p>}
          <div className="grid grid-cols-2 gap-4">
            {[["Modernste Geräte", Zap], ["Persönliches Coaching", Target], ["Flexible Zeiten", Clock], ["Community", TrendingUp]].map(([label, Icon]: any) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "1rem", backgroundColor: cs.background }}>
                <Icon className="h-5 w-5" style={{ color: cs.primary }} />
                <span style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
          <div style={{ position: "absolute", top: "2rem", left: "-2rem", backgroundColor: cs.primary, padding: "1.5rem 2rem" }}>
            <p style={{ fontFamily: DISPLAY, fontSize: "2.5rem", color: "#000", lineHeight: 1 }}>5★</p>
            <p style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(0,0,0,0.7)", marginTop: "0.25rem" }}>Bewertung</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VibrantServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const icons = [Dumbbell, Zap, Target, TrendingUp, Clock, Star];
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Programme</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} style={{ backgroundColor: cs.surface, padding: "2rem", borderTop: `3px solid ${i === 0 ? cs.primary : "transparent"}`, transition: "border-color 0.2s, transform 0.2s" }} className="group hover:-translate-y-1" onMouseEnter={e => (e.currentTarget.style.borderTopColor = cs.primary)} onMouseLeave={e => (e.currentTarget.style.borderTopColor = i === 0 ? cs.primary : "transparent")}>
                <Icon className="h-8 w-8 mb-4" style={{ color: cs.primary }} />
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", letterSpacing: "0.05em", color: cs.text, textTransform: "uppercase", marginBottom: "0.75rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function VibrantTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Erfolgsgeschichten</span>
          <h2 data-reveal data-delay="200" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2rem", borderLeft: `4px solid ${i === 1 ? cs.primary : "transparent"}` }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1.25rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => <Star key={j} className="h-4 w-4" style={{ fill: cs.primary, color: cs.primary }} />)}
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <p style={{ fontFamily: DISPLAY, fontSize: "0.9rem", letterSpacing: "0.1em", color: cs.primary, textTransform: "uppercase" }}>{item.author || "Mitglied"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VibrantFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>FAQ</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 600, color: cs.text }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5" style={{ color: "rgba(255,255,255,0.3)" }} />}
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)" }}>
                  {item.answer || item.description}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VibrantCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", letterSpacing: "0.02em", color: "#000", textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(0,0,0,0.7)", marginBottom: "2.5rem" }}>{section.content}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#000", color: cs.primary, padding: "1.1rem 3rem", fontSize: "0.9rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800 }} className="hover:opacity-80 transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid #000", color: "#000", padding: "1.1rem 3rem", fontSize: "0.9rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, backgroundColor: "transparent" }} className="hover:bg-black hover:text-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function VibrantContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "1rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.text, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "2.5rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "rgba(255,255,255,0.5)", marginBottom: "2.5rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: cs.text, fontSize: "1rem", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: cs.text, fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.background, padding: "2.5rem" }}>
          <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", letterSpacing: "0.05em", color: cs.text, textTransform: "uppercase", marginBottom: "1.5rem" }}>Probetraining buchen</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" placeholder="Dein Name" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.9rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            <input type="email" placeholder="Deine E-Mail" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.9rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            <input type="tel" placeholder="Telefon" style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.9rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none" }} />
            <textarea placeholder="Dein Ziel" rows={3} style={{ backgroundColor: cs.surface, border: "1px solid rgba(255,255,255,0.08)", padding: "0.9rem 1rem", color: cs.text, fontSize: "0.9rem", outline: "none", resize: "vertical" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: "#000", padding: "1rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, border: "none", cursor: "pointer" }} className="btn-premium transition-opacity">
              Jetzt starten
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function VibrantFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer style={{ backgroundColor: "#000", borderTop: `3px solid ${cs.primary}`, padding: "2.5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", textTransform: "uppercase" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

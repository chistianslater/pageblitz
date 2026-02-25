/**
 * MODERN Layout – Tech, Agency, Consulting, Real Estate, Retail
 * Inspired by: Clean modern agency templates with asymmetric layouts
 * Typography: Inter (all) with weight variation
 * Feel: Contemporary, clean, bold typography, minimal decoration
 * Structure: Asymmetric 60/40 hero, horizontal scrolling services, large testimonial quote
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, ArrowRight, ArrowUpRight } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const BODY = "'Inter', 'Helvetica Neue', sans-serif";

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

export default function ModernLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [] }: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: BODY, backgroundColor: "#ffffff", color: "#0a0a0a" }}>
      <ModernNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <ModernHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <ModernAbout section={section} cs={cs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <ModernServices section={section} cs={cs} />}
          {section.type === "testimonials" && <ModernTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <ModernFAQ section={section} cs={cs} />}
          {section.type === "contact" && <ModernContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />}
          {section.type === "cta" && <ModernCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <ModernFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function ModernNav({ websiteData, cs, businessPhone }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null }) {
  return (
    <nav style={{ backgroundColor: "#fff", borderBottom: "1px solid #f0f0f0", fontFamily: BODY }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
        <span style={{ fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0a0a0a" }}>{websiteData.businessName}</span>
        <div className="hidden md:flex items-center gap-10">
          {["Leistungen", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.85rem", color: "#666", fontWeight: 500 }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ fontSize: "0.85rem", color: "#0a0a0a", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.4rem" }} className="hover:opacity-60 transition-opacity">
            <Phone className="h-4 w-4" style={{ color: cs.primary }} /> {businessPhone}
          </a>
        )}
      </div>
    </nav>
  );
}

function ModernHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#fff", minHeight: "90vh", display: "flex" }}>
      <div className="max-w-7xl mx-auto px-8 w-full grid lg:grid-cols-5 gap-0 items-stretch">
        {/* Left 60% - Text */}
        <div className="lg:col-span-3 flex flex-col justify-center py-20 pr-12">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", marginBottom: "2rem" }}>
            <div style={{ width: "1.5rem", height: "2px", backgroundColor: cs.primary }} />
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Professionell & Zuverlässig</span>
          </div>
          <h1 style={{ fontSize: "clamp(3rem, 6vw, 5.5rem)", fontWeight: 900, lineHeight: 0.95, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "1.5rem" }} className="hero-animate-headline">
            {section.headline}
          </h1>
          {section.subheadline && (
            <p style={{ fontSize: "1.15rem", lineHeight: 1.6, color: "#555", marginBottom: "0.75rem", maxWidth: "480px" }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "#777", marginBottom: "2.5rem", maxWidth: "480px" }}>{section.content}</p>
          )}
          {websiteData.googleRating && websiteData.googleReviewCount ? (
            <div style={{ marginBottom: "1.5rem" }}>
              <GoogleRatingBadge rating={websiteData.googleRating} reviewCount={websiteData.googleReviewCount} variant="dark" starColor={cs.primary} />
            </div>
          ) : null}
          <div className="flex flex-wrap gap-4">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#0a0a0a", color: "#fff", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 700, letterSpacing: "-0.01em", display: "inline-flex", alignItems: "center", gap: "0.5rem" }} className="hover:opacity-80 transition-opacity">
                {section.ctaText} <ArrowRight className="h-4 w-4" />
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: "1px solid #ddd", color: "#0a0a0a", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 600, backgroundColor: "transparent" }} className="hover:border-black transition-colors">
                Website aktivieren
              </button>
            )}
          </div>
        </div>
        {/* Right 40% - Image */}
        <div className="lg:col-span-2 relative hidden lg:block">
          <img src={heroImageUrl} alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to bottom, transparent 60%, ${cs.primary}40 100%)` }} />
        </div>
      </div>
    </section>
  );
}

function ModernAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: "#f8f8f8", padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          <div style={{ position: "relative" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover" }} />
            <div style={{ position: "absolute", bottom: "2rem", right: "-2rem", backgroundColor: cs.primary, padding: "1.5rem 2rem" }}>
              <p style={{ fontSize: "2.5rem", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "-0.03em" }}>15+</p>
              <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.7)", letterSpacing: "0.1em", marginTop: "0.25rem" }}>JAHRE</p>
            </div>
          </div>
          <div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1rem" }}>Über uns</span>
            <h2 data-reveal data-delay="0" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "1.5rem", lineHeight: 1.05 }}>{section.headline}</h2>
            {section.subheadline && <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "#555", marginBottom: "1rem" }}>{section.subheadline}</p>}
            {section.content && <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "#777", marginBottom: "2rem" }}>{section.content}</p>}
            <a href="#kontakt" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 700, color: cs.primary }} className="hover:opacity-70 transition-opacity">
              Mehr erfahren <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ModernServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8">
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "4rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Leistungen</span>
            <h2 data-reveal data-delay="100" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", lineHeight: 1.05 }}>{section.headline}</h2>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1px", backgroundColor: "#f0f0f0" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", padding: "2.5rem 2rem" }} className="group hover:bg-gray-50 transition-colors">
              <div style={{ fontSize: "0.75rem", letterSpacing: "0.1em", color: "#bbb", fontWeight: 600, marginBottom: "1.5rem" }}>{String(i + 1).padStart(2, "0")}</div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: 800, letterSpacing: "-0.02em", color: "#0a0a0a", marginBottom: "0.75rem" }}>{item.title}</h3>
              <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#666" }}>{item.description}</p>
              <div style={{ marginTop: "1.5rem", display: "flex", alignItems: "center", gap: "0.4rem", fontSize: "0.8rem", fontWeight: 700, color: cs.primary }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                Mehr <ArrowRight className="h-3.5 w-3.5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ModernTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const featured = items[0];
  const rest = items.slice(1);
  return (
    <section style={{ backgroundColor: "#0a0a0a", padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8">
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "3rem" }}>Was Kunden sagen</span>
        {featured && (
          <div style={{ marginBottom: "4rem" }}>
            <p style={{ fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 700, lineHeight: 1.3, color: "#fff", letterSpacing: "-0.02em", maxWidth: "800px", marginBottom: "2rem" }}>
              "{featured.description || featured.title}"
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "3rem", height: "3rem", backgroundColor: cs.primary, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: 900, color: "#fff" }}>{(featured.author || "K")[0]}</span>
              </div>
              <div>
                <p style={{ fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{featured.author || "Kunde"}</p>
                <div style={{ display: "flex", gap: "2px", marginTop: "2px" }}>
                  {Array.from({ length: featured.rating || 5 }).map((_, j) => <Star key={j} className="h-3.5 w-3.5" style={{ fill: cs.primary, color: cs.primary }} />)}
                </div>
              </div>
            </div>
          </div>
        )}
        {rest.length > 0 && (
          <div className="grid md:grid-cols-2 gap-6" style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "3rem" }}>
            {rest.map((item, i) => (
              <div key={i} style={{ padding: "2rem", border: "1px solid rgba(255,255,255,0.08)" }}>
                <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
                <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{item.author || "Kunde"}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ModernFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fff", padding: "7rem 0" }}>
      <div className="max-w-4xl mx-auto px-8">
        <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>FAQ</span>
        <h2 data-reveal data-delay="200" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "3rem", lineHeight: 1.05 }}>{section.headline}</h2>
        <div>
          {items.map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.5rem 0", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "#0a0a0a", letterSpacing: "-0.01em" }}>{item.question || item.title}</span>
                <div style={{ width: "2rem", height: "2rem", backgroundColor: open === i ? "#0a0a0a" : "#f5f5f5", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background-color 0.2s" }}>
                  {open === i ? <ChevronUp className="h-4 w-4" style={{ color: "#fff" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#666" }} />}
                </div>
              </button>
              {open === i && (
                <div style={{ paddingBottom: "1.5rem", fontSize: "0.95rem", lineHeight: 1.7, color: "#666" }}>
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

function ModernCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#fff", lineHeight: 1.05 }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.7)", marginTop: "0.75rem" }}>{section.content}</p>}
        </div>
        <div style={{ display: "flex", gap: "1rem", flexShrink: 0, flexWrap: "wrap" }}>
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: cs.primary, padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 800, letterSpacing: "-0.01em", display: "inline-flex", alignItems: "center", gap: "0.5rem" }} className="btn-premium transition-opacity">
              {section.ctaText} <ArrowRight className="h-4 w-4" />
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid rgba(255,255,255,0.4)", color: "#fff", padding: "1rem 2.5rem", fontSize: "0.9rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:border-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ModernContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#f8f8f8", padding: "7rem 0" }}>
      <div className="max-w-7xl mx-auto px-8 grid lg:grid-cols-2 gap-20">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 900, letterSpacing: "-0.03em", color: "#0a0a0a", marginBottom: "2rem", lineHeight: 1.05 }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#666", marginBottom: "2.5rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: "#0a0a0a", fontSize: "1rem", fontWeight: 700 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: "#555", fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: "#0a0a0a", fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: "#555", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "3rem" }}>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" placeholder="Name" style={{ backgroundColor: "#f8f8f8", border: "none", borderBottom: "2px solid #f0f0f0", padding: "0.85rem 0", color: "#0a0a0a", fontSize: "0.95rem", outline: "none" }} onFocus={e => (e.target.style.borderBottomColor = cs.primary)} onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")} />
            <input type="email" placeholder="E-Mail" style={{ backgroundColor: "#f8f8f8", border: "none", borderBottom: "2px solid #f0f0f0", padding: "0.85rem 0", color: "#0a0a0a", fontSize: "0.95rem", outline: "none" }} onFocus={e => (e.target.style.borderBottomColor = cs.primary)} onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")} />
            <textarea placeholder="Nachricht" rows={4} style={{ backgroundColor: "#f8f8f8", border: "none", borderBottom: "2px solid #f0f0f0", padding: "0.85rem 0", color: "#0a0a0a", fontSize: "0.95rem", outline: "none", resize: "vertical" }} onFocus={e => (e.target.style.borderBottomColor = cs.primary)} onBlur={e => (e.target.style.borderBottomColor = "#f0f0f0")} />
            <button type="submit" style={{ backgroundColor: "#0a0a0a", color: "#fff", padding: "1rem", fontSize: "0.9rem", fontWeight: 800, border: "none", cursor: "pointer", letterSpacing: "-0.01em", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }} className="hover:opacity-80 transition-opacity">
              Senden <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function ModernFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: "#0a0a0a", padding: "2.5rem 0" }}>
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontSize: "1rem", fontWeight: 900, letterSpacing: "-0.02em", color: "rgba(255,255,255,0.3)" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.2)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href="#" style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.25)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

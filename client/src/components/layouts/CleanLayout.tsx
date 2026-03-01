/**
 * CLEAN Layout – Arzt, Zahnarzt, Beratung, Kanzlei, Versicherung
 * Typography: DM Serif Display (headlines) + DM Sans (body)
 * Feel: Trustworthy, professional, calm, clinical precision
 * Structure: Asymmetric hero with trust badges, icon-driven service grid, testimonial strip
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, CheckCircle, Shield, Award, Heart, Stethoscope, Users, Lock, ArrowRight } from "lucide-react";
import { toast } from "sonner";
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
  aboutImageUrl?: string;
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

export default function CleanLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
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
          {section.type === "about" && <CleanAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} />}
          {section.type === "gallery" && <CleanGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <CleanServices section={section} cs={cs} />}
          {section.type === "menu" && <CleanMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <CleanPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <CleanTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <CleanFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <CleanContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <CleanCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <CleanFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function CleanNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }} className="sticky top-0 z-50">
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
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "0.6rem 1.25rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.85rem", fontWeight: 600 }} className="hidden sm:flex items-center gap-2 btn-premium transition-opacity">
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
    <section style={{ backgroundColor: "#fff", position: "relative", overflow: "hidden" }} className="pt-24 pb-0">
      {/* Subtle Background Lines */}
      <div style={{ position: "absolute", top: 0, left: "10%", width: "1px", height: "100%", backgroundColor: "rgba(0,0,0,0.03)", zIndex: 0 }} />
      <div style={{ position: "absolute", top: 0, left: "30%", width: "1px", height: "100%", backgroundColor: "rgba(0,0,0,0.03)", zIndex: 0 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-16 items-center relative z-10">
        <div className="lg:col-span-7 py-20 pr-12">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.75rem", backgroundColor: "#f8fafc", border: "1px solid #e2e8f0", padding: "0.5rem 1.25rem", borderRadius: "2px", marginBottom: "2.5rem" }} className="hero-animate-badge">
            <Shield className="h-4 w-4" style={{ color: cs.primary }} />
            <span style={{ fontFamily: SANS, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#64748b", fontWeight: 700 }}>{websiteData.tagline?.split(" ")[0] || "Excellence"} & Trust</span>
          </div>
          
          <h1 style={{ 
            fontFamily: SERIF, 
            fontSize: "clamp(3rem, 6vw, 5.5rem)", 
            fontWeight: 400, 
            color: "#0f172a", 
            lineHeight: 1.05, 
            letterSpacing: "-0.02em", 
            marginBottom: "2.5rem" 
          }} className="hero-animate-headline">
            {section.headline}
          </h1>
          
          <div style={{ display: "flex", gap: "2rem", marginBottom: "3rem" }} className="hero-animate-sub">
            <div style={{ width: "4px", backgroundColor: cs.primary, borderRadius: "2px" }} />
            <div className="max-w-md">
              {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1.15rem", lineHeight: 1.7, color: "#475569", marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
              {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.8, color: "#64748b" }}>{section.content}</p>}
            </div>
          </div>
          
          <div className="flex flex-wrap gap-5 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#0f172a", color: "#fff", padding: "1.25rem 3.5rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "0px", transition: "all 0.3s ease" }} className="hover:bg-black shadow-xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `1.5px solid #0f172a`, color: "#0f172a", padding: "1.25rem 3.5rem", fontSize: "0.9rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:bg-slate-50 transition-all">
                Website aktivieren
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative py-12 lg:py-0">
          <div style={{ position: "absolute", top: "10%", right: "-10%", bottom: "10%", left: "10%", backgroundColor: "#f8fafc", zIndex: 0 }} />
          <div className="premium-shadow-lg" style={{ position: "relative", zIndex: 1, overflow: "hidden" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} className="hover:scale-105 transition-transform duration-700" />
          </div>
          
          {/* Precise floating trust info */}
          <div className="glass-card premium-shadow" style={{ position: "absolute", bottom: "15%", left: "-15%", padding: "2.5rem", zIndex: 30, borderLeft: `4px solid ${cs.primary}`, maxWidth: "260px" }}>
            <div className="flex items-center gap-2 mb-3">
              <Award className="h-5 w-5" style={{ color: cs.primary }} />
              <span style={{ fontSize: "0.7rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 800, color: "#0f172a" }}>Zertifizierte Qualität</span>
            </div>
            <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5, fontWeight: 500 }}>Höchste Standards in Beratung und Ausführung seit über 15 Jahren.</p>
          </div>
        </div>
      </div>

      {/* Stats bar - Integrated better */}
      <div style={{ backgroundColor: "#0f172a", marginTop: "6rem" }}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-12">
          {stats4.map(({ n, label: l }, i) => (
            <div key={i} className="text-center">
              <p style={{ fontFamily: SERIF, fontSize: "2.5rem", fontWeight: 400, color: cs.primary, lineHeight: 1, marginBottom: "0.5rem" }}>{n}</p>
              <p style={{ fontFamily: SANS, fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{l}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: "#fff", padding: "12rem 0", position: "relative" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-5 relative order-2 lg:order-1">
          <div style={{ position: "absolute", top: "-5%", left: "-5%", width: "100%", height: "100%", border: "1px solid #e2e8f0", zIndex: 0 }} />
          <div className="premium-shadow-lg relative z-10 overflow-hidden">
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
          </div>
        </div>
        
        <div className="lg:col-span-7 order-1 lg:order-2">
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800, display: "block", marginBottom: "1.5rem" }}>Wer wir sind</span>
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 400, color: "#0f172a", marginBottom: "2.5rem", lineHeight: 1.1 }}>{section.headline}</h2>
          
          <div className="space-y-8">
            {section.subheadline && (
              <p style={{ fontFamily: SANS, fontSize: "1.2rem", lineHeight: 1.7, color: "#334155", fontWeight: 500 }}>{section.subheadline}</p>
            )}
            {section.content && (
              <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.9, color: "#64748b" }}>{section.content}</p>
            )}
          </div>
          
          <div className="grid sm:grid-cols-2 gap-8 mt-12 pt-10 border-t border-slate-100">
            {["Moderne Präzision", "Persönliche Werte", "Zertifizierte Sicherheit", "Transparente Planung"].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div style={{ width: "2rem", height: "2px", backgroundColor: cs.primary }} />
                <span style={{ fontFamily: SANS, fontSize: "0.9rem", color: "#0f172a", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function CleanServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#f8fafc", padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
          <div className="max-w-2xl">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800, display: "block", marginBottom: "1.5rem" }}>Unsere Fachbereiche</span>
            <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 400, color: "#0f172a", lineHeight: 1.1 }}>{section.headline}</h2>
          </div>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <div key={i} className="group premium-shadow transition-all duration-500 hover:-translate-y-2" style={{ backgroundColor: "#fff", padding: "4rem 3rem", borderTop: i < 3 ? `4px solid ${cs.primary}` : "none" }}>
              <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "2.5rem", transition: "all 0.3s ease" }} className="group-hover:bg-slate-900 group-hover:rotate-12">
                <Heart className="h-6 w-6 group-hover:text-white transition-colors" style={{ color: cs.primary }} />
              </div>
              <h3 style={{ fontFamily: SANS, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", letterSpacing: "-0.01em" }}>{item.title}</h3>
              <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.7, color: "#64748b", marginBottom: "2rem" }}>{item.description}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em" }} className="opacity-40 group-hover:opacity-100 transition-all">
                Details <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  // Group items by category
  const categories: Record<string, any[]> = {};
  items.forEach(item => {
    const cat = (item as any).category || "Allgemein";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  return (
    <section data-section="menu" style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 600, marginBottom: "0.75rem" }}>Speisekarte</p>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text }}>{section.headline}</h2>
        </div>
        <div className="space-y-12">
          {Object.entries(categories).map(([catName, catItems], idx) => (
            <div key={idx}>
              <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", color: cs.primary, marginBottom: "2rem", borderBottom: `1px solid ${cs.primary}20`, paddingBottom: "0.5rem" }}>{catName}</h3>
              <div className="grid gap-6">
                {catItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 600, color: cs.text }}>{item.title}</h4>
                      {item.description && <p style={{ fontFamily: SANS, fontSize: "0.85rem", color: cs.textLight, marginTop: "0.25rem" }}>{item.description}</p>}
                    </div>
                    <span style={{ fontFamily: SANS, fontSize: "1.05rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  // Group items by category
  const categories: Record<string, any[]> = {};
  items.forEach(item => {
    const cat = (item as any).category || "Preise";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  return (
    <section data-section="pricelist" style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 600, marginBottom: "0.75rem" }}>Preise</p>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text }}>{section.headline}</h2>
        </div>
        <div className="space-y-8 bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          {Object.entries(categories).map(([catName, catItems], idx) => (
            <div key={idx}>
              <h3 style={{ fontFamily: SANS, fontSize: "0.9rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: cs.textLight, marginBottom: "1.25rem" }}>{catName}</h3>
              <div className="space-y-4">
                {catItems.map((item, i) => (
                  <div key={i} className="flex justify-between items-center gap-4 border-b border-slate-50 pb-3">
                    <span style={{ fontFamily: SANS, fontSize: "1rem", color: cs.text }}>{item.title}</span>
                    <div className="flex-1 border-b border-dotted border-slate-200 h-4" />
                    <span style={{ fontFamily: SANS, fontSize: "1rem", fontWeight: 700, color: cs.primary }}>{item.price}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CleanGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: "#fff", padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 600, marginBottom: "0.75rem" }}>Galerie</p>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.textLight, marginTop: "0.75rem" }}>{section.subheadline}</p>}
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "1/1", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
              <img src={`https://images.unsplash.com/photo-${1500000000000 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
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
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text, textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "1rem", padding: "2rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current" style={{ color: "#f59e0b" }} />)}</div>
              <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.7, color: cs.textLight, marginBottom: "1.25rem" }}>{item.description || item.title}</p>
              <div className="flex items-center gap-3">
                <div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: "var(--site-primary-on-surface-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SANS, fontSize: "0.9rem", fontWeight: 700, color: "var(--site-primary-on-surface)" }}>{(item.author || item.title || "K").charAt(0)}</span>
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
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: "var(--site-primary-on-surface)" }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: "var(--site-primary-on-surface)" }} />}
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
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <p style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 600, marginBottom: "1rem" }}>Kontakt</p>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: cs.text, marginBottom: "2rem" }}>{section.headline}</h2>
          <div className="space-y-4">
            {phone && <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><Phone className="h-4 w-4 flex-shrink-0" style={{ color: "var(--site-primary-on-white)" }} /><a href={`tel:${phone}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text, fontWeight: 500 }}>{phone}</a></div>}
            {address && <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "start", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" style={{ color: "var(--site-primary-on-white)" }} /><span style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{address}</span></div>}
            {email && <div style={{ backgroundColor: "#fff", borderRadius: "0.75rem", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}><Mail className="h-4 w-4 flex-shrink-0" style={{ color: "var(--site-primary-on-white)" }} /><a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: cs.textLight }}>Name</label>
                <input type="text" placeholder="Ihren Namen eingeben" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }} />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 600, color: cs.textLight }}>E-Mail</label>
                <input type="email" placeholder="mail@beispiel.de" style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none" }} />
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: cs.textLight }}>Nachricht</label>
              <textarea placeholder="Wie können wir Ihnen helfen?" rows={4} style={{ width: "100%", padding: "0.75rem 1rem", borderRadius: "0.5rem", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", resize: "none" }} />
            </div>
            <button type="submit" style={{ backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "0.85rem", borderRadius: "0.5rem", fontSize: "0.95rem", fontWeight: 700, border: "none", cursor: "pointer", marginTop: "0.5rem" }} className="hover:opacity-90 transition-opacity">
              {section.ctaText || "Nachricht senden"}
            </button>
          </form>
          
          <div style={{ marginTop: "2rem", paddingTop: "2rem", borderTop: "1px solid #f1f5f9" }}>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5" style={{ color: "var(--site-primary-on-white)" }} />
              <h3 style={{ fontFamily: SANS, fontSize: "1.1rem", fontWeight: 700, color: cs.text }}>Öffnungszeiten</h3>
            </div>
            <div className="space-y-2">
              {(hours.length > 0 ? hours : ["Mo – Fr: 08:00 – 18:00 Uhr", "Sa: 09:00 – 13:00 Uhr", "So: Geschlossen"]).map((h, i) => (
                <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight }}>{h}</p>
              ))}
            </div>
            {phone && (
              <a href={`tel:${phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "0.85rem 2rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, marginTop: "2rem" }} className="btn-premium transition-opacity">
                <Phone className="h-4 w-4" /> Termin vereinbaren
              </a>
            )}
          </div>
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
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 400, color: "var(--site-nav-text)", marginBottom: "1rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", color: "var(--site-nav-text-muted, rgba(0,0,0,0.7))", marginBottom: "2rem" }}>{section.content}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: "#fff", color: "var(--site-primary-on-white)", padding: "0.85rem 2.5rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 700 }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: "1.5px solid rgba(255,255,255,0.6)", color: "#fff", padding: "0.85rem 2.5rem", borderRadius: "0.5rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 600, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function CleanFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#1e293b", padding: "2.5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div style={{ width: "2rem", height: "2rem", borderRadius: "0.375rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: SERIF, fontSize: "0.9rem", fontWeight: 700, color: "#fff" }}>{websiteData.businessName.charAt(0)}</span>
          </div>
          <span style={{ fontFamily: SANS, fontSize: "0.95rem", fontWeight: 600, color: "#fff" }}>{websiteData.businessName}</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: "rgba(255,255,255,0.7)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <span key={l} style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.6)" }}>{l}</span>
          ))}
        </div>
      </div>
    </footer>
  );
}

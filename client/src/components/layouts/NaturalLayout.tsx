/**
 * NATURAL Layout – Organic Shop, Eco Products, Florist, Garden Center, Naturopath
 * Inspired by: Earth-toned wellness templates with organic shapes and natural textures
 * Typography: Playfair Display (headlines) + Nunito (body)
 * Feel: Organic, earthy, sustainable, warm, authentic
 * Structure: Warm hero with overlapping elements, feature strips, earthy color blocks
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Leaf, Sun, Flower, Droplets, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const SERIF = "var(--site-font-headline, 'Playfair Display', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Playfair Display', Georgia, serif))";
const ROUND = "'Nunito', 'Segoe UI', sans-serif";

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
}

export default function NaturalLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: ROUND, backgroundColor: "#faf8f4", color: "#2a2018" }}>
      <NaturalNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <NaturalHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <NaturalAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} />}
          {section.type === "gallery" && <NaturalGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <NaturalServices section={section} cs={cs} />}
          {section.type === "menu" && <NaturalMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <NaturalPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <NaturalTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <NaturalFAQ section={section} cs={cs} />}
                    {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <NaturalContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <NaturalCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <NaturalFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function NaturalNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "#faf8f4", borderBottom: "1px solid #e8e0d0", fontFamily: ROUND }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Leaf className="h-5 w-5" style={{ color: "var(--site-primary-on-surface)" }} />
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.3rem", fontWeight: 700, color: "#2a2018" }}>{websiteData.businessName}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Angebot", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.85rem", color: "#7a6a5a", fontWeight: 600 }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "0.55rem 1.25rem", fontSize: "0.8rem", borderRadius: "0.25rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }} className="btn-premium transition-opacity">
            <Phone className="h-3.5 w-3.5" /> Kontakt
          </a>
        )}
      </div>
    </nav>
  );
}

function NaturalHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#faf8f4", minHeight: "100vh", position: "relative", overflow: "hidden" }} className="flex items-center pt-24">
      {/* Soft Organic Background Shapes */}
      <div style={{ position: "absolute", top: "-10%", right: "-5%", width: "50vw", height: "50vw", background: `radial-gradient(circle, ${cs.primary}08 0%, transparent 70%)`, borderRadius: "50%", zIndex: 0 }} />
      <div style={{ position: "absolute", bottom: "-5%", left: "5%", width: "30vw", height: "30vw", background: `radial-gradient(circle, ${cs.primary}05 0%, transparent 60%)`, borderRadius: "50%", zIndex: 0 }} />
      
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 grid lg:grid-cols-12 gap-24 items-center relative z-10 w-full">
        <div className="lg:col-span-7 max-w-2xl">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", marginBottom: "2.5rem" }} className="hero-animate-badge">
            <span style={{ fontSize: "0.75rem", letterSpacing: "0.4em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Born from Nature</span>
            <div style={{ width: "4rem", height: "1px", backgroundColor: `${cs.primary}40` }} />
          </div>

          <h1 style={{ 
            fontFamily: SERIF, 
            fontSize: "clamp(3.5rem, 6vw, 5.5rem)", 
            fontWeight: 700, 
            lineHeight: 1.05, 
            color: "#2a2018", 
            marginBottom: "2.5rem", 
            letterSpacing: "-0.01em" 
          }} className="hero-animate-headline">
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: i === 2 ? "block" : "inline", fontStyle: i === 2 ? "italic" : "normal", color: i === 2 ? cs.primary : "inherit" }}>
                {word}{" "}
              </span>
            ))}
          </h1>

          <div style={{ display: "flex", gap: "2rem", marginBottom: "3.5rem" }} className="hero-animate-sub">
            <div style={{ width: "2px", backgroundColor: cs.primary, opacity: 0.3 }} />
            <div className="max-w-md">
              {section.subheadline && <p style={{ fontSize: "1.2rem", color: "#5a4a3a", lineHeight: 1.6, marginBottom: "1rem", fontWeight: 500 }}>{section.subheadline}</p>}
              {section.content && <p style={{ fontSize: "1rem", color: "#7a6a5a", lineHeight: 1.8 }}>{section.content}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: "#2a2018", color: "#fff", padding: "1.25rem 3.5rem", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, transition: "all 0.4s ease" }} 
                className="hover:scale-105 shadow-xl">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `1.5px solid #2a2018`, color: "#2a2018", padding: "1.25rem 3.5rem", fontSize: "0.9rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, backgroundColor: "transparent" }} 
                className="hover:bg-black hover:text-white transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>

        <div className="lg:col-span-5 relative">
          <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ borderRadius: "100px 20px 100px 20px" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover" }} className="hover:scale-105 transition-transform duration-1000" />
          </div>
          {/* Natural floating element */}
          <div className="glass-card premium-shadow" style={{ position: "absolute", bottom: "10%", left: "-15%", padding: "2.5rem", zIndex: 30, borderRadius: "50%", width: "180px", height: "180px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <Flower className="h-6 w-6 mb-2" style={{ color: cs.primary }} />
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#2a2018", fontWeight: 800 }}>Organic</span>
            <span style={{ fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "#7a6a5a" }}>Certified</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function NaturalAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.background, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-5 relative order-2 lg:order-1">
          <div style={{ position: "absolute", inset: "-1rem", border: `1px solid ${cs.primary}20`, borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%", zIndex: 0 }} />
          <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover" }} />
          </div>
        </div>
        
        <div className="lg:col-span-7 order-1 lg:order-2">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2rem" }}>
            <span style={{ fontSize: "0.85rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Unsere Wurzeln</span>
            <div style={{ width: "4rem", height: "1px", backgroundColor: `${cs.primary}40` }} />
          </div>
          
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 4.5vw, 4rem)", fontWeight: 700, color: cs.onBackground, marginBottom: "2.5rem", lineHeight: 1.1 }}>{section.headline}</h2>
          
          <p style={{ fontSize: "1.15rem", lineHeight: 1.8, color: cs.onBackground, marginBottom: "2rem", fontWeight: 500, opacity: 0.9 }}>{section.subheadline}</p>
          <p style={{ fontSize: "1.05rem", lineHeight: 1.9, color: cs.onBackground, marginBottom: "3.5rem", opacity: 0.7 }}>{section.content}</p>
          
          <div className="grid grid-cols-2 gap-10 pt-10 border-t border-slate-100">
            {[{ icon: Leaf, label: "Nachhaltig" }, { icon: Droplets, label: "Reinheit" }].map(({ icon: Icon, label }, i) => (
              <div key={i} className="flex items-center gap-4">
                <div style={{ width: "3.5rem", height: "3.5rem", backgroundColor: `${cs.primary}10`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Icon className="h-6 w-6" style={{ color: cs.primary }} />
                </div>
                <span style={{ fontSize: "0.95rem", color: cs.onBackground, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function NaturalServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: "#faf8f4", padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-24">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <Leaf className="h-5 w-5" style={{ color: cs.primary }} />
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 data-reveal style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, color: "#2a2018", lineHeight: 1.1 }}>
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: i === 2 ? "block" : "inline", fontStyle: i === 2 ? "italic" : "normal", color: i === 2 ? cs.primary : "inherit" }}>
                {word}{" "}
              </span>
            )) || "Im Einklang mit der Natur."}
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
          {items.map((item, i) => (
            <div key={i} className="group premium-shadow transition-all duration-500 hover:-translate-y-2" style={{ backgroundColor: "#fff", borderRadius: "2rem", padding: "4rem 3rem", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: "100%", height: "8px", backgroundColor: cs.primary, opacity: 0.1 }} />
              <h3 style={{ fontFamily: SERIF, fontSize: "1.6rem", fontWeight: 700, color: "#2a2018", marginBottom: "1.25rem" }}>{item.title}</h3>
              <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#7a6a5a", marginBottom: "2rem" }}>{item.description}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", fontSize: "0.85rem", fontWeight: 800, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em" }} className="opacity-0 group-hover:opacity-100 transition-all">
                Details <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NaturalGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: "#faf8f4", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Impressionen</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#2a2018" }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ borderRadius: "1rem", overflow: "hidden", aspectRatio: "1/1", border: "1px solid #e8e0d0", backgroundColor: cs.surface }}>
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1466637574441 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NaturalTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.primary, padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Kundenstimmen</span>
          <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "var(--site-nav-text)" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.1)", padding: "2rem", borderRadius: "1rem", backdropFilter: "blur(10px)" }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => <Star key={j} className="h-4 w-4" style={{ fill: "#fff", color: "var(--site-nav-text)" }} />)}
              </div>
              <p style={{ fontFamily: SERIF, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)", marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{item.author || "Kunde"}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NaturalFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Häufige Fragen</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#2a2018" }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "0.75rem", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#2a2018" }}>{item.question || item.title}</span>
                <div style={{ width: "1.75rem", height: "1.75rem", backgroundColor: open === i ? cs.primary : "#f0ece4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background-color 0.2s" }}>
                  {open === i ? <ChevronUp className="h-4 w-4" style={{ color: "#fff" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#7a6a5a" }} />}
                </div>
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: "#7a6a5a" }}>
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

function NaturalCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: "#2a2018", padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: "#fff", marginBottom: "1.25rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", marginBottom: "2.5rem" }}>{section.content}</p>}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "1rem 3rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "0.25rem" }} className="btn-premium transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid rgba(255,255,255,0.3)", color: "#fff", padding: "1rem 3rem", fontSize: "0.9rem", fontWeight: 700, borderRadius: "0.25rem", backgroundColor: "transparent" }} className="hover:border-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function NaturalMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: "#faf8f4", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: `${cs.primary}15`, padding: "0.4rem 1.25rem", borderRadius: "2rem", marginBottom: "1.5rem" }}>
            <Sun className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} />
            <span style={{ fontSize: "0.8rem", color: "var(--site-primary-on-surface)", fontWeight: 700 }}>Frische Auswahl</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "#2a2018", lineHeight: 1.15 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2rem] border border-[#e8e0d0]">
                <h3 style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: "#2a2018", marginBottom: "2rem", borderBottom: `2px solid ${cs.primary}20`, display: "inline-block", paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-6">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-1">
                        <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2a2018" }}>{item.title}</h4>
                        <div className="flex-1 border-b border-dotted border-[#e8e0d0] mx-2" />
                        <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "0.85rem", color: "#7a6a5a", lineHeight: 1.6 }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-x-12 gap-y-8 bg-white p-10 rounded-[2rem] border border-[#e8e0d0]">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-4 mb-1">
                  <h4 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#2a2018" }}>{item.title}</h4>
                  <div className="flex-1 border-b border-dotted border-[#e8e0d0] mx-2" />
                  <span style={{ fontSize: "1.05rem", fontWeight: 800, color: "var(--site-primary-on-surface)" }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontSize: "0.85rem", color: "#7a6a5a", lineHeight: 1.6 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function NaturalPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, padding: "0.4rem 1.25rem", borderRadius: "0.25rem", marginBottom: "1.5rem" }}>
            <span style={{ fontSize: "0.8rem", color: "var(--site-nav-text)", fontWeight: 700 }}>Preise & Details</span>
          </div>
          <h2 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4rem)", fontWeight: 700, color: "#2a2018", lineHeight: 1.15 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.75rem", fontWeight: 700, color: "#2a2018", marginBottom: "2rem", textAlign: "center" }}>{cat}</h3>
                <div className="bg-white rounded-[1rem] border border-[#e8e0d0] overflow-hidden">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center px-6 py-4 border-b border-[#e8e0d0] last:border-0 hover:bg-[#faf8f4] transition-colors">
                      <span style={{ fontSize: "1rem", color: "#2a2018", fontWeight: 600 }}>{item.title}</span>
                      <span style={{ fontSize: "1.1rem", color: "var(--site-primary-on-surface)", fontWeight: 800 }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-[1rem] border border-[#e8e0d0] overflow-hidden">
            {items.map((item, i) => (
              <div key={i} className="flex justify-between items-center px-8 py-5 border-b border-[#e8e0d0] last:border-0 hover:bg-[#faf8f4] transition-colors">
                <span style={{ fontSize: "1.1rem", color: "#2a2018", fontWeight: 700 }}>{item.title}</span>
                <span style={{ fontSize: "1.2rem", color: "var(--site-primary-on-surface)", fontWeight: 800 }}>{item.price}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function NaturalContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#faf8f4", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--site-primary-on-surface)", fontWeight: 700, display: "block", marginBottom: "0.75rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#2a2018", marginBottom: "2rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#7a6a5a", marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} /></div><a href={`tel:${phone}`} style={{ color: "#2a2018", fontSize: "1rem", fontWeight: 700 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} /></div><span style={{ color: "#7a6a5a", fontSize: "0.95rem", marginTop: "0.5rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} /></div><a href={`mailto:${email}`} style={{ color: "#2a2018", fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} /></div><div style={{ marginTop: "0.5rem" }}>{hours.map((h, i) => <p key={i} style={{ color: "#7a6a5a", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#f0ece4", padding: "2.5rem", borderRadius: "1rem" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: "#2a2018", marginBottom: "1.5rem" }}>Nachricht senden</h3>
          <form 
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            onSubmit={(e) => {
              e.preventDefault();
              toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
              (e.target as HTMLFormElement).reset();
            }}
          >
            <input type="text" placeholder="Ihr Name" style={{ backgroundColor: "#fff", border: "1px solid #e8e0d0", padding: "0.85rem 1rem", color: "#2a2018", fontSize: "0.9rem", outline: "none", borderRadius: "0.5rem" }} />
            <input type="email" placeholder="Ihre E-Mail" style={{ backgroundColor: "#fff", border: "1px solid #e8e0d0", padding: "0.85rem 1rem", color: "#2a2018", fontSize: "0.9rem", outline: "none", borderRadius: "0.5rem" }} />
            <textarea placeholder="Ihre Nachricht" rows={4} style={{ backgroundColor: "#fff", border: "1px solid #e8e0d0", padding: "0.85rem 1rem", color: "#2a2018", fontSize: "0.9rem", outline: "none", resize: "none", borderRadius: "0.5rem" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: "var(--site-nav-text)", padding: "1rem", fontSize: "0.9rem", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: "0.5rem" }} className="hover:opacity-90 transition-opacity">
              Senden
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function NaturalFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#2a2018", padding: "2.5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Leaf className="h-4 w-4" style={{ color: "var(--site-primary-on-surface)" }} />
          <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 700, color: "rgba(255,255,255,0.4)" }}>{websiteData.businessName}</span>
        </div>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.25)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

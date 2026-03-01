/**
 * VIBRANT Layout – Fitness, Gym, Sport, Yoga, Personal Training
 * Inspired by: High-energy fitness templates with bold typography and strong CTAs
 * Typography: Bricolage Grotesque (headlines) + Plus Jakarta Sans (body)
 * Feel: Energetic, motivating, powerful, community-driven
 * Structure: Full-screen dark hero with large text, horizontal stats, program cards, transformation CTA
 */
import { useState } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Dumbbell, Zap, Target, TrendingUp, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import { useScrollReveal } from "@/hooks/useAnimations";

const DISPLAY = "var(--site-font-headline, 'Bricolage Grotesque', 'Inter', sans-serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Bricolage Grotesque', 'Inter', sans-serif))";
const BODY = "var(--site-font-body, 'Plus Jakarta Sans', 'Inter', sans-serif)";

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

export default function VibrantLayout({ websiteData, cs, heroImageUrl, aboutImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();

  return (
    <div style={{ fontFamily: BODY, backgroundColor: cs.background, color: cs.onBackground }}>
      <VibrantNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <VibrantHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} />}
          {section.type === "about" && <VibrantAbout section={section} cs={cs} heroImageUrl={aboutImageUrl || heroImageUrl} />}
          {section.type === "gallery" && <VibrantGallery section={section} cs={cs} />}
          {(section.type === "services" || section.type === "features") && <VibrantServices section={section} cs={cs} />}
          {section.type === "menu" && <VibrantMenu section={section} cs={cs} />}
          {section.type === "pricelist" && <VibrantPricelist section={section} cs={cs} />}
          {section.type === "testimonials" && <VibrantTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <VibrantFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <VibrantContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} isLocked={contactFormLocked} />
          )}
          {section.type === "cta" && <VibrantCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <VibrantFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function VibrantNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: `${cs.background}F2`, backdropFilter: "blur(10px)", borderBottom: `1px solid ${cs.onBackground}0D`, fontFamily: BODY }} className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "2rem", height: "2rem", backgroundColor: cs.primary, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell className="h-4 w-4" style={{ color: cs.onPrimary }} />
          </div>
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", letterSpacing: "0.08em", color: cs.onBackground, textTransform: "uppercase", fontWeight: 800 }}>{websiteData.businessName}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Programme", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.8rem", letterSpacing: "0.1em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.5, fontWeight: 600 }} className="hover:text-primary transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "0.6rem 1.5rem", fontSize: "0.8rem", letterSpacing: "0.1em", fontWeight: 800, textTransform: "uppercase" }} className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
            Jetzt starten
          </a>
        )}
      </div>
    </nav>
  );
}

function VibrantHero({ section, cs, heroImageUrl, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ position: "relative", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", backgroundColor: cs.onBackground }}>
      {/* Dynamic Background with Glow and Grid */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        <img src={heroImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.6, objectPosition: "center 20%" }} />
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to right, ${cs.onBackground} 20%, transparent 100%)` }} />
        <div className="tech-glow absolute" style={{ top: "20%", right: "-10%", width: "50vw", height: "50vw", background: cs.primary, opacity: 0.15, filter: "blur(100px)", borderRadius: "50%" }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-24">
        <div style={{ maxWidth: "900px" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", backgroundColor: cs.primary, padding: "0.5rem 1.5rem", marginBottom: "3rem" }} className="hero-animate-badge">
            <Zap className="h-5 w-5" style={{ color: cs.onPrimary }} />
            <span style={{ fontFamily: DISPLAY, fontSize: "1rem", letterSpacing: "0.2em", color: cs.onPrimary, textTransform: "uppercase", fontWeight: 800 }}>Limitless Performance</span>
          </div>

          <h1 style={{ 
            fontFamily: DISPLAY, 
            fontSize: "clamp(5rem, 15vw, 12rem)", 
            lineHeight: 0.8, 
            letterSpacing: "-0.02em", 
            color: cs.background, 
            textTransform: "uppercase", 
            marginBottom: "3rem" 
          }} className="hero-animate-headline">
            {section.headline?.split(" ").map((word, i) => (
              <span key={i} style={{ display: "block", color: i === 1 ? cs.primary : cs.background, transform: i === 1 ? "translateX(2rem)" : "none" }}>{word}</span>
            ))}
          </h1>

          <div style={{ display: "flex", gap: "3rem", marginBottom: "4rem" }} className="hero-animate-sub">
            <div style={{ width: "6px", backgroundColor: cs.primary }} />
            <div className="max-w-xl">
              {section.subheadline && <p style={{ fontSize: "1.4rem", lineHeight: 1.4, color: cs.background, opacity: 0.9, marginBottom: "1rem", fontWeight: 800, textTransform: "uppercase" }}>{section.subheadline}</p>}
              {section.content && <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: cs.background, opacity: 0.6, fontWeight: 500 }}>{section.content}</p>}
            </div>
          </div>

          <div className="flex flex-wrap gap-6 hero-animate-cta">
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} 
                style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1.5rem 4rem", fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 900, transition: "all 0.4s ease" }} 
                className="hover:bg-primary transition-all shadow-2xl shadow-primary/30">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} 
                style={{ border: `2px solid ${cs.background}33`, color: cs.background, padding: "1.5rem 4rem", fontSize: "1.2rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 800, backgroundColor: "transparent" }} 
                className="hover:opacity-70 transition-all">
                Aktivieren
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Floating horizontal stats */}
      <div style={{ backgroundColor: `${cs.background}08`, backdropFilter: "blur(20px)", borderTop: `1px solid ${cs.background}1A` }}>
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[["500+", "Athleten"], ["15+", "Experten"], ["50+", "Classes"], ["24/7", "Zugang"]].map(([num, label]) => (
            <div key={label} className="text-center md:text-left">
              <p style={{ fontFamily: DISPLAY, fontSize: "3rem", color: cs.primary, lineHeight: 1 }}>{num}</p>
              <p style={{ fontSize: "0.75rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.onBackground, opacity: 0.5, fontWeight: 800 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VibrantAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.background, padding: "12rem 0", position: "relative", overflow: "hidden" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-12 gap-24 items-center">
        <div className="lg:col-span-7">
          <div style={{ display: "inline-flex", alignItems: "center", gap: "1.5rem", marginBottom: "2.5rem" }}>
            <div style={{ width: "4rem", height: "4px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: BODY, fontSize: "0.9rem", letterSpacing: "0.3em", textTransform: "uppercase", color: cs.primary, fontWeight: 800 }}>Unsere Vision</span>
          </div>
          
          <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", fontWeight: 700, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.02em", marginBottom: "3.5rem", lineHeight: 0.9 }}>{section.headline}</h2>
          
          <div className="space-y-8">
            <p style={{ fontSize: "1.3rem", lineHeight: 1.6, color: cs.onBackground, opacity: 0.9, fontWeight: 800, textTransform: "uppercase" }}>{section.subheadline}</p>
            <p style={{ fontSize: "1.1rem", lineHeight: 1.8, color: cs.onBackground, opacity: 0.6 }}>{section.content}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6 mt-16">
            {[["High-End Equipment", Zap], ["Pro Coaching", Target], ["Community Power", TrendingUp], ["Result Focused", Dumbbell]].map(([label, Icon]: any) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "1.5rem", backgroundColor: `${cs.onBackground}05`, border: `1px solid ${cs.onBackground}0D` }} className="group hover:border-primary/30 transition-colors">
                <Icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                <span style={{ fontSize: "0.9rem", color: cs.onBackground, opacity: 0.8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="lg:col-span-5 relative">
          <div style={{ position: "absolute", top: "-5%", right: "-5%", width: "100%", height: "100%", border: `1px solid ${cs.primary}40`, zIndex: 0 }} />
          <div className="premium-shadow-lg relative z-10 overflow-hidden" style={{ border: `1px solid ${cs.onBackground}1A` }}>
            <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", filter: "grayscale(30%)" }} />
          </div>
          {/* Transformation Badge */}
          <div style={{ position: "absolute", bottom: "2rem", left: "-2rem", backgroundColor: cs.primary, padding: "2rem", zIndex: 30, textAlign: "center", minWidth: "160px" }} className="shadow-2xl shadow-primary/30">
            <p style={{ fontFamily: DISPLAY, fontSize: "3rem", color: cs.onPrimary, lineHeight: 1 }}>98%</p>
            <p style={{ fontSize: "0.7rem", color: cs.onPrimary, opacity: 0.8, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.1em" }}>Success Rate</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function VibrantServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="services" style={{ backgroundColor: cs.onBackground, padding: "12rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center gap-6 mb-24">
          <div style={{ width: "5rem", height: "12px", backgroundColor: cs.primary }} />
          <h2 data-reveal style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 7rem)", fontWeight: 700, color: cs.background, textTransform: "uppercase", letterSpacing: "0.02em", lineHeight: 0.9 }}>
            Deine <span style={{ color: cs.primary }}>Programme</span>
          </h2>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px border" style={{ backgroundColor: `${cs.background}1A`, borderColor: `${cs.background}1A` }}>
          {items.map((item, i) => (
            <div key={i} className="group transition-all duration-500 hover:opacity-90" style={{ backgroundColor: cs.onBackground, padding: "5rem 3rem" }}>
              <Dumbbell className="h-12 w-12 text-primary mb-8 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
              <h3 style={{ fontFamily: DISPLAY, fontSize: "2.5rem", fontWeight: 700, color: cs.background, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1.5rem" }}>{item.title}</h3>
              <p style={{ fontSize: "1.1rem", lineHeight: 1.7, color: cs.background, opacity: 0.5, marginBottom: "3.5rem" }}>{item.description}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: "1rem", fontSize: "0.9rem", fontWeight: 900, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.2em" }} className="opacity-0 group-hover:opacity-100 group-hover:gap-6 transition-all">
                Jetzt starten <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VibrantGallery({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section data-section="gallery" style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1rem" }}>Impressionen</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {items.map((item, i) => (
            <div key={i} style={{ aspectRatio: "1/1", overflow: "hidden", position: "relative", backgroundColor: cs.surface, border: `1px solid ${cs.onBackground}0D` }} className="group">
              <img src={item.imageUrl || `https://images.unsplash.com/photo-${1534438327276 + i}?w=800&q=80&fit=crop`} alt={item.title || ""} style={{ width: "100%", height: "100%", objectFit: "cover" }} className="group-hover:scale-110 transition-transform duration-700" />
              <div style={{ position: "absolute", inset: 0, backgroundColor: `${cs.primary}30`, opacity: 0 }} className="group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))}
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
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1rem" }}>Erfolgsgeschichten</span>
          <h2 data-reveal data-delay="200" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onSurface, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, padding: "2rem", borderLeft: `4px solid ${i === 1 ? cs.primary : "transparent"}`, borderTop: `1px solid ${cs.onBackground}05`, borderRight: `1px solid ${cs.onBackground}05`, borderBottom: `1px solid ${cs.onBackground}05` }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1.25rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => <Star key={j} className="h-4 w-4" style={{ fill: cs.primary, color: cs.primary }} />)}
              </div>
              <p style={{ fontSize: "0.95rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.7, marginBottom: "1.5rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <p style={{ fontFamily: DISPLAY, fontSize: "0.9rem", letterSpacing: "0.1em", color: cs.primary, textTransform: "uppercase", fontWeight: 800 }}>{item.author || "Mitglied"}</p>
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
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1rem" }}>FAQ</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.95 }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", backgroundColor: `${cs.onBackground}1A` }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: cs.onBackground }}>{item.question || item.title}</span>
                {open === i ? <ChevronUp className="h-5 w-5" style={{ color: cs.primary }} /> : <ChevronDown className="h-5 w-5" style={{ color: cs.onBackground, opacity: 0.4 }} />}
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: cs.onBackground, opacity: 0.6 }}>
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
        <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", letterSpacing: "0.02em", color: cs.onPrimary, textTransform: "uppercase", lineHeight: 0.9, marginBottom: "1.5rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: cs.onPrimary, opacity: 0.8, marginBottom: "2.5rem" }}>{section.content}</p>}
        <div className="flex flex-wrap gap-4 justify-center">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.onPrimary, color: cs.primary, padding: "1.1rem 3rem", fontSize: "0.9rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 900 }} className="hover:opacity-90 transition-opacity shadow-xl">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: `2px solid ${cs.onPrimary}33`, color: cs.onPrimary, padding: "1.1rem 3rem", fontSize: "0.9rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 800, backgroundColor: "transparent" }} className="hover:opacity-70 transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function VibrantMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ display: "inline-block", backgroundColor: cs.primary, padding: "0.3rem 0.9rem", marginBottom: "1.5rem" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "0.85rem", letterSpacing: "0.15em", color: cs.onPrimary, textTransform: "uppercase", fontWeight: 800 }}>Unsere Auswahl</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", letterSpacing: "0.02em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.9 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-16">
            {categories.map((cat, idx) => (
              <div key={idx} className="space-y-8">
                <h3 style={{ fontFamily: DISPLAY, fontSize: "2rem", fontWeight: 900, color: cs.primary, textTransform: "uppercase", letterSpacing: "0.1em", borderBottom: `4px solid ${cs.primary}`, display: "inline-block", paddingBottom: "0.5rem" }}>{cat}</h3>
                <div className="space-y-8">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between items-baseline gap-4 mb-2">
                        <h4 style={{ fontFamily: DISPLAY, fontSize: "1.3rem", fontWeight: 900, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                        <div className="flex-1 border-b-2 mx-2" style={{ borderColor: `${cs.onBackground}1A` }} />
                        <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", fontWeight: 900, color: cs.primary }}>{item.price}</span>
                      </div>
                      {item.description && (
                        <p style={{ fontSize: "1rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.6 }}>{item.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-x-16 gap-y-12">
            {items.map((item, i) => (
              <div key={i}>
                <div className="flex justify-between items-baseline gap-4 mb-2">
                  <h4 style={{ fontFamily: DISPLAY, fontSize: "1.3rem", fontWeight: 900, color: cs.onBackground, textTransform: "uppercase", letterSpacing: "0.05em" }}>{item.title}</h4>
                  <div className="flex-1 border-b-2 mx-2" style={{ borderColor: `${cs.onBackground}1A` }} />
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.3rem", fontWeight: 900, color: cs.primary }}>{item.price}</span>
                </div>
                {item.description && (
                  <p style={{ fontSize: "1rem", color: cs.onBackground, opacity: 0.5, lineHeight: 1.6 }}>{item.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function VibrantPricelist({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const categories = Array.from(new Set(items.map(item => item.category))).filter(Boolean);

  return (
    <section style={{ backgroundColor: cs.background, padding: "6rem 0" }}>
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div style={{ textAlign: "center", marginBottom: "5rem" }}>
          <div style={{ display: "inline-block", backgroundColor: cs.primary, padding: "0.3rem 0.9rem", marginBottom: "1.5rem" }}>
            <span style={{ fontFamily: DISPLAY, fontSize: "0.85rem", letterSpacing: "0.15em", color: cs.onPrimary, textTransform: "uppercase", fontWeight: 800 }}>Tarife</span>
          </div>
          <h2 style={{ fontFamily: DISPLAY, fontSize: "clamp(3rem, 6vw, 6rem)", letterSpacing: "0.02em", color: cs.onBackground, textTransform: "uppercase", lineHeight: 0.9 }}>{section.headline}</h2>
        </div>

        {categories.length > 0 ? (
          <div className="space-y-12">
            {categories.map((cat, idx) => (
              <div key={idx} style={{ backgroundColor: cs.surface, padding: "3rem", position: "relative", border: `1px solid ${cs.onBackground}0D` }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "4px", backgroundColor: cs.primary }} />
                <h3 style={{ fontFamily: DISPLAY, fontSize: "1.8rem", fontWeight: 900, color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "2rem" }}>{cat}</h3>
                <div className="grid gap-4">
                  {items.filter(item => item.category === cat).map((item, i) => (
                    <div key={i} className="flex justify-between items-center py-4 border-b last:border-0" style={{ borderColor: `${cs.onSurface}0D` }}>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", color: cs.onSurface, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>{item.title}</span>
                      <span style={{ fontFamily: DISPLAY, fontSize: "1.4rem", fontWeight: 900, color: cs.primary }}>{item.price}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ backgroundColor: cs.surface, padding: "4rem", borderTop: `6px solid ${cs.primary}`, borderLeft: `1px solid ${cs.onBackground}0D`, borderRight: `1px solid ${cs.onBackground}0D`, borderBottom: `1px solid ${cs.onBackground}0D`, maxWidth: "800px", margin: "0 auto" }}>
            <div className="space-y-6">
              {items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-5 border-b last:border-0" style={{ borderColor: `${cs.onSurface}0D` }}>
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.25rem", color: cs.onSurface, textTransform: "uppercase", fontWeight: 900 }}>{item.title}</span>
                  <span style={{ fontFamily: DISPLAY, fontSize: "1.6rem", fontWeight: 900, color: cs.primary }}>{item.price}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function VibrantContact({ section, cs, phone, address, email, hours, isLocked }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[]; isLocked?: boolean }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.surface, padding: "6rem 0" }}>
      <div className={`max-w-7xl mx-auto px-6 grid ${isLocked === false ? 'lg:grid-cols-1 max-w-3xl text-center' : 'lg:grid-cols-2'} gap-16`}>
        <div>
          <span style={{ fontSize: "0.7rem", letterSpacing: "0.25em", textTransform: "uppercase", color: cs.primary, fontWeight: 700, display: "block", marginBottom: "1rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: DISPLAY, fontSize: "clamp(2.5rem, 4vw, 4rem)", letterSpacing: "0.03em", color: cs.onSurface, textTransform: "uppercase", lineHeight: 0.95, marginBottom: "2.5rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: cs.onSurface, opacity: 0.6, marginBottom: "2.5rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", alignItems: isLocked === false ? 'center' : 'flex-start' }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Phone className="h-5 w-5" style={{ color: cs.primary }} /><a href={`tel:${phone}`} style={{ color: cs.onSurface, fontSize: "1rem", fontWeight: 800 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><MapPin className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><span style={{ color: cs.onSurface, opacity: 0.7, fontSize: "0.95rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><Mail className="h-5 w-5" style={{ color: cs.primary }} /><a href={`mailto:${email}`} style={{ color: cs.onSurface, fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><Clock className="h-5 w-5 mt-0.5" style={{ color: cs.primary }} /><div>{hours.map((h, i) => <p key={i} style={{ color: cs.onSurface, opacity: 0.7, fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>

        {isLocked !== false && (
          <div style={{ backgroundColor: cs.background, padding: "2.5rem", border: `1px solid ${cs.onBackground}0D`, position: "relative" }}>
            <h3 style={{ fontFamily: DISPLAY, fontSize: "1.5rem", letterSpacing: "0.05em", color: cs.onBackground, textTransform: "uppercase", marginBottom: "1.5rem", fontWeight: 800 }}>Probetraining buchen</h3>
            <form 
              style={{ display: "flex", flexDirection: "column", gap: "1rem", opacity: isLocked ? 0.2 : 1, pointerEvents: isLocked ? 'none' : 'auto' }}
              onSubmit={(e) => {
                e.preventDefault();
                toast.success("Vielen Dank! Ihre Nachricht wurde gesendet.");
                (e.target as HTMLFormElement).reset();
              }}
            >
              <input type="text" placeholder="Dein Name" style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}1A`, padding: "0.9rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none" }} />
              <input type="email" placeholder="Deine E-Mail" style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}1A`, padding: "0.9rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none" }} />
              <input type="tel" placeholder="Telefon" style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}1A`, padding: "0.9rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none" }} />
              <textarea placeholder="Dein Ziel" rows={3} style={{ backgroundColor: cs.surface, border: `1px solid ${cs.onSurface}1A`, padding: "0.9rem 1rem", color: cs.onSurface, fontSize: "0.9rem", outline: "none", resize: "none" }} />
              <button type="submit" style={{ backgroundColor: cs.primary, color: cs.onPrimary, padding: "1rem", fontSize: "0.85rem", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 900, border: "none", cursor: "pointer" }} className="hover:opacity-90 transition-opacity shadow-lg shadow-primary/20">
                Jetzt starten
              </button>
            </form>

            {isLocked && (
              <div style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                zIndex: 10,
                padding: "2rem",
                textAlign: "center"
              }}>
                <div style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  backgroundColor: `${cs.primary}20`,
                  border: `1px solid ${cs.primary}50`,
                  borderRadius: "9999px",
                  padding: "0.5rem 1.25rem",
                }}>
                  <span style={{ fontSize: "0.85rem", color: cs.onBackground, fontWeight: 700 }}>🔒 Kontaktformular</span>
                </div>
                <p style={{ fontSize: "0.8rem", color: cs.onSurface, opacity: 0.6, margin: 0 }}>Zusatz-Feature: Im nächsten Schritt aktivierbar (+4,90 €/Monat)</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function VibrantFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: cs.onBackground, borderTop: `3px solid ${cs.primary}`, padding: "2.5rem 0" }}>
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: DISPLAY, fontSize: "1.2rem", letterSpacing: "0.1em", color: cs.background, opacity: 0.5, textTransform: "uppercase", fontWeight: 800 }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: cs.background, opacity: 0.4 }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: cs.background, opacity: 0.5, fontWeight: 700 }} className="hover:opacity-100 transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

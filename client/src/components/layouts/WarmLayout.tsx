/**
 * WARM Layout – Restaurant, Café, Bäckerei, Catering
 * Typography: Lora (serif headlines) + Nunito (body)
 * Feel: Cozy, inviting, artisanal, food-forward
 * Structure: Full-bleed food photo hero, card-style menu sections, warm earthy palette
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Utensils, Coffee, Leaf } from "lucide-react";
import type { WebsiteData, WebsiteSection, ColorScheme } from "@shared/types";
import GoogleRatingBadge from "../GoogleRatingBadge";
import { useScrollReveal, useNavbarScroll } from "@/hooks/useAnimations";

const SERIF = "var(--site-font-headline, 'Lora', Georgia, serif)";
const LOGO_FONT = "var(--logo-font, var(--site-font-headline, 'Lora', Georgia, serif))";
const SANS = "var(--site-font-body, 'Nunito', 'Inter', sans-serif)";

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
}

export default function WarmLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: SANS, backgroundColor: cs.background, color: cs.text }}>
      <WarmNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i} id={`section-${i}`}>
          {section.type === "hero" && <WarmHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <WarmAbout section={section} cs={cs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <WarmMenu section={section} cs={cs} />}
          {section.type === "testimonials" && <WarmTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <WarmFAQ section={section} cs={cs} />}
          {section.type === "contact" && (
            <WarmContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
          )}
          {section.type === "cta" && <WarmCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <WarmFooter websiteData={websiteData} cs={cs} />
    </div>
  );
}

function WarmNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav style={{ backgroundColor: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)", borderBottom: `1px solid ${cs.primary}30` }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 lg:px-8 h-18 py-3 flex items-center justify-between">
        <div className="text-center">
          <div className="flex items-center gap-2">
            <Utensils className="h-5 w-5" style={{ color: cs.primary }} />
            {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, color: cs.text }}>{websiteData.businessName}</span>}
          </div>
          {websiteData.tagline && <p style={{ fontFamily: SANS, fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.textLight }}>{websiteData.tagline.split(" ").slice(0, 5).join(" ")}</p>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Speisekarte", "Über uns", "Reservierung"].map(label => (
            <a key={label} href="#" style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight, fontWeight: 600 }} className="hover:opacity-70 transition-opacity">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.6rem 1.25rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.85rem", fontWeight: 700 }} className="hidden sm:flex items-center gap-2 btn-premium transition-opacity">
            <Phone className="h-3.5 w-3.5" /> Reservieren
          </a>
        )}
      </div>
    </nav>
  );
}

function WarmHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ position: "relative", minHeight: "88vh", display: "flex", alignItems: "flex-end" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${heroImageUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(20,10,5,0.9) 0%, rgba(20,10,5,0.3) 60%, transparent 100%)" }} />
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8 pb-20 w-full">
        <div className="flex items-center gap-3 mb-4">
          <Leaf className="h-4 w-4" style={{ color: cs.primary }} />
          <span style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Frisch & Regional</span>
        </div>
        <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 700, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "1rem", maxWidth: "700px" }} className="hero-animate-headline">{section.headline}</h1>
        {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1.1rem", color: "rgba(255,255,255,0.8)", maxWidth: "550px", lineHeight: 1.7, marginBottom: "2rem" }}>{section.subheadline}</p>}
        <div className="flex flex-wrap gap-4">
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2.5rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700 }} className="btn-premium transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid rgba(255,255,255,0.6)", color: "#fff", padding: "0.9rem 2.5rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">
              Jetzt aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function WarmAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-5 gap-12 items-center">
        <div className="lg:col-span-2">
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "1/1", objectFit: "cover", borderRadius: "50% 50% 50% 50% / 60% 60% 40% 40%" }} />
        </div>
        <div className="lg:col-span-3">
          <div className="flex items-center gap-3 mb-4">
            <div style={{ width: "2rem", height: "2px", backgroundColor: cs.primary }} />
            <span style={{ fontFamily: SANS, fontSize: "0.8rem", letterSpacing: "0.2em", textTransform: "uppercase", color: cs.primary, fontWeight: 700 }}>Unsere Geschichte</span>
          </div>
          <h2 data-reveal data-delay="0" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.text, marginBottom: "1.5rem", lineHeight: 1.2 }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight }}>{section.content}</p>}
          <div className="flex flex-wrap gap-6 mt-6">
            {[{ icon: Leaf, text: "Regionale Zutaten" }, { icon: Coffee, text: "Hausgemacht" }, { icon: Star, text: "Seit 2005" }].map(({ icon: Icon, text }, i) => (
              <div key={i} className="flex items-center gap-2">
                <Icon className="h-4 w-4" style={{ color: cs.primary }} />
                <span style={{ fontFamily: SANS, fontSize: "0.85rem", color: cs.textLight, fontWeight: 600 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function WarmMenu({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.background, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
            <Utensils className="h-4 w-4" style={{ color: cs.primary }} />
            <div style={{ width: "2rem", height: "1px", backgroundColor: cs.primary }} />
          </div>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.text }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.textLight, marginTop: "0.75rem" }}>{section.subheadline}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.surface, borderRadius: "1rem", overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
              <div style={{ height: "10px", backgroundColor: cs.primary, opacity: 0.7 + (i % 3) * 0.1 }} />
              <div style={{ padding: "1.75rem" }}>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 700, color: cs.text, marginBottom: "0.5rem" }}>{item.title}</h3>
                <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.6, color: cs.textLight }}>{item.description}</p>
                {(item as any).price && (
                  <div className="flex items-center justify-between mt-4">
                    <span style={{ fontFamily: SERIF, fontSize: "1.1rem", fontWeight: 700, color: cs.primary }}>{(item as any).price}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.primary, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: "#fff", textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "rgba(255,255,255,0.12)", borderRadius: "1rem", padding: "2rem", backdropFilter: "blur(4px)" }}>
              <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => <Star key={j} className="h-4 w-4 fill-current text-yellow-300" />)}</div>
              <p style={{ fontFamily: SERIF, fontSize: "0.95rem", lineHeight: 1.7, color: "rgba(255,255,255,0.9)", fontStyle: "italic", marginBottom: "1rem" }}>{item.description || item.title}</p>
              <p style={{ fontFamily: SANS, fontSize: "0.85rem", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>— {item.author || item.title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "2.2rem", fontWeight: 700, color: cs.text, textAlign: "center", marginBottom: "3rem" }}>{section.headline}</h2>
        <div className="space-y-3">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: cs.background, borderRadius: "0.75rem", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} className="w-full text-left px-6 py-4 flex items-center justify-between" style={{ fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700, color: cs.text }}>
                {item.question || item.title}
                {open === i ? <ChevronUp className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} /> : <ChevronDown className="h-4 w-4 flex-shrink-0" style={{ color: cs.primary }} />}
              </button>
              {open === i && <p style={{ fontFamily: SANS, fontSize: "0.9rem", lineHeight: 1.7, color: cs.textLight, padding: "0 1.5rem 1.5rem" }}>{item.answer || item.description}</p>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WarmContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: cs.background, padding: "5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-12">
        <div>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.text, marginBottom: "2rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontFamily: SANS, fontSize: "0.95rem", lineHeight: 1.8, color: cs.textLight, marginBottom: "2rem" }}>{section.content}</p>}
          <div className="space-y-4">
            {phone && <div className="flex items-center gap-3"><div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`tel:${phone}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text, fontWeight: 600 }}>{phone}</a></div>}
            {address && <div className="flex items-start gap-3"><div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-4 w-4" style={{ color: cs.primary }} /></div><span style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{address}</span></div>}
            {email && <div className="flex items-center gap-3"><div style={{ width: "2.5rem", height: "2.5rem", borderRadius: "50%", backgroundColor: `${cs.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`mailto:${email}`} style={{ fontFamily: SANS, fontSize: "0.95rem", color: cs.text }}>{email}</a></div>}
          </div>
        </div>
        <div style={{ backgroundColor: cs.surface, borderRadius: "1.5rem", padding: "2.5rem" }}>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5" style={{ color: cs.primary }} />
            <h3 style={{ fontFamily: SERIF, fontSize: "1.3rem", fontWeight: 700, color: cs.text }}>Öffnungszeiten</h3>
          </div>
          <div className="space-y-2">
            {(hours.length > 0 ? hours : ["Mo – Fr: 08:00 – 22:00 Uhr", "Sa – So: 09:00 – 23:00 Uhr"]).map((h, i) => (
              <p key={i} style={{ fontFamily: SANS, fontSize: "0.9rem", color: cs.textLight }}>{h}</p>
            ))}
          </div>
          {phone && (
            <a href={`tel:${phone}`} style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.9rem", fontWeight: 700, marginTop: "2rem" }} className="btn-premium transition-opacity">
              <Phone className="h-4 w-4" /> Tisch reservieren
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function WarmCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: cs.surface, padding: "5rem 0" }}>
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Utensils className="h-8 w-8 mx-auto mb-4" style={{ color: cs.primary }} />
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)", fontWeight: 700, color: cs.text, marginBottom: "1rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontFamily: SANS, fontSize: "1rem", color: cs.textLight, marginBottom: "2rem" }}>{section.content}</p>}
        <div className="flex flex-wrap justify-center gap-4">
          {section.ctaText && <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.9rem 2.5rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700 }} className="hover:opacity-90 transition-opacity">{section.ctaText}</a>}
          {showActivateButton && <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "0.9rem 2.5rem", borderRadius: "2rem", fontFamily: SANS, fontSize: "0.95rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">Jetzt aktivieren</button>}
        </div>
      </div>
    </section>
  );
}

function WarmFooter({ websiteData, cs }: { websiteData: WebsiteData; cs: ColorScheme }) {
  return (
    <footer style={{ backgroundColor: "#2d1a0e", padding: "3rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Utensils className="h-5 w-5" style={{ color: cs.primary }} />
          <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{websiteData.businessName}</span>
        </div>
        <p style={{ fontFamily: SANS, fontSize: "0.8rem", color: "rgba(255,255,255,0.4)" }}>{websiteData.footer?.text}</p>
        <p style={{ fontFamily: SANS, fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }}>Erstellt mit <span style={{ color: cs.primary }}>Pageblitz</span></p>
      </div>
    </footer>
  );
}

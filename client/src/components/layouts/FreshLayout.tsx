/**
 * FRESH Layout – Café, Bakery, Organic Shop, Wellness, Florist
 * Inspired by: Brew & Bloom template (light bg, blue accents, illustrated icons, scattered elements)
 * Typography: Playfair Display (headlines) + Nunito (body)
 * Feel: Warm, artisanal, handcrafted, inviting, playful
 * Structure: Centered hero with decorative elements, blue feature block, mosaic gallery, card services
 */
import { useState, useRef } from "react";
import { Phone, MapPin, Clock, Mail, Star, ChevronDown, ChevronUp, Heart, Coffee, Leaf, Sun } from "lucide-react";
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

export default function FreshLayout({ websiteData, cs, heroImageUrl, showActivateButton, onActivate, businessPhone, businessAddress, businessEmail, openingHours = [],
  slug,
  contactFormLocked = false,
  logoUrl,
}: Props) {
  useScrollReveal();
  return (
    <div style={{ fontFamily: ROUND, backgroundColor: "#fafaf8", color: "#1a1a1a" }}>
      <FreshNav websiteData={websiteData} cs={cs} businessPhone={businessPhone} logoUrl={logoUrl} />
      {websiteData.sections.map((section, i) => (
        <div key={i}>
          {section.type === "hero" && <FreshHero section={section} cs={cs} heroImageUrl={heroImageUrl} showActivateButton={showActivateButton} onActivate={onActivate} websiteData={websiteData} />}
          {section.type === "about" && <FreshAbout section={section} cs={cs} heroImageUrl={heroImageUrl} />}
          {(section.type === "services" || section.type === "features") && <FreshServices section={section} cs={cs} />}
          {section.type === "testimonials" && <FreshTestimonials section={section} cs={cs} />}
          {section.type === "faq" && <FreshFAQ section={section} cs={cs} />}
                    {section.type === "contact" && (
            <div style={{ position: "relative" }}>
              <FreshContact section={section} cs={cs} phone={businessPhone} address={businessAddress} email={businessEmail} hours={openingHours} />
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
          {section.type === "cta" && <FreshCTA section={section} cs={cs} showActivateButton={showActivateButton} onActivate={onActivate} />}
        </div>
      ))}
      <FreshFooter websiteData={websiteData} cs={cs} slug={slug} />
    </div>
  );
}

function FreshNav({ websiteData, cs, businessPhone, logoUrl }: { websiteData: WebsiteData; cs: ColorScheme; businessPhone?: string | null; logoUrl?: string | null }) {
  return (
    <nav data-section="header" style={{ backgroundColor: "#fafaf8", borderBottom: "1px solid #e8e8e4", fontFamily: ROUND }} className="sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          {logoUrl ? (<img src={logoUrl} alt={websiteData.businessName} style={{ height: "2rem", width: "auto", maxWidth: "160px", objectFit: "contain" }} />) : <span style={{ fontFamily: LOGO_FONT, fontSize: "1.4rem", fontWeight: 700, color: "#1a1a1a" }}>{websiteData.businessName}</span>}
          {websiteData.tagline && <span style={{ fontSize: "0.65rem", color: cs.primary, letterSpacing: "0.1em", fontWeight: 600 }}>{websiteData.tagline.slice(0, 35)}</span>}
        </div>
        <div className="hidden md:flex items-center gap-8">
          {["Angebot", "Über uns", "Kontakt"].map(label => (
            <a key={label} href={`#${label.toLowerCase()}`} style={{ fontSize: "0.85rem", color: "#666", fontWeight: 600 }} className="hover:text-black transition-colors">{label}</a>
          ))}
        </div>
        {businessPhone && (
          <a href={`tel:${businessPhone}`} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.55rem 1.25rem", fontSize: "0.8rem", borderRadius: "2rem", fontWeight: 700, display: "flex", alignItems: "center", gap: "0.4rem" }} className="btn-premium transition-opacity">
            <Phone className="h-3.5 w-3.5" /> Reservieren
          </a>
        )}
      </div>
    </nav>
  );
}

function FreshHero({ section, cs, heroImageUrl, showActivateButton, onActivate, websiteData }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string; showActivateButton?: boolean; onActivate?: () => void; websiteData: WebsiteData }) {
  return (
    <section style={{ backgroundColor: "#fafaf8", padding: "4rem 0 2rem", overflow: "hidden" }}>
      <div className="max-w-6xl mx-auto px-6">
        {/* Centered headline */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontFamily: SERIF, fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 700, color: "#1a1a1a", lineHeight: 1.15, letterSpacing: "-0.02em", marginBottom: "1.25rem" }} className="hero-animate-headline">
            {section.headline}
          </h1>
          {section.subheadline && (
            <p style={{ fontSize: "1.1rem", color: "#666", maxWidth: "500px", margin: "0 auto 1rem", lineHeight: 1.6 }}>{section.subheadline}</p>
          )}
          {section.content && (
            <p style={{ fontSize: "0.95rem", color: "#888", maxWidth: "450px", margin: "0 auto 2rem", lineHeight: 1.7 }}>{section.content}</p>
          )}
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            {section.ctaText && (
              <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "0.85rem 2.5rem", fontSize: "0.9rem", borderRadius: "2rem", fontWeight: 700 }} className="btn-premium transition-opacity">
                {section.ctaText}
              </a>
            )}
            {showActivateButton && (
              <button onClick={onActivate} style={{ border: `2px solid ${cs.primary}`, color: cs.primary, padding: "0.85rem 2.5rem", fontSize: "0.9rem", borderRadius: "2rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:opacity-70 transition-opacity">
                Website aktivieren
              </button>
            )}
          </div>
        </div>
        {/* Hero image with decorative frame */}
        <div style={{ position: "relative", maxWidth: "800px", margin: "0 auto" }}>
          <img src={heroImageUrl} alt={section.headline || ""} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", borderRadius: "1rem" }} />
          {/* Floating info badge */}
          <div style={{ position: "absolute", bottom: "-1.5rem", left: "2rem", backgroundColor: "#fff", borderRadius: "1rem", padding: "1rem 1.5rem", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Heart className="h-5 w-5" style={{ color: cs.primary }} />
            </div>
            <div>
              <p style={{ fontSize: "0.75rem", fontWeight: 700, color: "#1a1a1a" }}>Handgemacht</p>
              <p style={{ fontSize: "0.7rem", color: "#888" }}>mit Liebe zum Detail</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FreshAbout({ section, cs, heroImageUrl }: { section: WebsiteSection; cs: ColorScheme; heroImageUrl: string }) {
  return (
    <section style={{ backgroundColor: cs.primary, padding: "6rem 0", marginTop: "3rem" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.7)", fontWeight: 600, display: "block", marginBottom: "1rem" }}>Unsere Geschichte</span>
          <h2 data-reveal data-delay="0" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#fff", marginBottom: "1.5rem", lineHeight: 1.2 }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontSize: "1.05rem", lineHeight: 1.8, color: "rgba(255,255,255,0.8)", marginBottom: "1rem" }}>{section.subheadline}</p>}
          {section.content && <p style={{ fontSize: "0.95rem", lineHeight: 1.8, color: "rgba(255,255,255,0.7)", marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", gap: "2rem" }}>
            {[["100%", "Frisch täglich"], ["5★", "Bewertungen"], ["10+", "Jahre"]].map(([num, label]) => (
              <div key={label} style={{ textAlign: "center" }}>
                <p style={{ fontFamily: SERIF, fontSize: "1.8rem", fontWeight: 700, color: "#fff" }}>{num}</p>
                <p style={{ fontSize: "0.7rem", color: "rgba(255,255,255,0.6)", letterSpacing: "0.08em" }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <img src={heroImageUrl} alt="" style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", borderRadius: "1rem" }} />
        </div>
      </div>
    </section>
  );
}

function FreshServices({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  const icons = [Coffee, Leaf, Heart, Sun, Star, Clock];
  return (
    <section data-section="services" style={{ backgroundColor: "#fafaf8", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Unser Angebot</span>
          <h2 data-reveal data-delay="100" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#1a1a1a" }}>{section.headline}</h2>
          {section.subheadline && <p style={{ fontSize: "1rem", color: "#666", marginTop: "0.75rem" }}>{section.subheadline}</p>}
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, i) => {
            const Icon = icons[i % icons.length];
            return (
              <div key={i} style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #f0f0ec" }} className="hover:-translate-y-1 transition-transform">
                <div style={{ width: "3rem", height: "3rem", backgroundColor: `${cs.primary}15`, borderRadius: "0.75rem", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem" }}>
                  <Icon className="h-6 w-6" style={{ color: cs.primary }} />
                </div>
                <h3 style={{ fontFamily: SERIF, fontSize: "1.15rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "0.75rem" }}>{item.title}</h3>
                <p style={{ fontSize: "0.9rem", lineHeight: 1.7, color: "#666" }}>{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FreshTestimonials({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#f5f5f0", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "4rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Was unsere Gäste sagen</span>
          <h2 data-reveal data-delay="200" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#1a1a1a" }}>{section.headline}</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", padding: "2rem", borderRadius: "1rem", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
              <div style={{ display: "flex", gap: "0.2rem", marginBottom: "1rem" }}>
                {Array.from({ length: item.rating || 5 }).map((_, j) => (
                  <Star key={j} className="h-4 w-4" style={{ fill: "#f59e0b", color: "#f59e0b" }} />
                ))}
              </div>
              <p style={{ fontFamily: SERIF, fontSize: "0.95rem", lineHeight: 1.7, color: "#444", marginBottom: "1.25rem", fontStyle: "italic" }}>{item.description || item.title}</p>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}20`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontFamily: SERIF, fontSize: "1rem", fontWeight: 700, color: cs.primary }}>{(item.author || "K")[0]}</span>
                </div>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1a1a1a" }}>{item.author || "Gast"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FreshFAQ({ section, cs }: { section: WebsiteSection; cs: ColorScheme }) {
  const [open, setOpen] = useState<number | null>(null);
  const items = section.items || [];
  return (
    <section style={{ backgroundColor: "#fafaf8", padding: "6rem 0" }}>
      <div className="max-w-3xl mx-auto px-6">
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Häufige Fragen</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#1a1a1a" }}>{section.headline}</h2>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {items.map((item, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: "0.75rem", border: "1px solid #e8e8e4", overflow: "hidden" }}>
              <button onClick={() => setOpen(open === i ? null : i)} style={{ width: "100%", padding: "1.25rem 1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center", textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#1a1a1a" }}>{item.question || item.title}</span>
                <div style={{ width: "1.75rem", height: "1.75rem", backgroundColor: open === i ? cs.primary : "#f5f5f0", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "background-color 0.2s" }}>
                  {open === i ? <ChevronUp className="h-4 w-4" style={{ color: "#fff" }} /> : <ChevronDown className="h-4 w-4" style={{ color: "#666" }} />}
                </div>
              </button>
              {open === i && (
                <div style={{ padding: "0 1.5rem 1.25rem", fontSize: "0.9rem", lineHeight: 1.7, color: "#666" }}>
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

function FreshCTA({ section, cs, showActivateButton, onActivate }: { section: WebsiteSection; cs: ColorScheme; showActivateButton?: boolean; onActivate?: () => void }) {
  return (
    <section style={{ backgroundColor: "#1a1a1a", padding: "5rem 0" }}>
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 700, color: "#fff", marginBottom: "1.25rem" }}>{section.headline}</h2>
        {section.content && <p style={{ fontSize: "1.1rem", color: "rgba(255,255,255,0.6)", marginBottom: "2.5rem" }}>{section.content}</p>}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
          {section.ctaText && (
            <a href={section.ctaLink || "#kontakt"} style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem 3rem", fontSize: "0.9rem", borderRadius: "2rem", fontWeight: 700 }} className="btn-premium transition-opacity">
              {section.ctaText}
            </a>
          )}
          {showActivateButton && (
            <button onClick={onActivate} style={{ border: "2px solid rgba(255,255,255,0.3)", color: "#fff", padding: "1rem 3rem", fontSize: "0.9rem", borderRadius: "2rem", fontWeight: 700, backgroundColor: "transparent" }} className="hover:border-white transition-colors">
              Website aktivieren
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function FreshContact({ section, cs, phone, address, email, hours }: { section: WebsiteSection; cs: ColorScheme; phone?: string | null; address?: string | null; email?: string | null; hours?: string[] }) {
  return (
    <section id="kontakt" style={{ backgroundColor: "#fafaf8", padding: "6rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-16">
        <div>
          <span style={{ fontSize: "0.75rem", letterSpacing: "0.15em", textTransform: "uppercase", color: cs.primary, fontWeight: 600, display: "block", marginBottom: "0.75rem" }}>Kontakt</span>
          <h2 data-reveal data-delay="300" style={{ fontFamily: SERIF, fontSize: "clamp(2rem, 3.5vw, 3rem)", fontWeight: 700, color: "#1a1a1a", marginBottom: "2rem" }}>{section.headline}</h2>
          {section.content && <p style={{ fontSize: "1rem", lineHeight: 1.7, color: "#666", marginBottom: "2rem" }}>{section.content}</p>}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {phone && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Phone className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`tel:${phone}`} style={{ color: "#1a1a1a", fontSize: "1rem", fontWeight: 600 }}>{phone}</a></div>}
            {address && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><MapPin className="h-4 w-4" style={{ color: cs.primary }} /></div><span style={{ color: "#666", fontSize: "0.95rem", marginTop: "0.5rem" }}>{address}</span></div>}
            {email && <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}><Mail className="h-4 w-4" style={{ color: cs.primary }} /></div><a href={`mailto:${email}`} style={{ color: "#1a1a1a", fontSize: "1rem" }}>{email}</a></div>}
            {hours && hours.length > 0 && <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}><div style={{ width: "2.5rem", height: "2.5rem", backgroundColor: `${cs.primary}15`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Clock className="h-4 w-4" style={{ color: cs.primary }} /></div><div style={{ marginTop: "0.5rem" }}>{hours.map((h, i) => <p key={i} style={{ color: "#666", fontSize: "0.9rem" }}>{h}</p>)}</div></div>}
          </div>
        </div>
        <div style={{ backgroundColor: "#fff", padding: "2.5rem", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <h3 style={{ fontFamily: SERIF, fontSize: "1.5rem", fontWeight: 700, color: "#1a1a1a", marginBottom: "1.5rem" }}>Schreiben Sie uns</h3>
          <form style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <input type="text" placeholder="Ihr Name" style={{ backgroundColor: "#f5f5f0", border: "1px solid #e8e8e4", padding: "0.85rem 1rem", color: "#1a1a1a", fontSize: "0.9rem", outline: "none", borderRadius: "0.5rem" }} />
            <input type="email" placeholder="Ihre E-Mail" style={{ backgroundColor: "#f5f5f0", border: "1px solid #e8e8e4", padding: "0.85rem 1rem", color: "#1a1a1a", fontSize: "0.9rem", outline: "none", borderRadius: "0.5rem" }} />
            <textarea placeholder="Ihre Nachricht" rows={4} style={{ backgroundColor: "#f5f5f0", border: "1px solid #e8e8e4", padding: "0.85rem 1rem", color: "#1a1a1a", fontSize: "0.9rem", outline: "none", resize: "vertical", borderRadius: "0.5rem" }} />
            <button type="submit" style={{ backgroundColor: cs.primary, color: "#fff", padding: "1rem", fontSize: "0.9rem", fontWeight: 700, border: "none", cursor: "pointer", borderRadius: "0.5rem" }} className="hover:opacity-90 transition-opacity">
              Nachricht senden
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

function FreshFooter({ websiteData, cs, slug }: { websiteData: WebsiteData; cs: ColorScheme; slug?: string | null }) {
  return (
    <footer data-section="footer" style={{ backgroundColor: "#1a1a1a", padding: "2.5rem 0" }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <span style={{ fontFamily: SERIF, fontSize: "1.2rem", fontWeight: 700, color: "rgba(255,255,255,0.5)" }}>{websiteData.businessName}</span>
        <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.3)" }}>{websiteData.footer?.text}</p>
        <div style={{ display: "flex", gap: "1.5rem" }}>
          {["Impressum", "Datenschutz"].map(l => (
            <a key={l} href={slug ? `/site/${slug}/${l.toLowerCase()}` : "#"} style={{ fontSize: "0.75rem", color: "rgba(255,255,255,0.3)" }} className="hover:text-white transition-colors">{l}</a>
          ))}
        </div>
      </div>
    </footer>
  );
}

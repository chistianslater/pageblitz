import { useEffect } from "react";
import type { WebsiteData, ColorScheme } from "./types";
import { HeadlineSkeleton, TextSkeleton, CardSkeleton } from "../TextSkeleton";

interface Props {
  websiteData: WebsiteData;
  cs: ColorScheme;
  heroImageUrl?: string;
  isLoading?: boolean;
}

// Weltklasse-Design für lokale Unternehmen
// Inspiriert von UiCore Pro Templates

export default function PremiumLayout({ websiteData, cs, heroImageUrl, isLoading = false }: Props) {
  const { headline, tagline, description, topServices = [], business } = websiteData;
  
  // Farben aus dem ColorScheme
  const primary = cs.primary || "#3b82f6";
  const background = cs.background || "#ffffff";
  const surface = cs.surface || "#f8fafc";
  const text = cs.text || "#1e293b";
  const textMuted = cs.textMuted || "#64748b";

  if (isLoading) {
    return <PremiumSkeleton cs={cs} />;
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: background, color: text }}>
      {/* Hero Section - UiCore Style */}
      <section style={{ 
        minHeight: "90vh", 
        display: "flex", 
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        background: `linear-gradient(135deg, ${background} 0%, ${surface} 100%)`
      }}>
        {/* Subtle Background Pattern */}
        <div style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: "60%",
          height: "100%",
          background: `radial-gradient(circle at 70% 50%, ${primary}08 0%, transparent 60%)`,
          zIndex: 0
        }} />
        
        <div style={{ 
          maxWidth: "1280px", 
          margin: "0 auto", 
          padding: "4rem 2rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
          position: "relative",
          zIndex: 1
        }}>
          {/* Left Content */}
          <div>
            {/* Trust Badge */}
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              backgroundColor: `${primary}10`,
              borderRadius: "9999px",
              marginBottom: "2rem",
              fontSize: "0.875rem",
              fontWeight: 500,
              color: primary
            }}>
              <span style={{ width: "8px", height: "8px", backgroundColor: "#22c55e", borderRadius: "50%" }} />
              Jetzt verfügbar in Ihrer Region
            </div>
            
            {/* Headline - Large & Bold (UiCore Style) */}
            <h1 style={{
              fontSize: "clamp(2.5rem, 5vw, 4rem)",
              fontWeight: 800,
              lineHeight: 1.1,
              letterSpacing: "-0.02em",
              marginBottom: "1.5rem",
              color: text
            }}>
              {headline || "Ihr Partner für Exzellenz"}
            </h1>
            
            {/* Tagline */}
            <p style={{
              fontSize: "1.25rem",
              lineHeight: 1.6,
              color: textMuted,
              marginBottom: "2rem",
              maxWidth: "500px"
            }}>
              {tagline || description || "Wir bieten maßgeschneiderte Lösungen für Ihren Erfolg. Qualität, Professionalität und Zuverlässigkeit seit Jahren."}
            </p>
            
            {/* CTA Buttons - Prominent */}
            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <button style={{
                padding: "1rem 2rem",
                backgroundColor: primary,
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s",
                boxShadow: `0 4px 14px ${primary}40`
              }}>
                Jetzt Termin vereinbaren
              </button>
              <button style={{
                padding: "1rem 2rem",
                backgroundColor: "transparent",
                color: text,
                border: `2px solid ${textMuted}40`,
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s"
              }}>
                Leistungen entdecken
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div style={{
              display: "flex",
              gap: "2rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: `1px solid ${textMuted}20`
            }}>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: primary }}>500+</div>
                <div style={{ fontSize: "0.875rem", color: textMuted }}>Zufriedene Kunden</div>
              </div>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: primary }}>4.9</div>
                <div style={{ fontSize: "0.875rem", color: textMuted }}>Google Bewertung</div>
              </div>
              <div>
                <div style={{ fontSize: "1.75rem", fontWeight: 700, color: primary }}>15+</div>
                <div style={{ fontSize: "0.875rem", color: textMuted }}>Jahre Erfahrung</div>
              </div>
            </div>
          </div>
          
          {/* Right - Hero Image */}
          <div style={{ position: "relative" }}>
            <div style={{
              position: "relative",
              borderRadius: "16px",
              overflow: "hidden",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)"
            }}>
              <img 
                src={heroImageUrl || "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800"} 
                alt="Hero"
                style={{ width: "100%", height: "500px", objectFit: "cover" }}
              />
            </div>
            {/* Floating Card */}
            <div style={{
              position: "absolute",
              bottom: "-20px",
              left: "-20px",
              backgroundColor: "#ffffff",
              padding: "1.5rem",
              borderRadius: "12px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
              maxWidth: "250px"
            }}>
              <div style={{ display: "flex", gap: "0.25rem", marginBottom: "0.5rem" }}>
                {[1,2,3,4,5].map(i => (
                  <span key={i} style={{ color: "#fbbf24" }}>★</span>
                ))}
              </div>
              <p style={{ fontSize: "0.875rem", color: textMuted, margin: 0 }}>
                "Ausgezeichneter Service! Absolut empfehlenswert."
              </p>
              <p style={{ fontSize: "0.75rem", color: textMuted, marginTop: "0.5rem", fontWeight: 500 }}>
                – Maria S., zufriedene Kundin
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section - Grid Layout */}
      <section style={{ padding: "6rem 2rem", backgroundColor: surface }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <span style={{
              display: "inline-block",
              padding: "0.5rem 1rem",
              backgroundColor: `${primary}10`,
              color: primary,
              borderRadius: "9999px",
              fontSize: "0.875rem",
              fontWeight: 600,
              marginBottom: "1rem"
            }}>
              Unsere Leistungen
            </span>
            <h2 style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: text
            }}>
              Was wir für Sie tun
            </h2>
            <p style={{ fontSize: "1.125rem", color: textMuted, maxWidth: "600px", margin: "0 auto" }}>
              Professionelle Dienstleistungen, die Ihr Unternehmen voranbringen
            </p>
          </div>
          
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }}>
            {(topServices.length > 0 ? topServices : [
              { title: "Beratung & Planung", description: "Individuelle Lösungen für Ihre Bedürfnisse" },
              { title: "Professionelle Umsetzung", description: "Qualitätsarbeit mit modernsten Methoden" },
              { title: "Support & Betreuung", description: "Wir sind immer für Sie da" }
            ]).map((service, idx) => (
              <div key={idx} style={{
                backgroundColor: background,
                padding: "2rem",
                borderRadius: "16px",
                border: `1px solid ${textMuted}15`,
                transition: "all 0.3s",
                cursor: "pointer"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  backgroundColor: `${primary}10`,
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "1.5rem",
                  fontSize: "1.5rem"
                }}>
                  {idx === 0 ? "📋" : idx === 1 ? "⚡" : "🤝"}
                </div>
                <h3 style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "0.75rem",
                  color: text
                }}>
                  {service.title}
                </h3>
                <p style={{ color: textMuted, lineHeight: 1.6 }}>
                  {service.description}
                </p>
                <div style={{
                  marginTop: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: primary,
                  fontWeight: 600,
                  fontSize: "0.875rem"
                }}>
                  Mehr erfahren →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: "5rem 2rem",
        backgroundColor: primary,
        color: "#ffffff",
        textAlign: "center"
      }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <h2 style={{
            fontSize: "2.5rem",
            fontWeight: 700,
            marginBottom: "1rem"
          }}>
            Bereit für den nächsten Schritt?
          </h2>
          <p style={{
            fontSize: "1.125rem",
            marginBottom: "2rem",
            opacity: 0.9
          }}>
            Kontaktieren Sie uns jetzt für ein unverbindliches Gespräch
          </p>
          <button style={{
            padding: "1rem 2.5rem",
            backgroundColor: "#ffffff",
            color: primary,
            border: "none",
            borderRadius: "8px",
            fontSize: "1.125rem",
            fontWeight: 700,
            cursor: "pointer",
            transition: "all 0.2s"
          }}>
            Jetzt Kontakt aufnehmen
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: "3rem 2rem",
        backgroundColor: text,
        color: "#ffffff"
      }}>
        <div style={{
          maxWidth: "1280px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "3rem"
        }}>
          <div>
            <h4 style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "1rem" }}>
              {business?.name || "Ihr Unternehmen"}
            </h4>
            <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
              Qualität und Professionalität für Ihren Erfolg.
            </p>
          </div>
          <div>
            <h5 style={{ fontWeight: 600, marginBottom: "1rem" }}>Kontakt</h5>
            <p style={{ color: "#94a3b8", marginBottom: "0.5rem" }}>
              {business?.phone || "Tel: 0123 / 4567890"}
            </p>
            <p style={{ color: "#94a3b8" }}>
              {business?.email || "info@beispiel.de"}
            </p>
          </div>
          <div>
            <h5 style={{ fontWeight: 600, marginBottom: "1rem" }}>Öffnungszeiten</h5>
            <p style={{ color: "#94a3b8" }}>Mo–Fr: 08:00 – 18:00</p>
            <p style={{ color: "#94a3b8" }}>Sa: 09:00 – 14:00</p>
          </div>
        </div>
        <div style={{
          maxWidth: "1280px",
          margin: "3rem auto 0",
          paddingTop: "2rem",
          borderTop: "1px solid #334155",
          textAlign: "center",
          color: "#64748b",
          fontSize: "0.875rem"
        }}>
          © {new Date().getFullYear()} {business?.name || "Ihr Unternehmen"}. Alle Rechte vorbehalten.
        </div>
      </footer>
    </div>
  );
}

// Skeleton Loading State
function PremiumSkeleton({ cs }: { cs: ColorScheme }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", backgroundColor: cs.background || "#ffffff" }}>
      {/* Hero Skeleton */}
      <section style={{ minHeight: "90vh", display: "flex", alignItems: "center", padding: "4rem 2rem" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4rem" }}>
          <div>
            <div style={{ width: "200px", height: "32px", backgroundColor: "#e2e8f0", borderRadius: "9999px", marginBottom: "2rem" }} />
            <HeadlineSkeleton lines={2} animated={true} />
            <div style={{ marginTop: "1.5rem", maxWidth: "400px" }}>
              <TextSkeleton lines={2} animated={true} />
            </div>
            <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
              <div style={{ width: "180px", height: "48px", backgroundColor: "#e2e8f0", borderRadius: "8px" }} />
              <div style={{ width: "180px", height: "48px", backgroundColor: "#f1f5f9", borderRadius: "8px", border: "2px solid #e2e8f0" }} />
            </div>
          </div>
          <CardSkeleton animated={true} />
        </div>
      </section>

      {/* Services Skeleton */}
      <section style={{ padding: "6rem 2rem", backgroundColor: cs.surface || "#f8fafc" }}>
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "4rem" }}>
            <div style={{ width: "120px", height: "28px", backgroundColor: "#e2e8f0", borderRadius: "9999px", margin: "0 auto 1rem" }} />
            <div style={{ width: "300px", height: "40px", backgroundColor: "#e2e8f0", borderRadius: "8px", margin: "0 auto 1rem" }} />
            <div style={{ width: "500px", height: "24px", backgroundColor: "#f1f5f9", borderRadius: "4px", margin: "0 auto" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            {[1, 2, 3].map(i => (
              <CardSkeleton key={i} animated={true} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

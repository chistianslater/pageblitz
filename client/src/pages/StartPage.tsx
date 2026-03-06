import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLocation } from "wouter";
import { Globe, Zap, ArrowRight, CheckCircle, Loader2, AlertCircle, Share2, Mail, Lock } from "lucide-react";
import { toast } from "sonner";

// Detect whether a URL looks like a Google Maps / share link
function isGoogleLink(url: string): boolean {
  return /share\.google\/|maps\.app\.goo\.gl\/|google\.com\/maps\/|maps\.google\.com\//.test(url);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Step 1 → 2 → 3
type Step = "email" | "choice" | "gmb";

// Animated browser mockup component
function BrowserMockup({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Browser window */}
      <div className="relative bg-[#1a1a1a] rounded-2xl overflow-hidden shadow-2xl border border-[#2a2a2a]">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 bg-[#252525] border-b border-[#2a2a2a]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <div className="flex-1 mx-4">
            <div className="bg-[#1a1a1a] rounded-lg px-3 py-1.5 text-xs text-[#666] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="font-mono">pageblitz.de/preview/...</span>
            </div>
          </div>
        </div>
        
        {/* Browser content - Website preview */}
        <div className="p-4 space-y-3">
          {/* Hero section mockup */}
          <div className="bg-gradient-to-br from-[#c9a96e]/20 to-[#2a2a2a] rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 text-[10px] text-[#666] uppercase tracking-wider">Hero</div>
            <div className="w-32 h-3 bg-[#c9a96e]/30 rounded mb-3" />
            <div className="w-48 h-2 bg-[#444] rounded" />
          </div>
          
          {/* Features grid mockup */}
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#252525] rounded-xl p-4 border border-[#2a2a2a] relative">
                {i === 2 && (
                  <div className="absolute top-2 right-2 text-[8px] text-[#666] uppercase">Features</div>
                )}
                <div className="w-8 h-8 bg-[#c9a96e]/20 rounded-lg mb-2" />
                <div className="w-16 h-2 bg-[#444] rounded" />
              </div>
            ))}
          </div>
          
          {/* About section mockup */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#252525] rounded-xl p-4 border border-[#2a2a2a] relative">
              <div className="absolute top-2 right-2 text-[8px] text-[#666] uppercase">About</div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-[#333] rounded" />
                <div className="w-3/4 h-2 bg-[#333] rounded" />
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#c9a96e]/10 to-[#252525] rounded-xl p-4 border border-[#2a2a2a]" />
          </div>
        </div>
      </div>
      
      {/* Glow effect */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[#c9a96e]/20 via-transparent to-[#c9a96e]/20 rounded-3xl blur-xl -z-10" />
    </div>
  );
}

// Animated grain background
function GrainBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0">
      <svg className="w-full h-full opacity-[0.03]">
        <filter id="grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
        <feComponentTransfer>
          <feFuncR type="linear" slope="1.5" intercept="-0.25" />
          <feFuncG type="linear" slope="1.5" intercept="-0.25" />
          <feFuncB type="linear" slope="1.5" intercept="-0.25" />
        </feComponentTransfer>
      </filter>
      <rect width="100%" height="100%" filter="url(#grain)" />
    </svg>
    </div>
  );
}

// Floating shapes for visual interest
function FloatingShapes() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-20 left-10 w-64 h-64 bg-[#c9a96e]/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-40 right-20 w-96 h-96 bg-[#8b7355]/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-[#d4b896]/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '4s' }} />
    </div>
  );
}

export default function StartPage() {
  const [step, setStep] = useState<Step>("email");
  const [customerEmail, setCustomerEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [gmbUrl, setGmbUrl] = useState("");
  const [resolvedInfo, setResolvedInfo] = useState<{
    businessName: string | null;
    placeId: string | null;
    address: string | null;
    phone: string | null;
    category: string | null;
    reviews: any[];
    openingHours: string[];
    rating: string | null;
    reviewCount: number | null;
  } | null>(null);
  const [resolveError, setResolveError] = useState<string | null>(null);
  const [capturedLeadId, setCapturedLeadId] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const captureEmailMutation = trpc.selfService.captureEmail.useMutation({
    onSuccess: (data) => {
      setCapturedLeadId(data.websiteId);
      setStep("choice");
    },
    onError: () => {
      setStep("choice");
    },
  });

  const resolveMutation = trpc.selfService.resolveLink.useMutation({
    onSuccess: (data) => {
      if (data.resolved && data.businessName) {
        setResolvedInfo({
          businessName: data.businessName,
          placeId: data.placeId ?? null,
          address: (data as any).address ?? null,
          phone: (data as any).phone ?? null,
          category: (data as any).category ?? null,
          reviews: (data as any).reviews || [],
          openingHours: (data as any).openingHours || [],
          rating: (data as any).rating ? String((data as any).rating) : null,
          reviewCount: (data as any).reviewCount || null,
        });
        setResolveError(null);
        toast.success(`"${data.businessName}" gefunden!`);
      } else {
        setResolveError("Link konnte nicht aufgelöst werden. Du kannst trotzdem fortfahren.");
        toast.error("Link konnte nicht aufgelöst werden");
      }
    },
    onError: (err) => {
      setResolveError("Fehler beim Abrufen der Daten. Du kannst trotzdem fortfahren.");
      toast.error("Fehler: " + err.message);
    },
  });

  const startMutation = trpc.selfService.start.useMutation({
    onSuccess: (data) => {
      toast.success("Website wird erstellt...");
      navigate(`/preview/${data.previewToken}/onboarding`);
    },
    onError: (err) => {
      toast.error("Fehler beim Erstellen: " + err.message);
    },
  });

  const isLoading = resolveMutation.isPending || startMutation.isPending;
  const isCapturing = captureEmailMutation.isPending;

  const handleEmailNext = () => {
    const email = customerEmail.trim();
    if (!email) { setEmailError("Bitte gib deine E-Mail-Adresse ein"); return; }
    if (!isValidEmail(email)) { setEmailError("Bitte gib eine gültige E-Mail-Adresse ein"); return; }
    setEmailError(null);
    captureEmailMutation.mutate({ email });
  };

  const handleManualStart = () => {
    toast.info("Website wird erstellt...");
    startMutation.mutate({ customerEmail: customerEmail.trim(), source: "external" });
  };

  const handleResolveAndStart = () => {
    const url = gmbUrl.trim();
    if (!url) { toast.error("Bitte gib einen Link ein"); return; }
    if (isGoogleLink(url)) {
      resolveMutation.mutate({ url });
    } else {
      startMutation.mutate({ gmbUrl: url, customerEmail: customerEmail.trim(), source: "external" });
    }
  };

  const handleStartWithResolved = () => {
    if (!resolvedInfo) return;
    startMutation.mutate({
      gmbUrl: gmbUrl.trim(),
      businessName: resolvedInfo.businessName || undefined,
      placeId: resolvedInfo.placeId || undefined,
      address: resolvedInfo.address || undefined,
      phone: resolvedInfo.phone || undefined,
      category: resolvedInfo.category || undefined,
      customerEmail: customerEmail.trim(),
      source: "external",
      googleReviews: resolvedInfo.reviews.length > 0 ? resolvedInfo.reviews : undefined,
      openingHours: resolvedInfo.openingHours.length > 0 ? resolvedInfo.openingHours : undefined,
      rating: resolvedInfo.rating || undefined,
      reviewCount: resolvedInfo.reviewCount || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-[#2a2a2a] relative overflow-hidden">
      <GrainBackground />
      <FloatingShapes />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#c9a96e] rounded-xl flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl tracking-tight">Pageblitz</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm text-[#666]">
          <span className="text-[#999]">In 5 Min. fertig</span>
          <span className="text-[#999]">Ohne Anmeldung</span>
          <span className="text-[#999]">19,90 €/Mo</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-16">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: Form */}
          <div 
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
            style={{ transitionDelay: '200ms' }}
          >
            {/* Step Indicator */}
            <div className="flex items-center gap-3 mb-8">
              {["email", "choice", "gmb"].map((s, i) => {
                const isActive = s === step;
                const isPast = i < ["email", "choice", "gmb"].indexOf(step);
                const isVisible = step === "email" ? i < 2 : i < 3;
                
                if (!isVisible) return null;
                
                return (
                  <div key={s} className="flex items-center gap-2">
                    <div 
                      className={`w-2 h-2 rounded-full transition-all duration-500 ${
                        isPast ? 'bg-[#c9a96e]' : isActive ? 'bg-[#c9a96e] w-6' : 'bg-[#d4d4d4]'
                      }`} 
                    />
                  </div>
                );
              })}
            </div>

            {/* Form Container */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 md:p-10 shadow-xl border border-[#e8e4dc]">
              {/* Step 1: Email */}
              {step === "email" && (
                <div className="space-y-6">
                  <div>
                    <h1 className="font-serif text-3xl md:text-4xl text-[#1a1a1a] mb-2">
                      Deine Website in Minuten
                    </h1>
                    <p className="text-[#666] text-base">
                      Gib deine E-Mail ein – wir erstellen deine professionelle Website automatisch.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          if (emailError && isValidEmail(e.target.value.trim())) setEmailError(null);
                        }}
                        onKeyDown={(e) => e.key === "Enter" && handleEmailNext()}
                        placeholder="max@beispiel.de"
                        autoFocus
                        className={`h-14 px-5 bg-[#fafafa] border-[#e0dbd1] text-[#1a1a1a] placeholder:text-[#999] rounded-xl text-base focus:border-[#c9a96e] focus:ring-[#c9a96e]/20 ${emailError ? "border-red-400" : ""}`}
                      />
                      {emailError ? (
                        <p className="text-red-500 text-sm mt-2 flex items-center gap-1.5">
                          <AlertCircle className="w-4 h-4" /> {emailError}
                        </p>
                      ) : (
                        <p className="text-[#999] text-sm mt-2 flex items-center gap-1.5">
                          <Lock className="w-4 h-4" /> Kein Spam – nur dein Website-Link
                        </p>
                      )}
                    </div>

                    <Button
                      onClick={handleEmailNext}
                      disabled={!customerEmail.trim() || isCapturing}
                      className="w-full h-14 bg-[#1a1a1a] hover:bg-[#333] text-white font-medium rounded-xl text-base transition-all"
                    >
                      {isCapturing ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Wird gespeichert…
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Loslegen
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      )}
                    </Button>
                  </div>

                  <div className="pt-6 border-t border-[#e8e4dc]">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      {[
                        { icon: "⚡", text: "In 5 Min." },
                        { icon: "🎨", text: "Pro-Design" },
                        { icon: "📱", text: "Mobil" },
                      ].map((item) => (
                        <div key={item.text} className="flex flex-col items-center gap-1.5">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-[#666] text-xs">{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Choice */}
              {step === "choice" && (
                <div className="space-y-6">
                  <button
                    onClick={() => setStep("email")}
                    className="text-[#999] hover:text-[#666] text-sm mb-2 flex items-center gap-1.5 transition-colors"
                  >
                    ← Zurück
                  </button>

                  <div>
                    <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">
                      Wie möchtest du starten?
                    </h1>
                    <p className="text-[#666] text-sm">
                      Mit Google My Business geht es am schnellsten.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#f0f4ef] border border-[#d4e4d0]">
                    <CheckCircle className="w-4 h-4 text-[#4a7c59] shrink-0" />
                    <span className="text-[#4a7c59] text-sm">{customerEmail}</span>
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => setStep("gmb")}
                      className="w-full group relative overflow-hidden rounded-xl border-2 border-[#c9a96e]/30 bg-[#c9a96e]/5 hover:border-[#c9a96e]/50 transition-all p-5 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#c9a96e]/20 rounded-xl flex items-center justify-center shrink-0">
                          <Globe className="w-6 h-6 text-[#c9a96e]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[#1a1a1a] font-semibold text-sm mb-1">Mit Google My Business</div>
                          <div className="text-[#666] text-xs leading-relaxed">Daten automatisch übernommen – schnellster Weg</div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-[#c9a96e] mt-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>

                    <button
                      onClick={handleManualStart}
                      disabled={startMutation.isPending}
                      className="w-full group rounded-xl border-2 border-[#e0dbd1] bg-white hover:border-[#c9a96e]/30 transition-all p-5 text-left disabled:opacity-50"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-[#f5f3ef] rounded-xl flex items-center justify-center shrink-0">
                          <Zap className="w-6 h-6 text-[#999]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-[#1a1a1a] font-semibold text-sm mb-1">Ohne GMB starten</div>
                          <div className="text-[#666] text-xs leading-relaxed">Ein paar kurze Fragen beantworten</div>
                        </div>
                        {startMutation.isPending ? (
                          <Loader2 className="w-5 h-5 text-[#999] animate-spin" />
                        ) : (
                          <ArrowRight className="w-5 h-5 text-[#999] mt-1 group-hover:translate-x-1 transition-transform" />
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: GMB */}
              {step === "gmb" && (
                <div className="space-y-6">
                  <button
                    onClick={() => { setStep("choice"); setResolvedInfo(null); setResolveError(null); }}
                    className="text-[#999] hover:text-[#666] text-sm mb-2 flex items-center gap-1.5 transition-colors"
                  >
                    ← Zurück
                  </button>

                  <div>
                    <h1 className="font-serif text-3xl text-[#1a1a1a] mb-2">
                      Google My Business Link
                    </h1>
                    <p className="text-[#666] text-sm leading-relaxed">
                      Öffne Google Maps, suche dein Unternehmen und tippe auf <strong className="text-[#1a1a1a]">„Teilen"</strong>.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#f0f4ff] border border-[#d0d4f0]">
                    <div className="flex items-start gap-2">
                      <Share2 className="w-4 h-4 text-[#5a6fc7] mt-0.5 flex-shrink-0" />
                      <p className="text-[#5a6fc7] text-xs leading-relaxed">
                        Alle Formate unterstützt:<br />
                        <span className="font-mono text-[10px]">share.google · maps.app.goo.gl · google.com/maps</span>
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Input
                      value={gmbUrl}
                      onChange={(e) => { setGmbUrl(e.target.value); setResolvedInfo(null); setResolveError(null); }}
                      placeholder="https://share.google/…"
                      className="h-14 px-5 bg-[#fafafa] border-[#e0dbd1] text-[#1a1a1a] placeholder:text-[#999] rounded-xl text-base focus:border-[#c9a96e]"
                      onKeyDown={(e) => e.key === "Enter" && gmbUrl.trim() && !isLoading && handleResolveAndStart()}
                      disabled={isLoading}
                      autoFocus
                    />

                    {resolvedInfo && resolvedInfo.businessName && (
                      <div className="p-4 rounded-xl bg-[#f0f4ef] border border-[#d4e4d0]">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="w-4 h-4 text-[#4a7c59]" />
                          <span className="text-[#4a7c59] text-sm font-semibold">Gefunden!</span>
                        </div>
                        <p className="text-[#1a1a1a] font-semibold">{resolvedInfo.businessName}</p>
                        {resolvedInfo.address && <p className="text-[#666] text-xs mt-1">{resolvedInfo.address}</p>}
                      </div>
                    )}

                    {resolveError && (
                      <div className="p-4 rounded-xl bg-[#fdf2f0] border border-[#f0d4d0]">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-4 h-4 text-[#c45c4a] mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-[#c45c4a] text-sm">{resolveError}</p>
                            <button
                              onClick={() => startMutation.mutate({ gmbUrl: gmbUrl.trim(), customerEmail: customerEmail.trim(), source: "external" })}
                              disabled={startMutation.isPending}
                              className="text-[#a05040] text-xs underline mt-2 hover:text-[#803520]"
                            >
                              Trotzdem ohne Daten fortfahren →
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {resolvedInfo ? (
                      <Button
                        onClick={handleStartWithResolved}
                        disabled={isLoading}
                        className="w-full h-14 bg-[#4a7c59] hover:bg-[#3d6b4c] text-white font-medium rounded-xl"
                      >
                        {startMutation.isPending ? (
                          <div className="flex items-center gap-2"><Loader2 className="w-5 h-5 animate-spin" />Wird vorbereitet...</div>
                        ) : (
                          <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" />Mit diesen Daten starten</div>
                        )}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleResolveAndStart}
                        disabled={!gmbUrl.trim() || isLoading}
                        className="w-full h-14 bg-[#1a1a1a] hover:bg-[#333] text-white font-medium rounded-xl"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            {resolveMutation.isPending ? "Daten werden abgerufen…" : "Wird vorbereitet…"}
                          </div>
                        ) : (
                          <div className="flex items-center gap-2"><CheckCircle className="w-5 h-5" />Website erstellen</div>
                        )}
                      </Button>
                    )}

                    <button
                      onClick={handleManualStart}
                      disabled={isLoading}
                      className="w-full text-[#999] hover:text-[#666] text-sm transition-colors py-2"
                    >
                      Ohne GMB-Link fortfahren →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Trust bar */}
            <div className="mt-8 flex items-center justify-center gap-8 text-xs text-[#999]">
              <span>Kein Konto nötig</span>
              <span className="w-1 h-1 bg-[#d4d4d4] rounded-full" />
              <span>Kostenlos testen</span>
              <span className="w-1 h-1 bg-[#d4d4d4] rounded-full" />
              <span>19,90 €/Mo</span>
            </div>
          </div>

          {/* Right: Browser Mockup */}
          <div 
            className={`hidden lg:block transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-12'}`}
            style={{ transitionDelay: '400ms' }}
          >
            <BrowserMockup className="max-w-lg ml-auto" />
          </div>
        </div>
      </main>

      {/* Decorative bottom element */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#c9a96e]/30 to-transparent" />
    </div>
  );
}

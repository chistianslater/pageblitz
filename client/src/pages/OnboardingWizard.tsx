import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ChevronRight,
  ChevronLeft,
  Upload,
  Check,
  Zap,
  Loader2,
  Star,
  Shield,
  Globe,
  MessageSquare,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  /** Pass either websiteId (admin flow) or previewToken (customer flow) */
  websiteId?: number;
  previewToken?: string;
}

interface FormData {
  businessName: string;
  tagline: string;
  description: string;
  foundedYear: string;
  teamSize: string;
  usp: string;
  targetAudience: string;
  topServices: string;
  legalOwner: string;
  legalStreet: string;
  legalZip: string;
  legalCity: string;
  legalEmail: string;
  legalPhone: string;
  legalVatId: string;
  addOnContactForm: boolean;
  addOnGallery: boolean;
  addOnSubpages: string;
}

const EMPTY_FORM: FormData = {
  businessName: "",
  tagline: "",
  description: "",
  foundedYear: "",
  teamSize: "",
  usp: "",
  targetAudience: "",
  topServices: "",
  legalOwner: "",
  legalStreet: "",
  legalZip: "",
  legalCity: "",
  legalEmail: "",
  legalPhone: "",
  legalVatId: "",
  addOnContactForm: false,
  addOnGallery: false,
  addOnSubpages: "",
};

const STEPS = [
  { id: "welcome",   title: "Willkommen!",           icon: "🎉" },
  { id: "business",  title: "Unternehmensinfos",      icon: "🏢" },
  { id: "usp",       title: "Dein Alleinstellungsmerkmal", icon: "⭐" },
  { id: "services",  title: "Top-Leistungen",         icon: "🛠️" },
  { id: "legal",     title: "Rechtliche Daten",       icon: "⚖️" },
  { id: "addons",    title: "Add-ons wählen",         icon: "✨" },
  { id: "checkout",  title: "Website freischalten",   icon: "🚀" },
];

const STORAGE_KEY = (id: string) => `pageblitz_onboarding_${id}`;

// ─── Component ────────────────────────────────────────────────────────────────

export default function OnboardingWizard({ websiteId, previewToken }: Props) {
  const storageKey = STORAGE_KEY(previewToken || String(websiteId || ""));

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<FormData>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? { ...EMPTY_FORM, ...JSON.parse(saved) } : EMPTY_FORM;
    } catch {
      return EMPTY_FORM;
    }
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutDone, setCheckoutDone] = useState(false);

  // Resolve websiteId from token if needed
  const websiteQuery = trpc.website.get.useQuery(
    { token: previewToken! },
    { enabled: !!previewToken && !websiteId }
  );
  const resolvedWebsiteId = websiteId || websiteQuery.data?.website.id;
  const businessName = websiteQuery.data?.business?.name || formData.businessName || "dein Unternehmen";

  const saveStepMutation = trpc.onboarding.saveStep.useMutation();
  const completeMutation = trpc.onboarding.complete.useMutation();
  const checkoutMutation = trpc.checkout.createSession.useMutation({
    onSuccess: () => {
      setCheckoutDone(true);
      localStorage.removeItem(storageKey);
      toast.success("Zahlung erfolgreich! Deine Website wird aktiviert.");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  // Persist form data to localStorage on every change
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(formData));
  }, [formData, storageKey]);

  const set = (name: keyof FormData, value: any) =>
    setFormData((prev) => ({ ...prev, [name]: value }));

  const handleNext = async () => {
    if (currentStep === STEPS.length - 1) {
      // Final step: trigger checkout
      if (!resolvedWebsiteId) return;
      setIsSubmitting(true);
      try {
        // Save all data first
        await saveStepMutation.mutateAsync({
          websiteId: resolvedWebsiteId,
          step: currentStep,
          data: formData as any,
        });
        // Then launch Stripe checkout
        checkoutMutation.mutate({ websiteId: resolvedWebsiteId });
      } catch (e) {
        toast.error("Fehler beim Speichern. Bitte versuche es erneut.");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // Save step data silently in background
    if (resolvedWebsiteId) {
      saveStepMutation.mutate({
        websiteId: resolvedWebsiteId,
        step: currentStep,
        data: formData as any,
      });
    }
    setCurrentStep((s) => s + 1);
  };

  const handlePrev = () => setCurrentStep((s) => Math.max(0, s - 1));

  // ── Checkout done screen ──────────────────────────────────────────────────
  if (checkoutDone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Website aktiviert! 🎉</h1>
          <p className="text-gray-600 mb-8">
            Deine personalisierte Website für <strong>{businessName}</strong> ist jetzt live.
            Du erhältst in Kürze eine Bestätigungs-E-Mail.
          </p>
          {previewToken && (
            <a
              href={`/preview/${previewToken}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-colors"
            >
              <Globe className="w-4 h-4" />
              Website ansehen
            </a>
          )}
        </div>
      </div>
    );
  }

  // ── Loading state while resolving token ──────────────────────────────────
  if (previewToken && websiteQuery.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const step = STEPS[currentStep];
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // ── Monthly price calculation ─────────────────────────────────────────────
  const basePrice = 79;
  const galleryAddon = formData.addOnGallery ? 4.9 : 0;
  const subpagesCount = formData.addOnSubpages
    ? formData.addOnSubpages.split(",").filter(Boolean).length
    : 0;
  const subpagesAddon = subpagesCount * 9.9;
  const totalMonthly = basePrice + galleryAddon + subpagesAddon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <span className="font-bold text-gray-900">
              Page<span className="text-blue-600">blitz</span>
            </span>
          </div>
          <span className="text-sm text-gray-500">
            Schritt {currentStep + 1} / {STEPS.length}
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-1 bg-blue-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {/* Step indicator dots */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => i < currentStep && setCurrentStep(i)}
              className={`transition-all duration-300 rounded-full ${
                i === currentStep
                  ? "w-8 h-2 bg-blue-600"
                  : i < currentStep
                  ? "w-2 h-2 bg-blue-300"
                  : "w-2 h-2 bg-gray-200"
              }`}
              aria-label={s.title}
            />
          ))}
        </div>

        {/* Step icon + title */}
        <div className="text-center mb-8">
          <span className="text-5xl mb-4 block">{step.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">{step.title}</h1>
        </div>

        {/* ── STEP 0: Welcome ─────────────────────────────────────────────── */}
        {currentStep === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center space-y-6">
            <p className="text-lg text-gray-700">
              Hallo! Deine Website für <strong>{businessName}</strong> ist bereit.
            </p>
            <p className="text-gray-600">
              In den nächsten Schritten personalisieren wir sie mit deinen echten Daten –
              damit sie authentisch wirkt und Kunden überzeugt.
            </p>
            <div className="grid grid-cols-3 gap-4 text-sm">
              {[
                { icon: <Star className="w-5 h-5 text-amber-400" />, label: "Echte Infos statt Platzhalter" },
                { icon: <Shield className="w-5 h-5 text-green-500" />, label: "Impressum & Datenschutz inklusive" },
                { icon: <Zap className="w-5 h-5 text-blue-500" />, label: "In 5 Minuten fertig" },
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center gap-2 p-3 bg-gray-50 rounded-xl">
                  {item.icon}
                  <span className="text-gray-600 text-xs leading-tight">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 1: Business Info ────────────────────────────────────────── */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
            <p className="text-gray-600 text-sm">
              Diese Infos ersetzen die automatisch generierten Platzhalter auf deiner Website.
            </p>
            {[
              { name: "businessName", label: "Unternehmensname", type: "text", placeholder: "z.B. Müller Dachdeckerei GmbH" },
              { name: "tagline", label: "Tagline / Slogan", type: "text", placeholder: "z.B. Ihr Dach in besten Händen" },
              { name: "description", label: "Kurzbeschreibung (2-3 Sätze)", type: "textarea", placeholder: "Was macht dein Unternehmen? Seit wann? Was ist besonders?" },
              { name: "foundedYear", label: "Gründungsjahr (optional)", type: "text", placeholder: "z.B. 1998" },
              { name: "teamSize", label: "Teamgröße (optional)", type: "text", placeholder: "z.B. 12 Mitarbeiter" },
            ].map((field) => (
              <div key={field.name}>
                <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
                {field.type === "textarea" ? (
                  <Textarea
                    placeholder={field.placeholder}
                    value={(formData as any)[field.name] || ""}
                    onChange={(e) => set(field.name as keyof FormData, e.target.value)}
                    className="mt-1.5 min-h-24 resize-none"
                  />
                ) : (
                  <Input
                    placeholder={field.placeholder}
                    value={(formData as any)[field.name] || ""}
                    onChange={(e) => set(field.name as keyof FormData, e.target.value)}
                    className="mt-1.5"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 2: USP ─────────────────────────────────────────────────── */}
        {currentStep === 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
            <p className="text-gray-600 text-sm">
              Was unterscheidet dich von der Konkurrenz? Warum sollten Kunden genau zu dir kommen?
            </p>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Dein Alleinstellungsmerkmal (USP)
              </Label>
              <Textarea
                placeholder="z.B. Wir sind der einzige Dachdecker in der Region mit 24h-Notfallservice und 10 Jahren Garantie auf alle Arbeiten."
                value={formData.usp}
                onChange={(e) => set("usp", e.target.value)}
                className="mt-1.5 min-h-32 resize-none"
              />
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Zielgruppe (optional)
              </Label>
              <Textarea
                placeholder="z.B. Hausbesitzer und Vermieter in Bocholt und Umgebung, die eine schnelle und zuverlässige Lösung suchen."
                value={formData.targetAudience}
                onChange={(e) => set("targetAudience", e.target.value)}
                className="mt-1.5 min-h-24 resize-none"
              />
            </div>
          </div>
        )}

        {/* ── STEP 3: Services ────────────────────────────────────────────── */}
        {currentStep === 3 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
            <p className="text-gray-600 text-sm">
              Nenne deine 3 wichtigsten Leistungen – kommagetrennt. Diese erscheinen prominent auf deiner Website.
            </p>
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Top-Leistungen (kommagetrennt)
              </Label>
              <Textarea
                placeholder="z.B. Dachsanierung, Flachdachbau, Dachfenster-Einbau"
                value={formData.topServices}
                onChange={(e) => set("topServices", e.target.value)}
                className="mt-1.5 min-h-24 resize-none"
              />
            </div>
            <div className="bg-blue-50 rounded-xl p-4 text-sm text-blue-700">
              <strong>Tipp:</strong> Konkrete Leistungen wirken besser als allgemeine Begriffe.
              Statt "Dachreparatur" lieber "Sturmschäden beheben" oder "Dachziegel austauschen".
            </div>
          </div>
        )}

        {/* ── STEP 4: Legal ───────────────────────────────────────────────── */}
        {currentStep === 4 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 space-y-5">
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-4 text-sm text-amber-800 mb-2">
              <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Rechtliche Pflicht:</strong> Impressum und Datenschutzerklärung werden
                automatisch generiert und sind in deinem Paket kostenlos enthalten.
              </div>
            </div>
            {[
              { name: "legalOwner", label: "Inhaber / Geschäftsführer *", placeholder: "Max Müller" },
              { name: "legalStreet", label: "Straße und Hausnummer *", placeholder: "Musterstraße 12" },
              { name: "legalZip", label: "PLZ *", placeholder: "46395" },
              { name: "legalCity", label: "Stadt *", placeholder: "Bocholt" },
              { name: "legalEmail", label: "E-Mail-Adresse *", placeholder: "info@beispiel.de" },
              { name: "legalPhone", label: "Telefon *", placeholder: "+49 2871 12345" },
              { name: "legalVatId", label: "USt-IdNr. (optional)", placeholder: "DE123456789" },
            ].map((field) => (
              <div key={field.name}>
                <Label className="text-sm font-medium text-gray-700">{field.label}</Label>
                <Input
                  placeholder={field.placeholder}
                  value={(formData as any)[field.name] || ""}
                  onChange={(e) => set(field.name as keyof FormData, e.target.value)}
                  className="mt-1.5"
                />
              </div>
            ))}
          </div>
        )}

        {/* ── STEP 5: Add-ons ─────────────────────────────────────────────── */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <p className="text-gray-600 text-sm text-center mb-6">
              Erweitere deine Website mit optionalen Features. Alle Add-ons können später hinzugefügt werden.
            </p>

            {/* Contact Form */}
            <button
              onClick={() => set("addOnContactForm", !formData.addOnContactForm)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                formData.addOnContactForm
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.addOnContactForm ? "bg-blue-100" : "bg-gray-100"}`}>
                <MessageSquare className={`w-6 h-6 ${formData.addOnContactForm ? "text-blue-600" : "text-gray-500"}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Kontaktformular</p>
                <p className="text-sm text-gray-500">Kunden können direkt über deine Website anfragen</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-gray-900">inklusive</p>
                <p className="text-xs text-gray-400">im Basispaket</p>
              </div>
            </button>

            {/* Gallery */}
            <button
              onClick={() => set("addOnGallery", !formData.addOnGallery)}
              className={`w-full flex items-center gap-4 p-5 rounded-2xl border-2 transition-all text-left ${
                formData.addOnGallery
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.addOnGallery ? "bg-blue-100" : "bg-gray-100"}`}>
                <ImageIcon className={`w-6 h-6 ${formData.addOnGallery ? "text-blue-600" : "text-gray-500"}`} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-gray-900">Bildergalerie</p>
                <p className="text-sm text-gray-500">Zeige deine Projekte und Referenzen in einer professionellen Galerie</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-blue-600">+4,90 €/Mo</p>
              </div>
            </button>

            {/* Subpages */}
            <div className={`w-full p-5 rounded-2xl border-2 transition-all ${
              formData.addOnSubpages ? "border-blue-500 bg-blue-50" : "border-gray-200 bg-white"
            }`}>
              <div className="flex items-center gap-4 mb-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${formData.addOnSubpages ? "bg-blue-100" : "bg-gray-100"}`}>
                  <FileText className={`w-6 h-6 ${formData.addOnSubpages ? "text-blue-600" : "text-gray-500"}`} />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">Unterseiten</p>
                  <p className="text-sm text-gray-500">z.B. "Über uns", "Projekte", "Team"</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-blue-600">+9,90 €/Seite/Mo</p>
                </div>
              </div>
              <Input
                placeholder="Seitennamen kommagetrennt: Über uns, Projekte, Team"
                value={formData.addOnSubpages}
                onChange={(e) => set("addOnSubpages", e.target.value)}
                className="bg-white"
              />
            </div>
          </div>
        )}

        {/* ── STEP 6: Checkout ────────────────────────────────────────────── */}
        {currentStep === 6 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Deine Website für {businessName}</h2>

              {/* Price breakdown */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Basis-Paket</p>
                    <p className="text-gray-500 text-xs">Website + Hosting + SSL + Updates + Support + Impressum & Datenschutz</p>
                  </div>
                  <span className="font-bold text-gray-900 whitespace-nowrap">{basePrice} €/Mo</span>
                </div>

                {formData.addOnContactForm && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Kontaktformular</span>
                    <span className="font-medium text-gray-900">inklusive</span>
                  </div>
                )}

                {formData.addOnGallery && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">Bildergalerie</span>
                    <span className="font-medium text-gray-900">+4,90 €/Mo</span>
                  </div>
                )}

                {subpagesCount > 0 && (
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-600">{subpagesCount} Unterseite{subpagesCount > 1 ? "n" : ""}</span>
                    <span className="font-medium text-gray-900">+{(subpagesCount * 9.9).toFixed(2).replace(".", ",")} €/Mo</span>
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-900 text-base">Gesamt</span>
                  <span className="font-bold text-2xl text-gray-900">
                    {totalMonthly.toFixed(2).replace(".", ",")} €<span className="text-sm font-normal text-gray-500">/Monat</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Trust signals */}
            <div className="grid grid-cols-3 gap-3 text-xs text-center text-gray-500">
              {[
                { icon: <Shield className="w-4 h-4 text-green-500 mx-auto mb-1" />, label: "SSL-verschlüsselt" },
                { icon: <Check className="w-4 h-4 text-green-500 mx-auto mb-1" />, label: "Jederzeit kündbar" },
                { icon: <Zap className="w-4 h-4 text-blue-500 mx-auto mb-1" />, label: "Sofort live" },
              ].map((item) => (
                <div key={item.label} className="bg-white rounded-xl border border-gray-200 p-3">
                  {item.icon}
                  {item.label}
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 text-center">
              Sichere Zahlung über Stripe. Keine versteckten Kosten. Monatlich kündbar.
            </p>
          </div>
        )}

        {/* ── Navigation ──────────────────────────────────────────────────── */}
        <div className="flex gap-3 mt-8">
          {currentStep > 0 && (
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Zurück
            </Button>
          )}

          <Button
            onClick={handleNext}
            disabled={isSubmitting || checkoutMutation.isPending}
            className={`flex items-center gap-2 ${currentStep === 0 ? "w-full" : "ml-auto"}`}
            style={currentStep === STEPS.length - 1 ? { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)" } : undefined}
          >
            {(isSubmitting || checkoutMutation.isPending) ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : currentStep === STEPS.length - 1 ? (
              <>
                <Zap className="w-4 h-4" />
                Jetzt für {totalMonthly.toFixed(2).replace(".", ",")} €/Mo freischalten
              </>
            ) : (
              <>
                {currentStep === 0 ? "Los geht's!" : "Weiter"}
                <ChevronRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

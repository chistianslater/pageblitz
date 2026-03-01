import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { Loader2, Sparkles, Plus, Trash2, Send, ChevronRight, ChevronLeft, Clock, Zap, Check, Monitor, X, Pencil, Upload, ImageIcon, Save, Edit2 } from "lucide-react";
import { toast } from "sonner";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import MacbookMockup from "@/components/MacbookMockup";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { convertOpeningHoursToGerman } from "@shared/hours";
import { translateGmbCategory } from "@shared/gmbCategories";

// ── Types ────────────────────────────────────────────────────────────────────

interface SubPage {
  id: string;
  name: string;
  description: string;
}

interface OnboardingData {
  businessCategory: string;
  businessName: string;
  tagline: string;
  description: string;
  usp: string;
  topServices: { title: string; description: string }[];
  targetAudience: string;
  legalOwner: string;
  legalStreet: string;
  legalZip: string;
  legalCity: string;
  legalEmail: string;
  legalPhone: string;
  legalVatId: string;
  brandColor: string;
  brandSecondaryColor: string;
  heroPhotoUrl: string; // selected or uploaded hero photo URL
  aboutPhotoUrl: string; // selected or uploaded about/second photo URL
  brandLogo: string; // base64 or "font:<fontName>"
  headlineFont: string; // Serif or Sans-serif font name
  addOnContactForm: boolean;
  addOnGallery: boolean;
  addOnMenu: boolean;       // Speisekarte (Restaurant, Café, Bäckerei)
  addOnPricelist: boolean;  // Preisliste (Friseur, Beauty, Fitness)
  subPages: SubPage[];
  email: string; // for FOMO reminder
  topServicesSkipped?: boolean;
}

type ChatStep =
  | "welcome"
  | "businessCategory"
  | "businessName"
  | "tagline"
  | "description"
  | "usp"
  | "services"
  | "targetAudience"
  | "legalOwner"
  | "legalStreet"
  | "legalZipCity"
  | "legalEmail"
  | "legalPhone"
  | "legalVat"
  | "brandColor"
  | "brandSecondaryColor"
  | "heroPhoto"
  | "aboutPhoto"
  | "brandLogo"
  | "headlineFont"
  | "addons"
  | "subpages"
  | "email"
  | "hideSections"
  | "preview"
  | "checkout";

interface ChatMessage {
  id: string;
  role: "bot" | "user";
  content: string;
  timestamp: number;
  step?: ChatStep; // which step this user message answered
}

// ── Constants ────────────────────────────────────────────────────────────────

const FOMO_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

const STEP_ORDER: ChatStep[] = [
  "businessCategory",
  "brandColor",
  "brandSecondaryColor",
  "heroPhoto",
  "aboutPhoto",
  "brandLogo",
  "headlineFont",
  "businessName",
  "tagline",
  "description",
  "usp",
  "services",
  "targetAudience",
  "legalOwner",
  "legalStreet",
  "legalZipCity",
  "legalEmail",
  "legalPhone",
  "legalVat",
  "addons",
  "subpages",
  "email",
  "hideSections",
  "preview",
  "checkout",
];

const STEP_TO_SECTION_ID: Record<ChatStep, string | null> = {
  welcome: null,
  businessCategory: "hero",
  brandColor: "hero",
  brandSecondaryColor: "hero",
  heroPhoto: "hero",
  aboutPhoto: "about",
  brandLogo: "header",
  headlineFont: "hero",
  businessName: "header",
  tagline: "hero",
  description: "hero",
  usp: "features",
  services: "services",
  targetAudience: "cta",
  legalOwner: "footer",
  legalStreet: "footer",
  legalZipCity: "footer",
  legalEmail: "footer",
  legalPhone: "footer",
  legalVat: "footer",
  addons: null,
  subpages: null,
  email: null,
  hideSections: null,
  preview: null,
  checkout: null,
};

// ── Helper ───────────────────────────────────────────────────────────────────

function genId() {
  return Math.random().toString(36).slice(2);
}

function useCountdown(expiresAt: number | null) {
  const [remaining, setRemaining] = useState<number>(0);
  useEffect(() => {
    if (!expiresAt) return;
    const tick = () => setRemaining(Math.max(0, expiresAt - Date.now()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

// ── Main Component ────────────────────────────────────────────────────────────

interface Props {
  previewToken?: string;
  websiteId?: number;
}

export default function OnboardingChat({ previewToken, websiteId: websiteIdProp }: Props) {
  const [, navigate] = useLocation();

  // ── Website data ────────────────────────────────────────────────────────
  const { data: siteData, isLoading: siteLoading } = trpc.website.get.useQuery(
    { token: previewToken, id: websiteIdProp },
    { enabled: !!(previewToken || websiteIdProp) }
  );

  const websiteId = siteData?.website?.id ? Number(siteData.website.id) : undefined;
  const business = siteData?.business;

  // ── Chat state ──────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentStep, setCurrentStep] = useState<ChatStep>("welcome");
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHidden, setChatHidden] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingServices, setIsGeneratingServices] = useState(false);
  const [showSkipServicesWarning, setShowSkipServicesWarning] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [legalConsent, setLegalConsent] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set<string>());
  const [gmbÜbernommenEditMode, setGmbÜbernommenEditMode] = useState(false);
  const [quickReplySelected, setQuickReplySelected] = useState(false);
  const [inPlaceEditId, setInPlaceEditId] = useState<string | null>(null);
  const [inPlaceEditValue, setInPlaceEditValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const previewInnerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll preview to current section
  useEffect(() => {
    const sectionId = STEP_TO_SECTION_ID[currentStep];
    if (!sectionId || !previewInnerRef.current) return;

    const element = previewInnerRef.current.querySelector(`[data-section="${sectionId}"]`);
    if (!element) return;

    const elementTop = (element as HTMLElement).offsetTop;
    const viewportHeight = 1280 * 0.62;
    const targetScroll = Math.max(0, elementTop - viewportHeight / 3);

    const computedStyle = previewInnerRef.current.style.transform;
    const scaleMatch = computedStyle.match(/scale\(([^)]+)\)/);
    const scale = scaleMatch ? parseFloat(scaleMatch[1]) : 1;

    const el = previewInnerRef.current;
    el.style.transition = "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
    el.style.transform = `scale(${scale}) translateY(-${targetScroll}px)`;

    const timer = setTimeout(() => {
      el.style.transition = "";
    }, 600);

    return () => clearTimeout(timer);
  }, [currentStep]);

  // ── Onboarding data ─────────────────────────────────────────────────────
  const [data, setData] = useState<OnboardingData>({
    businessCategory: "",
    businessName: "",
    tagline: "",
    description: "",
    usp: "",
    topServices: [],
    targetAudience: "",
    legalOwner: "",
    legalStreet: "",
    legalZip: "",
    legalCity: "",
    legalEmail: "",
    legalPhone: "",
    legalVatId: "",
    brandColor: "#3B82F6",
    brandSecondaryColor: "#F1F5F9",
    heroPhotoUrl: "",
    aboutPhotoUrl: "",
    brandLogo: "font:Inter",
    headlineFont: "Georgia",
    addOnContactForm: true,
    addOnGallery: false,
    addOnMenu: false,
    addOnPricelist: false,
    subPages: [],
    email: "",
  });

  // ── FOMO timer ──────────────────────────────────────────────────────────
  const [fomoExpiresAt, setFomoExpiresAt] = useState<number | null>(null);
  const countdown = useCountdown(fomoExpiresAt);

  useEffect(() => {
    const key = `pageblitz_fomo_${previewToken || websiteIdProp}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      setFomoExpiresAt(parseInt(stored));
    } else {
      const exp = Date.now() + FOMO_DURATION_MS;
      localStorage.setItem(key, String(exp));
      setFomoExpiresAt(exp);
    }
  }, [previewToken, websiteIdProp]);

  // ── tRPC mutations ──────────────────────────────────────────────────────
  const saveStepMutation = trpc.onboarding.saveStep.useMutation();
  const completeMutation = trpc.onboarding.complete.useMutation();
  const checkoutMutation = trpc.checkout.createSession.useMutation();
  const generateTextMutation = trpc.onboarding.generateText.useMutation();
  const suggestServicesMutation = trpc.onboarding.suggestServices.useMutation();
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();
  const generateWebsiteMutation = trpc.selfService.generateWebsite.useMutation();
  const [isGeneratingInitialWebsite, setIsGeneratingInitialWebsite] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationPhase, setGenerationPhase] = useState("");


  // ── Pre-fill colors from existing colorScheme ───────────────────────────
  useEffect(() => {
    if (siteData?.website?.colorScheme && !initialized) {
      const cs = siteData.website.colorScheme as any;
      setData((prev) => ({
        ...prev,
        ...(cs.primary && /^#[0-9A-Fa-f]{6}$/.test(cs.primary) ? { brandColor: cs.primary } : {}),
        ...(cs.secondary && /^#[0-9A-Fa-f]{6}$/.test(cs.secondary) ? { brandSecondaryColor: cs.secondary } : {}),
      }));
    }
  }, [siteData?.website?.colorScheme, initialized]);

  // ── Pre-fill from GMB data ──────────────────────────────────────────────
  useEffect(() => {
    if (business && !initialized) {
      setData((prev) => ({
        ...prev,
        businessName: business.name || prev.businessName,
        businessCategory: translateGmbCategory((business as any).category || "") || prev.businessCategory,
        legalEmail: business.email || prev.legalEmail,
        legalPhone: business.phone || prev.legalPhone,
        email: business.email || prev.email,
      }));
    }
  }, [business, initialized]);

  // ── Scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Bot message helper (word-by-word typing animation) ─────────────────
  const addBotMessage = useCallback((content: string, delay = 600) => {
    return new Promise<void>((resolve) => {
      setIsTyping(true);
      // Show 3-dot indicator for `delay` ms, then start word-by-word typing
      setTimeout(() => {
        const msgId = genId();
        const words = content.split(" ");
        // Insert empty message first
        setMessages((prev) => [
          ...prev,
          { id: msgId, role: "bot", content: "", timestamp: Date.now() },
        ]);
        // Type word by word
        const WPM = 280; // words per minute
        const msPerWord = Math.max(20, Math.min(60000 / WPM, 80));
        let wordIdx = 0;
        const interval = setInterval(() => {
          wordIdx++;
          const partial = words.slice(0, wordIdx).join(" ");
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, content: partial } : m))
          );
          if (wordIdx >= words.length) {
            clearInterval(interval);
            setIsTyping(false);
            resolve();
          }
        }, msPerWord);
      }, delay);
    });
  }, []);

  const addUserMessage = useCallback((content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: genId(), role: "user", content, timestamp: Date.now(), step: currentStep },
    ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);

  // ── Quick-reply suggestions per step ──────────────────────────────────
  const getQuickReplies = useCallback(
    (step: ChatStep): string[] => {
      const name = data.businessName || business?.name || "";
      switch (step) {
        case "businessCategory":
          return [
            "Restaurant",
            "Friseur",
            "Bauunternehmen",
            "Fitness-Studio",
            "Anwaltskanzlei",
            "Zahnarzt",
            "Handwerk",
            "Bar/Tapas",
          ];
        case "businessName":
          return name ? ["Ja, stimmt!"] : [];
        case "tagline":
          return [
            `Qualität, die bleibt – seit ${new Date().getFullYear() - 10}`,
            "Ihr Partner für perfekte Ergebnisse",
            "Schnell. Zuverlässig. Fair.",
          ];
        case "usp":
          return [
            "Kostenloser Vor-Ort-Termin innerhalb 24h",
            "Über 15 Jahre Erfahrung in der Region",
            "Festpreisgarantie – keine versteckten Kosten",
          ];
        case "targetAudience":
          return [
            "Privathaushalte in der Region",
            "Gewerbliche Kunden & Unternehmen",
            "Privat- und Gewerbekunden",
          ];
        case "legalOwner": {
          // Suggest owner name from GMB if available (business name as fallback hint)
          const suggestions: string[] = [];
          if (business?.name) suggestions.push(business.name);
          return suggestions;
        }
        case "legalStreet": {
          // Extract street from GMB address (format: "Straße 12, PLZ Stadt, Land")
          const suggestions: string[] = [];
          if (business?.address) {
            const parts = business.address.split(",");
            if (parts.length >= 1) {
              const street = parts[0].trim();
              if (street && /\d/.test(street)) suggestions.push(street);
            }
          }
          return suggestions;
        }
        case "legalZipCity": {
          // Extract zip+city from GMB address
          const suggestions: string[] = [];
          if (business?.address) {
            const parts = business.address.split(",");
            if (parts.length >= 2) {
              // Try second part which often is "PLZ Stadt"
              const zipCity = parts[1].trim();
              if (/^\d{5}\s+.+/.test(zipCity)) suggestions.push(zipCity);
              else if (parts.length >= 3) {
                const alt = parts[2].trim();
                if (/^\d{5}\s+.+/.test(alt)) suggestions.push(alt);
              }
            }
          }
          return suggestions;
        }
        case "legalEmail":
          return data.legalEmail ? [data.legalEmail] : (business?.email ? [business.email] : []);
        case "legalPhone":
          return data.legalPhone ? [data.legalPhone] : (business?.phone ? [business.phone] : []);
        case "email":
          return data.legalEmail ? [data.legalEmail] : (business?.email ? [business.email] : []);
        default:
          return [];
      }
    },
    [data.businessName, data.businessCategory, data.legalEmail, business?.name, business?.address, business?.email]
  );
  // ── Step promptss ────────────────────────────────────────────────────────
  const getStepPrompt = useCallback(
    (step: ChatStep): string => {
      const name = data.businessName || business?.name || "dein Unternehmen";
      switch (step) {
        case "businessCategory":
          return `Hallo! Bevor wir starten – welche **Branche** ist dein Unternehmen?\n\nBeispiel: Restaurant, Friseur, Bauunternehmen, Fitness-Studio, Anwaltskanzlei, etc.\n\nDas hilft mir, deine Website perfekt auf deine Branche abzustimmen!`;
        case "welcome":
          return `Hey! 👋 Ich bin dein persönlicher Website-Assistent. Ich helfe dir in wenigen Minuten, deine Website mit echten Infos zu befüllen – damit sie nicht mehr generisch klingt, sondern wirklich nach **${name}** aussieht.\n\nKlingt gut? Dann lass uns starten! 🚀`;
        case "businessName":
          return `Wie lautet der offizielle Name deines Unternehmens? Ich habe **${data.businessName || "noch keinen Namen"}** vorausgefüllt – stimmt das so?`;
        case "tagline":
          return `Super! Jetzt brauchen wir einen knackigen Slogan für **${data.businessName}** – einen Satz, der sofort klar macht, was ihr macht und warum ihr besonders seid.\n\nBeispiel: *"Qualität, die bleibt – seit 1998"* oder *"Ihr Dach in besten Händen"*\n\nOder soll ich dir einen Vorschlag machen? 💡\n\n*💡 Keine Sorge: Du kannst alle Texte später jederzeit ändern.*`;
        case "description":
          return `Perfekt! Jetzt eine kurze Beschreibung deines Unternehmens – 2-3 Sätze, die erklären, was ihr macht, für wen und was euch auszeichnet.\n\nKein Stress, ich kann dir auch einen Entwurf generieren! ✨\n\n*📸 Fotos, Texte und Farben kannst du übrigens später jederzeit austauschen.*`;
        case "usp":
          return `Was macht **${data.businessName}** einzigartig? Was können Kunden bei euch bekommen, was sie woanders nicht finden?\n\nDein Alleinstellungsmerkmal (USP) – in einem Satz. Ich helfe dir gerne dabei! 🎯`;
        case "services":
          return `Welche sind eure Top-Leistungen? Nenn mir 2-4 Dinge, die ihr am häufigsten anbietet.\n\nIch habe unten Felder vorbereitet – füll sie aus oder lass mich Vorschläge machen! 🔧\n\n*✅ Du kannst Leistungen später jederzeit ergänzen oder ändern.*`;
        case "targetAudience":
          return `Für wen macht ihr das alles? Beschreib kurz eure idealen Kunden – wer ruft euch an, wer schreibt euch?\n\nBeispiel: *"Privathaushalte in Bocholt, die ein neues Dach brauchen"*`;
        case "legalOwner":
          return `📋 **Abschnitt 2: Rechtliche Pflichtangaben**\n\nFür ein vollständiges Impressum und eine korrekte Datenschutzerklärung brauche ich noch ein paar Angaben. Das dauert nur 2 Minuten!\n\nWer ist der **Inhaber oder Geschäftsführer**? (Vollständiger Name, z.B. „Max Mustermann")\n\n*🔒 Diese Angaben sind gesetzlich vorgeschrieben und werden nur im Impressum angezeigt.*`;
        case "legalStreet":
          return `Wie lautet die **Straße und Hausnummer** der Geschäftsadresse?\n\nBeispiel: *Musterstraße 12*`;
        case "legalZipCity":
          return `Und die **Postleitzahl und Stadt**?\n\nBeispiel: *46395 Bocholt*`;
        case "legalEmail":
          return `Welche **E-Mail-Adresse** soll im Impressum stehen? (Pflichtangabe – muss erreichbar sein)\n\nBeispiel: *info@musterfirma.de*`;
        case "legalPhone":
          return `Welche **Telefonnummer** soll im Impressum und auf der Website stehen?\n\nBeispiel: *+49 2871 123456*`;
        case "legalVat":
          return `Hast du eine **Umsatzsteuer-ID**? (z.B. DE123456789)\n\nFalls nicht vorhanden oder du Kleinunternehmer bist, schreib einfach "Nein" oder lass das Feld leer.`;
        case "hideSections":
          return `Wir sind fast fertig! 🎉 Gibt es Bereiche, die du zum Start ausblenden möchtest? Klick einfach drauf – keine Sorge, du kannst sie jederzeit wieder einblenden.`;
        case "brandColor":
          return `🎨 **Super! Jetzt gestalten wir den Look deiner Website.**\n\nWähle deine **Hauptfarbe** – du siehst sofort rechts, wie deine Website damit aussieht!`;
        case "brandSecondaryColor":
          return `Perfekt! Jetzt wähle noch deine **Sekundärfarbe** – sie wird für Hintergründe, Abschnitte und Akzente genutzt und gibt deiner Website mehr Tiefe.`;
        case "heroPhoto":
          return `Schön! Jetzt wählen wir ein **Hauptbild** für deine Website. Du kannst ein eigenes Foto hochladen oder aus unseren Vorschlägen wählen – passend zu deiner Branche.`;
        case "aboutPhoto":
          return `Super! Jetzt wählen wir noch ein **zweites Bild** für den "\u00dcber uns"-Bereich deiner Website. Dieses Bild erscheint im Abschnitt, der dein Unternehmen vorstellt.`;
        case "brandLogo":
          return `Hast du ein **Logo**? Du kannst es hier hochladen.\n\nFalls nicht – kein Problem! Ich zeige dir drei verschiedene Schriftarten, mit denen wir deinen Firmennamen als Logo darstellen können. Wähle einfach deinen Favoriten.`;
        case "headlineFont":
          return `Perfekt! Jetzt wählen wir noch die **Schriftart für deine Überschriften**. Das gibt deiner Website einen ganz eigenen Charakter!\n\nMöchtest du eine **elegante Serifenschrift** (klassisch, zeitlos) oder eine **moderne Serifenlose** (clean, aktuell)?`;
        case "addons":
          return `⚡ **Abschnitt 3: Extras & Fertigstellung**\n\nFast geschafft! Möchtest du deine Website noch um optionale Features erweitern? Du kannst diese später jederzeit dazu buchen oder wieder entfernen.`;
        case "subpages":
          return `Brauchst du zusätzliche Unterseiten? Zum Beispiel "Über uns", "Projekte", "Referenzen" oder "Team".\n\nJede Unterseite kostet +9,90 €/Monat. Du kannst sie unten hinzufügen oder überspringen.`;
        case "email":
          return `Fast fertig! 🎊 An welche E-Mail-Adresse sollen wir deine Website-Infos und die Freischalt-Bestätigung schicken?`;
        case "preview":
          return `🎉 **Deine Website ist fertig personalisiert!**\n\nSchau dir unten die Vorschau an – das ist deine echte Website mit deinen echten Daten. Wenn alles passt, kannst du sie freischalten!\n\n*💡 Keine Sorge: Fotos, Texte, Farben – alles kann nach der Freischaltung jederzeit geändert werden. Du bist nicht festgelegt!*`;
        case "checkout":
          return `Bereit zum Freischalten? 🚀 Wähle dein Paket und starte durch!`;
        default:
          return "Nächster Schritt...";
      }
    },
    [data.businessName, business?.name, data.headlineFont]
  );

  // ── Initialize chat ─────────────────────────────────────────────────────
  // ── Auto-generate website if websiteData is missing ────────────────────
  useEffect(() => {
    if (siteLoading || !websiteId || isGeneratingInitialWebsite) return;
    const hasWebsiteData = !!(siteData?.website?.websiteData);
    if (!hasWebsiteData) {
      setIsGeneratingInitialWebsite(true);
      const phases = [
        "Analysiere dein Unternehmen...",
        "Erstelle Texte...",
        "Generiere Design...",
        "Finalisiere deine Website...",
      ];
      let phaseIdx = 0;
      setGenerationPhase(phases[0]);
      setGenerationProgress(10);
      const phaseInterval = setInterval(() => {
        phaseIdx = Math.min(phaseIdx + 1, phases.length - 1);
        setGenerationPhase(phases[phaseIdx]);
        setGenerationProgress(Math.min(10 + phaseIdx * 22, 88));
      }, 8000);
      generateWebsiteMutation.mutateAsync({ websiteId }).then(() => {
        clearInterval(phaseInterval);
        setGenerationProgress(100);
        setGenerationPhase("Website bereit!");
        setTimeout(() => {
          setIsGeneratingInitialWebsite(false);
        }, 800);
        // Refetch site data
        window.location.reload();
      }).catch(() => {
        clearInterval(phaseInterval);
        setIsGeneratingInitialWebsite(false);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteLoading, websiteId, siteData?.website?.websiteData]);

  useEffect(() => {
    if (!siteLoading && !initialized && !isGeneratingInitialWebsite) {
      setInitialized(true);
      const initChat = async () => {
        setCurrentStep("businessCategory");
        await addBotMessage(getStepPrompt("businessCategory"), 800);
      };
      initChat();
    }
  }, [siteLoading, initialized, isGeneratingInitialWebsite, addBotMessage, getStepPrompt]);

  // ── AI text generation ──────────────────────────────────────────────────
  const generateWithAI = async (field: keyof OnboardingData) => {
    if (!websiteId) return;
    const validFields = ["tagline", "description", "usp", "targetAudience"] as const;
    type ValidField = typeof validFields[number];
    if (!validFields.includes(field as ValidField)) return;
    setIsGenerating(true);
    try {
      const context = `Unternehmensname: ${data.businessName || business?.name || ""}, Branche: ${business?.category || "Handwerk"}, Adresse: ${business?.address || ""}, Beschreibung: ${data.description || ""}`;
      const result = await generateTextMutation.mutateAsync({
        websiteId,
        field: field as ValidField,
        context,
      });
      if (result.text) {
        setInputValue(result.text);
        toast.success("Text generiert! Du kannst ihn noch anpassen.");
      }
    } catch {
      toast.error("KI-Generierung fehlgeschlagen");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateServicesWithAI = async () => {
    if (!websiteId || isGeneratingServices) return;
    setIsGeneratingServices(true);
    try {
      const context = `Unternehmensname: ${data.businessName || business?.name || ""}, Branche: ${business?.category || "Handwerk"}, Adresse: ${business?.address || ""}`;
      const result = await suggestServicesMutation.mutateAsync({ websiteId, context });
      if (result.services && result.services.length > 0) {
        setData((p) => ({ ...p, topServices: result.services.map((s: { title: string; description: string }) => ({ title: s.title, description: s.description })) }));
        toast.success(`${result.services.length} Leistungen vorgeschlagen! Du kannst sie noch anpassen.`);
      }
    } catch {
      toast.error("KI-Vorschläge konnten nicht geladen werden");
    } finally {
      setIsGeneratingServices(false);
    }
  };

  // ── Step advancement ────────────────────────────────────────────────────
  // Steps that get a visual section divider in the chat (instead of a chat bubble)
  const SECTION_DIVIDERS: Partial<Record<ChatStep, { icon: string; title: string; subtitle: string }>> = {
    legalOwner: { icon: "\uD83D\uDCCB", title: "Abschnitt 2: Rechtliche Angaben", subtitle: "Impressum & Datenschutz \u2013 dauert nur 2 Minuten" },
    addons: { icon: "\u26A1", title: "Abschnitt 3: Extras & Fertigstellung", subtitle: "Optionale Features und letzter Schliff" },
  };

  const advanceToStep = useCallback(
    async (nextStep: ChatStep) => {
      setCurrentStep(nextStep);

      // If this step has a section divider, inject it as a special message type
      const divider = SECTION_DIVIDERS[nextStep];
      if (divider) {
        setMessages((prev) => [
          ...prev,
          { id: genId(), role: "divider" as any, content: JSON.stringify(divider), timestamp: Date.now() },
        ]);
        await new Promise((r) => setTimeout(r, 400));
      }

      // Show step prompt
      await addBotMessage(getStepPrompt(nextStep), divider ? 200 : 800);
      setTimeout(() => {
        if (["tagline", "description", "usp", "targetAudience"].includes(nextStep)) {
          textareaRef.current?.focus();
        } else {
          inputRef.current?.focus();
        }
      }, 900);
    },
    [addBotMessage, getStepPrompt, SECTION_DIVIDERS]
  );

  // Helper to save step data without blocking chat advancement
  const trySaveStep = async (stepIdx: number, stepData: Record<string, unknown>) => {
    if (!websiteId) return;
    try {
      await saveStepMutation.mutateAsync({ websiteId, step: stepIdx, data: stepData });
    } catch (e) {
      console.warn("[Onboarding] saveStep failed (non-blocking):", e);
    }
  };

  const handleSubmit = async (value?: string) => {
    // value=undefined means use inputValue; value="" means explicit empty (e.g. businessName confirm)
    const val = value !== undefined ? value.trim() : inputValue.trim();
    const isExplicitEmpty = value === "";
    if (!val && !isExplicitEmpty && !["addons", "subpages", "preview", "checkout"].includes(currentStep)) return;

    setInputValue("");

    const stepIdx = STEP_ORDER.indexOf(currentStep);
    const nextStep = STEP_ORDER[stepIdx + 1] as ChatStep;

    try {
      switch (currentStep) {
        case "businessName": {
          const confirmationPattern = /^(ja|j|yes|y|yep|yup|stimmt|ok|okay|klar)$/i;
          if (val && confirmationPattern.test(val.trim())) {
            addUserMessage(`Ja, "${data.businessName}" stimmt! ✓`);
          } else if (val) {
            addUserMessage(val);
            setData((p) => ({ ...p, businessName: val }));
            await trySaveStep(stepIdx, { businessName: val });
          } else {
            addUserMessage(`Ja, "${data.businessName}" stimmt! ✓`);
          }
          break;
        }
        case "tagline":
        case "description":
        case "usp":
        case "targetAudience": {
          // AI intent detection: if user asks for a suggestion, trigger AI generation
          const aiIntentPattern = /vorschlag|generier|mach mir|erstell|schreib|idee|hilf|automatisch|ki|ai\b/i;
          if (aiIntentPattern.test(val)) {
            addUserMessage(val);
            addBotMessage("Klar, ich generiere dir einen Vorschlag! ✨", 200);
            await generateWithAI(currentStep as keyof OnboardingData);
            return; // Don't advance, let user review and submit
          }
          // Use submitted value or fallback to inputValue if empty
          const finalValue = val || inputValue;
          if (!finalValue) return; // Don't submit empty
          
          addUserMessage(finalValue);
          setData((p) => ({ ...p, [currentStep]: finalValue }));
          await trySaveStep(stepIdx, { [currentStep]: finalValue });
          break;
        }
        case "legalOwner": {
          if (val.trim().split(/\s+/).length < 2) {
            toast.error("Bitte gib deinen vollständigen Namen ein (Vor- und Nachname)");
            return;
          }
          addUserMessage(val);
          setData((p) => ({ ...p, legalOwner: val }));
          await trySaveStep(stepIdx, { legalOwner: val });
          break;
        }
        case "legalStreet": {
          if (!val.trim()) { toast.error("Bitte gib Straße und Hausnummer ein"); return; }
          if (!/\d/.test(val)) { toast.error("Bitte gib auch die Hausnummer an (z.B. Musterstraße 12)"); return; }
          addUserMessage(val);
          setData((p) => ({ ...p, legalStreet: val }));
          await trySaveStep(stepIdx, { legalStreet: val });
          break;
        }
        case "legalZipCity": {
          const zipCityMatch = val.trim().match(/^(\d{5})\s+(.+)$/);
          if (!zipCityMatch) { toast.error("Bitte im Format 'PLZ Stadt' eingeben, z.B. 46395 Bocholt"); return; }
          const zip = zipCityMatch[1];
          const city = zipCityMatch[2];
          addUserMessage(val);
          setData((p) => ({ ...p, legalZip: zip, legalCity: city }));
          await trySaveStep(stepIdx, { legalZip: zip, legalCity: city });
          break;
        }
        case "legalEmail": {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(val.trim())) { toast.error("Bitte gib eine gültige E-Mail-Adresse ein (z.B. info@firma.de)"); return; }
          addUserMessage(val);
          setData((p) => ({ ...p, legalEmail: val.trim() }));
          await trySaveStep(stepIdx, { legalEmail: val.trim() });
          break;
        }
        case "legalPhone": {
          const phoneVal = val.trim();
          if (!phoneVal) { toast.error("Bitte gib eine Telefonnummer ein"); return; }
          addUserMessage(phoneVal);
          setData((p) => ({ ...p, legalPhone: phoneVal }));
          await trySaveStep(stepIdx, { legalPhone: phoneVal });
          break;
        }
        case "legalVat": {
          // Empty input or explicit "no" = Kleinunternehmer (no VAT ID)
          const trimmed = val.trim();
          const skip = ["nein", "keine", "n/a", "-", ""].includes(trimmed.toLowerCase()) || trimmed === "";
          const vatRegex = /^DE\d{9}$/i;
          if (!skip && !vatRegex.test(trimmed)) { toast.error("USt-IdNr. muss das Format DE123456789 haben. Schreib 'Nein' oder lass das Feld leer, wenn du keine hast."); return; }
          const vatId = skip ? "" : trimmed.toUpperCase();
          addUserMessage(skip ? "Keine USt-IdNr. (Kleinunternehmer)" : vatId);
          setData((p) => ({ ...p, legalVatId: vatId }));
          await trySaveStep(stepIdx, { legalVatId: vatId });
          break;
        }
        case "email":
          addUserMessage(val);
          setData((p) => ({ ...p, email: val }));
          break;
        case "businessCategory":
          if (val) {
            addUserMessage(val);
            setData((p) => ({ ...p, businessCategory: val }));
            await trySaveStep(stepIdx, { businessCategory: val });
          }
          break;
        case "brandColor":
        case "brandSecondaryColor":
        case "brandLogo":
        case "services":
        case "addons":
        case "subpages":
          // These are handled by the interactive UI below
          break;
        case "hideSections":
          // handled by interactive UI
          break;
        case "preview":
          addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
          break;
        case "checkout":
          break;
      }
    } catch (e) {
      console.error("[Onboarding] handleSubmit error:", e);
    }

    // Always advance to next step, even if save failed
    if (nextStep) {
      await advanceToStep(nextStep);
    }
  };

  // ── Checkout ────────────────────────────────────────────────────────────
  const handleCheckout = async () => {
    if (!websiteId) return;
    try {
      // Complete onboarding first
      await completeMutation.mutateAsync({ websiteId });
      // Then create checkout session
      const session = await checkoutMutation.mutateAsync({
        websiteId,
        addOns: {
          subpages: data.subPages.filter((p) => p.name.trim()).length,
          gallery: data.addOnGallery,
          contactForm: data.addOnContactForm,
        },
      });
      window.open(session.url, "_blank");
      toast.success("Du wirst zu Stripe weitergeleitet...");
    } catch (e: any) {
      toast.error(e.message || "Fehler beim Checkout");
    }
  };

  // ── Live preview data: merge chat inputs into websiteData in real-time ──
  const liveWebsiteData = useMemo((): WebsiteData | undefined => {
    const base = siteData?.website?.websiteData as WebsiteData | undefined;
    if (!base) return undefined;

    // Deep-clone to avoid mutating the original
    const patched: WebsiteData = JSON.parse(JSON.stringify(base));

    // Patch top-level fields
    if (data.businessName) patched.businessName = data.businessName;
    if (data.tagline) patched.tagline = data.tagline;
    if (data.description) patched.description = data.description;

    // Filter hidden sections
    if (hiddenSections.size > 0) {
      patched.sections = patched.sections.filter((s) => !hiddenSections.has(s.type));
    }

    // Patch sections
    patched.sections = patched.sections.map((section) => {
      if (section.type === "hero") {
        return {
          ...section,
          headline: data.tagline || section.headline,
          subheadline: data.description || section.subheadline,
        };
      }
      if (section.type === "about") {
        return {
          ...section,
          content: data.description || section.content,
          headline: data.businessName ? `Über ${data.businessName}` : section.headline,
        };
      }
      if (section.type === "services") {
        // If user explicitly skipped services (topServices is empty array after skip), remove section
        if (data.topServicesSkipped) return null;
        const filledServices = data.topServices.filter((s) => s.title.trim());
        if (filledServices.length > 0) {
          return {
            ...section,
            items: filledServices.map((s) => ({ title: s.title, description: s.description })),
          };
        }
      }
      return section;
    }).filter(Boolean) as typeof patched.sections;

    // Patch brandColor into colorScheme override (stored in patched.colorScheme if present)
    if (data.brandColor && data.brandColor.match(/^#[0-9A-Fa-f]{6}$/)) {
      (patched as any)._brandColorOverride = data.brandColor;
    }

    // Patch brandLogo font or URL
    if (data.brandLogo && data.brandLogo.startsWith("font:")) {
      (patched as any)._brandLogoFont = data.brandLogo.replace("font:", "");
      delete (patched as any)._brandLogoUrl;
    } else if (data.brandLogo && data.brandLogo.startsWith("url:")) {
      (patched as any)._brandLogoUrl = data.brandLogo.replace("url:", "");
      delete (patched as any)._brandLogoFont;
    }

    return patched;
  }, [
    siteData?.website?.websiteData,
    data.businessName,
    data.tagline,
    data.description,
    data.topServices,
    data.topServicesSkipped,
    data.brandColor,
    data.brandSecondaryColor,
    data.brandLogo,
    hiddenSections,
  ]);

  // ── Price calculation ───────────────────────────────────────────────────
  const BASE_PRICE_INTRO = 39;  // First month intro offer
  const BASE_PRICE_REGULAR = 79; // Regular monthly price
  
  const totalPrice = (isFirstMonth = false) => {
    let price = isFirstMonth ? BASE_PRICE_INTRO : BASE_PRICE_REGULAR;
    if (data.addOnContactForm) price += 4.9;
    if (data.addOnGallery) price += 4.9;
    if (data.addOnMenu) price += 4.9;
    if (data.addOnPricelist) price += 4.9;
    price += data.subPages.length * 9.9;
    return price.toFixed(2);
  };

  // ── Render ──────────────────────────────────────────────────────────────

  if (siteLoading || isGeneratingInitialWebsite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center text-white max-w-sm mx-auto px-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
          <h2 className="text-xl font-bold mb-2">Deine Website wird erstellt</h2>
          <p className="text-slate-400 text-sm mb-6">{generationPhase || "Bitte warte einen Moment..."}</p>
          <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-violet-500 transition-all duration-1000"
              style={{ width: `${generationProgress}%` }}
            />
          </div>
          <p className="text-slate-500 text-xs mt-3">{Math.round(generationProgress)}% abgeschlossen</p>
        </div>
      </div>
    );
  }

  const websiteData = siteData?.website?.websiteData as WebsiteData | undefined;
  const colorScheme = siteData?.website?.colorScheme as ColorScheme | undefined;
  const heroImageUrl = (siteData?.website as any)?.heroImageUrl as string | undefined;
  const aboutImageUrl = (siteData?.website as any)?.aboutImageUrl as string | undefined;
  const layoutStyle = (siteData?.website as any)?.layoutStyle as string | undefined;
  const slug = siteData?.website?.slug;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* FOMO Header */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-center py-2 px-4 text-sm font-medium flex items-center justify-center gap-2">
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span>
          ⚡ Diese Website ist noch{" "}
          <strong className="font-bold tabular-nums">{countdown}</strong> für dich reserviert
        </span>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex flex-col lg:flex-row w-full overflow-hidden">
        {/* Chat panel – smooth slide */}
        <div
          className="flex w-full lg:w-[360px] flex-col border-r border-slate-700/50 flex-shrink-0 items-center overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            maxWidth: chatHidden ? 0 : 360,
            minWidth: chatHidden ? 0 : undefined,
            opacity: chatHidden ? 0 : 1,
            pointerEvents: chatHidden ? "none" : undefined,
          }}
        >
          {/* Header */}
          <div className="px-4 py-4 border-b border-slate-700/50 flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <Zap className="w-4.5 h-4.5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm">Pageblitz Assistent</h1>
              <p className="text-slate-400 text-xs">Personalisiert deine Website in Minuten</p>
            </div>
            {/* Price badge */}
            <div className="flex-shrink-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg px-2.5 py-1.5 text-center">
              <p className="text-amber-300 text-xs font-bold leading-tight">Ab 39 €</p>
              <p className="text-amber-400/70 text-[10px] leading-tight">/Monat</p>
            </div>

          </div>

          {/* Messages + Input: flex column, messages scroll, input sticky */}
          <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {messages.map((msg) => {
              // Section divider rendering
              if ((msg.role as string) === "divider") {
                let divInfo: { icon: string; title: string; subtitle: string } | null = null;
                try { divInfo = JSON.parse(msg.content); } catch {}
                if (!divInfo) return null;
                return (
                  <div key={msg.id} className="flex items-center gap-3 my-2 px-1">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                    <div className="flex items-center gap-2 bg-slate-700/80 border border-slate-600/60 rounded-xl px-4 py-2 flex-shrink-0 shadow-sm">
                      <span className="text-base">{divInfo.icon}</span>
                      <div>
                        <p className="text-white text-xs font-bold leading-tight">{divInfo.title}</p>
                        <p className="text-slate-400 text-xs leading-tight">{divInfo.subtitle}</p>
                      </div>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-600 to-transparent" />
                  </div>
                );
              }

              return (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "bot" && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0 mt-0.5">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  {/* In-place edit mode */}
                  {msg.role === "user" && inPlaceEditId === msg.id ? (
                    <div className="flex flex-col gap-2 max-w-[85%]">
                      {/* Color picker for color steps */}
                      {(msg.step === "brandColor" || msg.step === "brandSecondaryColor") ? (
                        <div className="flex flex-col gap-3 bg-slate-700/80 rounded-xl p-3 border border-blue-500">
                          <p className="text-slate-300 text-xs">
                            {msg.step === "brandColor" ? "Hauptfarbe wählen:" : "Sekundärfarbe wählen:"}
                          </p>
                          <div className="flex items-center gap-3">
                            <input
                              type="color"
                              value={inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/) ? inPlaceEditValue : "#3b82f6"}
                              onChange={(e) => setInPlaceEditValue(e.target.value)}
                              className="w-12 h-12 rounded-lg cursor-pointer border-2 border-slate-500 bg-transparent"
                              style={{ padding: "2px" }}
                            />
                            <div className="flex-1">
                              <div
                                className="w-full h-10 rounded-lg border border-slate-500"
                                style={{ backgroundColor: inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/) ? inPlaceEditValue : "#3b82f6" }}
                              />
                              <p className="text-slate-400 text-xs mt-1 font-mono">{inPlaceEditValue}</p>
                            </div>
                          </div>
                          {/* Quick presets */}
                          <div className="flex flex-wrap gap-1.5">
                            {["#2563eb","#16a34a","#dc2626","#d97706","#7c3aed","#0891b2","#db2777","#1a1a1a","#f5f5f5","#b8860b"].map((c) => (
                              <button
                                key={c}
                                onClick={() => setInPlaceEditValue(c)}
                                className="w-6 h-6 rounded-full border-2 transition-all"
                                style={{ backgroundColor: c, borderColor: inPlaceEditValue === c ? "white" : "transparent" }}
                                title={c}
                              />
                            ))}
                          </div>
                          <div className="flex gap-1 justify-end">
                            <button
                              onClick={() => setInPlaceEditId(null)}
                              className="px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                            >Abbrechen</button>
                            <button
                              onClick={() => {
                                const step = msg.step;
                                if (!step || !inPlaceEditValue.match(/^#[0-9A-Fa-f]{6}$/)) { setInPlaceEditId(null); return; }
                                const newVal = inPlaceEditValue;
                                setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                                setData((p) => ({ ...p, [step]: newVal }));
                                setInPlaceEditId(null);
                              }}
                              className="px-2 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                            >Übernehmen</button>
                          </div>
                        </div>
                      ) : (
                        <>
                        <textarea
                          className="bg-slate-700 text-white text-sm px-3 py-2 rounded-xl border border-blue-500 outline-none resize-none min-h-[60px] w-full"
                          value={inPlaceEditValue}
                          onChange={(e) => setInPlaceEditValue(e.target.value)}
                          autoFocus
                          rows={3}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              const step = msg.step;
                              if (!step || !inPlaceEditValue.trim()) { setInPlaceEditId(null); return; }
                              const newVal = inPlaceEditValue.trim();
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                              if (step === "legalZipCity") {
                                const m = newVal.match(/^(\d{5})\s+(.+)$/);
                                if (m) setData((p) => ({ ...p, legalZip: m[1], legalCity: m[2] }));
                              } else if (step in data) {
                                setData((p) => ({ ...p, [step]: newVal }));
                              }
                              setInPlaceEditId(null);
                            }
                            if (e.key === "Escape") setInPlaceEditId(null);
                          }}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            onClick={() => setInPlaceEditId(null)}
                            className="px-2 py-1 text-xs rounded-lg bg-slate-600 hover:bg-slate-500 text-slate-300"
                          >Abbrechen</button>
                          <button
                            onClick={() => {
                              const step = msg.step;
                              if (!step || !inPlaceEditValue.trim()) { setInPlaceEditId(null); return; }
                              const newVal = inPlaceEditValue.trim();
                              setMessages((prev) => prev.map((m) => m.id === msg.id ? { ...m, content: newVal } : m));
                              if (step === "legalZipCity") {
                                const m = newVal.match(/^(\d{5})\s+(.+)$/);
                                if (m) setData((p) => ({ ...p, legalZip: m[1], legalCity: m[2] }));
                              } else if (step in data) {
                                setData((p) => ({ ...p, [step]: newVal }));
                              }
                              setInPlaceEditId(null);
                            }}
                            className="px-2 py-1 text-xs rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                          >Speichern</button>
                        </div>
                        </>
                      )}
                    </div>
                  ) : (
                    <>
                      <div
                        className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                          msg.role === "bot"
                            ? "bg-slate-700/80 text-slate-100 rounded-tl-sm"
                            : "bg-blue-600 text-white rounded-tr-sm"
                        }`}
                        dangerouslySetInnerHTML={{
                          __html: msg.content
                            .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                            .replace(/\*(.+?)\*/g, "<em>$1</em>")
                            .replace(/\n/g, "<br/>"),
                        }}
                      />
                      {msg.role === "user" && msg.step && (
                        <button
                          onClick={() => {
                            setInPlaceEditId(msg.id);
                            setInPlaceEditValue(msg.content);
                          }}
                          className="w-6 h-6 rounded-md bg-slate-600/50 hover:bg-slate-500/50 flex items-center justify-center transition-colors flex-shrink-0"
                          title="Antwort bearbeiten"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-300 hover:text-white" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mr-2 flex-shrink-0">
                  <Zap className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="bg-slate-700/80 px-4 py-3 rounded-2xl rounded-tl-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Interactive step UI */}
            {!isTyping && currentStep === "services" && (
              <div className="ml-9 space-y-2">
                {/* KI-Vorschlag-Button */}
                <div className="flex items-center gap-2 mb-1">
                  <div className="relative group/svc-ai">
                    <button
                      onClick={generateServicesWithAI}
                      disabled={isGeneratingServices || !websiteId}
                      className="flex items-center gap-1.5 text-xs bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/60 text-violet-200 px-3 py-1.5 rounded-lg transition-all ai-glow-btn disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingServices ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                      {isGeneratingServices ? "Generiere..." : "✨ KI-Vorschläge generieren"}
                    </button>
                    <div className="absolute bottom-full left-0 mb-2 w-52 pointer-events-none opacity-0 group-hover/svc-ai:opacity-100 transition-opacity duration-200 z-20">
                      <div className="bg-violet-900/95 border border-violet-500/50 text-violet-100 text-xs px-3 py-2 rounded-lg shadow-lg leading-snug">
                        Ich schlage dir typische Leistungen für deine Branche vor – du kannst sie danach noch anpassen!
                        <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-violet-900/95" />
                      </div>
                    </div>
                  </div>
                </div>

                {data.topServices.map((svc, i) => (
                  <div key={i} className="bg-slate-700/60 rounded-xl p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        className="flex-1 bg-slate-600/50 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder={`Leistung ${i + 1} (z.B. Dachreparatur)`}
                        value={svc.title}
                        onChange={(e) => {
                          const updated = [...data.topServices];
                          updated[i] = { ...updated[i], title: e.target.value };
                          setData((p) => ({ ...p, topServices: updated }));
                        }}
                      />
                      {data.topServices.length > 1 && (
                        <button
                          onClick={() => {
                            const updated = data.topServices.filter((_, idx) => idx !== i);
                            setData((p) => ({ ...p, topServices: updated }));
                          }}
                          className="flex-shrink-0 text-slate-400 hover:text-red-400 transition-colors p-1 rounded"
                          title="Leistung entfernen"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <input
                      className="w-full bg-slate-600/50 text-white text-xs px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="Kurze Beschreibung (optional)"
                      value={svc.description}
                      onChange={(e) => {
                        const updated = [...data.topServices];
                        updated[i] = { ...updated[i], description: e.target.value };
                        setData((p) => ({ ...p, topServices: updated }));
                      }}
                    />
                  </div>
                ))}

                {/* Skip warning dialog */}
                {showSkipServicesWarning && (
                  <div className="bg-amber-900/40 border border-amber-500/50 rounded-xl p-3 space-y-2">
                    <p className="text-amber-200 text-xs font-semibold">⚠️ Wirklich ohne Leistungen fortfahren?</p>
                    <p className="text-amber-300/80 text-xs leading-relaxed">
                      Websites ohne Leistungsübersicht konvertieren deutlich schlechter. Kunden wollen auf einen Blick sehen, was du anbietest – das ist oft der wichtigste Faktor für eine Anfrage.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSkipServicesWarning(false)}
                        className="flex-1 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Doch eintragen
                      </button>
                      <button
                        onClick={async () => {
                          setShowSkipServicesWarning(false);
                          addUserMessage("Keine Leistungen anzeigen");
                          setData((p) => ({ ...p, topServices: [], topServicesSkipped: true }));
                          await trySaveStep(STEP_ORDER.indexOf("services"), { topServices: [] });
                          await advanceToStep("targetAudience");
                        }}
                        className="flex-1 text-xs bg-slate-600 hover:bg-slate-500 text-slate-300 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        Trotzdem überspringen
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
                  {data.topServices.length < 4 && (
                    <button
                      onClick={() => setData((p) => ({ ...p, topServices: [...p.topServices, { title: "", description: "" }] }))}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Leistung hinzufügen
                    </button>
                  )}
                  {!showSkipServicesWarning && (
                    <button
                      onClick={() => setShowSkipServicesWarning(true)}
                      className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-400 transition-colors"
                    >
                      Keine Leistungen anzeigen
                    </button>
                  )}
                  <button
                    disabled={isTyping || saveStepMutation.isPending}
                    onClick={async () => {
                      if (isTyping) return;
                      const filtered = data.topServices.filter((s) => s.title.trim());
                      if (filtered.length === 0) {
                        setShowSkipServicesWarning(true);
                        return;
                      }
                      addUserMessage(filtered.map((s) => `✓ ${s.title}`).join("\n"));
                      await trySaveStep(STEP_ORDER.indexOf("services"), { topServices: filtered });
                      await advanceToStep("targetAudience");
                    }}
                    className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {!isTyping && currentStep === "businessCategory" && (
              <div className="ml-9 space-y-3">
                {/* Show GMB category as pre-selected if available */}
                {data.businessCategory && (
                  <div className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/40 rounded-xl px-3 py-2">
                    <span className="text-emerald-400 text-xs">✓ Aus Google My Business:</span>
                    <span className="text-emerald-200 text-sm font-medium">{data.businessCategory}</span>
                    <button
                      onClick={async () => {
                        addUserMessage(`Branche: ${data.businessCategory} ✓`);
                        await trySaveStep(STEP_ORDER.indexOf("businessCategory"), { businessCategory: data.businessCategory });
                        await advanceToStep("brandColor");
                      }}
                      className="ml-auto text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded-lg transition-colors"
                    >
                      Übernehmen
                    </button>
                  </div>
                )}
                <p className="text-xs text-slate-400">Branche auswählen:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Restaurant", icon: "🍽️" },
                    { label: "Bar / Tapas", icon: "🍷" },
                    { label: "Café / Bistro", icon: "☕" },
                    { label: "Bäckerei", icon: "🥐" },
                    { label: "Friseur", icon: "✂️" },
                    { label: "Beauty / Kosmetik", icon: "💅" },
                    { label: "Bauunternehmen", icon: "🏗️" },
                    { label: "Handwerk", icon: "🔧" },
                    { label: "Fitness-Studio", icon: "💪" },
                    { label: "Arzt / Zahnarzt", icon: "🏥" },
                    { label: "Rechtsanwalt", icon: "⚖️" },
                    { label: "Immobilien", icon: "🏠" },
                    { label: "IT / Software", icon: "💻" },
                    { label: "Fotografie", icon: "📷" },
                    { label: "Autowerkstatt", icon: "🚗" },
                    { label: "Hotel / Pension", icon: "🏨" },
                  ].map(({ label, icon }) => (
                    <button
                      key={label}
                      onClick={() => handleSubmit(label)}
                      className={`flex items-center gap-1.5 text-sm border px-3 py-2 rounded-xl transition-all ${
                        data.businessCategory === label
                          ? "bg-blue-600/40 border-blue-500/60 text-white"
                          : "bg-slate-700/60 hover:bg-blue-600/40 border-slate-600/50 hover:border-blue-500/60 text-slate-200 hover:text-white"
                      }`}
                    >
                      <span>{icon}</span>
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
                {/* Free-text input for custom category */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Andere Branche eintippen…"
                    className="flex-1 bg-slate-700/60 border border-slate-600/50 text-slate-200 placeholder-slate-500 text-sm px-3 py-2 rounded-xl focus:outline-none focus:border-blue-500/60 focus:bg-blue-600/10 transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && (e.target as HTMLInputElement).value.trim()) {
                        handleSubmit((e.target as HTMLInputElement).value.trim());
                      }
                    }}
                  />
                  <button
                    className="bg-slate-600 hover:bg-slate-500 text-white text-sm px-3 py-2 rounded-xl transition-colors flex-shrink-0"
                    onClick={(e) => {
                      const input = (e.currentTarget.previousElementSibling as HTMLInputElement);
                      if (input?.value.trim()) handleSubmit(input.value.trim());
                    }}
                  >
                    OK
                  </button>
                </div>
              </div>
            )}
            {!isTyping && currentStep === "brandColor" && (
              <div className="ml-9 space-y-3">
                <div className="grid grid-cols-6 gap-2">
                  {[
                    { label: "Blau", hex: "#2563EB" },
                    { label: "Dunkelblau", hex: "#1E3A5F" },
                    { label: "Grün", hex: "#16A34A" },
                    { label: "Dunkelgrün", hex: "#14532D" },
                    { label: "Rot", hex: "#DC2626" },
                    { label: "Orange", hex: "#EA580C" },
                    { label: "Gelb", hex: "#CA8A04" },
                    { label: "Lila", hex: "#7C3AED" },
                    { label: "Pink", hex: "#DB2777" },
                    { label: "Türkis", hex: "#0891B2" },
                    { label: "Grau", hex: "#374151" },
                    { label: "Schwarz", hex: "#111827" },
                  ].map((color) => (
                    <button
                      key={color.hex}
                      title={color.label}
                      onClick={() => setData((p) => ({ ...p, brandColor: color.hex }))}
                      className={`w-full aspect-square rounded-lg border-2 transition-all ${data.brandColor === color.hex ? "border-white scale-110 shadow-lg" : "border-transparent hover:border-slate-400"}`}
                      style={{ backgroundColor: color.hex }}
                    />
                  ))}
                </div>
                <div className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-500 flex-shrink-0"
                    style={{ backgroundColor: data.brandColor || "#2563EB" }}
                  />
                  <input
                    type="text"
                    placeholder="#2563EB"
                    value={data.brandColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setData((p) => ({ ...p, brandColor: v }));
                    }}
                    className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50 font-mono"
                  />
                </div>
                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    const color = data.brandColor || "#2563EB";
                    addUserMessage(`Meine Hauptfarbe: ${color} ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("brandColor"), { brandColor: color });
                    await advanceToStep("brandSecondaryColor");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "brandSecondaryColor" && (
              <div className="ml-9 space-y-3">
                {/* Harmony suggestions based on primary color */}
                {data.brandColor && /^#[0-9A-Fa-f]{6}$/.test(data.brandColor) && (() => {
                  const hex = data.brandColor.replace('#', '');
                  const r = parseInt(hex.slice(0,2),16), g = parseInt(hex.slice(2,4),16), b = parseInt(hex.slice(4,6),16);
                  // Light tint (mix with white at 90%)
                  const tint = `#${Math.round(r*0.15+255*0.85).toString(16).padStart(2,'0')}${Math.round(g*0.15+255*0.85).toString(16).padStart(2,'0')}${Math.round(b*0.15+255*0.85).toString(16).padStart(2,'0')}`;
                  // Complementary (invert hue roughly)
                  const comp = `#${(255-r).toString(16).padStart(2,'0')}${(255-g).toString(16).padStart(2,'0')}${(255-b).toString(16).padStart(2,'0')}`;
                  // Warm neutral
                  const warm = '#FAF7F2';
                  return (
                    <div className="space-y-1">
                      <p className="text-slate-400 text-xs font-medium">Harmonische Vorschläge zur Hauptfarbe:</p>
                      <div className="flex gap-2">
                        {[{ label: 'Heller Ton', hex: tint }, { label: 'Komplementär', hex: comp }, { label: 'Warmweiß', hex: warm }].map((s) => (
                          <button key={s.hex} title={s.label}
                            onClick={() => setData((p) => ({ ...p, brandSecondaryColor: s.hex }))}
                            className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                              data.brandSecondaryColor === s.hex ? 'border-blue-400 bg-slate-700/50' : 'border-slate-600/40 hover:border-slate-400'
                            }`}>
                            <div className="w-8 h-8 rounded-md" style={{ backgroundColor: s.hex, border: '1px solid rgba(255,255,255,0.15)' }} />
                            <span className="text-slate-300 text-xs">{s.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="flex gap-2 items-center">
                  <div
                    className="w-8 h-8 rounded-lg border border-slate-500 flex-shrink-0"
                    style={{ backgroundColor: data.brandSecondaryColor || "#F1F5F9" }}
                  />
                  <input
                    type="text"
                    placeholder="#F1F5F9"
                    value={data.brandSecondaryColor}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) setData((p) => ({ ...p, brandSecondaryColor: v }));
                    }}
                    className="flex-1 bg-slate-700/60 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50 font-mono"
                  />
                </div>
                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    const color = data.brandSecondaryColor || "#F1F5F9";
                    addUserMessage(`Meine Sekundärfarbe: ${color} ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("brandSecondaryColor"), { brandColor: data.brandColor, brandSecondaryColor: color });
                    await advanceToStep("heroPhoto");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "heroPhoto" && (
              <HeroPhotoStep
                businessCategory={data.businessCategory}
                heroPhotoUrl={data.heroPhotoUrl}
                websiteId={websiteId}
                onSelect={(url) => setData((p) => ({ ...p, heroPhotoUrl: url }))}
                onNext={async () => {
                  const url = data.heroPhotoUrl || "";
                  const label = url ? "Hauptbild ausgewählt ✓" : "Bestehendes Hauptbild behalten ✓";
                  addUserMessage(label);
                  await trySaveStep(STEP_ORDER.indexOf("heroPhoto"), { heroPhotoUrl: url });
                  await advanceToStep("aboutPhoto");
                }}
              />
            )}
            {!isTyping && currentStep === "aboutPhoto" && (
              <HeroPhotoStep
                businessCategory={data.businessCategory}
                heroPhotoUrl={data.aboutPhotoUrl}
                websiteId={websiteId}
                isAboutPhoto
                onSelect={(url) => setData((p) => ({ ...p, aboutPhotoUrl: url }))}
                onNext={async () => {
                  const url = data.aboutPhotoUrl || "";
                  const label = url ? "Über-uns-Bild ausgewählt ✓" : "Bestehendes Bild behalten ✓";
                  addUserMessage(label);
                  await trySaveStep(STEP_ORDER.indexOf("aboutPhoto"), { aboutPhotoUrl: url });
                  await advanceToStep("brandLogo");
                }}
              />
            )}

            {!isTyping && currentStep === "brandLogo" && (
              <div className="ml-9 space-y-3">
                <p className="text-slate-400 text-xs">Wähle eine Schriftart für deinen Firmennamen als Logo:</p>
                {[
                  { font: "Playfair Display", label: "Elegant & Klassisch", style: { fontFamily: "'Playfair Display', serif", fontWeight: 700 } },
                  { font: "Oswald", label: "Stark & Modern", style: { fontFamily: "'Oswald', sans-serif", fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" as const } },
                  { font: "Montserrat", label: "Sauber & Professionell", style: { fontFamily: "'Montserrat', sans-serif", fontWeight: 700, letterSpacing: "0.02em" } },
                ].map((opt) => (
                  <button
                    key={opt.font}
                    onClick={() => setData((p) => ({ ...p, brandLogo: `font:${opt.font}` }))}
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left ${data.brandLogo === `font:${opt.font}` ? "border-blue-500 bg-blue-500/10" : "border-slate-600 bg-slate-700/40 hover:border-slate-500"}`}
                  >
                    <p className="text-white text-lg mb-1" style={opt.style}>{data.businessName || business?.name || "Mein Unternehmen"}</p>
                    <p className="text-slate-400 text-xs">{opt.label}</p>
                  </button>
                ))}

                {/* Logo upload option */}
                <div className="border-t border-slate-700 pt-3">
                  <p className="text-slate-400 text-xs mb-2">Oder eigenes Logo hochladen:</p>
                  {data.brandLogo?.startsWith("url:") ? (
                    <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-500/10">
                      <img src={data.brandLogo.replace("url:", "")} alt="Logo" className="h-10 w-auto max-w-[120px] object-contain rounded" />
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">Logo hochgeladen ✓</p>
                        <button
                          onClick={() => setData((p) => ({ ...p, brandLogo: "font:Montserrat" }))}
                          className="text-slate-400 text-xs hover:text-white transition-colors"
                        >
                          Entfernen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${uploadLogoMutation.isPending ? "opacity-50 pointer-events-none" : ""}`}>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file || !websiteId) return;
                          if (file.size > 2 * 1024 * 1024) {
                            toast.error("Logo darf maximal 2 MB groß sein.");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onload = async () => {
                            const base64 = (reader.result as string).split(",")[1];
                            try {
                              const result = await uploadLogoMutation.mutateAsync({
                                websiteId,
                                imageData: base64,
                                mimeType: file.type,
                              });
                              setData((p) => ({ ...p, brandLogo: `url:${result.url}` }));
                              toast.success("Logo erfolgreich hochgeladen!");
                            } catch {
                              toast.error("Upload fehlgeschlagen. Bitte erneut versuchen.");
                            }
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                      {uploadLogoMutation.isPending ? (
                        <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                      )}
                      <div>
                        <p className="text-white text-sm">{uploadLogoMutation.isPending ? "Wird hochgeladen…" : "Bild auswählen"}</p>
                        <p className="text-slate-400 text-xs">PNG, JPG oder SVG · max. 2 MB</p>
                      </div>
                      <Upload className="w-4 h-4 text-slate-500 ml-auto" />
                    </label>
                  )}
                </div>

                <button
                  disabled={isTyping || uploadLogoMutation.isPending}
                  onClick={async () => {
                    if (isTyping) return;
                    const logo = data.brandLogo || "font:Montserrat";
                    const label = logo.startsWith("url:") ? "Eigenes Logo" : logo.replace("font:", "");
                    addUserMessage(`Logo gewählt: ${label} ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("brandLogo"), { brandLogo: logo });
                    await advanceToStep("headlineFont");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            {!isTyping && currentStep === "headlineFont" && (
              <div className="ml-9 space-y-3">
                <p className="text-slate-400 text-xs">W\u00e4hle eine Schriftart f\u00fcr deine \u00dcberschriften – die Vorschau rechts \u00e4ndert sich sofort:</p>
                <div className="space-y-2">
                  <div>
                    <p className="text-slate-300 text-xs font-semibold mb-2">Serifenschriften (klassisch, elegant):</p>
                    {[
                      { font: "Georgia", label: "Georgia – Zeitlos & Elegant" },
                      { font: "Garamond", label: "Garamond – Traditionell & Fein" },
                      { font: "Playfair Display", label: "Playfair Display – Luxuriös & Modern" },
                    ].map((opt) => (
                      <button
                        key={opt.font}
                        onClick={() => setData((p) => ({ ...p, headlineFont: opt.font }))}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-2 ${
                          data.headlineFont === opt.font
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                        }`}
                      >
                        <p className="text-white text-base" style={{ fontFamily: `'${opt.font}', serif`, fontWeight: 700 }}>
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>
                  <div>
                    <p className="text-slate-300 text-xs font-semibold mb-2 mt-3">Serifenlose (modern, clean):</p>
                    {[
                      { font: "Inter", label: "Inter – Sauber & Minimal" },
                      { font: "Poppins", label: "Poppins – Freundlich & Dynamisch" },
                      { font: "Montserrat", label: "Montserrat – Stark & Geometrisch" },
                    ].map((opt) => (
                      <button
                        key={opt.font}
                        onClick={() => setData((p) => ({ ...p, headlineFont: opt.font }))}
                        className={`w-full p-3 rounded-lg border-2 transition-all text-left mb-2 ${
                          data.headlineFont === opt.font
                            ? "border-blue-500 bg-blue-500/10"
                            : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                        }`}
                      >
                        <p className="text-white text-base" style={{ fontFamily: `'${opt.font}', sans-serif`, fontWeight: 700 }}>
                          {opt.label}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    const fontLabel = data.headlineFont;
                    addUserMessage(`Schriftart gewählt: ${fontLabel} ✓`);
                    await trySaveStep(STEP_ORDER.indexOf("headlineFont"), { headlineFont: data.headlineFont });
                    await advanceToStep("businessName");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "addons" && (
              <div className="ml-9 space-y-2">
                {/* Build industry-specific addon list */}
                {(() => {
                  const cat = data.businessCategory.toLowerCase();
                  const isFood = /restaurant|café|cafe|bistro|bäckerei|bakery|bar|tapas|pizza|sushi|burger|imbiss|gastronomie/.test(cat);
                  const isBeauty = /friseur|hair|beauty|kosmetik|nail|spa|massage|barber|waxing|lash|brow/.test(cat);
                  const isFitness = /fitness|gym|sport|yoga|pilates|crossfit|kampfsport|personal trainer/.test(cat);
                  const showMenu = isFood;
                  const showPricelist = isBeauty || isFitness;

                  const addons: { key: keyof OnboardingData; label: string; price: string; desc: string; emoji: string }[] = [
                    { key: "addOnContactForm" as const, label: "Kontaktformular", price: "+4,90 €/Monat", desc: "Kunden können direkt anfragen", emoji: "📬" },
                    { key: "addOnGallery" as const, label: "Bildergalerie", price: "+4,90 €/Monat", desc: "Zeig deine Projekte & Fotos", emoji: "🖼️" },
                    ...(showMenu ? [{ key: "addOnMenu" as const, label: "Speisekarte", price: "+4,90 €/Monat", desc: "Deine Gerichte übersichtlich präsentieren", emoji: "📖" }] : []),
                    ...(showPricelist ? [{ key: "addOnPricelist" as const, label: "Preisliste", price: "+4,90 €/Monat", desc: "Deine Leistungen mit Preisen", emoji: "🏷️" }] : []),
                  ];

                  return addons.map((addon) => (
                    <button
                      key={addon.key}
                      onClick={() => setData((p) => ({ ...p, [addon.key]: !(p as any)[addon.key] }))}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                        (data as any)[addon.key]
                          ? "border-blue-500 bg-blue-500/10"
                          : "border-slate-600 bg-slate-700/40 hover:border-slate-500"
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${(data as any)[addon.key] ? "border-blue-500 bg-blue-500" : "border-slate-500"}`}>
                        {(data as any)[addon.key] && <Check className="w-3 h-3 text-white" />}
                      </div>
                      <span className="text-lg">{addon.emoji}</span>
                      <div className="flex-1">
                        <p className="text-white text-sm font-medium">{addon.label}</p>
                        <p className="text-slate-400 text-xs">{addon.desc}</p>
                      </div>
                      <span className="text-blue-400 text-xs font-medium">{addon.price}</span>
                    </button>
                  ));
                })()}
                <button
                  disabled={isTyping}
                  onClick={async () => {
                    if (isTyping) return;
                    const selected = [];
                    if (data.addOnContactForm) selected.push("Kontaktformular");
                    if (data.addOnGallery) selected.push("Bildergalerie");
                    if (data.addOnMenu) selected.push("Speisekarte");
                    if (data.addOnPricelist) selected.push("Preisliste");
                    addUserMessage(selected.length > 0 ? `Ich nehme: ${selected.join(", ")} ✓` : "Keine Extras nötig");
                    await trySaveStep(STEP_ORDER.indexOf("addons"), { addOnContactForm: data.addOnContactForm, addOnGallery: data.addOnGallery });
                    await advanceToStep("subpages");
                  }}
                  className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors mt-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Weiter <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {!isTyping && currentStep === "subpages" && (
              <div className="ml-9 space-y-2">
                {data.subPages.map((page, i) => (
                  <div key={page.id} className="bg-slate-700/60 rounded-xl p-3 flex gap-2 items-start">
                    <div className="flex-1 space-y-1.5">
                      <input
                        className="w-full bg-slate-600/50 text-white text-sm px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Seitenname (z.B. Über uns)"
                        value={page.name}
                        onChange={(e) => {
                          const updated = [...data.subPages];
                          updated[i] = { ...updated[i], name: e.target.value };
                          setData((p) => ({ ...p, subPages: updated }));
                        }}
                      />
                      <input
                        className="w-full bg-slate-600/50 text-white text-xs px-3 py-2 rounded-lg placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="Was soll auf dieser Seite stehen? (optional)"
                        value={page.description}
                        onChange={(e) => {
                          const updated = [...data.subPages];
                          updated[i] = { ...updated[i], description: e.target.value };
                          setData((p) => ({ ...p, subPages: updated }));
                        }}
                      />
                    </div>
                    <button
                      onClick={() => setData((p) => ({ ...p, subPages: p.subPages.filter((_, j) => j !== i) }))}
                      className="text-slate-500 hover:text-red-400 transition-colors mt-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 items-center flex-wrap">
                  <button
                    onClick={() => setData((p) => ({ ...p, subPages: [...p.subPages, { id: genId(), name: "", description: "" }] }))}
                    className="flex items-center gap-2 text-sm bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 hover:border-blue-400/70 text-blue-200 hover:text-white px-4 py-2 rounded-xl transition-all font-medium"
                  >
                    <Plus className="w-4 h-4" /> Unterseite hinzuf\u00fcgen <span className="text-blue-400 text-xs">(+9,90 \u20ac/Mo)</span>
                  </button>
                  <button
                    disabled={isTyping}
                    onClick={async () => {
                      if (isTyping) return;
                      const validPages = data.subPages.filter((p) => p.name.trim());
                      addUserMessage(validPages.length > 0 ? `Unterseiten: ${validPages.map((p) => p.name).join(", ")} ✓` : "Keine Unterseiten");
                      await trySaveStep(STEP_ORDER.indexOf("subpages"), { addOnSubpages: validPages.map((p) => p.name) });
                      await advanceToStep("email");
                    }}
                    className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Weiter <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {!isTyping && currentStep === "legalOwner" && business && (business.address || business.phone || business.email) && (
              <div className="ml-9 mt-2">
                {!gmbÜbernommenEditMode ? (
                  <button
                    onClick={async () => {
                      const parts = business.address ? business.address.split(",") : [];
                      const street = parts[0]?.trim() || "";
                      const zipCityRaw = parts[1]?.trim() || parts[2]?.trim() || "";
                      const zipCityMatch = zipCityRaw.match(/(\d{5})\s+(.+)$/);
                      const zip = zipCityMatch?.[1] || "";
                      const city = zipCityMatch?.[2] || "";
                      const phone = business.phone || "";
                      const email = business.email || "";
                      setData((p) => ({
                        ...p,
                        legalStreet: street || p.legalStreet,
                        legalZip: zip || p.legalZip,
                        legalCity: city || p.legalCity,
                        legalPhone: phone || p.legalPhone,
                        legalEmail: email || p.legalEmail,
                      }));
                      const summary = [
                        street && `Straße: ${street}`,
                        zip && city && `PLZ/Stadt: ${zip} ${city}`,
                        phone && `Telefon: ${phone}`,
                        email && `E-Mail: ${email}`,
                      ].filter(Boolean).join(" · ");
                      addUserMessage(`📍 GMB-Daten übernommen – ${summary}`);
                      const stepIdx = STEP_ORDER.indexOf("legalOwner");
                      if (street) await trySaveStep(stepIdx + 1, { legalStreet: street });
                      if (zip && city) await trySaveStep(stepIdx + 2, { legalZip: zip, legalCity: city });
                      if (email) await trySaveStep(stepIdx + 3, { legalEmail: email });
                      if (phone) await trySaveStep(stepIdx + 4, { legalPhone: phone });
                      await advanceToStep("legalVat");
                    }}
                    className="flex items-center gap-2 text-xs bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 px-3 py-2 rounded-xl transition-all"
                  >
                    <span>📍</span> Adresse, Telefon & E-Mail aus Google My Business übernehmen
                  </button>
                ) : (
                  /* Edit mode: show fields inline */
                  <div className="bg-slate-800/80 border border-slate-600/50 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-emerald-400 font-medium">📍 GMB-Daten bearbeiten</span>
                      <button
                        onClick={() => setGmbÜbernommenEditMode(false)}
                        className="text-xs text-slate-400 hover:text-white transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {[
                      { label: "Straße", key: "legalStreet" as const, placeholder: "Musterstraße 1" },
                      { label: "PLZ", key: "legalZip" as const, placeholder: "12345" },
                      { label: "Stadt", key: "legalCity" as const, placeholder: "Musterstadt" },
                      { label: "Telefon", key: "legalPhone" as const, placeholder: "+49 123 456789" },
                      { label: "E-Mail", key: "legalEmail" as const, placeholder: "info@firma.de" },
                    ].map(({ label, key, placeholder }) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 w-14 flex-shrink-0">{label}</span>
                        <input
                          type="text"
                          value={data[key] || ""}
                          onChange={(e) => setData((p) => ({ ...p, [key]: e.target.value }))}
                          placeholder={placeholder}
                          className="flex-1 bg-slate-700/60 text-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-600/50 outline-none focus:ring-1 focus:ring-blue-500 placeholder-slate-500"
                        />
                      </div>
                    ))}
                    <button
                      onClick={async () => {
                        setGmbÜbernommenEditMode(false);
                        const stepIdx = STEP_ORDER.indexOf("legalOwner");
                        if (data.legalStreet) await trySaveStep(stepIdx + 1, { legalStreet: data.legalStreet });
                        if (data.legalZip && data.legalCity) await trySaveStep(stepIdx + 2, { legalZip: data.legalZip, legalCity: data.legalCity });
                        if (data.legalEmail) await trySaveStep(stepIdx + 3, { legalEmail: data.legalEmail });
                        if (data.legalPhone) await trySaveStep(stepIdx + 4, { legalPhone: data.legalPhone });
                        await advanceToStep("legalVat");
                      }}
                      className="w-full flex items-center justify-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition-colors mt-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Bestätigen & weiter
                    </button>
                  </div>
                )}
              </div>
            )}
            {/* Pencil to re-open edit mode after GMB data was confirmed */}
            {!isTyping && currentStep !== "legalOwner" && ["legalStreet","legalZipCity","legalEmail","legalPhone","legalVat"].includes(currentStep) && data.legalStreet && (
              <div className="ml-9 mt-1">
                <button
                  onClick={() => {
                    setGmbÜbernommenEditMode(true);
                    // Go back to legalOwner step to show the edit panel
                    setCurrentStep("legalOwner" as any);
                  }}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
                  title="GMB-Daten nachträglich bearbeiten"
                >
                  <Pencil className="w-3 h-3" /> Angaben bearbeiten
                </button>
              </div>
            )}

            {!isTyping && currentStep === "hideSections" && (
              <div className="ml-9 space-y-2">
                {(() => {
                  const base = siteData?.website?.websiteData as any;
                  const allSections: Array<{ type: string; label: string; emoji: string }> = (base?.sections || [])
                    .filter((s: any) => s.type !== "hero")
                    .map((s: any) => {
                      const labels: Record<string, { label: string; emoji: string }> = {
                        about: { label: "Über uns", emoji: "👤" },
                        services: { label: "Leistungen", emoji: "🔧" },
                        testimonials: { label: "Kundenstimmen", emoji: "⭐" },
                        gallery: { label: "Bildergalerie", emoji: "🖼️" },
                        contact: { label: "Kontaktformular", emoji: "📬" },
                        cta: { label: "Call-to-Action", emoji: "🎯" },
                        features: { label: "Vorteile", emoji: "✅" },
                        team: { label: "Team", emoji: "👥" },
                      };
                      return { type: s.type, ...(labels[s.type] || { label: s.type, emoji: "📄" }) };
                    });
                  return (
                    <>
                      <div className="grid grid-cols-2 gap-2">
                        {allSections.map((sec) => {
                          const isHidden = hiddenSections.has(sec.type);
                          return (
                            <button
                              key={sec.type}
                              onClick={() => {
                                setHiddenSections((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(sec.type)) next.delete(sec.type);
                                  else next.add(sec.type);
                                  return next;
                                });
                              }}
                              className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all text-left ${
                                isHidden
                                  ? "border-red-500/60 bg-red-900/30 text-red-300 line-through opacity-60"
                                  : "border-slate-600 bg-slate-700/40 text-slate-200 hover:border-slate-500"
                              }`}
                            >
                              <span>{sec.emoji}</span>
                              <span>{sec.label}</span>
                              {isHidden && <span className="ml-auto text-red-400">✕</span>}
                            </button>
                          );
                        })}
                      </div>
                      {hiddenSections.size > 0 && (
                        <p className="text-xs text-amber-400/80 mt-1">
                          {hiddenSections.size} Bereich{hiddenSections.size > 1 ? "e" : ""} ausgeblendet – du kannst sie jederzeit wieder aktivieren.
                        </p>
                      )}
                      <button
                        disabled={isTyping}
                        onClick={async () => {
                          if (isTyping) return;
                          const hidden = Array.from(hiddenSections);
                          addUserMessage(hidden.length === 0 ? "Alle Bereiche anzeigen ✓" : `Ausgeblendet: ${hidden.join(", ")}`);
                          await advanceToStep("preview");
                        }}
                        className="w-full flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
                      >
                        Weiter <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  );
                })()}
              </div>
            )}

            {!isTyping && currentStep === "preview" && (
              <div className="ml-9">
                <button
                  onClick={async () => {
                    addUserMessage("Sieht super aus! Jetzt freischalten 🚀");
                    await advanceToStep("checkout");
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold px-5 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4" /> Website freischalten
                </button>
              </div>
            )}

            {!isTyping && currentStep === "checkout" && (
              <div className="ml-9 space-y-3">
                <div className="bg-slate-700/60 rounded-xl p-4 space-y-2">
                  {/* Intro offer banner */}
                  <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-lg px-3 py-2 mb-2">
                    <p className="text-xs font-semibold text-amber-300">🎉 Einführungsangebot: Erster Monat nur 39€!</p>
                  </div>
                  
                  {/* First month pricing */}
                  <div className="space-y-2 pb-2 border-b border-slate-600">
                    <p className="text-xs text-slate-400 font-medium">1. Monat:</p>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Basis-Website</span>
                      <span className="text-amber-400 font-semibold">39,00 €</span>
                    </div>
                  </div>
                  
                  {/* Regular pricing */}
                  <div className="space-y-2 pt-2">
                    <p className="text-xs text-slate-400 font-medium">Ab 2. Monat:</p>
                    <div className="flex justify-between text-sm text-slate-300">
                      <span>Basis-Website</span>
                      <span>79,00 €/Monat</span>
                    </div>
                    {data.addOnContactForm && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Kontaktformular</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnGallery && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Bildergalerie</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnMenu && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Speisekarte</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.addOnPricelist && (
                      <div className="flex justify-between text-sm text-slate-300">
                        <span>Preisliste</span>
                        <span>+4,90 €/Monat</span>
                      </div>
                    )}
                    {data.subPages.filter((p) => p.name).map((page) => (
                      <div key={page.id} className="flex justify-between text-sm text-slate-300">
                        <span>Unterseite: {page.name}</span>
                        <span>+9,90 €/Monat</span>
                      </div>
                    ))}
                    <div className="border-t border-slate-600 pt-2 flex justify-between font-bold text-white">
                      <span>Gesamt ab Monat 2</span>
                      <span>{totalPrice(false)} €/Monat</span>
                    </div>
                  </div>
                </div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <div
                    onClick={() => setLegalConsent((v) => !v)}
                    className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                      legalConsent ? "border-green-500 bg-green-500" : "border-slate-500 bg-transparent group-hover:border-slate-400"
                    }`}
                  >
                    {legalConsent && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-xs text-slate-400 leading-relaxed" onClick={() => setLegalConsent((v) => !v)}>
                    Ich bestätige, dass alle Angaben (insbesondere Impressum & Datenschutz) korrekt und vollständig sind. Ich übernehme die alleinige Verantwortung für die Richtigkeit dieser Daten. Pageblitz haftet nicht für fehlerhafte oder unvollständige Angaben.
                  </span>
                </label>
                <button
                  onClick={handleCheckout}
                  disabled={completeMutation.isPending || checkoutMutation.isPending || !legalConsent}
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white font-bold px-5 py-4 rounded-xl transition-all shadow-lg shadow-green-500/20 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {completeMutation.isPending || checkoutMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>\n                      <Zap className="w-5 h-5" /> Jetzt für {totalPrice(true)} € freischalten (1. Monat)\n                    </>                 )}
                </button>
                <p className="text-center text-xs text-slate-500">
                  Monatlich kündbar • Keine Einrichtungsgebühr • SSL inklusive
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
          {/* Input area – sticky at bottom */}
          {!["services", "addons", "subpages", "preview", "checkout", "welcome", "brandColor", "brandLogo", "businessCategory"].includes(currentStep) && (
            <div className="flex-shrink-0 px-4 pb-4 border-t border-slate-700/50">
              {/* Quick-reply chips – above input */}
              {!isTyping && !quickReplySelected && getQuickReplies(currentStep).length > 0 && (
                <div className="pt-3 pb-2">
                  <p className="text-xs text-slate-500 mb-2 font-medium">Schnellantworten:</p>
                  <div className="flex flex-wrap gap-2">
                    {getQuickReplies(currentStep).map((reply) => (
                      <button
                        key={reply}
                        onClick={() => {
                          setQuickReplySelected(true);
                          if (currentStep === "businessName" && reply === "Ja, stimmt!") {
                            handleSubmit("");
                          } else {
                            handleSubmit(reply);
                          }
                        }}
                        className="text-sm bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/50 hover:border-blue-400/70 text-blue-200 hover:text-white px-3.5 py-2 rounded-xl transition-all font-medium shadow-sm"
                      >
                        {reply}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                {/* AI generate button for text fields */}
                {["tagline", "description", "usp", "targetAudience"].includes(currentStep) && (
                  <div className="relative flex-shrink-0 group/ai">
                    <button
                      onClick={() => generateWithAI(currentStep as keyof OnboardingData)}
                      disabled={isGenerating}
                      className="w-10 h-10 rounded-xl bg-violet-600/30 hover:bg-violet-600/50 border border-violet-500/60 flex items-center justify-center transition-all ai-glow-btn"
                      title="Mit KI generieren"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 text-violet-300 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 text-violet-300" />
                      )}
                    </button>
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 pointer-events-none opacity-0 group-hover/ai:opacity-100 transition-opacity duration-200 z-20">
                      <div className="bg-violet-900/95 border border-violet-500/50 text-violet-100 text-xs px-3 py-2 rounded-lg shadow-lg text-center leading-snug">
                        ✨ Automatisch von KI<br/>generieren lassen
                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-violet-900/95" />
                      </div>
                    </div>
                  </div>
                )}
                {["tagline", "description", "usp", "targetAudience"].includes(currentStep) ? (
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    rows={3}
                    onChange={(e) => {
                      setInputValue(e.target.value);
                      // Auto-resize
                      const el = e.target as HTMLTextAreaElement;
                      el.style.height = "auto";
                      el.style.height = Math.min(el.scrollHeight, 160) + "px";
                    }}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={
                      currentStep === "tagline"
                        ? `z.B. "Ihr ${(data as any).businessCategory || 'Fachbetrieb'} in ${data.legalCity || 'Ihrer Stadt'}"`
                        : currentStep === "description"
                        ? "Was macht dein Unternehmen besonders? (2-3 Sätze)"
                        : currentStep === "usp"
                        ? "z.B. 'Wir sind der einzige Anbieter in der Region, der...' "
                        : currentStep === "targetAudience"
                        ? "z.B. 'Privatkunden und kleine Unternehmen in der Region'"
                        : "Deine Antwort... (Shift+Enter für neue Zeile)"
                    }
                    className="flex-1 bg-slate-700/60 text-white text-sm px-4 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50 resize-none leading-relaxed"
                    style={{ minHeight: "72px", maxHeight: "160px" }}
                  />
                ) : (
                  <input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSubmit()}
                    placeholder={
                      currentStep === "businessName"
                        ? data.businessName || "Unternehmensname eingeben..."
                        : currentStep === "legalOwner"
                        ? "Vorname Nachname"
                        : currentStep === "legalStreet"
                        ? "Musterstraße 12"
                        : currentStep === "legalZipCity"
                        ? "46395 Bocholt"
                        : currentStep === "legalEmail"
                        ? "info@musterfirma.de"
                        : currentStep === "legalVat"
                        ? "DE123456789 – oder leer lassen (Kleinunternehmer)"
                        : currentStep === "email"
                        ? "deine@email.de"
                        : "Deine Antwort..."
                    }
                    className="flex-1 bg-slate-700/60 text-white text-sm px-4 py-2.5 rounded-xl placeholder-slate-500 outline-none focus:ring-1 focus:ring-blue-500 border border-slate-600/50"
                  />
                )}
                <button
                  onClick={() => handleSubmit()}
                  disabled={!inputValue.trim() && currentStep !== "businessName" && currentStep !== "legalVat"}
                  className="w-10 h-10 rounded-xl bg-blue-600 hover:bg-blue-500 flex items-center justify-center transition-colors disabled:opacity-40 flex-shrink-0"
                >
                  <Send className="w-4 h-4 text-white" />
                </button>
              </div>


            </div>
          )}
          </div>{/* end messages+input wrapper */}
        </div>
        {/* Preview panell – MacBook mockup */}
        <div className="relative flex-1 overflow-y-auto bg-gradient-to-br from-slate-800 to-slate-900 flex flex-col">
          {/* Preview top bar: chat toggle + progress bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-slate-700/50">
            {/* Chat toggle button – always visible here */}
            <button
              onClick={() => setChatHidden((v) => !v)}
              className="flex items-center gap-1.5 text-xs bg-slate-700/60 hover:bg-slate-600/60 border border-slate-600/50 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
              title={chatHidden ? "Chat einblenden" : "Chat ausblenden"}
            >
              {chatHidden ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
              {chatHidden ? "Chat einblenden" : "Chat ausblenden"}
            </button>
            {/* Progress bar */}
            {currentStep !== "welcome" && currentStep !== "checkout" && (() => {
              const totalSteps = STEP_ORDER.filter((s) => s !== "welcome").length;
              const currentIdx = STEP_ORDER.indexOf(currentStep);
              const progress = Math.round((currentIdx / totalSteps) * 100);
              return (
                <div className="flex flex-1 items-center gap-3">
                  <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">Schritt {currentIdx} / {totalSteps}</span>
                </div>
              );
            })()}
          </div>
          {liveWebsiteData && colorScheme ? (
            <MacbookMockup label="Live-Vorschau deiner Website" innerRef={previewInnerRef}>
              <WebsiteRenderer
                websiteData={liveWebsiteData}
                colorScheme={{
                    ...colorScheme,
                    ...(data.brandColor && /^#[0-9A-Fa-f]{6}$/.test(data.brandColor)
                      ? { primary: data.brandColor, accent: data.brandColor }
                      : {}),
                    ...(data.brandSecondaryColor && /^#[0-9A-Fa-f]{6}$/.test(data.brandSecondaryColor)
                      ? { secondary: data.brandSecondaryColor }
                      : {}),
                  } as any}
                heroImageUrl={data.heroPhotoUrl || heroImageUrl}
                aboutImageUrl={data.aboutPhotoUrl || aboutImageUrl}
                layoutStyle={layoutStyle}
                businessPhone={business?.phone || undefined}
                businessAddress={business?.address || undefined}
                businessEmail={business?.email || undefined}
                openingHours={business?.openingHours ? convertOpeningHoursToGerman(business.openingHours as string[]) : undefined}
                slug={slug}
                contactFormLocked={!data.addOnContactForm}
                logoFont={data.brandLogo?.startsWith("font:") ? data.brandLogo.replace("font:", "") : undefined}
                headlineFontOverride={data.headlineFont || undefined}
              />
            </MacbookMockup>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-500 min-h-[400px]">
              <div className="text-center">
                <Monitor className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-3 text-slate-600" />
                <p className="text-sm">Vorschau wird geladen...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── HeroPhotoStep ─────────────────────────────────────────────────────────────

const INDUSTRY_KEYWORDS: Record<string, string> = {
  "Restaurant": "restaurant interior food",
  "Bar / Tapas": "bar cocktails night",
  "Café / Bistro": "cafe coffee cozy",
  "Bäckerei": "bakery bread pastry",
  "Friseur": "hair salon barber",
  "Beauty / Kosmetik": "beauty salon cosmetics",
  "Bauunternehmen": "construction building",
  "Handwerk": "craftsman workshop tools",
  "Fitness-Studio": "gym fitness workout",
  "Arzt / Zahnarzt": "modern medical clinic",
  "Rechtsanwalt": "law office professional",
  "Immobilien": "modern real estate house",
  "IT / Software": "modern tech office",
  "Fotografie": "photography studio camera",
  "Autowerkstatt": "auto repair garage",
  "Hotel / Pension": "hotel lobby elegant",
};

// Curated Unsplash photo IDs per industry (free, no API key needed)
const INDUSTRY_PHOTOS: Record<string, { id: string; url: string; thumb: string; alt: string }[]> = {
  default: [
    { id: "1", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&q=70", alt: "Modernes Büro" },
    { id: "2", url: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=400&q=70", alt: "Helles Büro" },
    { id: "3", url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&q=70", alt: "Gebäude" },
    { id: "4", url: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&q=70", alt: "Team Meeting" },
    { id: "5", url: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=400&q=70", alt: "Teamarbeit" },
    { id: "6", url: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=400&q=70", alt: "Professionell" },
  ],
  "Restaurant": [
    { id: "r1", url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&q=70", alt: "Restaurant Innenraum" },
    { id: "r2", url: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&q=70", alt: "Elegantes Dinner" },
    { id: "r3", url: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=400&q=70", alt: "Restaurant Tische" },
    { id: "r4", url: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=400&q=70", alt: "Gericht" },
    { id: "r5", url: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=400&q=70", alt: "Restaurant Ambiente" },
    { id: "r6", url: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1544148103-0773bf10d330?w=400&q=70", alt: "Speisen" },
  ],
  "Café / Bistro": [
    { id: "c1", url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=70", alt: "Café Innenraum" },
    { id: "c2", url: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=400&q=70", alt: "Kaffee" },
    { id: "c3", url: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=400&q=70", alt: "Café Tische" },
    { id: "c4", url: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=400&q=70", alt: "Latte Art" },
    { id: "c5", url: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=70", alt: "Kaffeetasse" },
    { id: "c6", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=70", alt: "Café Atmosphäre" },
  ],
  "Friseur": [
    { id: "f1", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400&q=70", alt: "Friseursalon" },
    { id: "f2", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=70", alt: "Haarstyling" },
    { id: "f3", url: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?w=400&q=70", alt: "Salon Spiegel" },
    { id: "f4", url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400&q=70", alt: "Haarschnitt" },
    { id: "f5", url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400&q=70", alt: "Barber" },
    { id: "f6", url: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?w=400&q=70", alt: "Friseursalon modern" },
  ],
  "Handwerk": [
    { id: "h1", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=70", alt: "Handwerker" },
    { id: "h2", url: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&q=70", alt: "Werkzeuge" },
    { id: "h3", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70", alt: "Werkstatt" },
    { id: "h4", url: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=70", alt: "Holzarbeit" },
    { id: "h5", url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&q=70", alt: "Baustelle" },
    { id: "h6", url: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=400&q=70", alt: "Handwerker Arbeit" },
  ],
  "Bauunternehmen": [
    { id: "b1", url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=70", alt: "Baustelle" },
    { id: "b2", url: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1541123437800-1bb1317badc2?w=400&q=70", alt: "Bau" },
    { id: "b3", url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=400&q=70", alt: "Bauarbeiter" },
    { id: "b4", url: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&q=70", alt: "Architektur" },
    { id: "b5", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=400&q=70", alt: "Gebäude" },
    { id: "b6", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=70", alt: "Werkstatt" },
  ],
  "Beauty / Kosmetik": [
    { id: "bk1", url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400&q=70", alt: "Beauty Salon" },
    { id: "bk2", url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=400&q=70", alt: "Kosmetik" },
    { id: "bk3", url: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1612817288484-6f916006741a?w=400&q=70", alt: "Nails" },
    { id: "bk4", url: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400&q=70", alt: "Spa" },
    { id: "bk5", url: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=70", alt: "Make-up" },
    { id: "bk6", url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=70", alt: "Styling" },
  ],
  "Fitness-Studio": [
    { id: "fi1", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400&q=70", alt: "Fitnessstudio" },
    { id: "fi2", url: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=400&q=70", alt: "Training" },
    { id: "fi3", url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=70", alt: "Gym" },
    { id: "fi4", url: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400&q=70", alt: "Geräte" },
    { id: "fi5", url: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=400&q=70", alt: "Workout" },
    { id: "fi6", url: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400&q=70", alt: "Fitness" },
  ],
  "Arzt / Zahnarzt": [
    { id: "az1", url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400&q=70", alt: "Arztpraxis" },
    { id: "az2", url: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=70", alt: "Zahnarzt" },
    { id: "az3", url: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?w=400&q=70", alt: "Praxis" },
    { id: "az4", url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=70", alt: "Medizin" },
    { id: "az5", url: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=70", alt: "Arzt" },
    { id: "az6", url: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=70", alt: "Klinik" },
  ],
  "Rechtsanwalt": [
    { id: "ra1", url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&q=70", alt: "Anwaltskanzlei" },
    { id: "ra2", url: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=400&q=70", alt: "Bücher" },
    { id: "ra3", url: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1575505586569-646b2ca898fc?w=400&q=70", alt: "Recht" },
    { id: "ra4", url: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&q=70", alt: "Vertrag" },
    { id: "ra5", url: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=70", alt: "Anwalt" },
    { id: "ra6", url: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1568992687947-868a62a9f521?w=400&q=70", alt: "Kanzlei" },
  ],
  "Immobilien": [
    { id: "im1", url: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=400&q=70", alt: "Haus" },
    { id: "im2", url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400&q=70", alt: "Villa" },
    { id: "im3", url: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=400&q=70", alt: "Wohnhaus" },
    { id: "im4", url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&q=70", alt: "Küche" },
    { id: "im5", url: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&q=70", alt: "Wohnzimmer" },
    { id: "im6", url: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&q=70", alt: "Immobilien" },
  ],
  "IT / Software": [
    { id: "it1", url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&q=70", alt: "Coding" },
    { id: "it2", url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=70", alt: "Programmieren" },
    { id: "it3", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=70", alt: "Technik" },
    { id: "it4", url: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400&q=70", alt: "Büro" },
    { id: "it5", url: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=400&q=70", alt: "Laptop" },
    { id: "it6", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=70", alt: "Code" },
  ],
  "Fotografie": [
    { id: "fo1", url: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=400&q=70", alt: "Kamera" },
    { id: "fo2", url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400&q=70", alt: "Fotostudio" },
    { id: "fo3", url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=400&q=70", alt: "Fotografie" },
    { id: "fo4", url: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?w=400&q=70", alt: "Portrait" },
    { id: "fo5", url: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1500051638674-ff996a0ec29e?w=400&q=70", alt: "Shooting" },
    { id: "fo6", url: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?w=400&q=70", alt: "Foto" },
  ],
  "Autowerkstatt": [
    { id: "aw1", url: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1625047509168-a7026f36de04?w=400&q=70", alt: "Werkstatt" },
    { id: "aw2", url: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=400&q=70", alt: "Auto" },
    { id: "aw3", url: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1530046339160-ce3e530c7d2f?w=400&q=70", alt: "Reparatur" },
    { id: "aw4", url: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&q=70", alt: "KFZ" },
    { id: "aw5", url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=400&q=70", alt: "Fahrzeug" },
    { id: "aw6", url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400&q=70", alt: "Garage" },
  ],
  "Hotel / Pension": [
    { id: "ho1", url: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=70", alt: "Hotel" },
    { id: "ho2", url: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1455587734955-081b22074882?w=400&q=70", alt: "Hotelzimmer" },
    { id: "ho3", url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&q=70", alt: "Lobby" },
    { id: "ho4", url: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400&q=70", alt: "Zimmer" },
    { id: "ho5", url: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=400&q=70", alt: "Pool" },
    { id: "ho6", url: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1496417263034-38ec4f0b665a?w=400&q=70", alt: "Pension" },
  ],
  "Bäckerei": [
    { id: "bae1", url: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=70", alt: "Bäckerei" },
    { id: "bae2", url: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=70", alt: "Brot" },
    { id: "bae3", url: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1568254183919-78a4f43a2877?w=400&q=70", alt: "Brötchen" },
    { id: "bae4", url: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1517433670267-08bbd4be890f?w=400&q=70", alt: "Kuchen" },
    { id: "bae5", url: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=400&q=70", alt: "Croissant" },
    { id: "bae6", url: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1549931319-a545dcf3bc7c?w=400&q=70", alt: "Backwaren" },
  ],
  "Bar / Tapas": [
    { id: "bar1", url: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&q=70", alt: "Bar" },
    { id: "bar2", url: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=400&q=70", alt: "Cocktails" },
    { id: "bar3", url: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1572116469696-31de0f17cc34?w=400&q=70", alt: "Barkeeper" },
    { id: "bar4", url: "https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1543007631-283050bb3e8c?w=400&q=70", alt: "Tapas" },
    { id: "bar5", url: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=400&q=70", alt: "Drinks" },
    { id: "bar6", url: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=1200&q=80", thumb: "https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?w=400&q=70", alt: "Bar Ambiente" },
  ],
};

interface HeroPhotoStepProps {
  businessCategory: string;
  heroPhotoUrl: string;
  websiteId?: number;
  isAboutPhoto?: boolean;
  onSelect: (url: string) => void;
  onNext: () => Promise<void>;
}

function HeroPhotoStep({ businessCategory, heroPhotoUrl, websiteId, isAboutPhoto, onSelect, onNext }: HeroPhotoStepProps) {
  const [isUploading, setIsUploading] = useState(false);
  const uploadLogoMutation = trpc.onboarding.uploadLogo.useMutation();

  const photos = INDUSTRY_PHOTOS[businessCategory] || INDUSTRY_PHOTOS["default"];

  return (
    <div className="ml-9 space-y-3">
      <p className="text-slate-400 text-xs">{isAboutPhoto ? "Wähle ein Foto für den \"Über uns\"-Bereich deiner Website:" : "Wähle ein passendes Foto für den Hero-Bereich deiner Website:"}</p>

      {/* Photo grid */}
      <div className="grid grid-cols-3 gap-2">
        {photos.map((photo) => (
          <button
            key={photo.id}
            onClick={() => onSelect(heroPhotoUrl === photo.url ? "" : photo.url)}
            className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
              heroPhotoUrl === photo.url
                ? "border-blue-400 ring-2 ring-blue-400/40"
                : "border-slate-600/40 hover:border-slate-400"
            }`}
            title={photo.alt}
          >
            <img
              src={photo.thumb}
              alt={photo.alt}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {heroPhotoUrl === photo.url && (
              <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-white" />
                </div>
              </div>
            )}
          </button>
        ))}
      </div>

      {/* Upload option */}
      <div className="border-t border-slate-700 pt-3">
        <p className="text-slate-400 text-xs mb-2">Oder eigenes Foto hochladen:</p>
        {heroPhotoUrl && !photos.some((p) => p.url === heroPhotoUrl) ? (
          <div className="flex items-center gap-3 p-3 rounded-xl border-2 border-blue-500 bg-blue-500/10">
            <img src={heroPhotoUrl} alt="Eigenes Foto" className="h-12 w-20 object-cover rounded" />
            <div className="flex-1">
              <p className="text-white text-sm font-medium">Eigenes Foto ✓</p>
              <button
                onClick={() => onSelect("")}
                className="text-slate-400 text-xs hover:text-white transition-colors"
              >
                Entfernen
              </button>
            </div>
          </div>
        ) : (
          <label className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-slate-600 bg-slate-700/40 hover:border-slate-500 cursor-pointer transition-all ${isUploading ? "opacity-50 pointer-events-none" : ""}`}>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !websiteId) return;
                if (file.size > 5 * 1024 * 1024) {
                  alert("Foto darf maximal 5 MB groß sein.");
                  return;
                }
                setIsUploading(true);
                const reader = new FileReader();
                reader.onload = async () => {
                  const base64 = (reader.result as string).split(",")[1];
                  try {
                    const result = await uploadLogoMutation.mutateAsync({
                      websiteId,
                      imageData: base64,
                      mimeType: file.type,
                    });
                    onSelect(result.url);
                  } catch {
                    alert("Upload fehlgeschlagen. Bitte erneut versuchen.");
                  } finally {
                    setIsUploading(false);
                  }
                };
                reader.readAsDataURL(file);
              }}
            />
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className="text-white text-sm">{isUploading ? "Wird hochgeladen…" : "Foto hochladen"}</p>
              <p className="text-slate-400 text-xs">JPG, PNG oder WebP · max. 5 MB</p>
            </div>
          </label>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => { onSelect(""); onNext(); }}
          className="flex-1 text-xs text-slate-400 hover:text-slate-300 px-3 py-2 rounded-xl border border-slate-700 hover:border-slate-600 transition-colors"
        >
          Bestehendes behalten
        </button>
        <button
          disabled={isUploading}
          onClick={onNext}
          className="flex-1 flex items-center justify-center gap-1 bg-blue-600 hover:bg-blue-500 text-white text-sm px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Weiter <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

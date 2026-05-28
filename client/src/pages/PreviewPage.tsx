import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import WebsiteRenderer from "@/components/WebsiteRenderer";
import AgeGate from "@/components/AgeGate";
import CookieBanner from "@/components/CookieBanner";
import { Loader2, Zap, AlertCircle, CheckCircle, MessageSquare, Bot, Calendar, Globe } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";
import { toast } from "sonner";
import type { WebsiteData, ColorScheme } from "@shared/types";
import { convertOpeningHoursToGerman } from "@shared/hours";

const addonIcons: Record<string, any> = { MessageSquare, Bot, Calendar, Globe };

const ADDONS = [
  { id: "contact-form", name: "Kontaktformular", description: "Professionelles Kontaktformular mit E-Mail-Benachrichtigung", price: 49, icon: "MessageSquare" },
  { id: "ai-chat", name: "KI-Chat", description: "Intelligenter Chatbot für automatische Kundenanfragen", price: 99, icon: "Bot" },
  { id: "booking", name: "Terminbuchung", description: "Online-Terminbuchungssystem für Ihre Kunden", price: 79, icon: "Calendar" },
  { id: "custom-domain", name: "Eigene Domain", description: "Verbinden Sie Ihre eigene Domain", price: 29, icon: "Globe" },
];


export default function PreviewPage() {
  const params = useParams<{ token: string }>();
  const bannerRef = useRef<HTMLDivElement>(null);

  // All data hooks FIRST so they're in scope for useEffect below
  const { data, isLoading, error } = trpc.website.get.useQuery(
    { token: params.token },
    { enabled: !!params.token }
  );

  // Onboarding-Overrides (headlineFont, headlineSize, aboutPhotoUrl) damit die
  // Vollbild-Vorschau dasselbe Aussehen hat wie die Inline-Vorschau im Onboarding.
  const websiteIdForOnboarding = data?.website?.id;
  const { data: onboardingData } = trpc.onboarding.get.useQuery(
    { websiteId: websiteIdForOnboarding! },
    { enabled: !!websiteIdForOnboarding },
  );

  const colorScheme = useMemo(() => {
    if (!data) return null;
    return data.website.colorScheme as ColorScheme;
  }, [data]);

  // websiteData mit Onboarding-Overrides patchen (analog zu liveWebsiteData
  // im OnboardingChat). Die Layout-Komponenten lesen u.a. addOnContactForm,
  // contactFormFields, addOnGallery aus websiteData direkt – diese Felder
  // werden im Onboarding gespeichert (onboarding_responses), aber nicht
  // automatisch ins websiteData-JSON übernommen.
  // WICHTIG: useMemo MUSS vor den early returns stehen (Rules of Hooks).
  const websiteData = useMemo((): WebsiteData | null => {
    if (!data) return null;
    const base = data.website.websiteData as WebsiteData;
    const ob = onboardingData as any;
    if (!ob) return base;
    const patched: any = JSON.parse(JSON.stringify(base || {}));
    if (ob.addOnContactForm !== undefined && ob.addOnContactForm !== null) {
      patched.addOnContactForm = ob.addOnContactForm;
    }
    if (ob.contactFormFields) {
      patched.contactFormFields = ob.contactFormFields;
    }
    if (ob.addOnGallery !== undefined) patched.addOnGallery = ob.addOnGallery;
    if (ob.addOnMenu !== undefined) patched.addOnMenu = ob.addOnMenu;
    if (ob.addOnMenuData) patched.addOnMenuData = ob.addOnMenuData;
    if (ob.addOnPricelist !== undefined) patched.addOnPricelist = ob.addOnPricelist;
    if (ob.addOnPricelistData) patched.addOnPricelistData = ob.addOnPricelistData;

    // Kontakt-Section mit Impressum-Daten + Öffnungszeiten patchen (analog
    // OnboardingChat#liveWebsiteData). Die linke Spalte der ContactSection
    // liest address/phone/hours aus websiteData.sections[contact].items[].
    if (!Array.isArray(patched.sections)) patched.sections = [];
    const contactIdx = patched.sections.findIndex((s: any) => s.type === "contact");
    const contactSec: any = contactIdx > -1
      ? patched.sections[contactIdx]
      : { type: "contact", headline: "Kontakt", items: [] };
    const items: any[] = [...(contactSec.items || [])];
    const setItem = (icon: string, value: string) => {
      if (!value) return;
      const idx = items.findIndex((i: any) => i.icon === icon);
      if (idx > -1) items[idx] = { ...items[idx], description: value };
      else items.push({ icon, description: value });
    };
    const street = ob.legalStreet || "";
    const zipCity = ob.legalZip && ob.legalCity ? `${ob.legalZip} ${ob.legalCity}` : (ob.legalCity || "");
    const address = [street, zipCity].filter(Boolean).join(", ");
    setItem("MapPin", address);
    setItem("Phone", ob.legalPhone || "");
    setItem("Mail", ob.legalEmail || "");
    if (Array.isArray(ob.openingHours) && ob.openingHours.length > 0 && typeof ob.openingHours[0] === "object") {
      const openDays = ob.openingHours.filter((d: any) => d.open);
      if (openDays.length > 0) {
        const hoursStr = openDays.map((d: any) => {
          const slot1 = `${d.from}–${d.to}`;
          const slot2 = d.from2 && d.to2 ? `, ${d.from2}–${d.to2}` : "";
          return `${(d.day || "").slice(0, 2)}: ${slot1}${slot2}`;
        }).join(" · ");
        setItem("Clock", hoursStr);
      }
    }
    const updated = { ...contactSec, items };
    if (contactIdx > -1) patched.sections[contactIdx] = updated;
    else patched.sections.push(updated);

    return patched as WebsiteData;
  }, [data, onboardingData]);

  // MutationObserver: fires as soon as WebsiteRenderer adds the <nav> to the DOM.
  // Uses setProperty('top', …, 'important') so it beats any CSS rule incl. Tailwind layers.
  useEffect(() => {
    const BANNER_H = bannerRef.current?.offsetHeight || 52;

    const applyNavTop = () => {
      const top = window.scrollY >= BANNER_H ? 0 : BANNER_H;
      document.querySelectorAll<HTMLElement>(".pageblitz-preview-root nav").forEach(nav => {
        nav.style.setProperty("top", top + "px", "important");
        nav.style.transition = "top 0.15s ease";
      });
    };

    const mo = new MutationObserver(applyNavTop);
    const root = document.querySelector(".pageblitz-preview-root");
    if (root) mo.observe(root, { childList: true, subtree: true });

    window.addEventListener("scroll", applyNavTop, { passive: true });
    applyNavTop();

    return () => {
      mo.disconnect();
      window.removeEventListener("scroll", applyNavTop);
    };
  }, []); // empty deps — MutationObserver watches DOM, scroll handles scroll

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-500">Website wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !data || !colorScheme || !websiteData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h1 className="text-xl font-bold mt-4 text-gray-900">Website nicht gefunden</h1>
          <p className="text-gray-500 mt-2">Der Preview-Link ist ungültig oder abgelaufen.</p>
        </div>
      </div>
    );
  }

  const heroImageUrl = (onboardingData as any)?.heroPhotoUrl
    || ((data.website as any).heroImageUrl as string | null | undefined);
  const aboutImageUrl = (onboardingData as any)?.aboutPhotoUrl
    || ((data.website as any).aboutImageUrl as string | null | undefined);
  const headlineFontOverride = (onboardingData as any)?.headlineFont || undefined;
  const headlineSize = (onboardingData as any)?.headlineSize || undefined;
  const layoutStyle = (data.website as any).layoutStyle as string | null | undefined;
  const layoutVersion = (data.website as any).layoutVersion as number | null | undefined;
  const requiresAgeGate = !!(data.website as any).requiresAgeGate;
  const slug = (data.website as any).slug as string;
  const business = data.business;

  // Navigate to onboarding
  const goToOnboarding = () => {
    window.location.href = `/preview/${params.token}/onboarding`;
  };

  return (
    <div className="pageblitz-preview-root">
      {/* FSK-18 Age-Gate – wenn aktiv, gleiches Modal wie auf der Live-Site,
          damit Admin/Kundin den echten Besucher-Eindruck sieht.
          Im Inkognito-Tab erscheint es jedes Mal neu (zum Testen). */}
      {requiresAgeGate && slug && (
        <AgeGate slug={slug} businessName={business?.name} />
      )}

      {/* Shift all layout fixed-navbars below the preview bar.
          Layout navbars use `fixed top-0 z-50` (Tailwind → top:0px, specificity 0,0,1).
          `.pageblitz-preview-root nav` has specificity 0,1,1 → wins without !important. */}
      <style>{`
        .pageblitz-preview-root nav { top: 52px; transition: top 0.15s ease; }
        .pageblitz-preview-root.banner-hidden nav { top: 0; }
        html:has(.pageblitz-preview-root) { scroll-padding-top: 52px; }
      `}</style>

      {/* Preview Banner — sticky so it scrolls away; IntersectionObserver then resets nav top to 0 */}
      <div ref={bannerRef} className="sticky top-0 z-[60] bg-gray-900 text-white py-3 px-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <Zap className="h-5 w-5 text-amber-400 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              Vorschau für <strong>{business?.name}</strong> – Diese Website wurde von Pageblitz erstellt
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={goToOnboarding}
              className="px-5 py-2 rounded-full text-sm font-semibold bg-white text-gray-900 hover:bg-gray-100 transition-colors whitespace-nowrap"
            >
              Jetzt aktivieren – ab 19,90 €/Mo
            </button>
          </div>
        </div>
      </div>

      <WebsiteRenderer
        websiteData={websiteData}
        colorScheme={colorScheme}
        heroImageUrl={heroImageUrl}
        aboutImageUrl={aboutImageUrl}
        headlineFontOverride={headlineFontOverride}
        headlineSize={headlineSize}
        layoutStyle={layoutStyle}
        layoutVersion={layoutVersion}
        businessPhone={business?.phone || undefined}
        businessAddress={business?.address || undefined}
        businessEmail={business?.email || undefined}
        openingHours={
          Array.isArray(business?.openingHours) && typeof business?.openingHours[0] === 'string'
            ? convertOpeningHoursToGerman(business.openingHours as string[])
            : undefined
        }
        businessCategory={(business as any)?.category || undefined}
        showActivateButton={true}
        onActivate={goToOnboarding}
      />
      <CookieBanner primaryColor={colorScheme?.primary} />
    </div>
  );
}

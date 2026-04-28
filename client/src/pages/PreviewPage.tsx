import { trpc } from "@/lib/trpc";
import { useParams } from "wouter";
import WebsiteRenderer from "@/components/WebsiteRenderer";
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

  const colorScheme = useMemo(() => {
    if (!data) return null;
    return data.website.colorScheme as ColorScheme;
  }, [data]);

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

  if (error || !data || !colorScheme) {
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

  const websiteData = data.website.websiteData as WebsiteData;
  const heroImageUrl = (data.website as any).heroImageUrl as string | null | undefined;
  const layoutStyle = (data.website as any).layoutStyle as string | null | undefined;
  const layoutVersion = (data.website as any).layoutVersion as number | null | undefined;
  const business = data.business;

  // Navigate to onboarding
  const goToOnboarding = () => {
    window.location.href = `/preview/${params.token}/onboarding`;
  };

  return (
    <div className="pageblitz-preview-root">
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

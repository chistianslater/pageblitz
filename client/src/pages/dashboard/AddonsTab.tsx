import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  ChevronLeft,
  Mail,
  CalendarDays,
  MessageSquare,
  Lock,
  Loader2,
} from "lucide-react";
import { BookingAddonSection } from "./BookingAddonSection";
import { AiChatAddonSection } from "./AiChatAddonSection";
import { ContactFormAddonSection } from "./ContactFormAddonSection";
import { ADDON_EDITORS } from "@shared/onboardingV2/addonEditors";
import { studioPanelHref } from "./StudioCard";

type ContentAddonKey = "gallery" | "menu" | "pricelist" | "team" | "subpages";
const CONTENT_ADDON_KEYS: ContentAddonKey[] = [
  "gallery",
  "menu",
  "pricelist",
  "team",
  "subpages",
];
type AddonKey = ContentAddonKey;
export type DetailKey = "booking" | "aiChat" | "contactForm";

const CONTENT_ADDON_LABELS: Record<
  ContentAddonKey,
  { name: string; icon: string; hint: string; priceLabel: string }
> = {
  gallery: {
    name: "Bildergalerie",
    icon: "🖼️",
    hint: "Präsentiere deine Arbeiten in einer Galerie.",
    priceLabel: "+3,90 €/Mon",
  },
  menu: {
    name: "Speisekarte",
    icon: "🍽️",
    hint: "Gerichte und Preise übersichtlich darstellen.",
    priceLabel: "+3,90 €/Mon",
  },
  pricelist: {
    name: "Preisliste",
    icon: "💶",
    hint: "Deine Leistungen mit Preisen auflisten.",
    priceLabel: "+3,90 €/Mon",
  },
  team: {
    name: "Team-Vorstellung",
    icon: "👥",
    hint: "Team-Mitglieder mit Foto und Rolle vorstellen.",
    priceLabel: "+3,90 €/Mon",
  },
  subpages: {
    name: "Unterseiten",
    icon: "📄",
    hint: "Bis zu 5 zusätzliche Seiten mit eigener Adresse und Navigation.",
    priceLabel: "+3,90 €/Mon",
  },
};

interface AddonsTabProps {
  websiteId: number;
  website: any;
  onboarding: any;
  previewToken: string;
  onUpdate: () => void;
  purchasedAddOns: Record<string, boolean>;
  businessEmail?: string | null;
  /**
   * Direktsprung in eine Betriebs-Einstellung (Phase-2-Aufräumen
   * 2026-08-31): der „Betrieb & Benachrichtigungen"-Block im
   * Einstellungen-Tab öffnet Formular/KI-Chat/Buchung ohne den Umweg
   * über die Add-on-Übersicht.
   */
  initialDetail?: DetailKey | null;
}

/** Add-ons-Tab: Kauf/Feature-Flags bleiben im Dashboard, Inhaltspflege
 * (Galerie/Speisekarte/Preisliste) wandert ins Studio (Cutover-Spec §2).
 * Betriebs-Einstellungen für Formular, KI-Chat und Buchung liegen hier. */
export function AddonsTab({
  websiteId,
  website,
  previewToken,
  onUpdate,
  purchasedAddOns,
  businessEmail,
  initialDetail = null,
}: AddonsTabProps) {
  const [activeDetail, setActiveDetail] = useState<DetailKey | null>(
    initialDetail
  );
  // Direktsprung aus dem Einstellungen-Tab auch nach dem ersten Render;
  // ein Wechsel zurück auf null (Tab-Klick) schließt das offene Detail.
  useEffect(() => {
    setActiveDetail(initialDetail);
  }, [initialDetail]);
  const [confirmAddon, setConfirmAddon] = useState<AddonKey | null>(null);

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: () => {
      setConfirmAddon(null);
      onUpdate();
      toast.success("Add-on freigeschaltet! 🎉");
    },
    onError: (err: any) => {
      toast.error("Freischalten fehlgeschlagen: " + err.message);
      setConfirmAddon(null);
    },
  });

  const contactEnabled = !!(website?.websiteData as any)?.features?.contactForm;

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-lp-accent/20 bg-lp-accent/5 px-4 py-3">
        <p className="text-sm font-medium text-lp-ink">
          Du kannst nachher alles noch bearbeiten.
        </p>
        <p className="mt-1 text-xs leading-relaxed text-lp-muted">
          Inhalte pflegst du im Studio. Empfänger, Felder und Zeiten für
          Formular, KI-Chat und Terminbuchung stellst du hier ein.
        </p>
      </div>

      {activeDetail && (
        <div className="space-y-5">
          <button
            type="button"
            onClick={() => setActiveDetail(null)}
            className="group flex items-center gap-1.5 text-sm text-lp-muted transition-colors hover:text-lp-ink"
          >
            <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            Zurück zu Add-ons
          </button>

          {activeDetail === "contactForm" && (
            <ContactFormAddonSection
              websiteId={websiteId}
              website={website}
              businessEmail={businessEmail}
              onUpdate={onUpdate}
              purchasedAddOns={purchasedAddOns}
            />
          )}
          {activeDetail === "booking" && (
            <BookingAddonSection
              websiteId={websiteId}
              website={website}
              onUpdate={onUpdate}
              purchasedAddOns={purchasedAddOns}
            />
          )}
          {activeDetail === "aiChat" && (
            <AiChatAddonSection
              websiteId={websiteId}
              website={website}
              onUpdate={onUpdate}
              purchasedAddOns={purchasedAddOns}
            />
          )}
        </div>
      )}

      {!activeDetail && (
        <div className="space-y-3">
          {CONTENT_ADDON_KEYS.map(key => {
            const meta = CONTENT_ADDON_LABELS[key];
            const purchased = !!purchasedAddOns[key];
            return (
              <div
                key={key}
                className="rounded-2xl border border-lp-line bg-lp-surface"
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lp-canvas text-lg">
                    {meta.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-lp-ink">
                        {meta.name}
                      </span>
                      <span className="rounded-full bg-lp-canvas px-1.5 py-0.5 text-xs font-medium text-lp-muted">
                        {meta.priceLabel}
                      </span>
                    </div>
                    <p className="text-xs text-lp-muted">{meta.hint}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center gap-3">
                    {purchased ? (
                      <a
                        href={studioPanelHref(
                          previewToken,
                          ADDON_EDITORS[key].panel,
                          key
                        )}
                        className="whitespace-nowrap rounded-lg border border-lp-accent/30 bg-lp-accent/10 px-3 py-1.5 text-xs font-medium text-lp-accent transition-colors hover:bg-lp-accent/15"
                      >
                        Aktiv · Im Studio bearbeiten
                      </a>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmAddon(key)}
                        className="flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-lp-line bg-lp-canvas px-3 py-1.5 text-xs font-medium text-lp-ink transition-colors hover:border-lp-accent"
                      >
                        <Lock className="h-3 w-3" />
                        Freischalten
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            className="w-full cursor-pointer text-left"
            onClick={() => setActiveDetail("contactForm")}
          >
            <div className="flex items-center gap-4 rounded-2xl border border-lp-line bg-lp-surface p-4 transition-colors hover:border-lp-accent/40">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lp-accent/10">
                <Mail className="h-5 w-5 text-lp-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-lp-ink">
                    Kontaktformular
                  </span>
                  <span className="rounded-full bg-lp-canvas px-1.5 py-0.5 text-xs font-medium text-lp-muted">
                    +3,90 €/Mon
                  </span>
                  {purchasedAddOns["contactForm"] && contactEnabled && (
                    <span className="text-xs text-lp-accent">Aktiv</span>
                  )}
                </div>
                <p className="text-xs text-lp-muted">
                  Empfänger, Felder und Texte einstellen. Anfragen landen im Tab
                  Anfragen.
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-lp-muted">
                {purchasedAddOns["contactForm"]
                  ? "Einstellungen →"
                  : "Details →"}
              </span>
            </div>
          </button>

          <button
            type="button"
            className="w-full cursor-pointer text-left"
            onClick={() => setActiveDetail("booking")}
          >
            <div className="flex items-center gap-4 rounded-2xl border border-lp-line bg-lp-surface p-4 transition-colors hover:border-lp-accent/40">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lp-accent/10">
                <CalendarDays className="h-5 w-5 text-lp-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-lp-ink">
                    Terminbuchung
                  </span>
                  <span className="rounded-full bg-lp-canvas px-1.5 py-0.5 text-xs font-medium text-lp-muted">
                    +4,90 €/Mon
                  </span>
                  {purchasedAddOns["booking"] && (
                    <span className="text-xs text-lp-accent">Aktiv</span>
                  )}
                </div>
                <p className="text-xs text-lp-muted">
                  Wochenplan, Dauer und Benachrichtigungs-E-Mail.
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-lp-muted">
                {purchasedAddOns["booking"] ? "Einstellungen →" : "Details →"}
              </span>
            </div>
          </button>

          <button
            type="button"
            className="w-full cursor-pointer text-left"
            onClick={() => setActiveDetail("aiChat")}
          >
            <div className="flex items-center gap-4 rounded-2xl border border-lp-line bg-lp-surface p-4 transition-colors hover:border-lp-accent/40">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-lp-accent/10">
                <MessageSquare className="h-5 w-5 text-lp-accent" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-0.5 flex items-center gap-2">
                  <span className="text-sm font-semibold text-lp-ink">
                    KI-Chat
                  </span>
                  <span className="rounded-full bg-lp-canvas px-1.5 py-0.5 text-xs font-medium text-lp-muted">
                    +9,90 €/Mon
                  </span>
                  {purchasedAddOns["aiChat"] && (
                    <span className="text-xs text-lp-accent">Aktiv</span>
                  )}
                </div>
                <p className="text-xs text-lp-muted">
                  Begrüßung, Extra-Wissen und Lead-Empfänger.
                </p>
              </div>
              <span className="flex-shrink-0 text-xs text-lp-muted">
                {purchasedAddOns["aiChat"] ? "Einstellungen →" : "Details →"}
              </span>
            </div>
          </button>

          {confirmAddon && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-lp-ink/50 p-4 backdrop-blur-sm">
              <div className="w-full max-w-sm rounded-2xl border border-lp-line bg-lp-surface shadow-2xl">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-lp-canvas text-lg">
                      {CONTENT_ADDON_LABELS[confirmAddon]?.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lp-ink">
                        Add-on freischalten
                      </h3>
                      <p className="text-sm font-medium text-lp-accent">
                        {CONTENT_ADDON_LABELS[confirmAddon]?.name}
                      </p>
                    </div>
                  </div>
                  <p className="mb-1 text-sm leading-relaxed text-lp-ink">
                    <span className="font-semibold">+3,90 €/Monat</span> werden
                    ab sofort anteilig deinem Abo hinzugefügt.
                  </p>
                  <p className="mb-6 text-xs leading-relaxed text-lp-muted">
                    Du kannst das Add-on jederzeit über das Kundenportal wieder
                    kündigen.
                  </p>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setConfirmAddon(null)}
                      disabled={purchaseAddonMutation.isPending}
                      className="flex-1 rounded-xl border border-lp-line py-2.5 text-sm font-medium text-lp-ink transition-colors hover:bg-lp-canvas disabled:opacity-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        purchaseAddonMutation.mutate({
                          websiteId,
                          addonKey: confirmAddon,
                        })
                      }
                      disabled={purchaseAddonMutation.isPending}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-lp-accent py-2.5 text-sm font-semibold text-white transition-colors hover:bg-lp-accent/90 disabled:opacity-50"
                    >
                      {purchaseAddonMutation.isPending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Wird gebucht…
                        </>
                      ) : (
                        "Jetzt freischalten"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

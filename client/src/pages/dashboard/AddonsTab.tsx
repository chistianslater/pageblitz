import { useState } from "react";
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
import { studioPanelHref } from "./StudioCard";

// Team gehört seit Plan B5 Task 2 zu den Inhalts-Add-ons: Kauf hier wie
// Galerie/Speisekarte/Preisliste, Pflege der Mitglieder im Studio
// ("Team pflegen"-Unterbereich im Extras-Panel, AddonsPanel.tsx).
type ContentAddonKey = "gallery" | "menu" | "pricelist" | "team";
type AddonKey = ContentAddonKey | "contactForm";

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
};

interface AddonsTabProps {
  websiteId: number;
  website: any;
  onboarding: any;
  previewToken: string;
  onUpdate: () => void;
  purchasedAddOns: Record<string, boolean>;
}

/** Add-ons-Tab: Kauf/Feature-Flags bleiben im Dashboard, Inhaltspflege
 * (Galerie/Speisekarte/Preisliste, Kontaktformular-Text) wandert ins Studio
 * (Cutover-Spec §2). Ersetzt die alte `AddonsEditor`-Komponente, die
 * Website-Inhalte direkt über `customer.updateAddons` in `websiteData`
 * geschrieben hat — dieser Pfad ist mit dem v2-Cutover entfallen. */
export function AddonsTab({
  websiteId,
  website,
  onboarding,
  previewToken,
  onUpdate,
  purchasedAddOns,
}: AddonsTabProps) {
  const [contactFormEnabled, setContactFormEnabled] = useState<boolean>(
    !!onboarding?.addOnContactForm
  );
  const [activeDetail, setActiveDetail] = useState<"booking" | "aiChat" | null>(
    null
  );
  const [confirmAddon, setConfirmAddon] = useState<AddonKey | null>(null);

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: (_data, variables) => {
      if (variables.addonKey === "contactForm") {
        setContactFormEnabled(true);
      }
      setConfirmAddon(null);
      onUpdate();
      toast.success("Add-on freigeschaltet! 🎉");
    },
    onError: (err: any) => {
      toast.error("Freischalten fehlgeschlagen: " + err.message);
      setConfirmAddon(null);
    },
  });

  const updateAddons = trpc.customer.updateAddons.useMutation({
    onSuccess: () => {
      onUpdate();
    },
    onError: () => {
      toast.error("Speichern fehlgeschlagen");
    },
  });

  const toggleContactForm = () => {
    const next = !contactFormEnabled;
    setContactFormEnabled(next);
    updateAddons.mutate({
      websiteId,
      addOns: { contactForm: next },
    });
  };

  return (
    <div className="space-y-4">
      {/* ── DETAIL VIEW ────────────────────────────────────────────────── */}
      {activeDetail && (
        <div className="space-y-5">
          <button
            onClick={() => setActiveDetail(null)}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Zurück zu Add-ons
          </button>

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

      {/* ── OVERVIEW ────────────────────────────────────────────────────── */}
      {!activeDetail && (
        <div className="space-y-3">
          {/* Inhalts-Add-ons: Kauf hier, Pflege im Studio */}
          {(
            ["gallery", "menu", "pricelist", "team"] as ContentAddonKey[]
          ).map(key => {
            const meta = CONTENT_ADDON_LABELS[key];
            const purchased = !!purchasedAddOns[key];
            return (
              <div
                key={key}
                className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${purchased ? "border-slate-600/50" : "border-slate-700/30"}`}
              >
                <div className="p-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-pink-500/20 to-rose-500/20 flex items-center justify-center flex-shrink-0 text-lg">
                    {meta.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-white font-semibold text-sm">
                        {meta.name}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-medium">
                        {meta.priceLabel}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{meta.hint}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {purchased ? (
                      <a
                        href={studioPanelHref(previewToken, "addons")}
                        className="flex items-center gap-1.5 text-xs bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap hover:bg-emerald-600/30"
                      >
                        Aktiv · Im Studio bearbeiten
                      </a>
                    ) : (
                      <button
                        onClick={() => setConfirmAddon(key)}
                        className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap"
                      >
                        <Lock className="w-3 h-3" />
                        Freischalten
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── Kontaktformular ── */}
          <div
            className={`bg-slate-800/60 rounded-2xl border transition-all duration-200 ${contactFormEnabled ? "border-slate-600/50" : "border-slate-700/30"}`}
          >
            <div className="p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <Mail className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">
                    Kontaktformular
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                    +3,90 €/Mon
                  </span>
                  {contactFormEnabled && (
                    <span className="text-xs text-emerald-400">Aktiv</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs">
                  Ermögliche Besuchern, direkt Anfragen zu senden. Anfragen
                  landest du im Tab "Anfragen".
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {!purchasedAddOns["contactForm"] ? (
                  <button
                    onClick={() => setConfirmAddon("contactForm")}
                    className="flex items-center gap-1.5 text-xs bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/40 text-blue-300 px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap"
                  >
                    <Lock className="w-3 h-3" />
                    Freischalten
                  </button>
                ) : (
                  <button
                    onClick={toggleContactForm}
                    className="relative w-11 h-6 rounded-full transition-colors flex-shrink-0"
                    style={{
                      backgroundColor: contactFormEnabled
                        ? "rgb(59 130 246)"
                        : "rgb(71 85 105)",
                    }}
                  >
                    <span
                      className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                      style={{ left: contactFormEnabled ? "22px" : "2px" }}
                    />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Terminbuchung ── */}
          <div
            className="cursor-pointer"
            onClick={() => setActiveDetail("booking")}
          >
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <CalendarDays className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">
                    Terminbuchung
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-medium">
                    +4,90 €/Mon
                  </span>
                  {purchasedAddOns["booking"] && (
                    <span className="text-xs text-emerald-400">Aktiv</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs">
                  Kunden buchen direkt auf deiner Website einen Termin.
                </p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {purchasedAddOns["booking"] ? "Einstellungen →" : "Details →"}
              </span>
            </div>
          </div>

          {/* ── KI-Chat ── */}
          <div
            className="cursor-pointer"
            onClick={() => setActiveDetail("aiChat")}
          >
            <div className="bg-slate-800/60 rounded-2xl border border-slate-700/30 hover:border-slate-600/50 transition-all duration-200 p-4 flex items-center gap-4">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-fuchsia-500/20 to-pink-500/20 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-fuchsia-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white font-semibold text-sm">
                    KI-Chat
                  </span>
                  <span className="text-xs px-1.5 py-0.5 rounded-full bg-fuchsia-500/20 text-fuchsia-300 font-medium">
                    +9,90 €/Mon
                  </span>
                  {purchasedAddOns["aiChat"] && (
                    <span className="text-xs text-emerald-400">Aktiv</span>
                  )}
                </div>
                <p className="text-slate-400 text-xs">
                  KI beantwortet Kundenfragen & erfasst Leads automatisch.
                </p>
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0">
                {purchasedAddOns["aiChat"] ? "Einstellungen →" : "Details →"}
              </span>
            </div>
          </div>

          {/* ── Purchase confirmation modal ── */}
          {confirmAddon && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl">
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">
                      {confirmAddon === "contactForm"
                        ? "✉️"
                        : CONTENT_ADDON_LABELS[confirmAddon as ContentAddonKey]
                            ?.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">
                        Add-on freischalten
                      </h3>
                      <p className="text-sm font-medium text-blue-300">
                        {confirmAddon === "contactForm"
                          ? "Kontaktformular"
                          : CONTENT_ADDON_LABELS[
                              confirmAddon as ContentAddonKey
                            ]?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm leading-relaxed mb-1">
                    <span className="text-white font-semibold">
                      +3,90 €/Monat
                    </span>{" "}
                    werden ab sofort anteilig deinem Abo hinzugefügt.
                  </p>
                  <p className="text-slate-500 text-xs leading-relaxed mb-6">
                    Du kannst das Add-on jederzeit über das Kundenportal wieder
                    kündigen.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setConfirmAddon(null)}
                      disabled={purchaseAddonMutation.isPending}
                      className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={() =>
                        purchaseAddonMutation.mutate({
                          websiteId,
                          addonKey: confirmAddon,
                        })
                      }
                      disabled={purchaseAddonMutation.isPending}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      {purchaseAddonMutation.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
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

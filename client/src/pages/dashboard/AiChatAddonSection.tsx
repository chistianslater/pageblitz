import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MessageSquare, Check, Loader2 } from "lucide-react";

interface AiChatAddonSectionProps {
  websiteId: number;
  website: any;
  onUpdate: () => void;
  purchasedAddOns: Record<string, boolean>;
}

/** KI-Chat-Add-on: Kauf + Begrüßungsnachricht — bleibt im Dashboard
 * (Cutover-Spec §2, kein Studio-Inhalt). */
export function AiChatAddonSection({
  websiteId,
  website,
  onUpdate,
  purchasedAddOns,
}: AiChatAddonSectionProps) {
  const [aiChat, setAiChat] = useState<boolean>(!!(website as any).addOnAiChat);
  const [welcomeMsg, setWelcomeMsg] = useState<string>(
    (website as any).chatWelcomeMessage || ""
  );
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const isPurchased = !!purchasedAddOns["aiChat"];

  const usageCount = (website as any).chatUsageCount ?? 0;
  const usagePct = Math.min(100, Math.round((usageCount / 200) * 100));

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: () => {
      setConfirmOpen(false);
      setSaving(false);
      setAiChat(true);
      onUpdate();
      toast.success("KI-Chat freigeschaltet!");
    },
    onError: (e: any) => {
      setSaving(false);
      toast.error("Fehler: " + e.message);
    },
  });

  const updateAddons = trpc.customer.updateAddons.useMutation({
    onSuccess: () => {
      setSaving(false);
      onUpdate();
      toast.success("KI-Chat gespeichert");
    },
    onError: () => {
      setSaving(false);
      toast.error("Speichern fehlgeschlagen");
    },
  });

  const handleToggle = () => {
    if (!isPurchased) {
      setConfirmOpen(true);
      return;
    }
    const newVal = !aiChat;
    setAiChat(newVal);
    setSaving(true);
    // Auto-save toggle immediately so it persists on page reload
    updateAddons.mutate({
      websiteId,
      addOns: {
        aiChat: newVal,
        chatWelcomeMessage: welcomeMsg.trim() || undefined,
      },
    });
  };

  const handleSave = () => {
    setSaving(true);
    updateAddons.mutate({
      websiteId,
      addOns: {
        aiChat,
        chatWelcomeMessage: welcomeMsg.trim() || undefined,
      },
    });
  };

  return (
    <>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <MessageSquare className="w-4 h-4 text-violet-400" />
          KI-Chat Add-on
          <span className="ml-auto text-xs bg-violet-600/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full">
            +9,90 €/Monat
          </span>
        </h2>

        {!isPurchased ? (
          <div className="space-y-4">
            <div className="text-slate-400 text-xs space-y-1.5">
              {[
                "KI beantwortet Kundenfragen automatisch rund um die Uhr",
                "Lead-Erfassung: Name + Kontakt werden direkt gespeichert",
                "Proaktive Ansprache nach 8 Sekunden auf der Website",
                "200 Gespräche/Monat inklusive",
              ].map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="text-violet-400 mt-0.5">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
            >
              Für 9,90 €/Monat freischalten
            </button>
          </div>
        ) : (
          <>
            <div
              className={`rounded-xl p-4 border transition-all mb-4 ${aiChat ? "border-violet-500/40 bg-violet-500/10" : "border-slate-700/50 bg-slate-900/30"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-white text-sm font-medium">
                    KI-Chat aktivieren
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    Chat-Widget erscheint auf deiner Website
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors ${aiChat ? "bg-violet-500" : "bg-slate-600"}`}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: aiChat ? "22px" : "2px" }}
                  />
                </button>
              </div>
              {aiChat && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Gespräche diesen Monat</span>
                    <span
                      className={
                        usagePct >= 80 ? "text-orange-400" : "text-slate-400"
                      }
                    >
                      {usageCount} / 200
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${usagePct >= 80 ? "bg-orange-400" : "bg-violet-500"}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {aiChat && (
              <div className="mb-5">
                <label className="text-slate-300 text-sm font-medium block mb-1.5">
                  Begrüßungsnachricht{" "}
                  <span className="text-slate-500 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  value={welcomeMsg}
                  onChange={e => setWelcomeMsg(e.target.value)}
                  placeholder="Hallo! Ich bin der Assistent – wie kann ich dir helfen?"
                  maxLength={256}
                  className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
                />
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              KI-Chat speichern
            </button>
          </>
        )}
      </div>

      {/* Kauf-Bestätigung Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 flex items-center justify-center text-lg flex-shrink-0">
                💬
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Add-on freischalten
                </h3>
                <p className="text-violet-400 text-sm font-medium">KI-Chat</p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-1">
              <span className="text-white font-semibold">+9,90 €/Monat</span>{" "}
              werden ab sofort anteilig deinem Abo hinzugefügt.
            </p>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Du kannst das Add-on jederzeit über das Kundenportal wieder
              kündigen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:text-white hover:border-slate-500 text-sm font-medium transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  setSaving(true);
                  purchaseAddonMutation.mutate({
                    websiteId,
                    addonKey: "aiChat",
                  });
                }}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
              >
                {purchaseAddonMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Wird gebucht…
                  </>
                ) : (
                  "Jetzt freischalten"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

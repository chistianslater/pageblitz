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
  const chatConfig = ((website as any).websiteData?.chatConfig ?? {}) as {
    extraKnowledge?: string;
    notificationEmail?: string;
  };
  const [extraKnowledge, setExtraKnowledge] = useState(
    chatConfig.extraKnowledge ?? ""
  );
  const [notifyEmail, setNotifyEmail] = useState(
    chatConfig.notificationEmail ?? ""
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
    onError: () => {
      setSaving(false);
      toast.error("Speichern fehlgeschlagen");
    },
  });
  const updateChatConfig = trpc.customer.updateChatConfig.useMutation({
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
    updateAddons.mutate(
      {
        websiteId,
        addOns: {
          aiChat: newVal,
          chatWelcomeMessage: welcomeMsg.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          setSaving(false);
          onUpdate();
        },
      }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await Promise.all([
        updateAddons.mutateAsync({
          websiteId,
          addOns: {
            aiChat,
            chatWelcomeMessage: welcomeMsg.trim() || undefined,
          },
        }),
        updateChatConfig.mutateAsync({
          websiteId,
          config: {
            extraKnowledge: extraKnowledge.trim() || undefined,
            notificationEmail: notifyEmail.trim() || undefined,
          },
        }),
      ]);
      onUpdate();
      toast.success("KI-Chat gespeichert");
    } catch {
      toast.error("Speichern fehlgeschlagen");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-lp-surface border border-lp-line rounded-2xl p-5">
        <h2 className="text-lp-ink font-semibold flex items-center gap-2 mb-5">
          <MessageSquare className="w-4 h-4 text-lp-accent" />
          KI-Chat Add-on
          <span className="ml-auto text-xs bg-lp-accent/10 text-lp-accent border border-lp-accent/30 px-2 py-0.5 rounded-full">
            +9,90 €/Monat
          </span>
        </h2>

        {!isPurchased ? (
          <div className="space-y-4">
            <div className="text-lp-muted text-xs space-y-1.5">
              {[
                "KI beantwortet Kundenfragen automatisch rund um die Uhr",
                "Lead-Erfassung: Name + Kontakt werden direkt gespeichert",
                "Proaktive Ansprache nach 8 Sekunden auf der Website",
                "200 Gespräche/Monat inklusive",
              ].map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="text-lp-accent mt-0.5">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-lp-accent hover:bg-lp-accent/90 text-white text-sm font-semibold transition-colors"
            >
              Für 9,90 €/Monat freischalten
            </button>
          </div>
        ) : (
          <>
            <div
              className={`rounded-xl p-4 border transition-all mb-4 ${aiChat ? "border-lp-accent/40 bg-lp-accent/10" : "border-lp-line bg-lp-canvas"}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-lp-ink text-sm font-medium">
                    KI-Chat aktivieren
                  </div>
                  <div className="text-lp-muted text-xs mt-0.5">
                    Chat-Widget erscheint auf deiner Website
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  className={`relative w-11 h-6 rounded-full transition-colors ${aiChat ? "bg-lp-accent" : "bg-lp-line"}`}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: aiChat ? "22px" : "2px" }}
                  />
                </button>
              </div>
              {aiChat && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-lp-muted mb-1">
                    <span>Gespräche diesen Monat</span>
                    <span
                      className={
                        usagePct >= 80 ? "text-orange-400" : "text-lp-muted"
                      }
                    >
                      {usageCount} / 200
                    </span>
                  </div>
                  <div className="w-full bg-lp-canvas rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all ${usagePct >= 80 ? "bg-orange-400" : "bg-lp-accent"}`}
                      style={{ width: `${usagePct}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            {aiChat && (
              <>
                <div className="mb-5">
                  <label className="text-lp-ink/80 text-sm font-medium block mb-1.5">
                    Begrüßungsnachricht{" "}
                    <span className="text-lp-muted font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="text"
                    value={welcomeMsg}
                    onChange={e => setWelcomeMsg(e.target.value)}
                    placeholder="Hallo! Ich bin der Assistent – wie kann ich dir helfen?"
                    maxLength={256}
                    className="w-full bg-lp-canvas border border-lp-line rounded-lg px-3 py-2 text-sm text-lp-ink placeholder:text-lp-muted focus:outline-none focus:border-lp-accent"
                  />
                </div>
                <div className="mb-5">
                  <label className="text-lp-ink/80 text-sm font-medium block mb-1.5">
                    Extra-Wissen{" "}
                    <span className="text-lp-muted font-normal">
                      (optional)
                    </span>
                  </label>
                  <textarea
                    value={extraKnowledge}
                    onChange={e => setExtraKnowledge(e.target.value)}
                    placeholder="z. B. Parken hinter dem Haus, dienstags geschlossen, nur mit Termin…"
                    maxLength={2000}
                    rows={4}
                    className="w-full bg-lp-canvas border border-lp-line rounded-lg px-3 py-2 text-sm text-lp-ink placeholder:text-lp-muted focus:outline-none focus:border-lp-accent resize-none"
                  />
                  <p className="mt-1 text-xs text-lp-muted">
                    Der Chat nutzt das intern, um Fragen genauer zu beantworten.
                  </p>
                </div>
                <div className="mb-5">
                  <label className="text-lp-ink/80 text-sm font-medium block mb-1.5">
                    Lead-Empfänger{" "}
                    <span className="text-lp-muted font-normal">
                      (optional)
                    </span>
                  </label>
                  <input
                    type="email"
                    value={notifyEmail}
                    onChange={e => setNotifyEmail(e.target.value)}
                    placeholder="leads@beispiel.de"
                    maxLength={320}
                    className="w-full bg-lp-canvas border border-lp-line rounded-lg px-3 py-2 text-sm text-lp-ink placeholder:text-lp-muted focus:outline-none focus:border-lp-accent"
                  />
                  <p className="mt-1 text-xs text-lp-muted">
                    Leer = Kontakt-E-Mail, sonst die E-Mail deines Accounts.
                  </p>
                </div>
              </>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-lp-accent hover:bg-lp-accent/90 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-lp-ink/50 backdrop-blur-sm">
          <div className="bg-lp-surface border border-lp-line rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-lp-accent/10 flex items-center justify-center text-lg flex-shrink-0">
                💬
              </div>
              <div>
                <h3 className="text-lp-ink font-semibold">
                  Add-on freischalten
                </h3>
                <p className="text-lp-accent text-sm font-medium">KI-Chat</p>
              </div>
            </div>
            <p className="text-lp-ink/80 text-sm leading-relaxed mb-1">
              <span className="text-lp-ink font-semibold">+9,90 €/Monat</span>{" "}
              werden ab sofort anteilig deinem Abo hinzugefügt.
            </p>
            <p className="text-lp-muted text-xs leading-relaxed mb-6">
              Du kannst das Add-on jederzeit über das Kundenportal wieder
              kündigen.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl border border-lp-line text-lp-ink/80 hover:text-lp-ink hover:border-lp-ink/40 text-sm font-medium transition-colors disabled:opacity-50"
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
                className="flex-1 py-2.5 rounded-xl bg-lp-accent hover:bg-lp-accent/90 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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

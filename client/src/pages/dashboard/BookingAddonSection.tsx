import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { CalendarDays, Settings, Check, Loader2 } from "lucide-react";

const DAY_LABELS: Record<string, string> = {
  mon: "Mo",
  tue: "Di",
  wed: "Mi",
  thu: "Do",
  fri: "Fr",
  sat: "Sa",
  sun: "So",
};
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const DEFAULT_SCHEDULE = {
  mon: { enabled: true, start: "09:00", end: "17:00" },
  tue: { enabled: true, start: "09:00", end: "17:00" },
  wed: { enabled: true, start: "09:00", end: "17:00" },
  thu: { enabled: true, start: "09:00", end: "17:00" },
  fri: { enabled: true, start: "09:00", end: "17:00" },
  sat: { enabled: false, start: "09:00", end: "12:00" },
  sun: { enabled: false, start: "09:00", end: "12:00" },
};

interface BookingAddonSectionProps {
  websiteId: number;
  website: any;
  onUpdate: () => void;
  purchasedAddOns: Record<string, boolean>;
}

/** Buchungs-Add-on: Kauf + Wochenplan/Zeit-Einstellungen — bleibt im
 * Dashboard (Cutover-Spec §2: "Buchung/Termine" ist kein Studio-Inhalt). */
export function BookingAddonSection({
  websiteId,
  website,
  onUpdate,
  purchasedAddOns,
}: BookingAddonSectionProps) {
  const [enabled, setEnabled] = useState<boolean>(
    !!(website as any).addOnBooking
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const isPurchased = !!purchasedAddOns["booking"];

  // Settings form state
  const [schedule, setSchedule] =
    useState<Record<string, { enabled: boolean; start: string; end: string }>>(
      DEFAULT_SCHEDULE
    );
  const [duration, setDuration] = useState(30);
  const [buffer, setBuffer] = useState(0);
  const [advance, setAdvance] = useState(30);
  const [bookingTitle, setBookingTitle] = useState("Terminbuchung");
  const [bookingDescription, setBookingDescription] = useState("");
  const [notifEmail, setNotifEmail] = useState("");

  const purchaseAddonMutation = trpc.customer.purchaseAddon.useMutation({
    onSuccess: () => {
      setConfirmOpen(false);
      setSaving(false);
      setEnabled(true);
      onUpdate();
      toast.success("Terminbuchung freigeschaltet!");
    },
    onError: (e: any) => {
      setSaving(false);
      toast.error("Fehler: " + e.message);
    },
  });

  const saveSettingsMutation = trpc.customer.saveBookingSettings.useMutation({
    onSuccess: () => {
      setSaving(false);
      onUpdate();
      toast.success("Terminbuchung gespeichert");
    },
    onError: () => {
      setSaving(false);
      toast.error("Speichern fehlgeschlagen");
    },
  });

  const { data: bookingData } = trpc.customer.getBookingSettings.useQuery({
    websiteId,
  });

  // Populate settings form from fetched data
  useEffect(() => {
    if (bookingData?.settings) {
      const s = bookingData.settings;
      if (s.weeklySchedule) setSchedule(s.weeklySchedule as any);
      if (s.durationMinutes != null) setDuration(s.durationMinutes);
      if (s.bufferMinutes != null) setBuffer(s.bufferMinutes);
      if (s.advanceDays != null) setAdvance(s.advanceDays);
      if (s.title) setBookingTitle(s.title);
      if (s.description != null) setBookingDescription(s.description ?? "");
      if (s.notificationEmail != null) setNotifEmail(s.notificationEmail ?? "");
    }
  }, [bookingData]);

  const handleToggle = () => {
    if (!isPurchased) {
      setConfirmOpen(true);
      return;
    }
    const newVal = !enabled;
    setEnabled(newVal);
    setSaving(true);
    saveSettingsMutation.mutate({
      websiteId,
      enabled: newVal,
      weeklySchedule: schedule as any,
      durationMinutes: duration,
      bufferMinutes: buffer,
      advanceDays: advance,
      title: bookingTitle,
      description: bookingDescription || undefined,
      notificationEmail: notifEmail || null,
    });
  };

  const handleSaveSettings = () => {
    setSaving(true);
    saveSettingsMutation.mutate({
      websiteId,
      enabled,
      weeklySchedule: schedule as any,
      durationMinutes: duration,
      bufferMinutes: buffer,
      advanceDays: advance,
      title: bookingTitle,
      description: bookingDescription || undefined,
      notificationEmail: notifEmail || null,
    });
  };

  return (
    <>
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-2xl p-5">
        <h2 className="text-white font-semibold flex items-center gap-2 mb-5">
          <CalendarDays className="w-4 h-4 text-blue-400" />
          Terminbuchung
          <span className="ml-auto text-xs bg-blue-600/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded-full">
            +4,90 €/Monat
          </span>
        </h2>

        {!isPurchased ? (
          <div className="space-y-4">
            <div className="text-slate-400 text-xs space-y-1.5">
              {[
                "Eigenes Buchungssystem – kein externer Account nötig",
                "Wochenplan mit Uhrzeiten frei konfigurierbar",
                "Automatische Bestätigungs-E-Mails an Kunden",
                "Terminübersicht und Absagen im Dashboard",
              ].map(f => (
                <div key={f} className="flex items-start gap-2">
                  <span className="text-blue-400 mt-0.5">✓</span>
                  <span>{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setConfirmOpen(true)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors"
            >
              Für 4,90 €/Monat freischalten
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              className={`rounded-xl p-4 border transition-all ${enabled ? "border-blue-500/40 bg-blue-500/10" : "border-slate-700/50 bg-slate-900/30"}`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-white text-sm font-medium">
                    Terminbuchung aktivieren
                  </div>
                  <div className="text-slate-400 text-xs mt-0.5">
                    Besucher können direkt auf deiner Website Termine buchen
                  </div>
                </div>
                <button
                  onClick={handleToggle}
                  disabled={saving}
                  className={`relative w-11 h-6 rounded-full transition-colors disabled:opacity-60 ${enabled ? "bg-blue-500" : "bg-slate-600"}`}
                >
                  <span
                    className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all"
                    style={{ left: enabled ? "22px" : "2px" }}
                  />
                </button>
              </div>
              {enabled && (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Aktiviert</span>
                </div>
              )}
            </div>

            {/* Inline settings form — shown when purchased & enabled */}
            {enabled && (
              <div className="space-y-5 pt-1">
                {/* Allgemein */}
                <div className="space-y-3">
                  <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-slate-400" />
                    Allgemein
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-1">
                        Titel
                      </label>
                      <input
                        type="text"
                        value={bookingTitle}
                        onChange={e => setBookingTitle(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                        placeholder="Terminbuchung"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-1">
                        Benachrichtigungs-E-Mail
                      </label>
                      <input
                        type="email"
                        value={notifEmail}
                        onChange={e => setNotifEmail(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                        placeholder="du@beispiel.de"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-slate-400 text-xs font-medium block mb-1">
                      Beschreibung (optional)
                    </label>
                    <textarea
                      value={bookingDescription}
                      onChange={e => setBookingDescription(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors resize-none placeholder-slate-500"
                      placeholder="Kurze Beschreibung für deine Kunden…"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-1">
                        Dauer (Min.)
                      </label>
                      <select
                        value={duration}
                        onChange={e => setDuration(Number(e.target.value))}
                        className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                      >
                        {[15, 20, 30, 45, 60, 90, 120].map(v => (
                          <option key={v} value={v}>
                            {v} Min.
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-1">
                        Puffer (Min.)
                      </label>
                      <select
                        value={buffer}
                        onChange={e => setBuffer(Number(e.target.value))}
                        className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                      >
                        {[0, 5, 10, 15, 20, 30].map(v => (
                          <option key={v} value={v}>
                            {v} Min.
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-slate-400 text-xs font-medium block mb-1">
                        Vorlauf (Tage)
                      </label>
                      <select
                        value={advance}
                        onChange={e => setAdvance(Number(e.target.value))}
                        className="w-full bg-slate-900/60 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-blue-500 transition-colors"
                      >
                        {[7, 14, 21, 30, 60, 90].map(v => (
                          <option key={v} value={v}>
                            {v} Tage
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Wochenplan */}
                <div className="space-y-3">
                  <h3 className="text-white text-sm font-semibold flex items-center gap-2">
                    <CalendarDays className="w-3.5 h-3.5 text-slate-400" />
                    Verfügbarkeit
                  </h3>
                  <div className="space-y-2">
                    {DAY_ORDER.map(day => {
                      const slot = schedule[day] ?? {
                        enabled: false,
                        start: "09:00",
                        end: "17:00",
                      };
                      return (
                        <div
                          key={day}
                          className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${slot.enabled ? "border-blue-500/30 bg-blue-500/5" : "border-slate-700/40 bg-slate-900/30 opacity-60"}`}
                        >
                          <button
                            onClick={() =>
                              setSchedule(prev => ({
                                ...prev,
                                [day]: { ...slot, enabled: !slot.enabled },
                              }))
                            }
                            className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${slot.enabled ? "bg-blue-500" : "bg-slate-600"}`}
                          >
                            <span
                              className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all"
                              style={{ left: slot.enabled ? "18px" : "2px" }}
                            />
                          </button>
                          <span className="text-slate-300 text-xs font-medium w-6 flex-shrink-0">
                            {DAY_LABELS[day]}
                          </span>
                          {slot.enabled ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input
                                type="time"
                                value={slot.start}
                                onChange={e =>
                                  setSchedule(prev => ({
                                    ...prev,
                                    [day]: { ...slot, start: e.target.value },
                                  }))
                                }
                                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-blue-500 transition-colors"
                              />
                              <span className="text-slate-500 text-xs">–</span>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={e =>
                                  setSchedule(prev => ({
                                    ...prev,
                                    [day]: { ...slot, end: e.target.value },
                                  }))
                                }
                                className="bg-slate-800 border border-slate-600 rounded-lg px-2 py-1 text-white text-xs outline-none focus:border-blue-500 transition-colors"
                              />
                            </div>
                          ) : (
                            <span className="text-slate-500 text-xs flex-1">
                              Nicht verfügbar
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={handleSaveSettings}
                  disabled={saving || saveSettingsMutation.isPending}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {saving || saveSettingsMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Speichern…
                    </>
                  ) : (
                    "Einstellungen speichern"
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Kauf-Bestätigung Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-lg flex-shrink-0">
                📅
              </div>
              <div>
                <h3 className="text-white font-semibold">
                  Add-on freischalten
                </h3>
                <p className="text-blue-400 text-sm font-medium">
                  Terminbuchung
                </p>
              </div>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-1">
              <span className="text-white font-semibold">+4,90 €/Monat</span>{" "}
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
                    addonKey: "booking",
                  });
                }}
                disabled={purchaseAddonMutation.isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2"
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

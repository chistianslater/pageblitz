import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, ChevronLeft, ChevronRight, X, Check, Loader2, CalendarCheck } from "lucide-react";

interface DaySchedule { enabled: boolean; start: string; end: string; }
interface WeeklySchedule { mon: DaySchedule; tue: DaySchedule; wed: DaySchedule; thu: DaySchedule; fri: DaySchedule; sat: DaySchedule; sun: DaySchedule; }

interface BookingSettings {
  title: string;
  description: string | null;
  durationMinutes: number;
  advanceDays: number;
  schedule: WeeklySchedule;
}

interface BookingWidgetProps {
  slug: string;
  primaryColor?: string;
  onClose?: () => void;
  inline?: boolean; // render inline instead of as modal
}

type Step = "calendar" | "slots" | "form" | "success";

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;
const DAY_LABELS_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTH_LABELS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];

function dateToYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function formatDateDE(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long" });
}

function lightenHex(hex: string, amount = 0.9): string {
  const c = hex.replace("#", "");
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  return `#${Math.round(r + (255-r)*amount).toString(16).padStart(2,"0")}${Math.round(g + (255-g)*amount).toString(16).padStart(2,"0")}${Math.round(b + (255-b)*amount).toString(16).padStart(2,"0")}`;
}

export default function BookingWidget({ slug, primaryColor = "#2563eb", onClose, inline = false }: BookingWidgetProps) {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [step, setStep] = useState<Step>("calendar");
  const [calYear, setCalYear] = useState(() => new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(() => new Date().getMonth());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isLight = parseInt(primaryColor.replace("#","").slice(0,2),16) > 180;
  const textOnPrimary = isLight ? "#1e293b" : "#ffffff";
  const bgLight = lightenHex(primaryColor, 0.93);

  // Load settings
  useEffect(() => {
    fetch(`/api/booking/${slug}/settings`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data) setSettings(data); })
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, [slug]);

  // Build calendar: which dates are available?
  const getAvailableDates = useCallback((): Set<number> => {
    if (!settings) return new Set();
    const today = new Date(); today.setHours(0,0,0,0);
    const maxDate = new Date(today); maxDate.setDate(maxDate.getDate() + settings.advanceDays);
    const available = new Set<number>();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calYear, calMonth, d);
      if (date < today || date > maxDate) continue;
      const dayKey = DAY_KEYS[date.getDay()];
      if (settings.schedule[dayKey]?.enabled) available.add(d);
    }
    return available;
  }, [settings, calYear, calMonth]);

  const availableDates = getAvailableDates();

  // Load slots when date selected
  const selectDate = useCallback(async (dateStr: string) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setLoadingSlots(true);
    setStep("slots");
    try {
      const r = await fetch(`/api/booking/${slug}/slots?date=${dateStr}`);
      const data = await r.json();
      setSlots(data.slots ?? []);
    } catch {
      setSlots([]);
    } finally {
      setLoadingSlots(false);
    }
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate || !selectedSlot || !name || !email) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const r = await fetch(`/api/booking/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message, date: selectedDate, time: selectedSlot }),
      });
      const data = await r.json();
      if (!r.ok) {
        setSubmitError(data.message || "Fehler beim Buchen. Bitte versuche einen anderen Zeitslot.");
        if (data.error === "slot_taken") {
          // Reload slots
          const r2 = await fetch(`/api/booking/${slug}/slots?date=${selectedDate}`);
          const d2 = await r2.json();
          setSlots(d2.slots ?? []);
          setSelectedSlot(null);
          setStep("slots");
        }
        return;
      }
      setStep("success");
    } catch {
      setSubmitError("Verbindungsfehler. Bitte versuche es erneut.");
    } finally {
      setSubmitting(false);
    }
  };

  const prevMonth = () => { if (calMonth === 0) { setCalMonth(11); setCalYear(y => y-1); } else setCalMonth(m => m-1); };
  const nextMonth = () => { if (calMonth === 11) { setCalMonth(0); setCalYear(y => y+1); } else setCalMonth(m => m+1); };

  // First day of month offset
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date(); today.setHours(0,0,0,0);

  const wrapper = inline
    ? "w-full"
    : "fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 p-4";

  const card = inline
    ? "w-full"
    : "bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90dvh] overflow-y-auto";

  if (loadingSettings) {
    return (
      <motion.div className={wrapper} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
        <motion.div className={`${card} flex items-center justify-center h-48`}
          initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}>
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: primaryColor }} />
        </motion.div>
      </motion.div>
    );
  }

  if (!settings) return null;

  return (
    <motion.div
      className={wrapper}
      onClick={inline ? undefined : (e) => e.target === e.currentTarget && onClose?.()}
      initial={inline ? false : { opacity: 0 }}
      animate={inline ? false : { opacity: 1 }}
      exit={inline ? undefined : { opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={card}
        initial={inline ? false : { opacity: 0, scale: 0.96, y: 20 }}
        animate={inline ? false : { opacity: 1, scale: 1, y: 0 }}
        exit={inline ? undefined : { opacity: 0, scale: 0.96, y: 20 }}
        transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100" style={{ backgroundColor: primaryColor }}>
          <div>
            <h2 className="font-semibold text-base" style={{ color: textOnPrimary }}>{settings.title}</h2>
            {settings.description && <p className="text-xs mt-0.5 opacity-80" style={{ color: textOnPrimary }}>{settings.description}</p>}
          </div>
          {onClose && (
            <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity" style={{ color: textOnPrimary }}>
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Steps indicator */}
        {step !== "success" && (
          <div className="flex items-center gap-1 px-5 py-3 border-b border-gray-100">
            {[
              { id: "calendar", label: "Datum" },
              { id: "slots", label: "Uhrzeit" },
              { id: "form", label: "Daten" },
            ].map((s, i) => {
              const stepIndex = ["calendar","slots","form"].indexOf(step);
              const isActive = s.id === step;
              const isDone = ["calendar","slots","form"].indexOf(s.id) < stepIndex;
              return (
                <div key={s.id} className="flex items-center gap-1">
                  {i > 0 && <div className="w-4 h-px bg-gray-200" />}
                  <button
                    disabled={!isDone}
                    onClick={() => isDone && setStep(s.id as Step)}
                    className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full transition-colors ${
                      isActive ? "text-white" : isDone ? "text-gray-500 hover:text-gray-700 cursor-pointer" : "text-gray-300 cursor-default"
                    }`}
                    style={isActive ? { backgroundColor: primaryColor } : {}}
                  >
                    {isDone ? <Check className="w-3 h-3" /> : <span className="w-3.5 h-3.5 rounded-full border border-current flex items-center justify-center text-[10px]">{i+1}</span>}
                    {s.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="p-5">
          {/* STEP 1: Calendar */}
          {step === "calendar" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors" disabled={calYear === today.getFullYear() && calMonth <= today.getMonth()}>
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <span className="font-medium text-gray-800">{MONTH_LABELS[calMonth]} {calYear}</span>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>

              {/* Weekday labels */}
              <div className="grid grid-cols-7 mb-1">
                {DAY_LABELS_SHORT.map(d => (
                  <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
                ))}
              </div>

              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: firstDay }, (_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const date = new Date(calYear, calMonth, day);
                  const ymd = dateToYMD(date);
                  const isAvail = availableDates.has(day);
                  const isSelected = selectedDate === ymd;
                  const isPast = date < today;
                  return (
                    <button
                      key={day}
                      disabled={!isAvail || isPast}
                      onClick={() => selectDate(ymd)}
                      className={`aspect-square rounded-lg text-sm font-medium transition-all flex items-center justify-center ${
                        isSelected ? "text-white shadow-md scale-105" :
                        isAvail ? "hover:text-white hover:scale-105 text-gray-700" :
                        "text-gray-300 cursor-default"
                      }`}
                      style={isSelected ? { backgroundColor: primaryColor } : isAvail ? { backgroundColor: bgLight } : {}}
                      onMouseEnter={isAvail && !isSelected ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = primaryColor; (e.currentTarget as HTMLElement).style.color = textOnPrimary; } : undefined}
                      onMouseLeave={isAvail && !isSelected ? (e) => { (e.currentTarget as HTMLElement).style.backgroundColor = bgLight; (e.currentTarget as HTMLElement).style.color = "#374151"; } : undefined}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              <p className="text-xs text-gray-400 mt-3 text-center">
                Termine buchbar für {settings.advanceDays} Tage im Voraus · {settings.durationMinutes} Min.
              </p>
            </div>
          )}

          {/* STEP 2: Slots */}
          {step === "slots" && (
            <div>
              <button onClick={() => setStep("calendar")} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-4 transition-colors">
                <ChevronLeft className="w-4 h-4" />
                {selectedDate ? formatDateDE(selectedDate) : "Zurück"}
              </button>

              {loadingSlots ? (
                <div className="flex items-center justify-center h-24">
                  <Loader2 className="w-5 h-5 animate-spin" style={{ color: primaryColor }} />
                </div>
              ) : slots.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Keine freien Termine an diesem Tag.</p>
                  <button onClick={() => setStep("calendar")} className="mt-3 text-sm underline" style={{ color: primaryColor }}>Anderen Tag wählen</button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-3 gap-2">
                    {slots.map(slot => (
                      <button
                        key={slot}
                        onClick={() => { setSelectedSlot(slot); setStep("form"); }}
                        className={`py-2.5 rounded-xl text-sm font-medium border-2 transition-all hover:scale-105 ${
                          selectedSlot === slot ? "text-white border-transparent shadow-md" : "border-gray-200 text-gray-700 hover:border-transparent hover:text-white"
                        }`}
                        style={selectedSlot === slot ? { backgroundColor: primaryColor, borderColor: primaryColor } : {}}
                        onMouseEnter={(e) => { if (selectedSlot !== slot) { (e.currentTarget as HTMLElement).style.backgroundColor = primaryColor; (e.currentTarget as HTMLElement).style.color = textOnPrimary; } }}
                        onMouseLeave={(e) => { if (selectedSlot !== slot) { (e.currentTarget as HTMLElement).style.backgroundColor = ""; (e.currentTarget as HTMLElement).style.color = ""; } }}
                      >
                        {slot} Uhr
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-3 text-center">{slots.length} freie Termine</p>
                </>
              )}
            </div>
          )}

          {/* STEP 3: Form */}
          {step === "form" && (
            <form onSubmit={handleSubmit}>
              {selectedDate && selectedSlot && (
                <div className="flex items-center gap-3 p-3 rounded-xl mb-4" style={{ backgroundColor: bgLight }}>
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: primaryColor }}>
                    <CalendarCheck className="w-5 h-5" style={{ color: textOnPrimary }} />
                  </div>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{formatDateDE(selectedDate)}</div>
                    <div className="text-gray-500 text-xs">{selectedSlot} Uhr · {settings.durationMinutes} Min.</div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Name *</label>
                  <input required value={name} onChange={e => setName(e.target.value)} placeholder="Max Mustermann" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">E-Mail *</label>
                  <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="max@beispiel.de" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Telefon <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="0171 1234567" className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600 block mb-1">Anmerkung <span className="text-gray-400 font-normal">(optional)</span></label>
                  <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="z.B. besondere Wünsche..." rows={2} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none focus:border-blue-400 transition-colors resize-none" />
                </div>
              </div>

              {/* DSGVO-Einwilligung */}
              <label className="flex items-start gap-2.5 mt-4 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={consentGiven}
                    onChange={e => setConsentGiven(e.target.checked)}
                    className="sr-only"
                  />
                  <div
                    className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: consentGiven ? primaryColor : "transparent",
                      borderColor: consentGiven ? primaryColor : "#d1d5db",
                    }}
                  >
                    {consentGiven && <Check className="w-2.5 h-2.5" style={{ color: textOnPrimary }} />}
                  </div>
                </div>
                <span className="text-xs text-gray-500 leading-relaxed">
                  Ich stimme zu, dass meine Angaben zur Bearbeitung meiner Terminanfrage gespeichert und genutzt werden. Weitere Infos in der{" "}
                  <a href="/datenschutz" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-700 transition-colors">Datenschutzerklärung</a>.
                </span>
              </label>

              {submitError && (
                <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">{submitError}</div>
              )}

              <button
                type="submit"
                disabled={submitting || !name || !email || !consentGiven}
                className="mt-4 w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 hover:opacity-90"
                style={{ backgroundColor: primaryColor, color: textOnPrimary }}
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                Termin verbindlich buchen
              </button>
              <p className="text-xs text-gray-400 text-center mt-2">Du erhältst eine Bestätigung per E-Mail</p>
            </form>
          )}

          {/* STEP 4: Success */}
          {step === "success" && (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: bgLight }}>
                <CalendarCheck className="w-8 h-8" style={{ color: primaryColor }} />
              </div>
              <h3 className="font-bold text-gray-800 text-lg mb-2">Termin bestätigt! 🎉</h3>
              <p className="text-gray-500 text-sm mb-1">
                {selectedDate && formatDateDE(selectedDate)}{selectedSlot && ` um ${selectedSlot} Uhr`}
              </p>
              <p className="text-gray-400 text-xs">Eine Bestätigung wurde an <strong>{email}</strong> gesendet.</p>
              {onClose && (
                <button onClick={onClose} className="mt-5 px-5 py-2 rounded-xl text-sm font-medium transition-colors" style={{ backgroundColor: primaryColor, color: textOnPrimary }}>
                  Schließen
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

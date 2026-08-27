import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  Loader2,
  CalendarCheck,
  CalendarDays,
  Calendar,
  CalendarX,
  Mail,
  Phone,
  ChevronDown,
} from "lucide-react";

interface AppointmentsTabProps {
  websiteId: number;
  onGoToAddons: () => void;
}

/** Terminübersicht des Buchungs-Add-ons — unabhängig vom Studio, bleibt
 * vollständig im Dashboard (Cutover-Spec §2). */
export function AppointmentsTab({
  websiteId,
  onGoToAddons,
}: AppointmentsTabProps) {
  const { data: bookingData, isLoading: bookingLoading } =
    trpc.customer.getBookingSettings.useQuery({ websiteId });
  const {
    data: appointmentsData,
    isLoading: appointmentsLoading,
    refetch: refetchAppointments,
  } = trpc.customer.getAppointments.useQuery({ websiteId, upcoming: true });
  const cancelMutation = trpc.customer.cancelAppointmentByOwner.useMutation({
    onSuccess: () => {
      toast.success("Termin abgesagt – E-Mail wurde versendet");
      refetchAppointments();
      setCancelConfirmId(null);
      setCancelMessage("");
    },
    onError: () => toast.error("Fehler beim Absagen"),
  });

  const [cancelConfirmId, setCancelConfirmId] = useState<number | null>(null);
  const [cancelMessage, setCancelMessage] = useState("");
  const [showPast, setShowPast] = useState(false);
  const { data: pastData, refetch: refetchPast } =
    trpc.customer.getAppointments.useQuery(
      { websiteId, upcoming: false },
      { enabled: showPast }
    );

  if (bookingLoading)
    return (
      <div className="flex items-center justify-center h-40">
        <Loader2 className="w-6 h-6 animate-spin text-lp-accent" />
      </div>
    );

  const enabled = bookingData?.addOnBooking ?? false;
  const appts = appointmentsData?.appointments ?? [];
  const pastAppts = pastData?.appointments ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-lp-ink text-lg font-semibold flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-lp-accent" />
          Termine
          {appts.length > 0 && (
            <span className="bg-lp-accent text-lp-ink text-xs font-bold px-2 py-0.5 rounded-full">
              {appts.length}
            </span>
          )}
        </h2>
        <p className="text-lp-muted text-sm mt-0.5">
          Eingehende Buchungen von deiner Website.
        </p>
      </div>

      {!enabled ? (
        <div className="bg-lp-surface border border-lp-line rounded-2xl p-10 text-center">
          <CalendarDays className="w-10 h-10 text-lp-muted mx-auto mb-3" />
          <p className="text-lp-ink font-medium mb-1">
            Terminbuchung nicht aktiv
          </p>
          <p className="text-lp-muted text-sm mb-4">
            Aktiviere das Add-on, um Buchungen entgegenzunehmen.
          </p>
          <button
            onClick={onGoToAddons}
            className="text-sm font-medium text-lp-accent hover:text-lp-accent transition-colors"
          >
            → Zu den Add-ons
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lp-ink font-semibold flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-lp-accent" />
              Kommende Termine
              {appts.length > 0 && (
                <span className="bg-lp-accent text-lp-ink text-xs font-bold px-2 py-0.5 rounded-full">
                  {appts.length}
                </span>
              )}
            </h3>
          </div>

          {appointmentsLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-5 h-5 animate-spin text-lp-accent" />
            </div>
          ) : appts.length === 0 ? (
            <div className="bg-lp-surface border border-lp-line rounded-2xl p-10 text-center">
              <Calendar className="w-10 h-10 text-lp-muted mx-auto mb-3" />
              <p className="text-lp-ink font-medium mb-1">
                Keine kommenden Termine
              </p>
              <p className="text-lp-muted text-sm">
                Wenn Besucher einen Termin buchen, erscheint er hier.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {appts.map((a: any) => {
                const isCancelling = cancelConfirmId === a.id;
                return (
                  <div
                    key={a.id}
                    className={`bg-lp-surface border rounded-xl p-4 flex items-start justify-between gap-4 ${
                      a.status === "cancelled"
                        ? "border-lp-line/70 opacity-60"
                        : "border-lp-line"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-lp-ink font-medium text-sm">
                          {a.visitorName}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                            a.status === "cancelled"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : a.status === "confirmed"
                                ? "bg-emerald-500/10 text-lp-accent border-emerald-500/30"
                                : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                          }`}
                        >
                          {a.status === "cancelled"
                            ? "Abgesagt"
                            : a.status === "confirmed"
                              ? "Bestätigt"
                              : "Ausstehend"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-lp-accent text-sm mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(
                          a.appointmentDate + "T12:00:00"
                        ).toLocaleDateString("de-DE", {
                          weekday: "short",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                        {" · "}
                        {a.appointmentTime} Uhr
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-1">
                        <a
                          href={`mailto:${a.email}`}
                          className="text-lp-muted hover:text-lp-accent transition-colors flex items-center gap-1"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          {a.email}
                        </a>
                        {a.phone && (
                          <a
                            href={`tel:${a.phone}`}
                            className="text-lp-muted hover:text-green-300 transition-colors flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {a.phone}
                          </a>
                        )}
                      </div>
                      {a.message && (
                        <p className="text-lp-muted text-xs mt-1.5 leading-relaxed">
                          {a.message}
                        </p>
                      )}
                    </div>
                    {a.status !== "cancelled" && (
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {isCancelling ? (
                          <div className="flex flex-col items-end gap-2 min-w-[200px]">
                            <p className="text-xs text-lp-muted self-start">
                              Nachricht an Kunden (optional):
                            </p>
                            <textarea
                              value={cancelMessage}
                              onChange={e => setCancelMessage(e.target.value)}
                              placeholder="z.B. Ich bin leider erkrankt und melde mich bald..."
                              rows={2}
                              className="w-full bg-lp-canvas text-lp-ink text-xs px-2.5 py-2 rounded-lg border border-lp-line outline-none resize-none placeholder:text-lp-muted focus:border-red-500/60"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  cancelMutation.mutate({
                                    appointmentId: a.id,
                                    websiteId,
                                    cancelMessage:
                                      cancelMessage.trim() || undefined,
                                  });
                                }}
                                disabled={cancelMutation.isPending}
                                className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-colors disabled:opacity-50"
                              >
                                {cancelMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <CalendarX className="w-3 h-3" />
                                )}
                                Termin absagen
                              </button>
                              <button
                                onClick={() => {
                                  setCancelConfirmId(null);
                                  setCancelMessage("");
                                }}
                                className="text-xs text-lp-muted hover:text-lp-ink/80 transition-colors"
                              >
                                Abbrechen
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setCancelConfirmId(a.id)}
                            className="flex items-center gap-1 text-lp-muted hover:text-red-400 text-xs transition-colors"
                          >
                            <CalendarX className="w-3.5 h-3.5" />
                            Absagen
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Past appointments toggle */}
          <button
            onClick={() => {
              setShowPast(v => !v);
              if (!showPast) refetchPast();
            }}
            className="flex items-center gap-2 text-lp-muted hover:text-lp-ink/80 text-sm transition-colors"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showPast ? "rotate-180" : ""}`}
            />
            {showPast ? "Vergangene ausblenden" : "Vergangene Termine anzeigen"}
          </button>

          {showPast && pastAppts.length > 0 && (
            <div className="space-y-2 opacity-70">
              {pastAppts
                .filter(
                  (a: any) =>
                    a.appointmentDate < new Date().toISOString().slice(0, 10)
                )
                .map((a: any) => (
                  <div
                    key={a.id}
                    className="bg-lp-canvas border border-lp-line/70 rounded-xl p-3 flex items-center gap-3"
                  >
                    <Calendar className="w-4 h-4 text-lp-muted flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="text-lp-ink/80 text-sm font-medium">
                        {a.visitorName}
                      </span>
                      <span className="text-lp-muted text-xs ml-2">
                        {new Date(
                          a.appointmentDate + "T12:00:00"
                        ).toLocaleDateString("de-DE", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        {a.appointmentTime} Uhr
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full ${a.status === "cancelled" ? "text-red-400" : "text-lp-muted"}`}
                    >
                      {a.status === "cancelled" ? "Abgesagt" : "Erledigt"}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

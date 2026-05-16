import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/** Sendet Client-Errors an /api/client-error – fire-and-forget. */
export function reportClientError(payload: {
  source: "react" | "window-error" | "unhandled-rejection";
  message: string;
  stack?: string | null;
  componentStack?: string | null;
  url?: string;
}): void {
  try {
    const body = JSON.stringify({
      ...payload,
      url: payload.url ?? window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });
    // keepalive damit auch bei page-unload noch gesendet wird
    fetch("/api/client-error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => {
      /* ignore – wir wollen einen Logging-Fehler nicht weiter verarbeiten */
    });
  } catch {
    /* ignore */
  }
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportClientError({
      source: "react",
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
    // Zusätzlich in der Browser-Konsole, falls man dev tools offen hat
    console.error("[ErrorBoundary]", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6 bg-slate-50">
          <div className="flex flex-col items-center w-full max-w-md p-8 bg-white rounded-2xl shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-5">
              <AlertTriangle size={24} />
            </div>

            <h2 className="text-xl font-semibold text-slate-900 mb-2 text-center">
              Hoppla, etwas ist schiefgegangen
            </h2>
            <p className="text-sm text-slate-600 mb-6 text-center leading-relaxed">
              Wir haben den Fehler automatisch protokolliert und schauen ihn uns an.
              Versuche die Seite neu zu laden oder zurück zur Startseite zu gehen.
            </p>

            <div className="flex gap-2 w-full">
              <button
                onClick={() => window.location.reload()}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl",
                  "bg-indigo-600 text-white font-medium",
                  "hover:bg-indigo-500 transition-colors cursor-pointer"
                )}
              >
                <RotateCcw size={16} />
                Neu laden
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <Home size={16} />
                Startseite
              </button>
            </div>

            {/* Stack-Trace nur in Development sichtbar */}
            {import.meta.env.DEV && this.state.error?.stack && (
              <details className="w-full mt-6">
                <summary className="text-xs text-slate-400 cursor-pointer">
                  Technische Details (nur DEV)
                </summary>
                <div className="p-3 mt-2 w-full rounded bg-slate-100 overflow-auto">
                  <pre className="text-xs text-slate-600 whitespace-break-spaces">
                    {this.state.error.stack}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

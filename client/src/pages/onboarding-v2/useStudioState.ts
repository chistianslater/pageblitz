import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { computeRefetchInterval } from "./studioLogic";

export function useStudioState(token: string) {
  const [previewVersion, setPreviewVersion] = useState(0);
  // Wird bei jedem ensure-Fehler gesetzt und bei jedem neuen Versuch
  // zurückgesetzt; refetchInterval liest daraus statt aus React-State, weil
  // die Callback-Funktion selbst keine Closure über frischen State bekommt
  // (Finding #2).
  const ensureFailedRef = useRef(false);
  const ensure = trpc.onboardingV2.ensureGeneration.useMutation({
    onError: () => {
      ensureFailedRef.current = true;
    },
  });
  const query = trpc.onboardingV2.getState.useQuery(
    { token },
    {
      // @tanstack/react-query v5: das Argument ist die Query, Daten liegen unter query.state.data
      refetchInterval: query =>
        computeRefetchInterval(ensureFailedRef.current, query.state.data),
    }
  );
  const kicked = useRef(false);
  useEffect(() => {
    if (kicked.current || !query.data || query.data.doc || query.data.legacy)
      return;
    kicked.current = true;
    ensure.mutate({ token }, { onSuccess: () => query.refetch() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, token]);
  const bumpPreview = useCallback(() => setPreviewVersion(v => v + 1), []);
  // Ruft ensureGeneration direkt auf statt nur kicked/Query zurückzusetzen:
  // der Kick-Effekt hängt an [query.data, token] und feuert bei
  // strukturell identischen Daten (React-Query Structural Sharing) nie neu
  // — "Erneut versuchen" wäre sonst wirkungslos (Finding #1).
  const retry = useCallback(() => {
    ensureFailedRef.current = false;
    ensure.mutate({ token }, { onSuccess: () => query.refetch() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensure, token]);
  return {
    state: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    ensureError: ensure.error?.message ?? null,
    retrying: ensure.isPending,
    refetch: query.refetch,
    retry,
    previewVersion,
    bumpPreview,
  };
}

import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { computeRefetchInterval, generationInProgress } from "./studioLogic";

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
  // Wurde in DIESER Sitzung eine laufende Generierung beobachtet? Dann fadet
  // der erste PreviewFrame-Load nach Jobende die Sektionen ein (Zeitmaschine,
  // Plan B7 Task 4 — `reveal` in StudioPage/PreviewFrame). Ref statt State:
  // der Übergang Job-aktiv → fertig löst ohnehin einen Daten-Re-Render aus.
  const sawGeneration = useRef(false);
  useEffect(() => {
    if (query.data && generationInProgress(query.data.job)) {
      sawGeneration.current = true;
    }
  }, [query.data]);
  useEffect(() => {
    // needsCategory: Der Server lehnt ensureGeneration ohne Branche ab
    // (Plan B7 Task 5) — der Auto-Kick unterbleibt, bis setCategory die
    // Kategorie persistiert und die Generierung selbst gestartet hat.
    if (
      kicked.current ||
      !query.data ||
      query.data.doc ||
      query.data.legacy ||
      query.data.needsCategory
    )
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
  // Manueller Trigger für die Legacy-Regenerierung (Task 2): ruft dieselbe
  // Mutation mit `force: true` auf, statt eines separaten Endpunkts — der
  // Server entscheidet anhand von hasLegacyDoc/force/status, ob ein neuer
  // v2-Job entsteht oder BAD_REQUEST kommt (verkaufte Website).
  const forceRegenerate = useCallback(() => {
    ensureFailedRef.current = false;
    ensure.mutate({ token, force: true }, { onSuccess: () => query.refetch() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensure, token]);
  // Kategorie-Rückfrage (Plan B7 Task 5): persistiert die Branche und
  // startet serverseitig die Generierung — danach zeigt der Refetch den
  // laufenden Job und StudioPage wechselt zum Generierungs-Screen.
  const setCategory = trpc.onboardingV2.setCategory.useMutation();
  const submitCategory = useCallback(
    (category: string) => {
      ensureFailedRef.current = false;
      setCategory.mutate(
        { token, category },
        { onSuccess: () => query.refetch() }
      );
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setCategory, token]
  );
  return {
    state: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? null,
    ensureError: ensure.error?.message ?? null,
    retrying: ensure.isPending,
    refetch: query.refetch,
    retry,
    forceRegenerate,
    previewVersion,
    bumpPreview,
    justGenerated: sawGeneration.current,
    submitCategory,
    categoryPending: setCategory.isPending,
    categoryError: setCategory.error?.message ?? null,
  };
}

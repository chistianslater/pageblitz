import { useCallback, useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";

export function useStudioState(token: string) {
  const [previewVersion, setPreviewVersion] = useState(0);
  const ensure = trpc.onboardingV2.ensureGeneration.useMutation();
  const query = trpc.onboardingV2.getState.useQuery(
    { token },
    {
      // @tanstack/react-query v5: das Argument ist die Query, Daten liegen unter query.state.data
      refetchInterval: query => {
        const data = query.state.data;
        const job = data?.job;
        const running =
          !data?.doc &&
          (!job || job.status === "pending" || job.status === "processing");
        return running ? 1500 : false;
      },
    }
  );
  const kicked = useRef(false);
  useEffect(() => {
    if (kicked.current || !query.data || query.data.doc) return;
    kicked.current = true;
    ensure.mutate({ token }, { onSuccess: () => query.refetch() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.data, token]);
  const bumpPreview = useCallback(() => setPreviewVersion(v => v + 1), []);
  const retry = useCallback(() => {
    kicked.current = false;
    ensure.reset();
    query.refetch();
  }, [ensure, query]);
  return {
    state: query.data,
    isLoading: query.isLoading,
    error: query.error?.message ?? ensure.error?.message ?? null,
    refetch: query.refetch,
    retry,
    previewVersion,
    bumpPreview,
  };
}

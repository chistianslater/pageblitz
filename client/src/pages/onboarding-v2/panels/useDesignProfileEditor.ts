import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import type { DesignProfile } from "@shared/siteContract/designProfile";
import { DEFAULT_DESIGN_PROFILE } from "@shared/siteContract/designProfile";

/**
 * Gemeinsamer Auto-Apply für das Kompositionsprofil. Jede Sektion (Fotos,
 * Texte, Angebot) und der Theme-Editor speichern dieselbe `designProfile`-
 * Fläche — lokal sofort, dann `updateTheme`, danach `onApplied` für die
 * Live-Vorschau.
 */
export function useDesignProfileEditor({
  token,
  designProfile,
  onApplied,
}: {
  token: string;
  designProfile?: DesignProfile | null;
  onApplied: () => void;
}) {
  const updateTheme = trpc.onboardingV2.updateTheme.useMutation();
  const [localProfile, setLocalProfile] = useState<DesignProfile>(
    designProfile ?? DEFAULT_DESIGN_PROFILE
  );

  // Pack-Wechsel leitet serverseitig ein neues Profil ab. Panels bleiben
  // gemountet, deshalb den lokalen Stand nach dem Parent-Refetch ziehen.
  useEffect(() => {
    setLocalProfile(designProfile ?? DEFAULT_DESIGN_PROFILE);
  }, [designProfile]);

  const pickProfile = <
    K extends keyof Omit<DesignProfile, "version" | "seed">,
  >(
    key: K,
    value: DesignProfile[K]
  ) => {
    const next = { ...localProfile, [key]: value };
    setLocalProfile(next);
    updateTheme.mutate({ token, designProfile: next }, { onSuccess: onApplied });
  };

  return {
    localProfile,
    pickProfile,
    busy: updateTheme.isPending,
    error: updateTheme.error,
  };
}

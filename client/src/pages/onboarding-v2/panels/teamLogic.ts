import type { TeamPatch } from "@shared/onboardingV2/patches";

/** Deckt sich mit TeamPatchSchema.members (shared/onboardingV2/patches.ts). */
export type TeamMember = TeamPatch["members"][number];

/** Vom "Team pflegen"-Unterbereich gepflegter Entwurf — Headline optional, wie in TeamPatchSchema. */
export interface TeamValue {
  headline?: string;
  members: TeamMember[];
}

/** Deckt sich mit TeamPatchSchema.members.max(12) (shared/onboardingV2/patches.ts). */
export const MAX_TEAM_MEMBERS = 12;

function replaceAt<T>(list: T[], index: number, value: T): T[] {
  return list.map((item, i) => (i === index ? value : item));
}

/** Reine Funktion: neues leeres Mitglied ans Ende der Liste — No-op ab MAX_TEAM_MEMBERS. */
export function addMember(members: TeamMember[]): TeamMember[] {
  if (members.length >= MAX_TEAM_MEMBERS) return members;
  return [...members, { name: "" }];
}

/** Reine Funktion: entfernt das Mitglied an `index`. */
export function removeMember(members: TeamMember[], index: number): TeamMember[] {
  return members.filter((_, i) => i !== index);
}

/** Reine Funktion: ersetzt einzelne Felder des Mitglieds an `index`. */
export function updateMember(
  members: TeamMember[],
  index: number,
  patch: Partial<TeamMember>
): TeamMember[] {
  return replaceAt(members, index, { ...members[index], ...patch });
}

/**
 * Reine Funktion: vertauscht das Mitglied an `index` mit seinem Nachbarn in
 * Richtung `direction` — No-op am jeweiligen Rand der Liste (erstes Mitglied
 * kann nicht nach oben, letztes nicht nach unten).
 */
export function moveMember(
  members: TeamMember[],
  index: number,
  direction: "up" | "down"
): TeamMember[] {
  const target = direction === "up" ? index - 1 : index + 1;
  if (target < 0 || target >= members.length) return members;
  const next = [...members];
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next;
}

/** Reine Funktion: Fehlerliste — deckt sich mit TeamPatchSchema (Name je Mitglied ist Pflicht). */
export function validateTeam(members: TeamMember[]): string[] {
  return members
    .map((member, i) =>
      member.name.trim() === "" ? `Name fehlt bei Mitglied ${i + 1}.` : null
    )
    .filter((message): message is string => message !== null);
}

import { TeamPatchSchema, type TeamPatch } from "@shared/onboardingV2/patches";

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
export function removeMember(
  members: TeamMember[],
  index: number
): TeamMember[] {
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

/** Vom Foto-Picker in TeamEditor.tsx ausgelöste Operationen, die Zeilen-Indizes verschieben. */
export type PhotoRowOp = "move" | "remove";

/**
 * Reine Funktion: nächster Foto-Picker-Index (`photoRowIndex` in
 * TeamEditor.tsx), nachdem eine Mitgliederzeile umsortiert oder entfernt
 * wurde. Beide Operationen verändern, welches Mitglied an welchem Index
 * steht (Vertauschen bzw. Nachrücken der Folgezeilen) — ein offener
 * Foto-Picker wird deshalb immer geschlossen, statt einen ggf. falsch
 * gewordenen Index mitzuführen. Ohne diesen Schritt landete ein danach
 * gewähltes Foto beim falschen Mitglied (B5-Fixwelle).
 */
export function nextPhotoRowIndex(
  _current: number | null,
  _op: PhotoRowOp,
  _index: number
): number | null {
  return null;
}

/**
 * Übersetzt einen Zod-Issue der TeamPatchSchema-Validierung (Pfad
 * ["members", i, "name" | "role" | "imageUrl"] oder ["headline"]) in eine
 * lesbare deutsche Meldung. `null`, wenn der Issue bereits anderweitig
 * abgedeckt ist (leerer/reiner-Leerzeichen-Name) oder ein unbekanntes Feld
 * betrifft.
 */
function describeTeamPatchIssue(issue: {
  code: string;
  path: PropertyKey[];
}): string | null {
  const [root, indexOrField, field] = issue.path;
  if (root === "headline") {
    return "Überschrift ist zu lang (max. 80 Zeichen).";
  }
  if (root !== "members") return null;
  if (typeof indexOrField !== "number") {
    return "Es sind maximal 12 Mitglieder erlaubt.";
  }

  const label = `Mitglied ${indexOrField + 1}`;
  if (field === "name") {
    // "too_small" (leer/reine Leerzeichen) ist bereits über
    // missingNameErrors abgedeckt — keine doppelte Meldung.
    if (issue.code === "too_small") return null;
    return `Name bei ${label} ist zu lang (max. 80 Zeichen).`;
  }
  if (field === "role") {
    return `Rolle bei ${label} ist zu lang (max. 80 Zeichen).`;
  }
  if (field === "imageUrl") {
    return `Foto-URL bei ${label} ist ungültig.`;
  }
  return null;
}

/**
 * Reine Funktion: Fehlerliste — deckt sich mit TeamPatchSchema
 * (shared/onboardingV2/patches.ts): Name 1–80 Zeichen je Mitglied, Rolle
 * ≤ 80, Überschrift ≤ 80, `imageUrl` nur http(s)/relativ/Anker
 * (SafeUrlSchema). Leere/reine Leerzeichen-Namen werden separat geprüft
 * (TeamPatchSchema.min(1) akzeptiert reine Leerzeichen als "vorhanden" —
 * hier soll das weiterhin als "Name fehlt" gelten), damit keine doppelte
 * Meldung für denselben Fall entsteht.
 */
export function validateTeam(
  members: TeamMember[],
  headline?: string
): string[] {
  const missingNameErrors = members
    .map((member, i) =>
      member.name.trim() === "" ? `Name fehlt bei Mitglied ${i + 1}.` : null
    )
    .filter((message): message is string => message !== null);

  const result = TeamPatchSchema.safeParse({ headline, members });
  if (result.success) return missingNameErrors;

  const schemaErrors = result.error.issues
    .map(describeTeamPatchIssue)
    .filter((message): message is string => message !== null);

  return [...missingNameErrors, ...schemaErrors];
}

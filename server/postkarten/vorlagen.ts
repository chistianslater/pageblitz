/**
 * Welche HeyMail-Vorlage gehört zu welchem Kartenlayout? (2026-10-13)
 *
 * Bis Welle 1 gab es genau eine Vorlage (`HEYMAIL_TEMPLATE_ID`) und dazu ein
 * Feld im Browser, das sie überschreiben konnte — gemerkt im localStorage.
 * Mit Welle 2 kommt ein zweites Layout (Screenshot groß auf der
 * Vorderseite) mit eigener Vorlage. Ein einzelnes Browserfeld, das still
 * für alle Layouts gilt, hätte die Screenshot-Karten mit der alten Vorlage
 * gedruckt (oder umgekehrt) — ohne Fehlermeldung, nur auf Papier sichtbar.
 *
 * Deshalb hier:
 *   1. Jede Vorlage hat ihre eigene Umgebungsvariable.
 *   2. Fehlt sie, gibt es KEINEN Rückfall auf die Standardvorlage — die
 *      Karte würde sonst im falschen Design gedruckt.
 *   3. Eine Überschreibung aus dem Browser, die nachweislich zu einem
 *      ANDEREN Layout gehört, wird abgewiesen.
 */
import {
  POSTKARTEN_LAYOUTS,
  layoutVon,
  type PostkartenLayout,
} from "../../shared/postkartenWelle";

export const VORLAGE_ENV: Record<PostkartenLayout, string> = {
  standard: "HEYMAIL_TEMPLATE_ID",
  screenshot: "HEYMAIL_TEMPLATE_ID_SCREENSHOT",
};

type Umgebung = Record<string, string | undefined>;

/** Vorlage aus der Umgebung für dieses Layout — oder `null`. */
export function vorlageFuerLayout(
  layout: string | null | undefined,
  env: Umgebung = process.env
): string | null {
  return env[VORLAGE_ENV[layoutVon(layout)]]?.trim() || null;
}

/** Alle Layouts mit ihrer Vorlage — für die Anzeige im Backend. */
export function vorlagenUebersicht(env: Umgebung = process.env): {
  layout: PostkartenLayout;
  envName: string;
  templateId: string | null;
}[] {
  return POSTKARTEN_LAYOUTS.map(layout => ({
    layout,
    envName: VORLAGE_ENV[layout],
    templateId: vorlageFuerLayout(layout, env),
  }));
}

/**
 * Die Vorlage für einen Lauf. Wirft mit einer Meldung, die sagt, was zu
 * tun ist — der Router reicht sie als Fehler ans Backend weiter.
 */
export function vorlageAufloesen(opts: {
  layout: string | null | undefined;
  /** Überschreibung aus dem Backend (Feld „HeyMail-Vorlage"). */
  override?: string | null;
  env?: Umgebung;
}): string {
  const env = opts.env ?? process.env;
  const layout = layoutVon(opts.layout);
  const override = opts.override?.trim() || null;

  if (override) {
    const fremd = POSTKARTEN_LAYOUTS.find(
      andere => andere !== layout && vorlageFuerLayout(andere, env) === override
    );
    if (fremd) {
      throw new Error(
        `Die eingetragene Vorlage ${override} gehört zum Layout „${fremd}" (${VORLAGE_ENV[fremd]}), die Karte ist aber „${layout}". Feld leeren oder die richtige Vorlage eintragen.`
      );
    }
    return override;
  }

  const ausUmgebung = vorlageFuerLayout(layout, env);
  if (!ausUmgebung) {
    throw new Error(
      `Keine HeyMail-Vorlage für das Layout „${layout}". ${VORLAGE_ENV[layout]} auf dem Server setzen oder die ID im Feld „HeyMail-Vorlage" eintragen.`
    );
  }
  return ausUmgebung;
}

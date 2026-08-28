import { sendEmail } from "./email";
import {
  emailFooter,
  emailPrimaryButton,
  wrapPageblitzEmail,
} from "./emailDesign";

const LIFECYCLE_FROM = "Christian von Pageblitz <christian@pageblitz.de>";
const LIFECYCLE_REPLY_TO = "christian@pageblitz.de";

export type LifecycleEmailType =
  | "reminder_2h"
  | "reminder_24h"
  | "reminder_final"
  | "fresh_start_7d";

export interface LifecycleEmailData {
  firstName?: string | null;
  businessName: string;
  resumeLink: string;
  extendLink?: string;
  unsubscribeLink: string;
  welcomeBackLink?: string;
  // Unterscheidung reminder_final: true = nach Extension, false = erster Ablauf-Warn
  wasExtended?: boolean;
}

interface TemplateOutput {
  subject: string;
  html: string;
  text: string;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** Mit E-Mail: Vorschau maximal 7 Tage, dann Löschung (nicht verlängerbar). */
export const INITIAL_RESERVATION_HOURS = 7 * 24;
export const EXTENSION_HOURS = 24;
/** Keine Extra-Tage über die 7-Tage-Frist. */
export const MAX_EXTENSIONS = 0;

/**
 * Offsets ab E-Mail-Capture. `reminder_2h` bleibt im Enum für alte Queues,
 * wird für neue Captures nicht mehr geplant.
 * Tag 4: „noch drei Tage“. Tag 6: 24h vor Ablauf („morgen“).
 */
export const FIXED_OFFSETS: Partial<Record<LifecycleEmailType, number>> = {
  reminder_2h: 2 * 60 * 60 * 1000,
  reminder_24h: 4 * DAY_MS,
};
export const FINAL_WARNING_LEAD_MS = DAY_MS;

export interface InitialLifecycleMail {
  type: LifecycleEmailType;
  scheduledFor: Date;
}

/** Reine Planung: Reservierung + die zwei Erinnerungen (Tag 4 und Tag 6). */
export function initialLifecyclePlan(nowMs: number): {
  reservedUntil: Date;
  emails: InitialLifecycleMail[];
} {
  const reservedUntil = new Date(
    nowMs + INITIAL_RESERVATION_HOURS * 60 * 60 * 1000
  );
  return {
    reservedUntil,
    emails: [
      {
        type: "reminder_24h",
        scheduledFor: new Date(nowMs + FIXED_OFFSETS.reminder_24h!),
      },
      {
        type: "reminder_final",
        scheduledFor: new Date(reservedUntil.getTime() - FINAL_WARNING_LEAD_MS),
      },
    ],
  };
}
// "fresh_start_7d" feuert 7 Tage nach Website-Löschung
export const FRESH_START_DELAY_MS = 7 * 24 * 60 * 60 * 1000;

const greeting = (firstName?: string | null) =>
  firstName ? `Hey ${firstName},` : "Hey,";

const footerText = (unsubscribeLink: string) =>
  `\n\n---\nPageblitz - Websites für Kleinunternehmen\nKeine weiteren Erinnerungen: ${unsubscribeLink}\n`;

const wrap = (
  eyebrow: string,
  inner: string,
  unsubscribeLink: string
) =>
  wrapPageblitzEmail({
    eyebrow,
    content: inner,
    footer: emailFooter({ unsubscribeLink }),
  });

const primaryCta = emailPrimaryButton;

const secondaryLink = (text: string, href: string) => `
    <p style="margin:12px 0 0;font-size:14px;line-height:1.5;color:#6b645b;font-family:'Helvetica Neue',Arial,sans-serif;">
      <a href="${href}" style="color:#1f5f4b;text-decoration:underline;">${text}</a>
    </p>`;

// Helper: Text-Fragment "für X" nur rendern, wenn echter Business-Name vorhanden
const forBiz = (bn: string) =>
  bn && bn !== "deine Website" ? ` für <strong>${bn}</strong>` : "";

// ── Email 1: +2h Nudge ──────────────────────────────────────────────────────
function reminder2h(d: LifecycleEmailData): TemplateOutput {
  const subject =
    d.businessName && d.businessName !== "deine Website"
      ? `Deine Website für ${d.businessName} wartet auf dich`
      : "Deine Website wartet auf dich";
  const html = wrap(
    "Erinnerung",
    `
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1d1a17;">${greeting(d.firstName)}</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
      ich bin Christian, einer der Gr&uuml;nder von Pageblitz. Mir ist aufgefallen, dass deine Website${forBiz(d.businessName)} schon fast fertig ist &ndash; dir fehlen nur noch ein paar Klicks.
    </p>
    <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">Mach hier weiter, wo du aufgeh&ouml;rt hast:</p>
    ${primaryCta("Website fertigstellen", d.resumeLink)}
    <p style="margin: 16px 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">Das dauert wirklich nur 2&ndash;3 Minuten. Versprochen.</p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
      Falls du Fragen hast, irgendwo h&auml;ngst <strong>oder ein technisches Problem aufgetaucht ist</strong> (Seite hat nicht geladen, Bild ging nicht hoch, irgendwas hakt): Antworte einfach auf diese Mail. Ich lese jede pers&ouml;nlich &ndash; und wenn etwas technisch nicht funktioniert, k&uuml;mmern wir uns sofort.
    </p>
    <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
  `,
    d.unsubscribeLink
  );
  const forBizText =
    d.businessName && d.businessName !== "deine Website"
      ? ` für ${d.businessName}`
      : "";
  const text = `${greeting(d.firstName)}

ich bin Christian, einer der Gründer von Pageblitz. Mir ist aufgefallen, dass deine Website${forBizText} schon fast fertig ist – dir fehlen nur noch ein paar Klicks.

Mach hier weiter, wo du aufgehört hast:
${d.resumeLink}

Das dauert wirklich nur 2–3 Minuten. Versprochen.

Falls du Fragen hast, irgendwo hängst oder ein technisches Problem aufgetaucht ist (Seite hat nicht geladen, Bild ging nicht hoch, irgendwas hakt): Antworte einfach auf diese Mail. Ich lese jede persönlich – und wenn etwas technisch nicht funktioniert, kümmern wir uns sofort.

Viele Grüße
Christian${footerText(d.unsubscribeLink)}`;
  return { subject, html, text };
}

// ── Email 2: Tag 4 — noch drei Tage ────────────────────────────────────────
function reminder24h(d: LifecycleEmailData): TemplateOutput {
  const subject =
    d.businessName && d.businessName !== "deine Website"
      ? `Noch drei Tage: Deine Website für ${d.businessName}`
      : "Noch drei Tage: Deine Website-Vorschau";
  const html = wrap(
    "Noch drei Tage",
    `
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1d1a17;">${greeting(d.firstName)}</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
      deine Website${forBiz(d.businessName)} ist fast fertig &ndash; die Vorschau bleibt noch <strong>drei Tage</strong> gespeichert. Danach l&ouml;schen wir sie, wenn sie nicht live geht.
    </p>
    <p style="margin: 16px 0 8px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">Die h&auml;ufigsten Gr&uuml;nde, warum Leute an dieser Stelle stecken bleiben:</p>
    <ul style="margin: 0 0 16px 0; padding-left: 20px; font-size: 15px; line-height: 1.8; color: #3f3a34;">
      <li><strong>Ein technisches Problem</strong> (Seite hat nicht geladen, Bild ging nicht hoch, etwas hakt)</li>
      <li>Kein gutes Foto vom Laden / der Arbeit</li>
      <li>Unsicher, was man reinschreiben soll</li>
      <li>Kurz keine Zeit und dann vergessen</li>
    </ul>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
      Falls dich eines davon betrifft &ndash; kein Problem. Antworte einfach auf diese Mail, und ich helfe dir pers&ouml;nlich weiter. Speziell wenn technisch etwas nicht funktioniert hat: <strong>bitte schreib mir</strong>, das wollen wir wissen und sofort beheben. Texte und Fotos bekommen wir auch gemeinsam hin.
    </p>
    ${primaryCta("Website jetzt fertigstellen", d.resumeLink)}
    ${d.extendLink ? secondaryLink("Ich brauche noch mehr Zeit", d.extendLink) : ""}
    <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
  `,
    d.unsubscribeLink
  );
  const text = `${greeting(d.firstName)}

deine Website${d.businessName && d.businessName !== "deine Website" ? ` für ${d.businessName}` : ""} ist fast fertig – die Vorschau bleibt noch drei Tage gespeichert. Danach löschen wir sie, wenn sie nicht live geht.

Die häufigsten Gründe, warum Leute an dieser Stelle stecken bleiben:
- Ein technisches Problem (Seite hat nicht geladen, Bild ging nicht hoch, etwas hakt)
- Kein gutes Foto vom Laden / der Arbeit
- Unsicher, was man reinschreiben soll
- Kurz keine Zeit und dann vergessen

Falls dich eines davon betrifft – kein Problem. Antworte einfach auf diese Mail, und ich helfe dir persönlich weiter. Speziell wenn technisch etwas nicht funktioniert hat: bitte schreib mir, das wollen wir wissen und sofort beheben.

Website jetzt fertigstellen:
${d.resumeLink}${d.extendLink ? `\n\nIch brauche noch mehr Zeit:\n${d.extendLink}` : ""}

Viele Grüße
Christian${footerText(d.unsubscribeLink)}`;
  return { subject, html, text };
}

// ── Email 3: Letzte Warnung (dynamisch 2h vor Ablauf; wasExtended variiert den Ton) ──
function reminderFinal(d: LifecycleEmailData): TemplateOutput {
  if (d.wasExtended) {
    const subject = "Morgen früh wird dein Entwurf gelöscht";
    const html = wrap(
      "Allerletzter Aufruf",
      `
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1d1a17;">${greeting(d.firstName)}</p>
      <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
        du hast dir nochmal extra Zeit genommen, um deine Website${forBiz(d.businessName)} fertigzustellen. Die l&auml;uft jetzt in wenigen Stunden ab.
      </p>
      <p style="margin: 0 0 8px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">Wenn du bis dahin nichts tust, ist der Entwurf weg.</p>
      ${primaryCta("Jetzt fertigstellen", d.resumeLink)}
      ${d.extendLink ? secondaryLink("Ich brauche noch mehr Zeit", d.extendLink) : ""}
      <p style="margin: 16px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
        Falls dich etwas Konkretes abh&auml;lt &ndash; auch technische Probleme z&auml;hlen dazu (Seite l&auml;dt nicht, Bilder fehlen, etwas funktioniert nicht): schreib mir. Ich antworte normalerweise innerhalb einer Stunde und wir kriegen das gefixt.
      </p>
      <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
    `,
      d.unsubscribeLink
    );
    const text = `${greeting(d.firstName)}

du hast dir nochmal extra Zeit genommen, um deine Website${d.businessName && d.businessName !== "deine Website" ? ` für ${d.businessName}` : ""} fertigzustellen. Die läuft jetzt in wenigen Stunden ab.

Wenn du bis dahin nichts tust, ist der Entwurf weg.

Jetzt fertigstellen:
${d.resumeLink}${d.extendLink ? `\n\nIch brauche noch mehr Zeit:\n${d.extendLink}` : ""}

Falls dich etwas Konkretes abhält – auch technische Probleme zählen dazu (Seite lädt nicht, Bilder fehlen, etwas funktioniert nicht): schreib mir. Ich antworte normalerweise innerhalb einer Stunde und wir kriegen das gefixt.

Viele Grüße
Christian${footerText(d.unsubscribeLink)}`;
    return { subject, html, text };
  }

  // Erster Final-Aufruf: 24h vor Ablauf
  const subject = "Morgen wird deine Vorschau gelöscht";
  const html = wrap(
    "Morgen ist Schluss",
    `
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1d1a17;">${greeting(d.firstName)}</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
      kurze Info: Dein Website-Entwurf${forBiz(d.businessName)} l&auml;uft <strong>morgen</strong> ab. Danach l&ouml;schen wir die Vorschau, damit unser Server nicht &uuml;berquillt.
    </p>
    <p style="margin: 16px 0 8px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">Wenn du ihn behalten willst, hast du zwei M&ouml;glichkeiten:</p>
    <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3a34;"><strong>1. Jetzt fertigstellen</strong> (dauert wirklich nur wenige Minuten):</p>
    ${primaryCta("Weiter zur Website", d.resumeLink)}
    ${
      d.extendLink
        ? `
    <p style="margin: 8px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3a34;"><strong>2. Nochmal 24 Stunden Zeit nehmen:</strong></p>
    ${secondaryLink("Reservierung verl&auml;ngern", d.extendLink)}
    `
        : ""
    }
    <p style="margin: 24px 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
      Wenn gerade einfach nicht der richtige Moment ist: Das ist okay. Du kannst jederzeit einen neuen Entwurf starten. Aber alles, was du schon eingegeben hast, w&auml;re dann weg.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">Bei Fragen oder wenn etwas technisch nicht funktioniert (Seite l&auml;dt nicht, Bilder fehlen): einfach auf diese Mail antworten. Ich antworte schnell und wir kriegen das gefixt.</p>
    <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
  `,
    d.unsubscribeLink
  );
  const text = `${greeting(d.firstName)}

kurze Info: Dein Website-Entwurf${d.businessName && d.businessName !== "deine Website" ? ` für ${d.businessName}` : ""} läuft morgen ab. Danach löschen wir die Vorschau, damit unser Server nicht überquillt.

Wenn du ihn behalten willst, hast du zwei Möglichkeiten:

1. Jetzt fertigstellen (dauert wirklich nur wenige Minuten):
${d.resumeLink}${d.extendLink ? `\n\n2. Nochmal 24 Stunden Zeit nehmen:\n${d.extendLink}` : ""}

Wenn gerade einfach nicht der richtige Moment ist: Das ist okay. Du kannst jederzeit einen neuen Entwurf starten. Aber alles, was du schon eingegeben hast, wäre dann weg.

Bei Fragen oder wenn etwas technisch nicht funktioniert (Seite lädt nicht, Bilder fehlen): einfach auf diese Mail antworten. Ich antworte schnell und wir kriegen das gefixt.

Viele Grüße
Christian${footerText(d.unsubscribeLink)}`;
  return { subject, html, text };
}

// ── Email 5: +7d Fresh Start (nach Löschung) ────────────────────────────────
function freshStart7d(d: LifecycleEmailData): TemplateOutput {
  const subject = d.firstName
    ? `Willst du es nochmal versuchen, ${d.firstName}?`
    : "Willst du es nochmal versuchen?";
  const welcomeLink = d.welcomeBackLink || d.resumeLink;
  const html = wrap(
    "Frischer Start",
    `
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1d1a17;">${greeting(d.firstName)}</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
      vor einer Woche hast du angefangen, eine Website${forBiz(d.businessName)} zu bauen &ndash; und dann ging das Leben dazwischen. Kenn ich.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
      Der alte Entwurf ist inzwischen gel&ouml;scht, aber das Gute ist: Deine Daten haben wir noch &ndash; in 60 Sekunden baue ich dir einen frischen Entwurf. Ein Klick, und es geht los:
    </p>
    ${primaryCta("Neuen Entwurf bauen", welcomeLink)}
    <p style="margin: 16px 0 0 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
      Wenn Pageblitz gerade nicht passt, ist das auch okay. Kein Druck. Du bekommst von mir nach dieser Mail keine weitere automatisch.
    </p>
    <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
  `,
    d.unsubscribeLink
  );
  const text = `${greeting(d.firstName)}

vor einer Woche hast du angefangen, eine Website${d.businessName && d.businessName !== "deine Website" ? ` für ${d.businessName}` : ""} zu bauen – und dann ging das Leben dazwischen. Kenn ich.

Der alte Entwurf ist inzwischen gelöscht, aber das Gute ist: Deine Daten haben wir noch – in 60 Sekunden baue ich dir einen frischen Entwurf. Ein Klick, und es geht los:

${welcomeLink}

Wenn Pageblitz gerade nicht passt, ist das auch okay. Kein Druck. Du bekommst von mir nach dieser Mail keine weitere automatisch.

Viele Grüße
Christian${footerText(d.unsubscribeLink)}`;
  return { subject, html, text };
}

// ── Welcome-Link (sofort beim Email-Capture, transactional, nicht scheduled) ──
export function renderWelcomeLinkEmail(d: LifecycleEmailData): TemplateOutput {
  const subject = "Dein Link zu deiner Pageblitz-Website";
  const html = wrap(
    "Dein Link",
    `
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #1d1a17;">${greeting(d.firstName)}</p>
    <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: #3f3a34;">
      hier ist dein pers&ouml;nlicher Link zu deiner Website-Vorschau${d.businessName && d.businessName !== "deine Website" ? ` f&uuml;r <strong>${d.businessName}</strong>` : ""}:
    </p>
    ${primaryCta("Website bearbeiten", d.resumeLink)}
    <p style="margin: 16px 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
      Die Vorschau bleibt <strong>7 Tage</strong> gespeichert. Wir erinnern dich rechtzeitig, bevor sie gel&ouml;scht wird. Speicher dir diese Mail oder den Link als Lesezeichen.
    </p>
    <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 1.6; color: #3f3a34;">
      Falls du Fragen hast: einfach auf diese Mail antworten.
    </p>
    <p style="margin: 24px 0 0 0; font-size: 15px; line-height: 1.6; color: #1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
  `,
    d.unsubscribeLink
  );
  const text = `${greeting(d.firstName)}

hier ist dein persönlicher Link zu deiner Website-Vorschau${d.businessName && d.businessName !== "deine Website" ? ` für ${d.businessName}` : ""}:

${d.resumeLink}

Die Vorschau bleibt 7 Tage gespeichert. Wir erinnern dich rechtzeitig, bevor sie gelöscht wird. Speicher dir diese Mail oder den Link als Lesezeichen.

Falls du Fragen hast: einfach auf diese Mail antworten.

Viele Grüße
Christian${footerText(d.unsubscribeLink)}`;
  return { subject, html, text };
}

const TEMPLATES: Record<
  LifecycleEmailType,
  (d: LifecycleEmailData) => TemplateOutput
> = {
  reminder_2h: reminder2h,
  reminder_24h: reminder24h,
  reminder_final: reminderFinal,
  fresh_start_7d: freshStart7d,
};

export function renderLifecycleEmail(
  type: LifecycleEmailType,
  data: LifecycleEmailData
): TemplateOutput {
  return TEMPLATES[type](data);
}

export async function sendLifecycleEmail(
  type: LifecycleEmailType,
  to: string,
  data: LifecycleEmailData
): Promise<{ success: boolean; id?: string; error?: string }> {
  const { subject, html, text } = renderLifecycleEmail(type, data);
  return sendEmail({
    to,
    subject,
    html,
    text,
    from: LIFECYCLE_FROM,
    replyTo: LIFECYCLE_REPLY_TO,
  });
}

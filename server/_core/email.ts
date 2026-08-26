import { Resend } from "resend";
import { ENV } from "./env";
import {
  emailFooter,
  emailInfoPanel,
  emailPrimaryButton,
  wrapPageblitzEmail,
} from "./emailDesign";

// Initialize Resend client
const resend = ENV.resendApiKey ? new Resend(ENV.resendApiKey) : null;

export interface EmailTemplate {
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail({
  to,
  subject,
  html,
  text,
  from = ENV.resendFromEmail,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  if (!resend) {
    console.warn("[Email] Resend not configured - email not sent");
    return { success: false, error: "Resend not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""), // Strip HTML tags for text version
      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    if (error) {
      console.error("[Email] Failed to send:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Sent to ${to}: ${subject} (ID: ${data?.id})`);
    return { success: true, id: data?.id };
  } catch (err: any) {
    console.error("[Email] Exception:", err);
    return { success: false, error: err.message };
  }
}

/**
 * Send Magic Link login email
 */
export async function sendMagicLinkEmail(to: string, magicUrl: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    from: "Pageblitz <noreply@pageblitz.de>",
    subject: "Dein Login-Link für Pageblitz",
    html: wrapPageblitzEmail({
      eyebrow: "Login-Link",
      content: `
        <h1 style="color:#1d1a17;font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0 0 12px;">Willkommen zur&uuml;ck.</h1>
        <p style="color:#3f3a34;font-size:15px;line-height:1.65;margin:0;">Mit diesem Link meldest du dich sicher bei Pageblitz an. Kein Passwort n&ouml;tig.</p>
        ${emailPrimaryButton("Jetzt einloggen", magicUrl)}
        ${emailInfoPanel(
          "Sicherer Link",
          "Der Link ist <strong>15 Minuten g&uuml;ltig</strong> und kann nur <strong>einmal verwendet</strong> werden. Falls du ihn nicht angefordert hast, kannst du diese E-Mail ignorieren."
        )}
        <p style="color:#6b645b;font-size:11px;line-height:1.5;margin:18px 0 0;word-break:break-all;">Button funktioniert nicht? Kopiere diese URL:<br><a href="${magicUrl}" style="color:#1f5f4b;">${magicUrl}</a></p>
      `,
      footer: emailFooter({ note: `&copy; ${new Date().getFullYear()}` }),
    }),
  });
}

/**
 * Send appointment cancellation email to the visitor
 */
export async function sendAppointmentCancellationEmail({
  to,
  visitorName,
  appointmentDate,
  appointmentTime,
  businessName,
  cancelMessage,
}: {
  to: string;
  visitorName: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  businessName: string;
  cancelMessage?: string;
}): Promise<{ success: boolean; error?: string }> {
  const formattedDate = new Date(appointmentDate + "T12:00:00").toLocaleDateString("de-DE", {
    weekday: "long", day: "2-digit", month: "long", year: "numeric",
  });

  return sendEmail({
    to,
    from: "Pageblitz <noreply@pageblitz.de>",
    subject: `Dein Termin bei ${businessName} wurde abgesagt`,
    html: wrapPageblitzEmail({
      eyebrow: "Terminabsage",
      content: `
        <h1 style="color:#1d1a17;font-size:22px;font-weight:600;letter-spacing:-.02em;margin:0 0 12px;">Termin abgesagt</h1>
        <p style="color:#3f3a34;font-size:15px;line-height:1.65;margin:0;">Hallo ${visitorName},<br><br>leider muss dein Termin bei <strong>${businessName}</strong> abgesagt werden.</p>
        ${emailInfoPanel(
          "Abgesagter Termin",
          `${formattedDate} um ${appointmentTime} Uhr`,
          "warning"
        )}
        ${
          cancelMessage
            ? emailInfoPanel(
                `Nachricht von ${businessName}`,
                cancelMessage,
                "neutral"
              )
            : ""
        }
        <p style="color:#3f3a34;font-size:14px;line-height:1.65;margin:20px 0 0;">Falls du einen neuen Termin vereinbaren m&ouml;chtest, besuche einfach die Website erneut.</p>
      `,
      footer: emailFooter({ note: `&copy; ${new Date().getFullYear()}` }),
    }),
  });
}

/**
 * "Deine Website ist fertig" – wird vom Admin manuell verschickt nach
 * dem Concierge-Service (du hast die Website für jemanden gebaut, sie
 * soll nur noch reinschauen + aktivieren).
 *
 * magicUrl loggt den Empfänger ein und leitet zur Website-Vorschau
 * mit dem aktiven "Website freischalten"-Button.
 */
export async function sendActivationReadyEmail(args: {
  to: string;
  firstName?: string | null;
  businessName: string;
  magicUrl: string;
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const { to, firstName, businessName, magicUrl } = args;
  const greeting = firstName ? `Hey ${firstName},` : "Hey,";
  const bizPart = businessName && businessName !== "deine Website"
    ? ` für <strong>${businessName}</strong>`
    : "";
  const bizPartText = businessName && businessName !== "deine Website"
    ? ` für ${businessName}`
    : "";
  const subject = businessName && businessName !== "deine Website"
    ? `Deine Website für ${businessName} ist fertig – jetzt freischalten`
    : "Deine Website ist fertig – jetzt freischalten";

  const html = wrapPageblitzEmail({
    eyebrow: "Bereit zum Freischalten",
    content: `
      <p style="margin:0 0 16px;font-size:16px;line-height:1.65;color:#1d1a17;">${greeting}</p>
      <h1 style="margin:0 0 14px;font-size:24px;line-height:1.15;font-weight:600;letter-spacing:-.02em;color:#1d1a17;">Deine Website ist fertig.</h1>
      <p style="margin:0 0 14px;font-size:16px;line-height:1.65;color:#3f3a34;">Wie besprochen habe ich deine Website${bizPart} fertiggestellt. Schau sie dir in Ruhe an und schalte sie frei, wenn alles passt.</p>
      ${emailPrimaryButton("Website ansehen &amp; freischalten", magicUrl)}
      ${emailInfoPanel(
        "Direkter Zugang",
        'Der Link meldet dich automatisch an. Im Studio kannst du die Vorschau pr&uuml;fen, Anpassungen vornehmen und die Website freischalten.'
      )}
      <p style="margin:0 0 14px;font-size:15px;line-height:1.65;color:#3f3a34;">Wenn du noch &Auml;nderungen m&ouml;chtest, antworte einfach auf diese E-Mail.</p>
      <p style="margin:24px 0 0;font-size:15px;line-height:1.65;color:#1d1a17;">Viele Gr&uuml;&szlig;e<br>Christian</p>
    `,
    footer: emailFooter({ note: "Der Login-Link ist 7 Tage g&uuml;ltig." }),
  });

  const text = `${greeting}

wie besprochen habe ich deine Website${bizPartText} fertiggestellt – du musst sie nur noch anschauen und freischalten.

Hier kommst du direkt zu deiner Vorschau (Link loggt dich automatisch ein, 7 Tage gültig):
${magicUrl}

In der Vorschau findest du oben rechts den "Website freischalten"-Button – ein Klick, Stripe-Checkout, fertig.

Falls du noch Änderungen möchtest oder etwas nicht passt: einfach auf diese Mail antworten. Ich passe es gerne für dich an.

Viele Grüße
Christian

---
Pageblitz – Websites für Kleinunternehmen`;

  return sendEmail({
    to,
    subject,
    html,
    text,
    from: "Christian von Pageblitz <christian@pageblitz.de>",
    replyTo: "christian@pageblitz.de",
  });
}

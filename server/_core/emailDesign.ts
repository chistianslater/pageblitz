/**
 * Gemeinsame Pageblitz-E-Mail-Chrome.
 *
 * E-Mail-Clients unterstützen weder unsere Web-CSS-Variablen noch zuverlässig
 * Webfonts. Deshalb ausschließlich tabellenbasiertes Markup + Inline-CSS,
 * aber die Nachtschicht-Markensprache (2026-08-30): heller Brief mit
 * dunklem Kopf (#0b0b0d) + Volt-Blitz, Volt-Buttons (#ccff00 auf Kohle),
 * Grautöne #f2f2ef/#e4e3de/#6d6c66. Bewusst KEIN Dark-Mail-Body —
 * dunkle HTML-Mails invertieren Clients unkontrolliert.
 */

const FONT =
  "'Helvetica Neue',Arial,'Segoe UI',sans-serif";

export function emailHeader(eyebrow: string): string {
  return `
    <tr>
      <td style="background:#0b0b0d;border-radius:14px 14px 0 0;padding:24px 28px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="30" height="30" align="center" style="width:30px;height:30px;"><img src="https://pageblitz.de/email/pageblitz-mark.png" width="30" height="30" alt="" style="display:block;border:0;border-radius:7px;"></td>
            <td style="padding-left:10px;vertical-align:middle;color:#ffffff;font-family:${FONT};font-size:18px;font-weight:600;letter-spacing:-.25px;">Pageblitz</td>
          </tr>
        </table>
        <p style="color:#ccff00;font-family:${FONT};font-size:10px;font-weight:600;margin:14px 0 0;text-transform:uppercase;letter-spacing:.12em;">${eyebrow}</p>
      </td>
    </tr>`;
}

export function emailFooter(options?: {
  unsubscribeLink?: string;
  note?: string;
}): string {
  const unsubscribe = options?.unsubscribeLink
    ? `<br><a href="${options.unsubscribeLink}" style="color:#6d6c66;text-decoration:underline;">Keine weiteren Erinnerungen</a>`
    : "";
  return `
    <tr>
      <td style="background:#f2f2ef;border-top:1px solid #e4e3de;border-radius:0 0 14px 14px;padding:18px 28px;text-align:center;">
        <p style="color:#6d6c66;font-family:${FONT};font-size:11px;line-height:1.6;margin:0;">
          Pageblitz &middot; Websites f&uuml;r Kleinunternehmen
          ${options?.note ? `<br>${options.note}` : ""}
          ${unsubscribe}
        </p>
      </td>
    </tr>`;
}

export function wrapPageblitzEmail(options: {
  eyebrow: string;
  content: string;
  footer?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
</head>
<body style="margin:0;padding:0;background:#f2f2ef;font-family:${FONT};color:#131316;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f2f2ef;">
    <tr>
      <td align="center" style="padding:32px 14px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:#ffffff;border:1px solid #e4e3de;border-radius:14px;">
          ${emailHeader(options.eyebrow)}
          <tr>
            <td style="padding:32px 28px;font-family:${FONT};">
              ${options.content}
            </td>
          </tr>
          ${options.footer ?? emailFooter()}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function emailPrimaryButton(text: string, href: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0;">
      <tr>
        <td align="left">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" bgcolor="#ccff00" style="background:#ccff00;border-radius:999px;">
                <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;color:#0b0b0d;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;text-decoration:none;border-radius:999px;">${text}</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>`;
}

export function emailInfoPanel(
  label: string,
  content: string,
  tone: "neutral" | "warning" = "neutral"
): string {
  const colors =
    tone === "warning"
      ? { bg: "#fbf0ec", border: "#e5c2b4", label: "#a4441f" }
      : { bg: "#f2f2ef", border: "#e4e3de", label: "#52514c" };
  return `
    <div style="background:${colors.bg};border:1px solid ${colors.border};border-radius:10px;padding:16px 18px;margin:20px 0;">
      <p style="color:${colors.label};font-family:${FONT};font-size:11px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;">${label}</p>
      <div style="color:#131316;font-family:${FONT};font-size:14px;line-height:1.6;">${content}</div>
    </div>`;
}


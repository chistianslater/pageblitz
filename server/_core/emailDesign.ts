/**
 * Gemeinsame Pageblitz-E-Mail-Chrome.
 *
 * E-Mail-Clients unterstützen weder unsere Web-CSS-Variablen noch zuverlässig
 * Webfonts. Deshalb ausschließlich tabellenbasiertes Markup + Inline-CSS,
 * aber dieselbe visuelle Sprache: Canvas #f7f5f1, Surface #fdfcfa,
 * Ink #1d1a17, Grün #1f5f4b, Hairline #ddd6c9.
 */

const FONT =
  "'Helvetica Neue',Arial,'Segoe UI',sans-serif";

export function emailHeader(eyebrow: string): string {
  return `
    <tr>
      <td style="background:#fdfcfa;border-bottom:1px solid #ddd6c9;border-radius:14px 14px 0 0;padding:24px 28px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0">
          <tr>
            <td width="34" height="34" align="center" style="width:34px;height:34px;background:#1d1a17;border-radius:7px;color:#fff;font-family:${FONT};font-size:19px;font-weight:700;line-height:34px;">&#8623;</td>
            <td style="padding-left:10px;vertical-align:middle;color:#1d1a17;font-family:${FONT};font-size:18px;font-weight:600;letter-spacing:-.25px;">Pageblitz</td>
          </tr>
        </table>
        <p style="color:#1f5f4b;font-family:${FONT};font-size:10px;font-weight:600;margin:12px 0 0;text-transform:uppercase;letter-spacing:.12em;">${eyebrow}</p>
      </td>
    </tr>`;
}

export function emailFooter(options?: {
  unsubscribeLink?: string;
  note?: string;
}): string {
  const unsubscribe = options?.unsubscribeLink
    ? `<br><a href="${options.unsubscribeLink}" style="color:#6b645b;text-decoration:underline;">Keine weiteren Erinnerungen</a>`
    : "";
  return `
    <tr>
      <td style="background:#f7f5f1;border-top:1px solid #ddd6c9;border-radius:0 0 14px 14px;padding:18px 28px;text-align:center;">
        <p style="color:#6b645b;font-family:${FONT};font-size:11px;line-height:1.6;margin:0;">
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
<body style="margin:0;padding:0;background:#f7f5f1;font-family:${FONT};color:#1d1a17;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f7f5f1;">
    <tr>
      <td align="center" style="padding:32px 14px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;width:100%;background:#fdfcfa;border:1px solid #ddd6c9;border-radius:14px;">
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
              <td align="center" bgcolor="#1f5f4b" style="background:#1f5f4b;border-radius:999px;">
                <a href="${href}" target="_blank" style="display:inline-block;padding:14px 28px;color:#fff;font-family:${FONT};font-size:15px;font-weight:600;line-height:1;text-decoration:none;border-radius:999px;">${text}</a>
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
      : { bg: "#f7f5f1", border: "#ddd6c9", label: "#1f5f4b" };
  return `
    <div style="background:${colors.bg};border:1px solid ${colors.border};border-radius:10px;padding:16px 18px;margin:20px 0;">
      <p style="color:${colors.label};font-family:${FONT};font-size:11px;font-weight:600;margin:0 0 6px;text-transform:uppercase;letter-spacing:.08em;">${label}</p>
      <div style="color:#1d1a17;font-family:${FONT};font-size:14px;line-height:1.6;">${content}</div>
    </div>`;
}


import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.RESEND_FROM_EMAIL || "Christian Slater <christian@pageblitz.de>";

export async function sendOutreachEmail(params: {
  to: string;
  subject: string;
  body: string;
  businessName: string;
  variant: string;
  outreachEmailId: number;
}): Promise<{ success: boolean; resendId?: string; error?: string }> {
  // Personalize the body
  const personalizedBody = params.body
    .replace(/{businessName}/g, params.businessName)
    .replace(/{variant}/g, params.variant);

  // Convert plain text to simple HTML
  const html = `<!DOCTYPE html>
<html><body style="font-family:-apple-system,sans-serif;max-width:560px;margin:0 auto;padding:40px 20px;color:#1a1a1a;line-height:1.7;font-size:15px">
${personalizedBody.split('\n\n').map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('')}
<br>
<p style="color:#9ca3af;font-size:12px;border-top:1px solid #f0f0f0;padding-top:16px;margin-top:32px">
Diese E-Mail wurde von Christian Slater, Gründer von Pageblitz, gesendet.<br>
<a href="https://pageblitz.de" style="color:#6366f1">pageblitz.de</a> ·
Abmelden: <a href="mailto:christian@pageblitz.de?subject=Abmelden" style="color:#9ca3af">Abmelden</a>
</p>
</body></html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html,
      text: personalizedBody,
      tags: [
        { name: "variant", value: params.variant },
        { name: "outreachId", value: String(params.outreachEmailId) },
      ],
    });

    if (error) return { success: false, error: error.message };
    return { success: true, resendId: data?.id };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

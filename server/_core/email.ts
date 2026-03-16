import { Resend } from "resend";
import { ENV } from "./env";

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
 * Email Templates for Lead Nurturing
 */
export const emailTemplates = {
  /**
   * Welcome email when user starts onboarding
   */
  onboardingStarted: (data: {
    businessName: string;
    previewUrl: string;
  }): EmailTemplate => ({
    subject: `Deine Website für ${data.businessName} wird erstellt 🚀`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #6366f1;">Pageblitz</h1>
        </div>
        
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">
          Deine Website wird gerade erstellt!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hallo,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          wir erstellen gerade eine professionelle Website für <strong>${data.businessName}</strong>. 
          Dies dauert nur wenige Sekunden.
        </p>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
          <p style="font-size: 14px; color: #64748b; margin-bottom: 12px;">Dein persönlicher Link:</p>
          <a href="${data.previewUrl}" 
             style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Website bearbeiten →
          </a>
        </div>
        
        <p style="font-size: 14px; color: #64748b; line-height: 1.6;">
          Speichere diesen E-Mail, damit du jederzeit zurückkehren kannst. Falls du Fragen hast, 
          antworte einfach auf diese E-Mail.
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Pageblitz - Professionelle Websites in Minuten<br>
          <a href="https://pageblitz.de" style="color: #6366f1;">pageblitz.de</a>
        </p>
      </div>
    `,
  }),

  /**
   * Email when onboarding is completed but not yet converted
   */
  onboardingCompleted: (data: {
    businessName: string;
    previewUrl: string;
    websiteId: number;
  }): EmailTemplate => ({
    subject: `🎉 Deine Website für ${data.businessName} ist fertig!`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #6366f1;">Pageblitz</h1>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <div style="font-size: 64px; margin-bottom: 10px;">🎉</div>
          <h2 style="font-size: 28px; font-weight: 700; margin: 0;">
            Deine Website ist fertig!
          </h2>
        </div>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hallo,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          großartige Neuigkeiten! Deine Website für <strong>${data.businessName}</strong> wurde 
          erfolgreich erstellt und ist bereit für den Launch.
        </p>
        
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                    border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; color: white;">
          <p style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">
            Bereit, online zu gehen?
          </p>
          <a href="${data.previewUrl}" 
             style="display: inline-block; background: white; color: #6366f1; padding: 16px 32px; 
                    border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Website freischalten →
          </a>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 30px 0;">
          <p style="font-size: 14px; margin: 0; color: #92400e;">
            <strong>💡 Tipp:</strong> Deine Website bleibt 7 Tage kostenlos gespeichert. 
            Danach wird sie automatisch gelöscht, falls du sie nicht freischaltest.
          </p>
        </div>
        
        <h3 style="font-size: 18px; font-weight: 600; margin: 30px 0 15px;">
          Was ist als Nächstes?
        </h3>
        
        <ol style="font-size: 15px; line-height: 1.8; color: #475569; padding-left: 20px;">
          <li>Schau dir deine Website an und passe sie bei Bedarf an</li>
          <li>Freischalten für nur 39 €/Monat (erster Monat)</li>
          <li>Deine Domain verbinden oder eine neue registrieren</li>
          <li>Online gehen und Kunden gewinnen!</li>
        </ol>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Pageblitz - Professionelle Websites in Minuten<br>
          <a href="https://pageblitz.de" style="color: #6366f1;">pageblitz.de</a>
        </p>
      </div>
    `,
  }),

  /**
   * Abandoned cart recovery - email captured but onboarding not started
   */
  abandonedEmailCaptured: (data: {
    businessName: string;
    startUrl: string;
  }): EmailTemplate => ({
    subject: `Schon fast fertig: Deine Website für ${data.businessName}`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #6366f1;">Pageblitz</h1>
        </div>
        
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">
          Du hast es fast geschafft!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hallo,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          du hast begonnen, eine Website für <strong>${data.businessName}</strong> zu erstellen, 
          aber noch nicht abgeschlossen. Brauchst du Hilfe?
        </p>
        
        <div style="background: #f8fafc; border-radius: 12px; padding: 24px; margin: 30px 0; text-align: center;">
          <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">
            Es dauert nur noch 2 Minuten:
          </p>
          <a href="${data.startUrl}" 
             style="display: inline-block; background: #6366f1; color: white; padding: 14px 28px; 
                    border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
            Website fertigstellen →
          </a>
        </div>
        
        <div style="margin: 30px 0;">
          <h3 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Warum Pageblitz?</h3>
          <ul style="font-size: 14px; line-height: 1.8; color: #475569; padding-left: 20px;">
            <li>✓ Professionelles Design in 5 Minuten</li>
            <li>✓ Keine Vorkenntnisse nötig</li>
            <li>✓ Mobile-optimiert</li>
            <li>✓ SSL & Hosting inklusive</li>
            <li>✓ Ab 39 €/Monat</li>
          </ul>
        </div>
        
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 30px;">
          Falls du Fragen hast oder Unterstützung brauchst, antworte einfach auf diese E-Mail. 
          Wir helfen dir gerne weiter!
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Pageblitz - Professionelle Websites in Minuten<br>
          <a href="https://pageblitz.de" style="color: #6366f1;">pageblitz.de</a>
        </p>
      </div>
    `,
  }),

  /**
   * Abandoned cart recovery - onboarding started but not completed
   */
  abandonedOnboarding: (data: {
    businessName: string;
    previewUrl: string;
  }): EmailTemplate => ({
    subject: `Nur noch ein Schritt: ${data.businessName} online bringen`,
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
        <div style="text-align: center; margin-bottom: 40px;">
          <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #6366f1;">Pageblitz</h1>
        </div>
        
        <h2 style="font-size: 24px; font-weight: 600; margin-bottom: 20px;">
          Deine Website wartet auf dich!
        </h2>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          Hallo,
        </p>
        
        <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
          du hast die Website für <strong>${data.businessName}</strong> fast fertiggestellt. 
          Nur noch ein kleiner Schritt fehlt!
        </p>
        
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); 
                    border-radius: 12px; padding: 30px; margin: 30px 0; text-align: center; color: white;">
          <p style="font-size: 18px; font-weight: 600; margin-bottom: 20px;">
            Bereit zum Launch?
          </p>
          <a href="${data.previewUrl}" 
             style="display: inline-block; background: white; color: #6366f1; padding: 16px 32px; 
                    border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px;">
            Website freischalten →
          </a>
        </div>
        
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px 20px; margin: 30px 0;">
          <p style="font-size: 14px; margin: 0; color: #92400e;">
            <strong>⏰ Hinweis:</strong> Deine Website bleibt noch 5 Tage kostenlos verfügbar. 
            Danach wird sie automatisch gelöscht.
          </p>
        </div>
        
        <p style="font-size: 14px; color: #64748b; line-height: 1.6; margin-top: 30px;">
          Brauchst du Hilfe beim Abschluss? Antworte auf diese E-Mail – wir unterstützen dich gerne!
        </p>
        
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 40px 0;">
        
        <p style="font-size: 12px; color: #94a3b8; text-align: center;">
          Pageblitz - Professionelle Websites in Minuten<br>
          <a href="https://pageblitz.de" style="color: #6366f1;">pageblitz.de</a>
        </p>
      </div>
    `,
  }),
};

/**
 * Send Magic Link login email
 */
export async function sendMagicLinkEmail(to: string, magicUrl: string): Promise<{ success: boolean; error?: string }> {
  return sendEmail({
    to,
    from: "Pageblitz <noreply@pageblitz.de>",
    subject: "Dein Login-Link für Pageblitz",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 32px 16px;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: #18181b; padding: 28px 32px;">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
        <div style="width: 32px; height: 32px; background: #ffffff; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center;">
          <span style="font-size: 18px; line-height: 1;">⚡</span>
        </div>
        <span style="color: #ffffff; font-size: 18px; font-weight: 700; letter-spacing: -0.3px;">Page<span style="color: #818cf8;">blitz</span></span>
      </div>
      <p style="color: #a1a1aa; font-size: 12px; margin: 8px 0 0 0; text-transform: uppercase; letter-spacing: 0.08em;">Login-Link</p>
    </div>
    <!-- Body -->
    <div style="padding: 32px;">
      <h2 style="color: #18181b; font-size: 20px; font-weight: 600; margin: 0 0 12px 0;">Willkommen zurück! 👋</h2>
      <p style="color: #52525b; font-size: 15px; line-height: 1.6; margin: 0 0 28px 0;">
        Klicke auf den Button unten, um dich sicher in deinen Pageblitz-Account einzuloggen.<br>
        Kein Passwort nötig.
      </p>
      <!-- CTA Button -->
      <div style="text-align: center; margin-bottom: 28px;">
        <a href="${magicUrl}" style="display: inline-block; background: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 36px; border-radius: 10px; letter-spacing: 0.01em;">
          Jetzt einloggen →
        </a>
      </div>
      <!-- Security note -->
      <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px;">
        <p style="color: #6b7280; font-size: 12px; margin: 0; line-height: 1.5;">
          🔒 Dieser Link ist <strong>15 Minuten gültig</strong> und kann nur <strong>einmal verwendet</strong> werden.<br>
          Falls du diesen Login nicht angefordert hast, kannst du diese E-Mail ignorieren.
        </p>
      </div>
      <!-- Fallback URL -->
      <p style="color: #9ca3af; font-size: 11px; margin: 20px 0 0 0; word-break: break-all;">
        Link funktioniert nicht? Kopiere diese URL in deinen Browser:<br>
        <span style="color: #6366f1;">${magicUrl}</span>
      </p>
    </div>
    <!-- Footer -->
    <div style="background: #f9fafb; border-top: 1px solid #f0f0f0; padding: 16px 32px; text-align: center;">
      <p style="color: #9ca3af; font-size: 11px; margin: 0;">
        © ${new Date().getFullYear()} Pageblitz · <a href="https://pageblitz.de" style="color: #9ca3af;">pageblitz.de</a>
      </p>
    </div>
  </div>
</body>
</html>`,
  });
}

/**
 * Send lead nurturing email based on capture status
 */
export async function sendLeadEmail({
  to,
  template,
  data,
}: {
  to: string;
  template: keyof typeof emailTemplates;
  data: Parameters<(typeof emailTemplates)[typeof template]>[0];
}): Promise<{ success: boolean; error?: string; id?: string }> {
  const templateFn = emailTemplates[template];
  const { subject, html } = templateFn(data as any);
  
  return sendEmail({ to, subject, html });
}

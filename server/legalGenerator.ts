/**
 * Legal Page Generator
 * Generates DSGVO-compliant Impressum and Datenschutz pages
 * using real business data from the onboarding process.
 */

interface LegalData {
  businessName: string;
  legalOwner: string;
  legalStreet: string;
  legalZip: string;
  legalCity: string;
  legalCountry?: string;
  legalEmail: string;
  legalPhone?: string;
  legalVatId?: string;
  legalRegister?: string;
  legalRegisterCourt?: string;
  legalResponsible?: string;
  websiteUrl?: string;
}

export function generateImpressum(data: LegalData): string {
  const country = data.legalCountry || "Deutschland";
  const responsible = data.legalResponsible || data.legalOwner;

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Impressum – ${data.businessName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    p { margin: 0.5rem 0; }
    a { color: #2563eb; }
    .back-link { display: inline-block; margin-bottom: 2rem; color: #6b7280; text-decoration: none; font-size: 0.875rem; }
    .back-link:hover { color: #1a1a1a; }
  </style>
</head>
<body>
  <a href="javascript:history.back()" class="back-link">← Zurück zur Website</a>
  <h1>Impressum</h1>

  <h2>Angaben gemäß § 5 TMG</h2>
  <p><strong>${data.businessName}</strong></p>
  <p>${data.legalStreet}</p>
  <p>${data.legalZip} ${data.legalCity}</p>
  <p>${country}</p>

  <h2>Vertreten durch</h2>
  <p>${data.legalOwner}</p>

  <h2>Kontakt</h2>
  ${data.legalPhone ? `<p>Telefon: <a href="tel:${data.legalPhone}">${data.legalPhone}</a></p>` : ""}
  <p>E-Mail: <a href="mailto:${data.legalEmail}">${data.legalEmail}</a></p>
  ${data.websiteUrl ? `<p>Website: <a href="${data.websiteUrl}" target="_blank">${data.websiteUrl}</a></p>` : ""}

  ${data.legalVatId ? `
  <h2>Umsatzsteuer-ID</h2>
  <p>Umsatzsteuer-Identifikationsnummer gemäß § 27a Umsatzsteuergesetz:</p>
  <p>${data.legalVatId}</p>
  ` : ""}

  ${data.legalRegister ? `
  <h2>Handelsregister</h2>
  <p>Registernummer: ${data.legalRegister}</p>
  ${data.legalRegisterCourt ? `<p>Registergericht: ${data.legalRegisterCourt}</p>` : ""}
  ` : ""}

  <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV</h2>
  <p>${responsible}</p>
  <p>${data.legalStreet}, ${data.legalZip} ${data.legalCity}</p>

  <h2>Streitschlichtung</h2>
  <p>Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit: 
  <a href="https://ec.europa.eu/consumers/odr/" target="_blank">https://ec.europa.eu/consumers/odr/</a></p>
  <p>Unsere E-Mail-Adresse finden Sie oben im Impressum.</p>
  <p>Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>

  <h2>Haftung für Inhalte</h2>
  <p>Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.</p>

  <h2>Urheberrecht</h2>
  <p>Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.</p>
</body>
</html>
`.trim();
}

export function generateDatenschutz(data: LegalData): string {
  const country = data.legalCountry || "Deutschland";

  return `
<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Datenschutzerklärung – ${data.businessName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 800px; margin: 0 auto; padding: 2rem; color: #1a1a1a; line-height: 1.6; }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1.25rem; margin-top: 2rem; margin-bottom: 0.5rem; border-bottom: 1px solid #e5e7eb; padding-bottom: 0.5rem; }
    h3 { font-size: 1rem; margin-top: 1.5rem; font-weight: 600; }
    p { margin: 0.5rem 0; }
    a { color: #2563eb; }
    .back-link { display: inline-block; margin-bottom: 2rem; color: #6b7280; text-decoration: none; font-size: 0.875rem; }
    .back-link:hover { color: #1a1a1a; }
  </style>
</head>
<body>
  <a href="javascript:history.back()" class="back-link">← Zurück zur Website</a>
  <h1>Datenschutzerklärung</h1>

  <h2>1. Datenschutz auf einen Blick</h2>
  <h3>Allgemeine Hinweise</h3>
  <p>Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>

  <h3>Datenerfassung auf dieser Website</h3>
  <p><strong>Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong></p>
  <p>Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Abschnitt „Hinweis zur Verantwortlichen Stelle" in dieser Datenschutzerklärung entnehmen.</p>

  <h2>2. Hosting</h2>
  <p>Diese Website wird extern gehostet. Die personenbezogenen Daten, die auf dieser Website erfasst werden, werden auf den Servern des Hosters gespeichert.</p>

  <h2>3. Allgemeine Hinweise und Pflichtinformationen</h2>
  <h3>Datenschutz</h3>
  <p>Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.</p>

  <h3>Hinweis zur verantwortlichen Stelle</h3>
  <p>Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:</p>
  <p><strong>${data.businessName}</strong><br>
  ${data.legalOwner}<br>
  ${data.legalStreet}<br>
  ${data.legalZip} ${data.legalCity}<br>
  ${country}</p>
  ${data.legalPhone ? `<p>Telefon: ${data.legalPhone}</p>` : ""}
  <p>E-Mail: <a href="mailto:${data.legalEmail}">${data.legalEmail}</a></p>

  <h3>Speicherdauer</h3>
  <p>Soweit innerhalb dieser Datenschutzerklärung keine speziellere Speicherdauer genannt wurde, verbleiben Ihre personenbezogenen Daten bei uns, bis der Zweck für die Datenverarbeitung entfällt.</p>

  <h3>Ihre Rechte</h3>
  <p>Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.</p>

  <h2>4. Datenerfassung auf dieser Website</h2>
  <h3>Cookies</h3>
  <p>Diese Website verwendet Cookies. Cookies sind kleine Textdateien, die Ihr Webbrowser auf Ihrem Endgerät speichert. Cookies helfen uns, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.</p>

  <h3>Server-Log-Dateien</h3>
  <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage, IP-Adresse.</p>

  <h2>5. Kontaktformular</h2>
  <p>Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.</p>

  <p><em>Stand: ${new Date().toLocaleDateString("de-DE")}</em></p>
</body>
</html>
`.trim();
}

/**
 * Patches website HTML/JSON data with real onboarding data.
 * Replaces placeholder text and Unsplash image URLs with real content.
 */
export function patchWebsiteData(
  websiteData: any,
  onboarding: {
    businessName?: string | null;
    tagline?: string | null;
    description?: string | null;
    usp?: string | null;
    targetAudience?: string | null;
    topServices?: any;
    addOnMenuData?: any;
    addOnPricelistData?: any;
    addOnContactForm?: boolean;
    logoUrl?: string | null;
    photoUrls?: any;
  }
): any {
  if (!websiteData) return websiteData;

  const patched = JSON.parse(JSON.stringify(websiteData)); // deep clone

  // Patch hero section
  if (patched.hero) {
    if (onboarding.businessName) patched.hero.headline = onboarding.businessName;
    if (onboarding.tagline) patched.hero.subheadline = onboarding.tagline;
    if (onboarding.description) patched.hero.description = onboarding.description;
    // Replace hero image with first uploaded photo
    const photos = Array.isArray(onboarding.photoUrls) ? onboarding.photoUrls : [];
    if (photos.length > 0) {
      patched.hero.imageUrl = photos[0];
      patched.heroImageUrl = photos[0];
    }
  }

  // Patch logo
  if (onboarding.logoUrl) {
    patched.logoUrl = onboarding.logoUrl;
    if (patched.navbar) patched.navbar.logoUrl = onboarding.logoUrl;
  }

  // Patch about section
  if (patched.about) {
    if (onboarding.description) patched.about.text = onboarding.description;
    if (onboarding.usp) patched.about.usp = onboarding.usp;
    const photos = Array.isArray(onboarding.photoUrls) ? onboarding.photoUrls : [];
    if (photos.length > 1) patched.about.imageUrl = photos[1];
  }

  // Patch CTA section
  if (onboarding.targetAudience) {
    const ctaSection = patched.sections?.find((s: any) => s.type === "cta");
    if (ctaSection) {
      ctaSection.content = onboarding.targetAudience;
    }
  }

  // Patch services
  if (patched.services && onboarding.topServices) {
    const services = Array.isArray(onboarding.topServices)
      ? onboarding.topServices
      : typeof onboarding.topServices === "string"
        ? onboarding.topServices.split(",").map((s: string) => ({ title: s.trim(), description: "" }))
        : [];
    if (services.length > 0) {
      patched.services.items = services.map((s: any, i: number) => ({
        ...((patched.services.items || [])[i] || {}),
        title: typeof s === "string" ? s : s.title || s,
        description: typeof s === "object" ? s.description || "" : "",
      }));
    }
  }

  // Patch menu & pricelist
  if (onboarding.addOnMenuData?.categories) {
    patched.addOnMenuData = onboarding.addOnMenuData;
    const filledCategories = (onboarding.addOnMenuData.categories || []).filter((c: any) => (c.name || "").trim() || (c.items || []).some((i: any) => (i.name || "").trim()));
    if (filledCategories.length > 0) {
      if (!patched.sections) patched.sections = [];
      patched.sections.push({
        type: "menu",
        headline: onboarding.addOnMenuData.headline || "Unsere Speisekarte",
        items: filledCategories.flatMap((c: any) => (c.items || []).filter((i: any) => (i.name || "").trim()).map((i: any) => ({
          title: i.name,
          description: i.description,
          price: i.price,
          category: c.name
        })))
      });
    }
  }
  if (onboarding.addOnPricelistData?.categories) {
    patched.addOnPricelistData = onboarding.addOnPricelistData;
    const filledCategories = (onboarding.addOnPricelistData.categories || []).filter((c: any) => (c.name || "").trim() || (c.items || []).some((i: any) => (i.name || "").trim()));
    if (filledCategories.length > 0) {
      if (!patched.sections) patched.sections = [];
      patched.sections.push({
        type: "pricelist",
        headline: onboarding.addOnPricelistData.headline || "Unsere Preise",
        items: filledCategories.flatMap((c: any) => (c.items || []).filter((i: any) => (i.name || "").trim()).map((i: any) => ({
          title: i.name,
          price: i.price,
          category: c.name
        })))
      });
    }
  }

  // Ensure contact section exists if addon is active
  if (onboarding.addOnContactForm !== false && !patched.sections?.some((s: any) => s.type === "contact")) {
    if (!patched.sections) patched.sections = [];
    patched.sections.push({
      type: "contact",
      headline: "Kontakt",
      content: "Wir freuen uns auf Ihre Nachricht.",
      ctaText: "Jetzt Nachricht senden"
    });
  }

  // Patch gallery section
  if (onboarding.photoUrls && Array.isArray(onboarding.photoUrls) && onboarding.photoUrls.length > 0) {
    const gallerySection = patched.sections?.find((s: any) => s.type === "gallery");
    if (gallerySection) {
      gallerySection.items = onboarding.photoUrls.map((url: string) => ({ imageUrl: url }));
      gallerySection.images = onboarding.photoUrls; // Fallback
    }
  }

  // Replace remaining Unsplash URLs with uploaded photos
  const photos = Array.isArray(onboarding.photoUrls) ? onboarding.photoUrls : [];
  if (photos.length > 0) {
    const patchedStr = JSON.stringify(patched).replace(
      /https:\/\/images\.unsplash\.com\/[^"]+/g,
      (match) => {
        const idx = Math.floor(Math.random() * photos.length);
        return photos[idx] || match;
      }
    );
    return JSON.parse(patchedStr);
  }

  return patched;
}

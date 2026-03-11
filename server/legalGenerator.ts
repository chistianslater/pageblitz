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
  const date = new Date().toLocaleDateString("de-DE");

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
    p, li { margin: 0.5rem 0; }
    ul { padding-left: 1.5rem; }
    a { color: #2563eb; }
    .back-link { display: inline-block; margin-bottom: 2rem; color: #6b7280; text-decoration: none; font-size: 0.875rem; }
    .back-link:hover { color: #1a1a1a; }
    .highlight { background: #f8fafc; border-left: 3px solid #3b82f6; padding: 0.75rem 1rem; margin: 1rem 0; border-radius: 0 4px 4px 0; }
  </style>
</head>
<body>
  <a href="javascript:history.back()" class="back-link">← Zurück zur Website</a>
  <h1>Datenschutzerklärung</h1>

  <h2>1. Verantwortliche Stelle</h2>
  <p>Verantwortlich für die Datenverarbeitung auf dieser Website im Sinne der DSGVO ist:</p>
  <div class="highlight">
    <strong>${data.businessName}</strong><br>
    ${data.legalOwner}<br>
    ${data.legalStreet}<br>
    ${data.legalZip} ${data.legalCity}<br>
    ${country}<br>
    ${data.legalPhone ? `Telefon: ${data.legalPhone}<br>` : ""}
    E-Mail: <a href="mailto:${data.legalEmail}">${data.legalEmail}</a>
  </div>

  <h2>2. Allgemeines zur Datenverarbeitung</h2>
  <h3>Umfang der Verarbeitung personenbezogener Daten</h3>
  <p>Wir verarbeiten personenbezogene Daten unserer Nutzer grundsätzlich nur, soweit dies zur Bereitstellung einer funktionsfähigen Website sowie unserer Inhalte und Leistungen erforderlich ist. Die Verarbeitung personenbezogener Daten erfolgt regelmäßig nur nach Einwilligung des Nutzers oder wenn die Verarbeitung durch gesetzliche Vorschriften erlaubt ist.</p>

  <h3>Rechtsgrundlagen</h3>
  <p>Soweit wir für Verarbeitungsvorgänge personenbezogener Daten eine Einwilligung einholen, dient Art. 6 Abs. 1 lit. a DSGVO als Rechtsgrundlage. Bei der Verarbeitung zur Erfüllung eines Vertrags oder zur Durchführung vorvertraglicher Maßnahmen gilt Art. 6 Abs. 1 lit. b DSGVO. Für gesetzlich vorgeschriebene Verarbeitungen gilt Art. 6 Abs. 1 lit. c DSGVO. Zur Wahrung berechtigter Interessen gilt Art. 6 Abs. 1 lit. f DSGVO.</p>

  <h3>Datenlöschung und Speicherdauer</h3>
  <p>Die personenbezogenen Daten der betroffenen Person werden gelöscht oder gesperrt, sobald der Zweck der Speicherung entfällt. Eine Speicherung kann darüber hinaus erfolgen, wenn dies durch den europäischen oder nationalen Gesetzgeber in unionsrechtlichen Verordnungen, Gesetzen oder sonstigen Vorschriften vorgesehen wurde. Eine Sperrung oder Löschung der Daten erfolgt auch dann, wenn eine durch die genannten Normen vorgeschriebene Speicherfrist abläuft.</p>

  <h2>3. Hosting</h2>
  <p>Diese Website wird auf Servern in der Europäischen Union gehostet. Der Hostingdienstleister verarbeitet Zugriffsdaten (sog. Server-Log-Dateien) ausschließlich zur Sicherstellung des technischen Betriebs der Website.</p>
  <p><strong>Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der sicheren und störungsfreien Bereitstellung der Website).</p>

  <h2>4. Datenerfassung auf dieser Website</h2>

  <h3>Server-Log-Dateien</h3>
  <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch übermittelt. Dies sind:</p>
  <ul>
    <li>Browsertyp und Browserversion</li>
    <li>Verwendetes Betriebssystem</li>
    <li>Referrer URL</li>
    <li>Hostname des zugreifenden Rechners</li>
    <li>Uhrzeit der Serveranfrage</li>
    <li>IP-Adresse (anonymisiert)</li>
  </ul>
  <p>Diese Daten werden nicht mit anderen Datenquellen zusammengeführt. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO.</p>

  <h3>Cookies</h3>
  <p>Diese Website verwendet ausschließlich technisch notwendige Cookies, die für den Betrieb der Website erforderlich sind. Es werden keine Tracking- oder Werbe-Cookies eingesetzt. Notwendige Cookies werden auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO gesetzt.</p>

  ${data.legalPhone || data.legalEmail ? `
  <h3>Kontaktformular und Kontaktaufnahme</h3>
  <p>Wenn Sie uns per Kontaktformular oder E-Mail Anfragen zukommen lassen, werden Ihre Angaben inklusive der von Ihnen angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Rückfragen gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.</p>
  <p>Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt, oder auf Grundlage unserer berechtigten Interessen (Art. 6 Abs. 1 lit. f DSGVO). Die Daten werden gelöscht, sobald sie für die Erreichung des Zweckes ihrer Erhebung nicht mehr erforderlich sind, spätestens jedoch nach 6 Monaten.</p>
  ` : ""}

  <h2>5. Google Maps</h2>
  <p>Diese Website nutzt über einen Link den Kartendienst Google Maps der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irland. Wenn Sie auf den Adresslink klicken, werden Sie zu Google Maps weitergeleitet. Dabei kann Google Daten über Ihre Nutzung verarbeiten. Weitere Informationen finden Sie in der Datenschutzerklärung von Google: <a href="https://policies.google.com/privacy" target="_blank" rel="noopener">https://policies.google.com/privacy</a>.</p>

  <h2>6. Ihre Rechte als betroffene Person</h2>
  <p>Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:</p>
  <ul>
    <li><strong>Auskunftsrecht</strong> (Art. 15 DSGVO): Sie können jederzeit Auskunft über die bei uns gespeicherten Daten anfordern.</li>
    <li><strong>Recht auf Berichtigung</strong> (Art. 16 DSGVO): Sie können die Berichtigung unrichtiger Daten verlangen.</li>
    <li><strong>Recht auf Löschung</strong> (Art. 17 DSGVO): Sie können die Löschung Ihrer Daten verlangen, sofern kein gesetzlicher Grund zur weiteren Speicherung besteht.</li>
    <li><strong>Recht auf Einschränkung der Verarbeitung</strong> (Art. 18 DSGVO): Sie können die Einschränkung der Verarbeitung verlangen.</li>
    <li><strong>Recht auf Datenübertragbarkeit</strong> (Art. 20 DSGVO): Sie können die Übertragung Ihrer Daten in einem maschinenlesbaren Format verlangen.</li>
    <li><strong>Widerspruchsrecht</strong> (Art. 21 DSGVO): Sie können der Verarbeitung Ihrer Daten auf Basis berechtigter Interessen widersprechen.</li>
    <li><strong>Widerruf der Einwilligung</strong> (Art. 7 Abs. 3 DSGVO): Sofern die Verarbeitung auf einer Einwilligung beruht, können Sie diese jederzeit widerrufen.</li>
  </ul>
  <p>Zur Ausübung dieser Rechte wenden Sie sich bitte an: <a href="mailto:${data.legalEmail}">${data.legalEmail}</a></p>

  <h2>7. Beschwerderecht bei der Aufsichtsbehörde</h2>
  <p>Sie haben gemäß Art. 77 DSGVO das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren. Die für uns zuständige Aufsichtsbehörde richtet sich nach dem Bundesland des Unternehmenssitzes. Eine Liste der Aufsichtsbehörden finden Sie unter: <a href="https://www.bfdi.bund.de/DE/Infothek/Anschriften_Links/anschriften_links-node.html" target="_blank" rel="noopener">www.bfdi.bund.de</a>.</p>

  <h2>8. Datensicherheit</h2>
  <p>Diese Website nutzt aus Sicherheitsgründen eine SSL- bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von „http://" auf „https://" wechselt und an dem Schloss-Symbol in der Browserzeile. Wenn die SSL- bzw. TLS-Verschlüsselung aktiviert ist, können die Daten, die Sie an uns übermitteln, nicht von Dritten mitgelesen werden.</p>

  <p style="margin-top: 2rem; font-size: 0.875rem; color: #6b7280;"><em>Stand: ${date}</em></p>
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

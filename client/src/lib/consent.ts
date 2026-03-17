/**
 * Pageblitz Cookie-Consent Manager
 *
 * GA4, Microsoft Clarity und Meta Pixel werden erst nach expliziter
 * Zustimmung des Nutzers dynamisch geladen.
 * Rybbit läuft cookielos ohne Einwilligung.
 */

export const CONSENT_KEY = "pageblitz_site_consent_v1";

export type ConsentData = {
  /** Google Analytics 4 + Microsoft Clarity */
  analytics: boolean;
  /** Meta Pixel */
  marketing: boolean;
  timestamp: number;
};

/** Gespeicherte Einwilligung aus localStorage lesen. */
export function getStoredConsent(): ConsentData | null {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentData;
  } catch {
    return null;
  }
}

/** Einwilligung speichern und Skripte sofort laden. */
export function saveConsent(data: Omit<ConsentData, "timestamp">): void {
  const consent: ConsentData = { ...data, timestamp: Date.now() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  } catch {
    // ignore storage errors
  }
  loadConsentedScripts(consent);
  // Fire PageView immediately when user accepts – the fbq stub queues it
  // and fbevents.js will process it once loaded from CDN
  if (data.marketing) {
    trackMetaPageView();
  }
}

/**
 * Beim App-Start aufrufen: lädt bereits erteilte Einwilligungen nach.
 * So werden Skripte bei wiederkehrenden Besuchern sofort geladen.
 */
export function initConsent(): void {
  const consent = getStoredConsent();
  if (consent) loadConsentedScripts(consent);
}

/** Skripte entsprechend der Einwilligung dynamisch ins DOM injizieren. */
export function loadConsentedScripts(consent: ConsentData): void {
  if (consent.analytics) {
    injectGoogleAnalytics();
    injectMicrosoftClarity();
  }
  if (consent.marketing) {
    injectMetaPixel();
  }
}

/**
 * Meta Pixel PageView manuell feuern – z.B. bei SPA-Routenwechseln.
 * Nur aufrufen, wenn Marketing-Consent erteilt wurde.
 */
export function trackMetaPageView(): void {
  try {
    const w = window as any;
    if (typeof w.fbq === "function") {
      w.fbq("track", "PageView");
    }
  } catch {
    // ignore
  }
}

/** Marketing-Consent prüfen. */
export function hasMarketingConsent(): boolean {
  return getStoredConsent()?.marketing === true;
}

// ─── Injektion-Helpers ────────────────────────────────────────────────────────

function injectGoogleAnalytics(): void {
  if (document.getElementById("pb-ga-script")) return;

  const s1 = document.createElement("script");
  s1.id = "pb-ga-script";
  s1.async = true;
  s1.src = "https://www.googletagmanager.com/gtag/js?id=G-3ZF2WR4VWF";
  document.head.appendChild(s1);

  const s2 = document.createElement("script");
  s2.id = "pb-ga-init";
  s2.textContent = [
    "window.dataLayer = window.dataLayer || [];",
    "function gtag(){dataLayer.push(arguments);}",
    "gtag('js', new Date());",
    "gtag('config', 'G-3ZF2WR4VWF');",
  ].join("\n");
  document.head.appendChild(s2);
}

function injectMicrosoftClarity(): void {
  if (document.getElementById("pb-clarity-script")) return;

  const s = document.createElement("script");
  s.id = "pb-clarity-script";
  s.textContent = `(function(c,l,a,r,i,t,y){` +
    `c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};` +
    `t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;` +
    `y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);` +
    `})(window,document,"clarity","script","vv9mc9arbs");`;
  document.head.appendChild(s);
}

function injectMetaPixel(): void {
  if (document.getElementById("pb-meta-pixel")) return;

  const s = document.createElement("script");
  s.id = "pb-meta-pixel";
  // Standard Meta Pixel bootstrap – sets up fbq stub + loads fbevents.js async.
  // PageView is NOT fired here; trackMetaPageView() handles that so we can
  // fire it on every SPA route change without duplicates.
  s.textContent =
    `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?` +
    `n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;` +
    `n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;` +
    `t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}` +
    `(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');` +
    `fbq('init','2254773071720412');`;
  document.head.appendChild(s);
}

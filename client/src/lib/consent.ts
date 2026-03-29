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
  // Update Google Consent Mode v2 signals
  updateGoogleConsent(consent);
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
  if (consent) {
    updateGoogleConsent(consent);
    loadConsentedScripts(consent);
  }
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

// ─── Google Consent Mode v2 ──────────────────────────────────────────────────

/** Consent-Signale an Google senden (Consent Mode v2, Pflicht für EWR seit 03/2024). */
function updateGoogleConsent(consent: ConsentData): void {
  try {
    const gtag: any = (window as any).gtag;
    if (typeof gtag !== "function") return;
    const granted = (v: boolean) => (v ? "granted" : "denied");
    gtag("consent", "update", {
      ad_storage: granted(consent.marketing),
      ad_user_data: granted(consent.marketing),
      ad_personalization: granted(consent.marketing),
      analytics_storage: granted(consent.analytics),
    });
  } catch {
    // ignore – gtag might not be loaded yet
  }
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

  const w = window as any;

  // 1. Build the fbq stub directly in JS – no inline <script> textContent needed,
  //    so there are zero CSP / browser-execution edge cases.
  if (!w.fbq) {
    const fbq: any = function (...args: any[]) {
      if (fbq.callMethod) {
        fbq.callMethod(...args);
      } else {
        (fbq.queue = fbq.queue || []).push(args);
      }
    };
    fbq.push    = fbq;
    fbq.loaded  = true;
    fbq.version = "2.0";
    fbq.queue   = [];
    w.fbq  = fbq;
    w._fbq = fbq;
  }

  // 2. Queue the pixel init call (processed once fbevents.js loads)
  w.fbq("init", "2254773071720412");

  // 3. Load fbevents.js via a plain <script src> – reliable in all browsers
  const s = document.createElement("script");
  s.id    = "pb-meta-pixel";
  s.async = true;
  s.src   = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(s);
  // PageView is fired by trackMetaPageView() via App.tsx route-change effect
}

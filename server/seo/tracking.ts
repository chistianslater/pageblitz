const CONSENT_KEY = "pageblitz_site_consent_v1";
const GA4_MEASUREMENT_ID = "G-3ZF2WR4VWF";

const TRACKING_CSS = `
.pb-seo-consent{position:fixed;z-index:9999;left:12px;right:12px;bottom:12px;max-width:680px;margin:0 auto;padding:18px;background:#fff;color:#242424;border:1px solid #d8ddce;border-radius:14px;box-shadow:0 24px 48px -24px rgba(29,26,23,.35);font:14px/1.5 "Space Grotesk",system-ui,sans-serif}
.pb-seo-consent[hidden],.pb-seo-consent-details[hidden]{display:none}
.pb-seo-consent h2{font-size:16px;margin:0 0 6px;color:#242424}
.pb-seo-consent p{margin:0;color:#62675b}
.pb-seo-consent a{color:#425000;text-decoration:underline}
.pb-seo-consent-details{display:grid;gap:8px;margin-top:14px;padding-top:14px;border-top:1px solid #d8ddce}
.pb-seo-consent-details label{display:flex;gap:8px;align-items:flex-start;color:#242424}
.pb-seo-consent-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:16px}
.pb-seo-consent button,.pb-cookie-settings{font:inherit;cursor:pointer}
.pb-seo-consent button{min-height:42px;padding:9px 14px;border:1px solid #d8ddce;border-radius:7px;background:#fff;color:#242424}
.pb-seo-consent button[data-primary]{background:#d7ef45;border-color:#d7ef45;color:#202514;font-weight:600}
.pb-cookie-settings{padding:0;border:0;background:transparent;color:inherit;text-decoration:underline}
@media(max-width:520px){.pb-seo-consent-actions{display:grid}.pb-seo-consent button{width:100%}}
`;

const TRACKING_SCRIPT = `
(function(w,d){
  var key=${JSON.stringify(CONSENT_KEY)};
  var gaId=${JSON.stringify(GA4_MEASUREMENT_ID)};
  var banner=d.getElementById('pb-seo-consent');
  var details=d.getElementById('pb-seo-consent-details');
  var analytics=d.getElementById('pb-seo-consent-analytics');
  var marketing=d.getElementById('pb-seo-consent-marketing');
  w.dataLayer=w.dataLayer||[];
  w.gtag=w.gtag||function(){w.dataLayer.push(arguments)};
  w.gtag('consent','default',{ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',analytics_storage:'denied',wait_for_update:500});

  function read(){try{var value=localStorage.getItem(key);return value?JSON.parse(value):null}catch(e){return null}}
  function update(value){
    var granted=function(flag){return flag?'granted':'denied'};
    w.gtag('consent','update',{ad_storage:granted(value.marketing),ad_user_data:granted(value.marketing),ad_personalization:granted(value.marketing),analytics_storage:granted(value.analytics)});
  }
  function loadAnalytics(){
    if(d.getElementById('pb-ga-script'))return;
    var script=d.createElement('script');
    script.id='pb-ga-script';script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+gaId;
    d.head.appendChild(script);
    w.gtag('js',new Date());
    w.gtag('config',gaId);
  }
  function apply(value){update(value);if(value.analytics)loadAnalytics()}
  function save(value){
    value.timestamp=Date.now();
    try{localStorage.setItem(key,JSON.stringify(value))}catch(e){}
    apply(value);banner.hidden=true;
  }
  function open(){
    var value=read();
    analytics.checked=!!(value&&value.analytics);
    marketing.checked=!!(value&&value.marketing);
    details.hidden=false;banner.hidden=false;
  }

  var stored=read();
  if(stored){apply(stored)}else{setTimeout(function(){banner.hidden=false},600)}
  d.querySelectorAll('[data-pb-cookie-settings]').forEach(function(button){button.addEventListener('click',open)});
  d.getElementById('pb-seo-consent-details-toggle').addEventListener('click',function(){details.hidden=!details.hidden});
  d.getElementById('pb-seo-consent-necessary').addEventListener('click',function(){save({analytics:false,marketing:false})});
  d.getElementById('pb-seo-consent-all').addEventListener('click',function(){save({analytics:true,marketing:true})});
  d.getElementById('pb-seo-consent-save').addEventListener('click',function(){save({analytics:analytics.checked,marketing:marketing.checked})});
  d.addEventListener('click',function(event){
    var link=event.target.closest&&event.target.closest('a[href="/start"],a[href="https://pageblitz.de/start"]');
    if(!link||!read()?.analytics)return;
    w.gtag('event','cta_clicked',{cta_text:(link.textContent||'').trim(),cta_location:w.location.pathname,transport_type:'beacon'});
  });
})(window,document);
`;

export function renderSeoTrackingHead(): string {
  return `<style>${TRACKING_CSS}</style>`;
}

export function renderSeoConsentBody(): string {
  return `<aside id="pb-seo-consent" class="pb-seo-consent" role="dialog" aria-modal="true" aria-labelledby="pb-seo-consent-title" hidden>
  <h2 id="pb-seo-consent-title">Cookies &amp; Datenschutz</h2>
  <p>Notwendige Funktionen sind immer aktiv. Statistik und Marketing laden wir nur mit deiner Zustimmung. <a href="/datenschutz">Datenschutzerklärung</a></p>
  <div id="pb-seo-consent-details" class="pb-seo-consent-details" hidden>
    <label><input id="pb-seo-consent-analytics" type="checkbox"> <span><strong>Analyse</strong><br>Google Analytics 4 zur anonymisierten Nutzungsmessung.</span></label>
    <label><input id="pb-seo-consent-marketing" type="checkbox"> <span><strong>Marketing</strong><br>Messung von Werbekampagnen nach dem Wechsel in den Builder.</span></label>
  </div>
  <div class="pb-seo-consent-actions">
    <button id="pb-seo-consent-details-toggle" type="button">Auswahl</button>
    <button id="pb-seo-consent-necessary" type="button">Nur notwendig</button>
    <button id="pb-seo-consent-save" type="button">Auswahl speichern</button>
    <button id="pb-seo-consent-all" type="button" data-primary>Alle akzeptieren</button>
  </div>
</aside>
<script>${TRACKING_SCRIPT}</script>`;
}

export const SEO_COOKIE_SETTINGS_BUTTON =
  '<button type="button" class="pb-cookie-settings" data-pb-cookie-settings>Cookie-Einstellungen</button>';

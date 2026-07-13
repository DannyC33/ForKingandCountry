'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { getConsent, revokeAnalyticsCookies, revokeMarketingCookies } from '@/lib/cookies';

// ─── Replace with your real IDs when ready ────────────────────────────────────
const GA_ID = 'G-MCDFFJVR0B';
const GADS_ID = '';           // e.g. 'AW-XXXXXXXXXX'
const FB_PIXEL_ID = '';       // e.g. '123456789012345'
const RS_WRITE_KEY  = '3GSkhyHOa5uCQQ7Ug4aLmVyFkBL';
const RS_DATA_PLANE = 'https://servusdankliam.dataplane.rudderstack.com';
// ─────────────────────────────────────────────────────────────────────────────

export default function TrackingScripts() {
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [marketingAllowed, setMarketingAllowed] = useState(false);

  const readConsent = () => {
    const prev = { analytics: analyticsAllowed, marketing: marketingAllowed };
    const consent = getConsent();
    const next = {
      analytics: consent?.categories.analytics ?? false,
      marketing: consent?.categories.marketing ?? false,
    };

    // Revoke cookies when a category is turned off
    if (prev.analytics && !next.analytics) revokeAnalyticsCookies();
    if (prev.marketing && !next.marketing) revokeMarketingCookies();

    setAnalyticsAllowed(next.analytics);
    setMarketingAllowed(next.marketing);
  };

  useEffect(() => {
    readConsent();
    window.addEventListener('cookieConsentUpdated', readConsent);
    return () => window.removeEventListener('cookieConsentUpdated', readConsent);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {/*
        Google Consent Mode v2 — must run before any gtag calls.
        Sets everything to 'denied' by default; gtag updates on consent.
      */}
      {(GA_ID || GADS_ID) && (
        <Script id="gcm-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage:     'denied',
            ad_storage:            'denied',
            ad_user_data:          'denied',
            ad_personalization:    'denied',
            wait_for_update:       500,
          });
        `}</Script>
      )}

      {/* ── Google Analytics ── */}
      {analyticsAllowed && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'update', { analytics_storage: 'granted' });
            gtag('js', new Date());
            gtag('config', '${GA_ID}', { anonymize_ip: true });
          `}</Script>
        </>
      )}

      {/* ── Google Ads ── */}
      {marketingAllowed && GADS_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GADS_ID}`}
            strategy="afterInteractive"
          />
          <Script id="gads-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'update', {
              ad_storage: 'granted',
              ad_user_data: 'granted',
              ad_personalization: 'granted',
            });
            gtag('js', new Date());
            gtag('config', '${GADS_ID}');
          `}</Script>
        </>
      )}

      {/* ── Facebook / Meta Pixel ── */}
      {marketingAllowed && FB_PIXEL_ID && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window,document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('consent', 'grant');
          fbq('init', '${FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}</Script>
      )}

      {/* ── RudderStack v3 ── full snippet; page() is fired by RudderPageView on every route change */}
      {analyticsAllowed && RS_WRITE_KEY && RS_DATA_PLANE && (
        <Script id="rudderstack-init" strategy="afterInteractive">{`
          !function(){"use strict";window.RudderSnippetVersion="3.2.0";var e="rudderanalytics";window[e]||(window[e]=[]);
          var rudderanalytics=window[e];if(Array.isArray(rudderanalytics)){
          if(true===rudderanalytics.snippetExecuted&&window.console&&console.error){
          console.error("RudderStack JavaScript SDK snippet included more than once.")}else{rudderanalytics.snippetExecuted=true,
          window.rudderAnalyticsBuildType="legacy";var sdkBaseUrl="https://cdn.rudderlabs.com";var sdkVersion="v3";
          var sdkFileName="rsa.min.js";var scriptLoadingMode="async";
          var r=["setDefaultInstanceKey","load","ready","page","track","identify","alias","group","reset","setAnonymousId","startSession","endSession","consent","addCustomIntegration"];
          for(var n=0;n<r.length;n++){var t=r[n];rudderanalytics[t]=function(r){return function(){var n;
          Array.isArray(window[e])?rudderanalytics.push([r].concat(Array.prototype.slice.call(arguments))):null===(n=window[e][r])||void 0===n||n.apply(window[e],arguments)}}(t)}
          try{new Function('class Test{field=()=>{};test({prop=[]}={}){return prop?(prop?.property??[...prop]):import("");}}'),
          window.rudderAnalyticsBuildType="modern"}catch(i){}
          var d=document.head||document.getElementsByTagName("head")[0];
          var o=document.body||document.getElementsByTagName("body")[0];
          window.rudderAnalyticsAddScript=function(e,r,n){var t=document.createElement("script");
          t.src=e,t.setAttribute("data-loader","RS_JS_SDK"),r&&n&&t.setAttribute(r,n),
          "async"===scriptLoadingMode?t.async=true:"defer"===scriptLoadingMode&&(t.defer=true),
          d?d.insertBefore(t,d.firstChild):o.insertBefore(t,o.firstChild)};
          window.rudderAnalyticsMount=function(){!function(){if("undefined"==typeof globalThis){var e;
          var r=function(){return"undefined"!=typeof self?self:"undefined"!=typeof window?window:null}();
          r&&Object.defineProperty(r,"globalThis",{value:r,configurable:true})}
          }(),window.rudderAnalyticsAddScript(sdkBaseUrl+"/"+sdkVersion+"/"+window.rudderAnalyticsBuildType+"/"+sdkFileName,"data-rsa-write-key","${RS_WRITE_KEY}")};
          "undefined"==typeof Promise||"undefined"==typeof globalThis
            ?window.rudderAnalyticsAddScript("https://polyfill-fastly.io/v3/polyfill.min.js?version=3.111.0&features=Symbol%2CPromise&callback=rudderAnalyticsMount")
            :window.rudderAnalyticsMount();
          var loadOptions={};
          rudderanalytics.load("${RS_WRITE_KEY}","${RS_DATA_PLANE}",loadOptions);
          }}}();
        `}</Script>
      )}
    </>
  );
}

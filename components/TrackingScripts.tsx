'use client';
import { useState, useEffect } from 'react';
import Script from 'next/script';
import { getConsent, revokeAnalyticsCookies, revokeMarketingCookies } from '@/lib/cookies';

// ─── Replace with your real IDs when ready ────────────────────────────────────
const GA_ID = '';             // e.g. 'G-XXXXXXXXXX'
const GADS_ID = '';           // e.g. 'AW-XXXXXXXXXX'
const FB_PIXEL_ID = '';       // e.g. '123456789012345'
const RS_WRITE_KEY = '';      // e.g. 'abc123...'
const RS_DATA_PLANE = '';     // e.g. 'https://yourrs.rudderstack.com'
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

      {/* ── Rudderstack ── */}
      {analyticsAllowed && RS_WRITE_KEY && RS_DATA_PLANE && (
        <Script id="rudderstack-init" strategy="afterInteractive">{`
          rudderanalytics=window.rudderanalytics=[];
          var methods=["load","page","track","identify","alias","group","ready","reset","getAnonymousId","setAnonymousId"];
          for(var i=0;i<methods.length;i++){var m=methods[i];rudderanalytics[m]=function(a){return function(){rudderanalytics.push([a].concat(Array.prototype.slice.call(arguments)))}}(m)}
          rudderanalytics.load("${RS_WRITE_KEY}","${RS_DATA_PLANE}");
          rudderanalytics.page();
        `}</Script>
      )}
    </>
  );
}

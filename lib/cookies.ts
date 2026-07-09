export const CONSENT_COOKIE = 'servus_consent';
const CONSENT_DAYS = 365;

export type ConsentCategories = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
};

export type CookieConsent = {
  categories: ConsentCategories;
  timestamp: string;
};

// ── Cookie read / write ────────────────────────────────────────────────────────

function setCookie(name: string, value: string, days: number): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const secure = typeof location !== 'undefined' && location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax${secure}`;
}

function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function eraseCookie(name: string, domain?: string): void {
  const domainStr = domain ? `; domain=${domain}` : '';
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/${domainStr}`;
}

// ── Consent API ───────────────────────────────────────────────────────────────

export function getConsent(): CookieConsent | null {
  if (typeof document === 'undefined') return null;
  try {
    const raw = readCookie(CONSENT_COOKIE);
    return raw ? (JSON.parse(raw) as CookieConsent) : null;
  } catch {
    return null;
  }
}

export function hasConsented(): boolean {
  return getConsent() !== null;
}

export function saveConsent(analytics: boolean, marketing: boolean): void {
  const consent: CookieConsent = {
    categories: { necessary: true, analytics, marketing },
    timestamp: new Date().toISOString(),
  };
  setCookie(CONSENT_COOKIE, JSON.stringify(consent), CONSENT_DAYS);

  // Revoke platform cookies for unchecked categories
  if (!analytics) revokeAnalyticsCookies();
  if (!marketing) revokeMarketingCookies();

  window.dispatchEvent(new Event('cookieConsentUpdated'));
}

// ── Cookie revocation ─────────────────────────────────────────────────────────

const ANALYTICS_COOKIES = [
  '_ga', '_gid', '_gat',
  // Rudderstack
  'rl_user_id', 'rl_anonymous_id', 'rl_trait',
  'rl_group_id', 'rl_group_trait',
  'rl_page_init_referrer', 'rl_page_init_referring_domain',
];

const MARKETING_COOKIES = [
  '_fbp', '_fbc',          // Facebook Pixel
  '_gcl_au', '_gcl_aw',   // Google Ads
];

export function revokeAnalyticsCookies(): void {
  ANALYTICS_COOKIES.forEach(name => {
    eraseCookie(name);
    eraseCookie(name, window.location.hostname);
    eraseCookie(name, '.' + window.location.hostname);
  });

  // Disable Google Analytics from firing new events
  // GA_ID will be injected by TrackingScripts when it calls this
  const w = window as unknown as Record<string, unknown>;
  Object.keys(w).forEach(key => {
    if (key.startsWith('ga-disable-')) w[key] = true;
  });
  if (typeof w.gtag === 'function') {
    (w.gtag as (...args: unknown[]) => void)('consent', 'update', { analytics_storage: 'denied' });
  }
  if (w.rudderanalytics) {
    (w.rudderanalytics as { reset: () => void }).reset();
  }
}

export function revokeMarketingCookies(): void {
  MARKETING_COOKIES.forEach(name => {
    eraseCookie(name);
    eraseCookie(name, window.location.hostname);
    eraseCookie(name, '.' + window.location.hostname);
  });

  const w = window as unknown as Record<string, unknown>;
  if (typeof w.fbq === 'function') {
    (w.fbq as (...args: unknown[]) => void)('consent', 'revoke');
  }
  if (typeof w.gtag === 'function') {
    (w.gtag as (...args: unknown[]) => void)('consent', 'update', {
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied',
    });
  }
}

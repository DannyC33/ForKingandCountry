'use client';
import { useState, useEffect, useRef } from 'react';
import { hasConsented, saveConsent } from '@/lib/cookies';

type View = 'banner' | 'preferences';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [view, setView] = useState<View>('banner');
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasConsented()) setVisible(true);
  }, []);

  // Lock body scroll while modal is open so the underlying page can't drift
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = 'hidden';
      dialogRef.current?.focus({ preventScroll: true });
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [visible]);

  // Escape = Decline All
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') accept(false, false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  if (!visible) return null;

  const accept = (analyticsVal: boolean, marketingVal: boolean) => {
    saveConsent(analyticsVal, marketingVal);
    setVisible(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  return (
    <div className="fixed inset-0 z-[400] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/30" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cookie-title"
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden focus:outline-none"
      >

        {/* ── Banner view ── */}
        {view === 'banner' && (
          <div className="p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-brand-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
              </div>
              <div>
                <h2 id="cookie-title" className="text-base font-bold text-gray-900">We use cookies</h2>
                <p className="text-sm text-gray-500 mt-1 leading-relaxed">
                  Servus uses cookies to operate this website and, with your consent, to analyze
                  traffic and deliver targeted advertising. You can manage your preferences at any time.
                  See our{' '}
                  <a href="/privacy" className="text-brand-500 underline hover:text-brand-500">Privacy Policy</a>.
                </p>
              </div>
            </div>

            <p className="text-[11px] text-gray-400 leading-relaxed">
              This site is operated from New Jersey. We comply with the NJ Consumer Fraud Act, the
              federal CAN-SPAM Act, and applicable U.S. data privacy regulations.
              We do not sell your personal data to third parties.
            </p>

            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                onClick={() => setView('preferences')}
                className="flex-1 border border-gray-300 text-gray-600 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Manage Preferences
              </button>
              <button
                onClick={() => accept(false, false)}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
              >
                Decline All
              </button>
              <button
                onClick={() => accept(true, true)}
                className="flex-1 bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
              >
                Accept All
              </button>
            </div>
          </div>
        )}

        {/* ── Preferences view ── */}
        {view === 'preferences' && (
          <div className="p-6 space-y-5">
            <button
              onClick={() => setView('banner')}
              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>

            <div>
              <h2 id="cookie-title" className="text-base font-bold text-gray-900">Cookie Preferences</h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose which cookies you allow. Your choice is saved and can be changed at any time.
              </p>
            </div>

            <div className="space-y-4">

              {/* Necessary — always on */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Necessary</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Required for the site to function. Cannot be disabled.
                    Includes session management and security cookies.
                  </p>
                </div>
                <div className="shrink-0 mt-0.5">
                  <span className="text-xs font-semibold text-brand-500 bg-brand-50 px-2.5 py-1 rounded-full">Always on</span>
                </div>
              </div>

              {/* Analytics */}
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Analytics</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Helps us understand how visitors use the site so we can improve it.
                    Includes <strong>Google Analytics</strong> and <strong>Rudderstack</strong>.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={analytics}
                  onClick={() => setAnalytics(v => !v)}
                  className={`shrink-0 mt-0.5 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${analytics ? 'bg-brand-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${analytics ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              {/* Marketing */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Marketing</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">
                    Used to deliver relevant ads and measure their performance.
                    Includes <strong>Facebook Pixel</strong> and <strong>Google Ads</strong>.
                    These cookies may track you across other websites.
                  </p>
                </div>
                <button
                  role="switch"
                  aria-checked={marketing}
                  onClick={() => setMarketing(v => !v)}
                  className={`shrink-0 mt-0.5 relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${marketing ? 'bg-brand-600' : 'bg-gray-200'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${marketing ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

            </div>

            <button
              onClick={() => accept(analytics, marketing)}
              className="w-full bg-brand-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-brand-700 transition-colors"
            >
              Save Preferences
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

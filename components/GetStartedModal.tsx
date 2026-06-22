'use client';
import { useState, useRef, useEffect } from 'react';

type FormData = {
  businessName: string;
  services: string[];
  name: string;
  phone: string;
  dialCode: string;
  countryCode: string;
  email: string;
  painPoint: string;
};

const CONTACT_PHONE = '908-902-1994';
const SERVICES = ['Web Experience Building', 'Tracking', 'Marketing'];
const PAIN_POINTS = ['Ordering', 'Onboarding', 'Retention', 'Other'];

const COUNTRIES = [
  { code: 'US', flag: '🇺🇸', name: 'United States', dial: '+1' },
  { code: 'CA', flag: '🇨🇦', name: 'Canada', dial: '+1' },
  { code: 'MX', flag: '🇲🇽', name: 'Mexico', dial: '+52' },
  { code: 'GB', flag: '🇬🇧', name: 'United Kingdom', dial: '+44' },
  { code: 'AU', flag: '🇦🇺', name: 'Australia', dial: '+61' },
  { code: 'DE', flag: '🇩🇪', name: 'Germany', dial: '+49' },
  { code: 'FR', flag: '🇫🇷', name: 'France', dial: '+33' },
  { code: 'ES', flag: '🇪🇸', name: 'Spain', dial: '+34' },
  { code: 'IT', flag: '🇮🇹', name: 'Italy', dial: '+39' },
  { code: 'NL', flag: '🇳🇱', name: 'Netherlands', dial: '+31' },
  { code: 'BR', flag: '🇧🇷', name: 'Brazil', dial: '+55' },
  { code: 'IN', flag: '🇮🇳', name: 'India', dial: '+91' },
  { code: 'JP', flag: '🇯🇵', name: 'Japan', dial: '+81' },
];

const BLACKLISTED_DOMAINS = new Set([
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', '10minutemail.com', 'sharklasers.com', 'trashmail.com',
  'dispostable.com', 'fakeinbox.com', 'maildrop.cc', 'spam4.me',
  'mailnull.com', 'spamgourmet.com', 'guerrillamail.info', 'guerrillamail.biz',
  'guerrillamail.de', 'guerrillamail.net', 'guerrillamail.org',
]);

const EMAIL_RE = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/;

function formatPhone(raw: string, dialCode: string): string {
  const digits = raw.replace(/\D/g, '');
  if (dialCode === '+1') {
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
  // Other countries: cap at 15 digits, group in fours
  return digits.slice(0, 15).replace(/(\d{4})(?=\d)/g, '$1 ');
}

function validateEmail(email: string): string | null {
  if (!EMAIL_RE.test(email)) return 'Please enter a valid email address.';
  const domain = email.split('@')[1]?.toLowerCase();
  if (domain && BLACKLISTED_DOMAINS.has(domain)) return 'Please use a permanent email address.';
  return null;
}

function validatePhone(phone: string, dialCode: string): string | null {
  if (!phone.trim()) return null;
  const digits = phone.replace(/\D/g, '');
  if (dialCode === '+1' && digits.length !== 10) return 'Please enter a valid 10-digit US/Canada number.';
  if (dialCode !== '+1' && (digits.length < 7 || digits.length > 15)) return 'Please enter a valid phone number.';
  return null;
}

const BLANK_FORM: FormData = {
  businessName: '', services: [], name: '', phone: '',
  dialCode: '+1', countryCode: 'US', email: '', painPoint: '',
};

export default function GetStartedModal({ triggerClassName }: { triggerClassName?: string }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [form, setForm] = useState<FormData>(BLANK_FORM);
  const countryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const btn = countryBtnRef.current;
      const menu = document.getElementById('country-menu');
      if (btn && !btn.contains(target) && menu && !menu.contains(target)) {
        setShowCountryMenu(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleService = (s: string) =>
    setForm(f => ({
      ...f,
      services: f.services.includes(s) ? f.services.filter(x => x !== s) : [...f.services, s],
    }));

  const handleOpen = () => {
    setOpen(true);
    setStep(1);
    setSubmitted(false);
    setSubmitError(null);
    setEmailError(null);
    setPhoneError(null);
    setShowCountryMenu(false);
    setForm(BLANK_FORM);
  };

  const handleClose = () => setOpen(false);

  const handleNext = () => {
    const eErr = validateEmail(form.email);
    const pErr = validatePhone(form.phone, form.dialCode);
    setEmailError(eErr);
    setPhoneError(pErr);
    if (!eErr && !pErr) setStep(2);
  };

  const step1Valid =
    form.businessName.trim() && form.name.trim() && form.email.trim() && form.services.length > 0;

  const selectedCountry = COUNTRIES.find(c => c.code === form.countryCode) ?? COUNTRIES[0];

  const handleSubmit = async () => {
    setLoading(true);
    setSubmitError(null);
    try {
      const fullPhone = form.phone.trim() ? `${form.dialCode} ${form.phone}` : '';
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          businessName: form.businessName,
          services: form.services,
          name: form.name,
          phone: fullPhone,
          email: form.email,
          painPoint: form.painPoint,
        }),
      });
      if (!res.ok) throw new Error('failed');
      setSubmitted(true);
    } catch {
      setSubmitError('Something went wrong. Please try again or call us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={triggerClassName ?? 'bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors'}
      >
        Get Started
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} />

          <div className="relative w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl bg-white overflow-y-auto flex flex-col shadow-2xl sm:max-h-[90vh]">

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold">
                Step {submitted ? '✓' : step} {!submitted && 'of 2'}
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`}
                  className="flex items-center gap-1.5 text-brand-600 font-semibold text-sm hover:text-brand-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.06 6.06l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {CONTACT_PHONE}
                </a>
                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-6 py-8 overflow-y-auto">

              {/* ── Step 1 ── */}
              {!submitted && step === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                      We&apos;re thankful for your interest.
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                      Please let us know who you are and how we can help you.
                    </p>
                  </div>

                  {/* Business name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Business Name</label>
                    <input
                      type="text"
                      value={form.businessName}
                      onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                      placeholder="e.g. Joe's Pizza"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  {/* Services */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Services You&apos;re Interested In</label>
                    <div className="flex flex-col gap-2">
                      {SERVICES.map(s => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => toggleService(s)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all ${
                            form.services.includes(s)
                              ? 'border-brand-600 bg-brand-50 text-brand-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                            form.services.includes(s) ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                          }`}>
                            {form.services.includes(s) && (
                              <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
                                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </span>
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Your Contact Information</label>

                    {/* Name */}
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />

                    {/* Phone with country code selector */}
                    <div>
                      <div className="flex gap-2">
                        {/* Country selector */}
                        <div className="shrink-0">
                          <button
                            ref={countryBtnRef}
                            type="button"
                            onClick={() => setShowCountryMenu(v => !v)}
                            className="flex items-center gap-1.5 h-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 bg-white transition-colors whitespace-nowrap"
                          >
                            <span className="text-base leading-none">{selectedCountry.flag}</span>
                            <span>{selectedCountry.dial}</span>
                            <svg className="w-3 h-3 text-gray-400 mt-px" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 1l5 5 5-5"/>
                            </svg>
                          </button>

                          {showCountryMenu && (
                            <div
                              id="country-menu"
                              className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-[300] overflow-y-auto w-72"
                              style={{
                                top: '50vh',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                maxHeight: 'calc(50vh - 24px)',
                              }}
                            >
                              {COUNTRIES.map(c => (
                                <button
                                  key={c.code}
                                  type="button"
                                  onClick={() => {
                                    setForm(f => ({ ...f, countryCode: c.code, dialCode: c.dial, phone: '' }));
                                    setPhoneError(null);
                                    setShowCountryMenu(false);
                                  }}
                                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left hover:bg-gray-50 transition-colors ${
                                    form.countryCode === c.code ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-700'
                                  }`}
                                >
                                  <span className="text-lg leading-none">{c.flag}</span>
                                  <span className="flex-1">{c.name}</span>
                                  <span className="text-gray-400 text-xs font-mono">{c.dial}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Phone number input */}
                        <input
                          type="tel"
                          value={form.phone}
                          onChange={e => {
                            setForm(f => ({ ...f, phone: formatPhone(e.target.value, f.dialCode) }));
                            if (phoneError) setPhoneError(null);
                          }}
                          onBlur={() => setPhoneError(validatePhone(form.phone, form.dialCode))}
                          placeholder={form.dialCode === '+1' ? '(555) 555-5555' : 'Phone number'}
                          className={`flex-1 border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                            phoneError ? 'border-red-400' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {phoneError && <p className="text-red-500 text-xs mt-1">{phoneError}</p>}
                    </div>

                    {/* Email */}
                    <div>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => {
                          setForm(f => ({ ...f, email: e.target.value }));
                          if (emailError) setEmailError(null);
                        }}
                        onBlur={() => { if (form.email) setEmailError(validateEmail(form.email)); }}
                        placeholder="Email address"
                        className={`w-full border rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                          emailError ? 'border-red-400' : 'border-gray-300'
                        }`}
                      />
                      {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                    </div>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={!step1Valid}
                    className="w-full bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next →
                  </button>
                </div>
              )}

              {/* ── Step 2 ── */}
              {!submitted && step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                      What&apos;s the biggest pain point for your customers?
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">Select the area that needs the most attention.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {PAIN_POINTS.map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, painPoint: p }))}
                        className={`py-6 rounded-xl border-2 text-sm font-semibold transition-all ${
                          form.painPoint === p
                            ? 'border-brand-600 bg-brand-50 text-brand-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {submitError && (
                    <p className="text-red-600 text-sm text-center">{submitError}</p>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={() => setStep(1)}
                      disabled={loading}
                      className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors disabled:opacity-40"
                    >
                      ← Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={!form.painPoint || loading}
                      className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Submitting…' : 'Submit'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── Thank you ── */}
              {submitted && (
                <div className="text-center space-y-4 py-8">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900">Thank you, {form.name.split(' ')[0]}!</h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We&apos;ve received your information and will be in touch shortly. In the meantime, feel free to call us directly at{' '}
                    <a href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`} className="text-brand-600 font-semibold">{CONTACT_PHONE}</a>.
                  </p>
                  <button
                    onClick={handleClose}
                    className="mt-4 w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

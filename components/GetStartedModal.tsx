'use client';
import { useState, useRef, useEffect, useCallback } from 'react';

type FormData = {
  businessName: string;
  services: string[];
  name: string;
  phone: string;
  dialCode: string;
  countryCode: string;
  email: string;
  painPoint: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
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
  emailOptIn: false, smsOptIn: false,
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

  const dialogRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const countryBtnRef = useRef<HTMLButtonElement>(null);

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

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  // Focus trap + Escape key
  useEffect(() => {
    if (!open) return;

    const dialog = dialogRef.current;
    if (!dialog) return;

    // Auto-focus first focusable element
    const getFocusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

    const focusables = getFocusable();
    (focusables[0] ?? dialog).focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
        return;
      }
      if (e.key !== 'Tab') return;

      const els = getFocusable();
      if (els.length < 2) return;
      const first = els[0];
      const last = els[els.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, handleClose]);

  // Return focus to trigger button when modal closes (not on initial mount)
  const wasOpenRef = useRef(false);
  useEffect(() => {
    if (open) {
      wasOpenRef.current = true;
    } else if (wasOpenRef.current) {
      triggerRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open]);

  // Close country menu when clicking outside
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
          emailOptIn: form.emailOptIn,
          smsOptIn: form.smsOptIn,
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
        ref={triggerRef}
        onClick={handleOpen}
        className={triggerClassName ?? 'bg-brand-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-brand-700 transition-colors'}
      >
        Get Started
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex flex-col sm:items-center sm:justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={handleClose} aria-hidden="true" />

          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            tabIndex={-1}
            className="relative w-full h-full sm:h-auto sm:max-w-lg sm:rounded-2xl bg-white overflow-y-auto flex flex-col shadow-2xl sm:max-h-[90vh] focus:outline-none"
          >

            {/* Top bar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
              <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold" aria-live="polite">
                Step {submitted ? '✓' : step} {!submitted && 'of 2'}
              </span>
              <div className="flex items-center gap-4">
                <a
                  href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`}
                  className="flex items-center gap-1.5 text-brand-500 font-semibold text-sm hover:text-brand-500 transition-colors"
                >
                  <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.06 6.06l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                  {CONTACT_PHONE}
                </a>
                <button
                  onClick={handleClose}
                  aria-label="Close dialog"
                  className="text-gray-400 hover:text-gray-600 transition-colors text-xl leading-none"
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
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900 leading-snug">
                      We&apos;re thankful for your interest.
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                      Please let us know who you are and how we can help you.
                    </p>
                  </div>

                  {/* Business name */}
                  <div>
                    <label htmlFor="business-name" className="block text-sm font-medium text-gray-700 mb-1">
                      Business Name
                    </label>
                    <input
                      id="business-name"
                      type="text"
                      value={form.businessName}
                      onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))}
                      placeholder="e.g. Joe's Pizza"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  {/* Services */}
                  <div role="group" aria-labelledby="services-label">
                    <p id="services-label" className="block text-sm font-medium text-gray-700 mb-2">
                      Services You&apos;re Interested In
                    </p>
                    <div className="flex flex-col gap-2">
                      {SERVICES.map(s => (
                        <button
                          key={s}
                          type="button"
                          role="checkbox"
                          aria-checked={form.services.includes(s)}
                          onClick={() => toggleService(s)}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm font-medium transition-all ${
                            form.services.includes(s)
                              ? 'border-brand-600 bg-brand-50 text-brand-700'
                              : 'border-gray-200 text-gray-700 hover:border-gray-300'
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              form.services.includes(s) ? 'border-brand-600 bg-brand-600' : 'border-gray-300'
                            }`}
                          >
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
                  <fieldset className="space-y-3">
                    <legend className="block text-sm font-medium text-gray-700">Your Contact Information</legend>

                    {/* Name */}
                    <input
                      id="contact-name"
                      type="text"
                      aria-label="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name"
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />

                    {/* Phone with country code selector */}
                    <div>
                      <div className="flex gap-2" role="group" aria-label="Phone number with country code">
                        {/* Country selector */}
                        <div className="shrink-0">
                          <button
                            ref={countryBtnRef}
                            type="button"
                            aria-haspopup="listbox"
                            aria-expanded={showCountryMenu}
                            aria-label={`Country code: ${selectedCountry.name} ${selectedCountry.dial}`}
                            onClick={() => setShowCountryMenu(v => !v)}
                            className="flex items-center gap-1.5 h-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 bg-white transition-colors whitespace-nowrap"
                          >
                            <span className="text-base leading-none" aria-hidden="true">{selectedCountry.flag}</span>
                            <span>{selectedCountry.dial}</span>
                            <svg aria-hidden="true" focusable="false" className="w-3 h-3 text-gray-400 mt-px" viewBox="0 0 12 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M1 1l5 5 5-5"/>
                            </svg>
                          </button>

                          {showCountryMenu && (
                            <ul
                              id="country-menu"
                              role="listbox"
                              aria-label="Select country code"
                              className="fixed bg-white border border-gray-200 rounded-xl shadow-2xl z-[300] overflow-y-auto w-72"
                              style={{
                                top: '50vh',
                                left: '50%',
                                transform: 'translateX(-50%)',
                                maxHeight: 'calc(50vh - 24px)',
                              }}
                            >
                              {COUNTRIES.map(c => (
                                <li key={c.code} role="option" aria-selected={form.countryCode === c.code}>
                                  <button
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
                                    <span className="text-lg leading-none" aria-hidden="true">{c.flag}</span>
                                    <span className="flex-1">{c.name}</span>
                                    <span className="text-gray-400 text-xs font-mono">{c.dial}</span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>

                        {/* Phone number input */}
                        <input
                          id="contact-phone"
                          type="tel"
                          aria-label="Phone number"
                          aria-describedby={phoneError ? 'phone-error' : undefined}
                          aria-invalid={!!phoneError}
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
                      {phoneError && (
                        <p id="phone-error" role="alert" className="text-red-500 text-xs mt-1">{phoneError}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <input
                        id="contact-email"
                        type="email"
                        aria-label="Email address"
                        aria-describedby={emailError ? 'email-error' : undefined}
                        aria-invalid={!!emailError}
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
                      {emailError && (
                        <p id="email-error" role="alert" className="text-red-500 text-xs mt-1">{emailError}</p>
                      )}
                    </div>
                  </fieldset>

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
                    <h2 id="modal-title" className="text-2xl font-bold text-gray-900 leading-snug">
                      What&apos;s the biggest pain point for your customers?
                    </h2>
                    <p className="text-gray-500 mt-2 text-sm">Select the area that needs the most attention.</p>
                  </div>

                  <div
                    role="radiogroup"
                    aria-labelledby="pain-point-label"
                    className="grid grid-cols-2 gap-3"
                  >
                    <p id="pain-point-label" className="sr-only">Pain point area</p>
                    {PAIN_POINTS.map(p => (
                      <button
                        key={p}
                        type="button"
                        role="radio"
                        aria-checked={form.painPoint === p}
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

                  {/* Communication opt-ins */}
                  <div className="space-y-3 pt-4 border-t border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Communication Preferences</p>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.emailOptIn}
                        onChange={e => setForm(f => ({ ...f, emailOptIn: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I agree to receive marketing emails from Servus. I understand I may unsubscribe at any time.
                      </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.smsOptIn}
                        onChange={e => setForm(f => ({ ...f, smsOptIn: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 rounded border-gray-300 accent-brand-600 cursor-pointer"
                      />
                      <span className="text-sm text-gray-700 leading-relaxed">
                        I agree to receive recurring automated marketing text messages from Servus at the phone number provided. Consent is not required to purchase.
                      </span>
                    </label>

                    <p className="text-[11px] text-gray-400 leading-relaxed">
                      By submitting this form you agree to be contacted by Servus regarding your inquiry.
                      {form.smsOptIn && ' SMS: Msg frequency varies. Msg & data rates may apply. Reply STOP to cancel, HELP for help.'}
                      {' '}Servus complies with the federal Telephone Consumer Protection Act (TCPA), CAN-SPAM Act, and New Jersey consumer protection regulations.
                      Your information will never be sold to third parties.
                      View our{' '}
                      <a href="/privacy" className="underline hover:text-gray-600">Privacy Policy</a>
                      {' '}and{' '}
                      <a href="/terms" className="underline hover:text-gray-600">Terms of Service</a>.
                    </p>
                  </div>

                  {submitError && (
                    <p role="alert" className="text-red-600 text-sm text-center">{submitError}</p>
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
                      aria-busy={loading}
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
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto" aria-hidden="true">
                    <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5"/>
                    </svg>
                  </div>
                  <h2 id="modal-title" className="text-2xl font-bold text-gray-900">
                    Thank you, {form.name.split(' ')[0]}!
                  </h2>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    We&apos;ve received your information and will be in touch shortly. In the meantime, feel free to call us directly at{' '}
                    <a href={`tel:${CONTACT_PHONE.replace(/-/g, '')}`} className="text-brand-500 font-semibold">{CONTACT_PHONE}</a>.
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

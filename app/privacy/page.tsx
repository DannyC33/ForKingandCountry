import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy | Servus',
  description: 'How Servus collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  const EFFECTIVE_DATE = 'July 14, 2026';
  const COMPANY = 'Servus';
  const EMAIL = 'daniel.c.fedak@gmail.com';
  const PHONE = '908-902-1994';

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-6 py-16">

        <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-10 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to Servus
        </Link>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <p>
              {COMPANY} (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy.
              This Privacy Policy explains how we collect, use, disclose, and safeguard your information when
              you visit our website or submit an inquiry through our contact form. Please read this policy
              carefully. If you disagree with its terms, please discontinue use of the site.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Information We Collect</h2>
            <p className="mb-3">We collect information you voluntarily provide when you fill out our &quot;Get Started&quot; form, including:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Full name</li>
              <li>Business name</li>
              <li>Email address</li>
              <li>Phone number (optional)</li>
              <li>Services you are interested in</li>
              <li>Your biggest customer pain point</li>
              <li>Marketing and SMS communication preferences</li>
            </ul>
            <p className="mt-3">
              We also automatically collect certain technical information when you visit our website, such as
              your IP address, browser type, pages visited, and time spent on pages, through cookies and
              analytics tools (see Section 5).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Respond to your inquiry and provide the services you request</li>
              <li>Send you marketing emails if you have opted in (you may unsubscribe at any time)</li>
              <li>Send you marketing SMS messages if you have opted in (reply STOP to cancel)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
              <li>Prevent fraud and protect the security of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. SMS / Text Message Communications</h2>
            <p className="mb-3">
              If you opt in to SMS communications, you agree to receive recurring automated marketing text
              messages from {COMPANY} at the phone number provided. Consent is not a condition of purchase.
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Message frequency varies.</li>
              <li>Message and data rates may apply.</li>
              <li>Reply <strong>STOP</strong> at any time to cancel. Reply <strong>HELP</strong> for help.</li>
              <li>For support, contact us at {EMAIL} or {PHONE}.</li>
            </ul>
            <p className="mt-3">
              We comply with the federal Telephone Consumer Protection Act (TCPA) and applicable state law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Email Communications</h2>
            <p>
              If you opt in to email communications, we may send you marketing emails about our services,
              promotions, and updates. Every marketing email includes an unsubscribe link. We comply with
              the CAN-SPAM Act. To opt out, click the unsubscribe link in any email or contact us directly
              at {EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Cookies and Analytics</h2>
            <p className="mb-3">
              We use cookies and similar tracking technologies to analyze website traffic and improve your
              experience. Specifically, we use:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Google Analytics (GA4)</strong> — to measure page views, sessions, and user interactions. Google may use this data in accordance with its own privacy policy.</li>
              <li><strong>RudderStack</strong> — for customer journey analytics to understand how visitors navigate our site.</li>
            </ul>
            <p className="mt-3">
              You can opt out of analytics tracking by declining cookies when prompted on your first visit.
              You may also use browser settings or tools such as the Google Analytics opt-out browser add-on
              to prevent data collection.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. How We Share Your Information</h2>
            <p className="mb-3">
              We do not sell your personal information. We may share your information with trusted third-party
              service providers who help us operate our business, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li><strong>Brevo (Sendinblue)</strong> — for email and SMS marketing. Brevo stores your contact information in accordance with its own privacy policy.</li>
              <li><strong>Supabase</strong> — for secure database storage of submitted inquiry forms.</li>
              <li><strong>Google</strong> — for analytics and advertising (if applicable).</li>
            </ul>
            <p className="mt-3">
              We require all third parties to respect the security of your personal data and to treat it in
              accordance with the law. We may also disclose your information where required by law or to
              protect our legal rights.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes described
              in this policy, unless a longer retention period is required by law. Inquiry form submissions
              are retained for the duration of our business relationship and up to three (3) years thereafter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Your Rights</h2>
            <p className="mb-3">Depending on your location, you may have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your personal information</li>
              <li>Opt out of marketing communications at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, please contact us at {EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our website is not directed to children under the age of 13. We do not knowingly collect
              personal information from children. If you believe we have inadvertently collected information
              from a child, please contact us immediately at {EMAIL}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Security</h2>
            <p>
              We implement reasonable administrative, technical, and physical safeguards to protect your
              personal information. However, no method of transmission over the internet or electronic
              storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Governing Law</h2>
            <p>
              This Privacy Policy is governed by the laws of the State of New Jersey, without regard to
              its conflict of law provisions. We comply with applicable New Jersey consumer protection
              regulations.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material
              changes by posting the new policy on this page with an updated effective date. We encourage
              you to review this policy periodically.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us:</p>
            <div className="mt-3 space-y-1 text-sm">
              <p><strong>{COMPANY}</strong></p>
              <p>Email: <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a></p>
              <p>Phone: <a href={`tel:${PHONE.replace(/-/g, '')}`} className="text-blue-600 hover:underline">{PHONE}</a></p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-700 underline">
            View Terms of Service
          </Link>
        </div>

      </div>
    </div>
  );
}

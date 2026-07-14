import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service | Servus',
  description: 'Terms and conditions governing use of Servus services.',
};

export default function TermsPage() {
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

        <h1 className="text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Effective Date: {EFFECTIVE_DATE}</p>

        <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

          <section>
            <p>
              Please read these Terms of Service (&quot;Terms&quot;) carefully before using the {COMPANY} website
              or engaging {COMPANY} for any services. By accessing our website or entering into a service
              agreement with us, you agree to be bound by these Terms. If you do not agree, please do not
              use our website or services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">1. Services</h2>
            <p className="mb-3">
              {COMPANY} provides digital services including, but not limited to:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Web experience design and development</li>
              <li>Digital marketing and advertising management</li>
              <li>Website analytics and tracking setup</li>
              <li>Ongoing website hosting and maintenance packages</li>
              <li>Custom technology and automation solutions</li>
            </ul>
            <p className="mt-3">
              The specific scope, deliverables, timeline, and pricing for each engagement will be outlined
              in a separate written agreement or proposal between {COMPANY} and the client.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">2. Inquiries and Contact Forms</h2>
            <p>
              Submitting an inquiry through our &quot;Get Started&quot; form does not constitute a binding
              contract or guarantee of services. We will review your submission and reach out to discuss
              your needs. Engagement of our services begins only upon execution of a written service
              agreement or proposal.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">3. Fees and Payment</h2>
            <p className="mb-3">
              Fees for our services are as described in your individual service agreement. Unless otherwise
              agreed in writing:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>One-time project fees are due as outlined in the signed proposal (typically a deposit upon engagement and balance upon delivery).</li>
              <li>Monthly management package fees are billed in advance at the start of each billing cycle.</li>
              <li>Additional fees for ad creation, ad spend management, or other services are billed as incurred.</li>
            </ul>
            <p className="mt-3">
              All fees are in U.S. dollars. Invoices unpaid after 15 days may accrue a late fee of 1.5%
              per month. {COMPANY} reserves the right to suspend services for accounts more than 30 days
              past due.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">4. Technology Costs</h2>
            <p>
              Certain services require third-party tools and platforms (such as hosting infrastructure,
              CMS platforms, or analytics software). These technology costs are separate from {COMPANY}&apos;s
              service fees. If you choose not to continue working with {COMPANY} after an initial build,
              you will be responsible for any ongoing third-party technology costs, which are estimated
              at approximately $74/month for our recommended tech stack. {COMPANY} will disclose estimated
              third-party costs in your service agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">5. Client Responsibilities</h2>
            <p className="mb-3">To allow us to deliver services effectively, you agree to:</p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Provide timely feedback and approvals (up to 3 revision rounds per deliverable unless otherwise agreed)</li>
              <li>Supply necessary materials, credentials, and access required for the project</li>
              <li>Ensure that all materials you provide do not infringe on any third-party intellectual property rights</li>
              <li>Designate a primary point of contact for the engagement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">6. Intellectual Property</h2>
            <p className="mb-3">
              Upon receipt of full payment for a project, {COMPANY} assigns to you all rights, title, and
              interest in the final deliverables created specifically for your project, excluding:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>Any third-party licensed assets, fonts, stock images, or software (subject to their respective licenses)</li>
              <li>{COMPANY}&apos;s proprietary tools, frameworks, methodologies, and pre-existing intellectual property used to develop the deliverables</li>
            </ul>
            <p className="mt-3">
              {COMPANY} retains the right to display completed work in its portfolio and marketing materials
              unless you request otherwise in writing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">7. Confidentiality</h2>
            <p>
              Both parties agree to keep confidential any non-public information shared during the
              engagement. {COMPANY} will not share your proprietary business information with third parties
              except as necessary to deliver the agreed services. This obligation survives termination of
              the service agreement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">8. Cancellation and Termination</h2>
            <p className="mb-3">
              Either party may terminate a service agreement with written notice. For monthly management
              packages:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-sm">
              <li>You may cancel with 30 days&apos; written notice prior to your next billing cycle.</li>
              <li>Fees already paid for a current billing period are non-refundable.</li>
              <li>{COMPANY} may terminate services immediately for non-payment, breach of these Terms, or conduct that harms our business or reputation.</li>
            </ul>
            <p className="mt-3">
              For one-time projects, deposits are non-refundable once work has commenced. Cancellation of
              a one-time project after commencement may result in additional fees for work completed to date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">9. Disclaimer of Warranties</h2>
            <p>
              Our website and services are provided &quot;as is&quot; and &quot;as available&quot; without warranties of
              any kind, express or implied. {COMPANY} does not warrant that our services will achieve any
              specific business results (such as a particular increase in traffic, leads, or revenue).
              Results vary based on many factors outside our control, including market conditions, competition,
              and client-side factors.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">10. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, {COMPANY} shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages arising from your use of our services
              or website, including loss of profits, data, or business opportunities. Our total liability
              to you for any claim arising from or related to our services shall not exceed the total fees
              paid by you to {COMPANY} in the three (3) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">11. Indemnification</h2>
            <p>
              You agree to indemnify and hold {COMPANY} and its owners, employees, and agents harmless from
              any claims, damages, or expenses (including reasonable attorneys&apos; fees) arising from your
              breach of these Terms, your use of our services, or any content or materials you provide to us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">12. Governing Law and Disputes</h2>
            <p>
              These Terms are governed by the laws of the State of New Jersey, without regard to its
              conflict of law provisions. Any disputes arising from these Terms or our services shall
              first be attempted to be resolved through good-faith negotiation. If unresolved, disputes
              shall be submitted to binding arbitration in New Jersey in accordance with the rules of
              the American Arbitration Association, except that either party may seek injunctive or
              equitable relief in a court of competent jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">13. Changes to These Terms</h2>
            <p>
              We reserve the right to update these Terms at any time. We will post the updated Terms on
              this page with a revised effective date. Your continued use of our website or services
              after any changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">14. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us:</p>
            <div className="mt-3 space-y-1 text-sm">
              <p><strong>{COMPANY}</strong></p>
              <p>Email: <a href={`mailto:${EMAIL}`} className="text-blue-600 hover:underline">{EMAIL}</a></p>
              <p>Phone: <a href={`tel:${PHONE.replace(/-/g, '')}`} className="text-blue-600 hover:underline">{PHONE}</a></p>
            </div>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-gray-100 text-center">
          <Link href="/privacy" className="text-sm text-gray-500 hover:text-gray-700 underline">
            View Privacy Policy
          </Link>
        </div>

      </div>
    </div>
  );
}

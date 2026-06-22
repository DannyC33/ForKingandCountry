import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Case Studies | The Last Shall Be First' };

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* Nav */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-lg tracking-tight text-gray-900">
            The Last Shall Be First
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Home
            </Link>
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <Link href="/case-studies" className="text-sm text-gray-900 font-medium border-b-2 border-brand-600">
              Case Studies
            </Link>
            <Link href="/blog" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              Blog
            </Link>
            <Link
              href="/login"
              className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign in
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-16">

        <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-4">
          Work
        </span>
        <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-16">
          Case Studies
        </h1>

        {/* Attribution Model */}
        <section className="mb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Attribution Model</h2>
          <p className="text-lg text-gray-500 mb-10">Going from 0 analytics to realtime analytics</p>

          <div className="border-t border-gray-200 pt-10">

            {/* Timeline */}
            <div className="relative">

              {/* Vertical timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200" />

              {/* Phase 1 — 2022 */}
              <div className="relative flex gap-8 mb-16">

                {/* Year marker */}
                <div className="flex flex-col items-center shrink-0 w-12">
                  <span className="text-xs font-semibold text-gray-400 tracking-wide mb-2 z-10 bg-white">2022</span>
                  <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-white ring-2 ring-gray-300 z-10" />
                </div>

                {/* Content card */}
                <div className="flex-1 pb-4">

                  {/* Client label + link */}
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Client</p>
                  <a
                    href="https://byramhealthcare.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xl font-bold text-gray-900 hover:text-brand-600 transition-colors"
                  >
                    Byram Healthcare
                  </a>

                  {/* Logo + overview */}
                  <div className="mt-6 flex flex-col sm:flex-row gap-8 items-start">

                    {/* Business logo */}
                    <div className="shrink-0 w-40 h-28 rounded-xl border border-gray-200 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/ByramHealthcare.png"
                        alt="Byram Healthcare"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Overview text */}
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Overview</h3>
                      <p className="text-gray-600 text-base leading-relaxed">
                        I was hired by Byram Healthcare to analyze and report on all digital marketing campaigns
                        to understand the monetary impact. Byram Healthcare is a healthcare company and all
                        conversions required speaking to a customer service representative to verify insurance
                        information and to place their order. The challenge with transactions requiring customer
                        service was that when a lead submitted their information via a form, or called us after
                        clicking on an online advertisement, there was no method to show the customer service rep
                        where the lead originated from. Thus, when a representative submitted an order for a
                        customer, they didn&apos;t attribute or assign credit to a digital marketing campaign
                        leaving us in the dark as to what value was being generated. The goal of the project was
                        twofold, to create a new tracking plan to understand which campaigns were generating leads,
                        and to build a system to merge online and offline data so it could be reported on
                        accurately in realtime.
                      </p>
                    </div>

                  </div>

                  {/* Part 1 */}
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Part 1: Upgrading Our Tracking</h3>
                  </div>

                  {/* Journey infographic */}
                  <div className="mt-10">
                    <svg
                      viewBox="0 0 640 265"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full rounded-xl shadow-lg border border-gray-200"
                      aria-label="Campaign attribution journey diagram"
                    >
                      {/* Background */}
                      <rect width="640" height="265" rx="12" fill="#f8fafc" />

                      {/* Title */}
                      <text x="320" y="18" textAnchor="middle" fontSize="10" fill="#1e3a5f" fontWeight="bold" fontFamily="sans-serif">Where Campaign Attribution Broke Down</text>

                      {/* ── Step 1: Clicks Ad (x=64) ── */}
                      <rect x="8" y="30" width="112" height="30" rx="5" fill="#dcfce7" stroke="#86efac" strokeWidth="1" />
                      <text x="64" y="43" textAnchor="middle" fontSize="6.5" fill="#166534" fontWeight="bold" fontFamily="sans-serif">Campaign ID</text>
                      <text x="64" y="55" textAnchor="middle" fontSize="6.5" fill="#166534" fontFamily="sans-serif">#GA-4821 | UTM: google-cpc</text>
                      <line x1="64" y1="60" x2="64" y2="107" stroke="#86efac" strokeWidth="1" strokeDasharray="3,2" />
                      <circle cx="64" cy="135" r="28" fill="#1e3a5f" />
                      <rect x="50" y="124" width="28" height="18" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                      <rect x="50" y="124" width="28" height="6" rx="2" fill="white" opacity="0.2" />
                      <text x="64" y="136" textAnchor="middle" fontSize="6" fill="white" fontWeight="bold" fontFamily="sans-serif">AD</text>
                      <polygon points="70,138 70,146 73,144 75,149 77,148 75,143 78,141" fill="white" opacity="0.9" />
                      <text x="64" y="174" textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="600" fontFamily="sans-serif">Clicks Ad</text>

                      {/* Arrow 1→2 solid */}
                      <line x1="93" y1="135" x2="157" y2="135" stroke="#94a3b8" strokeWidth="1.5" />
                      <polygon points="157,131 163,135 157,139" fill="#94a3b8" />

                      {/* ── Step 2: Visits Webpage (x=192) ── */}
                      <rect x="132" y="30" width="120" height="30" rx="5" fill="#dcfce7" stroke="#86efac" strokeWidth="1" />
                      <text x="192" y="43" textAnchor="middle" fontSize="6.5" fill="#166534" fontWeight="bold" fontFamily="sans-serif">Cookie stored</text>
                      <text x="192" y="55" textAnchor="middle" fontSize="6.5" fill="#166534" fontFamily="sans-serif">#GA-4821 ✓</text>
                      <line x1="192" y1="60" x2="192" y2="107" stroke="#86efac" strokeWidth="1" strokeDasharray="3,2" />
                      <circle cx="192" cy="135" r="28" fill="#1e3a5f" />
                      <rect x="178" y="124" width="28" height="20" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                      <line x1="178" y1="130" x2="206" y2="130" stroke="white" strokeWidth="1" />
                      <circle cx="182" cy="127" r="1.5" fill="white" opacity="0.7" />
                      <circle cx="187" cy="127" r="1.5" fill="white" opacity="0.7" />
                      <line x1="182" y1="136" x2="202" y2="136" stroke="white" strokeWidth="1" opacity="0.5" />
                      <line x1="182" y1="140" x2="202" y2="140" stroke="white" strokeWidth="1" opacity="0.5" />
                      <text x="192" y="174" textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="600" fontFamily="sans-serif">Visits Webpage</text>

                      {/* Arrow 2→3 red dashed — tracking breaks */}
                      <line x1="221" y1="135" x2="285" y2="135" stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,3" />
                      <polygon points="285,131 291,135 285,139" fill="#ef4444" />

                      {/* ── Step 3: Submits Form (x=320) ── */}
                      <text x="320" y="42" textAnchor="middle" fontSize="20" fill="#ef4444" fontWeight="bold" fontFamily="sans-serif">✕</text>
                      <rect x="248" y="48" width="144" height="17" rx="4" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
                      <text x="320" y="60" textAnchor="middle" fontSize="6.5" fill="#dc2626" fontWeight="bold" fontFamily="sans-serif">Campaign ID cut off here</text>
                      <line x1="320" y1="65" x2="320" y2="107" stroke="#fca5a5" strokeWidth="1" strokeDasharray="3,2" />
                      <circle cx="320" cy="135" r="28" fill="#1e3a5f" />
                      <rect x="307" y="125" width="26" height="22" rx="2" fill="none" stroke="white" strokeWidth="1.5" />
                      <rect x="312" y="122" width="16" height="6" rx="2" fill="white" />
                      <line x1="311" y1="135" x2="331" y2="135" stroke="white" strokeWidth="1" opacity="0.7" />
                      <line x1="311" y1="140" x2="331" y2="140" stroke="white" strokeWidth="1" opacity="0.7" />
                      <line x1="311" y1="145" x2="324" y2="145" stroke="white" strokeWidth="1" opacity="0.7" />
                      <text x="320" y="174" textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="600" fontFamily="sans-serif">Submits Form</text>

                      {/* Arrow 3→4 gray dashed */}
                      <line x1="349" y1="135" x2="413" y2="135" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4,3" />
                      <polygon points="413,131 419,135 413,139" fill="#d1d5db" />

                      {/* ── Step 4: CS Team Calls (x=448) ── */}
                      <circle cx="448" cy="135" r="28" fill="#e5e7eb" />
                      <circle cx="440" cy="125" r="5" fill="#9ca3af" />
                      <circle cx="456" cy="145" r="5" fill="#9ca3af" />
                      <path d="M443,129 L453,141" stroke="#9ca3af" strokeWidth="5" strokeLinecap="round" />
                      <text x="448" y="174" textAnchor="middle" fontSize="7.5" fill="#6b7280" fontWeight="600" fontFamily="sans-serif">CS Team Calls</text>
                      <text x="448" y="185" textAnchor="middle" fontSize="6.5" fill="#9ca3af" fontFamily="sans-serif">No campaign data</text>

                      {/* Arrow 4→5 gray dashed */}
                      <line x1="477" y1="135" x2="541" y2="135" stroke="#d1d5db" strokeWidth="1.5" strokeDasharray="4,3" />
                      <polygon points="541,131 547,135 541,139" fill="#d1d5db" />

                      {/* ── Step 5: Order Entered (x=576) ── */}
                      <circle cx="576" cy="135" r="28" fill="#e5e7eb" />
                      <rect x="560" y="123" width="32" height="22" rx="2" fill="none" stroke="#9ca3af" strokeWidth="1.5" />
                      <line x1="560" y1="130" x2="592" y2="130" stroke="#9ca3af" strokeWidth="1" />
                      <rect x="570" y="145" width="12" height="3" rx="1" fill="#9ca3af" />
                      <rect x="566" y="148" width="20" height="2" rx="1" fill="#9ca3af" />
                      <text x="576" y="174" textAnchor="middle" fontSize="7.5" fill="#6b7280" fontWeight="600" fontFamily="sans-serif">Order Entered</text>
                      <text x="576" y="185" textAnchor="middle" fontSize="6.5" fill="#9ca3af" fontFamily="sans-serif">No attribution</text>

                      {/* ── Legend ── */}
                      <rect x="12" y="222" width="10" height="8" rx="2" fill="#dcfce7" stroke="#86efac" strokeWidth="1" />
                      <text x="26" y="230" fontSize="7" fill="#6b7280" fontFamily="sans-serif">Campaign ID tracked</text>
                      <rect x="152" y="222" width="10" height="8" rx="2" fill="#fee2e2" stroke="#fca5a5" strokeWidth="1" />
                      <text x="166" y="230" fontSize="7" fill="#6b7280" fontFamily="sans-serif">Tracking lost</text>
                      <circle cx="278" cy="226" r="5" fill="#e5e7eb" stroke="#d1d5db" strokeWidth="1" />
                      <text x="287" y="230" fontSize="7" fill="#6b7280" fontFamily="sans-serif">No campaign data available</text>
                    </svg>
                  </div>

                  {/* First Step section */}
                  <div className="mt-12 pt-8 border-t border-gray-200">

                    <h3 className="text-xl font-bold text-gray-900 mb-6">
                      First Step: Tracking Digital Marketing Lead Conversions Through the Forms
                    </h3>

                    {/* Overview */}
                    <div className="ml-6 mb-8">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Overview</p>
                      <p className="text-gray-500 text-base leading-relaxed font-light">
                        The first challenge we tackled was understanding how many conversions originated from
                        leads who submitted a form after clicking a digital advertisement. We knew we needed
                        to identify the customer and for that identifier to remain with the customer throughout
                        their entire onboarding process. The real question was what is the best way to
                        accomplish this given our time and resources.
                      </p>
                    </div>

                    {/* Discovery */}
                    <div className="ml-6 flex flex-col lg:flex-row gap-10 items-start">

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Discovery: How to Create a Tracking Framework for Online Leads</p>
                        <div className="text-gray-500 text-base leading-relaxed font-light space-y-4">
                          <p>
                            At the outset of the project we knew we could send a referral number from each
                            form. The problem with that is if we wanted to create a new campaign we needed a
                            new form created and most likely a new landing page. That presented a problem —
                            what happens if we want to create, update, or change sets of campaigns in a given
                            week, month, or period?
                          </p>
                          <ol className="list-none space-y-2 ml-2">
                            <li>
                              <span className="underline">Option 1</span> — Create a unique landing page with a unique form for each campaign so
                              that you could send a hardcoded referral number through a form field.
                            </li>
                            <li>
                              <span className="underline">Option 2</span> — Dynamically pass a referral or campaign ID through a URL in the
                              online advertisement directly into the form via cookies.
                            </li>
                          </ol>
                          <p>
                            After discussing with the digital marketing team about the flexibility they needed
                            as far as campaign development was concerned, we forecasted the time we would save
                            tracking fluctuating campaign sets more than made up for the focus and development
                            time needed to set up the dynamic process and chose option 2.
                          </p>
                          <p className="ml-6 italic text-gray-400 text-sm">
                            <strong>The end result was a profile of a lead in the CRM platform which included a referral
                            number next to the demographic and contact information submitted. The customer service
                            teams would have access to the referral number data in the event a lead confirmed they
                            would like to order supplies and they are eligible for them. This is also true for
                            option 2. The difference between one and two was the method of sending the referral
                            number.</strong>
                          </p>

                          {/* CRM lead profile infographic */}
                          <div className="flex flex-col items-center my-2">
                            <svg width="40" height="36" viewBox="0 0 40 36" xmlns="http://www.w3.org/2000/svg">
                              <line x1="20" y1="0" x2="20" y2="26" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"/>
                              <polygon points="10,20 20,34 30,20" fill="#22c55e"/>
                            </svg>
                            <svg
                              viewBox="0 0 600 358"
                              xmlns="http://www.w3.org/2000/svg"
                              className="w-full rounded-xl shadow-lg border border-gray-200"
                              aria-label="CRM lead profile mockup"
                            >
                              {/* App background */}
                              <rect width="600" height="358" rx="8" fill="#f3f2f2"/>

                              {/* Top nav */}
                              <rect width="600" height="40" rx="8" fill="#032d60"/>
                              <rect y="28" width="600" height="12" fill="#032d60"/>
                              <text x="16" y="25" fontSize="11" fill="white" fontWeight="bold" fontFamily="sans-serif">CloudCRM</text>
                              <rect x="140" y="11" width="220" height="18" rx="9" fill="#083073"/>
                              <text x="156" y="23" fontSize="7.5" fill="#8db4e2" fontFamily="sans-serif">Search...</text>
                              <circle cx="430" cy="20" r="9" fill="#083073"/>
                              <circle cx="455" cy="20" r="9" fill="#083073"/>
                              <circle cx="480" cy="20" r="9" fill="#083073"/>
                              <circle cx="572" cy="20" r="14" fill="#4a90d9"/>
                              <text x="572" y="25" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif" fontWeight="bold">JS</text>

                              {/* Left sidebar */}
                              <rect x="0" y="40" width="158" height="318" fill="#f3f2f2"/>
                              <rect x="0" y="40" width="158" height="28" fill="#eef1f6"/>
                              <text x="12" y="58" fontSize="7.5" fill="#706e6b" fontFamily="sans-serif" fontWeight="600" letterSpacing="1">NAVIGATION</text>
                              <line x1="158" y1="40" x2="158" y2="358" stroke="#dddbda" strokeWidth="1"/>

                              {/* Nav: Home */}
                              <text x="20" y="86" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Home</text>
                              {/* Nav: Leads (active) */}
                              <rect x="0" y="94" width="158" height="26" fill="#e8f4fe"/>
                              <rect x="0" y="94" width="3" height="26" fill="#0070d2"/>
                              <text x="20" y="111" fontSize="8.5" fill="#0070d2" fontWeight="bold" fontFamily="sans-serif">Leads</text>
                              {/* Nav: Contacts */}
                              <text x="20" y="137" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Contacts</text>
                              {/* Nav: Accounts */}
                              <text x="20" y="163" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Accounts</text>
                              {/* Nav: Opportunities */}
                              <text x="20" y="189" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Opportunities</text>
                              {/* Nav: Tasks */}
                              <text x="20" y="215" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Tasks</text>
                              {/* Nav: Reports */}
                              <text x="20" y="241" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Reports</text>

                              {/* Main content area */}
                              <rect x="158" y="40" width="442" height="318" fill="white"/>

                              {/* Breadcrumb */}
                              <text x="172" y="57" fontSize="7.5" fill="#0070d2" fontFamily="sans-serif">Leads</text>
                              <text x="204" y="57" fontSize="7.5" fill="#adadad" fontFamily="sans-serif">›</text>
                              <text x="212" y="57" fontSize="7.5" fill="#3e3e3c" fontFamily="sans-serif">Jane Smith</text>

                              {/* Profile header */}
                              <rect x="158" y="62" width="442" height="58" fill="#fafaf9"/>
                              <line x1="158" y1="120" x2="600" y2="120" stroke="#dddbda" strokeWidth="1"/>
                              {/* Avatar circle + silhouette */}
                              <circle cx="196" cy="90" r="22" fill="#d8edff"/>
                              <circle cx="196" cy="83" r="8" fill="#a8c8f0"/>
                              <ellipse cx="196" cy="104" rx="13" ry="9" fill="#a8c8f0"/>
                              {/* Name + badge */}
                              <text x="228" y="82" fontSize="14" fontWeight="bold" fill="#032d60" fontFamily="sans-serif">Jane Smith</text>
                              <rect x="228" y="87" width="28" height="13" rx="6" fill="#d8edff"/>
                              <text x="242" y="97" textAnchor="middle" fontSize="6.5" fill="#0070d2" fontWeight="bold" fontFamily="sans-serif">Lead</text>
                              <text x="262" y="97" fontSize="7" fill="#706e6b" fontFamily="sans-serif">·  New  ·  Created 5/4/2022</text>
                              {/* Action buttons */}
                              <rect x="476" y="72" width="54" height="18" rx="4" fill="#0070d2"/>
                              <text x="503" y="84" textAnchor="middle" fontSize="7.5" fill="white" fontFamily="sans-serif">Convert</text>
                              <rect x="536" y="72" width="32" height="18" rx="4" fill="white" stroke="#dddbda" strokeWidth="1"/>
                              <text x="552" y="84" textAnchor="middle" fontSize="7.5" fill="#0070d2" fontFamily="sans-serif">Edit</text>

                              {/* Contact Information section */}
                              <text x="172" y="139" fontSize="9" fontWeight="bold" fill="#3e3e3c" fontFamily="sans-serif">Contact Information</text>
                              <line x1="172" y1="144" x2="590" y2="144" stroke="#dddbda" strokeWidth="0.5"/>
                              {/* Row 1 */}
                              <text x="172" y="160" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Lead Name</text>
                              <text x="172" y="172" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Jane Smith</text>
                              <text x="390" y="160" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Phone</text>
                              <text x="390" y="172" fontSize="8.5" fill="#0070d2" fontFamily="sans-serif">(555) 867-5309</text>
                              {/* Row 2 */}
                              <text x="172" y="190" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Email</text>
                              <text x="172" y="202" fontSize="8.5" fill="#0070d2" fontFamily="sans-serif">jane.smith@email.com</text>
                              <text x="390" y="190" fontSize="7" fill="#706e6b" fontFamily="sans-serif">ZIP Code</text>
                              <text x="390" y="202" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">10001</text>
                              {/* Row 3 */}
                              <text x="172" y="220" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Lead Source</text>
                              <text x="172" y="232" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Web Form</text>
                              <text x="390" y="220" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Lead Status</text>
                              <text x="390" y="232" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">New</text>

                              {/* Campaign Information section */}
                              <text x="172" y="252" fontSize="9" fontWeight="bold" fill="#3e3e3c" fontFamily="sans-serif">Campaign Information</text>
                              <line x1="172" y1="257" x2="590" y2="257" stroke="#dddbda" strokeWidth="0.5"/>
                              {/* Referral # highlighted row */}
                              <rect x="158" y="260" width="442" height="38" fill="#f0fdf4"/>
                              <rect x="158" y="260" width="4" height="38" fill="#22c55e"/>
                              <text x="172" y="276" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Referral #</text>
                              <text x="172" y="289" fontSize="9" fontWeight="bold" fill="#166534" fontFamily="sans-serif">GA-4821</text>
                              <text x="390" y="276" fontSize="7" fill="#706e6b" fontFamily="sans-serif">Campaign</text>
                              <text x="390" y="289" fontSize="8.5" fill="#3e3e3c" fontFamily="sans-serif">Google CPC — Diabetes Devices</text>

                              {/* Activity bar */}
                              <rect x="158" y="298" width="442" height="60" fill="#f8f7f6"/>
                              <line x1="158" y1="298" x2="600" y2="298" stroke="#dddbda" strokeWidth="1"/>
                              <text x="172" y="315" fontSize="7.5" fill="#706e6b" fontFamily="sans-serif" fontWeight="600">Activity</text>
                              <rect x="172" y="320" width="58" height="16" rx="4" fill="white" stroke="#dddbda" strokeWidth="1"/>
                              <text x="201" y="331" textAnchor="middle" fontSize="7" fill="#0070d2" fontFamily="sans-serif">Log a Call</text>
                              <rect x="236" y="320" width="58" height="16" rx="4" fill="white" stroke="#dddbda" strokeWidth="1"/>
                              <text x="265" y="331" textAnchor="middle" fontSize="7" fill="#0070d2" fontFamily="sans-serif">Send Email</text>
                              <rect x="300" y="320" width="52" height="16" rx="4" fill="white" stroke="#dddbda" strokeWidth="1"/>
                              <text x="326" y="331" textAnchor="middle" fontSize="7" fill="#0070d2" fontFamily="sans-serif">New Task</text>
                            </svg>
                          </div>

                        </div>
                      </div>

                      {/* Webpage infographic */}
                      <div className="lg:w-5/12 shrink-0">
                        <svg
                          viewBox="0 0 520 340"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-full rounded-xl shadow-lg border border-gray-200"
                          aria-label="Diabetes Devices landing page mockup"
                        >
                          <rect width="520" height="340" rx="10" fill="#f9fafb" />
                          <rect width="520" height="36" rx="10" fill="#e5e7eb" />
                          <rect y="26" width="520" height="10" fill="#e5e7eb" />
                          <circle cx="18" cy="18" r="5" fill="#f87171" />
                          <circle cx="34" cy="18" r="5" fill="#fbbf24" />
                          <circle cx="50" cy="18" r="5" fill="#34d399" />
                          <rect x="70" y="10" width="380" height="16" rx="8" fill="#fff" />
                          <text x="260" y="22" textAnchor="middle" fontSize="8" fill="#9ca3af" fontFamily="sans-serif">byramhealthcare.com/diabetes-devices</text>
                          <rect x="0" y="36" width="520" height="304" fill="#fff" />
                          <rect x="0" y="36" width="520" height="28" fill="#1e3a5f" />
                          <text x="20" y="54" fontSize="9" fill="#fff" fontFamily="sans-serif" fontWeight="bold">Byram Healthcare</text>
                          <text x="360" y="54" fontSize="8" fill="#cbd5e1" fontFamily="sans-serif">Products</text>
                          <text x="400" y="54" fontSize="8" fill="#cbd5e1" fontFamily="sans-serif">Insurance</text>
                          <text x="445" y="54" fontSize="8" fill="#cbd5e1" fontFamily="sans-serif">Contact</text>
                          <text x="24" y="90" fontSize="13" fontWeight="bold" fill="#111827" fontFamily="sans-serif">Diabetes Devices</text>
                          <rect x="24" y="96" width="48" height="2" rx="1" fill="#1e3a5f" />
                          <text x="24" y="115" fontSize="7.5" fill="#4b5563" fontFamily="sans-serif">A continuous glucose monitor (CGM) tracks</text>
                          <text x="24" y="126" fontSize="7.5" fill="#4b5563" fontFamily="sans-serif">your blood sugar in real time — no finger</text>
                          <text x="24" y="137" fontSize="7.5" fill="#4b5563" fontFamily="sans-serif">pricks needed. A small sensor placed under</text>
                          <text x="24" y="148" fontSize="7.5" fill="#4b5563" fontFamily="sans-serif">the skin sends readings to your phone every</text>
                          <text x="24" y="159" fontSize="7.5" fill="#4b5563" fontFamily="sans-serif">few minutes, alerting you to highs and lows</text>
                          <text x="24" y="170" fontSize="7.5" fill="#4b5563" fontFamily="sans-serif">so you can act quickly and stay in range.</text>
                          <ellipse cx="130" cy="235" rx="52" ry="34" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1.5" />
                          <ellipse cx="130" cy="235" rx="30" ry="18" fill="#bae6fd" stroke="#38bdf8" strokeWidth="1" />
                          <circle cx="130" cy="235" r="6" fill="#0284c7" />
                          <text x="130" y="278" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="sans-serif">CGM Sensor</text>
                          <line x1="258" y1="70" x2="258" y2="330" stroke="#e5e7eb" strokeWidth="1" />
                          <text x="278" y="90" fontSize="10" fontWeight="bold" fill="#111827" fontFamily="sans-serif">Check Your Coverage</text>
                          <text x="278" y="103" fontSize="7" fill="#6b7280" fontFamily="sans-serif">Fill out the form and a specialist will reach out.</text>
                          <text x="278" y="122" fontSize="7.5" fill="#374151" fontFamily="sans-serif" fontWeight="600">Full Name</text>
                          <rect x="278" y="126" width="218" height="18" rx="4" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1" />
                          <text x="285" y="138" fontSize="7" fill="#9ca3af" fontFamily="sans-serif">Jane Smith</text>
                          <text x="278" y="158" fontSize="7.5" fill="#374151" fontFamily="sans-serif" fontWeight="600">Email Address</text>
                          <rect x="278" y="162" width="218" height="18" rx="4" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1" />
                          <text x="285" y="174" fontSize="7" fill="#9ca3af" fontFamily="sans-serif">jane@example.com</text>
                          <text x="278" y="194" fontSize="7.5" fill="#374151" fontFamily="sans-serif" fontWeight="600">ZIP Code</text>
                          <rect x="278" y="198" width="218" height="18" rx="4" fill="#f9fafb" stroke="#d1d5db" strokeWidth="1" />
                          <text x="285" y="210" fontSize="7" fill="#9ca3af" fontFamily="sans-serif">10001</text>
                          <rect x="278" y="228" width="218" height="22" rx="5" fill="#1e3a5f" />
                          <text x="387" y="243" textAnchor="middle" fontSize="8.5" fill="#fff" fontFamily="sans-serif" fontWeight="bold">Get Started →</text>
                          <text x="387" y="264" textAnchor="middle" fontSize="6.5" fill="#9ca3af" fontFamily="sans-serif">🔒 Your information is safe with us.</text>
                        </svg>
                      </div>

                    </div>

                    {/* CDP Section */}
                    <div className="mt-12 pt-8 border-t border-gray-200">

                      <h3 id="in-comes-cdp" className="text-xl font-bold text-gray-900 mb-6 scroll-mt-24">
                        In Comes the Customer Data Platform
                      </h3>

                      <div className="text-gray-500 text-base leading-relaxed font-light space-y-4">
                        <p>
                          At this point we began seriously discussing the need for a customer data platform.
                        </p>
                        <p className="font-medium text-gray-700">The major problems were thus —</p>
                        <p>
                          While our existing financial reports could now track leads who submitted a form and
                          turned into a paying customer there were still some leads that we couldn&apos;t track
                          which left us blind as to what the total value of our advertising was.
                        </p>
                        <p>
                          For example, in some cases a patient could submit a form, not convert over the phone,
                          and then go see their doctor and ask for Byram Healthcare to fulfill that order. The
                          patient would not be counted under the total orders attributed to digital advertising.
                          We noticed thousands of leads not converting which left us wondering if these
                          touchpoints were valuable to the business.
                        </p>

                        {/* Venn diagram */}
                        <div className="my-4">
                          <svg
                            viewBox="0 0 560 290"
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-full rounded-xl border border-gray-200 bg-gray-50"
                            aria-label="Digital advertising lead generation outcomes"
                          >
                            {/* Title */}
                            <text x="280" y="22" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e3a5f" fontFamily="sans-serif">Digital Advertising Lead Generation Outcomes</text>
                            <text x="280" y="36" textAnchor="middle" fontSize="8.5" fill="#6b7280" fontFamily="sans-serif">Example Distribution of 100 Leads</text>

                            {/* Bubble 1 — 50% Did Not Convert (Form) */}
                            <circle cx="90" cy="138" r="78" fill="#d1d5db" opacity="0.85"/>
                            <text x="90" y="130" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#374151" fontFamily="sans-serif">50%</text>
                            <text x="90" y="146" textAnchor="middle" fontSize="7" fill="#374151" fontFamily="sans-serif">Did Not Convert</text>
                            <text x="90" y="157" textAnchor="middle" fontSize="7" fill="#374151" fontFamily="sans-serif">(Form)</text>

                            {/* Bubble 2 — 30% Did Not Convert (Phone) */}
                            <circle cx="232" cy="138" r="61" fill="#e5e7eb" opacity="0.9"/>
                            <text x="232" y="131" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#374151" fontFamily="sans-serif">30%</text>
                            <text x="232" y="145" textAnchor="middle" fontSize="7" fill="#374151" fontFamily="sans-serif">Did Not Convert</text>
                            <text x="232" y="155" textAnchor="middle" fontSize="7" fill="#374151" fontFamily="sans-serif">(Phone)</text>

                            {/* Bubble 3 — 10% Converted via Phone */}
                            <circle cx="348" cy="138" r="36" fill="#86efac" opacity="0.9"/>
                            <text x="348" y="133" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#166534" fontFamily="sans-serif">10%</text>
                            <text x="348" y="146" textAnchor="middle" fontSize="6.5" fill="#166534" fontFamily="sans-serif">Converted</text>
                            <text x="348" y="156" textAnchor="middle" fontSize="6.5" fill="#166534" fontFamily="sans-serif">(Phone)</text>

                            {/* Bubble 4 — 10% Converted via Form */}
                            <circle cx="452" cy="138" r="36" fill="#4ade80" opacity="0.9"/>
                            <text x="452" y="133" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#14532d" fontFamily="sans-serif">10%</text>
                            <text x="452" y="146" textAnchor="middle" fontSize="6.5" fill="#14532d" fontFamily="sans-serif">Converted</text>
                            <text x="452" y="156" textAnchor="middle" fontSize="6.5" fill="#14532d" fontFamily="sans-serif">(Form)</text>

                            {/* Legend */}
                            <circle cx="140" cy="252" r="6" fill="#d1d5db"/>
                            <text x="150" y="256" fontSize="7.5" fill="#6b7280" fontFamily="sans-serif">Did not convert — left us blind on ROI</text>
                            <circle cx="350" cy="252" r="6" fill="#4ade80"/>
                            <text x="360" y="256" fontSize="7.5" fill="#6b7280" fontFamily="sans-serif">Converted — tracked in reports</text>

                            {/* 80% callout */}
                            <rect x="24" y="228" width="96" height="16" rx="4" fill="#f3f4f6" stroke="#e5e7eb" strokeWidth="1"/>
                            <text x="72" y="239" textAnchor="middle" fontSize="7.5" fill="#374151" fontWeight="bold" fontFamily="sans-serif">80% untracked</text>
                          </svg>
                        </div>

                        <p>After seeing the benefits of realtime tracking of online leads, a few other use cases came to light:</p>
                        <ul className="list-none space-y-3 ml-4">
                          <li className="flex gap-2">
                            <span className="shrink-0 text-gray-400">—</span>
                            <span>
                              <span className="font-medium text-gray-700">Large scale top-of-funnel CRM campaigns.</span> Meaning the collected data
                              (phone numbers and emails), if not tied with a converted customer, could be placed
                              automatically in top-of-the-funnel campaigns to discover what stage the customer
                              is at and to encourage the completion of their initial inquiry.
                            </span>
                          </li>
                          <li className="flex gap-2">
                            <span className="shrink-0 text-gray-400">—</span>
                            <span>
                              <span className="font-medium text-gray-700">Predictive models</span> which could use the data we collect on user
                              behavior (form submissions, orders, phone calls, web visits) to predict the health
                              of the user and help plan for tailored follow-up to improve retention and customer
                              satisfaction.
                            </span>
                          </li>
                        </ul>
                      </div>

                      {/* The Groundwork */}
                      <div className="ml-6 mt-8">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">The Groundwork</p>
                        <div className="text-gray-500 text-base leading-relaxed font-light space-y-4">
                          <p>
                            Before we began, the company had started investing in cloud infrastructure and were
                            interested in using modern tools to see if it could generate alpha. We had access to
                            a modern data pipelining, stitching, and analytics tool which was able to pipe our
                            online web, app, survey, and call center data into a cloud database which hosted our
                            demographic and ordering data.
                          </p>

                          {/* Tech logo cards */}
                          <div className="flex flex-wrap gap-4 my-6">
                            {[
                              { name: 'Rudderstack', src: '/Rudderstack.png',  imgClass: 'h-10' },
                              { name: 'Snowflake',   src: undefined,           imgClass: 'h-10', slug: 'snowflake' },
                              { name: 'Google Ads',  src: '/GoogleAds2.png',   imgClass: 'h-10' },
                            ].map(({ name, src, imgClass, slug }) => (
                              <div
                                key={name}
                                className="flex flex-col items-center justify-center gap-2 px-5 py-4 rounded-xl border border-gray-200 bg-white shadow-sm w-36 h-24"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={src ?? `https://cdn.simpleicons.org/${slug}`}
                                  alt={`${name} logo`}
                                  className={`${imgClass} w-auto object-contain`}
                                />
                                <span className="text-xs font-medium text-gray-500">{name}</span>
                              </div>
                            ))}
                          </div>

                          <p>
                            The next step was to use the built-in stitching tool to tie together the identifiers
                            from each respective database to generate a universal ID — an umbrella number which
                            was our golden record tying all of our data together.
                          </p>
                          <p>
                            This was accomplished in a little over a year with a three-person team including
                            myself, a data engineer, and a data scientist. The key to our success was frequent
                            and detailed communication: recording videos explaining tickets, data products, and
                            data validation processes. We had weekly sprint planning meetings with an instant
                            message group chat which hosted daily conversations between the three of us.
                          </p>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              </div>

            </div>

          </div>
        </section>

      </main>

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} The Last Shall Be First. All rights reserved.
      </footer>
    </div>
  );
}

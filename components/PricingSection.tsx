'use client';

import { useState } from 'react';
import GetStartedModal from '@/components/GetStartedModal';

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CheckItem({ text, small = false }: { text: string; small?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className={`mt-0.5 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0 ${small ? 'w-4 h-4' : 'w-5 h-5'}`}>
        <svg className={`text-blue-200 ${small ? 'w-2.5 h-2.5' : 'w-3 h-3'}`} viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="text-sm text-blue-100 leading-snug">{text}</span>
    </div>
  );
}

export default function PricingSection() {
  const [buildOpen, setBuildOpen] = useState(true);
  const [managementOpen, setManagementOpen] = useState(true);
  const [customOpen, setCustomOpen] = useState(true);

  return (
    <section className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── Standard Packages ── */}
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-2">Standard Packages</h2>
          <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mb-6">
            Our three core services — Web Experience, Marketing, and Analytics — available as one-time
            builds or ongoing managed packages.
          </p>

          <div className="space-y-4">

        {/* ── Looking for something new? ── */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setBuildOpen(o => !o)}
            className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Looking for something new?</h2>
              <p className="text-gray-500 text-sm mt-1">One-time project fees to get you up and running</p>
            </div>
            <ChevronIcon open={buildOpen} />
          </button>

          {buildOpen && (
            <div className="px-8 pb-10">
              <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mb-10">
                Our three core packages — Web Experience, Marketing, and Analytics — can be powerful compliments
                to drive new customers to your new experience and make adjustments to meet their changing needs.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* Web Experience */}
                <div className="rounded-2xl bg-[#1e3a5f] text-white flex flex-col overflow-hidden">
                  <div className="px-7 pt-8 pb-6 border-b border-white/15">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Web Experience</p>
                    <p className="text-4xl font-bold">$1,500</p>
                    <p className="text-blue-200 text-sm mt-1">One-time project fee</p>
                    <p className="text-blue-300 text-xs mt-3 leading-relaxed italic">For our recommended tech stack, if you do not elect to work with us moving forward there is an estimated $74/mo technology cost for the tools to build, deploy, and maintain your website.</p>
                  </div>
                  <div className="px-7 py-6 flex-1 space-y-3">
                    {[
                      'Ordering or onboarding process development',
                      'Homepage / About / Blog page build & redesign',
                      'LiveChat or customer service technology integration',
                      '3 rewrites of all developed sections and pages',
                      'Quality assurance testing',
                      'Deployment',
                    ].map(item => <CheckItem key={item} text={item} />)}
                  </div>
                  <div className="px-7 pb-8">
                    <GetStartedModal triggerClassName="w-full bg-white text-[#1e3a5f] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                  </div>
                </div>

                {/* Marketing */}
                <div className="rounded-2xl bg-[#1d4ed8] text-white flex flex-col overflow-hidden shadow-xl scale-[1.02]">
                  <div className="px-7 pt-8 pb-6 border-b border-white/15">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Marketing</p>
                    <div className="space-y-1.5">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold">$300</span>
                        <span className="text-blue-200 text-sm">for initial account setup</span>
                      </div>
                      <p className="text-blue-300 text-xs italic">Maximum of 3 accounts</p>
                      <p className="text-blue-200 text-sm">+ $150 per new ad created</p>
                      <p className="text-blue-200 text-sm">+ optional 10% of ad spend for continued management</p>
                    </div>
                  </div>
                  <div className="px-7 py-6 flex-1 space-y-3">
                    {[
                      '3 Ad accounts created',
                      'Tracking pixel setup',
                      'Billing configuration',
                      'Social media page creation & linking',
                    ].map(item => <CheckItem key={item} text={item} />)}
                  </div>
                  <div className="px-7 pb-8">
                    <GetStartedModal triggerClassName="w-full bg-white text-[#1d4ed8] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                  </div>
                </div>

                {/* Analytics */}
                <div className="rounded-2xl bg-[#1e3a5f] text-white flex flex-col overflow-hidden">
                  <div className="px-7 pt-8 pb-6 border-b border-white/15">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Analytics</p>
                    <p className="text-4xl font-bold">$300</p>
                    <p className="text-blue-200 text-sm mt-1">for initial tracking and dashboard setup</p>
                  </div>
                  <div className="px-7 py-6 flex-1 space-y-3">
                    {[
                      'Full website tracking setup to measure views, users, clicks and more',
                      'Realtime and historical report of the full online journey of your customers',
                    ].map(item => <CheckItem key={item} text={item} />)}
                  </div>
                  <div className="px-7 pb-8">
                    <GetStartedModal triggerClassName="w-full bg-white text-[#1e3a5f] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

        {/* ── Looking for ongoing digital growth management? ── */}
        <div className="border border-gray-200 rounded-2xl overflow-hidden">
          <button
            onClick={() => setManagementOpen(o => !o)}
            className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-gray-50 transition-colors"
          >
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Looking for ongoing digital growth management?</h2>
              <p className="text-gray-500 text-sm mt-1">Ongoing support to grow and maintain your digital presence</p>
            </div>
            <ChevronIcon open={managementOpen} />
          </button>

          {managementOpen && (
            <div className="px-8 pb-10">
              <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mb-10">
                Let us handle the ongoing work so you can focus on running your business. These management
                packages keep your web experience, marketing campaigns, and analytics sharp month after month.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

                {/* Gold Package */}
                <div className="rounded-2xl bg-[#8B6914] text-white flex flex-col overflow-hidden shadow-xl scale-[1.02]">
                  <div className="px-7 pt-8 pb-6 border-b border-white/15">
                    <p className="text-xs font-semibold uppercase tracking-widest text-yellow-200 mb-2">🥇 Gold Package</p>
                    <p className="text-4xl font-bold">$399<span className="text-xl font-normal text-yellow-200">/mo</span></p>
                  </div>
                  <div className="px-7 py-6 flex-1 space-y-3">
                    {[
                      'Website hosting',
                      'Website updates',
                      'Monthly digital marketing reporting & recommendations',
                      'Ad creative consulting & research',
                      'Customer journey analytics',
                      '3 A/B tests',
                    ].map(item => <CheckItem key={item} text={item} />)}
                  </div>
                  <div className="px-7 pb-8">
                    <GetStartedModal triggerClassName="w-full bg-white text-[#8B6914] font-semibold py-3 rounded-xl text-sm hover:bg-yellow-50 transition-colors" />
                  </div>
                </div>

                {/* Silver Package */}
                <div className="rounded-2xl bg-[#4B5563] text-white flex flex-col overflow-hidden">
                  <div className="px-7 pt-8 pb-6 border-b border-white/15">
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-300 mb-2">🥈 Silver Package</p>
                    <p className="text-4xl font-bold">$299<span className="text-xl font-normal text-gray-300">/mo</span></p>
                  </div>
                  <div className="px-7 py-6 flex-1 space-y-3">
                    {[
                      'Website hosting',
                      'Website updates',
                      'Monthly digital marketing reporting',
                      'Customer journey analytics',
                    ].map(item => <CheckItem key={item} text={item} />)}
                  </div>
                  <div className="px-7 pb-8">
                    <GetStartedModal triggerClassName="w-full bg-white text-[#4B5563] font-semibold py-3 rounded-xl text-sm hover:bg-gray-50 transition-colors" />
                  </div>
                </div>

                {/* Bronze Package */}
                <div className="rounded-2xl bg-[#7C4A1E] text-white flex flex-col overflow-hidden">
                  <div className="px-7 pt-8 pb-6 border-b border-white/15">
                    <p className="text-xs font-semibold uppercase tracking-widest text-orange-200 mb-2">🥉 Bronze Package</p>
                    <p className="text-4xl font-bold">$250<span className="text-xl font-normal text-orange-200">/mo</span></p>
                  </div>
                  <div className="px-7 py-6 flex-1 space-y-3">
                    {[
                      'Website hosting',
                      'Website updates',
                      'Monthly digital marketing reporting',
                    ].map(item => <CheckItem key={item} text={item} />)}
                  </div>
                  <div className="px-7 pb-8">
                    <GetStartedModal triggerClassName="w-full bg-white text-[#7C4A1E] font-semibold py-3 rounded-xl text-sm hover:bg-orange-50 transition-colors" />
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>

            {/* ── Looking for a custom technology or marketing solution that doesn't fit the bill? ── */}
            <div className="border border-gray-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setCustomOpen(o => !o)}
                className="w-full flex items-center justify-between px-8 py-6 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Looking for a custom technology or marketing solution that doesn't fit the bill?</h2>
                  <p className="text-gray-500 text-sm mt-1">Tailored scope, timeline, and pricing for your project</p>
                </div>
                <ChevronIcon open={customOpen} />
              </button>

            {customOpen && (
              <div className="px-8 pb-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                  <div className="rounded-2xl bg-[#1e3a5f] text-white flex flex-col overflow-hidden">
                    <div className="px-7 pt-8 pb-6 border-b border-white/15">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Web Experience & Automations</p>
                      <p className="text-3xl font-bold">Custom</p>
                      <p className="text-blue-200 text-sm mt-1">Scoped to your project</p>
                    </div>
                    <div className="px-7 py-6 flex-1 space-y-3">
                      {[
                        'Multi-page builds & complex integrations',
                        'Automated customer communication journey builds and integration',
                        'Custom feature development',
                      ].map(item => <CheckItem key={item} text={item} />)}
                    </div>
                    <div className="px-7 pb-8">
                      <GetStartedModal triggerClassName="w-full bg-white text-[#1e3a5f] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#1d4ed8] text-white flex flex-col overflow-hidden shadow-xl scale-[1.02]">
                    <div className="px-7 pt-8 pb-6 border-b border-white/15">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Marketing</p>
                      <p className="text-3xl font-bold">Custom</p>
                      <p className="text-blue-200 text-sm mt-1">Scoped to your campaigns</p>
                    </div>
                    <div className="px-7 py-6 flex-1 space-y-3">
                      {[
                        'Social media ad creation',
                        'Full digital marketing management',
                        'Business profile creation',
                      ].map(item => <CheckItem key={item} text={item} />)}
                    </div>
                    <div className="px-7 pb-8">
                      <GetStartedModal triggerClassName="w-full bg-white text-[#1d4ed8] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-[#1e3a5f] text-white flex flex-col overflow-hidden">
                    <div className="px-7 pt-8 pb-6 border-b border-white/15">
                      <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Analytics</p>
                      <p className="text-3xl font-bold">Custom</p>
                      <p className="text-blue-200 text-sm mt-1">Scoped to your data needs</p>
                    </div>
                    <div className="px-7 py-6 flex-1 space-y-3">
                      {[
                        'Custom data storage to provide answers to deeper questions like, "Which of my website users are converting into sales and what do they interact with prior to that sale"',
                      ].map(item => <CheckItem key={item} text={item} />)}
                    </div>
                    <div className="px-7 pb-8">
                      <GetStartedModal triggerClassName="w-full bg-white text-[#1e3a5f] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                    </div>
                  </div>

                </div>
              </div>
            )}
            </div>{/* end Looking for a custom technology or marketing solution that doesn't fit the bill? */}

          </div>{/* end space-y-4 */}
        </div>{/* end Standard Packages */}

      </div>
    </section>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = { title: 'About Time | Meet the Creator' };

export default function AboutTimePage() {
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
            <Link href="/about-time" className="text-sm text-gray-900 font-medium border-b-2 border-brand-600">
              About
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

      {/* Page body: two-column layout */}
      <div className="max-w-6xl mx-auto w-full px-6 py-16 flex flex-col lg:flex-row gap-16 items-start flex-1">

        {/* Left — scrollable content */}
        <div className="flex-1 min-w-0">

          <span className="inline-block text-xs font-semibold tracking-widest text-brand-600 uppercase mb-4">
            Our Story
          </span>

          <h1 className="text-5xl font-bold text-gray-900 leading-tight mb-10">
            Meet the Creator
          </h1>

          <div className="space-y-8 text-gray-600 text-lg leading-relaxed">

            <blockquote className="border-l-4 border-brand-500 pl-4 text-gray-600 italic text-lg leading-relaxed">
              What I hope above all things that could be said about me is that I&apos;m a good friend and serve
              the needs of my family, community, and clients. What has been said is that I&apos;m a character,
              that I can dive deep into problems, and that I use too many visualizations in my PowerPoints.
            </blockquote>

            <p>
              I am a product manager with experience working through every phase of digital customer
              onboarding including digital marketing, web development, CRM, and customer data. I thoroughly
              enjoy solutioning and working with development teams to get things done.
            </p>

            <p>
              My perspective has been shaped by:
            </p>

            <div className="ml-4 space-y-3">

              {/* Web Designer */}
              <div className="flex items-start gap-4 py-4 px-5 rounded-xl border border-gray-200">
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1e3a5f' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </div>
                <div className="text-base leading-relaxed">
                  <span className="font-bold text-gray-900">Web Designer</span>
                  <span className="text-gray-600"> — building customer experiences</span>
                </div>
              </div>

              {/* Web Analyst */}
              <div className="flex items-start gap-4 py-4 px-5 rounded-xl border border-gray-200">
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1e3a5f' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
                  </svg>
                </div>
                <div className="text-base leading-relaxed">
                  <span className="font-bold text-gray-900">Web Analyst</span>
                  <span className="text-gray-600"> — tracking and analyzing onboarding campaigns</span>
                </div>
              </div>

              {/* CDP Manager */}
              <div className="flex items-start gap-4 py-4 px-5 rounded-xl border border-gray-200">
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1e3a5f' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
                  </svg>
                </div>
                <div className="text-base leading-relaxed">
                  <span className="font-bold text-gray-900">CDP Manager</span>
                  <span className="text-gray-600"> — tying business data together to understand the full patient journey, then improve it with real-time analytics and personalized communication</span>
                </div>
              </div>

              {/* Solutions Architect */}
              <div className="flex items-start gap-4 py-4 px-5 rounded-xl border border-gray-200">
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1e3a5f' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07M8.46 8.46a5 5 0 0 0 0 7.07"/>
                  </svg>
                </div>
                <div className="text-base leading-relaxed">
                  <span className="font-bold text-gray-900">Solutions Architect</span>
                  <span className="text-gray-600"> — automating the onboarding journey to reduce time to first contact</span>
                </div>
              </div>

              {/* Digital Marketing Manager */}
              <div className="flex items-start gap-4 py-4 px-5 rounded-xl border border-gray-200">
                <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: '#1e3a5f' }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
                  </svg>
                </div>
                <div className="text-base leading-relaxed">
                  <span className="font-bold text-gray-900">Digital Marketing Manager</span>
                  <span className="text-gray-600"> — testing every digital platform and tool to generate some kind of alpha</span>
                </div>
              </div>

            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">

              <div className="rounded-xl border border-gray-200 px-6 py-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Impact</span>
                </div>
                <p className="text-green-600 font-bold text-xl leading-snug">Decreased time-to-first-contact by 4+ hours</p>
              </div>

              <div className="rounded-xl border border-gray-200 px-6 py-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Impact</span>
                </div>
                <p className="text-green-600 font-bold text-xl leading-snug">Generated 16+ M in LTV</p>
              </div>

              <div className="rounded-xl border border-gray-200 px-6 py-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Impact</span>
                </div>
                <p className="text-green-600 font-bold text-xl leading-snug">Improved conversion rates by 10% using AI</p>
              </div>

            </div>

            <p>
              Working on all these facets of the customer experience has given me a good understanding
              of how to source information about customers/patients to understand their problems. A mix
              of stakeholder interviews, market research, surveys, and listening to patient phone calls.
              The ability to translate that into a business case. And an understanding of the granular
              detail, roadmaps, and communication a development team needs to launch features on a
              timely basis.
            </p>

            {/* Top Skills + Top Technical Skills */}
            <div className="space-y-8 pt-2">

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-5">Top Skills</h1>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Hard Work', 'Listening', 'Getting Into The Weeds', 'Getting Out Of The Weeds For A 1,000 Foot View', 'Communication', 'Going From 0 To 1'].map((skill) => (
                    <div key={skill} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-base">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-5">Top Technical Skills</h1>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Learning Any Martech Platform', 'Preparing Data For Activation', 'Claude AI'].map((skill) => (
                    <div key={skill} className="px-5 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium text-base">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            <p>
              I pick up new platforms like it&apos;s my job, because it is my job, and understand how AI can be
              integrated into your business processes usefully because it&apos;s something I&apos;ve physically
              done.
            </p>

            <p>
              Of all the things I&apos;m grateful for, I&apos;m most thankful for the experience I&apos;ve had
              working with a small team of developers releasing features at lightning speed, because it&apos;s
              shown me what it takes to keep pace with startups: hard work, open lines of communication, and
              detailed tickets and Loom videos.
            </p>

            <p>
              I&apos;m looking forward to transforming your business.
            </p>

          </div>

          {/* Signature */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-gray-400 text-sm mb-3">Signed,</p>
            <p className="font-semibold text-gray-900 text-2xl" style={{ fontFamily: 'Georgia, serif' }}>
              Daniel Fedak
            </p>
            <p className="text-sm text-gray-400 mt-1">Founder, The Last Shall Be First</p>
          </div>
        </div>

        {/* Right — sticky image */}
        <div className="w-full lg:w-96 shrink-0 lg:sticky lg:top-24">
          <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-xl">
            {/* Replace the src below with your real image path or URL */}
            <Image
              src="/DanielFedakHeadshot.jpeg"
              alt="Daniel Fedak"
              fill
              className="object-cover"
              style={{ objectPosition: 'calc(50% - 25px) center' }}
              sizes="(max-width: 1024px) 100vw, 384px"
              priority
            />
            {/* Gradient overlay at the bottom */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 inset-x-0 p-6">
              <p className="text-white font-semibold text-lg leading-tight">The Last Shall Be First</p>
              <p className="text-white/70 text-sm mt-1">Founder &amp; Creator</p>
            </div>
          </div>

          {/* Quote card below image */}
          <blockquote className="mt-6 border-l-4 border-brand-500 pl-4 text-gray-600 italic text-sm leading-relaxed">
            "But many who are first will be last, and many who are last will be first."
            <cite className="block mt-2 not-italic text-gray-400 text-xs">— Matthew 19:30</cite>
          </blockquote>
        </div>

      </div>

      {/* Pizza Vision Section */}
      <section className="w-full relative py-20 px-6 overflow-hidden">

        {/* Background image with blur */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=1600&q=80"
            alt="Chef placing pizza in brick oven"
            fill
            className="object-cover scale-105 blur-sm"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-white/78" />
        </div>

        <div className="relative z-10">

          {/* Heading */}
          <div className="max-w-4xl mx-auto text-center mb-12 bg-gray-100/90 backdrop-blur-sm rounded-2xl px-8 py-10 shadow-sm">
            <h1 className="text-4xl sm:text-5xl font-bold mb-8 leading-tight text-gray-900">
              Vision for an Exceptional Pizza Experience
            </h1>
            <p className="text-gray-700 italic text-xl leading-relaxed">
              The client virtually enters your online store — it&apos;s perfectly clean, uncluttered and easy
              to navigate. If you are a pizza shop, that means product pictures enter the field of vision
              immediately. The products themselves are clickable which begins the order process. The product
              is chosen and now a series of follow up questions begin about toppings, add-ons, recommendations
              for other pies and sides based on their historical transactions. On the checkout screen a few
              different payment options are offered and if they choose a credit card over Apple Pay then that
              process is well designed and easy to read because you use Stripe on the backend. After purchase
              the customer receives notifications if the product gets delayed, when it arrives, and after
              delivery for a quick follow up survey. It&apos;s now been three weeks since your customer last
              ordered and they typically order every two weeks, they receive a casual notification with an
              image of a signature pie to remind them why they chose you in the first place and a coupon code
              to sweeten the deal.
            </p>
            <p className="mt-6 italic text-gray-600 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
              Bon Appétit.
            </p>
          </div>

          {/* Process cards */}
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-0">

              {/* Card 1 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">Client enters your online store</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* Card 2 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">They are provided a one click away option to start their order</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* Card 3 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">They are asked personalized follow-up questions before their order is completed</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* Card 4 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">They are provided modern payment apps as alternatives to credit card processing</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* Card 5 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">A series of follow-up messages occur for customer satisfaction</p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden lg:flex items-center justify-center px-2 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 rotate-90 lg:rotate-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </div>

              {/* Card 6 */}
              <div className="flex flex-col items-center flex-1">
                <div className="w-full bg-white/85 backdrop-blur-sm border border-gray-200 rounded-2xl p-6 flex flex-col items-center text-center gap-4 h-full shadow-sm">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1e3a5f' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 leading-snug">Encourage retention by reminding them why they came in the first place</p>
                </div>
              </div>

            </div>

          </div>

        </div>

      </section>

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} The Last Shall Be First. All rights reserved.
      </footer>
    </div>
  );
}

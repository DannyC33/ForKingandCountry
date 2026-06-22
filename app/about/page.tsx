import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';

export const metadata: Metadata = { title: 'About | Meet the Creator' };

export default function AboutPage() {
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
            <Link href="/about" className="text-sm text-gray-900 font-medium border-b-2 border-brand-600">
              About
            </Link>
            <Link href="/case-studies" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
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
            <ul className="list-none space-y-2 ml-4 mt-2">
              <li className="flex gap-2">
                <span className="shrink-0 text-gray-600">—</span>
                <span><span className="italic">Testing new digital marketing creative, campaigns, mediums</span> as a digital marketing manager</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-gray-600">—</span>
                <span><span className="italic">Building wireframes and managing development projects</span> as a technical project manager</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-gray-600">—</span>
                <span><span className="italic">Migrating and building tracking code</span> as a digital analyst</span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-gray-600">—</span>
                <span><span className="italic">Creating features and products that personalize and analyze the full patient journey</span> as a customer data platform product manager</span>
              </li>
            </ul>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">

              <div className="rounded-xl border border-gray-200 px-6 py-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Impact</span>
                </div>
                <p className="text-green-600 font-bold text-xl leading-snug">Decreased time to first contact by 4+ hours</p>
              </div>

              <div className="rounded-xl border border-gray-200 px-6 py-5">
                <div className="flex items-center gap-1.5 mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                  </svg>
                  <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Impact</span>
                </div>
                <p className="text-green-600 font-bold text-xl leading-snug">Generated $16M+ in LTV</p>
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
              of how to source information about customers/patients to understand their problems. In my
              experience the formula is stakeholder interviews, market research, surveys, and listening
              to patient phone calls. I have a proven track record translating business stories into
              business cases and plans to take a project from 0 to 1.
            </p>

            {/* Top Skills + Top Technical Skills */}
            <div className="space-y-8 pt-2">

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-5">Top Skills</h1>
                <div className="flex flex-wrap justify-center gap-3">
                  {['Hard Work', 'Listening', 'Getting Into The Weeds', 'Maintaining A 1000 Foot View', 'Communication', 'Going From 0 To 1'].map((skill) => (
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

              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-5">Top Platforms</h1>
                <div className="flex flex-wrap justify-center gap-4">
                  {[
                    { name: 'Claude AI',     slug: 'claude',        src: '/ClaudeAI.png',                  href: 'https://claude.ai',                            imgClass: 'h-[90px]', imgStyle: { transform: 'translate(-2px, -15px)' } },
                    { name: 'Snowflake',     slug: 'snowflake',     href: 'https://www.snowflake.com',                                                        imgStyle: { transform: 'translateY(-5px)' } },
                    { name: 'Salesforce',    slug: 'salesforce',    src: '/salesforce-with-type-logo.svg',  href: 'https://www.salesforce.com',                   imgStyle: { transform: 'translateY(-5px)' } },
                    { name: 'Rudderstack',   slug: 'rudderstack',   src: '/Rudderstack.png',                href: 'https://www.rudderstack.com',                  imgClass: 'h-[53px]', imgStyle: { transform: 'translateY(-5px)' } },
                    { name: 'Monday.com',    slug: 'mondaydotcom',  src: '/monday-logo-x2.png',             href: 'https://monday.com',                           imgClass: 'h-11' },
                    { name: 'Jira',          slug: 'jira',          href: 'https://www.atlassian.com/software/jira' },
                    { name: 'CallRail',      slug: 'callrail',      src: '/callrail-logotype.svg',          href: 'https://www.callrail.com',                     imgClass: 'h-[26px]' },
                    { name: 'Google Ads',       slug: 'googleads',     src: '/GoogleAds2.png',       href: 'https://ads.google.com',       imgClass: 'h-[55px]' },
                    { name: 'Google Analytics', slug: 'googleanalytics', src: '/GoogleAnalytics.png', href: 'https://analytics.google.com', imgClass: 'h-[46px]' },
                    { name: 'Facebook Ads',     slug: 'facebook',      href: 'https://www.facebook.com/business/ads' },
                    { name: 'Data Studio',   slug: 'datastudio',    src: '/GoogleDataStudio2.png',          href: 'https://datastudio.google.com',                imgClass: 'h-11' },
                    { name: 'Power BI',      slug: 'powerbi',       src: '/PowerBI.png',                   href: 'https://powerbi.microsoft.com',                imgClass: 'h-[53px]' },
                  ].map(({ name, slug, src, href, imgClass, imgStyle }) => (
                    <a
                      key={name}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="relative flex flex-col items-center justify-between gap-3 px-4 py-5 rounded-xl border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all text-center w-36 h-28 overflow-hidden"
                    >
                      <div className="flex-1 flex items-center justify-center w-full">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={src ?? `https://cdn.simpleicons.org/${slug}`}
                          alt={`${name} logo`}
                          className={`${imgClass ?? 'h-10'} w-auto max-w-full object-contain`}
                          style={imgStyle}
                        />
                      </div>
                      <span className="absolute left-0 right-0 text-center text-sm font-medium text-gray-700 leading-tight px-2" style={{ top: '75%' }}>
                        {name}
                      </span>
                    </a>
                  ))}
                </div>
              </div>

            </div>

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

      <footer className="border-t border-gray-200 py-8 px-6 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} The Last Shall Be First. All rights reserved.
      </footer>
    </div>
  );
}

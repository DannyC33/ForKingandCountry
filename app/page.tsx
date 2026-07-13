import React, { Fragment } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getBlogPosts } from '@/lib/webflow/client';
import type { WebflowPost } from '@/lib/webflow/client';
import GetStartedModal from '@/components/GetStartedModal';

export const revalidate = 3600;

function PostCard({ post }: { post: WebflowPost }) {
  const image = post.fieldData['main-image'];
  const summary = post.fieldData['post-summary'] ?? '';
  const publishedOn = post.fieldData['published-on'] ?? post.createdOn;

  return (
    <Link
      href={`/blog/${post.fieldData.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
    >
      {image?.url && (
        <div className="relative h-48 w-full bg-gray-100">
          <Image
            src={image.url}
            alt={image.alt ?? post.fieldData.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-5 flex flex-col flex-1 gap-2">
        <p className="text-xs text-gray-400">
          {new Date(publishedOn).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <h3 className="text-lg font-semibold text-gray-900 group-hover:text-brand-500 transition-colors line-clamp-2">
          {post.fieldData.name}
        </h3>
        {summary && <p className="text-sm text-gray-500 line-clamp-3">{summary}</p>}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  let posts: WebflowPost[] = [];
  try {
    posts = await getBlogPosts();
  } catch {
    // Webflow not configured — show empty state
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-24 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 font-bold text-2xl tracking-tight text-gray-900">
            <Image src="/LogoV1.png" alt="Servus logo" width={88} height={88} className="object-contain" priority />
            Servus
          </Link>
          <nav aria-label="Main navigation" className="flex items-center gap-4">
            <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              About
            </Link>
            <a
              href="tel:9089021994"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <svg aria-hidden="true" focusable="false" xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.63 3.4 2 2 0 0 1 3.6 1.21h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.82a16 16 0 0 0 6.06 6.06l.95-.95a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              908-902-1994
            </a>
            <GetStartedModal triggerClassName="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors" />
          </nav>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        {/* Hero */}
        <section className="bg-brand-50 pt-[97px] pb-16 px-6">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">

            {/* Left: text + CTAs */}
            <div className="flex-1 space-y-6 text-center lg:text-left">
              <h1 className="text-5xl font-bold text-gray-900 leading-tight">
                Work with Us
              </h1>
              <p className="text-xl text-gray-500 leading-relaxed">
                There&apos;s no reason technology should be a barrier for customers to receive your great
                product. At Servus our standard is a tailored online experience at an affordable price.
              </p>
              <div className="flex justify-center lg:justify-start gap-3">
                <GetStartedModal />
              </div>
            </div>

            {/* Right: old vs new infographic */}
            <div className="w-full lg:w-[740px] shrink-0">
              <svg
                viewBox="0 0 636 350"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full drop-shadow-lg"
                role="img"
              aria-label="Old 2000s order form vs modern pizza topping selector"
              >
                {/* ── LEFT PANEL: 2000s Form (shifted right) ── */}
                <g transform="translate(370,0)">
                {/* Window shadow */}
                <rect x="8" y="8" width="254" height="296" fill="#00000022" rx="2"/>
                {/* Window frame */}
                <rect x="5" y="5" width="254" height="296" fill="#ece9d8" rx="2" stroke="#808080" strokeWidth="1"/>
                {/* Title bar */}
                <rect x="5" y="5" width="254" height="22" fill="#000080" rx="2"/>
                <rect x="5" y="18" width="254" height="9" fill="#000080"/>
                <text x="14" y="19" fontSize="8" fill="white" fontFamily="serif" fontStyle="italic">Pizza Order - Internet Explorer</text>
                {/* Window buttons */}
                <rect x="222" y="7" width="15" height="14" fill="#c0392b" rx="1"/>
                <text x="229" y="18" textAnchor="middle" fontSize="9" fill="white" fontFamily="sans-serif">×</text>
                <rect x="205" y="7" width="15" height="14" fill="#7f8c8d" rx="1"/>
                <rect x="188" y="7" width="15" height="14" fill="#7f8c8d" rx="1"/>
                {/* Toolbar */}
                <rect x="5" y="27" width="254" height="18" fill="#d4d0c8"/>
                <rect x="36" y="30" width="185" height="12" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="39" y="39" fontSize="5.5" fill="#000080" fontFamily="serif">http://www.pizzaplace.com/order.htm</text>
                {/* Page body */}
                <rect x="5" y="45" width="254" height="256" fill="white"/>
                {/* Form title */}
                <text x="132" y="64" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#000080" fontFamily="serif">PIZZA ORDER FORM</text>
                <line x1="20" y1="68" x2="244" y2="68" stroke="#000080" strokeWidth="1"/>
                <text x="20" y="79" fontSize="6.5" fill="red" fontFamily="serif">* All fields required</text>
                {/* Name */}
                <text x="20" y="95" fontSize="8" fill="#000000" fontFamily="serif">Your Name:</text>
                <rect x="82" y="84" width="138" height="14" fill="white" stroke="#808080" strokeWidth="1"/>
                <line x1="82" y1="84" x2="220" y2="84" stroke="#ffffff" strokeWidth="1"/>
                <line x1="82" y1="84" x2="82" y2="98" stroke="#ffffff" strokeWidth="1"/>
                {/* Phone */}
                <text x="20" y="115" fontSize="8" fill="#000000" fontFamily="serif">Phone #:</text>
                <rect x="82" y="104" width="138" height="14" fill="white" stroke="#808080" strokeWidth="1"/>
                {/* Toppings checkboxes */}
                <text x="20" y="133" fontSize="8" fill="#000000" fontFamily="serif">Toppings:</text>
                <rect x="82" y="124" width="10" height="10" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="83" y="132" fontSize="8" fill="#000080">✓</text>
                <text x="95" y="133" fontSize="7" fill="#000000" fontFamily="serif">Cheese</text>
                <rect x="131" y="124" width="10" height="10" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="144" y="133" fontSize="7" fill="#000000" fontFamily="serif">Pepperoni</text>
                <rect x="82" y="138" width="10" height="10" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="95" y="147" fontSize="7" fill="#000000" fontFamily="serif">Mushrooms</text>
                <rect x="131" y="138" width="10" height="10" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="144" y="147" fontSize="7" fill="#000000" fontFamily="serif">Olives</text>
                {/* Size */}
                <text x="20" y="165" fontSize="8" fill="#000000" fontFamily="serif">Size:</text>
                <circle cx="83" cy="161" r="4" fill="white" stroke="#808080" strokeWidth="1"/>
                <circle cx="83" cy="161" r="2" fill="#000080"/>
                <text x="90" y="165" fontSize="7" fontFamily="serif" fill="#000">Medium</text>
                <circle cx="128" cy="161" r="4" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="135" y="165" fontSize="7" fontFamily="serif" fill="#000">Large</text>
                {/* Notes textarea */}
                <text x="20" y="183" fontSize="8" fill="#000000" fontFamily="serif">Notes:</text>
                <rect x="82" y="172" width="138" height="36" fill="white" stroke="#808080" strokeWidth="1"/>
                <text x="85" y="183" fontSize="6" fill="#aaa" fontFamily="serif">Special instructions...</text>
                {/* Submit button */}
                <rect x="84" y="220" width="92" height="22" fill="#d4d0c8" stroke="#ffffff" strokeWidth="1"/>
                <rect x="84" y="220" width="92" height="22" fill="none" stroke="#808080" strokeWidth="1"/>
                <line x1="84" y1="220" x2="176" y2="220" stroke="#ffffff" strokeWidth="1.5"/>
                <line x1="84" y1="220" x2="84" y2="242" stroke="#ffffff" strokeWidth="1.5"/>
                <text x="130" y="234" textAnchor="middle" fontSize="8" fontWeight="bold" fill="#000000" fontFamily="serif">SUBMIT ORDER</text>
                {/* IE footer */}
                <rect x="5" y="275" width="254" height="26" fill="#d4d0c8"/>
                <line x1="5" y1="275" x2="259" y2="275" stroke="#808080" strokeWidth="1"/>
                <text x="132" y="284" textAnchor="middle" fontSize="5.5" fill="red" fontFamily="serif" fontStyle="italic">Best viewed in Internet Explorer 5.5 at 800×600</text>
                <text x="132" y="293" textAnchor="middle" fontSize="5.5" fill="#000080" fontFamily="serif">© 2001 PizzaPlace.com — All Rights Reserved</text>
                </g>

                {/* ── VS DIVIDER ── */}
                <circle cx="341" cy="175" r="24" fill="#1d4ed8"/>
                <text x="341" y="181" textAnchor="middle" fontSize="13" fontWeight="bold" fill="white" fontFamily="sans-serif">VS</text>

                {/* ── RIGHT PANEL: Modern (scaled 1.15× larger than left) ── */}
                <g transform="translate(5,0) scale(1.15) translate(-302,0)">
                <rect x="302" y="5" width="263" height="296" rx="12" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
                {/* Header */}
                <text x="433" y="28" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#111827" fontFamily="sans-serif">Build Your Pizza</text>
                <text x="433" y="42" textAnchor="middle" fontSize="8" fill="#6b7280" fontFamily="sans-serif">Select your toppings</text>
                {/* Mini pizza icon */}
                <circle cx="549" cy="23" r="13" fill="#fde68a"/>
                <circle cx="549" cy="23" r="10" fill="#fbbf24"/>
                <circle cx="545" cy="20" r="2.5" fill="#dc2626"/>
                <circle cx="552" cy="25" r="2.5" fill="#dc2626"/>
                <circle cx="547" cy="26" r="1.5" fill="#92400e"/>

                {/* Topping cards row 1 */}
                {/* Card 1: Pepperoni — SELECTED */}
                <rect x="313" y="52" width="72" height="62" rx="8" fill="white" stroke="#1d4ed8" strokeWidth="2"/>
                <circle cx="322" cy="61" r="5" fill="#1d4ed8"/>
                <text x="322" y="64.5" textAnchor="middle" fontSize="7" fill="white" fontFamily="sans-serif">✓</text>
                <circle cx="336" cy="72" r="7" fill="#dc2626"/>
                <circle cx="336" cy="72" r="4" fill="#b91c1c" opacity="0.5"/>
                <circle cx="348" cy="78" r="6" fill="#dc2626"/>
                <circle cx="360" cy="70" r="7" fill="#dc2626"/>
                <circle cx="360" cy="70" r="4" fill="#b91c1c" opacity="0.5"/>
                <text x="349" y="107" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#111827" fontFamily="sans-serif">Pepperoni</text>

                {/* Card 2: Mushrooms */}
                <rect x="395" y="52" width="72" height="62" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
                <ellipse cx="431" cy="79" rx="14" ry="7" fill="#92400e"/>
                <ellipse cx="424" cy="79" rx="5" ry="10" fill="#a16207"/>
                <ellipse cx="431" cy="79" rx="5" ry="10" fill="#a16207"/>
                <ellipse cx="438" cy="79" rx="5" ry="10" fill="#a16207"/>
                <ellipse cx="431" cy="71" rx="14" ry="8" fill="#78350f"/>
                <text x="431" y="107" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#111827" fontFamily="sans-serif">Mushrooms</text>

                {/* Card 3: Green Peppers — SELECTED */}
                <rect x="477" y="52" width="72" height="62" rx="8" fill="white" stroke="#1d4ed8" strokeWidth="2"/>
                <circle cx="486" cy="61" r="5" fill="#1d4ed8"/>
                <text x="486" y="64.5" textAnchor="middle" fontSize="7" fill="white" fontFamily="sans-serif">✓</text>
                <ellipse cx="513" cy="75" rx="6" ry="11" fill="#16a34a" transform="rotate(-20,513,75)"/>
                <ellipse cx="526" cy="78" rx="5" ry="10" fill="#15803d" transform="rotate(15,526,78)"/>
                <ellipse cx="519" cy="68" rx="4" ry="9" fill="#22c55e" transform="rotate(-5,519,68)"/>
                <text x="513" y="107" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#111827" fontFamily="sans-serif">Peppers</text>

                {/* Topping cards row 2 */}
                {/* Card 4: Olives */}
                <rect x="313" y="124" width="72" height="62" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
                <ellipse cx="334" cy="150" rx="8" ry="5" fill="#1c1917"/>
                <circle cx="334" cy="150" r="2" fill="#a16207"/>
                <ellipse cx="352" cy="156" rx="8" ry="5" fill="#292524"/>
                <circle cx="352" cy="156" r="2" fill="#a16207"/>
                <ellipse cx="343" cy="144" rx="7" ry="4.5" fill="#1c1917"/>
                <circle cx="343" cy="144" r="2" fill="#a16207"/>
                <text x="349" y="179" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#111827" fontFamily="sans-serif">Olives</text>

                {/* Card 5: Extra Cheese — SELECTED */}
                <rect x="395" y="124" width="72" height="62" rx="8" fill="white" stroke="#1d4ed8" strokeWidth="2"/>
                <circle cx="404" cy="133" r="5" fill="#1d4ed8"/>
                <text x="404" y="136.5" textAnchor="middle" fontSize="7" fill="white" fontFamily="sans-serif">✓</text>
                <path d="M415,148 Q422,142 429,148 Q436,154 443,148 Q450,142 457,148 Q450,158 443,154 Q436,158 429,154 Q422,158 415,154 Z" fill="#fbbf24"/>
                <path d="M415,155 Q422,149 429,155 Q436,161 443,155 Q450,149 457,155 Q450,165 443,161 Q436,165 429,161 Q422,165 415,161 Z" fill="#f59e0b"/>
                <text x="431" y="179" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#111827" fontFamily="sans-serif">Extra Cheese</text>

                {/* Card 6: Onions */}
                <rect x="477" y="124" width="72" height="62" rx="8" fill="white" stroke="#e5e7eb" strokeWidth="1.5"/>
                <ellipse cx="513" cy="152" rx="14" ry="9" fill="none" stroke="#a855f7" strokeWidth="2.5"/>
                <ellipse cx="513" cy="152" rx="9" ry="6" fill="none" stroke="#c084fc" strokeWidth="2"/>
                <ellipse cx="513" cy="152" rx="5" ry="3" fill="none" stroke="#e9d5ff" strokeWidth="1.5"/>
                <text x="513" y="179" textAnchor="middle" fontSize="7.5" fontWeight="600" fill="#111827" fontFamily="sans-serif">Onions</text>

                {/* Add to cart button */}
                <rect x="313" y="200" width="236" height="36" rx="8" fill="#1d4ed8"/>
                <text x="431" y="222" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white" fontFamily="sans-serif">Add to Cart — $14.99</text>

                {/* Selected summary pills */}
                <text x="313" y="252" fontSize="7" fill="#6b7280" fontFamily="sans-serif">Selected:</text>
                <rect x="357" y="242" width="56" height="14" rx="7" fill="#dbeafe"/>
                <text x="385" y="252" textAnchor="middle" fontSize="6.5" fill="#1d4ed8" fontFamily="sans-serif">Pepperoni</text>
                <rect x="419" y="242" width="44" height="14" rx="7" fill="#dbeafe"/>
                <text x="441" y="252" textAnchor="middle" fontSize="6.5" fill="#1d4ed8" fontFamily="sans-serif">Peppers</text>
                <rect x="469" y="242" width="70" height="14" rx="7" fill="#dbeafe"/>
                <text x="504" y="252" textAnchor="middle" fontSize="6.5" fill="#1d4ed8" fontFamily="sans-serif">Extra Cheese</text>

                {/* Delivery estimate */}
                <text x="431" y="278" textAnchor="middle" fontSize="7" fill="#6b7280" fontFamily="sans-serif">🛵  Estimated delivery: 25–35 min</text>
                <text x="431" y="292" textAnchor="middle" fontSize="6.5" fill="#9ca3af" fontFamily="sans-serif">Free delivery on orders over $12</text>
                </g>
              </svg>
            </div>

          </div>
        </section>

        {/* What We Do */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-500 uppercase mb-4">
              Our Services
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-12">What we do</h2>
            <div className="space-y-8">
              {[
                { number: '01', text: 'We make any online interaction with your business smooth and completely self service.' },
                { number: '02', text: 'Digitally market to drive customers to your website.' },
                { number: '03', text: 'Measure if our websites and marketing are hitting the mark.' },
              ].map(({ number, text }) => (
                <div key={number} className="flex items-start gap-6 border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                  <span className="text-4xl font-bold text-brand-200 leading-none shrink-0 select-none">{number}</span>
                  <p className="text-xl text-gray-700 leading-relaxed pt-1">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pizza Vision Section */}
        <section className="py-20 px-6 bg-[#1e3a5f]">
          <div className="max-w-6xl mx-auto">

            <span className="inline-block text-xs font-semibold tracking-widest text-blue-300 uppercase mb-4">
              The Experience
            </span>
            <h2 className="text-4xl font-bold text-white mb-10">
              Vision for an Exceptional Pizza Experience
            </h2>

            {/* Top 3 steps */}
            <div className="flex flex-col sm:flex-row items-stretch">
              {([
                { icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>, label: 'Client enters your online store' },
                { icon: <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>, label: 'One click away option to start their order' },
                { icon: <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>, label: 'Personalized follow-up questions before checkout' },
              ] as { icon: React.ReactNode; label: string }[]).map((card, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <>
                      <div className="hidden sm:flex items-center justify-center shrink-0 px-1" aria-hidden="true">
                        <svg className="w-5 h-5 text-blue-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </div>
                      <div className="flex sm:hidden justify-center py-2" aria-hidden="true">
                        <svg className="w-5 h-5 text-blue-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/>
                        </svg>
                      </div>
                    </>
                  )}
                  <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-400/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {i + 1}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {card.icon}
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug">{card.label}</p>
                  </div>
                </Fragment>
              ))}
            </div>

            {/* Connector ↓ to vision text */}
            <div className="flex justify-center my-4" aria-hidden="true">
              <svg className="w-6 h-6 text-blue-300/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/>
              </svg>
            </div>

            {/* Central vision text */}
            <div className="bg-white/10 border border-white/20 rounded-2xl px-8 py-10">
              <p className="text-white/90 italic text-lg leading-relaxed">
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
              <p className="mt-6 italic text-white/50 text-lg" style={{ fontFamily: 'Georgia, serif' }}>
                Bon Appétit.
              </p>
            </div>

            {/* Connector ↓ to bottom steps */}
            <div className="flex justify-center my-4" aria-hidden="true">
              <svg className="w-6 h-6 text-blue-300/40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/>
              </svg>
            </div>

            {/* Bottom 3 steps */}
            <div className="flex flex-col sm:flex-row items-stretch">
              {([
                { icon: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>, label: 'Modern payment alternatives to credit card processing' },
                { icon: <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>, label: 'Follow-up messages for customer satisfaction' },
                { icon: <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>, label: 'Retention reminders that bring customers back' },
              ] as { icon: React.ReactNode; label: string }[]).map((card, i) => (
                <Fragment key={i}>
                  {i > 0 && (
                    <>
                      <div className="hidden sm:flex items-center justify-center shrink-0 px-1" aria-hidden="true">
                        <svg className="w-5 h-5 text-blue-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                        </svg>
                      </div>
                      <div className="flex sm:hidden justify-center py-2" aria-hidden="true">
                        <svg className="w-5 h-5 text-blue-300/50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19"/><polyline points="5 12 12 19 19 12"/>
                        </svg>
                      </div>
                    </>
                  )}
                  <div className="flex-1 bg-white/10 border border-white/20 rounded-2xl p-6 flex flex-col items-center text-center gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-400/40 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {i + 4}
                    </span>
                    <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                      <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {card.icon}
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-white leading-snug">{card.label}</p>
                  </div>
                </Fragment>
              ))}
            </div>

          </div>
        </section>

        {/* Standard Packages */}
        <section className="py-20 px-6 bg-white">
          <div className="max-w-6xl mx-auto">

            <h2 className="text-4xl font-bold text-gray-900 mb-4">Standard Packages</h2>
            <p className="text-gray-500 text-lg leading-relaxed max-w-3xl mb-14">
              Our three core packages are Web Experience development, Marketing, and Analytics. These can be
              powerful compliments to drive new customers to your new experience and then testing to make
              adjustments to meet the changing needs of your customers.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              {/* Card 1 — Web Experience Build */}
              <div className="rounded-2xl bg-[#1e3a5f] text-white flex flex-col overflow-hidden">
                <div className="px-7 pt-8 pb-6 border-b border-white/15">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Web Experience</p>
                  <p className="text-4xl font-bold">$3,000</p>
                  <p className="text-blue-200 text-sm mt-1">One-time project fee</p>
                </div>
                <div className="px-7 py-6 flex-1 space-y-3">
                  {[
                    'Ordering or onboarding process development',
                    'Homepage / About / Blog page build & redesign',
                    'LiveChat or customer service technology integration',
                    '3 rewrites of all developed sections and pages',
                    'Quality assurance testing',
                    'Deployment',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-blue-200" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-sm text-blue-100 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Optional ongoing sub-section */}
                <div className="mx-7 mb-6 rounded-xl border border-white/20 bg-white/5 px-5 py-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Optional Ongoing</p>
                    <p className="text-lg font-bold text-white">$1,000<span className="text-xs font-normal text-blue-200"> one-time</span></p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'Full rewrite of the onboarding experience',
                      '3 new landing pages developed',
                      'Maintenance & updates',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-blue-200" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-sm text-blue-100 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-7 pb-8">
                  <GetStartedModal triggerClassName="w-full bg-white text-[#1e3a5f] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                </div>
              </div>

              {/* Card 2 — Marketing Package */}
              <div className="rounded-2xl bg-[#1d4ed8] text-white flex flex-col overflow-hidden shadow-xl scale-[1.02]">
                <div className="px-7 pt-8 pb-6 border-b border-white/15">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-3">Marketing</p>
                  <div className="space-y-1.5">
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold">$800</span>
                      <span className="text-blue-200 text-sm">for initial account setup</span>
                    </div>
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
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-blue-200" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-sm text-blue-100 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
                {/* Optional add-on sub-section */}
                <div className="mx-7 mb-6 rounded-xl border border-white/20 bg-white/5 px-5 py-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Optional Add-on</p>
                    <p className="text-lg font-bold text-white">$700</p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'Connect your online forms to your CRM for instant email/SMS follow up',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-blue-200" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-sm text-blue-100 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-7 pb-8">
                  <GetStartedModal triggerClassName="w-full bg-white text-[#1d4ed8] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                </div>
              </div>

              {/* Card 3 — Analytics Package */}
              <div className="rounded-2xl bg-[#1e3a5f] text-white flex flex-col overflow-hidden">
                <div className="px-7 pt-8 pb-6 border-b border-white/15">
                  <p className="text-xs font-semibold uppercase tracking-widest text-blue-200 mb-2">Analytics</p>
                  <p className="text-4xl font-bold">$1,200</p>
                </div>
                <div className="px-7 py-6 flex-1 space-y-3">
                  {[
                    'Full website tracking setup to measure views, users, clicks and more',
                    'Realtime and historical report of the full online journey of your customers',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-blue-200" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </span>
                      <span className="text-sm text-blue-100 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>

                {/* Optional ongoing maintenance sub-section */}
                <div className="mx-7 mb-6 rounded-xl border border-white/20 bg-white/5 px-5 py-4">
                  <div className="flex items-baseline justify-between mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-blue-200">Optional Ongoing</p>
                    <p className="text-lg font-bold text-white">$700<span className="text-xs font-normal text-blue-200">/mo</span></p>
                  </div>
                  <div className="space-y-2">
                    {[
                      'New website pages/experiences tracked',
                      '3 new customer journeys tracked (if applicable)',
                      '3 new website changes tracked to measure effectiveness',
                    ].map(item => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-0.5 w-4 h-4 rounded-full bg-blue-400/30 flex items-center justify-center shrink-0">
                          <svg className="w-2.5 h-2.5 text-blue-200" viewBox="0 0 12 12" fill="none">
                            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </span>
                        <span className="text-sm text-blue-100 leading-snug">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="px-7 pb-8">
                  <GetStartedModal triggerClassName="w-full bg-white text-[#1e3a5f] font-semibold py-3 rounded-xl text-sm hover:bg-blue-50 transition-colors" />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Meet the Creator */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">

            <div className="flex flex-col lg:flex-row gap-16 items-start">

              {/* Left: bio + metrics + skills + platforms */}
              <div className="flex-1 min-w-0 space-y-10">

                <div>
                  <span className="inline-block text-xs font-semibold tracking-widest text-brand-500 uppercase mb-4">The Team</span>
                  <h2 className="text-4xl font-bold text-gray-900 mb-6">Meet the Creator</h2>
                  <p className="text-gray-600 text-lg leading-relaxed">
                    I am a product manager with experience working through every phase of digital customer
                    onboarding — digital marketing, web development, CRM, and customer data. My perspective has been shaped by:
                  </p>
                  <ul className="mt-4 space-y-2 text-gray-600">
                    {[
                      { role: 'Digital Marketing Manager', detail: 'Testing new creative, campaigns, and mediums' },
                      { role: 'Technical Project Manager', detail: 'Building wireframes and managing development projects' },
                      { role: 'Digital Analyst', detail: 'Migrating and building tracking code' },
                      { role: 'CDP Product Manager', detail: 'Creating features that personalize and analyze the full patient journey' },
                    ].map(({ role, detail }) => (
                      <li key={role} className="flex gap-2">
                        <span className="shrink-0 text-gray-400">—</span>
                        <span><span className="italic">{detail}</span> as a {role.toLowerCase()}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Impact metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    'Decreased time to first contact by 4+ hours',
                    'Generated $16M+ in LTV',
                    'Improved conversion rates by 2x using AI',
                  ].map(stat => (
                    <div key={stat} className="rounded-xl border border-gray-200 bg-white px-6 py-5">
                      <div className="flex items-center gap-1.5 mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
                        </svg>
                        <span className="text-xs font-semibold text-green-500 uppercase tracking-wide">Impact</span>
                      </div>
                      <p className="text-green-600 font-bold text-lg leading-snug">{stat}</p>
                    </div>
                  ))}
                </div>

                {/* How We Work */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">How We Work</h3>
                  <p className="text-gray-600 leading-relaxed">
                    You will work with me directly to scope out the vision for your web experience and I will
                    handle a bulk of the website development. If there are situations where my skills do not
                    meet your needs I source resources I know and have worked with personally to accomplish
                    your vision at the exact agreed upon price.
                  </p>
                </div>

                {/* Top Skills */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Top Skills</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Communication', 'Listening', 'Consistency', 'Product Ideation', 'Product Development', 'Marketing Technology', 'Analytics'].map(skill => (
                      <span key={skill} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm">{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Platforms */}
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Top Platforms</h3>
                  <div className="flex flex-wrap gap-3">
                    {['Claude AI', 'Snowflake', 'Salesforce', 'Rudderstack', 'Google Ads', 'Google Analytics', 'CallRail', 'Monday.com', 'Jira', 'Power BI', 'Data Studio', 'Facebook Ads'].map(p => (
                      <span key={p} className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm">{p}</span>
                    ))}
                  </div>
                </div>

                {/* Resume download */}
                <a
                  href="/Daniel Fedak Resume 06-11-2026.pdf"
                  download="Daniel Fedak Resume.pdf"
                  className="inline-flex items-center gap-2 bg-brand-600 text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-brand-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Resume
                </a>
              </div>

              {/* Right: sticky headshot */}
              <div className="w-full lg:w-80 shrink-0 lg:sticky lg:top-28">
                <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden bg-gray-200 shadow-xl">
                  <Image
                    src="/DanielFedakHeadshot.jpeg"
                    alt="Daniel Fedak"
                    fill
                    className="object-cover"
                    style={{ objectPosition: 'calc(50% - 25px) center' }}
                    sizes="(max-width: 1024px) 100vw, 320px"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 inset-x-0 p-5">
                    <p className="text-white font-semibold text-base leading-tight">Daniel Fedak</p>
                    <p className="text-white/70 text-sm mt-0.5">Founder &amp; Creator</p>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* Our Philosophy */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block text-xs font-semibold tracking-widest text-brand-500 uppercase mb-4">
              What I Believe
            </span>
            <h2 className="text-4xl font-bold text-gray-900 mb-12">My Philosophy</h2>
            <div className="flex flex-col lg:flex-row gap-12 items-start">
              {/* Bullets */}
              <div className="flex-1 space-y-8">
                {[
                  {
                    number: '01',
                    text: 'Enabling the customer to do more so you can service them better.',
                  },
                  {
                    number: '02',
                    text: 'Communicating little things to keep customers in the loop.',
                  },
                  {
                    number: '03',
                    text: 'Following up to let the customer know you won\'t stop thinking about them after a purchase — they are more than a transaction.',
                  },
                ].map(({ number, text }) => (
                  <div key={number} className="flex items-start gap-6 border-b border-gray-200 pb-8 last:border-0 last:pb-0">
                    <span className="text-4xl font-bold text-brand-200 leading-none shrink-0 select-none">{number}</span>
                    <p className="text-xl text-gray-700 leading-relaxed pt-1">{text}</p>
                  </div>
                ))}
              </div>
              {/* Video */}
              <div className="w-full lg:w-72 shrink-0 aspect-[9/16] rounded-2xl overflow-hidden bg-black shadow-xl lg:-mt-24">
                <video
                  src="https://zcpgcyocniscrbgssmxc.supabase.co/storage/v1/object/public/Servus-Videos/Video2.MOV"
                  className="w-full h-full object-cover"
                  controls
                  playsInline
                  preload="metadata"
                />
              </div>
            </div>
          </div>
        </section>

{/* CMS Posts */}
        {posts.length > 0 && (
          <section id="posts" className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Posts</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
          </section>
        )}

        {/* Bottom CTA */}
        <section className="py-24 px-6 bg-[#1e3a5f] text-white">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="space-y-4 text-center lg:text-left">
              <h2 className="text-4xl font-bold leading-tight">
                Become the path of least resistance<br className="hidden lg:block" /> for your customers.
              </h2>
              <p className="text-blue-200 text-lg leading-relaxed max-w-xl">
                Your customers shouldn&apos;t have to work to give you their business. Let&apos;s build an
                experience that makes choosing you the easiest decision they make.
              </p>
            </div>
            <div className="shrink-0">
              <GetStartedModal triggerClassName="bg-white text-[#1e3a5f] px-8 py-4 rounded-xl font-bold text-base hover:bg-blue-50 transition-colors" />
            </div>
          </div>
        </section>

      </main>

      <footer className="border-t border-gray-200 py-8 px-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Servus. All rights reserved.
      </footer>
    </div>
  );
}

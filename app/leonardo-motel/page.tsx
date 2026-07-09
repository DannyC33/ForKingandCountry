import Image from 'next/image';
import BookingModal from '@/components/leonardo/BookingModal';
import CancelModal from '@/components/leonardo/CancelModal';

export const metadata = {
  title: 'Leonardo Motel — Highlands, NJ | Near Sandy Hook Beach',
  description:
    'Family owned and operated for 65+ years. Clean, affordable rooms steps from Sandy Hook beaches. 840 State Route 36, Highlands NJ. Call 732.291.9527.',
};

// Colour palette pulled from the actual motel logo
const GREEN   = '#2d5a1e';
const MAROON  = '#7a1a1a';
const GOLD    = '#c8960c';
const CREAM   = '#fafaf8';
const DKGREEN = '#1e3d13';

const AMENITIES = [
  'Free Parking',
  'Free Wi-Fi',
  'Air Conditioning',
  'Cable TV',
  'Refrigerator in Every Room',
  'Daily Housekeeping',
  'Guest Laundry',
  'Smoke-Free Property',
  'Pet-Friendly Rooms Available',
  'Near Sandy Hook Beaches',
  'Close to Restaurants & Shopping',
  'Family Owned & Operated',
];

const GALLERY = [
  { src: '/leonardo/hero.jpg',    alt: 'Standard room with two double beds and patterned quilts' },
  { src: '/leonardo/photo-1.jpg', alt: 'Standard double room with nightstand and lamp' },
  { src: '/leonardo/photo-2.jpg', alt: 'Efficiency kitchenette with white cabinets and full refrigerator' },
  { src: '/leonardo/photo-3.jpg', alt: 'Kitchenette with granite countertops and microwave' },
  { src: '/leonardo/photo-7.jpg', alt: 'Kitchenette with sink and microwave' },
  { src: '/leonardo/photo-4.jpg', alt: 'Updated private bathroom with marble-look tiled shower' },
  { src: '/leonardo/photo-5.jpg', alt: 'Updated private bathroom with tiled walls and fresh towels' },
];

export default function LeonardoMotelPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: "'Georgia', serif", background: CREAM }}>

      {/* ── NAV ─────────────────────────────────────────────────────────── */}
      <header style={{ background: GREEN }} className="sticky top-0 z-40 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/leonardo/logo.png"
              alt="Leonardo Motel logo"
              width={56}
              height={56}
              className="rounded"
              priority
            />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-lg leading-tight tracking-wide">Leonardo Motel</p>
              <p className="text-white/60 text-xs tracking-widest uppercase">Highlands, NJ</p>
            </div>
          </div>

          <nav aria-label="Main navigation" className="flex items-center gap-2 sm:gap-5">
            <a href="#about"     className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden sm:inline">About</a>
            <a href="#rooms"     className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden sm:inline">Rooms</a>
            <a href="#amenities" className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden sm:inline">Amenities</a>
            <a href="tel:7322919527" className="text-white/80 hover:text-white text-sm font-medium transition-colors hidden md:inline">732.291.9527</a>
            <BookingModal
              triggerLabel="Book Now"
              triggerClassName="bg-[#c8960c] hover:bg-[#b07c08] text-white px-4 py-2 text-sm font-semibold rounded transition-colors shadow"
            />
          </nav>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative h-[60vh] min-h-[400px] flex items-end">
        <Image
          src="/leonardo/photo-6.jpg"
          alt="Aerial view of Sandy Hook Bay and the Jersey Shore near Leonardo Motel"
          fill
          className="object-cover object-center"
          priority
        />
        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-6xl mx-auto px-6 pb-12 w-full">
          <p className="text-[#c8960c] text-xs uppercase tracking-[0.3em] font-semibold mb-2">840 State Route 36 · Highlands, NJ</p>
          <h1 className="text-white text-4xl sm:text-6xl font-bold leading-tight mb-4" style={{ fontFamily: "'Georgia', serif" }}>
            Leonardo Motel
          </h1>
          <p className="text-white/80 text-lg sm:text-xl max-w-xl mb-8">
            Family owned &amp; operated for 65+ years — six miles from Sandy Hook beaches.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 flex-wrap">
            <BookingModal
              triggerLabel="Book a Room"
              triggerClassName="bg-[#c8960c] hover:bg-[#b07c08] text-white px-8 py-3.5 text-base font-semibold rounded shadow-xl transition-colors"
            />
            <a
              href="tel:7322919527"
              className="border-2 border-white/70 hover:border-white text-white px-8 py-3.5 text-base font-semibold rounded transition-colors text-center"
            >
              Call 732.291.9527
            </a>
            <CancelModal
              triggerClassName="text-white/60 hover:text-white/90 text-sm underline underline-offset-4 transition-colors self-center"
            />
          </div>
        </div>
      </section>

      {/* ── ABOUT ───────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 px-4" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>About Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold mb-5 leading-tight" style={{ color: GREEN }}>
              A Shore Tradition<br />Since 1959
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Leonardo Motel has been welcoming guests to the beautiful Jersey Shore for over 65 years. Family owned and operated, we pride ourselves on clean, comfortable rooms at affordable rates — with the warm, personal service you can only get from a family-run motel.
            </p>
            <p className="text-gray-700 leading-relaxed mb-6">
              Located at 840 State Route 36 in Highlands, NJ, we're just six miles from the stunning Sandy Hook beaches and Gateway National Recreation Area. Whether you're here for a weekend getaway or an extended stay, Leonardo Motel is your home away from home on the Jersey Shore.
            </p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span style={{ color: GOLD }}>📍</span>
                <span className="text-gray-700">840 State Route 36, Highlands, NJ</span>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: GOLD }}>📞</span>
                <a href="tel:7322919527" className="font-semibold hover:underline" style={{ color: GREEN }}>732.291.9527</a>
              </div>
              <div className="flex items-center gap-2">
                <span style={{ color: GOLD }}>✉️</span>
                <a href="mailto:LeonardoMotel@yahoo.com" className="font-semibold hover:underline" style={{ color: GREEN }}>LeonardoMotel@yahoo.com</a>
              </div>
            </div>
          </div>

          {/* Logo / sign card */}
          <div className="flex justify-center">
            <div className="rounded-2xl overflow-hidden shadow-2xl border-4 p-8 bg-white" style={{ borderColor: GOLD }}>
              <Image
                src="/leonardo/logo.png"
                alt="The Leonardo Motel vintage sign"
                width={320}
                height={320}
                className="object-contain mx-auto"
              />
              <div className="text-center mt-6 space-y-1">
                <p className="font-bold text-lg" style={{ color: GREEN }}>Family Owned &amp; Operated</p>
                <p className="text-gray-500 text-sm">65+ Years of Jersey Shore Hospitality</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROOMS ───────────────────────────────────────────────────────── */}
      <section id="rooms" className="py-20 px-4" style={{ background: '#f0ede8' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>Accommodations</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: GREEN }}>Our Rooms</h2>
            <p className="text-gray-600 mt-3 max-w-xl mx-auto">All rooms include private bath, air conditioning, cable TV, and free Wi-Fi.</p>
          </div>

          {/* Room type cards */}
          <div className="grid sm:grid-cols-3 gap-6 mb-12">
            {[
              {
                title: 'Standard Single',
                price: '$89',
                desc: 'Comfortable room with one double bed. Perfect for solo travelers or couples looking for a clean, affordable stay near the beach.',
                img: '/leonardo/hero.jpg',
                imgAlt: 'Standard room with double bed',
                badge: '8 rooms · Max 2 guests',
              },
              {
                title: 'Standard Double',
                price: '$109',
                desc: 'Spacious room with two double beds. Great for families or groups traveling together to the Jersey Shore.',
                img: '/leonardo/photo-1.jpg',
                imgAlt: 'Standard double room with two beds',
                badge: '8 rooms · Max 4 guests',
              },
              {
                title: 'Efficiency / Kitchenette',
                price: '$129',
                desc: 'Everything you need for an extended stay. Full kitchenette with microwave, refrigerator, and sink — cook your own meals and save.',
                img: '/leonardo/photo-3.jpg',
                imgAlt: 'Efficiency room kitchenette',
                badge: '6 rooms · Max 4 guests',
              },
            ].map(room => (
              <div key={room.title} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <div className="relative h-48">
                  <Image src={room.img} alt={room.imgAlt} fill className="object-cover" />
                </div>
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg" style={{ color: GREEN }}>{room.title}</h3>
                    <span className="text-xl font-bold" style={{ color: MAROON }}>{room.price}<span className="text-xs font-normal text-gray-400">/night</span></span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: GOLD }}>{room.badge}</p>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{room.desc}</p>
                  <BookingModal
                    triggerLabel={`Book — ${room.price}/night`}
                    triggerClassName="w-full py-2.5 rounded-xl text-sm font-semibold transition-colors text-center border-2"
                    // inline style applied via className won't work for dynamic values, so use a wrapper
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Deluxe row */}
          <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
            <div className="grid md:grid-cols-2">
              <div className="relative h-64 md:h-auto min-h-[200px]">
                <Image src="/leonardo/photo-2.jpg" alt="Deluxe efficiency room with full kitchen" fill className="object-cover" />
              </div>
              <div className="p-8 flex flex-col justify-center">
                <p className="text-xs uppercase tracking-[0.25em] font-semibold mb-2" style={{ color: GOLD }}>Most Spacious</p>
                <h3 className="text-2xl font-bold mb-1" style={{ color: GREEN }}>Deluxe Room</h3>
                <p className="text-xl font-bold mb-1" style={{ color: MAROON }}>$149<span className="text-sm font-normal text-gray-400">/night</span></p>
                <p className="text-xs mb-4" style={{ color: GOLD }}>3 rooms · Max 4 guests</p>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Our most spacious accommodations with premium furnishings, extra living area, and a full kitchen. Ideal for families or guests planning an extended Jersey Shore stay.
                </p>
                <BookingModal
                  triggerLabel="Book the Deluxe Room"
                  triggerClassName="inline-block bg-[#2d5a1e] hover:bg-[#1e3d13] text-white px-8 py-3 rounded-xl font-semibold text-sm transition-colors text-center shadow"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── PHOTO GALLERY ───────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: CREAM }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>Gallery</p>
            <h2 className="text-3xl sm:text-4xl font-bold" style={{ color: GREEN }}>See For Yourself</h2>
          </div>

          <div className="columns-2 md:columns-3 gap-3 space-y-3">
            {GALLERY.map((img, i) => (
              <div key={i} className="break-inside-avoid rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                <Image
                  src={img.src}
                  alt={img.alt}
                  width={600}
                  height={450}
                  className="w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── AMENITIES ───────────────────────────────────────────────────── */}
      <section id="amenities" className="py-20 px-4" style={{ background: GREEN }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>What&apos;s Included</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Amenities</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {AMENITIES.map(item => (
              <div key={item} className="flex items-center gap-3 text-white/90">
                <span style={{ color: GOLD }} className="text-lg shrink-0">✓</span>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BATHROOMS CALLOUT ───────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: '#f0ede8' }}>
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>Recently Updated</p>
            <h2 className="text-3xl font-bold" style={{ color: GREEN }}>Modern Private Bathrooms</h2>
            <p className="text-gray-600 mt-3 max-w-lg mx-auto">All bathrooms feature updated marble-look tile, fresh linens, and private entry.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <Image src="/leonardo/photo-5.jpg" alt="Updated private bathroom with marble tile and fresh towels" width={800} height={600} className="w-full object-cover h-72" />
            </div>
            <div className="rounded-2xl overflow-hidden shadow-lg">
              <Image src="/leonardo/photo-4.jpg" alt="Private tiled shower with marble-look tile" width={800} height={600} className="w-full object-cover h-72" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCATION ────────────────────────────────────────────────────── */}
      <section className="py-20 px-4" style={{ background: CREAM }}>
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>Location</p>
            <h2 className="text-3xl font-bold mb-5" style={{ color: GREEN }}>Six Miles From Sandy Hook</h2>
            <p className="text-gray-700 leading-relaxed mb-6">
              Situated at 840 State Route 36 in Highlands, NJ — you&apos;re just a short drive from the Sandy Hook unit of Gateway National Recreation Area, with miles of pristine Atlantic Ocean beaches. Restaurants, marinas, and the Atlantic Highlands ferry are all nearby.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <span style={{ color: GOLD }} className="mt-0.5 shrink-0">📍</span>
                <span className="text-gray-700">840 State Route 36, Highlands, NJ 07732</span>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: GOLD }} className="mt-0.5 shrink-0">📞</span>
                <a href="tel:7322919527" className="font-semibold hover:underline" style={{ color: GREEN }}>732.291.9527</a>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: GOLD }} className="mt-0.5 shrink-0">✉️</span>
                <a href="mailto:LeonardoMotel@yahoo.com" className="font-semibold hover:underline" style={{ color: GREEN }}>LeonardoMotel@yahoo.com</a>
              </div>
              <div className="flex items-start gap-3">
                <span style={{ color: GOLD }} className="mt-0.5 shrink-0">🕐</span>
                <span className="text-gray-700">Check-in 2:00 PM · Check-out 11:00 AM</span>
              </div>
            </div>
          </div>

          {/* Aerial photo as location visual */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl h-72 md:h-96">
            <Image
              src="/leonardo/photo-6.jpg"
              alt="Aerial view of Sandy Hook Bay and the New Jersey Shore coastline"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 flex items-end p-5" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)' }}>
              <div>
                <p className="text-white font-bold">Sandy Hook Bay &amp; Gateway National Recreation Area</p>
                <a
                  href="https://maps.google.com/?q=840+State+Route+36+Highlands+NJ+07732"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm underline underline-offset-2 mt-1 inline-block"
                  style={{ color: GOLD }}
                >
                  Get directions →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── BOOK CTA ────────────────────────────────────────────────────── */}
      <section className="py-24 px-4 text-center" style={{ background: MAROON }}>
        <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-3" style={{ color: GOLD }}>Ready for the Shore?</p>
        <h2 className="text-white text-3xl sm:text-4xl font-bold mb-4">Book Your Stay Today</h2>
        <p className="text-white/60 max-w-md mx-auto mb-10 leading-relaxed">
          Affordable rates, clean rooms, and 65+ years of Jersey Shore hospitality. Call us or book online.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center flex-wrap">
          <BookingModal
            triggerLabel="Book Online"
            triggerClassName="bg-[#c8960c] hover:bg-[#b07c08] text-white px-10 py-4 text-base font-semibold rounded-xl transition-colors shadow-xl"
          />
          <a
            href="tel:7322919527"
            className="border-2 border-white/50 hover:border-white text-white px-10 py-4 text-base font-semibold rounded-xl transition-colors"
          >
            Call 732.291.9527
          </a>
        </div>
        <div className="mt-6">
          <CancelModal triggerClassName="text-white/40 hover:text-white/70 text-sm underline underline-offset-4 transition-colors" />
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer style={{ background: DKGREEN }} className="py-8 px-4 text-center">
        <Image src="/leonardo/logo.png" alt="Leonardo Motel" width={48} height={48} className="mx-auto mb-3 opacity-80" />
        <p className="text-white/40 text-xs">
          © {new Date().getFullYear()} Leonardo Motel · 840 State Route 36, Highlands, NJ 07732
        </p>
        <p className="text-white/20 text-xs mt-1">
          732.291.9527 · LeonardoMotel@yahoo.com
        </p>
      </footer>

    </div>
  );
}

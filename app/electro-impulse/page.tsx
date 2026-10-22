'use client';
import { useState } from 'react';

const PRODUCTS = [
  {
    id: 'cuw',
    series: 'CUW Series',
    model: 'CUW-200',
    category: 'non-refrigerated',
    name: 'Non-Refrigerated Liquid-to-Water Heat Exchangers',
    tagline: 'Water-cooled, non-refrigerated heat rejection for high-power electronics.',
    description:
      `The CUW Series dissipates heat from the customer's primary liquid coolant to tap or facility water. Extremely high heat transfer efficiency provides lower coolant temperatures while consuming far less facility water than competitive units.`,
    specs: [
      { label: 'Coolants', value: 'Water, glycol/water, PAO, fluorocarbons' },
      { label: 'Heat Rejection', value: 'Up to 200 kW standard; custom higher' },
      { label: 'Primary Flow', value: 'Variable — engineered to load' },
      { label: 'Configuration', value: 'Plate-frame heat exchanger, SS or titanium plates' },
    ],
    applications: ['Radar electronics', 'Power supplies', 'Laser systems'],
    badge: 'Best Seller',
    priceRange: { low: 11500, high: 64000 },
  },
  {
    id: 'cu',
    series: 'CU Series',
    model: 'CU-50',
    category: 'non-refrigerated',
    name: 'Non-Refrigerated Liquid-to-Air Heat Exchangers',
    tagline: 'Fan-cooled, self-contained recirculating coolers for ambient environments.',
    description:
      'The CU Series transfers heat from liquid coolant to ambient air via a high-efficiency forced-air heat exchanger and integral recirculating pump. Compact, self-contained units ideal where facility water is unavailable.',
    specs: [
      { label: 'Coolants', value: 'Water, glycol/water, PAO' },
      { label: 'Heat Rejection', value: '1 kW – 50 kW' },
      { label: 'Fan Type', value: 'Variable-speed EC motor' },
      { label: 'Configuration', value: 'Integral pump, reservoir, and heat exchanger' },
    ],
    applications: ['Portable electronics cooling', 'Mobile platforms', 'Lab equipment'],
    badge: null,
    priceRange: { low: 7200, high: 39500 },
  },
  {
    id: 'rc',
    series: 'RC Series',
    model: 'RC-15',
    category: 'non-refrigerated',
    name: 'Non-Refrigerated Air Circulating Systems',
    tagline: 'Precision-controlled recirculating air systems with flow and temperature monitoring.',
    description:
      'The RC Series provides air at a controlled, regulated flow rate with continuous monitoring of pressure and temperature. Designed for electronics enclosures requiring clean, conditioned airflow without refrigeration.',
    specs: [
      { label: 'Output', value: 'Regulated airflow (SCFM configurable)' },
      { label: 'Monitoring', value: 'Pressure, temperature, flow rate' },
      { label: 'Filtration', value: 'HEPA optional' },
      { label: 'Configuration', value: 'Cabinet-mount or standalone' },
    ],
    applications: ['Avionics enclosures', 'Ground support equipment', 'Electronic shelters'],
    badge: null,
    priceRange: { low: 4800, high: 27000 },
  },
  {
    id: 'ru',
    series: 'RU Series',
    model: 'RU-100',
    category: 'refrigerated',
    name: 'Refrigerated Liquid Cooling Systems',
    tagline: 'Self-contained, CFC-free refrigerated liquid coolers for precision temperature control.',
    description:
      'The RU Series features a sealed, hermetic refrigeration system with a high-efficiency liquid-to-refrigerant heat exchanger. Temperature control to ±0.5°C. Options include deionizers, flow meters, flow control valves, and digital computer interfacing.',
    specs: [
      { label: 'Cooling Capacity', value: '0.5 kW – 100 kW' },
      { label: 'Temp Setpoint', value: '-10°C to +35°C (±0.5°C)' },
      { label: 'Refrigerant', value: 'CFC-free (R-410A, R-407C)' },
      { label: 'Condenser', value: 'Air-cooled; water-cooled (RUW) optional' },
    ],
    applications: ['High-power radar', 'Airborne electronics', 'Medical imaging', 'Lasers'],
    badge: 'Most Popular',
    priceRange: { low: 17500, high: 93000 },
  },
  {
    id: 'ruw',
    series: 'RUW Series',
    model: 'RUW-150',
    category: 'refrigerated',
    name: 'Refrigerated Water-Cooled Liquid Cooling Systems',
    tagline: 'Refrigerated liquid cooling using facility water as the ultimate heat sink.',
    description:
      'The RUW Series is a water-cooled variant of the RU Series. The refrigeration condenser rejects heat to facility or tap water rather than to air, enabling higher ambient temperature operation and quieter, more compact enclosures.',
    specs: [
      { label: 'Cooling Capacity', value: '1 kW – 150 kW' },
      { label: 'Temp Setpoint', value: '-10°C to +35°C (±0.5°C)' },
      { label: 'Condenser Coolant', value: 'Tap, DI, or facility chilled water' },
      { label: 'Footprint', value: 'Compact — no condenser fan required' },
    ],
    applications: ['Ship-board electronics', 'High-density racks', 'Sealed enclosures'],
    badge: null,
    priceRange: { low: 21000, high: 118000 },
  },
  {
    id: 'split',
    series: 'Split System (RU / RUW)',
    model: 'RU/RUW-200S',
    category: 'refrigerated',
    name: 'Split System Refrigerated Liquid Cooling Systems',
    tagline: 'Separated refrigeration and pumping sections for flexible installation.',
    description:
      'The Split System separates the refrigeration condenser/compressor section from the pumping and monitoring unit, allowing the heat-rejecting section to be located in a utility room or outdoors while the pump cabinet is installed adjacent to the heat load.',
    specs: [
      { label: 'Cooling Capacity', value: '5 kW – 200 kW+' },
      { label: 'Section Separation', value: 'Up to 30 m between sections' },
      { label: 'Condenser', value: 'Air-cooled outdoor or water-cooled indoor' },
      { label: 'Control', value: 'Digital PLC with remote monitoring option' },
    ],
    applications: ['Ground radar shelters', 'Ship combat systems', 'Transmitter buildings'],
    badge: 'Custom Engineered',
    priceRange: { low: 46500, high: 182000 },
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  all: 'All Products',
  refrigerated: 'Refrigerated',
  'non-refrigerated': 'Non-Refrigerated',
};

const BADGE_STYLE: Record<string, string> = {
  'Best Seller':        'bg-[#C8291C] text-white',
  'Most Popular':       'bg-[#1B3A6B] text-white',
  'Custom Engineered':  'bg-[#4A5568] text-white',
};

export default function ElectroImpulsePage() {
  const [filter, setFilter]         = useState<'all' | 'refrigerated' | 'non-refrigerated'>('all');
  const [openSpec, setOpenSpec]     = useState<string | null>(null);
  const [showQuote, setShowQuote]   = useState<string | null>(null);
  const [quoteSent, setQuoteSent]   = useState(false);
  const [showEstimate, setShowEstimate] = useState<string | null>(null);

  // Product quiz
  const [quizOpen, setQuizOpen]       = useState(false);
  const [quizStep, setQuizStep]       = useState(1);
  const [quizAnswers, setQuizAnswers] = useState({ application:'', coolingType:'', heatLoad:'', budget:'', assistance:'' });
  const [quizResult, setQuizResult]   = useState<typeof PRODUCTS[0] | null>(null);
  // Lead contact fields
  const [lName,  setLName]  = useState('');
  const [lBiz,   setLBiz]   = useState('');
  const [lAddr,  setLAddr]  = useState('');
  const [lCity,  setLCity]  = useState('');
  const [lSt,    setLSt]    = useState('');
  const [lZip,   setLZip]   = useState('');
  const [lPhone, setLPhone] = useState('');
  const [lLeadEmail, setLLeadEmail] = useState('');

  const [quoteName,    setQuoteName]    = useState('');
  const [quoteEmail,   setQuoteEmail]   = useState('');
  const [quoteCompany, setQuoteCompany] = useState('');
  const [quoteMsg,     setQuoteMsg]     = useState('');

  const visible = filter === 'all' ? PRODUCTS : PRODUCTS.filter(p => p.category === filter);
  const quoteProduct    = PRODUCTS.find(p => p.id === showQuote);
  const estimateProduct = PRODUCTS.find(p => p.id === showEstimate);

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setQuoteSent(true);
  };

  const closeQuote = () => {
    setShowQuote(null); setQuoteSent(false);
    setQuoteName(''); setQuoteEmail(''); setQuoteCompany(''); setQuoteMsg('');
  };

  const getRecommendation = (ans: typeof quizAnswers) => {
    const refrigerated = ans.coolingType === 'refrigerated' ||
      (ans.coolingType === 'unsure' && (ans.application === 'medical' || ans.heatLoad === 'over-100'));
    if (refrigerated) {
      if (ans.heatLoad === 'over-100') return PRODUCTS.find(p => p.id === 'split')!;
      if (ans.heatLoad === '50-100')   return PRODUCTS.find(p => p.id === 'ruw')!;
      return PRODUCTS.find(p => p.id === 'ru')!;
    }
    if (ans.heatLoad === 'over-100' || ans.heatLoad === '50-100') return PRODUCTS.find(p => p.id === 'cuw')!;
    if (ans.heatLoad === '10-50') return PRODUCTS.find(p => p.id === 'cu')!;
    return PRODUCTS.find(p => p.id === 'rc')!;
  };

  const openQuiz = () => {
    setQuizStep(1);
    setQuizAnswers({ application:'', coolingType:'', heatLoad:'', budget:'', assistance:'' });
    setQuizResult(null);
    setLName(''); setLBiz(''); setLAddr(''); setLCity(''); setLSt(''); setLZip(''); setLPhone(''); setLLeadEmail('');
    setQuizOpen(true);
  };

  const advanceQuiz = (field: keyof typeof quizAnswers, value: string) => {
    const next = { ...quizAnswers, [field]: value };
    setQuizAnswers(next);
    if (quizStep < 5) { setQuizStep(s => s + 1); }
    else { setQuizResult(getRecommendation(next)); setQuizStep(6); }
  };

  const submitLead = () => {
    if (!quizResult) return;
    const lead = {
      id: typeof crypto !== 'undefined' ? crypto.randomUUID() : `${Date.now()}`,
      createdAt: new Date().toISOString(),
      name: lName, businessName: lBiz,
      address: lAddr, city: lCity, state: lSt, zip: lZip,
      phone: lPhone, email: lLeadEmail,
      ...quizAnswers,
      recommendedSeries: quizResult.series,
      recommendedModel: quizResult.model,
      estimatedLow: quizResult.priceRange.low,
      estimatedHigh: quizResult.priceRange.high,
      status: 'new', emailSent: false,
    };
    try {
      const existing = JSON.parse(localStorage.getItem('ei_leads') || '[]');
      existing.unshift(lead);
      localStorage.setItem('ei_leads', JSON.stringify(existing));
    } catch {}
    setQuizStep(8);
  };

  const INPUT = 'w-full border border-[#CBD5E0] rounded-md px-3 py-2 text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#1B3A6B] transition-colors bg-white';

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A202C] font-sans">

      {/* ── Nav ── */}
      <header className="bg-[#1B3A6B] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#C8291C] rounded-sm flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
              </svg>
            </div>
            <div>
              <p className="text-base font-bold leading-tight tracking-wide">ELECTRO IMPULSE</p>
              <p className="text-[10px] text-blue-300 tracking-widest uppercase leading-none">Laboratory, Inc. · Est. 1949</p>
            </div>
          </div>

          <nav className="flex items-center gap-3 text-sm">
            <a href="#products" className="font-bold text-[#FBBF24] border-b-2 border-[#FBBF24] pb-0.5 hover:text-white hover:border-white transition-colors hidden sm:block">
              Select your product
            </a>
            <button onClick={openQuiz} className="flex items-center gap-1.5 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#1B3A6B] font-bold text-xs px-4 py-2 rounded transition-colors whitespace-nowrap">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Product Quiz
            </button>
            <a href="https://www.electroimpulse.com/" target="_blank" rel="noopener noreferrer" className="text-blue-200 hover:text-white transition-colors hidden md:block text-xs">
              Visit EIL ↗
            </a>
          </nav>
        </div>
      </header>

      {/* ── Hero banner ── */}
      <div className="bg-[#1B3A6B] text-white border-b-4 border-[#C8291C]">
        <div className="max-w-7xl mx-auto px-6 py-12 sm:py-16">
          <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-blue-300 mb-3">Closed Loop Cooling Systems</p>
          <h1 className="text-3xl sm:text-4xl font-black leading-tight mb-4 max-w-2xl">
            Precision Cooling for High-Power<br />Military &amp; Industrial Electronics
          </h1>
          <p className="text-blue-100 text-base leading-relaxed max-w-xl mb-8">
            Since 1949, Electro Impulse Laboratory has designed and manufactured standard and custom cooling systems for radar, avionics, medical imaging, and industrial applications — trusted by the U.S. military and defense contractors worldwide.
          </p>
          <div className="flex flex-wrap gap-3">
            <button onClick={openQuiz} className="inline-flex items-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#1B3A6B] font-bold px-6 py-3 rounded text-sm transition-colors shadow-md">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              Find My Product
            </button>
            <a href="#products" className="inline-flex items-center gap-2 border border-white/40 hover:border-white text-white font-bold px-6 py-3 rounded text-sm transition-colors">
              Browse All Products
            </a>
            <div className="flex items-center gap-4 text-sm text-blue-200">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-400 rounded-full inline-block"/><span>ISO 9001:2015 Certified</span></span>
              <span className="hidden sm:flex items-center gap-1.5"><span className="w-2 h-2 bg-blue-400 rounded-full inline-block"/><span>ITAR Compliant</span></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Section ── */}
      <section id="products" className="max-w-7xl mx-auto px-6 py-12">

        {/* Section header + filters */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black text-[#1B3A6B]">Cooling Equipment</h2>
            <p className="text-sm text-[#718096] mt-1">Standard configurations available; all units engineered to specification.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {(['all', 'non-refrigerated', 'refrigerated'] as const).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)}
                className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded transition-colors border ${
                  filter === cat
                    ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]'
                    : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:border-[#1B3A6B] hover:text-[#1B3A6B]'
                }`}>
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Category heading */}
        {filter !== 'all' && (
          <div className="mb-6 flex items-center gap-3">
            <div className="h-1 w-6 bg-[#C8291C] rounded-full" />
            <p className="text-[11px] font-bold uppercase tracking-widest text-[#C8291C]">{CATEGORY_LABELS[filter]} Systems</p>
          </div>
        )}

        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map(product => (
            <div key={product.id} className="bg-white border border-[#E2E8F0] rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">

              {/* Card header */}
              <div className={`px-5 pt-5 pb-4 border-b border-[#EDF2F7] ${product.category === 'refrigerated' ? 'bg-[#EBF4FF]' : 'bg-[#F0FFF4]'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${product.category === 'refrigerated' ? 'bg-[#1B3A6B] text-white' : 'bg-[#276749] text-white'}`}>
                    {product.category === 'refrigerated' ? 'Refrigerated' : 'Non-Refrigerated'}
                  </div>
                  {product.badge && (
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${BADGE_STYLE[product.badge]}`}>{product.badge}</span>
                  )}
                </div>
                <p className="text-lg font-black text-[#1B3A6B]">{product.series}</p>
                <p className="text-[10px] font-mono text-[#718096] mt-0.5">Model: {product.model}</p>
                <p className="text-xs text-[#4A5568] mt-1 leading-snug">{product.tagline}</p>
              </div>

              {/* Card body */}
              <div className="px-5 py-4 flex flex-col flex-1">
                <p className="text-sm text-[#4A5568] leading-relaxed mb-4">{product.description}</p>

                {/* Spec table toggle */}
                <button onClick={() => setOpenSpec(openSpec === product.id ? null : product.id)}
                  className="flex items-center justify-between w-full text-left text-xs font-bold uppercase tracking-wider text-[#1B3A6B] mb-2 hover:text-[#C8291C] transition-colors">
                  <span>Key Specifications</span>
                  <svg className={`w-4 h-4 transition-transform ${openSpec === product.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {openSpec === product.id && (
                  <div className="mb-4 border border-[#E2E8F0] rounded overflow-hidden text-xs">
                    {product.specs.map((s, i) => (
                      <div key={s.label} className={`flex items-start gap-2 px-3 py-2 ${i % 2 === 0 ? 'bg-[#F7FAFC]' : 'bg-white'}`}>
                        <span className="font-semibold text-[#4A5568] w-28 shrink-0">{s.label}</span>
                        <span className="text-[#1A202C]">{s.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Applications */}
                <div className="mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0] mb-1.5">Applications</p>
                  <div className="flex flex-wrap gap-1.5">
                    {product.applications.map(app => (
                      <span key={app} className="text-[11px] bg-[#EDF2F7] text-[#4A5568] px-2 py-0.5 rounded-full border border-[#E2E8F0]">{app}</span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-auto pt-3 border-t border-[#EDF2F7] flex items-center gap-2">
                  <button onClick={() => { setShowQuote(product.id); setQuoteMsg(`I am interested in the ${product.series} (Model: ${product.model}) — ${product.name}.`); }}
                    className="flex-1 bg-[#1B3A6B] hover:bg-[#152E58] text-white text-xs font-bold uppercase tracking-wider py-2.5 rounded transition-colors text-center">
                    Request a Quote
                  </button>
                  <button onClick={() => setShowEstimate(product.id)}
                    className="text-xs font-bold text-[#C8291C] hover:text-white hover:bg-[#C8291C] border border-[#C8291C] px-3 py-2.5 rounded transition-colors whitespace-nowrap">
                    Est. Price
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Custom engineering callout */}
        <div className="mt-10 bg-[#1B3A6B] text-white rounded-lg px-6 py-7 sm:py-8 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-blue-300 mb-1">Need Something Custom?</p>
            <h3 className="text-xl font-black leading-tight">Complete Engineering &amp; Manufacturing Services</h3>
            <p className="text-sm text-blue-200 mt-2 leading-relaxed max-w-lg">
              All Electro Impulse standard products can be modified to meet exact customer specifications. Custom cooling systems are engineered from the ground up — from concept through qualification testing.
            </p>
          </div>
          <div className="shrink-0 flex flex-col gap-2 sm:items-end">
            <a href="tel:+17327765800" className="inline-flex items-center gap-2 bg-[#C8291C] hover:bg-[#A8211A] text-white font-bold px-5 py-3 rounded text-sm transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.47 2 2 0 0 1 3.55 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              (732) 776-5800
            </a>
            <p className="text-[11px] text-blue-300">Neptune, NJ · Mon–Fri 8am–5pm EST</p>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-[#152E58] text-blue-200 text-xs mt-8 py-6 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-bold text-white">ELECTRO IMPULSE LABORATORY, INC.</p>
          <p>1500 Neptune Blvd, Neptune, NJ 07753 · (732) 776-5800 · ISO 9001:2015</p>
          <p className="text-blue-400">© {new Date().getFullYear()} Electro Impulse Lab., Inc.</p>
        </div>
      </footer>

      {/* ── Product Quiz Modal ── */}
      {quizOpen && (() => {
        const STEPS = [
          { title: "What's your application?",          field: 'application' as const, opts: [
            { v:'defense',    l:'Defense / Radar',        d:'Military, radar, electronic warfare' },
            { v:'medical',    l:'Medical Imaging',         d:'MRI, CT, X-ray, imaging systems' },
            { v:'aerospace',  l:'Aerospace / Avionics',    d:'Airborne electronics, spacecraft' },
            { v:'industrial', l:'Industrial / Mfg',        d:'Power electronics, manufacturing' },
            { v:'research',   l:'Research / Lab',          d:'Academic, testing, R&D' },
            { v:'other',      l:'Other',                   d:'Other or not yet defined' },
          ]},
          { title: 'Do you need refrigerated cooling?',  field: 'coolingType' as const, opts: [
            { v:'refrigerated',     l:'Yes — Precise Temp Control',     d:'Need temp held to ±1°C or better' },
            { v:'non-refrigerated', l:'No — Ambient Cooling Sufficient', d:'Heat rejection to air or water is fine' },
            { v:'unsure',           l:"I'm Not Sure Yet",                d:'Help me decide based on my load' },
          ]},
          { title: "What's your approximate heat load?",  field: 'heatLoad' as const, opts: [
            { v:'under-10', l:'Under 10 kW',   d:'Small electronics packages' },
            { v:'10-50',    l:'10 – 50 kW',    d:'Mid-size electronics systems' },
            { v:'50-100',   l:'50 – 100 kW',   d:'High-power systems' },
            { v:'over-100', l:'Over 100 kW',   d:'Very large / custom installations' },
          ]},
          { title: "What's your budget range?",           field: 'budget' as const, opts: [
            { v:'under-20k',  l:'Under $20,000',          d:'Compact, standard units' },
            { v:'20k-50k',    l:'$20,000 – $50,000',      d:'Mid-range configurations' },
            { v:'50k-100k',   l:'$50,000 – $100,000',     d:'High-capacity systems' },
            { v:'over-100k',  l:'Over $100,000',           d:'Custom or split system solutions' },
          ]},
          { title: 'What level of support do you need?',  field: 'assistance' as const, opts: [
            { v:'turnkey',      l:'Turnkey Installation',   d:'Full setup by EIL team' },
            { v:'support',      l:'Technical Support Only', d:'We install; EIL guides remotely' },
            { v:'self-install', l:'Self-Install',           d:'We install using provided docs' },
            { v:'full-service', l:'Full Service Contract',  d:'24/7 support, maintenance & monitoring' },
          ]},
        ];
        const isQuestion = quizStep >= 1 && quizStep <= 5;
        const step = isQuestion ? STEPS[quizStep - 1] : null;
        const qIN = 'w-full border border-[#CBD5E0] rounded-md px-3 py-2 text-sm text-[#1A202C] placeholder-[#A0AEC0] focus:outline-none focus:border-[#1B3A6B] transition-colors bg-white';

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setQuizOpen(false)} />
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

              {/* Modal header */}
              <div className="bg-[#1B3A6B] text-white px-6 py-4 shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-black text-base">
                    {quizStep <= 5 ? `Step ${quizStep} of 5` : quizStep === 6 ? 'Your Recommendation' : quizStep === 7 ? 'Complete Your Inquiry' : 'Request Received!'}
                  </p>
                  <button onClick={() => setQuizOpen(false)} className="text-blue-300 hover:text-white text-2xl leading-none transition-colors">×</button>
                </div>
                {quizStep <= 5 && (
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= quizStep ? 'bg-[#FBBF24]' : 'bg-white/20'}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto px-6 py-5">

                {/* Steps 1-5: question */}
                {isQuestion && step && (
                  <div>
                    <p className="text-base font-black text-[#1B3A6B] mb-4">{step.title}</p>
                    <div className={`grid gap-2 ${step.opts.length > 4 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                      {step.opts.map(opt => (
                        <button key={opt.v} onClick={() => advanceQuiz(step.field, opt.v)}
                          className="text-left border-2 border-[#E2E8F0] hover:border-[#1B3A6B] bg-white hover:bg-[#EBF4FF] rounded-lg p-3 transition-all group">
                          <p className="text-sm font-bold text-[#1A202C] group-hover:text-[#1B3A6B]">{opt.l}</p>
                          <p className="text-xs text-[#718096] mt-0.5 leading-snug">{opt.d}</p>
                        </button>
                      ))}
                    </div>
                    {quizStep > 1 && (
                      <button onClick={() => setQuizStep(s => s - 1)} className="mt-4 text-xs font-semibold text-[#718096] hover:text-[#1B3A6B] transition-colors">← Back</button>
                    )}
                  </div>
                )}

                {/* Step 6: result */}
                {quizStep === 6 && quizResult && (
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#C8291C] mb-3">Based on your answers, we recommend:</p>
                    <div className={`border-2 border-[#1B3A6B] rounded-xl p-5 mb-4 ${quizResult.category === 'refrigerated' ? 'bg-[#EBF4FF]' : 'bg-[#F0FFF4]'}`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div>
                          <p className="text-xl font-black text-[#1B3A6B]">{quizResult.series}</p>
                          <p className="text-[10px] font-mono text-[#718096]">Model: {quizResult.model}</p>
                        </div>
                        <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shrink-0 mt-1 ${quizResult.category === 'refrigerated' ? 'bg-[#1B3A6B] text-white' : 'bg-[#276749] text-white'}`}>
                          {quizResult.category === 'refrigerated' ? 'Refrigerated' : 'Non-Refrigerated'}
                        </div>
                      </div>
                      <p className="text-sm text-[#4A5568] leading-relaxed mb-4">{quizResult.description}</p>
                      <div className="bg-white/70 rounded-lg px-4 py-3 flex items-center justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8291C] mb-0.5">Estimated Price Range</p>
                          <p className="text-lg font-black text-[#1A202C]">${quizResult.priceRange.low.toLocaleString()} – ${quizResult.priceRange.high.toLocaleString()}</p>
                        </div>
                        <p className="text-[10px] text-[#718096] text-right max-w-[120px] leading-snug">Standard config · FOB Neptune, NJ</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => setQuizStep(7)} className="w-full bg-[#C8291C] hover:bg-[#A8211A] text-white font-black py-3 rounded text-sm uppercase tracking-wider transition-colors">
                        Submit My Information →
                      </button>
                      <a href="tel:+17327765800" className="w-full border border-[#1B3A6B] text-[#1B3A6B] hover:bg-[#1B3A6B] hover:text-white font-bold py-2.5 rounded text-sm text-center transition-colors flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.58 3.47 2 2 0 0 1 3.55 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.81a16 16 0 0 0 6.29 6.29l.9-.9a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                        Call Us Instead: (732) 776-5800
                      </a>
                    </div>
                    <button onClick={() => setQuizStep(s => s - 1)} className="mt-3 text-xs font-semibold text-[#718096] hover:text-[#1B3A6B] transition-colors">← Retake quiz</button>
                  </div>
                )}

                {/* Step 7: contact form */}
                {quizStep === 7 && quizResult && (
                  <div>
                    <div className="bg-[#F7F8FA] border border-[#E2E8F0] rounded-lg px-4 py-3 mb-5 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#718096]">Recommended</p>
                        <p className="text-sm font-black text-[#1B3A6B]">{quizResult.series} · {quizResult.model}</p>
                      </div>
                      <p className="text-sm font-bold text-[#1A202C]">${quizResult.priceRange.low.toLocaleString()}–${quizResult.priceRange.high.toLocaleString()}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">Name *</label><input required value={lName} onChange={e=>setLName(e.target.value)} placeholder="Full name" className={qIN} /></div>
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">Business *</label><input required value={lBiz} onChange={e=>setLBiz(e.target.value)} placeholder="Company name" className={qIN} /></div>
                      </div>
                      <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">Street Address</label><input value={lAddr} onChange={e=>setLAddr(e.target.value)} placeholder="123 Main St" className={qIN} /></div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1"><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">City</label><input value={lCity} onChange={e=>setLCity(e.target.value)} placeholder="City" className={qIN} /></div>
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">State</label><input value={lSt} onChange={e=>setLSt(e.target.value)} placeholder="NJ" maxLength={2} className={qIN} /></div>
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">ZIP</label><input value={lZip} onChange={e=>setLZip(e.target.value)} placeholder="07753" className={qIN} /></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">Phone *</label><input required type="tel" value={lPhone} onChange={e=>setLPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={qIN} /></div>
                        <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1">Email *</label><input required type="email" value={lLeadEmail} onChange={e=>setLLeadEmail(e.target.value)} placeholder="you@company.com" className={qIN} /></div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 7 (submitted success) */}
                {quizStep === 8 && (
                  <div className="py-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    </div>
                    <p className="text-xl font-black text-[#1B3A6B] mb-2">Inquiry Received!</p>
                    <p className="text-sm text-[#718096] leading-relaxed max-w-xs mx-auto">An EIL sales engineer will contact you within one business day to discuss your cooling requirements and provide a firm quotation.</p>
                    <p className="text-xs text-[#A0AEC0] mt-3">Questions? Call (732) 776-5800</p>
                    <button onClick={() => setQuizOpen(false)} className="mt-6 bg-[#1B3A6B] text-white font-bold px-8 py-2.5 rounded text-sm hover:bg-[#152E58] transition-colors">Close</button>
                  </div>
                )}
              </div>

              {/* Footer for form step */}
              {quizStep === 7 && (
                <div className="border-t border-[#E2E8F0] px-6 py-4 bg-[#F7F8FA] shrink-0 flex items-center justify-between">
                  <button onClick={() => setQuizStep(6)} className="text-xs font-semibold text-[#718096] hover:text-[#1B3A6B]">← Back</button>
                  <button onClick={submitLead} disabled={!lName || !lPhone || !lLeadEmail}
                    className="bg-[#C8291C] hover:bg-[#A8211A] text-white font-black px-6 py-2.5 rounded text-sm uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                    Submit Request
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── Price Estimate Modal ── */}
      {showEstimate && estimateProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowEstimate(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden">
            <div className="bg-[#C8291C] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-black text-base">Estimated Price Range</p>
                <p className="text-red-200 text-xs mt-0.5">Standard configuration · FOB Neptune, NJ</p>
              </div>
              <button onClick={() => setShowEstimate(null)} className="text-red-200 hover:text-white text-2xl leading-none transition-colors">×</button>
            </div>
            <div className="px-6 py-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${estimateProduct.category === 'refrigerated' ? 'bg-[#1B3A6B] text-white' : 'bg-[#276749] text-white'}`}>
                  {estimateProduct.category === 'refrigerated' ? 'Refrigerated' : 'Non-Refrigerated'}
                </div>
              </div>
              <p className="text-xl font-black text-[#1B3A6B] mb-0.5">{estimateProduct.series}</p>
              <p className="text-xs font-mono text-[#718096] mb-4">Model No. {estimateProduct.model}</p>

              <div className="bg-[#FFF5F5] border border-[#FED7D7] rounded-lg px-5 py-4 mb-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#C8291C] mb-2">Price Estimate (USD)</p>
                <div className="flex items-end gap-3">
                  <div className="flex-1">
                    <p className="text-[10px] text-[#718096] uppercase tracking-widest mb-0.5">Low End</p>
                    <p className="text-2xl font-black text-[#1A202C]">${estimateProduct.priceRange.low.toLocaleString()}</p>
                  </div>
                  <div className="text-[#C8291C] font-black text-lg pb-1">—</div>
                  <div className="flex-1 text-right">
                    <p className="text-[10px] text-[#718096] uppercase tracking-widest mb-0.5">High End</p>
                    <p className="text-2xl font-black text-[#1A202C]">${estimateProduct.priceRange.high.toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-[#FED7D7] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#C8291C] to-[#1B3A6B] rounded-full w-full" />
                </div>
              </div>

              <p className="text-[11px] text-[#718096] leading-relaxed mb-5">
                Estimate reflects standard configurations. Final pricing depends on heat load, coolant type, options selected, and quantity. Custom-engineered units may exceed the high-end estimate. Contact EIL for a firm quotation.
              </p>

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowEstimate(null); setShowQuote(estimateProduct.id); setQuoteMsg(`I am interested in the ${estimateProduct.series} (Model: ${estimateProduct.model}) and would like a firm quotation.`); }}
                  className="flex-1 bg-[#1B3A6B] hover:bg-[#152E58] text-white font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors">
                  Request Firm Quote
                </button>
                <button onClick={() => setShowEstimate(null)} className="border border-[#E2E8F0] text-[#718096] hover:text-[#1B3A6B] px-4 py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Quote Modal ── */}
      {showQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={closeQuote} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md flex flex-col overflow-hidden">
            <div className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between">
              <div>
                <p className="font-black text-base">Request a Quote</p>
                {quoteProduct && <p className="text-blue-300 text-xs mt-0.5">{quoteProduct.series}</p>}
              </div>
              <button onClick={closeQuote} className="text-blue-300 hover:text-white text-2xl leading-none transition-colors">×</button>
            </div>

            <div className="px-6 py-5 overflow-y-auto max-h-[80vh]">
              {quoteSent ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-lg font-black text-[#1B3A6B] mb-2">Quote Request Sent</p>
                  <p className="text-sm text-[#718096] leading-relaxed max-w-xs mx-auto">An Electro Impulse applications engineer will contact you within one business day.</p>
                  <button onClick={closeQuote} className="mt-6 bg-[#1B3A6B] text-white font-bold px-6 py-2.5 rounded text-sm hover:bg-[#152E58] transition-colors">Close</button>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">Name</label><input required value={quoteName} onChange={e=>setQuoteName(e.target.value)} placeholder="Full name" className={INPUT} /></div>
                    <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">Company</label><input required value={quoteCompany} onChange={e=>setQuoteCompany(e.target.value)} placeholder="Organization" className={INPUT} /></div>
                  </div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">Email</label><input required type="email" value={quoteEmail} onChange={e=>setQuoteEmail(e.target.value)} placeholder="you@company.com" className={INPUT} /></div>
                  <div><label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">Message</label><textarea required rows={4} value={quoteMsg} onChange={e=>setQuoteMsg(e.target.value)} placeholder="Describe your application, heat load, coolant requirements…" className={`${INPUT} resize-none`} /></div>
                  <button type="submit" className="w-full bg-[#C8291C] hover:bg-[#A8211A] text-white font-black py-3 rounded text-sm uppercase tracking-wider transition-colors">Submit Quote Request</button>
                  <p className="text-[10px] text-[#A0AEC0] text-center">Electro Impulse Laboratory, Inc. · Neptune, NJ · (732) 776-5800</p>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

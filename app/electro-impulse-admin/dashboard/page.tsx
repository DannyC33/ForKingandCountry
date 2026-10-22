'use client';
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

interface Lead {
  id: string;
  createdAt: string;
  name: string;
  businessName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  application: string;
  coolingType: string;
  heatLoad: string;
  budget: string;
  assistance: string;
  recommendedSeries: string;
  recommendedModel: string;
  estimatedLow: number;
  estimatedHigh: number;
  status: 'new' | 'contacted' | 'quoted' | 'closed';
  emailSent: boolean;
}

const APP_LABELS: Record<string,string>  = { defense:'Defense / Radar', medical:'Medical Imaging', aerospace:'Aerospace / Avionics', industrial:'Industrial / Mfg', research:'Research / Lab', other:'Other' };
const COOL_LABELS: Record<string,string> = { refrigerated:'Refrigerated', 'non-refrigerated':'Non-Refrigerated', unsure:'Unsure' };
const HEAT_LABELS: Record<string,string> = { 'under-10':'<10 kW', '10-50':'10–50 kW', '50-100':'50–100 kW', 'over-100':'>100 kW' };
const BUD_LABELS:  Record<string,string> = { 'under-20k':'<$20K', '20k-50k':'$20K–$50K', '50k-100k':'$50K–$100K', 'over-100k':'>$100K' };
const ASST_LABELS: Record<string,string> = { turnkey:'Turnkey', support:'Tech Support', 'self-install':'Self-Install', 'full-service':'Full Service' };

const STATUS_STYLE: Record<string,string> = {
  new:       'bg-[#FBBF24] text-[#1B3A6B]',
  contacted: 'bg-blue-100 text-blue-700',
  quoted:    'bg-purple-100 text-purple-700',
  closed:    'bg-green-100 text-green-700',
};

// Seed leads shown when localStorage is empty
const SEED_LEADS: Lead[] = [
  { id:'seed-1', createdAt:'2026-08-28T10:14:00Z', name:'James Hartley', businessName:'Northrop Systems', address:'200 Defense Way', city:'Linden', state:'NJ', zip:'07036', phone:'(908) 555-0142', email:'jhartley@northropsys.com', application:'defense', coolingType:'refrigerated', heatLoad:'over-100', budget:'over-100k', assistance:'turnkey', recommendedSeries:'Split System (RU / RUW)', recommendedModel:'RU/RUW-200S', estimatedLow:46500, estimatedHigh:182000, status:'new', emailSent:false },
  { id:'seed-2', createdAt:'2026-08-26T14:30:00Z', name:'Linda Moreau',  businessName:'Avenel Medical Imaging', address:'88 Hospital Dr', city:'Avenel', state:'NJ', zip:'07001', phone:'(732) 555-0198', email:'lmoreau@avenelmed.com', application:'medical', coolingType:'refrigerated', heatLoad:'10-50', budget:'20k-50k', assistance:'support', recommendedSeries:'RU Series', recommendedModel:'RU-100', estimatedLow:17500, estimatedHigh:93000, status:'contacted', emailSent:true },
  { id:'seed-3', createdAt:'2026-08-24T09:05:00Z', name:'Robert Daines', businessName:'Aerotek Labs',   address:'44 Hangar Blvd', city:'Toms River', state:'NJ', zip:'08753', phone:'(732) 555-0067', email:'rdaines@aeroteklabs.net', application:'aerospace', coolingType:'non-refrigerated', heatLoad:'50-100', budget:'50k-100k', assistance:'self-install', recommendedSeries:'CUW Series', recommendedModel:'CUW-200', estimatedLow:11500, estimatedHigh:64000, status:'quoted', emailSent:true },
  { id:'seed-4', createdAt:'2026-08-20T16:45:00Z', name:'Sara Kim',      businessName:'Montclair Tech Solutions', address:'12 Innovation Pkwy', city:'Montclair', state:'NJ', zip:'07042', phone:'(973) 555-0311', email:'skim@montclairtech.com', application:'research', coolingType:'unsure', heatLoad:'under-10', budget:'under-20k', assistance:'self-install', recommendedSeries:'RC Series', recommendedModel:'RC-15', estimatedLow:4800, estimatedHigh:27000, status:'new', emailSent:false },
  { id:'seed-5', createdAt:'2026-08-15T11:20:00Z', name:'Tom Alvarez',   businessName:'Hoboken Power Systems', address:'500 River St', city:'Hoboken', state:'NJ', zip:'07030', phone:'(201) 555-0244', email:'talvarez@hobokenpower.com', application:'industrial', coolingType:'non-refrigerated', heatLoad:'10-50', budget:'20k-50k', assistance:'turnkey', recommendedSeries:'CU Series', recommendedModel:'CU-50', estimatedLow:7200, estimatedHigh:39500, status:'closed', emailSent:true },
  { id:'seed-6', createdAt:'2026-08-10T08:55:00Z', name:'Diane Foley',   businessName:'Trenton Defense Group', address:'1 Capitol Ave', city:'Trenton', state:'NJ', zip:'08608', phone:'(609) 555-0188', email:'dfoley@trentondefense.gov', application:'defense', coolingType:'refrigerated', heatLoad:'50-100', budget:'50k-100k', assistance:'full-service', recommendedSeries:'RUW Series', recommendedModel:'RUW-150', estimatedLow:21000, estimatedHigh:118000, status:'contacted', emailSent:true },
];

// Numeric proximity to Neptune NJ 07753 (pure zip arithmetic — not geographic, but useful as a demo sort)
const zipDist = (zip: string) => Math.abs(parseInt(zip || '99999', 10) - 7753);

const EMAIL_TEMPLATE = (lead: Lead) =>
`Subject: Your Electro Impulse Inquiry — ${lead.recommendedSeries}

Dear ${lead.name},

Thank you for your interest in Electro Impulse Laboratory cooling equipment. Based on your inquiry, our sales team has identified the ${lead.recommendedSeries} (Model ${lead.recommendedModel}) as the best fit for your application.

Estimated price range for a standard configuration: $${lead.estimatedLow.toLocaleString()} – $${lead.estimatedHigh.toLocaleString()} (FOB Neptune, NJ).

We would love to connect and learn more about your specific requirements so we can prepare a firm, customized quotation. Please feel free to reach out at your convenience:

  📞  (732) 776-5800
  ✉️  sales@electroimpulse.com

Our applications engineers are available Monday through Friday, 8:00 AM – 5:00 PM Eastern.

Best regards,
Electro Impulse Laboratory Sales Team
1500 Neptune Blvd · Neptune, NJ 07753
ISO 9001:2015 Certified`;

export default function EILAdminDashboard() {
  const router = useRouter();
  const [leads, setLeads]             = useState<Lead[]>([]);
  const [sort, setSort]               = useState<'newest' | 'price' | 'proximity'>('newest');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedId, setExpandedId]   = useState<string | null>(null);
  const [emailLead, setEmailLead]     = useState<Lead | null>(null);
  const [emailBody, setEmailBody]     = useState('');
  const [emailSent, setEmailSent]     = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem('eil_admin_auth') !== '1') { router.replace('/electro-impulse-admin'); return; }
      const stored = localStorage.getItem('ei_leads');
      const parsed: Lead[] = stored ? JSON.parse(stored) : [];
      setLeads(parsed.length > 0 ? parsed : SEED_LEADS);
      if (!stored || parsed.length === 0) {
        localStorage.setItem('ei_leads', JSON.stringify(SEED_LEADS));
      }
    } catch { router.replace('/electro-impulse-admin'); }
  }, [router]);

  const updateStatus = (id: string, status: Lead['status']) => {
    setLeads(prev => {
      const next = prev.map(l => l.id === id ? { ...l, status } : l);
      try { localStorage.setItem('ei_leads', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const markEmailSent = (id: string) => {
    setLeads(prev => {
      const next = prev.map(l => l.id === id ? { ...l, emailSent: true } : l);
      try { localStorage.setItem('ei_leads', JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const openEmail = (lead: Lead) => {
    setEmailLead(lead); setEmailBody(EMAIL_TEMPLATE(lead)); setEmailSent(false);
  };

  const sendEmail = () => {
    if (!emailLead) return;
    markEmailSent(emailLead.id);
    updateStatus(emailLead.id, 'contacted');
    setEmailSent(true);
  };

  const sorted = useMemo(() => {
    let filtered = statusFilter === 'all' ? leads : leads.filter(l => l.status === statusFilter);
    if (sort === 'newest')   return [...filtered].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    if (sort === 'price')    return [...filtered].sort((a,b) => b.estimatedHigh - a.estimatedHigh);
    if (sort === 'proximity') return [...filtered].sort((a,b) => zipDist(a.zip) - zipDist(b.zip));
    return filtered;
  }, [leads, sort, statusFilter]);

  const stats = useMemo(() => ({
    total:     leads.length,
    newLeads:  leads.filter(l => l.status === 'new').length,
    pipeline:  leads.reduce((s,l) => s + l.estimatedHigh, 0),
    contacted: leads.filter(l => l.status === 'contacted').length,
  }), [leads]);

  const logout = () => {
    try { localStorage.removeItem('eil_admin_auth'); } catch {}
    router.replace('/electro-impulse-admin');
  };

  const INPUT = 'w-full border border-[#CBD5E0] rounded-md px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:border-[#1B3A6B] transition-colors bg-white';

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#1A202C]">

      {/* Nav */}
      <header className="bg-[#1B3A6B] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-[#C8291C] rounded-sm flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            </div>
            <div>
              <p className="text-sm font-black">EIL Sales Admin</p>
              <p className="text-[10px] text-blue-300 uppercase tracking-widest leading-none">Electro Impulse Laboratory</p>
            </div>
          </div>
          <button onClick={logout} className="text-xs text-blue-300 hover:text-white border border-blue-500 hover:border-blue-300 px-3 py-1.5 rounded transition-colors">Sign Out</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label:'Total Leads',     value: stats.total,                       color:'text-[#1B3A6B]' },
            { label:'New / Uncontacted', value: stats.newLeads,                  color:'text-[#C8291C]' },
            { label:'Active Pipeline', value:`$${(stats.pipeline/1000).toFixed(0)}K est.`, color:'text-[#1B3A6B]' },
            { label:'Contacted',       value: stats.contacted,                    color:'text-[#276749]' },
          ].map(s => (
            <div key={s.label} className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0]">{s.label}</p>
              <p className={`text-2xl font-black mt-1 ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Leads table */}
        <div>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-black text-[#1B3A6B]">Leads</h2>
              <p className="text-xs text-[#718096] mt-0.5">{sorted.length} result{sorted.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {/* Status filter */}
              <div className="flex items-center gap-1">
                {(['all','new','contacted','quoted','closed'] as const).map(s => (
                  <button key={s} onClick={() => setStatusFilter(s)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded border transition-colors capitalize ${statusFilter === s ? 'bg-[#1B3A6B] text-white border-[#1B3A6B]' : 'bg-white text-[#4A5568] border-[#CBD5E0] hover:border-[#1B3A6B]'}`}>
                    {s}
                  </button>
                ))}
              </div>
              {/* Sort */}
              <select value={sort} onChange={e => setSort(e.target.value as typeof sort)}
                className="text-xs font-semibold border border-[#CBD5E0] rounded px-3 py-1.5 bg-white text-[#4A5568] focus:outline-none focus:border-[#1B3A6B]">
                <option value="newest">Sort: Newest</option>
                <option value="price">Sort: Highest Value</option>
                <option value="proximity">Sort: Closest (NJ)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {sorted.length === 0 && (
              <div className="bg-white border border-[#E2E8F0] rounded-xl py-16 text-center">
                <p className="text-[#A0AEC0] text-sm">No leads match the current filter.</p>
              </div>
            )}
            {sorted.map(lead => (
              <div key={lead.id} className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">

                {/* Row summary */}
                <button onClick={() => setExpandedId(expandedId === lead.id ? null : lead.id)}
                  className="w-full flex flex-wrap sm:flex-nowrap items-center gap-4 px-5 py-4 text-left hover:bg-[#F7F8FA] transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-bold text-[#1A202C]">{lead.name}</p>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${STATUS_STYLE[lead.status]}`}>{lead.status}</span>
                      {lead.emailSent && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Email Sent</span>}
                      {!lead.emailSent && lead.status === 'new' && <span className="text-[10px] font-bold text-[#C8291C]">● Action needed</span>}
                    </div>
                    <p className="text-xs text-[#718096] mt-0.5">{lead.businessName} · {lead.city}, {lead.state} {lead.zip}</p>
                  </div>
                  <div className="shrink-0 text-right hidden sm:block">
                    <p className="text-[10px] text-[#A0AEC0] uppercase tracking-widest">Recommended</p>
                    <p className="text-xs font-bold text-[#1B3A6B]">{lead.recommendedSeries}</p>
                    <p className="text-[10px] font-mono text-[#718096]">{lead.recommendedModel}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-[#A0AEC0] uppercase tracking-widest">Est. Value</p>
                    <p className="text-sm font-black text-[#1A202C]">${lead.estimatedHigh.toLocaleString()}</p>
                    <p className="text-[10px] text-[#A0AEC0]">{new Date(lead.createdAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})}</p>
                  </div>
                  <svg className={`w-4 h-4 text-[#C0C8D0] shrink-0 transition-transform ${expandedId === lead.id ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>

                {/* Expanded detail */}
                {expandedId === lead.id && (
                  <div className="border-t border-[#E2E8F0] px-5 py-5 bg-[#FAFAFA]">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-5">

                      {/* Contact */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0] mb-2">Contact Info</p>
                        <div className="space-y-1 text-sm">
                          <p><span className="text-[#718096]">Name:</span> <span className="font-semibold">{lead.name}</span></p>
                          <p><span className="text-[#718096]">Company:</span> {lead.businessName}</p>
                          <p><span className="text-[#718096]">Address:</span> {[lead.address, lead.city, lead.state, lead.zip].filter(Boolean).join(', ')}</p>
                          <p><span className="text-[#718096]">Phone:</span> <a href={`tel:${lead.phone}`} className="text-[#1B3A6B] hover:underline">{lead.phone}</a></p>
                          <p><span className="text-[#718096]">Email:</span> <a href={`mailto:${lead.email}`} className="text-[#1B3A6B] hover:underline">{lead.email}</a></p>
                        </div>
                      </div>

                      {/* Quiz answers */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0] mb-2">Quiz Answers</p>
                        <div className="space-y-1 text-sm">
                          {[
                            ['Application', APP_LABELS[lead.application] || lead.application],
                            ['Cooling',     COOL_LABELS[lead.coolingType] || lead.coolingType],
                            ['Heat Load',   HEAT_LABELS[lead.heatLoad]    || lead.heatLoad],
                            ['Budget',      BUD_LABELS[lead.budget]       || lead.budget],
                            ['Support',     ASST_LABELS[lead.assistance]  || lead.assistance],
                          ].map(([l,v]) => (
                            <p key={l}><span className="text-[#718096]">{l}:</span> {v}</p>
                          ))}
                        </div>
                      </div>

                      {/* Recommendation + actions */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0] mb-2">Recommendation</p>
                        <div className="bg-[#EBF4FF] border border-[#BEE3F8] rounded-lg px-4 py-3 mb-4">
                          <p className="text-base font-black text-[#1B3A6B]">{lead.recommendedSeries}</p>
                          <p className="text-[10px] font-mono text-[#718096]">{lead.recommendedModel}</p>
                          <p className="text-sm font-bold text-[#1A202C] mt-1">${lead.estimatedLow.toLocaleString()} – ${lead.estimatedHigh.toLocaleString()}</p>
                        </div>

                        <div className="space-y-2">
                          <div>
                            <label className="block text-[10px] font-bold uppercase tracking-widest text-[#A0AEC0] mb-1">Status</label>
                            <select value={lead.status} onChange={e => updateStatus(lead.id, e.target.value as Lead['status'])}
                              className="w-full text-xs font-semibold border border-[#CBD5E0] rounded px-2 py-1.5 bg-white focus:outline-none focus:border-[#1B3A6B]">
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="quoted">Quoted</option>
                              <option value="closed">Closed</option>
                            </select>
                          </div>
                          <button onClick={() => openEmail(lead)}
                            className="w-full flex items-center justify-center gap-2 bg-[#1B3A6B] hover:bg-[#152E58] text-white font-bold py-2 rounded text-xs uppercase tracking-wider transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                            Send Follow-Up Email
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Email modal */}
      {emailLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setEmailLead(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[92vh]">
            <div className="bg-[#1B3A6B] text-white px-6 py-4 flex items-center justify-between shrink-0">
              <div>
                <p className="font-black text-base">Send Follow-Up Email</p>
                <p className="text-blue-300 text-xs mt-0.5">{emailLead.name} · {emailLead.email}</p>
              </div>
              <button onClick={() => setEmailLead(null)} className="text-blue-300 hover:text-white text-2xl leading-none">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {emailSent ? (
                <div className="py-10 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-lg font-black text-[#1B3A6B] mb-2">Email Sent!</p>
                  <p className="text-sm text-[#718096]">Follow-up email dispatched to {emailLead.email}. Lead status updated to Contacted.</p>
                  <button onClick={() => setEmailLead(null)} className="mt-6 bg-[#1B3A6B] text-white font-bold px-6 py-2.5 rounded text-sm hover:bg-[#152E58] transition-colors">Close</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">To</label>
                    <input readOnly value={`${emailLead.name} <${emailLead.email}>`}
                      className="w-full border border-[#E2E8F0] rounded-md px-3 py-2 text-sm bg-[#F7F8FA] text-[#718096]" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">Message</label>
                    <textarea rows={18} value={emailBody} onChange={e => setEmailBody(e.target.value)}
                      className="w-full border border-[#CBD5E0] rounded-md px-3 py-2 text-sm text-[#1A202C] focus:outline-none focus:border-[#1B3A6B] transition-colors font-mono resize-none" />
                  </div>
                </div>
              )}
            </div>

            {!emailSent && (
              <div className="border-t border-[#E2E8F0] px-6 py-4 flex items-center justify-between shrink-0 bg-[#F7F8FA]">
                <p className="text-[11px] text-[#A0AEC0]">UI preview only · no email platform connected</p>
                <button onClick={sendEmail} className="bg-[#C8291C] hover:bg-[#A8211A] text-white font-black px-5 py-2.5 rounded text-sm uppercase tracking-wider transition-colors">
                  Send Email
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';
import type { User } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
const bm = supabase.schema('birdsmouth');

const LOGO      = 'https://images.squarespace-cdn.com/content/v1/695c169d5083032f08c5e2a9/75282f5e-e2c5-44aa-ba01-e29c9262efe2/bird+logo+horz.png?format=1500w';
const HERO_IMG  = 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=1200&auto=format&fit=crop&q=80';

const BEERS = [
  { id: 'original-lager', name: 'Original Lager',  style: 'American Lager',       description: 'Our flagship brew — crisp, clean, and endlessly refreshing. Brewed with Pilsner malt and select hops for a smooth, golden finish that never goes out of style.', stock: 7842 },
  { id: 'mexican-lager',  name: 'Mexican Lager',   style: 'Mexican-Style Lager',  description: 'Light-bodied and brilliantly clear with a gentle corn sweetness and a whisper of noble hops. Born for warm days, outdoor venues, and effortless drinking.', stock: 6218 },
  { id: 'vienna-lager',   name: 'Vienna Lager',    style: 'Vienna-Style Lager',   description: 'Copper-colored and layered with toasted biscuit malt, balanced by earthy hops and a long, clean finish. A classic European style with surprising depth.', stock: 8563 },
] as const;

const PACKAGES = [
  { id: 'pkg-85',     label: '85-Case Bundle',  cases: 85,  unitPrice: 20, tag: null,         isCustom: false as const },
  { id: 'pkg-170',    label: '170-Case Bundle', cases: 170, unitPrice: 19, tag: 'Best Value', isCustom: false as const },
  { id: 'pkg-155',    label: '155-Case Bundle', cases: 155, unitPrice: 18, tag: null,         isCustom: false as const },
  { id: 'pkg-custom', label: 'Custom Order',    cases: 0,   unitPrice: 18, tag: '156+ Cases', isCustom: true  as const },
];

const FAQS = [
  { q: 'How does your pricing work?',            a: 'We offer tiered volume pricing. The 85-case bundle is $20/case, 155-case bundle is $18/case, and our 170-case bundle is $19/case with the most total value. Custom orders of 156+ cases also qualify for the $18/case bulk rate.' },
  { q: 'How is Birdsmouth beer brewed?',          a: 'Every Birdsmouth beer is brewed in small batches using traditional methods — full grain mashing, temperature-controlled fermentation, and extended cold lagering. We never use artificial additives or shortcuts.' },
  { q: 'How often are new batches released?',     a: 'Our core lagers run on a continuous 4-week brew cycle to maintain consistent freshness year-round. Seasonal and limited releases happen quarterly.' },
  { q: 'What is the minimum order?',              a: 'Our minimum vendor order is 85 cases (one standard bundle). Custom bulk orders have a minimum of 156 cases to qualify for the discounted rate.' },
  { q: 'How is delivery handled?',                a: 'We deliver direct to your venue on our refrigerated truck, Tuesday through Friday. Add your preferred delivery date and any loading dock details at checkout.' },
  { q: 'Can I order multiple beer styles?',       a: 'Yes — each beer style is a separate line item. Place individual orders per style; they will be consolidated and delivered together.' },
  { q: 'What payment terms do you offer?',        a: 'Standard terms are net-30 for established accounts. New vendors start on prepayment for the first three orders.' },
  { q: 'What is the freshness guarantee?',        a: 'All cases ship with a minimum of 90 days remaining before the best-by date. Our lagers are typically packaged within 10 days of your delivery date.' },
];

const NEW_RELEASES = [
  { id: 'schwarzbier',  name: 'Schwarzbier',    style: 'German Dark Lager',  description: 'Dark as night, light as a lager. Roasted malt character without the weight — the ultimate crossover for your dark beer customers.',                           eta: 'Fall 2026',     status: 'coming-soon', label: 'Coming Soon'    },
  { id: 'marzen',       name: 'Märzen',          style: 'Oktoberfest Lager',  description: 'Brewed in the Bavarian tradition and lagered for 8 weeks. Rich biscuity sweetness with perfect malt-hop balance. Your October rotation, sorted.',             eta: 'September 2026',status: 'pre-order',   label: 'Pre-Order'      },
  { id: 'czech-pilsner',name: 'Czech Pilsner',   style: 'Bohemian Pilsner',   description: 'Soft water, decoction mashing, Saaz hops. Brilliantly clear with a floral aroma and a long dry bitterness. The pilsner your guests have been waiting for.', eta: 'Spring 2027',   status: 'notify',      label: 'Notify Me'      },
];

type OrderStep = 1 | 2 | 3 | 'success';
type OrderItem = { id: string; product_name: string; quantity: number; unit_price: number; subtotal: number };
type Order     = { id: string; status: 'pending'|'confirmed'|'out_for_delivery'|'delivered'|'cancelled'; requested_date: string|null; notes: string|null; total: number; created_at: string; bm_order_items?: OrderItem[] };

const STATUS_LABEL: Record<string,string> = { pending:'Pending', confirmed:'Confirmed', out_for_delivery:'Out for Delivery', delivered:'Delivered', cancelled:'Cancelled' };
const STATUS_CLASS: Record<string,string> = {
  pending:'bg-amber-50 text-amber-700 border-amber-200', confirmed:'bg-blue-50 text-blue-700 border-blue-200',
  out_for_delivery:'bg-purple-50 text-purple-700 border-purple-200', delivered:'bg-green-50 text-green-700 border-green-200', cancelled:'bg-gray-50 text-gray-400 border-gray-200',
};
const INPUT = 'w-full bg-[#F7F4EF] border border-[#E8E3DA] rounded-lg px-4 py-2.5 text-[#1C1814] text-sm focus:outline-none focus:border-[#C8932A] transition-colors';

export default function BirdsmouthOrdersPage() {
  const router = useRouter();

  const [user, setUser]           = useState<User | null>(null);
  const [orders, setOrders]       = useState<Order[]>([]);
  const [loading, setLoading]     = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Order modal
  const [showModal, setShowModal]   = useState(false);
  const [orderStep, setOrderStep]   = useState<OrderStep>(1);
  const [modalBeer, setModalBeer]   = useState<string | null>(null);
  const [modalPkg, setModalPkg]     = useState<string | null>(null);
  const [modalCustomCases, setModalCustomCases] = useState(156);
  const [contactName, setContactName]       = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactPhone, setContactPhone]     = useState('');
  const [specialRequest, setSpecialRequest] = useState('');
  const [requestedDate, setRequestedDate]   = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [toast, setToast]     = useState<string | null>(null);

  const showToastMsg = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const fetchOrders = useCallback(async () => {
    const { data } = await bm.from('bm_orders').select('*, bm_order_items(*)').order('created_at', { ascending: false });
    setOrders((data as Order[]) ?? []);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.replace('/birdsmouth-brewery'); return; }
      setUser(session.user);
      fetchOrders().then(() => setLoading(false));
    });
  }, [router, fetchOrders]);

  const handleLogout = async () => { await supabase.auth.signOut(); router.replace('/birdsmouth-brewery'); };

  const openOrderModal = () => {
    setOrderStep(1); setModalBeer(null); setModalPkg(null); setModalCustomCases(156);
    setContactName(''); setContactCompany(''); setContactPhone(''); setSpecialRequest(''); setRequestedDate('');
    setSubmitError(null); setShowModal(true);
  };

  const handlePlaceOrder = async () => {
    const pkg  = PACKAGES.find(p => p.id === modalPkg);
    const beer = BEERS.find(b => b.id === modalBeer);
    if (!pkg || !beer) { setSubmitError('Please complete all steps.'); return; }
    const cases = pkg.isCustom ? modalCustomCases : pkg.cases;
    const total = cases * pkg.unitPrice;
    const label = pkg.isCustom ? `Custom — ${cases} cases` : pkg.label;

    const notesParts = [
      contactName    && `Vendor: ${contactName}`,
      contactCompany && `Company: ${contactCompany}`,
      contactPhone   && `Phone: ${contactPhone}`,
      specialRequest && `Special Request: ${specialRequest}`,
    ].filter(Boolean).join(' | ');

    setSubmitting(true); setSubmitError(null);

    const { data: order, error: orderErr } = await bm.from('bm_orders').insert({
      vendor_id: user!.id, vendor_email: user!.email, status: 'pending',
      requested_date: requestedDate || null, notes: notesParts || null, total,
    }).select().single();

    if (orderErr || !order) { setSubmitError('Failed to place order. Please try again.'); setSubmitting(false); return; }

    const { error: itemsErr } = await bm.from('bm_order_items').insert([{
      order_id: order.id,
      product_name: `${beer.name} — ${label}`,
      quantity: cases, unit_price: pkg.unitPrice, subtotal: total,
    }]);

    if (itemsErr) { setSubmitError('Order placed but items failed to save. Contact Birdsmouth.'); setSubmitting(false); return; }

    setSubmitting(false); setOrderStep('success'); fetchOrders();
  };

  const handleCancel = async (orderId: string) => {
    if (!confirm('Cancel this order?')) return;
    await bm.from('bm_orders').update({ status: 'cancelled', updated_at: new Date().toISOString() }).eq('id', orderId);
    fetchOrders();
  };

  const handlePreOrder = (name: string, status: string) => {
    showToastMsg(status === 'pre-order' ? `Pre-order confirmed for ${name}!` : `You're on the notify list for ${name}.`);
  };

  const modalPkgObj   = PACKAGES.find(p => p.id === modalPkg);
  const modalCases    = modalPkgObj ? (modalPkgObj.isCustom ? modalCustomCases : modalPkgObj.cases) : 0;
  const modalTotal    = modalPkgObj ? modalCases * modalPkgObj.unitPrice : 0;

  if (loading) return <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center"><div className="w-6 h-6 border-2 border-[#C8932A] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen bg-[#F7F4EF] text-[#1C1814]">

      {/* ── Nav ── */}
      <header className="sticky top-0 z-40 border-b border-[#E8E3DA] bg-white/95 backdrop-blur shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Image src={LOGO} alt="Birdsmouth Brewery" width={150} height={40} className="object-contain brightness-0" />
          <div className="flex items-center gap-3">
            <button onClick={openOrderModal} className="flex items-center gap-2 bg-[#C8932A] text-white text-sm font-bold px-5 py-2 rounded-xl hover:bg-[#B5811E] transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Place an Order
            </button>
            <span className="text-sm text-[#A0988E] hidden sm:block truncate max-w-[180px]">{user?.email}</span>
            <button onClick={handleLogout} className="text-xs text-[#6A6058] hover:text-[#1C1814] border border-[#E8E3DA] hover:border-[#C0B8B0] px-3 py-1.5 rounded-lg transition-colors">Sign Out</button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="grid grid-cols-1 lg:grid-cols-2 min-h-[480px] bg-white">
        <div className="flex flex-col justify-center px-8 sm:px-16 py-16 max-w-xl mx-auto lg:mx-0 lg:max-w-none">
          <h1 className="text-4xl sm:text-5xl font-black text-[#1C1814] leading-tight tracking-tight mb-4">
            Partner with<br />Birdsmouth Beer
          </h1>
          <p className="text-lg text-[#6A6058] leading-relaxed mb-8">
            We offer New Jersey&apos;s best beer at an affordable price.
          </p>
          <button onClick={openOrderModal} className="self-start flex items-center gap-2 bg-[#C8932A] text-white font-bold px-8 py-3.5 rounded-2xl text-base hover:bg-[#B5811E] transition-colors shadow-md shadow-amber-200">
            Place an Order
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
        <div className="relative hidden lg:block min-h-[480px]">
          <Image src={HERO_IMG} alt="Birdsmouth Beer" fill className="object-cover" sizes="50vw" priority />
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent" />
        </div>
      </section>

      <main className="max-w-6xl mx-auto px-6 py-12 space-y-16">

        {/* ── Order History ── */}
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold">Your Orders</h2>
            <p className="text-sm text-[#A0988E] mt-1">
              {orders.length === 0 ? 'No orders yet' : `${orders.filter(o=>o.status==='pending').length} pending · ${orders.filter(o=>o.status==='confirmed').length} confirmed`}
            </p>
          </div>
          {orders.length === 0 ? (
            <div className="border border-[#E8E3DA] rounded-2xl py-16 text-center bg-white">
              <p className="text-[#A0988E] mb-4">No orders yet.</p>
              <button onClick={openOrderModal} className="text-[#C8932A] text-sm font-semibold hover:underline">Place your first order →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(order => (
                <div key={order.id} className="bg-white border border-[#E8E3DA] rounded-2xl overflow-hidden shadow-sm">
                  <button onClick={() => setExpandedId(expandedId===order.id ? null : order.id)} className="w-full flex items-center gap-4 px-6 py-4 text-left hover:bg-[#F7F4EF] transition-colors">
                    <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 min-w-0">
                      {[['Order',`#${order.id.slice(-6).toUpperCase()}`],['Placed',new Date(order.created_at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'})],['Requested',order.requested_date?new Date(order.requested_date+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'}):'—'],['Total',`$${order.total.toLocaleString(undefined,{minimumFractionDigits:2})}`]].map(([l,v])=>(
                        <div key={l}><p className="text-[10px] text-[#A0988E] uppercase tracking-widest">{l}</p><p className={`text-sm ${l==='Order'?'font-mono':'font-medium'} text-[#1C1814]`}>{v}</p></div>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${STATUS_CLASS[order.status]}`}>{STATUS_LABEL[order.status]}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-[#C0B8B0] transition-transform ${expandedId===order.id?'rotate-180':''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                    </div>
                  </button>
                  {expandedId===order.id && (
                    <div className="border-t border-[#E8E3DA] px-6 py-5 bg-[#FAFAF8]">
                      {order.bm_order_items && order.bm_order_items.length>0 ? (
                        <div className="overflow-x-auto mb-4">
                          <table className="w-full text-sm">
                            <thead><tr className="text-[10px] text-[#A0988E] uppercase tracking-widest border-b border-[#E8E3DA]">
                              {['Product','Qty','Unit Price','Subtotal'].map(h=><th key={h} className={`pb-2 font-medium ${h==='Product'?'text-left':'text-right'}`}>{h}</th>)}
                            </tr></thead>
                            <tbody>{order.bm_order_items.map(item=>(
                              <tr key={item.id} className="border-b border-[#E8E3DA]/60 last:border-0">
                                <td className="py-2.5 text-[#1C1814] pr-4">{item.product_name}</td>
                                <td className="py-2.5 text-right text-[#6A6058]">{item.quantity}</td>
                                <td className="py-2.5 text-right text-[#6A6058]">${item.unit_price.toFixed(2)}</td>
                                <td className="py-2.5 text-right font-medium">${item.subtotal.toLocaleString(undefined,{minimumFractionDigits:2})}</td>
                              </tr>
                            ))}</tbody>
                          </table>
                        </div>
                      ):<p className="text-sm text-[#A0988E] mb-4">No items on record.</p>}
                      {order.notes&&<p className="text-xs text-[#6A6058] mb-4"><span className="font-semibold text-[#A0988E] uppercase tracking-wider">Notes: </span>{order.notes}</p>}
                      {order.status==='pending'&&<button onClick={()=>handleCancel(order.id)} className="text-xs text-red-600 hover:text-red-700 border border-red-200 hover:border-red-300 px-3 py-1.5 rounded-lg transition-colors">Cancel Order</button>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ── FAQ ── */}
        <section>
          <div className="mb-6"><h2 className="text-xl font-bold">Common Questions</h2><p className="text-sm text-[#A0988E] mt-1">Everything you need to know about ordering from Birdsmouth.</p></div>
          <div className="space-y-2">
            {FAQS.map((faq,i)=>(
              <div key={i} className="bg-white border border-[#E8E3DA] rounded-xl overflow-hidden">
                <button onClick={()=>setOpenFaq(openFaq===i?null:i)} className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-[#F7F4EF] transition-colors gap-4">
                  <span className="text-sm font-semibold">{faq.q}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`w-4 h-4 text-[#C0B8B0] shrink-0 transition-transform ${openFaq===i?'rotate-180':''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
                </button>
                {openFaq===i&&<div className="border-t border-[#E8E3DA] px-6 py-4 bg-[#FAFAF8]"><p className="text-sm text-[#6A6058] leading-relaxed">{faq.a}</p></div>}
              </div>
            ))}
          </div>
        </section>

        {/* ── New Release Radar ── */}
        <section>
          <div className="mb-6"><h2 className="text-xl font-bold">New Release Radar</h2><p className="text-sm text-[#A0988E] mt-1">Upcoming beers you can pre-order or get notified about before they drop.</p></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {NEW_RELEASES.map(r=>(
              <div key={r.id} className="bg-white border border-[#E8E3DA] rounded-2xl p-6 shadow-sm flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div><p className="text-[10px] font-semibold text-[#A0988E] uppercase tracking-widest">{r.style}</p><p className="text-lg font-bold mt-0.5">{r.name}</p></div>
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 ml-2 border ${r.status==='pre-order'?'bg-[#C8932A] text-white border-[#C8932A]':r.status==='coming-soon'?'bg-blue-50 text-blue-600 border-blue-200':'bg-[#F7F4EF] text-[#6A6058] border-[#E8E3DA]'}`}>{r.label}</span>
                </div>
                <p className="text-sm text-[#6A6058] leading-relaxed mb-5 flex-1">{r.description}</p>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-[#A0988E]">ETA: <span className="font-semibold text-[#6A6058]">{r.eta}</span></p>
                  <button onClick={()=>handlePreOrder(r.name,r.status)} className={`text-xs font-bold px-4 py-2 rounded-lg transition-colors ${r.status==='pre-order'?'bg-[#C8932A] text-white hover:bg-[#B5811E]':'border border-[#E8E3DA] text-[#6A6058] hover:border-[#C8932A] hover:text-[#C8932A]'}`}>{r.label}</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Toast */}
      {toast && <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#1C1814] text-white text-sm font-medium px-5 py-3 rounded-full shadow-lg whitespace-nowrap pointer-events-none">{toast}</div>}

      {/* ── Multi-step Order Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={()=>setShowModal(false)} aria-hidden="true" />
          <div className="relative bg-white border border-[#E8E3DA] rounded-2xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-xl">

            {/* Modal header + step indicator */}
            <div className="px-6 pt-5 pb-4 border-b border-[#E8E3DA] shrink-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-lg">
                  {orderStep===1 && 'Select Your Beer'}
                  {orderStep===2 && 'Choose Your Package'}
                  {orderStep===3 && 'Your Information'}
                  {orderStep==='success' && 'Order Requested!'}
                </h2>
                <button onClick={()=>setShowModal(false)} className="text-[#A0988E] hover:text-[#1C1814] text-2xl leading-none transition-colors" aria-label="Close">×</button>
              </div>

              {orderStep !== 'success' && (
                <div className="flex items-center gap-2">
                  {[1,2,3].map((s,idx)=>(
                    <div key={s} className="flex items-center gap-2 flex-1">
                      <div className={`flex items-center justify-center w-6 h-6 rounded-full text-[11px] font-bold shrink-0 transition-colors ${(orderStep as number)>=s?'bg-[#C8932A] text-white':'bg-[#F0EDE8] text-[#A0988E]'}`}>{s}</div>
                      <p className={`text-xs font-medium transition-colors ${(orderStep as number)>=s?'text-[#1C1814]':'text-[#C0B8B0]'}`}>{['Select Beer','Choose Package','Your Info'][idx]}</p>
                      {idx<2&&<div className={`flex-1 h-px transition-colors ${(orderStep as number)>s?'bg-[#C8932A]':'bg-[#E8E3DA]'}`}/>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal body */}
            <div className="flex-1 overflow-y-auto px-6 py-5">

              {/* Step 1: Select Beer */}
              {orderStep===1 && (
                <div className="space-y-3">
                  {BEERS.map(beer=>{
                    const sel=modalBeer===beer.id;
                    return (
                      <button key={beer.id} onClick={()=>setModalBeer(beer.id)} className={`w-full text-left border-2 rounded-2xl p-5 transition-all ${sel?'border-[#C8932A] bg-amber-50':'border-[#E8E3DA] bg-white hover:border-[#C0B8B0]'}`}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-[#A0988E] uppercase tracking-widest">{beer.style}</p>
                            <p className="text-base font-bold text-[#1C1814] mt-0.5">{beer.name}</p>
                            <p className="text-sm text-[#6A6058] leading-relaxed mt-1">{beer.description}</p>
                            <div className="flex items-center gap-1.5 mt-3">
                              <span className="w-2 h-2 rounded-full bg-green-400" />
                              <p className="text-xs text-[#A0988E]"><span className="font-semibold text-[#1C1814]">{beer.stock.toLocaleString()}</span> cases in stock</p>
                            </div>
                          </div>
                          {sel&&<span className="w-6 h-6 bg-[#C8932A] rounded-full flex items-center justify-center shrink-0 mt-1"><svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Step 2: Choose Package */}
              {orderStep===2 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {PACKAGES.map(pkg=>{
                    const sel=modalPkg===pkg.id;
                    return (
                      <button key={pkg.id} onClick={()=>setModalPkg(pkg.id)} className={`relative text-left border-2 rounded-2xl p-5 transition-all ${sel?'border-[#C8932A] bg-amber-50':pkg.tag==='Best Value'?'border-[#C8932A]/40 bg-white hover:border-[#C8932A]':'border-[#E8E3DA] bg-white hover:border-[#C0B8B0]'}`}>
                        {pkg.tag&&<span className={`absolute -top-3 left-4 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full ${pkg.tag==='Best Value'?'bg-[#C8932A] text-white':'bg-[#1C1814] text-white'}`}>{pkg.tag}</span>}
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="text-base font-bold text-[#1C1814]">{pkg.label}</p>
                            {!pkg.isCustom&&<p className="text-xs text-[#A0988E] mt-0.5">{pkg.cases} × 24-can cases</p>}
                            {pkg.isCustom&&<p className="text-xs text-[#A0988E] mt-0.5">156+ cases at $18/case</p>}
                            <p className="text-xl font-bold text-[#1C1814] mt-2">${pkg.unitPrice}<span className="text-xs font-normal text-[#A0988E] ml-1">/ case</span></p>
                            {!pkg.isCustom&&<p className="text-xs text-[#6A6058] mt-0.5">Total: <span className="font-semibold">${(pkg.cases*pkg.unitPrice).toLocaleString()}</span></p>}
                          </div>
                          {sel&&<span className="w-5 h-5 bg-[#C8932A] rounded-full flex items-center justify-center shrink-0"><svg className="w-3 h-3 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></span>}
                        </div>
                      </button>
                    );
                  })}
                  {modalPkgObj?.isCustom && (
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-[#A0988E] uppercase tracking-widest mb-1.5">Case Count (min 156)</label>
                      <input type="number" min={156} value={modalCustomCases} onChange={e=>setModalCustomCases(Math.max(156,parseInt(e.target.value)||156))} className={INPUT} />
                      <p className="text-xs text-[#6A6058] mt-1.5">Estimated total: <span className="font-semibold">${(modalCustomCases*18).toLocaleString()}</span></p>
                    </div>
                  )}
                </div>
              )}

              {/* Step 3: Contact info */}
              {orderStep===3 && (
                <div className="space-y-5">
                  {/* Order summary */}
                  <div className="bg-[#F7F4EF] rounded-xl px-4 py-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-[#A0988E] uppercase tracking-widest">Your Selection</p>
                      <p className="text-sm font-bold text-[#1C1814] mt-0.5">{BEERS.find(b=>b.id===modalBeer)?.name} · {modalPkgObj?.isCustom?`${modalCustomCases} cases`:modalPkgObj?.label}</p>
                    </div>
                    <p className="text-xl font-bold text-[#1C1814]">${modalTotal.toLocaleString()}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-[11px] font-semibold text-[#A0988E] uppercase tracking-widest mb-1.5">Name</label><input type="text" value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="Your name" className={INPUT} /></div>
                    <div><label className="block text-[11px] font-semibold text-[#A0988E] uppercase tracking-widest mb-1.5">Company</label><input type="text" value={contactCompany} onChange={e=>setContactCompany(e.target.value)} placeholder="Business name" className={INPUT} /></div>
                  </div>
                  <div><label className="block text-[11px] font-semibold text-[#A0988E] uppercase tracking-widest mb-1.5">Phone</label><input type="tel" value={contactPhone} onChange={e=>setContactPhone(e.target.value)} placeholder="+1 (555) 000-0000" className={INPUT} /></div>
                  <div><label className="block text-[11px] font-semibold text-[#A0988E] uppercase tracking-widest mb-1.5">Requested Delivery Date <span className="normal-case text-[#C0B8B0] font-normal">(optional)</span></label><input type="date" value={requestedDate} onChange={e=>setRequestedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className={INPUT} /></div>
                  <div><label className="block text-[11px] font-semibold text-[#A0988E] uppercase tracking-widest mb-1.5">Special Request <span className="normal-case text-[#C0B8B0] font-normal">(optional)</span></label><textarea value={specialRequest} onChange={e=>setSpecialRequest(e.target.value)} rows={3} placeholder="Delivery instructions, dock details, special requirements…" className={`${INPUT} resize-none`} /></div>
                  {submitError&&<p role="alert" className="text-red-600 text-sm">{submitError}</p>}
                </div>
              )}

              {/* Success */}
              {orderStep==='success' && (
                <div className="py-8 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p className="text-xl font-bold text-[#1C1814] mb-2">Request Received!</p>
                  <p className="text-sm text-[#6A6058] max-w-xs mx-auto leading-relaxed">The Birdsmouth team will confirm your order shortly. You can track it in the orders section below.</p>
                  <button onClick={()=>setShowModal(false)} className="mt-6 bg-[#C8932A] text-white font-bold px-8 py-2.5 rounded-xl text-sm hover:bg-[#B5811E] transition-colors">View My Orders</button>
                </div>
              )}
            </div>

            {/* Modal footer */}
            {orderStep!=='success' && (
              <div className="border-t border-[#E8E3DA] px-6 py-4 flex items-center justify-between shrink-0 bg-[#FAFAF8] rounded-b-2xl">
                {orderStep===1 ? (
                  <>
                    <div />
                    <button onClick={()=>{ if(!modalBeer)return; setOrderStep(2); }} disabled={!modalBeer} className="bg-[#C8932A] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#B5811E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
                  </>
                ) : orderStep===2 ? (
                  <>
                    <button onClick={()=>setOrderStep(1)} className="text-sm font-semibold text-[#6A6058] hover:text-[#1C1814] transition-colors">← Back</button>
                    <button onClick={()=>{ if(!modalPkg)return; setOrderStep(3); }} disabled={!modalPkg} className="bg-[#C8932A] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#B5811E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">Continue →</button>
                  </>
                ) : (
                  <>
                    <button onClick={()=>setOrderStep(2)} className="text-sm font-semibold text-[#6A6058] hover:text-[#1C1814] transition-colors">← Back</button>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-[10px] text-[#A0988E] uppercase tracking-widest">Total</p>
                        <p className="font-bold text-[#1C1814]">${modalTotal.toLocaleString(undefined,{minimumFractionDigits:2})}</p>
                      </div>
                      <button onClick={handlePlaceOrder} disabled={submitting} className="bg-[#C8932A] text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-[#B5811E] transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                        {submitting?'Submitting…':'Request your Order'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}

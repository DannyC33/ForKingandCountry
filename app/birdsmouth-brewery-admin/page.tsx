'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const LOGO = 'https://images.squarespace-cdn.com/content/v1/695c169d5083032f08c5e2a9/75282f5e-e2c5-44aa-ba01-e29c9262efe2/bird+logo+horz.png?format=1500w';

export default function BirdsmouthAdminLoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    if (authError) {
      setError('Invalid email or password.');
      setLoading(false);
    } else {
      router.push('/birdsmouth-brewery-admin/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#F2F4F7] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        <div className="flex justify-center mb-10">
          <Image src={LOGO} alt="Birdsmouth Brewery" width={220} height={60} className="object-contain brightness-0" priority />
        </div>

        <div className="bg-white border border-[#E2E6ED] rounded-2xl p-8 shadow-sm">
          <div className="mb-8">
            <p className="text-[11px] font-bold text-[#C8932A] uppercase tracking-widest mb-1">Admin Portal</p>
            <h1 className="text-xl font-bold text-[#1A1C20]">Sign in to manage your brewery</h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-[#7A828F] uppercase tracking-widest mb-2">Email</label>
              <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="admin@birdsmouthbeer.com"
                className="w-full bg-[#F7F9FC] border border-[#E2E6ED] rounded-lg px-4 py-3 text-[#1A1C20] text-sm placeholder-[#C0C8D0] focus:outline-none focus:border-[#C8932A] transition-colors" />
            </div>
            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-[#7A828F] uppercase tracking-widest mb-2">Password</label>
              <input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full bg-[#F7F9FC] border border-[#E2E6ED] rounded-lg px-4 py-3 text-[#1A1C20] text-sm focus:outline-none focus:border-[#C8932A] transition-colors" />
            </div>
            {error && <p role="alert" className="text-red-600 text-sm">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full bg-[#1A1C20] text-white font-bold py-3 rounded-lg text-sm hover:bg-[#2A2D34] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-[#A0A8B0] mt-6">
            Vendor portal?{' '}
            <a href="/birdsmouth-brewery" className="text-[#C8932A] hover:underline">Sign in here</a>
          </p>
        </div>

        <p className="text-center text-[11px] text-[#B0B8C0] mt-8">
          © {new Date().getFullYear()} Birdsmouth Brewery · Admin Portal
        </p>
      </div>
    </div>
  );
}

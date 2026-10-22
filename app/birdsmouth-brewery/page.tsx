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

export default function BirdsmouthLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Invalid email or password. Please try again.');
      setLoading(false);
    } else {
      router.push('/birdsmouth-brewery/orders');
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F4EF] flex items-center justify-center p-6">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="flex justify-center mb-10">
          <Image
            src={LOGO}
            alt="Birdsmouth Brewery"
            width={260}
            height={72}
            className="object-contain brightness-0"
            priority
          />
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E8E3DA] rounded-2xl p-8 shadow-sm">
          <h1 className="text-xl font-semibold text-[#1C1814] mb-1">Vendor Portal</h1>
          <p className="text-sm text-[#8A8078] mb-8">Sign in to place and manage your orders.</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-[11px] font-semibold text-[#8A8078] uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="vendor@example.com"
                className="w-full bg-[#F7F4EF] border border-[#E8E3DA] rounded-lg px-4 py-3 text-[#1C1814] text-sm placeholder-[#C0B8B0] focus:outline-none focus:border-[#C8932A] transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[11px] font-semibold text-[#8A8078] uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-[#F7F4EF] border border-[#E8E3DA] rounded-lg px-4 py-3 text-[#1C1814] text-sm focus:outline-none focus:border-[#C8932A] transition-colors"
              />
            </div>

            {error && (
              <p role="alert" className="text-red-600 text-sm">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C8932A] text-white font-bold py-3 rounded-lg text-sm hover:bg-[#B5811E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-xs text-[#A0988E] mt-6 leading-relaxed">
            Need access?{' '}
            <a href="mailto:info@birdsmouthbeer.com" className="text-[#C8932A] hover:underline">
              Contact Birdsmouth
            </a>
          </p>
        </div>

        <p className="text-center text-[11px] text-[#C0B8B0] mt-8">
          © {new Date().getFullYear()} Birdsmouth Brewery · Vendor Portal
        </p>
      </div>
    </div>
  );
}

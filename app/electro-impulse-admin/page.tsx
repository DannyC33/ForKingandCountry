'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ADMIN_PASS = 'EIL2024';

export default function EILAdminLogin() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASS) {
      try { localStorage.setItem('eil_admin_auth', '1'); } catch {}
      router.push('/electro-impulse-admin/dashboard');
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#1B3A6B] flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 justify-center mb-10">
          <div className="w-10 h-10 bg-[#C8291C] rounded-sm flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div>
            <p className="text-white font-black text-lg leading-tight">ELECTRO IMPULSE</p>
            <p className="text-blue-300 text-[10px] tracking-widest uppercase">Sales Admin Portal</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-2xl">
          <h1 className="text-lg font-black text-[#1B3A6B] mb-1">Sales Team Login</h1>
          <p className="text-xs text-[#718096] mb-6">Enter your admin password to view leads.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-[#718096] mb-1.5">Admin Password</label>
              <input
                type="password" value={password} onChange={e => { setPassword(e.target.value); setError(false); }}
                required placeholder="••••••••"
                className="w-full border border-[#CBD5E0] rounded-md px-3 py-2.5 text-sm text-[#1A202C] focus:outline-none focus:border-[#1B3A6B] transition-colors"
              />
              {error && <p className="text-red-600 text-xs mt-1">Incorrect password.</p>}
            </div>
            <button type="submit" className="w-full bg-[#1B3A6B] hover:bg-[#152E58] text-white font-bold py-3 rounded-lg text-sm transition-colors">
              Sign In
            </button>
          </form>
        </div>

        <p className="text-center text-[11px] text-blue-400 mt-6">
          Electro Impulse Laboratory, Inc. · Neptune, NJ · For internal use only
        </p>
      </div>
    </div>
  );
}

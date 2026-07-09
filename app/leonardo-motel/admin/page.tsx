'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/leonardo/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Invalid password');
        return;
      }
      router.push('/admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #0f1e36 0%, #1e3565 100%)', fontFamily: 'system-ui, sans-serif' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo area */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-[#c8960c] flex items-center justify-center mx-auto mb-4 shadow-xl">
            <span className="text-white font-bold text-2xl">L</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight">Leonardo Motel</h1>
          <p className="text-white/40 text-sm mt-1">Staff portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[#1e3565] rounded-2xl p-8 shadow-2xl space-y-5"
          aria-label="Admin sign in"
        >
          <div>
            <label htmlFor="admin-password" className="block text-white/70 text-sm font-medium mb-2">
              Admin Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Enter password"
              required
              autoComplete="current-password"
              className="w-full bg-[#0f1e36] border border-white/10 text-white placeholder-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#c8960c]"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-400 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            aria-busy={loading}
            className="w-full bg-[#c8960c] hover:bg-[#b07c08] text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-6">
          Leonardo Motel · Belmar, NJ
        </p>
      </div>
    </div>
  );
}

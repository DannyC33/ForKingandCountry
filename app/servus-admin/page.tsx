'use client';
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

export default function ServusAdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/servus/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? 'Invalid credentials');
        return;
      }
      router.push('/servus-admin/dashboard');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Image src="/LogoV1.png" alt="Servus logo" width={48} height={48} className="object-contain" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Servus</span>
          </div>
          <p className="text-gray-500 text-sm">Admin portal</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 space-y-5"
          aria-label="Admin sign in"
        >
          <div>
            <label htmlFor="admin-username" className="block text-gray-700 text-sm font-medium mb-1.5">
              Username
            </label>
            <input
              id="admin-username"
              type="text"
              value={username}
              onChange={e => { setUsername(e.target.value); setError(''); }}
              placeholder="Username"
              required
              autoComplete="username"
              className="w-full border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-gray-700 text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(''); }}
              placeholder="Password"
              required
              autoComplete="current-password"
              className="w-full border border-gray-200 text-gray-900 placeholder-gray-400 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>

          {error && (
            <p role="alert" className="text-red-500 text-sm">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !username || !password}
            aria-busy={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-gray-400 text-xs mt-6">
          Servus · Lord Light the Way
        </p>
      </div>
    </div>
  );
}

'use client';

import { useActionState, useState } from 'react';
import { login, signup, loginWithMagicLink } from '@/app/login/actions';

type Mode = 'login' | 'signup' | 'magic';
type FormState = { error: string | null };
type MagicState = { error: string | null; sent: boolean };

const initialState: FormState = { error: null };
const magicInitial: MagicState = { error: null, sent: false };

export function LoginForm() {
  const [mode, setMode] = useState<Mode>('login');
  const [loginState, loginAction, loginPending] = useActionState<FormState, FormData>(login, initialState);
  const [signupState, signupAction, signupPending] = useActionState<FormState, FormData>(signup, initialState);
  const [magicState, magicAction, magicPending] = useActionState<MagicState, FormData>(loginWithMagicLink, magicInitial);

  if (magicState.sent) {
    return (
      <div className="text-center space-y-2">
        <div className="text-4xl">📬</div>
        <p className="font-medium text-gray-900">Check your email</p>
        <p className="text-sm text-gray-500">We sent you a miracle link. Click it to sign in.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-brand-500 hover:underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (signupState && !signupState.error && mode === 'signup') {
    return (
      <div className="text-center space-y-2">
        <div className="text-4xl">✉️</div>
        <p className="font-medium text-gray-900">Confirm your email</p>
        <p className="text-sm text-gray-500">Check your inbox to verify your account.</p>
      </div>
    );
  }

  const error =
    mode === 'login'
      ? loginState?.error
      : mode === 'signup'
        ? signupState?.error
        : magicState?.error;

  const isPending = loginPending || signupPending || magicPending;

  return (
    <div className="space-y-5">
      {/* Mode tabs */}
      <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
        {(['login', 'signup', 'magic'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 text-sm py-1.5 rounded-md transition-colors font-medium ${
              mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {m === 'login' ? 'Sign In' : m === 'signup' ? 'Sign Up' : 'Miracle Link'}
          </button>
        ))}
      </div>

      {mode === 'magic' ? (
        <form action={magicAction} className="space-y-4">
          <div>
            <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="magic-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isPending ? 'Sending…' : 'Send Miracle Link'}
          </button>
        </form>
      ) : (
        <form action={mode === 'login' ? loginAction : signupAction} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isPending
              ? mode === 'login'
                ? 'Signing in…'
                : 'Creating account…'
              : mode === 'login'
                ? 'Sign In'
                : 'Create Account'}
          </button>
        </form>
      )}
    </div>
  );
}

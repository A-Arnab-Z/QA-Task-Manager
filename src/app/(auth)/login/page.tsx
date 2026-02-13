'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/auth-provider';

export default function LoginPage() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      if (isSignup) await signupWithEmail(name, email, password);
      else await loginWithEmail(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <main className="min-h-screen grid place-items-center p-6">
      <form onSubmit={submit} className="w-full max-w-md rounded border bg-card p-6 space-y-4">
        <h1 className="text-2xl font-semibold">QC TaskMaster</h1>
        {isSignup && <input className="w-full border rounded p-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />}
        <input className="w-full border rounded p-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded p-2" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button className="w-full rounded bg-black text-white dark:bg-white dark:text-black p-2">{isSignup ? 'Create account' : 'Log in'}</button>
        <button type="button" onClick={() => loginWithGoogle().then(() => router.push('/dashboard'))} className="w-full rounded border p-2">Continue with Google</button>
        <button type="button" className="text-sm underline" onClick={() => setIsSignup(!isSignup)}>
          {isSignup ? 'Already have an account?' : 'Need an account?'}
        </button>
      </form>
    </main>
  );
}

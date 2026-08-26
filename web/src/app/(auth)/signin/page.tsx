'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignIn } from '@/features/auth/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SignInPage() {
  const signIn = useSignIn();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={e => {
          e.preventDefault();
          signIn.mutate({ email, password });
        }}
      >
        <h1 className="text-3xl font-extrabold text-text-primary">Welcome back</h1>
        <p className="mb-3 text-sm text-text-secondary">Sign in to track your training</p>

        <Input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={signIn.isPending} className="mt-2">
          {signIn.isPending ? 'Signing in…' : 'Sign In'}
        </Button>

        <Link href="/forgot-password" className="text-center text-sm text-text-secondary hover:text-accent">
          Forgot password?
        </Link>
        <Link href="/signup" className="text-center text-sm text-text-secondary">
          Don&apos;t have an account? <span className="font-bold text-accent">Sign up</span>
        </Link>
      </form>
    </div>
  );
}

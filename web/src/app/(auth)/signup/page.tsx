'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSignUp } from '@/features/auth/hooks/useAuth';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function SignUpPage() {
  const signUp = useSignUp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={e => {
          e.preventDefault();
          signUp.mutate({ email, password });
        }}
      >
        <h1 className="text-3xl font-extrabold text-text-primary">Start your journey</h1>
        <p className="mb-3 text-sm text-text-secondary">Create an account to track your training</p>

        <Input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <Input
          type="password"
          autoComplete="new-password"
          placeholder="Password (min. 8 characters)"
          value={password}
          onChange={e => setPassword(e.target.value)}
        />

        <Button type="submit" disabled={signUp.isPending} className="mt-2">
          {signUp.isPending ? 'Creating account…' : 'Sign Up'}
        </Button>

        <Link href="/signin" className="text-center text-sm text-text-secondary">
          Already have an account? <span className="font-bold text-accent">Sign in</span>
        </Link>
      </form>
    </div>
  );
}

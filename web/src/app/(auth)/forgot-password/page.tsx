'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/apiClient';
import { showToast } from '@/lib/toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');

  const forgotPassword = useMutation({
    mutationFn: (email: string) => apiClient.post('/auth/forgot-password', { email }),
    onError: error => showToast(getApiErrorMessage(error, 'Could not send a reset code'), 'error'),
  });

  const handleSend = async () => {
    try {
      await forgotPassword.mutateAsync(email);
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch {
      // toast already shown by the mutation itself
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <h1 className="text-3xl font-extrabold text-text-primary">Forgot password?</h1>
        <p className="mb-3 text-sm text-text-secondary">
          Enter your email and we&apos;ll send you a code to reset it.
        </p>

        <Input
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <Button type="submit" disabled={forgotPassword.isPending || !email} className="mt-2">
          {forgotPassword.isPending ? 'Sending…' : 'Send Reset Code'}
        </Button>
      </form>
    </div>
  );
}

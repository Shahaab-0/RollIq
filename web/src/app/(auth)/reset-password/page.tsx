'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { apiClient, getApiErrorMessage } from '@/lib/apiClient';
import { showToast } from '@/lib/toast';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState(searchParams.get('email') ?? '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const resetPassword = useMutation({
    mutationFn: () => apiClient.post('/auth/reset-password', { email, code, new_password: newPassword }),
    onSuccess: () => {
      showToast('Password reset — sign in with your new password', 'success');
      router.push('/signin');
    },
    onError: error => showToast(getApiErrorMessage(error, 'Could not reset password'), 'error'),
  });

  const canSubmit = email && code && newPassword.length >= 8;

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
      onSubmit={e => {
        e.preventDefault();
        resetPassword.mutate();
      }}
    >
      <h1 className="text-3xl font-extrabold text-text-primary">Enter your code</h1>
      <p className="mb-3 text-sm text-text-secondary">
        Check your email for a 6-digit code, then set a new password below.
      </p>

      <Input
        type="email"
        autoComplete="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
      />
      <Input
        inputMode="numeric"
        maxLength={6}
        placeholder="6-digit code"
        value={code}
        onChange={e => setCode(e.target.value)}
      />
      <Input
        type="password"
        autoComplete="new-password"
        placeholder="New password (min. 8 characters)"
        value={newPassword}
        onChange={e => setNewPassword(e.target.value)}
      />

      <Button type="submit" disabled={!canSubmit || resetPassword.isPending} className="mt-2">
        {resetPassword.isPending ? 'Resetting…' : 'Reset Password'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}

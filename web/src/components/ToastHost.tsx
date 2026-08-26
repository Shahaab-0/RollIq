'use client';

import { useEffect, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { subscribeToast, type ToastEvent } from '@/lib/toast';

const AUTO_DISMISS_MS = 3500;

export default function ToastHost() {
  const [toasts, setToasts] = useState<ToastEvent[]>([]);

  useEffect(() => {
    return subscribeToast(event => {
      setToasts(prev => [...prev, event]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== event.id));
      }, AUTO_DISMISS_MS);
    });
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${
            toast.variant === 'success' ? 'bg-success' : 'bg-danger'
          }`}
        >
          {toast.variant === 'success' ? (
            <CheckCircle2 size={18} />
          ) : (
            <XCircle size={18} />
          )}
          {toast.message}
        </div>
      ))}
    </div>
  );
}

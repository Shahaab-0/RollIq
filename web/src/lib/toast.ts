// Same module-level pub-sub as the mobile app's lib/toast.ts -- callable
// from outside the component tree (React Query's global onSuccess) without
// needing a context provider higher up than whatever mounts <ToastHost />.
export type ToastVariant = 'success' | 'error';

export interface ToastEvent {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Listener = (event: ToastEvent) => void;

let listener: Listener | null = null;
let nextId = 1;

export function subscribeToast(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function showToast(message: string, variant: ToastVariant = 'success'): void {
  listener?.({ id: nextId++, message, variant });
}

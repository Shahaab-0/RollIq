export type ToastVariant = 'success' | 'error';

export interface ToastEvent {
  id: number;
  message: string;
  variant: ToastVariant;
}

type Listener = (event: ToastEvent) => void;

// Module-level pub-sub rather than React context: showToast needs to be
// callable from outside the component tree too (the QueryClient's global
// MutationCache callbacks, configured in App.tsx before any component mounts).
let listener: Listener | null = null;
let nextId = 1;

export function subscribeToast(fn: Listener): () => void {
  listener = fn;
  return () => {
    if (listener === fn) listener = null;
  };
}

export function showToast(
  message: string,
  variant: ToastVariant = 'success',
): void {
  listener?.({ id: nextId++, message, variant });
}

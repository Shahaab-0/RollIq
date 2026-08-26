'use client';

import { useState } from 'react';
import { MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { showToast } from '@/lib/toast';
import type { MutationMeta } from '@/types/reactQuery';

// Same split as the mobile app: success toasts are global (a mutation opts
// in via meta.toastSuccess), error toasts are explicit per-mutation (see
// each feature's hooks/use<Domain>.ts) so the message is specific and
// discoverable next to the mutation it describes.
export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        mutationCache: new MutationCache({
          onSuccess: (_data, _variables, _context, mutation) => {
            const meta = mutation.meta as MutationMeta | undefined;
            if (meta?.toastSuccess) showToast(meta.toastSuccess, 'success');
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 30_000,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

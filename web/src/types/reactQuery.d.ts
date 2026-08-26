export interface MutationMeta {
  // Shown automatically by the global MutationCache handler in
  // QueryProvider.tsx. Errors are handled per-mutation instead (an
  // explicit onError on each useMutation call) rather than through meta.
  toastSuccess?: string;
}

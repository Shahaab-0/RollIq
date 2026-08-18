export interface MutationMeta {
  // Shown automatically by the global MutationCache handler in App.tsx.
  // Errors are handled per-mutation instead (an explicit onError on each
  // useMutation call) rather than through meta -- see useSessions.ts etc.
  toastSuccess?: string;
}

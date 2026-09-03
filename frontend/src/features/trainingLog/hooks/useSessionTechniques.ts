import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as sessionsApi from '../../../api/sessions';
import { showToast } from '../../../lib/toast';
import { getApiErrorMessage } from '../../../lib/apiError';

export function useSessionTechniques(sessionId: string | undefined) {
  return useQuery({
    queryKey: ['sessions', sessionId, 'techniques'],
    queryFn: () => sessionsApi.getSessionTechniques(sessionId as string),
    enabled: !!sessionId,
  });
}

export function useReplaceSessionTechniques() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      sessionId,
      techniqueIds,
    }: {
      sessionId: string;
      techniqueIds: string[];
    }) => sessionsApi.replaceSessionTechniques(sessionId, techniqueIds),
    onSuccess: (_data, { sessionId }) => {
      queryClient.invalidateQueries({
        queryKey: ['sessions', sessionId, 'techniques'],
      });
    },
    // No success toast -- useCreateSession/useUpdateSession already show one,
    // and this always runs right after those. Failure still gets its own
    // distinct message since the session itself did save.
    onError: error =>
      showToast(
        getApiErrorMessage(
          error,
          'Session saved, but techniques could not be linked',
        ),
        'error',
      ),
  });
}

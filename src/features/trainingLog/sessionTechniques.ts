import { supabase } from '../../lib/supabase';

export async function fetchTechniqueIdsForSession(
  sessionId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('session_techniques')
    .select('technique_id')
    .eq('session_id', sessionId);
  if (error) throw error;
  return (data ?? []).map(row => row.technique_id as string);
}

// Replaces the full set of techniques linked to a session (simpler and
// just as cheap as diffing, since this only ever runs on form save).
export async function saveSessionTechniques(
  sessionId: string,
  techniqueIds: string[],
  userId: string,
): Promise<void> {
  const { error: deleteError } = await supabase
    .from('session_techniques')
    .delete()
    .eq('session_id', sessionId);
  if (deleteError) throw deleteError;

  if (techniqueIds.length === 0) return;

  const { error: insertError } = await supabase.from('session_techniques').insert(
    techniqueIds.map(technique_id => ({
      session_id: sessionId,
      technique_id,
      user_id: userId,
    })),
  );
  if (insertError) throw insertError;
}

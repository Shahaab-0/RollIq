export type MatchResult = 'win' | 'loss' | 'draw';

export const RESULT_OPTIONS: { value: MatchResult; label: string }[] = [
  { value: 'win', label: 'Win' },
  { value: 'loss', label: 'Loss' },
  { value: 'draw', label: 'Draw' },
];

export interface Competition {
  id: string;
  name: string;
  competition_date: string;
  weight_category: string;
  belt_division: string | null;
  location: string | null;
  notes: string | null;
  match_count: number;
  wins: number;
  losses: number;
  draws: number;
}

export type NewCompetition = Omit<
  Competition,
  'id' | 'match_count' | 'wins' | 'losses' | 'draws'
>;

export interface CompetitionMatch {
  id: string;
  competition_id: string;
  opponent_name: string;
  result: MatchResult;
  method: string | null;
  match_order: number;
  notes: string | null;
}

export type NewCompetitionMatch = Omit<CompetitionMatch, 'id' | 'competition_id'>;

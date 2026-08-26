export interface Roll {
  id: string;
  session_id: string | null;
  partner_name: string | null;
  submissions_landed: string[];
  submissions_received: string[];
  escapes: number;
  effort_rating: number | null;
  notes: string | null;
  created_at: string;
}

export type NewRoll = Omit<Roll, 'id' | 'created_at'>;

export interface PartnerHistoryEntry {
  partner_name: string;
  roll_count: number;
  landed_total: number;
  received_total: number;
}

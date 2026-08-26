export type Severity = 'mild' | 'moderate' | 'severe';

export const SEVERITY_OPTIONS: { value: Severity; label: string }[] = [
  { value: 'mild', label: 'Mild' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

export type InjuryStatus = 'active' | 'recovering' | 'resolved';

export const STATUS_OPTIONS: { value: InjuryStatus; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'recovering', label: 'Recovering' },
  { value: 'resolved', label: 'Resolved' },
];

export interface Injury {
  id: string;
  body_part: string;
  description: string;
  injury_date: string;
  severity: Severity;
  status: InjuryStatus;
  notes: string | null;
}

export type NewInjury = Omit<Injury, 'id'>;

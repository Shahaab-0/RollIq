const MONTH_ABBR = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// "10 Dec 2025" — spelled out manually rather than via toLocaleDateString
// so the format is fixed and consistent regardless of device locale.
export function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return `${date.getDate()} ${MONTH_ABBR[date.getMonth()]} ${date.getFullYear()}`;
}

// "YYYY-MM-DD" in the device's local timezone (not UTC, unlike
// toISOString) — the canonical string form used for date-only columns.
export function toLocalDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate(),
  ).padStart(2, '0')}`;
}

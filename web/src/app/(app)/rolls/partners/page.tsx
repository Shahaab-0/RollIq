'use client';

import Link from 'next/link';
import { ChevronLeft, Users } from 'lucide-react';
import { usePartnerHistory } from '@/features/rolls/hooks/useRolls';
import type { PartnerHistoryEntry } from '@/features/rolls/types';
import EmptyState from '@/components/EmptyState';

function tapRateLabel(entry: PartnerHistoryEntry): string {
  const total = entry.landed_total + entry.received_total;
  if (total === 0) return 'Even';
  const landedShare = Math.round((entry.landed_total / total) * 100);
  return `${landedShare}% you`;
}

export default function PartnerHistoryPage() {
  const { data: partners = [], isLoading } = usePartnerHistory();

  return (
    <div className="flex w-full max-w-5xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <Link href="/rolls" className="text-text-secondary hover:text-text-primary">
          <ChevronLeft size={22} />
        </Link>
        <h1 className="text-2xl font-extrabold tracking-tight text-text-primary">Partner History</h1>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading…</p>
      ) : partners.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No partners yet"
          description="Log a roll with a partner's name to start building your history against them."
        />
      ) : (
        <div className="flex flex-col gap-2.5">
          {partners.map(entry => (
            <div
              key={entry.partner_name}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4"
            >
              <div>
                <p className="text-sm font-semibold text-text-primary">{entry.partner_name}</p>
                <p className="text-xs text-text-secondary">
                  {entry.roll_count} roll{entry.roll_count === 1 ? '' : 's'} · {entry.landed_total} landed ·{' '}
                  {entry.received_total} received
                </p>
              </div>
              <span className="text-xs font-bold text-accent">{tapRateLabel(entry)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

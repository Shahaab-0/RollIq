'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { useBeltPromotions, useCreatePromotion, useDeletePromotion } from '../hooks/useBeltPromotions';
import { formatDisplayDate, toLocalDateString } from '@/lib/dateFormat';
import { BELT_COLOR_VAR, BELT_OPTIONS, type Belt } from '../types';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Chip from '@/components/ui/Chip';

interface Props {
  onPromotionAdded: (belt: Belt) => void;
}

// Self-contained: owns its own fetch, its own "add promotion" form state,
// and dispatches directly -- the parent Profile form only needs to know
// when a promotion was added, so it can sync its belt/stripes fields.
export default function BeltHistorySection({ onPromotionAdded }: Readonly<Props>) {
  const { data: promotions = [] } = useBeltPromotions();
  const createPromotion = useCreatePromotion();
  const deletePromotion = useDeletePromotion();

  const [showAddPromotion, setShowAddPromotion] = useState(false);
  const [newPromotionBelt, setNewPromotionBelt] = useState<Belt>('white');
  const [newPromotionDate, setNewPromotionDate] = useState(toLocalDateString(new Date()));

  const handleAddPromotion = async () => {
    try {
      await createPromotion.mutateAsync({ belt: newPromotionBelt, promoted_on: newPromotionDate, notes: null });
      setShowAddPromotion(false);
      onPromotionAdded(newPromotionBelt);
    } catch {
      // toast already shown by the mutation itself
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="mt-3 flex items-center justify-between">
        <label className="text-xs font-semibold text-text-secondary">Belt history</label>
        <button
          type="button"
          onClick={() => setShowAddPromotion(v => !v)}
          className="rounded-lg border border-accent p-2 text-accent transition hover:bg-accent-muted"
        >
          <Plus size={16} strokeWidth={2.5} />
        </button>
      </div>

      {promotions.length === 0 ? (
        <p className="text-xs text-text-secondary">No promotions logged yet.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {[...promotions].reverse().map(promotion => (
            <Card key={promotion.id} className="flex items-center justify-between p-3">
              <div>
                <p className="text-sm font-semibold text-text-primary">
                  {BELT_OPTIONS.find(o => o.value === promotion.belt)?.label ?? promotion.belt} Belt
                  {promotion.stripes > 0 ? ` · Stripe ${promotion.stripes}` : ''}
                </p>
                <p className="text-xs text-text-secondary">{formatDisplayDate(promotion.promoted_on)}</p>
              </div>
              <button
                onClick={() => deletePromotion.mutate(promotion.id)}
                aria-label="Delete this belt promotion"
                className="rounded-lg border border-danger p-2 text-danger transition hover:bg-danger/10"
              >
                <Trash2 size={16} />
              </button>
            </Card>
          ))}
        </div>
      )}

      {showAddPromotion ? (
        <div className="mt-1 flex flex-col gap-3 rounded-2xl border border-border bg-surface-alt p-4">
          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">New belt</label>
            <div className="flex flex-wrap gap-2">
              {BELT_OPTIONS.map(option => (
                <Chip
                  key={option.value}
                  active={newPromotionBelt === option.value}
                  activeColor={BELT_COLOR_VAR[option.value]}
                  onClick={() => setNewPromotionBelt(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-text-secondary">Date</label>
            <Input
              type="date"
              max={toLocalDateString(new Date())}
              value={newPromotionDate}
              onChange={e => setNewPromotionDate(e.target.value)}
            />
          </div>

          <Button onClick={handleAddPromotion}>Log Promotion</Button>
        </div>
      ) : null}
    </div>
  );
}

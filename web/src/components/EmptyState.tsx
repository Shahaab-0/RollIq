import { LucideIcon } from 'lucide-react';
import Button from './ui/Button';

interface Props {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon: Icon, title, description, actionLabel, onAction }: Readonly<Props>) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 px-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-muted">
        <Icon className="text-accent" size={30} strokeWidth={2} />
      </div>
      <h3 className="text-lg font-bold text-text-primary">{title}</h3>
      <p className="max-w-sm text-sm text-text-secondary">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-2" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

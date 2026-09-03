import { ButtonHTMLAttributes } from 'react';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
  activeColor?: string;
}

export default function Chip({ active, activeColor, className = '', style, ...props }: Readonly<Props>) {
  return (
    <button
      type="button"
      className={`rounded-full border px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
        active
          ? 'border-transparent text-accent-text'
          : 'border-transparent bg-accent-muted text-text-secondary hover:text-text-primary'
      } ${className}`}
      style={active ? { backgroundColor: activeColor ?? 'var(--color-accent)', ...style } : style}
      {...props}
    />
  );
}

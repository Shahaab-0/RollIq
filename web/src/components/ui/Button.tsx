import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-accent text-accent-text hover:opacity-90',
  secondary: 'border border-accent text-accent hover:bg-accent-muted',
  danger: 'border border-danger text-danger hover:bg-danger/10',
};

export default function Button({ variant = 'primary', className = '', disabled, ...props }: Readonly<Props>) {
  return (
    <button
      disabled={disabled}
      className={`rounded-xl px-4 py-3 text-sm font-bold transition disabled:opacity-60 disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

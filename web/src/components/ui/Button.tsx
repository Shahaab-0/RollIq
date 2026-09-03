import { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'secondary' | 'danger';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const VARIANT_CLASSES: Record<Variant, string> = {
  primary: 'bg-accent text-accent-text shadow-sm hover:opacity-90 hover:shadow-md',
  secondary: 'border border-accent text-accent hover:bg-accent-muted',
  danger: 'border border-danger text-danger hover:bg-danger/10',
};

export default function Button({ variant = 'primary', className = '', disabled, ...props }: Readonly<Props>) {
  return (
    <button
      disabled={disabled}
      style={{ touchAction: 'manipulation' }}
      className={`rounded-xl px-4 py-3 text-sm font-bold uppercase tracking-wide transition duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none active:scale-[0.98] ${VARIANT_CLASSES[variant]} ${className}`}
      {...props}
    />
  );
}

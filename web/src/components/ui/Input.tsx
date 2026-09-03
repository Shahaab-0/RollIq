import { InputHTMLAttributes } from 'react';

export default function Input({ className = '', ...props }: Readonly<InputHTMLAttributes<HTMLInputElement>>) {
  return (
    <input
      className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary transition placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${className}`}
      {...props}
    />
  );
}

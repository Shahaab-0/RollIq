import { HTMLAttributes } from 'react';

export default function Card({ className = '', ...props }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={`rounded-2xl border border-border bg-surface p-5 shadow-sm ${className}`}
      {...props}
    />
  );
}

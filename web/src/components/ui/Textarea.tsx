import { TextareaHTMLAttributes } from 'react';

export default function Textarea({
  className = '',
  ...props
}: Readonly<TextareaHTMLAttributes<HTMLTextAreaElement>>) {
  return (
    <textarea
      className={`w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text-primary transition placeholder:text-text-secondary focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 ${className}`}
      {...props}
    />
  );
}

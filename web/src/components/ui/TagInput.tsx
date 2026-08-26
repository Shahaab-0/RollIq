'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface Props {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
}

export default function TagInput({ values, onChange, placeholder }: Readonly<Props>) {
  const [draft, setDraft] = useState('');

  const commit = () => {
    const trimmed = draft.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
    }
    setDraft('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2">
      {values.map(value => (
        <span
          key={value}
          className="flex items-center gap-1 rounded-full bg-accent-muted px-2.5 py-1 text-xs font-semibold text-accent"
        >
          {value}
          <button type="button" onClick={() => onChange(values.filter(v => v !== value))}>
            <X size={12} />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            commit();
          }
        }}
        onBlur={commit}
        placeholder={values.length === 0 ? placeholder : undefined}
        className="min-w-[8rem] flex-1 bg-transparent py-1 text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
      />
    </div>
  );
}

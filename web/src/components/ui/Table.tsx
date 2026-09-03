import type { HTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from 'react';

export function Table({ children, className = '' }: Readonly<{ children: React.ReactNode; className?: string }>) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className={`w-full border-collapse text-sm ${className}`}>{children}</table>
    </div>
  );
}

export function Thead({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <thead className="border-b border-border text-left text-xs font-semibold uppercase tracking-wide text-text-secondary">
      {children}
    </thead>
  );
}

export function Tbody({ children }: Readonly<{ children: React.ReactNode }>) {
  return <tbody className="divide-y divide-border">{children}</tbody>;
}

export function Tr({
  children,
  onClick,
  className = '',
}: Readonly<{ children: React.ReactNode; onClick?: () => void; className?: string }>) {
  return (
    <tr
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? 'button' : undefined}
      onKeyDown={
        onClick
          ? e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
      className={`group transition-colors ${
        onClick
          ? 'cursor-pointer hover:bg-surface-alt focus-visible:outline-none focus-visible:bg-surface-alt focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent'
          : ''
      } ${className}`}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className = '', ...props }: Readonly<ThHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <th className={`px-4 py-2.5 font-semibold ${className}`} {...props}>
      {children}
    </th>
  );
}

export function Td({ children, className = '', ...props }: Readonly<TdHTMLAttributes<HTMLTableCellElement>>) {
  return (
    <td className={`px-4 py-3 text-text-primary ${className}`} {...props}>
      {children}
    </td>
  );
}

// Wrap a row's action icons in this -- always visible below lg (touch
// devices have no hover state, so a hover-only reveal would make these
// unreachable), and hover-revealed at lg+ so a dense desktop table doesn't
// read as a wall of always-on icon buttons.
export function TableRowActions({ children }: Readonly<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className="flex justify-end gap-2 opacity-100 transition-opacity lg:opacity-0 lg:group-hover:opacity-100">
      {children}
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

// Panel chrome only -- deliberately does not own a title/header row so the
// wrapped Form component's own <h1> (every SessionForm/TechniqueForm/etc.
// already renders one) becomes the visual title with zero changes to those
// components. Closes via backdrop click or Escape, both going through
// router.back() since these are still real routes (see the @modal
// intercepting-route pattern) -- direct URL nav bypasses this entirely.
export default function SlideOver({ children }: Readonly<{ children: React.ReactNode }>) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Flips true one tick after mount so the backdrop/panel transition from
  // their initial (hidden) state instead of rendering already-open --
  // there's no way to animate "in" from the first paint otherwise.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setMounted(true);
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [router]);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close"
        onClick={() => router.back()}
        className={`absolute inset-0 bg-black/40 transition-opacity duration-200 ${
          mounted ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <div
        style={{ overscrollBehavior: 'contain' }}
        className={`relative flex h-full w-full max-w-[460px] flex-col overflow-y-auto bg-surface p-6 shadow-xl transition-transform duration-200 ${
          mounted ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={() => router.back()}
          className="absolute right-5 top-6 rounded-lg p-1.5 text-text-secondary hover:bg-surface-alt hover:text-text-primary"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

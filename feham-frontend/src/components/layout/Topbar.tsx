'use client';

import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';

export function Topbar() {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="flex h-14 items-center justify-between border-b border-neutral-200 bg-white px-6">
      <nav className="text-sm text-neutral-600">
        {segments.map((s, i) => (
          <span key={s}>
            {i > 0 && ' / '}
            <span className="capitalize">{s}</span>
          </span>
        ))}
      </nav>
      <button type="button" className="relative rounded-lg p-2 hover:bg-neutral-100">
        <Bell className="h-5 w-5 text-neutral-600" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      </button>
    </header>
  );
}



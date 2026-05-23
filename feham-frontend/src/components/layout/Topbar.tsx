'use client';

import { usePathname } from 'next/navigation';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Topbar({ onMenuClick }: { onMenuClick?: () => void }) {
  const pathname = usePathname();
  const segments = pathname.split('/').filter(Boolean);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-3 border-b border-neutral-200 bg-white/95 px-3 backdrop-blur sm:px-4 lg:px-6">
      <div className="flex min-w-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="lg:hidden"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
      <nav className="min-w-0 truncate text-sm text-neutral-600">
        {segments.map((s, i) => (
          <span key={s}>
            {i > 0 && ' / '}
            <span className="capitalize">{s}</span>
          </span>
        ))}
      </nav>
      </div>
      <button type="button" className="relative rounded-lg p-2 hover:bg-neutral-100">
        <Bell className="h-5 w-5 text-neutral-600" />
        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
      </button>
    </header>
  );
}



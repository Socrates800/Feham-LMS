'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    if (!token || !user) {
      router.replace('/login');
    }
  }, [token, user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-neutral-50 lg:flex">
      <Sidebar className="hidden lg:flex" />
      <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <SheetContent side="left" className="w-[18rem] max-w-[86vw] p-0" showCloseButton={false}>
          <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
          <Sidebar onNavigate={() => setMobileNavOpen(false)} />
        </SheetContent>
      </Sheet>
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main className="min-w-0 flex-1 overflow-x-hidden p-3 sm:p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}



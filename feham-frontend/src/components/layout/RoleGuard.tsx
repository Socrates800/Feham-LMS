'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';

const roleHome: Record<UserRole, string> = {
  super_admin: '/super-admin',
  admin: '/admin',
  teacher: '/teacher',
  parent: '/parent',
};

function allowedPrefix(role: UserRole, pathname: string, isImpersonating: boolean): boolean {
  if (isImpersonating) {
    return pathname.startsWith('/admin');
  }
  switch (role) {
    case 'super_admin':
      return pathname.startsWith('/super-admin');
    case 'admin':
      return pathname.startsWith('/admin');
    case 'teacher':
      return pathname.startsWith('/teacher');
    case 'parent':
      return pathname.startsWith('/parent');
    default:
      return false;
  }
}

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isImpersonating } = useAuthStore();

  useEffect(() => {
    if (!user) return;
    if (!allowedPrefix(user.role, pathname, isImpersonating)) {
      router.replace(roleHome[user.role]);
    }
  }, [user, pathname, isImpersonating, router]);

  if (!user) return null;
  if (!allowedPrefix(user.role, pathname, isImpersonating)) return null;

  return <>{children}</>;
}

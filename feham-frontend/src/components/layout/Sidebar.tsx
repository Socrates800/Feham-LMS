'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Building2,
  Calendar,
  ClipboardCheck,
  CreditCard,
  FileText,
  GitBranch,
  GraduationCap,
  Home,
  Layers,
  LogOut,
  Receipt,
  Settings,
  Users,
  Wallet,
} from 'lucide-react';
import { laravelStorageUrl } from '@/lib/laravel-url';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { UserRole } from '@/types';
import { Button } from '@/components/ui/button';

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  separatedBefore?: boolean;
};

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

const navByRole: Record<UserRole, NavItem[]> = {
  super_admin: [
    { href: '/super-admin', label: 'Platform Dashboard', icon: Home },
    { href: '/super-admin/organizations', label: 'Organizations', icon: Building2 },
    { href: '/super-admin/billing', label: 'Billing', icon: CreditCard },
    { href: '/super-admin/reports', label: 'Reports', icon: BarChart3 },
  ],
  admin: [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/structure', label: 'School Hierarchy', icon: GitBranch },
    { href: '/admin/classes', label: 'Classes & Sections', icon: Layers },
    { href: '/admin/students', label: 'Students', icon: GraduationCap },
    { href: '/admin/teachers', label: 'Teachers', icon: Users },
    { href: '/admin/timetable', label: 'Timetable', icon: Calendar },
    { href: '/admin/leave-requests', label: 'Leave Requests', icon: FileText },
    { href: '/admin/fees', label: 'Fee Management', icon: Receipt },
    { href: '/admin/salaries', label: 'Salaries', icon: Wallet },
    { href: '/admin/school', label: 'School Settings', icon: Settings },
  ],
  teacher: [
    { href: '/teacher', label: 'Dashboard', icon: Home },
    { href: '/teacher/schedule', label: 'My Schedule', icon: Calendar },
    { href: '/teacher/attendance', label: 'Attendance', icon: ClipboardCheck },
    { href: '/teacher/homework', label: 'Homework', icon: Receipt },
    { href: '/teacher/remarks', label: 'Remarks', icon: Users },
    {
      href: '/teacher/leave-requests',
      label: 'My Leave Request',
      icon: FileText,
      separatedBefore: true,
    },
  ],
  parent: [
    { href: '/parent', label: 'My Children', icon: Home },
    { href: '/parent/challans', label: 'Fee Challans', icon: Receipt },
    { href: '/parent/homework', label: 'Homework', icon: Calendar },
    { href: '/parent/remarks', label: 'Remarks', icon: Users },
  ],
};

function isNavItemActive(pathname: string, href: string, allHrefs: string[]) {
  const matches =
    pathname === href || (href !== '/' && pathname.startsWith(`${href}/`));
  if (!matches) return false;

  const hasMoreSpecificMatch = allHrefs.some(
    (other) =>
      other !== href &&
      other.length > href.length &&
      other.startsWith(`${href}/`) &&
      (pathname === other || pathname.startsWith(`${other}/`))
  );

  return !hasMoreSpecificMatch;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const { user, school, clearAuth, isImpersonating } = useAuthStore();
  const items = user ? navByRole[user.role] : [];
  const hrefs = items.map((item) => item.href);

  const isPlatform = user?.role === 'super_admin' && !isImpersonating;
  const logoUrl = laravelStorageUrl(school?.logo_path);

  return (
    <aside className={cn('flex h-full w-72 max-w-full flex-col border-r border-neutral-200 bg-white lg:h-screen lg:w-60', className)}>
      <div className="border-b border-neutral-200 p-4">
        <div className="flex items-center gap-3">
          {logoUrl && !isPlatform ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              <Image src={logoUrl} alt={school?.name ?? 'School'} width={40} height={40} className="h-full w-full object-contain" unoptimized />
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-sm font-bold text-white">
              F
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-indigo-700">
              {isPlatform ? 'Feham Platform' : school?.name ?? 'Feham'}
            </p>
            <p className="text-xs text-neutral-500 capitalize">
              {isPlatform ? 'Super Admin' : user?.role?.replace('_', ' ')}
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {items.map(({ href, label, icon: Icon, separatedBefore }) => {
          const active = isNavItemActive(pathname, href, hrefs);
          return (
            <div key={href} className={separatedBefore ? 'mt-3 border-t border-neutral-200 pt-3' : undefined}>
              <Link
                href={href}
                onClick={onNavigate}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                  active
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            </div>
          );
        })}
      </nav>
      <div className="border-t border-neutral-200 p-3">
        <p className="truncate text-sm font-medium">{user?.name}</p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 w-full justify-start"
          onClick={() => {
            onNavigate?.();
            clearAuth();
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}



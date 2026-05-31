'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';

export function ImpersonationBanner() {
  const router = useRouter();
  const { isImpersonating, school, exitImpersonation } = useAuthStore();

  if (!isImpersonating) return null;

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-3 py-2 sm:px-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-amber-900">
          Impersonating <span className="font-semibold">{school?.name ?? 'school admin'}</span> workspace
        </p>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="border-amber-300 bg-white hover:bg-amber-100"
          onClick={() => {
            exitImpersonation();
            router.push('/super-admin');
          }}
        >
          Exit to platform admin
        </Button>
      </div>
    </div>
  );
}

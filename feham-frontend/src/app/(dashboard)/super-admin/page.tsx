'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { Building2, GraduationCap, Receipt, Users, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { PlatformDashboardData } from '@/types';

export default function SuperAdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-dashboard'],
    queryFn: () => api.get<PlatformDashboardData>('/super-admin/dashboard').then((r) => r.data),
  });

  if (isLoading || !data) {
    return <p className="text-neutral-600">Loading platform dashboard...</p>;
  }

  const { stats, billing_summary, recent_schools } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Platform Dashboard"
        description="Manage all schools and organizations on Feham"
      >
        <Link href="/super-admin/organizations" className={cn(buttonVariants(), 'bg-indigo-600 hover:bg-indigo-700')}>
          Manage organizations
        </Link>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Organizations" value={stats.total_schools} icon={Building2} />
        <StatCard title="Active schools" value={stats.active_schools} icon={Building2} />
        <StatCard title="Total students" value={stats.total_students} icon={GraduationCap} />
        <StatCard
          title="Monthly revenue"
          value={`PKR ${Number(stats.monthly_revenue).toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Teachers" value={stats.total_teachers} icon={Users} />
        <StatCard title="Platform users" value={stats.total_users} icon={Users} />
        <StatCard title="Trial schools" value={stats.trial_schools} icon={Receipt} />
        <StatCard title="Paid schools" value={stats.paid_schools} icon={Receipt} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Billing overview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {Object.entries(billing_summary).map(([status, count]) => (
              <Badge key={status} variant="secondary" className="capitalize">
                {status}: {count}
              </Badge>
            ))}
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent organizations</CardTitle>
            <Link href="/super-admin/organizations" className="text-sm text-indigo-600 hover:underline">
              View all
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recent_schools.length === 0 ? (
              <p className="text-sm text-neutral-500">No organizations yet.</p>
            ) : (
              recent_schools.map((org) => (
                <Link
                  key={org.id}
                  href={`/super-admin/organizations/${org.id}`}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{org.name}</p>
                    <p className="text-xs text-neutral-500">
                      {org.students_count ?? 0} students · {org.plan ?? 'starter'}
                    </p>
                  </div>
                  <Badge variant={org.is_active ? 'outline' : 'secondary'}>
                    {org.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Link>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

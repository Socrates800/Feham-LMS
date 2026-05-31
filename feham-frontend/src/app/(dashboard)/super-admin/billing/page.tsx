'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { unwrapList } from '@/lib/api-helpers';
import type { School } from '@/types';

export default function SuperAdminBillingPage() {
  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['super-admin-billing'],
    queryFn: () => api.get('/super-admin/organizations').then((r) => unwrapList<School>(r.data)),
  });

  const byBilling = organizations.reduce<Record<string, School[]>>((acc, org) => {
    const key = org.billing_status ?? 'trial';
    if (!acc[key]) acc[key] = [];
    acc[key].push(org);
    return acc;
  }, {});

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Billing & Subscriptions"
        description="Review plans, billing status, and subscription limits across organizations"
      />

      {isLoading ? (
        <p className="text-neutral-600">Loading billing data...</p>
      ) : (
        <div className="space-y-6">
          {Object.entries(byBilling).map(([status, orgs]) => (
            <Card key={status} className="border-neutral-200">
              <CardContent className="p-0">
                <div className="border-b border-neutral-200 px-4 py-3">
                  <Badge variant="secondary" className="capitalize">
                    {status} ({orgs.length})
                  </Badge>
                </div>
                <Table className="min-w-[720px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Organization</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Student limit</TableHead>
                      <TableHead>Renewal</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgs.map((org) => (
                      <TableRow key={org.id}>
                        <TableCell className="font-medium">{org.name}</TableCell>
                        <TableCell className="capitalize">{org.plan}</TableCell>
                        <TableCell>{org.student_limit ?? '—'}</TableCell>
                        <TableCell>
                          {org.subscription_ends_at
                            ? String(org.subscription_ends_at).slice(0, 10)
                            : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link
                            href={`/super-admin/organizations/${org.id}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            Manage
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

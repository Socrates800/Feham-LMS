'use client';

import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import type { PlatformReportsData, School } from '@/types';

export default function SuperAdminReportsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-reports'],
    queryFn: () => api.get<PlatformReportsData>('/super-admin/reports').then((r) => r.data),
  });

  if (isLoading || !data) {
    return <p className="text-neutral-600">Loading reports...</p>;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Platform Reports" description="Cross-organization usage and revenue insights" />

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle>Plans breakdown</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {Object.entries(data.plans_breakdown).map(([plan, count]) => (
            <span key={plan} className="rounded-full bg-neutral-100 px-3 py-1 text-sm capitalize">
              {plan}: {count}
            </span>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Top schools by students</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Plan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top_schools_by_students.map((school: School & { students_count?: number }) => (
                  <TableRow key={school.id}>
                    <TableCell className="font-medium">{school.name}</TableCell>
                    <TableCell>{school.students_count ?? 0}</TableCell>
                    <TableCell className="capitalize">{school.plan}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Top schools by revenue (this month)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.top_schools_by_revenue.map((row) => (
                  <TableRow key={row.school_id}>
                    <TableCell className="font-medium">{row.school_name}</TableCell>
                    <TableCell className="text-right">
                      PKR {Number(row.revenue).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

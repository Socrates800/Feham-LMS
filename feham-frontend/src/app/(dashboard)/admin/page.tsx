'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Receipt, Users, Wallet } from 'lucide-react';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
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
import type { Challan, DashboardStats } from '@/types';

interface DashboardData {
  stats: DashboardStats;
  recent_challans: Challan[];
  timetable_today: Array<{
    subject: string;
    day: string;
    section?: { name: string; school_class?: { name: string } };
    period?: { name: string; start_time: string };
  }>;
}

export default function AdminDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: () => api.get<DashboardData>('/admin/dashboard').then((r) => r.data),
  });

  if (isLoading || !data) {
    return <p className="text-neutral-600">Loading dashboard...</p>;
  }

  const { stats, recent_challans, timetable_today } = data;

  const challanStatusClass = (status: Challan['status']) =>
    status === 'paid'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
      : status === 'overdue'
        ? 'border-red-200 bg-red-50 text-red-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600">Overview of your school</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Students" value={stats.students} icon={GraduationCap} />
        <StatCard title="Total Teachers" value={stats.teachers} icon={Users} />
        <StatCard
          title="Challans This Month"
          value={`${stats.challans_paid}/${stats.challans_total}`}
          icon={Receipt}
        />
        <StatCard
          title="Monthly Revenue"
          value={`PKR ${Number(stats.monthly_revenue).toLocaleString()}`}
          icon={Wallet}
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/students" className={cn(buttonVariants({ variant: 'outline' }))}>
          + Add Student
        </Link>
        <Link href="/admin/teachers" className={cn(buttonVariants({ variant: 'outline' }))}>
          + Add Teacher
        </Link>
        <Link
          href="/admin/fees"
          className={cn(buttonVariants(), 'bg-indigo-600 text-white hover:bg-indigo-700')}
        >
          Generate Challans
        </Link>
        <Link href="/admin/timetable" className={cn(buttonVariants({ variant: 'outline' }))}>
          View Timetable
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Recent Challans</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent_challans.slice(0, 5).map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>{c.student?.name}</TableCell>
                    <TableCell>PKR {c.total_amount}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium capitalize',
                          challanStatusClass(c.status)
                        )}
                      >
                        {c.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Today&apos;s Timetable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {timetable_today.length === 0 ? (
              <p className="text-sm text-neutral-500">No entries scheduled for today.</p>
            ) : (
              timetable_today.map((t, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 p-3"
                >
                  <div>
                    <p className="font-medium">{t.subject}</p>
                    <p className="text-sm text-neutral-600">
                      {t.section?.school_class?.name}-{t.section?.name}
                    </p>
                  </div>
                  <p className="text-sm text-neutral-500">{t.period?.name}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}



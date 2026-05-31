'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Calendar, ClipboardList, MessageSquare, Users } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StatCard } from '@/components/dashboard/StatCard';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { periodLabel, sectionLabel } from '@/lib/teacher-display';
import { cn } from '@/lib/utils';
import type { TeacherDashboardData, TeacherHomework, TeacherRemark, TimetableEntry } from '@/types';

function EmptyHint({ message, href, linkLabel }: { message: string; href: string; linkLabel: string }) {
  return (
    <p className="text-sm text-neutral-500">
      {message}{' '}
      <Link href={href} className="font-medium text-indigo-600 hover:underline">
        {linkLabel}
      </Link>
    </p>
  );
}

export default function TeacherDashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => api.get<TeacherDashboardData>('/teacher/dashboard').then((r) => r.data),
  });

  if (isLoading || !data) {
    return <p className="text-neutral-600">Loading dashboard...</p>;
  }

  const { stats, schedule, homework, remarks } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Teacher Dashboard" description="Your classes, homework, and parent remarks at a glance">
        <Link href="/teacher/homework" className={cn(buttonVariants({ variant: 'outline' }), 'justify-center')}>
          Add homework
        </Link>
        <Link href="/teacher/remarks" className={cn(buttonVariants(), 'justify-center bg-indigo-600 hover:bg-indigo-700')}>
          Add remark
        </Link>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Today's periods" value={stats.today_periods} icon={Calendar} />
        <StatCard title="Weekly classes" value={stats.weekly_periods} icon={BookOpen} />
        <StatCard title="My students" value={stats.students} icon={Users} />
        <StatCard title="Upcoming homework" value={stats.homework_upcoming} icon={ClipboardList} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <StatCard title="Assigned sections" value={stats.assigned_sections} icon={BookOpen} />
        <StatCard title="Remarks (unread)" value={`${stats.remarks_unread} / ${stats.remarks_total}`} icon={MessageSquare} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Today&apos;s schedule</CardTitle>
            <Link href="/teacher/schedule" className="text-sm text-indigo-600 hover:underline">
              Full week
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {schedule.length === 0 ? (
              <EmptyHint
                message="No classes scheduled for today."
                href="/teacher/schedule"
                linkLabel="View weekly timetable"
              />
            ) : (
              schedule.map((item: TimetableEntry) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 p-3">
                  <p className="font-medium">{item.subject}</p>
                  <p className="text-sm text-neutral-600">{sectionLabel(item)}</p>
                  <p className="mt-1 text-xs text-neutral-500">{periodLabel(item)}</p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent homework</CardTitle>
            <Link href="/teacher/homework" className="text-sm text-indigo-600 hover:underline">
              Manage
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {homework.length === 0 ? (
              <EmptyHint message="No homework posted yet." href="/teacher/homework" linkLabel="Create homework" />
            ) : (
              homework.map((item: TeacherHomework) => (
                <div key={item.id} className="rounded-lg border border-neutral-200 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{item.subject}</p>
                    <Badge variant="secondary" className="shrink-0 text-xs">
                      Due {String(item.due_date).slice(0, 10)}
                    </Badge>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{item.description}</p>
                  <p className="mt-1 text-xs text-neutral-500">
                    {item.section?.school_class?.name}-{item.section?.name}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-neutral-200">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent remarks to parents</CardTitle>
          <Link href="/teacher/remarks" className="text-sm text-indigo-600 hover:underline">
            View all
          </Link>
        </CardHeader>
        <CardContent className="space-y-3">
          {remarks.length === 0 ? (
            <EmptyHint message="No remarks sent yet." href="/teacher/remarks" linkLabel="Send a remark" />
          ) : (
            remarks.map((item: TeacherRemark) => (
              <div key={item.id} className="flex flex-col gap-2 rounded-lg border border-neutral-200 p-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{item.student?.name ?? 'Student'}</p>
                  <p className="text-sm text-neutral-600">{item.message}</p>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 capitalize',
                    item.is_read
                      ? 'border-neutral-200 text-neutral-600'
                      : 'border-amber-200 bg-amber-50 text-amber-700'
                  )}
                >
                  {item.is_read ? 'Read by parent' : 'Unread'}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

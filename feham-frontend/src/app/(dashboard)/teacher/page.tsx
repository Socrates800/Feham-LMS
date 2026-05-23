'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TeacherDashboardPage() {
  const { data } = useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => api.get('/teacher/dashboard').then((r) => r.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold sm:text-2xl">Teacher Dashboard</h1>
      <Card>
        <CardHeader>
          <CardTitle>Today&apos;s Schedule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(data?.schedule ?? []).map((item: { id: number; subject: string; period?: { name: string } }) => (
            <div key={item.id} className="rounded-lg border p-3">
              <p className="font-medium">{item.subject}</p>
              <p className="text-sm text-neutral-600">{item.period?.name}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}


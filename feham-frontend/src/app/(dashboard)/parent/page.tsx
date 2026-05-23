'use client';

import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ParentPortalPage() {
  const { data } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => api.get<{ data: Student[] }>('/parent/children').then((r) => r.data.data ?? r.data),
  });

  const children = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">My Children</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {children.map((child) => (
          <Card key={child.id}>
            <CardHeader>
              <CardTitle>{child.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-neutral-600">
              {child.section?.school_class?.name} — Section {child.section?.name}
              <br />
              Roll: {child.roll_number}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}


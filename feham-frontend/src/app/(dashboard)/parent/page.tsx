'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import api from '@/lib/api';
import type { Student } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { buttonVariants } from '@/components/ui/button';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { cn } from '@/lib/utils';

export default function ParentPortalPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => api.get<{ data: Student[] }>('/parent/children').then((r) => r.data.data ?? r.data),
  });

  const children = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Parent Portal"
        description="Track your children, fee challans, homework, and teacher remarks"
      />

      {isLoading ? (
        <p className="text-neutral-600">Loading children...</p>
      ) : children.length === 0 ? (
        <Card className="border-neutral-200">
          <CardContent className="p-6 text-sm text-neutral-600">
            No students are linked to this parent login yet. Ask the school admin to assign a
            parent portal account from the student profile.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {children.map((child) => (
            <Card key={child.id} className="border-neutral-200">
            <CardHeader>
              <div className="flex items-start justify-between gap-3">
                <CardTitle>{child.name}</CardTitle>
                <Badge variant="secondary">{child.roll_number}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-neutral-600">
              <p>
                {child.section?.school_class?.name} - Section {child.section?.name}
              </p>
              <div className="flex flex-wrap gap-2">
                <Link className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))} href="/parent/challans">
                  Fee challans
                </Link>
                <Link className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))} href="/parent/homework">
                  Homework
                </Link>
                <Link className={cn(buttonVariants({ size: 'sm', variant: 'outline' }))} href="/parent/remarks">
                  Remarks
                </Link>
              </div>
            </CardContent>
          </Card>
          ))}
        </div>
      )}
    </div>
  );
}


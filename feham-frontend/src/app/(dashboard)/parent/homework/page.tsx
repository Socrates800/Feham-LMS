'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { unwrapList } from '@/lib/api-helpers';
import type { Student, TeacherHomework } from '@/types';

export default function ParentHomeworkPage() {
  const [studentId, setStudentId] = useState('');

  const { data: children = [] } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => api.get('/parent/children').then((r) => unwrapList<Student>(r.data)),
  });

  const selectedStudentId = useMemo(() => {
    return studentId || (children[0]?.id ? String(children[0].id) : '');
  }, [children, studentId]);

  const { data: homework = [], isLoading } = useQuery({
    queryKey: ['parent-homework', selectedStudentId],
    queryFn: () =>
      api
        .get(`/parent/children/${selectedStudentId}/homework`)
        .then((r) => unwrapList<TeacherHomework>(r.data)),
    enabled: Boolean(selectedStudentId),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Homework" description="Assignments shared by your child's teachers" />

      {children.length > 1 ? (
        <select
          className="w-full max-w-sm rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
          value={selectedStudentId}
          onChange={(event) => setStudentId(event.target.value)}
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} ({child.roll_number})
            </option>
          ))}
        </select>
      ) : null}

      {!selectedStudentId ? (
        <EmptyState text="No students are linked to this parent login yet." />
      ) : isLoading ? (
        <p className="text-neutral-600">Loading homework...</p>
      ) : homework.length === 0 ? (
        <EmptyState text="No homework has been posted for this class yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {homework.map((item) => (
            <Card key={item.id} className="border-neutral-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{item.subject}</CardTitle>
                  <Badge variant="secondary">Due {String(item.due_date).slice(0, 10)}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-neutral-600">
                <p>{item.description}</p>
                <p className="text-xs text-neutral-500">
                  {item.section?.school_class?.name}-{item.section?.name}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <Card className="border-neutral-200">
      <CardContent className="flex flex-col items-center gap-3 p-8 text-center text-sm text-neutral-600">
        <Calendar className="h-10 w-10 text-neutral-300" />
        <p>{text}</p>
      </CardContent>
    </Card>
  );
}

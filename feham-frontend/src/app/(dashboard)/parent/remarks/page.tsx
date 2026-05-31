'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import api from '@/lib/api';
import { unwrapList } from '@/lib/api-helpers';
import type { ParentRemark, Student } from '@/types';

export default function ParentRemarksPage() {
  const qc = useQueryClient();
  const [studentId, setStudentId] = useState('');

  const { data: children = [] } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => api.get('/parent/children').then((r) => unwrapList<Student>(r.data)),
  });

  const selectedStudentId = useMemo(() => {
    return studentId || (children[0]?.id ? String(children[0].id) : '');
  }, [children, studentId]);

  const { data: remarks = [], isLoading } = useQuery({
    queryKey: ['parent-remarks', selectedStudentId],
    queryFn: () =>
      api
        .get(`/parent/children/${selectedStudentId}/remarks`)
        .then((r) => unwrapList<ParentRemark>(r.data)),
    enabled: Boolean(selectedStudentId),
  });

  const markRead = useMutation({
    mutationFn: (id: number) => api.put(`/parent/remarks/${id}/read`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['parent-remarks', selectedStudentId] });
      toast.success('Remark marked as read');
    },
    onError: () => toast.error('Could not update remark'),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Remarks" description="Messages from teachers about your child's progress" />

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
        <p className="text-neutral-600">Loading remarks...</p>
      ) : remarks.length === 0 ? (
        <EmptyState text="No teacher remarks have been sent yet." />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {remarks.map((remark) => (
            <Card key={remark.id} className="border-neutral-200">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">
                    {remark.teacher?.user?.name ?? 'Teacher'}
                  </CardTitle>
                  <Badge variant={remark.is_read ? 'secondary' : 'outline'}>
                    {remark.is_read ? 'Read' : 'Unread'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-neutral-600">
                <p>{remark.message}</p>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-neutral-500">
                    {remark.created_at ? String(remark.created_at).slice(0, 10) : ''}
                  </span>
                  {!remark.is_read ? (
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={markRead.isPending}
                      onClick={() => markRead.mutate(remark.id)}
                    >
                      Mark read
                    </Button>
                  ) : null}
                </div>
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
        <MessageSquare className="h-10 w-10 text-neutral-300" />
        <p>{text}</p>
      </CardContent>
    </Card>
  );
}

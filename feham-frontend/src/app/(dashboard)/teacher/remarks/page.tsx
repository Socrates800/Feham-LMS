'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { cn } from '@/lib/utils';
import type { TeacherContext, TeacherRemark } from '@/types';

export default function TeacherRemarksPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [studentId, setStudentId] = useState('');
  const [message, setMessage] = useState('');

  const { data: context } = useQuery({
    queryKey: ['teacher-context'],
    queryFn: () => api.get<TeacherContext>('/teacher/context').then((r) => r.data),
  });

  const { data: remarks = [], isLoading } = useQuery({
    queryKey: ['teacher-remarks'],
    queryFn: () => api.get('/teacher/remarks').then((r) => unwrapList<TeacherRemark>(r.data)),
  });

  const create = useMutation({
    mutationFn: () =>
      api.post('/teacher/remarks', {
        student_id: Number(studentId),
        message,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-remarks'] });
      qc.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setOpen(false);
      setMessage('');
      toast.success('Remark sent to parent');
    },
    onError: () => toast.error('Could not send remark'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/teacher/remarks/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-remarks'] });
      qc.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      toast.success('Remark deleted');
    },
    onError: () => toast.error('Could not delete remark'),
  });

  const openCreate = () => {
    setStudentId(context?.students[0]?.id ? String(context.students[0].id) : '');
    setMessage('');
    setOpen(true);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Remarks" description="Send messages to parents about student progress">
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          onClick={openCreate}
          disabled={!context?.students.length}
        >
          <Plus className="mr-2 h-4 w-4" />
          New remark
        </Button>
      </PageHeader>

      {!context?.students.length ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            No students are linked to your classes yet. Ask admin to assign you as class teacher or add
            timetable slots for your sections.
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading remarks...</p>
          ) : remarks.length === 0 ? (
            <p className="p-6 text-neutral-600">No remarks yet. Send feedback to a parent.</p>
          ) : (
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {remarks.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.student?.name ?? '—'}</TableCell>
                    <TableCell>
                      {item.student?.section?.school_class?.name}-{item.student?.section?.name}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{item.message}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={cn(
                          'capitalize',
                          item.is_read
                            ? 'border-neutral-200 text-neutral-600'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        )}
                      >
                        {item.is_read ? 'Read' : 'Unread'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => {
                          if (confirm('Delete this remark?')) remove.mutate(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>New remark</DialogTitle>
            <DialogDescription>This message will appear in the parent portal.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Student</Label>
              <select
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
              >
                <option value="">Select student</option>
                {context?.students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Message</Label>
              <textarea
                className="mt-1 min-h-[120px] w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                placeholder="e.g. Please ensure regular attendance and homework completion."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={create.isPending || !studentId || !message.trim()}
              onClick={() => create.mutate()}
            >
              Send remark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

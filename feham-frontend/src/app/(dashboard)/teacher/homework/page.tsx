'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import { Input } from '@/components/ui/input';
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
import type { TeacherContext, TeacherHomework } from '@/types';

const emptyForm = {
  section_id: '',
  subject: '',
  description: '',
  due_date: '',
};

export default function TeacherHomeworkPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherHomework | null>(null);
  const [form, setForm] = useState(emptyForm);

  const { data: context } = useQuery({
    queryKey: ['teacher-context'],
    queryFn: () => api.get<TeacherContext>('/teacher/context').then((r) => r.data),
  });

  const { data: homework = [], isLoading } = useQuery({
    queryKey: ['teacher-homework'],
    queryFn: () => api.get('/teacher/homework').then((r) => unwrapList<TeacherHomework>(r.data)),
  });

  const subjects = useMemo(() => {
    const fromContext = context?.subjects ?? [];
    if (fromContext.length) return fromContext;
    return ['Mathematics', 'English', 'Science', 'Urdu', 'Islamiat'];
  }, [context]);

  const openCreate = () => {
    setEditing(null);
    setForm({
      ...emptyForm,
      section_id: context?.sections[0]?.id ? String(context.sections[0].id) : '',
      subject: subjects[0] ?? '',
      due_date: new Date().toISOString().slice(0, 10),
    });
    setOpen(true);
  };

  const openEdit = (item: TeacherHomework) => {
    setEditing(item);
    setForm({
      section_id: item.section?.id ? String(item.section.id) : '',
      subject: item.subject,
      description: item.description,
      due_date: String(item.due_date).slice(0, 10),
    });
    setOpen(true);
  };

  const save = useMutation({
    mutationFn: () => {
      const payload = {
        section_id: Number(form.section_id),
        subject: form.subject,
        description: form.description,
        due_date: form.due_date,
      };
      if (editing) return api.put(`/teacher/homework/${editing.id}`, payload);
      return api.post('/teacher/homework', payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-homework'] });
      qc.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      setOpen(false);
      toast.success(editing ? 'Homework updated' : 'Homework created');
    },
    onError: () => toast.error('Could not save homework'),
  });

  const remove = useMutation({
    mutationFn: (id: number) => api.delete(`/teacher/homework/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-homework'] });
      qc.invalidateQueries({ queryKey: ['teacher-dashboard'] });
      toast.success('Homework deleted');
    },
    onError: () => toast.error('Could not delete homework'),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Homework" description="Assign and manage homework for your classes">
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={openCreate} disabled={!context?.sections.length}>
          <Plus className="mr-2 h-4 w-4" />
          Add homework
        </Button>
      </PageHeader>

      {!context?.sections.length ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            You need at least one assigned class or timetable slot before posting homework. Contact
            your admin to assign you as class teacher or add you to the timetable.
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading homework...</p>
          ) : homework.length === 0 ? (
            <p className="p-6 text-neutral-600">No homework yet. Create your first assignment.</p>
          ) : (
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Due</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {homework.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <p className="font-medium">{item.subject}</p>
                      <p className="line-clamp-1 text-xs text-neutral-500">{item.description}</p>
                    </TableCell>
                    <TableCell>
                      {item.section?.school_class?.name}-{item.section?.name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{String(item.due_date).slice(0, 10)}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button type="button" variant="ghost" size="icon-sm" onClick={() => openEdit(item)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm('Delete this homework?')) remove.mutate(item.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit homework' : 'Add homework'}</DialogTitle>
            <DialogDescription>Parents will see this in the parent portal for that class.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>Section</Label>
              <select
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={form.section_id}
                onChange={(e) => setForm({ ...form, section_id: e.target.value })}
              >
                <option value="">Select section</option>
                {context?.sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Subject</Label>
              <Input
                list="subjects"
                className="mt-1"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <datalist id="subjects">
                {subjects.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
            <div>
              <Label>Description</Label>
              <textarea
                className="mt-1 min-h-[100px] w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <Label>Due date</Label>
              <Input
                type="date"
                className="mt-1"
                value={form.due_date}
                onChange={(e) => setForm({ ...form, due_date: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={save.isPending || !form.section_id || !form.subject || !form.description || !form.due_date}
              onClick={() => save.mutate()}
            >
              {editing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { TeacherForm, type TeacherFormValues } from '@/components/forms/TeacherForm';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import type { SectionOption, Teacher } from '@/types';

function unwrapList<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && 'data' in data && Array.isArray((data as { data: T[] }).data)) {
    return (data as { data: T[] }).data;
  }
  return [];
}

export default function TeachersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<Teacher | null>(null);

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/admin/teachers').then((r) => unwrapList<Teacher>(r.data)),
  });

  const { data: sections = [] } = useQuery({
    queryKey: ['sections'],
    queryFn: () => api.get('/admin/sections').then((r) => unwrapList<SectionOption>(r.data)),
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return teachers;
    return teachers.filter(
      (t) =>
        t.user?.name?.toLowerCase().includes(q) ||
        t.employee_code?.toLowerCase().includes(q) ||
        t.subject_specialization?.toLowerCase().includes(q)
    );
  }, [teachers, search]);

  const saveTeacher = useMutation({
    mutationFn: async ({ values, id }: { values: TeacherFormValues; id?: number }) => {
      const payload = {
        name: values.name,
        email: values.email || undefined,
        password: values.password || undefined,
        phone: values.phone || null,
        cnic: values.cnic || null,
        subject_specialization: values.subject_specialization || null,
        base_salary: values.base_salary ? Number(values.base_salary) : 0,
        joining_date: values.joining_date || null,
        employee_code: values.employee_code || null,
        section_ids: values.section_ids,
      };
      if (id) {
        const { email, password, ...updatePayload } = payload;
        void email;
        void password;
        return api.put(`/admin/teachers/${id}`, updatePayload);
      }
      return api.post('/admin/teachers', payload);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['teachers'] });
      qc.invalidateQueries({ queryKey: ['sections'] });
      setSheetOpen(false);
      setEditing(null);
      toast.success(variables.id ? 'Teacher updated' : 'Teacher added');
    },
    onError: () => toast.error('Could not save teacher'),
  });

  const deleteTeacher = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/teachers/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teachers'] });
      qc.invalidateQueries({ queryKey: ['sections'] });
      toast.success('Teacher removed');
    },
    onError: () => toast.error('Could not delete teacher'),
  });

  const openAdd = () => {
    setEditing(null);
    setSheetOpen(true);
  };

  const openEdit = (t: Teacher) => {
    setEditing(t);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Teachers"
        description="Manage staff, subjects, and class teacher assignments"
      >
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add teacher
        </Button>
      </PageHeader>

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 border-b border-neutral-200 p-4">
            <Search className="h-4 w-4 text-neutral-400" />
            <Input
              placeholder="Search by name, code, or subject…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm border-0 shadow-none focus-visible:ring-0"
            />
          </div>
          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading teachers…</p>
          ) : filtered.length === 0 ? (
            <p className="p-6 text-neutral-600">No teachers found.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Class sections</TableHead>
                  <TableHead>Salary</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.user?.name}</TableCell>
                    <TableCell>{t.employee_code ?? '—'}</TableCell>
                    <TableCell>{t.subject_specialization ?? '—'}</TableCell>
                    <TableCell>
                      {t.assigned_sections?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {t.assigned_sections.map((s) => (
                            <Badge key={s.id} variant="secondary" className="text-xs">
                              {s.school_class?.name}-{s.name}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <span className="text-neutral-400">Not assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {t.base_salary != null
                        ? `PKR ${Number(t.base_salary).toLocaleString()}`
                        : '—'}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(t)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm(`Remove ${t.user?.name}?`)) {
                              deleteTeacher.mutate(t.id);
                            }
                          }}
                          aria-label="Delete"
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

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>{editing ? 'Edit teacher' : 'Add teacher'}</SheetTitle>
            <SheetDescription>
              {editing
                ? 'Update details and class section assignments.'
                : 'Create a teacher account and assign homeroom sections.'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <TeacherForm
              key={editing?.id ?? 'new'}
              sections={sections}
              initial={editing}
              isEdit={!!editing}
              loading={saveTeacher.isPending}
              onCancel={() => {
                setSheetOpen(false);
                setEditing(null);
              }}
              onSubmit={(values) =>
                saveTeacher.mutate({ values, id: editing?.id })
              }
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}


'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Download,
  Eye,
  GraduationCap,
  Pencil,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { StudentForm, type StudentFormValues } from '@/components/forms/StudentForm';
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
import { unwrapList } from '@/lib/api-helpers';
import type { SchoolClassItem, Student } from '@/types';

function ageFromDob(dob?: string | null): string {
  if (!dob) return '—';
  const birth = new Date(dob);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return `${age} yrs`;
}

function exportCsv(students: Student[]) {
  const headers = [
    'Roll No',
    'Name',
    'Class',
    'Section',
    'Gender',
    'DOB',
    'Guardian',
    'Phone',
    'CNIC',
    'Address',
  ];
  const rows = students.map((s) => [
    s.roll_number,
    s.name,
    s.section?.school_class?.name ?? '',
    s.section?.name ?? '',
    s.gender ?? '',
    s.date_of_birth ?? '',
    s.guardian_name,
    s.guardian_phone,
    s.guardian_cnic ?? '',
    s.address ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function StudentsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [editing, setEditing] = useState<Student | null>(null);
  const [suggestedRoll, setSuggestedRoll] = useState('');

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/admin/classes').then((r) => unwrapList<SchoolClassItem>(r.data)),
  });

  const queryParams = useMemo(() => {
    const p: Record<string, string> = {};
    if (search.trim()) p.search = search.trim();
    if (classFilter) p.school_class_id = classFilter;
    if (sectionFilter) p.section_id = sectionFilter;
    if (genderFilter) p.gender = genderFilter;
    return p;
  }, [search, classFilter, sectionFilter, genderFilter]);

  const { data: students = [], isLoading } = useQuery({
    queryKey: ['students', queryParams],
    queryFn: () =>
      api.get('/admin/students', { params: queryParams }).then((r) => unwrapList<Student>(r.data)),
  });

  const sectionOptions = useMemo(() => {
    if (!classFilter) {
      return classes.flatMap((c) =>
        (c.sections ?? []).map((s) => ({
          id: s.id,
          label: `${c.name} – ${s.name}`,
        }))
      );
    }
    const cls = classes.find((c) => String(c.id) === classFilter);
    return (cls?.sections ?? []).map((s) => ({
      id: s.id,
      label: `Section ${s.name}`,
    }));
  }, [classes, classFilter]);

  const stats = useMemo(() => {
    const male = students.filter((s) => s.gender === 'male').length;
    const female = students.filter((s) => s.gender === 'female').length;
    const withPortal = students.filter((s) => s.parent_user?.email).length;
    return { total: students.length, male, female, withPortal };
  }, [students]);

  const fetchNextRoll = async () => {
    try {
      const { data } = await api.get<{ roll_number: string }>('/admin/students/next-roll-number');
      setSuggestedRoll(data.roll_number);
      toast.success(`Suggested roll: ${data.roll_number}`);
    } catch {
      toast.error('Could not suggest roll number');
    }
  };

  const saveStudent = useMutation({
    mutationFn: async ({ values, id }: { values: StudentFormValues; id?: number }) => {
      const payload = {
        name: values.name,
        roll_number: values.roll_number,
        section_id: Number(values.section_id),
        guardian_name: values.guardian_name,
        guardian_phone: values.guardian_phone,
        guardian_cnic: values.guardian_cnic || null,
        date_of_birth: values.date_of_birth || null,
        gender: values.gender || null,
        address: values.address || null,
        parent_email: values.parent_email || undefined,
        parent_password: values.parent_password || undefined,
      };
      if (id) return api.put(`/admin/students/${id}`, payload);
      return api.post('/admin/students', payload);
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['classes'] });
      qc.invalidateQueries({ queryKey: ['structure'] });
      setSheetOpen(false);
      setEditing(null);
      toast.success(vars.id ? 'Student updated' : 'Student enrolled');
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      const msg = err.response?.data?.message;
      toast.error(msg ?? 'Could not save student');
    },
  });

  const deleteStudent = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/students/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['students'] });
      qc.invalidateQueries({ queryKey: ['structure'] });
      setViewStudent(null);
      toast.success('Student removed');
    },
    onError: () => toast.error('Could not delete student'),
  });

  const openAdd = () => {
    setEditing(null);
    setSuggestedRoll('');
    setSheetOpen(true);
    void fetchNextRoll();
  };

  const openEdit = (s: Student) => {
    setEditing(s);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Students"
        description="Enroll students, manage guardians, and enable parent portal access"
      >
        <Button variant="outline" onClick={() => exportCsv(students)} disabled={!students.length}>
          <Download className="mr-2 h-4 w-4" />
          Export CSV
        </Button>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="mr-2 h-4 w-4" />
          Add student
        </Button>
      </PageHeader>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total enrolled', value: stats.total, icon: GraduationCap },
          { label: 'Boys', value: stats.male, icon: Users },
          { label: 'Girls', value: stats.female, icon: Users },
          { label: 'Parent logins', value: stats.withPortal, icon: Users },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-neutral-200">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-neutral-900">{value}</p>
                <p className="text-sm text-neutral-600">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 xl:flex-row xl:items-center">
            <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <Input
                placeholder="Search name, roll no, guardian, phone…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-3 xl:w-auto">
              <select
                className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={classFilter}
                onChange={(e) => {
                  setClassFilter(e.target.value);
                  setSectionFilter('');
                }}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <select
                className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
              >
                <option value="">All sections</option>
                {sectionOptions.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <select
                className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
              >
                <option value="">All genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading students…</p>
          ) : students.length === 0 ? (
            <p className="p-6 text-neutral-600">
              No students match your filters.{' '}
              <button type="button" className="text-indigo-600 hover:underline" onClick={openAdd}>
                Add the first student
              </button>
            </p>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Parent login</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-mono text-sm">{s.roll_number}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {s.section?.school_class?.name}-{s.section?.name}
                      </Badge>
                    </TableCell>
                    <TableCell>{s.guardian_name}</TableCell>
                    <TableCell className="text-sm">{s.guardian_phone}</TableCell>
                    <TableCell>
                      {s.parent_user?.email ? (
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      ) : (
                        <span className="text-xs text-neutral-400">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setViewStudent(s)}
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => openEdit(s)}
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => {
                            if (confirm(`Remove ${s.name}? This deletes their parent login too.`)) {
                              deleteStudent.mutate(s.id);
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
            <SheetTitle>{editing ? 'Edit student' : 'Add student'}</SheetTitle>
            <SheetDescription>
              {editing
                ? 'Update enrollment, guardian details, or parent portal access.'
                : 'Enroll a new student and optionally create a parent login.'}
            </SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <StudentForm
              key={editing?.id ?? 'new'}
              classes={classes}
              initial={editing}
              suggestedRoll={suggestedRoll}
              isEdit={!!editing}
              loading={saveStudent.isPending}
              onRequestRoll={fetchNextRoll}
              onCancel={() => {
                setSheetOpen(false);
                setEditing(null);
              }}
              onSubmit={(values) => saveStudent.mutate({ values, id: editing?.id })}
            />
          </div>
        </SheetContent>
      </Sheet>

      <Sheet open={!!viewStudent} onOpenChange={(o) => !o && setViewStudent(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {viewStudent ? (
            <>
              <SheetHeader>
                <SheetTitle>{viewStudent.name}</SheetTitle>
                <SheetDescription>Roll {viewStudent.roll_number}</SheetDescription>
              </SheetHeader>
              <dl className="mt-6 space-y-4 px-4 pb-6 text-sm">
                <div>
                  <dt className="text-neutral-500">Class & section</dt>
                  <dd className="font-medium">
                    {viewStudent.section?.school_class?.name} – Section{' '}
                    {viewStudent.section?.name}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Gender / age</dt>
                  <dd className="font-medium capitalize">
                    {viewStudent.gender ?? '—'} · {ageFromDob(viewStudent.date_of_birth)}
                  </dd>
                </div>
                {viewStudent.date_of_birth ? (
                  <div>
                    <dt className="text-neutral-500">Date of birth</dt>
                    <dd className="font-medium">{viewStudent.date_of_birth}</dd>
                  </div>
                ) : null}
                {viewStudent.address ? (
                  <div>
                    <dt className="text-neutral-500">Address</dt>
                    <dd className="font-medium">{viewStudent.address}</dd>
                  </div>
                ) : null}
                <div>
                  <dt className="text-neutral-500">Guardian</dt>
                  <dd className="font-medium">{viewStudent.guardian_name}</dd>
                  <dd className="text-neutral-600">{viewStudent.guardian_phone}</dd>
                  {viewStudent.guardian_cnic ? (
                    <dd className="text-neutral-600">CNIC {viewStudent.guardian_cnic}</dd>
                  ) : null}
                </div>
                <div>
                  <dt className="text-neutral-500">Parent portal</dt>
                  <dd className="font-medium">
                    {viewStudent.parent_user?.email ?? 'No login created'}
                  </dd>
                </div>
                <div>
                  <dt className="text-neutral-500">Fee challans</dt>
                  <dd className="font-medium">{viewStudent.challans_count ?? 0} on record</dd>
                </div>
              </dl>
              <div className="flex flex-wrap gap-2 px-4 pb-6">
                <Button variant="outline" onClick={() => openEdit(viewStudent)}>
                  Edit student
                </Button>
                <Link
                  href="/admin/fees"
                  className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50"
                >
                  View fees & challans
                </Link>
                <Link
                  href="/admin/classes"
                  className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50"
                >
                  Classes & sections
                </Link>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}


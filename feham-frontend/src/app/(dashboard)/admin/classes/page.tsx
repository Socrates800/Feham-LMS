'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Layers, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import type { SchoolClassItem, SectionDetail, Teacher } from '@/types';

export default function ClassesPage() {
  const qc = useQueryClient();
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<number | null>(null);

  const [addClassOpen, setAddClassOpen] = useState(false);
  const [className, setClassName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('1');

  const [addSectionOpen, setAddSectionOpen] = useState(false);
  const [sectionName, setSectionName] = useState('');
  const [sectionTeacherId, setSectionTeacherId] = useState('');

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/admin/classes').then((r) => unwrapList<SchoolClassItem>(r.data)),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/admin/teachers').then((r) => unwrapList<Teacher>(r.data)),
  });

  const selectedClass = classes.find((c) => c.id === selectedClassId) ?? null;

  useEffect(() => {
    if (classes.length > 0 && selectedClassId === null) {
      setSelectedClassId(classes[0].id);
    }
  }, [classes, selectedClassId]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['classes'] });
    qc.invalidateQueries({ queryKey: ['sections'] });
    qc.invalidateQueries({ queryKey: ['teachers'] });
  };

  const createClass = useMutation({
    mutationFn: () =>
      api.post('/admin/classes', {
        name: className,
        grade_level: Number(gradeLevel),
      }),
    onSuccess: (res) => {
      invalidate();
      setAddClassOpen(false);
      setClassName('');
      setGradeLevel('1');
      const created = res.data?.data ?? res.data;
      if (created?.id) setSelectedClassId(created.id);
      toast.success('Class added');
    },
    onError: () => toast.error('Could not add class'),
  });

  const deleteClass = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/classes/${id}`),
    onSuccess: (_d, id) => {
      invalidate();
      if (selectedClassId === id) setSelectedClassId(null);
      toast.success('Class removed');
    },
    onError: () => toast.error('Could not remove class'),
  });

  const createSection = useMutation({
    mutationFn: () =>
      api.post('/admin/sections', {
        school_class_id: selectedClassId,
        name: sectionName,
        class_teacher_id: sectionTeacherId ? Number(sectionTeacherId) : null,
      }),
    onSuccess: () => {
      invalidate();
      setAddSectionOpen(false);
      setSectionName('');
      setSectionTeacherId('');
      toast.success('Section added');
    },
    onError: () => toast.error('Could not add section'),
  });

  const deleteSection = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/sections/${id}`),
    onSuccess: () => {
      invalidate();
      toast.success('Section removed');
    },
    onError: () => toast.error('Could not remove section'),
  });

  const updateSectionTeacher = useMutation({
    mutationFn: ({ sectionId, teacherId }: { sectionId: number; teacherId: number | null }) =>
      api.put(`/admin/sections/${sectionId}`, {
        class_teacher_id: teacherId,
      }),
    onSuccess: () => {
      invalidate();
      toast.success('Class teacher updated');
    },
    onError: () => toast.error('Could not update class teacher'),
  });

  const totalStudentsInClass = selectedClass?.sections?.reduce(
    (sum, s) => sum + (s.students_count ?? s.students?.length ?? 0),
    0
  );

  return (
    <div className="space-y-8">
      <PageHeader
        title="Classes & Sections"
        description="Organize grades, sections, homeroom teachers, and student placement"
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(240px,300px)_1fr]">
        <Card className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-base">Classes</CardTitle>
            <Button
              size="sm"
              className="h-8 bg-indigo-600 hover:bg-indigo-700"
              onClick={() => setAddClassOpen(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <p className="px-4 pb-4 text-sm text-neutral-500">Loading…</p>
            ) : classes.length === 0 ? (
              <p className="px-4 pb-4 text-sm text-neutral-500">No classes yet.</p>
            ) : (
              <ul className="divide-y divide-neutral-100">
                {classes.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedClassId(c.id);
                        setExpandedSectionId(null);
                      }}
                      className={cn(
                        'flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors hover:bg-neutral-50',
                        selectedClassId === c.id && 'bg-indigo-50'
                      )}
                    >
                      <span>
                        <span className="font-medium text-neutral-900">{c.name}</span>
                        <span className="mt-0.5 block text-xs text-neutral-500">
                          {c.sections?.length ?? 0} sections
                        </span>
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (
                            confirm(
                              `Delete ${c.name}? This removes all sections and students in this class.`
                            )
                          ) {
                            deleteClass.mutate(c.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          {!selectedClass ? (
            <CardContent className="flex min-h-[320px] items-center justify-center text-neutral-500">
              Select a class to manage sections
            </CardContent>
          ) : (
            <>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>{selectedClass.name} — Sections</CardTitle>
                  <p className="mt-1 text-sm text-neutral-600">
                    {selectedClass.sections?.length ?? 0} sections · {totalStudentsInClass ?? 0}{' '}
                    students
                  </p>
                </div>
                <Button
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => setAddSectionOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add section
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {!selectedClass.sections?.length ? (
                  <p className="text-sm text-neutral-500">No sections in this class yet.</p>
                ) : (
                  selectedClass.sections.map((section) => (
                    <SectionCard
                      key={section.id}
                      section={section}
                      classLabel={selectedClass.name}
                      teachers={teachers}
                      expanded={expandedSectionId === section.id}
                      onToggle={() =>
                        setExpandedSectionId((id) => (id === section.id ? null : section.id))
                      }
                      onDelete={() => {
                        if (confirm(`Delete section ${section.name}?`)) {
                          deleteSection.mutate(section.id);
                        }
                      }}
                      onTeacherChange={(teacherId) =>
                        updateSectionTeacher.mutate({
                          sectionId: section.id,
                          teacherId,
                        })
                      }
                    />
                  ))
                )}
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <Dialog open={addClassOpen} onOpenChange={setAddClassOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add class</DialogTitle>
            <DialogDescription>e.g. Class 1, Class 10 (grade 1–12)</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="class-name">Class name</Label>
              <Input
                id="class-name"
                className="mt-1"
                placeholder="Class 11"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="grade-level">Grade level (1–12)</Label>
              <Input
                id="grade-level"
                type="number"
                min={1}
                max={12}
                className="mt-1"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClassOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!className.trim() || createClass.isPending}
              onClick={() => createClass.mutate()}
            >
              Add class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={addSectionOpen} onOpenChange={setAddSectionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add section to {selectedClass?.name}</DialogTitle>
            <DialogDescription>Usually A, B, C, or D</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="section-name">Section name</Label>
              <Input
                id="section-name"
                className="mt-1"
                placeholder="A"
                maxLength={10}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="section-teacher">Class teacher (optional)</Label>
              <select
                id="section-teacher"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={sectionTeacherId}
                onChange={(e) => setSectionTeacherId(e.target.value)}
              >
                <option value="">— None —</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSectionOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!sectionName.trim() || createSection.isPending}
              onClick={() => createSection.mutate()}
            >
              Add section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SectionCard({
  section,
  classLabel,
  teachers,
  expanded,
  onToggle,
  onDelete,
  onTeacherChange,
}: {
  section: SectionDetail;
  classLabel: string;
  teachers: Teacher[];
  expanded: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onTeacherChange: (teacherId: number | null) => void;
}) {
  const studentCount = section.students_count ?? section.students?.length ?? 0;

  return (
    <article className="rounded-xl border border-neutral-200 bg-neutral-50/50">
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-neutral-900">
              {classLabel} — Section {section.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="gap-1">
                <Users className="h-3 w-3" />
                {studentCount} students
              </Badge>
              {section.class_teacher?.user?.name ? (
                <Badge variant="outline">Teacher: {section.class_teacher.user.name}</Badge>
              ) : null}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            className="rounded-lg border border-neutral-200 bg-white px-2 py-1.5 text-sm"
            value={section.class_teacher_id ?? ''}
            onChange={(e) =>
              onTeacherChange(e.target.value ? Number(e.target.value) : null)
            }
          >
            <option value="">Assign teacher…</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.user?.name}
              </option>
            ))}
          </select>
          <Button type="button" variant="outline" size="sm" onClick={onToggle}>
            {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <span className="ml-1">Students</span>
          </Button>
          <Button type="button" variant="ghost" size="icon-sm" onClick={onDelete}>
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </div>

      {expanded ? (
        <div className="border-t border-neutral-200 bg-white px-4 py-3">
          {!section.students?.length ? (
            <p className="text-sm text-neutral-500">
              No students in this section. Add students from the Students page and assign this
              section when enrolling them.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Roll No</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {section.students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>{s.roll_number}</TableCell>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell>{s.guardian_name}</TableCell>
                    <TableCell>{s.guardian_phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      ) : null}
    </article>
  );
}




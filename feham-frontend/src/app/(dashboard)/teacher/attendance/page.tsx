'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Download, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import type {
  AttendanceStatus,
  TeacherAttendanceResponse,
} from '@/types';

type AttendanceDraft = Record<number, { status: AttendanceStatus; remarks: string }>;

const STATUS_OPTIONS: Array<{ value: AttendanceStatus; label: string }> = [
  { value: 'present', label: 'Present' },
  { value: 'absent', label: 'Absent' },
  { value: 'late', label: 'Late' },
  { value: 'leave', label: 'Leave' },
];

const today = new Date().toISOString().slice(0, 10);

export default function TeacherAttendancePage() {
  const qc = useQueryClient();
  const [sectionId, setSectionId] = useState('');
  const [date, setDate] = useState(today);
  const [draft, setDraft] = useState<AttendanceDraft>({});

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-attendance', sectionId, date],
    queryFn: () =>
      api
        .get<TeacherAttendanceResponse>('/teacher/attendance', {
          params: { section_id: sectionId || undefined, date },
        })
        .then((r) => r.data),
  });

  const selectedSectionId = sectionId || (data?.selected_section_id ? String(data.selected_section_id) : '');
  const students = data?.students ?? [];

  useEffect(() => {
    if (!data) return;

    if (!sectionId && data.selected_section_id) {
      setSectionId(String(data.selected_section_id));
    }

    const nextDraft: AttendanceDraft = {};
    data.students.forEach((student) => {
      nextDraft[student.id] = {
        status: student.attendance?.status ?? 'present',
        remarks: student.attendance?.remarks ?? '',
      };
    });
    setDraft(nextDraft);
  }, [data, sectionId]);

  const summary = useMemo(() => {
    return STATUS_OPTIONS.map((option) => ({
      ...option,
      count: Object.values(draft).filter((record) => record.status === option.value).length,
    }));
  }, [draft]);

  const saveAttendance = useMutation({
    mutationFn: () =>
      api.post('/teacher/attendance', {
        section_id: Number(selectedSectionId),
        date,
        records: students.map((student) => ({
          student_id: student.id,
          status: draft[student.id]?.status ?? 'present',
          remarks: draft[student.id]?.remarks || null,
        })),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-attendance'] });
      toast.success('Attendance saved');
    },
    onError: () => toast.error('Could not save attendance'),
  });

  const setAll = (status: AttendanceStatus) => {
    setDraft((current) => {
      const next = { ...current };
      students.forEach((student) => {
        next[student.id] = { status, remarks: next[student.id]?.remarks ?? '' };
      });
      return next;
    });
  };

  const updateStudent = (studentId: number, patch: Partial<{ status: AttendanceStatus; remarks: string }>) => {
    setDraft((current) => ({
      ...current,
      [studentId]: {
        status: patch.status ?? current[studentId]?.status ?? 'present',
        remarks: patch.remarks ?? current[studentId]?.remarks ?? '',
      },
    }));
  };

  const exportCsv = () => {
    const section = data?.sections.find((s) => String(s.id) === selectedSectionId);
    const rows = students.map((student) => {
      const record = draft[student.id] ?? { status: 'present', remarks: '' };
      return [
        date,
        section?.label ?? '',
        student.roll_number,
        student.name,
        statusLabel(record.status),
        record.remarks,
      ];
    });

    downloadCsv(`attendance-${section?.label ?? 'section'}-${date}.csv`, [
      ['Date', 'Class / Section', 'Roll No', 'Student', 'Status', 'Remarks'],
      ...rows,
    ]);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Student Attendance"
        description="Mark attendance only for students in sections assigned to you"
      >
        <Button variant="outline" onClick={exportCsv} disabled={!students.length}>
          <Download className="mr-2 h-4 w-4" />
          Excel export
        </Button>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!students.length || !selectedSectionId || saveAttendance.isPending}
          onClick={() => saveAttendance.mutate()}
        >
          <Save className="mr-2 h-4 w-4" />
          Save attendance
        </Button>
      </PageHeader>

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 text-sm text-amber-900">
          Marking a student as <strong>Late</strong> automatically adds a Rs. 20 late attendance
          fine to that student&apos;s pending fee challan for the selected month. If you correct the
          status before payment, the pending fine is removed.
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardContent className="grid gap-4 p-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="attendance-section">
              Class / section
            </label>
            <select
              id="attendance-section"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={selectedSectionId}
              onChange={(event) => setSectionId(event.target.value)}
            >
              {(data?.sections.length ?? 0) === 0 ? (
                <option value="">No assigned sections</option>
              ) : null}
              {data?.sections.map((section) => (
                <option key={section.id} value={section.id}>
                  {section.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="attendance-date">
              Date
            </label>
            <Input
              id="attendance-date"
              type="date"
              className="mt-1"
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <p className="text-neutral-600">Loading attendance...</p>
      ) : !selectedSectionId ? (
        <Card className="border-neutral-200">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Users className="h-10 w-10 text-neutral-300" />
            <p className="font-medium text-neutral-900">No assigned sections</p>
            <p className="max-w-md text-sm text-neutral-500">
              Ask your school admin to assign you as class teacher or add you to the timetable.
              Attendance will only show students from those sections.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-neutral-500">Summary:</span>
            {summary.map((item) => (
              <Badge key={item.value} variant="outline" className="capitalize">
                {item.label}: {item.count}
              </Badge>
            ))}
            <div className="ml-auto flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setAll('present')}>
                Mark all present
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={() => setAll('absent')}>
                Mark all absent
              </Button>
            </div>
          </div>

          <Card className="border-neutral-200">
            <CardContent className="p-0">
              {students.length === 0 ? (
                <p className="p-6 text-neutral-600">No students found in this section.</p>
              ) : (
                <Table className="min-w-[760px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Roll No</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Guardian</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {students.map((student) => {
                      const record = draft[student.id] ?? { status: 'present', remarks: '' };

                      return (
                        <TableRow key={student.id}>
                          <TableCell className="font-mono text-sm">{student.roll_number}</TableCell>
                          <TableCell className="font-medium">{student.name}</TableCell>
                          <TableCell className="text-sm">{student.guardian_name}</TableCell>
                          <TableCell>
                            <select
                              className="w-full min-w-28 rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm capitalize"
                              value={record.status}
                              onChange={(event) =>
                                updateStudent(student.id, {
                                  status: event.target.value as AttendanceStatus,
                                })
                              }
                            >
                              {STATUS_OPTIONS.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="Optional note"
                              value={record.remarks}
                              onChange={(event) =>
                                updateStudent(student.id, { remarks: event.target.value })
                              }
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function statusLabel(status: AttendanceStatus): string {
  return STATUS_OPTIONS.find((option) => option.value === status)?.label ?? status;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows
    .map((row) =>
      row
        .map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`)
        .join(',')
    )
    .join('\n');
  const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename.replace(/[^\w.-]+/g, '-');
  link.click();
  URL.revokeObjectURL(url);
}

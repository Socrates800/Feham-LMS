'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Settings2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useState } from 'react';
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
import api from '@/lib/api';
import { unwrapList } from '@/lib/api-helpers';
import { formatTimeRange } from '@/lib/time';
import { teacherColorClass } from '@/lib/timetable-colors';
import { cn } from '@/lib/utils';
import type { Period, SchoolClassItem, Teacher, TimetableEntry } from '@/types';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

type SlotKey = `${string}-${number}`;

export default function TimetablePage() {
  const qc = useQueryClient();
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [periodsOpen, setPeriodsOpen] = useState(false);
  const [slotOpen, setSlotOpen] = useState(false);
  const [activeSlot, setActiveSlot] = useState<{ day: string; periodId: number } | null>(null);
  const [subject, setSubject] = useState('');
  const [teacherId, setTeacherId] = useState('');

  const [periodForm, setPeriodForm] = useState({
    name: '',
    start_time: '08:00',
    end_time: '08:45',
    order_index: '0',
  });

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/admin/classes').then((r) => unwrapList<SchoolClassItem>(r.data)),
  });

  const sections = useMemo(
    () =>
      classes.flatMap((c) =>
        (c.sections ?? []).map((s) => ({
          id: s.id,
          name: s.name,
          className: c.name,
          label: `${c.name} – Section ${s.name}`,
        }))
      ),
    [classes]
  );

  useEffect(() => {
    if (sections.length > 0 && sectionId === null) {
      setSectionId(sections[0].id);
    }
  }, [sections, sectionId]);

  const { data: periods = [], isLoading: periodsLoading } = useQuery({
    queryKey: ['periods'],
    queryFn: () => api.get('/admin/periods').then((r) => unwrapList<Period>(r.data)),
  });

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/admin/teachers').then((r) => unwrapList<Teacher>(r.data)),
  });

  const { data: entries = [], isLoading: entriesLoading } = useQuery({
    queryKey: ['timetable', sectionId],
    queryFn: () =>
      api
        .get('/admin/timetables', { params: { section_id: sectionId } })
        .then((r) => unwrapList<TimetableEntry>(r.data)),
    enabled: !!sectionId,
  });

  const entryMap = useMemo(() => {
    const map = new Map<SlotKey, TimetableEntry>();
    entries.forEach((e) => map.set(`${e.day}-${e.period_id}`, e));
    return map;
  }, [entries]);

  const teachersInGrid = useMemo(() => {
    const ids = new Set(entries.map((e) => e.teacher_id));
    return teachers.filter((t) => ids.has(t.id));
  }, [entries, teachers]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['timetable'] });
    qc.invalidateQueries({ queryKey: ['periods'] });
    qc.invalidateQueries({ queryKey: ['structure'] });
  };

  const saveSlot = useMutation({
    mutationFn: () =>
      api.post('/admin/timetables', {
        section_id: sectionId,
        period_id: activeSlot?.periodId,
        day: activeSlot?.day,
        subject,
        teacher_id: Number(teacherId),
      }),
    onSuccess: () => {
      invalidate();
      setSlotOpen(false);
      toast.success('Period slot saved');
    },
    onError: () => toast.error('Could not save slot'),
  });

  const deleteSlot = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/timetables/${id}`),
    onSuccess: () => {
      invalidate();
      setSlotOpen(false);
      toast.success('Slot cleared');
    },
    onError: () => toast.error('Could not clear slot'),
  });

  const createPeriod = useMutation({
    mutationFn: () =>
      api.post('/admin/periods', {
        name: periodForm.name,
        start_time: periodForm.start_time,
        end_time: periodForm.end_time,
        order_index: Number(periodForm.order_index),
      }),
    onSuccess: () => {
      invalidate();
      setPeriodForm({ name: '', start_time: '08:00', end_time: '08:45', order_index: String(periods.length) });
      toast.success('Period added');
    },
    onError: () => toast.error('Could not add period'),
  });

  const deletePeriod = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/periods/${id}`),
    onSuccess: invalidate,
    onError: () => toast.error('Could not delete period'),
  });

  const openSlot = (day: string, periodId: number) => {
    const existing = entryMap.get(`${day}-${periodId}`);
    setActiveSlot({ day, periodId });
    setSubject(existing?.subject ?? '');
    setTeacherId(existing?.teacher_id ? String(existing.teacher_id) : '');
    setSlotOpen(true);
  };

  const activeEntry =
    activeSlot && entryMap.get(`${activeSlot.day}-${activeSlot.periodId}`);

  const selectedSection = sections.find((s) => s.id === sectionId);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Timetable Builder"
        description="Weekly schedule by section — click any cell to assign subject and teacher"
      >
        <Button variant="outline" className="w-full sm:w-auto" onClick={() => setPeriodsOpen(true)}>
          <Settings2 className="mr-2 h-4 w-4" />
          Manage periods
        </Button>
        <Link
          href="/admin/structure"
          className="inline-flex h-9 w-full items-center justify-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50 sm:w-auto"
        >
          School hierarchy
        </Link>
      </PageHeader>

      <Card className="border-neutral-200">
        <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <Label htmlFor="section-select">Section</Label>
            <select
              id="section-select"
              className="mt-1 w-full max-w-md rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={sectionId ?? ''}
              onChange={(e) => setSectionId(Number(e.target.value))}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {selectedSection ? (
            <p className="text-sm text-neutral-600">
              Editing schedule for <span className="font-medium">{selectedSection.label}</span>
            </p>
          ) : null}
        </CardContent>
      </Card>

      {periods.length === 0 && !periodsLoading ? (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4 text-sm text-amber-900">
            No periods defined yet. Open <strong>Manage periods</strong> to add Period 1, 2, etc. with
            start and end times before building the grid.
          </CardContent>
        </Card>
      ) : null}

      {teachersInGrid.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-neutral-500">Teachers in this schedule:</span>
          {teachersInGrid.map((t) => (
            <Badge
              key={t.id}
              variant="outline"
              className={cn('border', teacherColorClass(t.id))}
            >
              {t.user?.name}
            </Badge>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div
          className="grid min-w-[760px] gap-px bg-neutral-200 lg:min-w-0"
          style={{
            gridTemplateColumns: `140px repeat(${DAYS.length}, minmax(100px, 1fr))`,
          }}
        >
          <div className="bg-neutral-100 p-3 text-xs font-semibold uppercase text-neutral-500">
            Period / Time
          </div>
          {DAYS.map((day) => (
            <div
              key={day}
              className="bg-neutral-100 p-3 text-center text-xs font-semibold uppercase text-neutral-700"
            >
              {day.slice(0, 3)}
            </div>
          ))}

          {periodsLoading || entriesLoading ? (
            <div className="col-span-full bg-white p-8 text-center text-sm text-neutral-500">
              Loading timetable…
            </div>
          ) : periods.length === 0 ? null : (
            periods.map((period) => (
              <Fragment key={period.id}>
                <div className="flex flex-col justify-center bg-white p-3">
                  <p className="text-sm font-medium text-neutral-900">{period.name}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                    <Clock className="h-3 w-3" />
                    {formatTimeRange(period.start_time, period.end_time)}
                  </p>
                </div>
                {DAYS.map((day) => {
                  const entry = entryMap.get(`${day}-${period.id}`);
                  return (
                    <button
                      key={`${day}-${period.id}`}
                      type="button"
                      onClick={() => openSlot(day, period.id)}
                      className={cn(
                        'min-h-[72px] border border-transparent p-2 text-left text-xs transition hover:ring-2 hover:ring-indigo-400',
                        entry
                          ? teacherColorClass(entry.teacher_id)
                          : 'bg-white hover:bg-neutral-50'
                      )}
                    >
                      {entry ? (
                        <>
                          <p className="font-semibold leading-tight">{entry.subject}</p>
                          <p className="mt-1 truncate opacity-80">{entry.teacher?.user?.name}</p>
                        </>
                      ) : (
                        <span className="text-neutral-400">+ Add</span>
                      )}
                    </button>
                  );
                })}
              </Fragment>
            ))
          )}
        </div>
      </div>

      <Dialog open={slotOpen} onOpenChange={setSlotOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign period slot</DialogTitle>
            <DialogDescription>
              {activeSlot?.day} ·{' '}
              {periods.find((p) => p.id === activeSlot?.periodId)?.name}
              {activeSlot?.periodId
                ? ` (${formatTimeRange(
                    periods.find((p) => p.id === activeSlot.periodId)!.start_time,
                    periods.find((p) => p.id === activeSlot.periodId)!.end_time
                  )})`
                : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="slot-subject">Subject</Label>
              <Input
                id="slot-subject"
                className="mt-1"
                placeholder="Mathematics"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="slot-teacher">Teacher</Label>
              <select
                id="slot-teacher"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name}
                    {t.subject_specialization ? ` (${t.subject_specialization})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter className="gap-2 sm:justify-between">
            {activeEntry ? (
              <Button
                type="button"
                variant="destructive"
                onClick={() => deleteSlot.mutate(activeEntry.id)}
                disabled={deleteSlot.isPending}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear slot
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setSlotOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                disabled={!subject.trim() || !teacherId || saveSlot.isPending}
                onClick={() => saveSlot.mutate()}
              >
                Save
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={periodsOpen} onOpenChange={setPeriodsOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>School periods</DialogTitle>
            <DialogDescription>
              Define period names and times shown on the left of the timetable grid
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-48 space-y-2 overflow-y-auto">
            {periods.length === 0 ? (
              <p className="text-sm text-neutral-500">No periods yet.</p>
            ) : (
              periods.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-lg border border-neutral-200 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium">{p.name}</span>
                    <span className="ml-2 text-neutral-500">
                      {formatTimeRange(p.start_time, p.end_time)}
                    </span>
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => {
                      if (confirm(`Delete ${p.name}?`)) deletePeriod.mutate(p.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))
            )}
          </div>
          <div className="space-y-3 border-t border-neutral-200 pt-4">
            <p className="text-sm font-medium">Add period</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="p-name">Name</Label>
                <Input
                  id="p-name"
                  className="mt-1"
                  placeholder="Period 1"
                  value={periodForm.name}
                  onChange={(e) => setPeriodForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="p-start">Start</Label>
                <Input
                  id="p-start"
                  type="time"
                  className="mt-1"
                  value={periodForm.start_time}
                  onChange={(e) => setPeriodForm((f) => ({ ...f, start_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="p-end">End</Label>
                <Input
                  id="p-end"
                  type="time"
                  className="mt-1"
                  value={periodForm.end_time}
                  onChange={(e) => setPeriodForm((f) => ({ ...f, end_time: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="p-order">Order</Label>
                <Input
                  id="p-order"
                  type="number"
                  min={0}
                  className="mt-1"
                  value={periodForm.order_index}
                  onChange={(e) => setPeriodForm((f) => ({ ...f, order_index: e.target.value }))}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodsOpen(false)}>
              Done
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={!periodForm.name.trim() || createPeriod.isPending}
              onClick={() => createPeriod.mutate()}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add period
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


'use client';

import { useQuery } from '@tanstack/react-query';
import { Calendar } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { TimetableGrid } from '@/components/timetable/TimetableGrid';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import api from '@/lib/api';
import { sectionLabel, WEEKDAYS } from '@/lib/teacher-display';
import type { Period, TimetableEntry } from '@/types';

type TeacherScheduleResponse = {
  periods: Period[];
  entries: TimetableEntry[];
};

const EMPTY_PERIODS: Period[] = [];
const EMPTY_ENTRIES: TimetableEntry[] = [];

export default function TeacherSchedulePage() {
  const [sectionId, setSectionId] = useState('all');
  const [day, setDay] = useState('all');
  const [subject, setSubject] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['teacher-schedule'],
    queryFn: () =>
      api.get<TeacherScheduleResponse | TimetableEntry[]>('/teacher/schedule').then((r) => {
        const payload = r.data;
        if (Array.isArray(payload)) {
          return { periods: [], entries: payload };
        }
        return payload;
      }),
  });

  const periods = data?.periods ?? EMPTY_PERIODS;
  const entries = data?.entries ?? EMPTY_ENTRIES;
  const sectionOptions = useMemo(() => {
    const options = new Map<number, string>();
    entries.forEach((entry) => {
      if (entry.section_id) {
        options.set(entry.section_id, sectionLabel(entry));
      }
    });
    return Array.from(options, ([id, label]) => ({ id, label })).sort((a, b) =>
      a.label.localeCompare(b.label)
    );
  }, [entries]);

  const subjectOptions = useMemo(() => {
    return Array.from(new Set(entries.map((entry) => entry.subject).filter(Boolean))).sort();
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      const matchesSection = sectionId === 'all' || entry.section_id === Number(sectionId);
      const matchesDay = day === 'all' || entry.day === day;
      const matchesSubject = subject === 'all' || entry.subject === subject;

      return matchesSection && matchesDay && matchesSubject;
    });
  }, [day, entries, sectionId, subject]);

  const visibleDays = day === 'all' ? WEEKDAYS : [day];
  const hasFilters = sectionId !== 'all' || day !== 'all' || subject !== 'all';

  const resetFilters = () => {
    setSectionId('all');
    setDay('all');
    setSubject('all');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="My Schedule"
        description="Your weekly teaching timetable — same grid view as the school timetable, read-only"
      />

      {isLoading ? (
        <TimetableGrid periods={[]} entries={[]} loading />
      ) : periods.length === 0 ? (
        <Card className="border-neutral-200">
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <Calendar className="h-10 w-10 text-neutral-300" />
            <p className="font-medium text-neutral-900">No timetable assigned yet</p>
            <p className="max-w-md text-sm text-neutral-500">
              Ask your school admin to add you to the timetable builder for your sections. Once
              assigned, your weekly schedule will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {entries.length === 0 ? (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="p-4 text-sm text-amber-900">
                No classes are assigned to you in the timetable yet. The grid below shows your
                school&apos;s period times — your slots will appear here once admin adds them.
              </CardContent>
            </Card>
          ) : null}
          {entries.length > 0 ? (
            <Card className="border-neutral-200">
              <CardContent className="space-y-4 p-4">
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <label className="text-sm font-medium text-neutral-700" htmlFor="schedule-section">
                      Class / section
                    </label>
                    <select
                      id="schedule-section"
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                      value={sectionId}
                      onChange={(event) => setSectionId(event.target.value)}
                    >
                      <option value="all">All classes</option>
                      {sectionOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700" htmlFor="schedule-day">
                      Day
                    </label>
                    <select
                      id="schedule-day"
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                      value={day}
                      onChange={(event) => setDay(event.target.value)}
                    >
                      <option value="all">All days</option>
                      {WEEKDAYS.map((weekday) => (
                        <option key={weekday} value={weekday}>
                          {weekday}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-700" htmlFor="schedule-subject">
                      Subject
                    </label>
                    <select
                      id="schedule-subject"
                      className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                      value={subject}
                      onChange={(event) => setSubject(event.target.value)}
                    >
                      <option value="all">All subjects</option>
                      {subjectOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-neutral-100 pt-3 text-sm text-neutral-600 sm:flex-row sm:items-center sm:justify-between">
                  <span>
                    Showing {filteredEntries.length} of {entries.length} assigned slots
                  </span>
                  {hasFilters ? (
                    <Button type="button" variant="outline" size="sm" onClick={resetFilters}>
                      Clear filters
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ) : null}
          {filteredEntries.length === 0 && entries.length > 0 ? (
            <Card className="border-neutral-200">
              <CardContent className="p-6 text-sm text-neutral-600">
                No timetable slots match the selected filters. Clear filters to see your full
                schedule.
              </CardContent>
            </Card>
          ) : null}
          <TimetableGrid periods={periods} entries={filteredEntries} days={visibleDays} readOnly />
        </>
      )}
    </div>
  );
}

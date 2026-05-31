'use client';

import { Clock } from 'lucide-react';
import { Fragment, useMemo } from 'react';
import { sectionLabel } from '@/lib/teacher-display';
import { formatTimeRange } from '@/lib/time';
import { teacherColorClass } from '@/lib/timetable-colors';
import { cn } from '@/lib/utils';
import type { Period, TimetableEntry } from '@/types';

const DEFAULT_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

type SlotKey = `${string}-${number}`;

type TimetableGridProps = {
  periods: Period[];
  entries: TimetableEntry[];
  days?: readonly string[];
  readOnly?: boolean;
  loading?: boolean;
  onCellClick?: (day: string, periodId: number) => void;
};

export function TimetableGrid({
  periods,
  entries,
  days = DEFAULT_DAYS,
  readOnly = false,
  loading = false,
  onCellClick,
}: TimetableGridProps) {
  const entryMap = useMemo(() => {
    const map = new Map<SlotKey, TimetableEntry>();
    entries.forEach((entry) => map.set(`${entry.day}-${entry.period_id}`, entry));
    return map;
  }, [entries]);

  const sectionsInGrid = useMemo(() => {
    const labels = new Map<number, string>();
    entries.forEach((entry) => {
      if (entry.section_id) {
        labels.set(entry.section_id, sectionLabel(entry));
      }
    });
    return Array.from(labels.values());
  }, [entries]);

  if (loading) {
    return (
      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white p-8 text-center text-sm text-neutral-500 shadow-sm">
        Loading timetable…
      </div>
    );
  }

  if (periods.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {sectionsInGrid.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-neutral-500">Your classes in this schedule:</span>
          {sectionsInGrid.map((label) => (
            <span
              key={label}
              className="inline-flex items-center rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-xs font-medium text-indigo-800"
            >
              {label}
            </span>
          ))}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white shadow-sm">
        <div
          className="grid min-w-[760px] gap-px bg-neutral-200 lg:min-w-0"
          style={{
            gridTemplateColumns: `140px repeat(${days.length}, minmax(100px, 1fr))`,
          }}
        >
          <div className="bg-neutral-100 p-3 text-xs font-semibold uppercase text-neutral-500">
            Period / Time
          </div>
          {days.map((day) => (
            <div
              key={day}
              className="bg-neutral-100 p-3 text-center text-xs font-semibold uppercase text-neutral-700"
            >
              {day.slice(0, 3)}
            </div>
          ))}

          {periods.map((period) => (
            <Fragment key={period.id}>
              <div className="flex flex-col justify-center bg-white p-3">
                <p className="text-sm font-medium text-neutral-900">{period.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-neutral-500">
                  <Clock className="h-3 w-3" />
                  {formatTimeRange(period.start_time, period.end_time)}
                </p>
              </div>
              {days.map((day) => {
                const entry = entryMap.get(`${day}-${period.id}`);
                const cellClass = cn(
                  'min-h-[72px] border border-transparent p-2 text-left text-xs',
                  entry ? teacherColorClass(entry.teacher_id) : 'bg-white',
                  !readOnly && 'transition hover:ring-2 hover:ring-indigo-400',
                  !readOnly && !entry && 'hover:bg-neutral-50'
                );

                const content = entry ? (
                  <>
                    <p className="font-semibold leading-tight">{entry.subject}</p>
                    <p className="mt-1 truncate opacity-80">
                      {readOnly ? sectionLabel(entry) : entry.teacher?.user?.name}
                    </p>
                  </>
                ) : readOnly ? null : (
                  <span className="text-neutral-400">+ Add</span>
                );

                if (readOnly) {
                  return (
                    <div key={`${day}-${period.id}`} className={cellClass}>
                      {content}
                    </div>
                  );
                }

                return (
                  <button
                    key={`${day}-${period.id}`}
                    type="button"
                    onClick={() => onCellClick?.(day, period.id)}
                    className={cellClass}
                  >
                    {content}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

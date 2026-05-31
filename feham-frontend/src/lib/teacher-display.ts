import { formatTimeRange } from '@/lib/time';
import type { TimetableEntry } from '@/types';

export function sectionLabel(entry: TimetableEntry): string {
  const cls = entry.section?.school_class?.name;
  const sec = entry.section?.name;
  if (cls && sec) return `${cls} – Section ${sec}`;
  return sec ?? cls ?? 'Class';
}

export function periodLabel(entry: TimetableEntry): string {
  const name = entry.period?.name;
  const start = entry.period?.start_time;
  const end = entry.period?.end_time;
  if (start && end) return `${name ?? 'Period'} · ${formatTimeRange(start, end)}`;
  return name ?? '';
}

export const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

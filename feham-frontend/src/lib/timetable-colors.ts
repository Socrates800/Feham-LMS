const PALETTE = [
  'bg-sky-100 border-sky-300 text-sky-900',
  'bg-violet-100 border-violet-300 text-violet-900',
  'bg-emerald-100 border-emerald-300 text-emerald-900',
  'bg-amber-100 border-amber-300 text-amber-900',
  'bg-rose-100 border-rose-300 text-rose-900',
  'bg-cyan-100 border-cyan-300 text-cyan-900',
  'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-900',
  'bg-lime-100 border-lime-300 text-lime-900',
];

export function teacherColorClass(teacherId: number | null | undefined): string {
  if (!teacherId) return 'bg-neutral-50 border-neutral-200 text-neutral-700';
  return PALETTE[teacherId % PALETTE.length];
}

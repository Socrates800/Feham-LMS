'use client';

import { useQuery } from '@tanstack/react-query';
import {
  BookOpen,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers,
  School,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import api from '@/lib/api';
import { cn } from '@/lib/utils';
import type { StructureTree } from '@/types';

function TreeRow({
  icon: Icon,
  label,
  meta,
  depth = 0,
  defaultOpen = false,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  meta?: string;
  depth?: number;
  defaultOpen?: boolean;
  children?: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = !!children;

  return (
    <div>
      <button
        type="button"
        onClick={() => hasChildren && setOpen((v) => !v)}
        className={cn(
          'flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-neutral-50',
          !hasChildren && 'cursor-default'
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-neutral-400" />
          )
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <Icon className="h-4 w-4 shrink-0 text-indigo-600" />
        <span className="font-medium text-neutral-900">{label}</span>
        {meta ? <span className="ml-auto text-xs text-neutral-500">{meta}</span> : null}
      </button>
      {hasChildren && open ? <div>{children}</div> : null}
    </div>
  );
}

export default function StructurePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['structure'],
    queryFn: () => api.get<StructureTree>('/admin/structure').then((r) => r.data),
  });

  return (
    <div className="space-y-8">
      <PageHeader
        title="School hierarchy"
        description="See how classes, sections, students, teachers, and timetables connect"
      >
        <Link
          href="/admin/timetable"
          className="inline-flex h-8 items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50"
        >
          Timetable builder
        </Link>
      </PageHeader>

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : !data ? (
        <p className="text-sm text-neutral-500">Could not load structure.</p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: 'Classes', value: data.summary.classes },
              { label: 'Sections', value: data.summary.sections },
              { label: 'Students', value: data.summary.students },
              { label: 'Teachers', value: data.summary.teachers },
              { label: 'Timetable slots', value: data.summary.timetable_slots },
            ].map((s) => (
              <Card key={s.label} className="border-neutral-200">
                <CardContent className="p-4">
                  <p className="text-2xl font-bold text-indigo-700">{s.value}</p>
                  <p className="text-sm text-neutral-600">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-neutral-200">
            <CardContent className="p-4">
              <TreeRow
                icon={School}
                label={data.school.name}
                meta="School"
                defaultOpen
              >
                {data.periods?.length ? (
                  <TreeRow
                    icon={BookOpen}
                    label="Periods (bell schedule)"
                    meta={`${data.periods.length} periods`}
                    depth={1}
                    defaultOpen
                  >
                    {data.periods.map((p) => (
                      <TreeRow
                        key={p.id}
                        icon={BookOpen}
                        label={p.name}
                        meta={`${p.start_time?.slice(0, 5)} – ${p.end_time?.slice(0, 5)}`}
                        depth={2}
                      />
                    ))}
                  </TreeRow>
                ) : null}

                {data.classes.map((cls) => (
                  <TreeRow
                    key={cls.id}
                    icon={Layers}
                    label={cls.name}
                    meta={`${cls.sections.length} sections`}
                    depth={1}
                    defaultOpen={cls.sections.length <= 2}
                  >
                    {cls.sections.map((sec) => (
                      <TreeRow
                        key={sec.id}
                        icon={GraduationCap}
                        label={`Section ${sec.name}`}
                        meta={`${sec.students_count} students`}
                        depth={2}
                      >
                        {sec.class_teacher ? (
                          <TreeRow
                            icon={Users}
                            label={`Class teacher: ${sec.class_teacher}`}
                            depth={3}
                          />
                        ) : null}
                        {sec.students.map((st) => (
                          <TreeRow
                            key={st.id}
                            icon={GraduationCap}
                            label={`${st.roll_number} — ${st.name}`}
                            depth={3}
                          />
                        ))}
                        {sec.timetable.length > 0 ? (
                          <TreeRow
                            icon={BookOpen}
                            label="Weekly timetable"
                            meta={`${sec.timetable.length} slots`}
                            depth={3}
                            defaultOpen
                          >
                            {sec.timetable.map((slot) => (
                              <TreeRow
                                key={slot.id}
                                icon={BookOpen}
                                label={`${slot.day} · ${slot.subject}`}
                                meta={[slot.period, slot.time, slot.teacher]
                                  .filter(Boolean)
                                  .join(' · ')}
                                depth={4}
                              />
                            ))}
                          </TreeRow>
                        ) : (
                          <p
                            className="py-1 text-xs text-neutral-500"
                            style={{ paddingLeft: `${3 * 16 + 32}px` }}
                          >
                            No timetable entries yet
                          </p>
                        )}
                      </TreeRow>
                    ))}
                  </TreeRow>
                ))}

                <TreeRow
                  icon={Users}
                  label="Teachers"
                  meta={`${data.teachers.length} staff`}
                  depth={1}
                >
                  {data.teachers.map((t) => (
                    <TreeRow
                      key={t.id}
                      icon={Users}
                      label={t.name ?? 'Teacher'}
                      meta={t.subject_specialization ?? undefined}
                      depth={2}
                    >
                      {t.sections.length === 0 ? (
                        <p
                          className="py-1 text-xs text-neutral-500"
                          style={{ paddingLeft: `${2 * 16 + 32}px` }}
                        >
                          No homeroom section assigned
                        </p>
                      ) : (
                        t.sections.map((s) => (
                          <TreeRow
                            key={s.id}
                            icon={Layers}
                            label={`${s.class} — Section ${s.name}`}
                            depth={3}
                          />
                        ))
                      )}
                    </TreeRow>
                  ))}
                </TreeRow>
              </TreeRow>
            </CardContent>
          </Card>

          <p className="text-sm text-neutral-500">
            Tip: assign students in{' '}
            <Link href="/admin/students" className="text-indigo-600 hover:underline">
              Students
            </Link>
            , sections in{' '}
            <Link href="/admin/classes" className="text-indigo-600 hover:underline">
              Classes & Sections
            </Link>
            , and weekly slots in{' '}
            <Link href="/admin/timetable" className="text-indigo-600 hover:underline">
              Timetable
            </Link>
            .
          </p>
        </>
      )}
    </div>
  );
}


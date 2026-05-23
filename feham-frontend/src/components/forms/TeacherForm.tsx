'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SectionOption, Teacher } from '@/types';

export interface TeacherFormValues {
  name: string;
  email: string;
  password: string;
  phone: string;
  cnic: string;
  subject_specialization: string;
  base_salary: string;
  joining_date: string;
  employee_code: string;
  section_ids: number[];
}

const emptyValues: TeacherFormValues = {
  name: '',
  email: '',
  password: '',
  phone: '',
  cnic: '',
  subject_specialization: '',
  base_salary: '',
  joining_date: '',
  employee_code: '',
  section_ids: [],
};

interface TeacherFormProps {
  sections: SectionOption[];
  initial?: Teacher | null;
  isEdit?: boolean;
  loading?: boolean;
  onSubmit: (values: TeacherFormValues) => void;
  onCancel: () => void;
}

export function TeacherForm({
  sections,
  initial,
  isEdit,
  loading,
  onSubmit,
  onCancel,
}: TeacherFormProps) {
  const [values, setValues] = useState<TeacherFormValues>(emptyValues);

  useEffect(() => {
    if (initial) {
      setValues({
        name: initial.user?.name ?? '',
        email: initial.user?.email ?? '',
        password: '',
        phone: initial.phone ?? '',
        cnic: initial.cnic ?? '',
        subject_specialization: initial.subject_specialization ?? '',
        base_salary: initial.base_salary != null ? String(initial.base_salary) : '',
        joining_date: initial.joining_date ? String(initial.joining_date).slice(0, 10) : '',
        employee_code: initial.employee_code ?? '',
        section_ids: initial.assigned_sections?.map((s) => s.id) ?? [],
      });
    } else {
      setValues(emptyValues);
    }
  }, [initial]);

  const set = (key: keyof TeacherFormValues, value: string | number[]) =>
    setValues((v) => ({ ...v, [key]: value }));

  const toggleSection = (id: number) => {
    setValues((v) => ({
      ...v,
      section_ids: v.section_ids.includes(id)
        ? v.section_ids.filter((x) => x !== id)
        : [...v.section_ids, id],
    }));
  };

  const grouped = sections.reduce<Record<string, SectionOption[]>>((acc, s) => {
    const key = s.school_class?.name ?? 'Other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            className="mt-1"
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
            required
          />
        </div>
        {!isEdit && (
          <>
            <div className="sm:col-span-2">
              <Label htmlFor="email">Email (login)</Label>
              <Input
                id="email"
                type="email"
                className="mt-1"
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="password">Password (optional — auto-generated if empty)</Label>
              <Input
                id="password"
                type="password"
                className="mt-1"
                value={values.password}
                onChange={(e) => set('password', e.target.value)}
              />
            </div>
          </>
        )}
        <div>
          <Label htmlFor="employee_code">Employee code</Label>
          <Input
            id="employee_code"
            className="mt-1"
            value={values.employee_code}
            onChange={(e) => set('employee_code', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="subject">Subject specialization</Label>
          <Input
            id="subject"
            className="mt-1"
            value={values.subject_specialization}
            onChange={(e) => set('subject_specialization', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            className="mt-1"
            value={values.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="cnic">CNIC</Label>
          <Input
            id="cnic"
            className="mt-1"
            value={values.cnic}
            onChange={(e) => set('cnic', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="salary">Base salary (PKR)</Label>
          <Input
            id="salary"
            type="number"
            min={0}
            className="mt-1"
            value={values.base_salary}
            onChange={(e) => set('base_salary', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="joining_date">Joining date</Label>
          <Input
            id="joining_date"
            type="date"
            className="mt-1"
            value={values.joining_date}
            onChange={(e) => set('joining_date', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label className="mb-2 block">Class teacher for sections</Label>
        <p className="mb-3 text-xs text-neutral-500">
          Select which class sections this teacher is the homeroom teacher for.
        </p>
        <div className="max-h-48 space-y-3 overflow-y-auto rounded-lg border border-neutral-200 p-3">
          {Object.keys(grouped).length === 0 ? (
            <p className="text-sm text-neutral-500">No sections yet. Add classes and sections first.</p>
          ) : (
            Object.entries(grouped).map(([className, secs]) => (
              <div key={className}>
                <p className="mb-1 text-xs font-semibold uppercase text-neutral-500">{className}</p>
                <div className="flex flex-wrap gap-2">
                  {secs.map((s) => (
                    <label
                      key={s.id}
                      className="flex cursor-pointer items-center gap-2 rounded-md border border-neutral-200 px-2 py-1 text-sm hover:bg-neutral-50 has-[:checked]:border-indigo-600 has-[:checked]:bg-indigo-50"
                    >
                      <input
                        type="checkbox"
                        checked={values.section_ids.includes(s.id)}
                        onChange={() => toggleSection(s.id)}
                        className="rounded border-neutral-300"
                      />
                      Section {s.name}
                    </label>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Add teacher'}
        </Button>
      </div>
    </form>
  );
}


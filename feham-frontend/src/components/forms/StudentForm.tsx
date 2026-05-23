'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { SchoolClassItem, Student } from '@/types';

export interface StudentFormValues {
  name: string;
  roll_number: string;
  school_class_id: string;
  section_id: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_cnic: string;
  date_of_birth: string;
  gender: string;
  address: string;
  parent_email: string;
  parent_password: string;
}

const emptyValues: StudentFormValues = {
  name: '',
  roll_number: '',
  school_class_id: '',
  section_id: '',
  guardian_name: '',
  guardian_phone: '',
  guardian_cnic: '',
  date_of_birth: '',
  gender: '',
  address: '',
  parent_email: '',
  parent_password: '',
};

interface StudentFormProps {
  classes: SchoolClassItem[];
  initial?: Student | null;
  suggestedRoll?: string;
  isEdit?: boolean;
  loading?: boolean;
  onSubmit: (values: StudentFormValues) => void;
  onCancel: () => void;
  onRequestRoll?: () => void;
}

export function StudentForm({
  classes,
  initial,
  suggestedRoll,
  isEdit,
  loading,
  onSubmit,
  onCancel,
  onRequestRoll,
}: StudentFormProps) {
  const [values, setValues] = useState<StudentFormValues>(emptyValues);

  useEffect(() => {
    if (initial) {
      setValues({
        name: initial.name,
        roll_number: initial.roll_number,
        school_class_id: initial.section?.school_class?.id
          ? String(initial.section.school_class.id)
          : '',
        section_id: initial.section_id ? String(initial.section_id) : String(initial.section?.id ?? ''),
        guardian_name: initial.guardian_name,
        guardian_phone: initial.guardian_phone,
        guardian_cnic: initial.guardian_cnic ?? '',
        date_of_birth: initial.date_of_birth ? String(initial.date_of_birth).slice(0, 10) : '',
        gender: initial.gender ?? '',
        address: initial.address ?? '',
        parent_email: initial.parent_user?.email ?? '',
        parent_password: '',
      });
    } else {
      setValues({ ...emptyValues, roll_number: suggestedRoll ?? '' });
    }
  }, [initial, suggestedRoll]);

  useEffect(() => {
    if (!initial && suggestedRoll && !values.roll_number) {
      setValues((v) => ({ ...v, roll_number: suggestedRoll }));
    }
  }, [suggestedRoll, initial, values.roll_number]);

  const set = (key: keyof StudentFormValues, value: string) =>
    setValues((v) => ({ ...v, [key]: value }));

  const classSections =
    classes.find((c) => String(c.id) === values.school_class_id)?.sections ?? [];

  const handleClassChange = (classId: string) => {
    const cls = classes.find((c) => String(c.id) === classId);
    const firstSection = cls?.sections?.[0];
    setValues((v) => ({
      ...v,
      school_class_id: classId,
      section_id: firstSection ? String(firstSection.id) : '',
    }));
  };

  return (
    <form
      className="mt-6 space-y-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(values);
      }}
    >
      <div className="space-y-4">
        <p className="text-sm font-semibold text-neutral-900">Student details</p>
        <div>
          <Label htmlFor="st-name">Full name</Label>
          <Input
            id="st-name"
            className="mt-1"
            required
            value={values.name}
            onChange={(e) => set('name', e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Label htmlFor="st-roll">Roll number</Label>
            <Input
              id="st-roll"
              className="mt-1"
              required
              value={values.roll_number}
              onChange={(e) => set('roll_number', e.target.value)}
            />
          </div>
          {!isEdit && onRequestRoll ? (
            <Button type="button" variant="outline" className="shrink-0 sm:mt-7" onClick={onRequestRoll}>
              Suggest
            </Button>
          ) : null}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="st-class">Class</Label>
            <select
              id="st-class"
              required
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={values.school_class_id}
              onChange={(e) => handleClassChange(e.target.value)}
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="st-section">Section</Label>
            <select
              id="st-section"
              required
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={values.section_id}
              onChange={(e) => set('section_id', e.target.value)}
              disabled={!values.school_class_id}
            >
              <option value="">Select section</option>
              {classSections.map((s) => (
                <option key={s.id} value={s.id}>
                  Section {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="st-dob">Date of birth</Label>
            <Input
              id="st-dob"
              type="date"
              className="mt-1"
              value={values.date_of_birth}
              onChange={(e) => set('date_of_birth', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="st-gender">Gender</Label>
            <select
              id="st-gender"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={values.gender}
              onChange={(e) => set('gender', e.target.value)}
            >
              <option value="">Not specified</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
        <div>
          <Label htmlFor="st-address">Address</Label>
          <Input
            id="st-address"
            className="mt-1"
            value={values.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4 border-t border-neutral-200 pt-6">
        <p className="text-sm font-semibold text-neutral-900">Guardian / parent</p>
        <div>
          <Label htmlFor="st-guardian">Guardian name</Label>
          <Input
            id="st-guardian"
            className="mt-1"
            required
            value={values.guardian_name}
            onChange={(e) => set('guardian_name', e.target.value)}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="st-phone">Guardian phone</Label>
            <Input
              id="st-phone"
              className="mt-1"
              required
              placeholder="+92-300-1234567"
              value={values.guardian_phone}
              onChange={(e) => set('guardian_phone', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="st-cnic">Guardian CNIC (optional)</Label>
            <Input
              id="st-cnic"
              className="mt-1"
              placeholder="35202-1234567-1"
              value={values.guardian_cnic}
              onChange={(e) => set('guardian_cnic', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4 border-t border-neutral-200 pt-6">
        <p className="text-sm font-semibold text-neutral-900">Parent portal login</p>
        <p className="text-xs text-neutral-500">
          Parents use this email to sign in and view challans, homework, and remarks.
        </p>
        <div>
          <Label htmlFor="st-parent-email">Parent email</Label>
          <Input
            id="st-parent-email"
            type="email"
            className="mt-1"
            placeholder="parent@example.com"
            value={values.parent_email}
            onChange={(e) => set('parent_email', e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="st-parent-pass">
            {isEdit ? 'New password (leave blank to keep)' : 'Parent password'}
          </Label>
          <Input
            id="st-parent-pass"
            type="password"
            className="mt-1"
            minLength={8}
            placeholder={isEdit ? '••••••••' : 'Min. 8 characters'}
            value={values.parent_password}
            onChange={(e) => set('parent_password', e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-2 pt-2 sm:grid-cols-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 bg-indigo-600 hover:bg-indigo-700"
          disabled={loading}
        >
          {loading ? 'Saving…' : isEdit ? 'Update student' : 'Add student'}
        </Button>
      </div>
    </form>
  );
}



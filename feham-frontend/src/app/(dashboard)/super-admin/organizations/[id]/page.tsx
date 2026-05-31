'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, LogIn } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import type { School, User } from '@/types';

export default function OrganizationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const qc = useQueryClient();
  const startImpersonation = useAuthStore((s) => s.startImpersonation);
  const id = params.id;

  const { data, isLoading } = useQuery({
    queryKey: ['super-admin-organization', id],
    queryFn: () =>
      api
        .get<{ school: School; admins: User[] }>(`/super-admin/organizations/${id}`)
        .then((r) => r.data),
  });

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    plan: 'starter',
    billing_status: 'trial',
    student_limit: '',
    notes: '',
  });

  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  useEffect(() => {
    if (!data?.school) return;
    const s = data.school;
    setForm({
      name: s.name,
      email: s.email ?? '',
      phone: s.phone ?? '',
      address: s.address ?? '',
      plan: s.plan ?? 'starter',
      billing_status: s.billing_status ?? 'trial',
      student_limit: s.student_limit ? String(s.student_limit) : '',
      notes: s.notes ?? '',
    });
    const admin = s.primary_admin ?? data.admins[0];
    if (admin) {
      setAdminForm({ name: admin.name, email: admin.email, password: '' });
    }
  }, [data]);

  const saveSchool = useMutation({
    mutationFn: () =>
      api.put(`/super-admin/organizations/${id}`, {
        ...form,
        student_limit: form.student_limit ? Number(form.student_limit) : null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin-organization', id] });
      qc.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      toast.success('Organization updated');
    },
    onError: () => toast.error('Could not update organization'),
  });

  const saveAdmin = useMutation({
    mutationFn: () =>
      api.post(`/super-admin/organizations/${id}/admin`, {
        name: adminForm.name,
        email: adminForm.email,
        password: adminForm.password || undefined,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin-organization', id] });
      toast.success('Admin account updated');
      setAdminForm((f) => ({ ...f, password: '' }));
    },
    onError: () => toast.error('Could not update admin'),
  });

  const impersonate = useMutation({
    mutationFn: () => api.post(`/super-admin/organizations/${id}/impersonate`),
    onSuccess: (res) => {
      const { user, school, token } = res.data;
      startImpersonation(user, token, school);
      toast.success(`Now viewing ${school.name} as admin`);
      router.push('/admin');
    },
    onError: () => toast.error('Could not impersonate admin'),
  });

  if (isLoading || !data) {
    return <p className="text-neutral-600">Loading organization...</p>;
  }

  const { school } = data;

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title={school.name} description={`Organization slug: ${school.slug}`}>
        <Link
          href="/super-admin/organizations"
          className="inline-flex h-9 items-center rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium hover:bg-neutral-50"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Link>
        <Button
          className="bg-indigo-600 hover:bg-indigo-700"
          disabled={!school.is_active || impersonate.isPending}
          onClick={() => impersonate.mutate()}
        >
          <LogIn className="mr-2 h-4 w-4" />
          Impersonate admin
        </Button>
      </PageHeader>

      <div className="flex flex-wrap gap-2">
        <Badge variant={school.is_active ? 'outline' : 'secondary'}>
          {school.is_active ? 'Active' : 'Inactive'}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {school.plan}
        </Badge>
        <Badge variant="secondary" className="capitalize">
          {school.billing_status}
        </Badge>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Students', value: school.students_count ?? 0 },
          { label: 'Teachers', value: school.teachers_count ?? 0 },
          { label: 'Admins', value: school.admins_count ?? 0 },
        ].map((s) => (
          <Card key={s.label} className="border-neutral-200">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-indigo-700">{s.value}</p>
              <p className="text-sm text-neutral-600">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Organization details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(['name', 'email', 'phone', 'address'] as const).map((key) => (
              <div key={key}>
                <Label className="capitalize">{key}</Label>
                <Input
                  className="mt-1"
                  value={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              </div>
            ))}
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Plan</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                  value={form.plan}
                  onChange={(e) => setForm({ ...form, plan: e.target.value })}
                >
                  <option value="starter">Starter</option>
                  <option value="standard">Standard</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              <div>
                <Label>Billing status</Label>
                <select
                  className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                  value={form.billing_status}
                  onChange={(e) => setForm({ ...form, billing_status: e.target.value })}
                >
                  <option value="trial">Trial</option>
                  <option value="active">Active</option>
                  <option value="past_due">Past due</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <Label>Student limit</Label>
              <Input
                type="number"
                className="mt-1"
                value={form.student_limit}
                onChange={(e) => setForm({ ...form, student_limit: e.target.value })}
              />
            </div>
            <div>
              <Label>Notes</Label>
              <Input
                className="mt-1"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
            <Button
              className="w-full bg-indigo-600 hover:bg-indigo-700 sm:w-auto"
              onClick={() => saveSchool.mutate()}
              disabled={saveSchool.isPending}
            >
              Save organization
            </Button>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardHeader>
            <CardTitle>Primary admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={adminForm.name}
                onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                className="mt-1"
                value={adminForm.email}
                onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              />
            </div>
            <div>
              <Label>New password (optional)</Label>
              <Input
                type="password"
                className="mt-1"
                placeholder="Leave blank to keep current"
                value={adminForm.password}
                onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              />
            </div>
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => saveAdmin.mutate()}
              disabled={saveAdmin.isPending}
            >
              Update admin credentials
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

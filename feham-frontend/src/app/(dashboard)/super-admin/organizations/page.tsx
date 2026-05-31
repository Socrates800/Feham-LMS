'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Building2, Eye, Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { toast } from 'sonner';
import { PageHeader } from '@/components/dashboard/PageHeader';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import api from '@/lib/api';
import { unwrapList } from '@/lib/api-helpers';
import { cn } from '@/lib/utils';
import type { School } from '@/types';

const emptyForm = {
  name: '',
  address: '',
  phone: '',
  email: '',
  plan: 'starter',
  billing_status: 'trial',
  student_limit: '500',
  admin_name: '',
  admin_email: '',
  admin_password: '',
};

function statusBadge(active: boolean) {
  return active
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-red-200 bg-red-50 text-red-700';
}

export default function OrganizationsPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [billingFilter, setBillingFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const params: Record<string, string> = {};
  if (search.trim()) params.search = search.trim();
  if (statusFilter) params.is_active = statusFilter;
  if (billingFilter) params.billing_status = billingFilter;

  const { data: organizations = [], isLoading } = useQuery({
    queryKey: ['super-admin-organizations', params],
    queryFn: () =>
      api.get('/super-admin/organizations', { params }).then((r) => unwrapList<School>(r.data)),
  });

  const createOrg = useMutation({
    mutationFn: () => api.post('/super-admin/organizations', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      qc.invalidateQueries({ queryKey: ['super-admin-dashboard'] });
      setCreateOpen(false);
      setForm(emptyForm);
      toast.success('Organization created');
    },
    onError: () => toast.error('Could not create organization'),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, active }: { id: number; active: boolean }) =>
      api.patch(`/super-admin/organizations/${id}/${active ? 'activate' : 'deactivate'}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['super-admin-organizations'] });
      qc.invalidateQueries({ queryKey: ['super-admin-dashboard'] });
      toast.success('Organization updated');
    },
    onError: () => toast.error('Could not update status'),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Organizations" description="Create and manage schools on the platform">
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add organization
        </Button>
      </PageHeader>

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 xl:flex-row xl:items-center">
            <div className="flex min-h-11 flex-1 items-center gap-2 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <Input
                placeholder="Search name, slug, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <select
                className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <select
                className="h-11 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 text-sm"
                value={billingFilter}
                onChange={(e) => setBillingFilter(e.target.value)}
              >
                <option value="">All billing</option>
                <option value="trial">Trial</option>
                <option value="active">Active</option>
                <option value="past_due">Past due</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading organizations...</p>
          ) : organizations.length === 0 ? (
            <p className="p-6 text-neutral-600">No organizations match your filters.</p>
          ) : (
            <Table className="min-w-[880px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Organization</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Billing</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Admin</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.map((org) => (
                  <TableRow key={org.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-indigo-600" />
                        <div>
                          <p className="font-medium">{org.name}</p>
                          <p className="text-xs text-neutral-500">{org.slug}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="capitalize">{org.plan ?? 'starter'}</TableCell>
                    <TableCell className="capitalize">{org.billing_status ?? 'trial'}</TableCell>
                    <TableCell>{org.students_count ?? 0}</TableCell>
                    <TableCell className="text-sm">{org.primary_admin?.email ?? '—'}</TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          'inline-flex rounded-full border px-3 py-1 text-xs font-medium',
                          statusBadge(!!org.is_active)
                        )}
                      >
                        {org.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/super-admin/organizations/${org.id}`}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-neutral-100"
                          aria-label="View"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleActive.mutate({ id: org.id, active: !org.is_active })
                          }
                        >
                          {org.is_active ? 'Deactivate' : 'Activate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add organization</DialogTitle>
            <DialogDescription>Create a school and its primary admin account.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label>School name</Label>
              <Input className="mt-1" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
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
                <Label>Student limit</Label>
                <Input
                  type="number"
                  className="mt-1"
                  value={form.student_limit}
                  onChange={(e) => setForm({ ...form, student_limit: e.target.value })}
                />
              </div>
            </div>
            <div className="border-t border-neutral-200 pt-4">
              <p className="mb-3 text-sm font-semibold">Primary admin</p>
              <div className="grid gap-3">
                <Input placeholder="Admin name" value={form.admin_name} onChange={(e) => setForm({ ...form, admin_name: e.target.value })} />
                <Input type="email" placeholder="Admin email" value={form.admin_email} onChange={(e) => setForm({ ...form, admin_email: e.target.value })} />
                <Input type="password" placeholder="Password (min 8)" value={form.admin_password} onChange={(e) => setForm({ ...form, admin_password: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={createOrg.isPending || !form.name || !form.admin_name || !form.admin_email || !form.admin_password}
              onClick={() => createOrg.mutate()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

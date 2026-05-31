'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
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
import type { LeaveRequestStatus, Teacher, TeacherLeaveRequest } from '@/types';

type Decision = 'approved' | 'rejected';

export default function AdminLeaveRequestsPage() {
  const qc = useQueryClient();
  const [statusFilter, setStatusFilter] = useState('');
  const [teacherFilter, setTeacherFilter] = useState('');
  const [activeRequest, setActiveRequest] = useState<TeacherLeaveRequest | null>(null);
  const [decision, setDecision] = useState<Decision>('approved');
  const [adminNote, setAdminNote] = useState('');

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/admin/teachers').then((r) => unwrapList<Teacher>(r.data)),
  });

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (statusFilter) p.status = statusFilter;
    if (teacherFilter) p.teacher_id = teacherFilter;
    return p;
  }, [statusFilter, teacherFilter]);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['admin-leave-requests', params],
    queryFn: () =>
      api
        .get('/admin/leave-requests', { params })
        .then((r) => unwrapList<TeacherLeaveRequest>(r.data)),
  });

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter((request) => request.status === 'pending').length,
      approved: requests.filter((request) => request.status === 'approved').length,
      rejected: requests.filter((request) => request.status === 'rejected').length,
    }),
    [requests]
  );

  const review = useMutation({
    mutationFn: () =>
      api.put(`/admin/leave-requests/${activeRequest?.id}`, {
        status: decision,
        admin_note: adminNote || null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-leave-requests'] });
      setActiveRequest(null);
      setAdminNote('');
      toast.success(decision === 'approved' ? 'Leave approved' : 'Leave rejected');
    },
    onError: () => toast.error('Could not update leave request'),
  });

  const openDecision = (request: TeacherLeaveRequest, nextDecision: Decision) => {
    setActiveRequest(request);
    setDecision(nextDecision);
    setAdminNote(request.admin_note ?? '');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Leave Requests"
        description="Review teacher leave requests and respond with approval or rejection reasons"
      />

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 text-sm text-amber-900">
          Approving an <strong>unpaid</strong> leave automatically deducts salary for the approved
          dates using that teacher&apos;s per-day base salary. Rejecting it removes that unpaid leave
          deduction from any existing salary slip.
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total" value={stats.total} />
        <StatCard label="Pending" value={stats.pending} tone="amber" />
        <StatCard label="Approved" value={stats.approved} tone="emerald" />
        <StatCard label="Rejected" value={stats.rejected} tone="red" />
      </div>

      <Card className="border-neutral-200">
        <CardContent className="grid gap-4 p-4 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="leave-status-filter">
              Status
            </label>
            <select
              id="leave-status-filter"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-neutral-700" htmlFor="leave-teacher-filter">
              Teacher
            </label>
            <select
              id="leave-teacher-filter"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
              value={teacherFilter}
              onChange={(event) => setTeacherFilter(event.target.value)}
            >
              <option value="">All teachers</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user?.name}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading leave requests...</p>
          ) : requests.length === 0 ? (
            <p className="p-6 text-neutral-600">No leave requests match these filters.</p>
          ) : (
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Teacher</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Teacher reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin reason</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.teacher?.user?.name}</TableCell>
                    <TableCell className="capitalize">{request.leave_type}</TableCell>
                    <TableCell>
                      {formatDate(request.start_date)} to {formatDate(request.end_date)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm text-neutral-600">
                      {request.admin_note || '—'}
                    </TableCell>
                    <TableCell className="text-right">
                      {request.status === 'pending' ? (
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openDecision(request, 'approved')}
                          >
                            <CheckCircle2 className="mr-1 h-4 w-4 text-emerald-600" />
                            Approve
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => openDecision(request, 'rejected')}
                          >
                            <XCircle className="mr-1 h-4 w-4 text-red-600" />
                            Reject
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-neutral-500">
                          Reviewed by {request.reviewer?.name ?? 'admin'}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!activeRequest} onOpenChange={(open) => !open && setActiveRequest(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{decision === 'approved' ? 'Approve leave' : 'Reject leave'}</DialogTitle>
            <DialogDescription>
              Add an admin reason or note. The teacher will see this on their leave request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-600">
              <p className="font-medium text-neutral-900">{activeRequest?.teacher?.user?.name}</p>
              <p className="mt-1">{activeRequest?.reason}</p>
            </div>
            <div>
              <Label htmlFor="admin-note">Admin reason / note</Label>
              <textarea
                id="admin-note"
                className="mt-1 min-h-[120px] w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                placeholder={
                  decision === 'approved'
                    ? 'Approved. Please coordinate with your class coverage.'
                    : 'Rejected because coverage is not available.'
                }
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActiveRequest(null)}>
              Cancel
            </Button>
            <Button
              className={cn(
                decision === 'approved'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
              disabled={review.isPending}
              onClick={() => review.mutate()}
            >
              {decision === 'approved' ? 'Approve' : 'Reject'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: 'amber' | 'emerald' | 'red' }) {
  return (
    <Card className="border-neutral-200">
      <CardContent className="p-4">
        <p className="text-sm text-neutral-500">{label}</p>
        <p
          className={cn(
            'mt-1 text-2xl font-bold text-neutral-900',
            tone === 'amber' && 'text-amber-700',
            tone === 'emerald' && 'text-emerald-700',
            tone === 'red' && 'text-red-700'
          )}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

function StatusBadge({ status }: { status: LeaveRequestStatus }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'capitalize',
        status === 'approved' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
        status === 'rejected' && 'border-red-200 bg-red-50 text-red-700',
        status === 'pending' && 'border-amber-200 bg-amber-50 text-amber-700'
      )}
    >
      {status}
    </Badge>
  );
}

function formatDate(value: string) {
  return String(value).slice(0, 10);
}

'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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
import type { LeaveRequestStatus, TeacherLeaveRequest, TeacherLeaveType } from '@/types';

const leaveTypes: Array<{ value: TeacherLeaveType; label: string }> = [
  { value: 'casual', label: 'Casual' },
  { value: 'sick', label: 'Sick' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'unpaid', label: 'Unpaid' },
  { value: 'other', label: 'Other' },
];

const emptyForm = {
  leave_type: 'casual' as TeacherLeaveType,
  start_date: new Date().toISOString().slice(0, 10),
  end_date: new Date().toISOString().slice(0, 10),
  reason: '',
};

export default function TeacherLeaveRequestsPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ['teacher-leave-requests'],
    queryFn: () =>
      api.get('/teacher/leave-requests').then((r) => unwrapList<TeacherLeaveRequest>(r.data)),
  });

  const create = useMutation({
    mutationFn: () => api.post('/teacher/leave-requests', form),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['teacher-leave-requests'] });
      setOpen(false);
      setForm(emptyForm);
      toast.success('Leave request submitted');
    },
    onError: () => toast.error('Could not submit leave request'),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader
        title="Leave Requests"
        description="Request leave and track admin approval status"
      >
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Request leave
        </Button>
      </PageHeader>

      <Card className="border-neutral-200">
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading leave requests...</p>
          ) : requests.length === 0 ? (
            <p className="p-6 text-neutral-600">
              No leave requests yet. Submit a request with dates and reason when you need time off.
            </p>
          ) : (
            <Table className="min-w-[760px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Admin reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium capitalize">
                      {request.leave_type.replace('_', ' ')}
                    </TableCell>
                    <TableCell>
                      {formatDate(request.start_date)} to {formatDate(request.end_date)}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <StatusBadge status={request.status} />
                    </TableCell>
                    <TableCell className="max-w-xs text-sm text-neutral-600">
                      {request.admin_note || '—'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Request leave</DialogTitle>
            <DialogDescription>
              Add the leave type, dates, and your reason. Admin will approve or reject it.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div>
              <Label htmlFor="leave-type">Leave type</Label>
              <select
                id="leave-type"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={form.leave_type}
                onChange={(event) =>
                  setForm({ ...form, leave_type: event.target.value as TeacherLeaveType })
                }
              >
                {leaveTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="leave-start">Start date</Label>
                <Input
                  id="leave-start"
                  type="date"
                  className="mt-1"
                  value={form.start_date}
                  onChange={(event) => setForm({ ...form, start_date: event.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="leave-end">End date</Label>
                <Input
                  id="leave-end"
                  type="date"
                  className="mt-1"
                  value={form.end_date}
                  onChange={(event) => setForm({ ...form, end_date: event.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="leave-reason">Reason</Label>
              <textarea
                id="leave-reason"
                className="mt-1 min-h-[120px] w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                placeholder="Explain why you need leave..."
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              disabled={
                create.isPending ||
                !form.start_date ||
                !form.end_date ||
                !form.reason.trim() ||
                form.end_date < form.start_date
              }
              onClick={() => create.mutate()}
            >
              Submit request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
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

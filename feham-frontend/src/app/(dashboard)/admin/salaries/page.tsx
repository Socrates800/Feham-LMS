'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  Download,
  FileText,
  Receipt,
  Search,
  UserCheck,
  Wallet,
} from 'lucide-react';
import { useMemo, useState } from 'react';
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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
import type { SalarySlip, Teacher } from '@/types';

function money(value: number | string | undefined) {
  return `PKR ${Number(value ?? 0).toLocaleString()}`;
}

function monthLabel(month: string) {
  if (!month) return '';
  const [year, m] = month.split('-');
  return new Date(Number(year), Number(m) - 1).toLocaleString('en', {
    month: 'short',
    year: 'numeric',
  });
}

function statusClass(status: string) {
  return status === 'issued'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : 'border-amber-200 bg-amber-50 text-amber-700';
}

export default function SalariesPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [teacherFilter, setTeacherFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generateTeacherId, setGenerateTeacherId] = useState('');
  const [allowances, setAllowances] = useState('');
  const [deductions, setDeductions] = useState('');
  const [viewSlip, setViewSlip] = useState<SalarySlip | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: teachers = [] } = useQuery({
    queryKey: ['teachers'],
    queryFn: () => api.get('/admin/teachers').then((r) => unwrapList<Teacher>(r.data)),
  });

  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (monthFilter) p.month = monthFilter;
    if (teacherFilter) p.teacher_id = teacherFilter;
    if (statusFilter) p.status = statusFilter;
    return p;
  }, [monthFilter, teacherFilter, statusFilter]);

  const { data: slips = [], isLoading } = useQuery({
    queryKey: ['salary-slips', params],
    queryFn: () =>
      api.get('/admin/salary-slips', { params }).then((r) => unwrapList<SalarySlip>(r.data)),
  });

  const filteredSlips = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return slips;
    return slips.filter(
      (s) =>
        s.teacher?.user?.name?.toLowerCase().includes(q) ||
        s.teacher?.employee_code?.toLowerCase().includes(q) ||
        s.teacher?.subject_specialization?.toLowerCase().includes(q)
    );
  }, [slips, search]);

  const stats = useMemo(() => {
    const gross = filteredSlips.reduce(
      (sum, s) => sum + Number(s.base_salary ?? 0) + Number(s.allowances ?? 0),
      0
    );
    const net = filteredSlips.reduce((sum, s) => sum + Number(s.net_salary ?? 0), 0);
    const deductionTotal = filteredSlips.reduce((sum, s) => sum + Number(s.deductions ?? 0), 0);
    return { count: filteredSlips.length, gross, net, deductions: deductionTotal };
  }, [filteredSlips]);

  const totalPages = Math.max(1, Math.ceil(filteredSlips.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedSlips = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredSlips.slice(start, start + pageSize);
  }, [filteredSlips, pageSize, safePage]);
  const paginationStart = filteredSlips.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const paginationEnd = Math.min(safePage * pageSize, filteredSlips.length);

  const generate = useMutation({
    mutationFn: () =>
      api.post('/admin/salary-slips/generate', {
        month: generateMonth,
        teacher_id: generateTeacherId ? Number(generateTeacherId) : null,
        allowances: allowances ? Number(allowances) : 0,
        deductions: deductions ? Number(deductions) : 0,
      }),
    onSuccess: (response) => {
      toast.success(response.data?.message ?? 'Salary slips generated');
      setGenerateOpen(false);
      setMonthFilter(generateMonth);
      setTeacherFilter(generateTeacherId);
      qc.invalidateQueries({ queryKey: ['salary-slips'] });
    },
    onError: () => toast.error('Could not generate salary slips'),
  });

  const downloadPdf = async (slip: SalarySlip) => {
    try {
      const res = await api.get(`/admin/salary-slips/${slip.id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `salary-slip-${slip.teacher?.employee_code ?? slip.id}-${slip.month}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download salary slip');
    }
  };

  const resetPage = () => setPage(1);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Salary Management"
        description="Generate teacher salary slips, review salary breakdowns, and download PDFs"
      >
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setGenerateOpen(true)}>
          <Receipt className="mr-2 h-4 w-4" />
          Generate salary slips
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Visible slips', value: stats.count, icon: FileText },
          { label: 'Gross payroll', value: money(stats.gross), icon: Wallet },
          { label: 'Deductions', value: money(stats.deductions), icon: Banknote },
          { label: 'Net payroll', value: money(stats.net), icon: UserCheck },
        ].map(({ label, value, icon: Icon }) => (
          <Card key={label} className="border-neutral-200">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-700">
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-xl font-bold text-neutral-900">{value}</p>
                <p className="text-sm text-neutral-600">{label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden border-neutral-200">
        <CardContent className="p-0">
          <div className="flex flex-col gap-4 border-b border-neutral-200 bg-white p-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex min-h-11 flex-1 items-center gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3">
              <Search className="h-4 w-4 shrink-0 text-neutral-400" />
              <Input
                placeholder="Search teacher, employee code, subject..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-3 xl:w-auto">
              <Input
                type="month"
                value={monthFilter}
                onChange={(e) => {
                  setMonthFilter(e.target.value);
                  resetPage();
                }}
                className="h-11 min-w-[160px] rounded-xl bg-neutral-50"
              />
              <select
                className="h-11 min-w-[180px] rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={teacherFilter}
                onChange={(e) => {
                  setTeacherFilter(e.target.value);
                  resetPage();
                }}
              >
                <option value="">All teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name}
                  </option>
                ))}
              </select>
              <select
                className="h-11 min-w-[150px] rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  resetPage();
                }}
              >
                <option value="">All statuses</option>
                <option value="draft">Draft</option>
                <option value="issued">Issued</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <p className="p-6 text-neutral-600">Loading salary slips...</p>
          ) : filteredSlips.length === 0 ? (
            <p className="p-6 text-neutral-600">
              No salary slips found. Generate slips for the selected month.
            </p>
          ) : (
            <div className="px-5 pb-5 pt-4">
              <div className="overflow-hidden rounded-xl border border-neutral-200">
                <Table className="table-fixed">
                  <TableHeader className="bg-neutral-50">
                    <TableRow className="hover:bg-neutral-50">
                      <TableHead className="w-[24%] px-4 py-4">Teacher</TableHead>
                      <TableHead className="w-[12%] px-4 py-4">Month</TableHead>
                      <TableHead className="w-[14%] px-4 py-4 text-right">Base</TableHead>
                      <TableHead className="w-[14%] px-4 py-4 text-right">Allowances</TableHead>
                      <TableHead className="w-[14%] px-4 py-4 text-right">Deductions</TableHead>
                      <TableHead className="w-[14%] px-4 py-4 text-right">Net</TableHead>
                      <TableHead className="w-[8%] px-4 py-4">Status</TableHead>
                      <TableHead className="w-[10%] px-4 py-4 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedSlips.map((slip) => (
                      <TableRow key={slip.id} className="hover:bg-indigo-50/30">
                        <TableCell className="px-4 py-4">
                          <div className="truncate font-medium">{slip.teacher?.user?.name}</div>
                          <div className="text-xs text-neutral-500">
                            {slip.teacher?.employee_code ?? 'No code'} ·{' '}
                            {slip.teacher?.subject_specialization ?? 'General'}
                          </div>
                        </TableCell>
                        <TableCell className="px-4 py-4">{monthLabel(slip.month)}</TableCell>
                        <TableCell className="px-4 py-4 text-right">{money(slip.base_salary)}</TableCell>
                        <TableCell className="px-4 py-4 text-right">{money(slip.allowances)}</TableCell>
                        <TableCell className="px-4 py-4 text-right">{money(slip.deductions)}</TableCell>
                        <TableCell className="px-4 py-4 text-right font-semibold">
                          {money(slip.net_salary)}
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <span
                            className={cn(
                              'inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium capitalize',
                              statusClass(slip.status)
                            )}
                          >
                            {slip.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setViewSlip(slip)}
                              aria-label="View salary slip"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => downloadPdf(slip)}
                              aria-label="Download salary PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="mt-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-neutral-600">
                  Showing {paginationStart}-{paginationEnd} of {filteredSlips.length} salary slips
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium text-neutral-700 shadow-sm transition-colors hover:bg-neutral-50"
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setPage(1);
                    }}
                  >
                    {[10, 20, 50].map((size) => (
                      <option key={size} value={size}>
                        {size} / page
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={safePage <= 1}
                    className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium shadow-sm hover:bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-400"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Prev
                  </Button>
                  <span className="min-w-16 text-center text-sm font-medium text-neutral-700">
                    {safePage} / {totalPages}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    disabled={safePage >= totalPages}
                    className="h-10 rounded-lg border border-neutral-200 bg-white px-3 text-sm font-medium shadow-sm hover:bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-400"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate salary slips</DialogTitle>
            <DialogDescription>
              Creates slips only for teachers who do not already have one for the selected month.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="salary-month">Month</Label>
              <Input
                id="salary-month"
                type="month"
                className="mt-1"
                value={generateMonth}
                onChange={(e) => setGenerateMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="salary-teacher">Teacher</Label>
              <select
                id="salary-teacher"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={generateTeacherId}
                onChange={(e) => setGenerateTeacherId(e.target.value)}
              >
                <option value="">All teachers</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.user?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="allowances">Allowances</Label>
                <Input
                  id="allowances"
                  type="number"
                  min={0}
                  className="mt-1"
                  placeholder="0"
                  value={allowances}
                  onChange={(e) => setAllowances(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="deductions">Deductions</Label>
                <Input
                  id="deductions"
                  type="number"
                  min={0}
                  className="mt-1"
                  placeholder="0"
                  value={deductions}
                  onChange={(e) => setDeductions(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => generate.mutate()}
              disabled={!generateMonth || generate.isPending}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewSlip} onOpenChange={(open) => !open && setViewSlip(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {viewSlip ? (
            <>
              <SheetHeader>
                <SheetTitle>{viewSlip.teacher?.user?.name}</SheetTitle>
                <SheetDescription>
                  Salary slip · {monthLabel(viewSlip.month)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6 pt-5 text-sm">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-neutral-500">Net salary</p>
                  <p className="mt-1 text-2xl font-bold">{money(viewSlip.net_salary)}</p>
                  <span
                    className={cn(
                      'mt-3 inline-flex rounded-full border px-3 py-1 text-xs font-medium capitalize',
                      statusClass(viewSlip.status)
                    )}
                  >
                    {viewSlip.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">Teacher</h4>
                  <p className="mt-2 text-neutral-600">{viewSlip.teacher?.user?.name}</p>
                  <p className="text-neutral-600">
                    {viewSlip.teacher?.employee_code ?? 'No employee code'} ·{' '}
                    {viewSlip.teacher?.subject_specialization ?? 'General'}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Salary breakdown</h4>
                  <div className="mt-2 space-y-2">
                    {[
                      ['Base salary', viewSlip.base_salary],
                      ['Allowances', viewSlip.allowances],
                      ['Deductions', viewSlip.deductions],
                      ['Net salary', viewSlip.net_salary],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2">
                        <span>{label}</span>
                        <span className="font-medium">{money(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" className="w-full" onClick={() => downloadPdf(viewSlip)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

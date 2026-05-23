'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Pencil,
  Plus,
  Receipt,
  Search,
  Trash2,
  XCircle,
} from 'lucide-react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import type { Challan, FeeItem, FeeStructure, SchoolClassItem } from '@/types';

type StructureFormValues = {
  name: string;
  school_class_id: string;
  items: Array<{ label: string; amount: string; is_optional: boolean }>;
};

const emptyStructure: StructureFormValues = {
  name: '',
  school_class_id: '',
  items: [
    { label: 'Tuition Fee', amount: '', is_optional: false },
    { label: 'Transport', amount: '', is_optional: true },
  ],
};

const paymentMethods = ['cash', 'bank', 'online'];

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
  if (status === 'paid') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'overdue') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-amber-200 bg-amber-50 text-amber-700';
}

function totalItems(items?: FeeItem[]) {
  return (items ?? []).reduce((sum, item) => sum + Number(item.amount ?? 0), 0);
}

export default function FeesPage() {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState('structures');
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [monthFilter, setMonthFilter] = useState(new Date().toISOString().slice(0, 7));
  const [statusFilter, setStatusFilter] = useState('');
  const [structureOpen, setStructureOpen] = useState(false);
  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [structureForm, setStructureForm] = useState<StructureFormValues>(emptyStructure);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [generateMonth, setGenerateMonth] = useState(new Date().toISOString().slice(0, 7));
  const [generateClassId, setGenerateClassId] = useState('');
  const [markingChallan, setMarkingChallan] = useState<Challan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('bank');
  const [viewChallan, setViewChallan] = useState<Challan | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => api.get('/admin/classes').then((r) => unwrapList<SchoolClassItem>(r.data)),
  });

  const { data: structures = [], isLoading: structuresLoading } = useQuery({
    queryKey: ['fee-structures'],
    queryFn: () => api.get('/admin/fee-structures').then((r) => unwrapList<FeeStructure>(r.data)),
  });

  const challanParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (monthFilter) params.month = monthFilter;
    if (statusFilter) params.status = statusFilter;
    if (classFilter) params.school_class_id = classFilter;
    return params;
  }, [monthFilter, statusFilter, classFilter]);

  const { data: challans = [], isLoading: challansLoading } = useQuery({
    queryKey: ['challans', challanParams],
    queryFn: () =>
      api.get('/admin/challans', { params: challanParams }).then((r) => unwrapList<Challan>(r.data)),
  });

  const filteredChallans = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return challans;
    return challans.filter(
      (c) =>
        c.challan_number.toLowerCase().includes(q) ||
        c.student?.name?.toLowerCase().includes(q) ||
        c.student?.roll_number?.toLowerCase().includes(q) ||
        c.student?.guardian_name?.toLowerCase().includes(q)
    );
  }, [challans, search]);

  const stats = useMemo(() => {
    const total = filteredChallans.reduce((sum, c) => sum + Number(c.total_amount ?? 0), 0);
    const paid = filteredChallans
      .filter((c) => c.status === 'paid')
      .reduce((sum, c) => sum + Number(c.total_amount ?? 0), 0);
    const pending = filteredChallans
      .filter((c) => c.status !== 'paid')
      .reduce((sum, c) => sum + Number(c.total_amount ?? 0), 0);
    return { total, paid, pending, count: filteredChallans.length };
  }, [filteredChallans]);

  const totalPages = Math.max(1, Math.ceil(filteredChallans.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedChallans = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredChallans.slice(start, start + pageSize);
  }, [filteredChallans, pageSize, safePage]);
  const paginationStart = filteredChallans.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const paginationEnd = Math.min(safePage * pageSize, filteredChallans.length);

  const saveStructure = useMutation({
    mutationFn: ({ values, id }: { values: StructureFormValues; id?: number }) => {
      const payload = {
        name: values.name,
        school_class_id: values.school_class_id ? Number(values.school_class_id) : null,
        items: values.items
          .filter((item) => item.label.trim() && item.amount !== '')
          .map((item) => ({
            label: item.label,
            amount: Number(item.amount),
            is_optional: item.is_optional,
          })),
      };
      if (id) return api.put(`/admin/fee-structures/${id}`, payload);
      return api.post('/admin/fee-structures', payload);
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: ['fee-structures'] });
      setStructureOpen(false);
      setEditingStructure(null);
      toast.success(variables.id ? 'Fee structure updated' : 'Fee structure created');
    },
    onError: () => toast.error('Could not save fee structure'),
  });

  const deleteStructure = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/fee-structures/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['fee-structures'] });
      toast.success('Fee structure deleted');
    },
    onError: () => toast.error('Could not delete fee structure'),
  });

  const generateChallans = useMutation({
    mutationFn: () =>
      api.post('/admin/challans/generate', {
        month: generateMonth,
        school_class_id: generateClassId ? Number(generateClassId) : null,
      }),
    onSuccess: (response) => {
      toast.success(response.data?.message ?? 'Challans generated');
      setMonthFilter(generateMonth);
      setClassFilter(generateClassId);
      setGenerateOpen(false);
      qc.invalidateQueries({ queryKey: ['challans'] });
    },
    onError: () => toast.error('Could not generate challans'),
  });

  const markPaid = useMutation({
    mutationFn: () =>
      api.put(`/admin/challans/${markingChallan?.id}/mark-paid`, {
        payment_method: paymentMethod,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['challans'] });
      setMarkingChallan(null);
      toast.success('Challan marked as paid');
    },
    onError: () => toast.error('Could not mark challan paid'),
  });

  const downloadPdf = async (challan: Challan) => {
    try {
      const res = await api.get(`/admin/challans/${challan.id}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(res.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${challan.challan_number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast.error('Could not download PDF');
    }
  };

  const openCreateStructure = () => {
    setEditingStructure(null);
    setStructureForm(emptyStructure);
    setStructureOpen(true);
  };

  const openEditStructure = (structure: FeeStructure) => {
    setEditingStructure(structure);
    setStructureForm({
      name: structure.name,
      school_class_id: structure.school_class_id ? String(structure.school_class_id) : '',
      items: (structure.items?.length ? structure.items : [{ label: '', amount: '', is_optional: false }]).map(
        (item) => ({
          label: item.label,
          amount: String(item.amount),
          is_optional: !!item.is_optional,
        })
      ),
    });
    setStructureOpen(true);
  };

  const addItem = () =>
    setStructureForm((form) => ({
      ...form,
      items: [...form.items, { label: '', amount: '', is_optional: false }],
    }));

  const updateItem = (index: number, key: 'label' | 'amount' | 'is_optional', value: string | boolean) =>
    setStructureForm((form) => ({
      ...form,
      items: form.items.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    }));

  const removeItem = (index: number) =>
    setStructureForm((form) => ({
      ...form,
      items: form.items.length === 1 ? form.items : form.items.filter((_, i) => i !== index),
    }));

  const canSaveStructure =
    structureForm.name.trim() &&
    structureForm.items.some((item) => item.label.trim() && Number(item.amount) > 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Fee Management"
        description="Create fee structures, generate monthly challans, download PDFs, and track payments"
      >
        <Button variant="outline" onClick={openCreateStructure}>
          <Plus className="mr-2 h-4 w-4" />
          Add structure
        </Button>
        <Button className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setGenerateOpen(true)}>
          <Receipt className="mr-2 h-4 w-4" />
          Generate challans
        </Button>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Visible challans', value: stats.count, icon: FileText },
          { label: 'Billed amount', value: money(stats.total), icon: Receipt },
          { label: 'Paid amount', value: money(stats.paid), icon: CheckCircle2 },
          { label: 'Pending amount', value: money(stats.pending), icon: Banknote },
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

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-4">
        <TabsList className="h-12 w-fit gap-1 rounded-2xl bg-neutral-100 p-1">
          <TabsTrigger
            value="structures"
            className={cn(
              'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
              activeTab === 'structures'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
            )}
          >
            Fee structures
          </TabsTrigger>
          <TabsTrigger
            value="challans"
            className={cn(
              'rounded-xl px-5 py-2.5 text-sm font-semibold transition-all',
              activeTab === 'challans'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'text-neutral-600 hover:bg-white/70 hover:text-neutral-900'
            )}
          >
            Challans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="structures" className="w-full">
          <div className="grid w-full gap-4 lg:grid-cols-2">
            {structuresLoading ? (
              <Card className="border-neutral-200">
                <CardContent className="p-6 text-neutral-600">Loading fee structures...</CardContent>
              </Card>
            ) : structures.length === 0 ? (
              <Card className="border-neutral-200">
                <CardContent className="p-6 text-neutral-600">
                  No fee structures yet. Create one for all classes or a specific class.
                </CardContent>
              </Card>
            ) : (
              structures.map((structure) => (
                <Card key={structure.id} className="border-neutral-200">
                  <CardContent className="space-y-4 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-900">{structure.name}</h3>
                        <p className="mt-1 text-sm text-neutral-500">
                          Applies to{' '}
                          <span className="font-medium text-neutral-700">
                            {structure.school_class?.name ?? 'All classes'}
                          </span>
                        </p>
                      </div>
                      <Badge variant="secondary">{money(totalItems(structure.items))}</Badge>
                    </div>
                    <div className="space-y-2">
                      {structure.items?.map((item) => (
                        <div
                          key={`${structure.id}-${item.label}`}
                          className="flex items-center justify-between rounded-lg bg-neutral-50 px-3 py-2 text-sm"
                        >
                          <span>
                            {item.label}
                            {item.is_optional ? (
                              <span className="ml-2 text-xs text-neutral-400">(optional)</span>
                            ) : null}
                          </span>
                          <span className="font-medium">{money(item.amount)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-end gap-2 border-t border-neutral-100 pt-3">
                      <Button variant="outline" size="sm" onClick={() => openEditStructure(structure)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          if (confirm(`Delete ${structure.name}?`)) {
                            deleteStructure.mutate(structure.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                        Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="challans" className="w-full">
          <Card className="border-neutral-200">
            <CardContent className="p-0">
              <div className="flex flex-col gap-3 border-b border-neutral-200 p-4 xl:flex-row xl:items-center">
                <div className="flex flex-1 items-center gap-2">
                  <Search className="h-4 w-4 shrink-0 text-neutral-400" />
                  <Input
                    placeholder="Search challan, student, roll no, guardian..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="border-0 shadow-none focus-visible:ring-0"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Input
                    type="month"
                    value={monthFilter}
                    onChange={(e) => {
                      setMonthFilter(e.target.value);
                      setPage(1);
                    }}
                    className="w-[150px]"
                  />
                  <select
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                    value={classFilter}
                    onChange={(e) => {
                      setClassFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All classes</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <select
                    className="rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setPage(1);
                    }}
                  >
                    <option value="">All statuses</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              {challansLoading ? (
                <p className="p-6 text-neutral-600">Loading challans...</p>
              ) : filteredChallans.length === 0 ? (
                <p className="p-6 text-neutral-600">
                  No challans found. Generate challans for the selected month and class.
                </p>
              ) : (
                <div className="px-5 pb-5 pt-4">
                  <div className="overflow-hidden rounded-xl border border-neutral-200">
                    <Table className="table-fixed">
                      <TableHeader className="bg-neutral-50">
                        <TableRow className="hover:bg-neutral-50">
                          <TableHead className="w-[14%] px-4 py-4">Challan</TableHead>
                          <TableHead className="w-[20%] px-4 py-4">Student</TableHead>
                          <TableHead className="w-[9%] px-4 py-4">Class</TableHead>
                          <TableHead className="w-[10%] px-4 py-4">Month</TableHead>
                          <TableHead className="w-[11%] px-4 py-4 text-right">Amount</TableHead>
                          <TableHead className="w-[11%] px-4 py-4">Due</TableHead>
                          <TableHead className="w-[12%] px-4 py-4">Status</TableHead>
                          <TableHead className="w-[13%] px-4 py-4 text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedChallans.map((challan) => (
                          <TableRow key={challan.id} className="hover:bg-indigo-50/30">
                            <TableCell className="truncate px-4 py-4 font-mono text-xs text-neutral-600">
                              {challan.challan_number}
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="truncate font-medium">{challan.student?.name ?? 'Student'}</div>
                              <div className="text-xs text-neutral-500">{challan.student?.roll_number}</div>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              {challan.student?.section?.school_class?.name}-{challan.student?.section?.name}
                            </TableCell>
                            <TableCell className="px-4 py-4">{monthLabel(challan.month)}</TableCell>
                            <TableCell className="px-4 py-4 text-right font-semibold">
                              {money(challan.total_amount)}
                            </TableCell>
                            <TableCell className="px-4 py-4">{String(challan.due_date).slice(0, 10)}</TableCell>
                            <TableCell className="px-4 py-4">
                              <span
                                className={cn(
                                  'inline-flex whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium capitalize',
                                  statusClass(challan.status)
                                )}
                              >
                                {challan.status}
                              </span>
                            </TableCell>
                            <TableCell className="px-4 py-4">
                              <div className="flex min-w-[92px] justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setViewChallan(challan)}
                              aria-label="View challan"
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => downloadPdf(challan)}
                              aria-label="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {challan.status !== 'paid' ? (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => {
                                  setMarkingChallan(challan);
                                  setPaymentMethod('bank');
                                }}
                                aria-label="Mark paid"
                              >
                                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                              </Button>
                            ) : null}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-neutral-600">
                      Showing {paginationStart}-{paginationEnd} of {filteredChallans.length} challans
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
                        <ChevronLeft className="mr-1 h-4 w-4" />
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
                        <ChevronRight className="ml-1 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Sheet open={structureOpen} onOpenChange={setStructureOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{editingStructure ? 'Edit fee structure' : 'Add fee structure'}</SheetTitle>
            <SheetDescription>
              Define monthly fee items for all classes or for one class.
            </SheetDescription>
          </SheetHeader>
          <form
            className="space-y-5 px-4 pb-6 pt-5"
            onSubmit={(e) => {
              e.preventDefault();
              saveStructure.mutate({ values: structureForm, id: editingStructure?.id });
            }}
          >
            <div>
              <Label htmlFor="fee-name">Structure name</Label>
              <Input
                id="fee-name"
                className="mt-1"
                placeholder="Standard Monthly Fee"
                value={structureForm.name}
                onChange={(e) => setStructureForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="fee-class">Applicable class</Label>
              <select
                id="fee-class"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={structureForm.school_class_id}
                onChange={(e) => setStructureForm((f) => ({ ...f, school_class_id: e.target.value }))}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Fee items</Label>
                <Button type="button" variant="outline" size="sm" onClick={addItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add row
                </Button>
              </div>
              {structureForm.items.map((item, index) => (
                <div key={index} className="rounded-xl border border-neutral-200 p-3">
                  <div className="grid gap-3 sm:grid-cols-[1fr_140px_auto]">
                    <Input
                      placeholder="Tuition Fee"
                      value={item.label}
                      onChange={(e) => updateItem(index, 'label', e.target.value)}
                    />
                    <Input
                      type="number"
                      min={0}
                      placeholder="3500"
                      value={item.amount}
                      onChange={(e) => updateItem(index, 'amount', e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeItem(index)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                  <label className="mt-3 flex items-center gap-2 text-sm text-neutral-600">
                    <input
                      type="checkbox"
                      checked={item.is_optional}
                      onChange={(e) => updateItem(index, 'is_optional', e.target.checked)}
                    />
                    Optional fee item
                  </label>
                </div>
              ))}
              <div className="rounded-lg bg-neutral-50 px-3 py-2 text-sm font-medium">
                Total: {money(structureForm.items.reduce((sum, item) => sum + Number(item.amount || 0), 0))}
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStructureOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                disabled={!canSaveStructure || saveStructure.isPending}
              >
                {saveStructure.isPending ? 'Saving...' : editingStructure ? 'Update structure' : 'Create structure'}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>

      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate monthly challans</DialogTitle>
            <DialogDescription>
              Creates challans for students who do not already have one for this month.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="generate-month">Month</Label>
              <Input
                id="generate-month"
                type="month"
                className="mt-1"
                value={generateMonth}
                onChange={(e) => setGenerateMonth(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="generate-class">Class</Label>
              <select
                id="generate-class"
                className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
                value={generateClassId}
                onChange={(e) => setGenerateClassId(e.target.value)}
              >
                <option value="">All classes</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700"
              onClick={() => generateChallans.mutate()}
              disabled={!generateMonth || generateChallans.isPending}
            >
              Generate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!markingChallan} onOpenChange={(open) => !open && setMarkingChallan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark challan as paid</DialogTitle>
            <DialogDescription>
              {markingChallan?.challan_number} · {money(markingChallan?.total_amount)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="payment-method">Payment method</Label>
            <select
              id="payment-method"
              className="mt-1 w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm capitalize"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              {paymentMethods.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMarkingChallan(null)}>
              Cancel
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={() => markPaid.mutate()}
              disabled={markPaid.isPending}
            >
              Mark paid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Sheet open={!!viewChallan} onOpenChange={(open) => !open && setViewChallan(null)}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          {viewChallan ? (
            <>
              <SheetHeader>
                <SheetTitle>{viewChallan.challan_number}</SheetTitle>
                <SheetDescription>
                  {viewChallan.student?.name} · {monthLabel(viewChallan.month)}
                </SheetDescription>
              </SheetHeader>
              <div className="space-y-5 px-4 pb-6 pt-5 text-sm">
                <div className="rounded-xl border border-neutral-200 p-4">
                  <p className="text-neutral-500">Total amount</p>
                  <p className="mt-1 text-2xl font-bold">{money(viewChallan.total_amount)}</p>
                  <p className="mt-2 text-neutral-500">Due {String(viewChallan.due_date).slice(0, 10)}</p>
                  <span
                    className={cn(
                      'mt-3 inline-flex rounded-full border px-2 py-1 text-xs font-medium capitalize',
                      statusClass(viewChallan.status)
                    )}
                  >
                    {viewChallan.status}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold">Student</h4>
                  <p className="mt-2 text-neutral-600">{viewChallan.student?.name}</p>
                  <p className="text-neutral-600">
                    {viewChallan.student?.section?.school_class?.name}-{viewChallan.student?.section?.name}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold">Fee breakdown</h4>
                  <div className="mt-2 space-y-2">
                    {viewChallan.fee_items_snapshot?.map((item, index) => (
                      <div key={`${item.label}-${index}`} className="flex justify-between rounded-lg bg-neutral-50 px-3 py-2">
                        <span>
                          {item.label}
                          {item.is_optional ? <span className="text-neutral-400"> (optional)</span> : null}
                        </span>
                        <span className="font-medium">{money(item.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {viewChallan.status === 'paid' ? (
                  <div>
                    <h4 className="font-semibold">Payment</h4>
                    <p className="mt-2 text-neutral-600">
                      Paid on {String(viewChallan.paid_date ?? '').slice(0, 10) || 'recorded date'}
                    </p>
                    <p className="capitalize text-neutral-600">
                      Method: {viewChallan.payment_method ?? 'bank'}
                    </p>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => downloadPdf(viewChallan)}>
                    <Download className="mr-2 h-4 w-4" />
                    PDF
                  </Button>
                  {viewChallan.status !== 'paid' ? (
                    <Button
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => {
                        setMarkingChallan(viewChallan);
                        setPaymentMethod('bank');
                      }}
                    >
                      Paid
                    </Button>
                  ) : (
                    <Button variant="outline" className="flex-1" disabled>
                      <XCircle className="mr-2 h-4 w-4" />
                      Closed
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}

'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Receipt } from 'lucide-react';
import { PageHeader } from '@/components/dashboard/PageHeader';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import type { Challan, Student } from '@/types';

export default function ParentChallansPage() {
  const [studentId, setStudentId] = useState('');

  const { data: children = [] } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => api.get('/parent/children').then((r) => unwrapList<Student>(r.data)),
  });

  const selectedStudentId = useMemo(() => {
    return studentId || (children[0]?.id ? String(children[0].id) : '');
  }, [children, studentId]);

  const { data: challans = [], isLoading } = useQuery({
    queryKey: ['parent-challans', selectedStudentId],
    queryFn: () =>
      api
        .get(`/parent/children/${selectedStudentId}/challans`)
        .then((r) => unwrapList<Challan>(r.data)),
    enabled: Boolean(selectedStudentId),
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      <PageHeader title="Fee Challans" description="View due and paid fee challans for your children" />

      {children.length > 1 ? (
        <select
          className="w-full max-w-sm rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm"
          value={selectedStudentId}
          onChange={(event) => setStudentId(event.target.value)}
        >
          {children.map((child) => (
            <option key={child.id} value={child.id}>
              {child.name} ({child.roll_number})
            </option>
          ))}
        </select>
      ) : null}

      <Card className="border-neutral-200">
        <CardHeader>
          <CardTitle className="text-base">Challans</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {!selectedStudentId ? (
            <EmptyState text="No students are linked to this parent login yet." />
          ) : isLoading ? (
            <p className="p-6 text-neutral-600">Loading challans...</p>
          ) : challans.length === 0 ? (
            <EmptyState text="No challans have been issued for this student yet." />
          ) : (
            <Table className="min-w-[640px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Challan</TableHead>
                  <TableHead>Month</TableHead>
                  <TableHead>Due date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {challans.map((challan) => (
                  <TableRow key={challan.id}>
                    <TableCell className="font-mono text-sm">{challan.challan_number}</TableCell>
                    <TableCell>{challan.month}</TableCell>
                    <TableCell>{String(challan.due_date).slice(0, 10)}</TableCell>
                    <TableCell>
                      <Badge variant={challan.status === 'paid' ? 'secondary' : 'outline'}>
                        {challan.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      Rs. {Number(challan.total_amount).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center gap-3 p-8 text-center text-sm text-neutral-600">
      <Receipt className="h-10 w-10 text-neutral-300" />
      <p>{text}</p>
    </div>
  );
}

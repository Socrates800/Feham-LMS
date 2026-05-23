import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'up' | 'down' | 'neutral';
  icon: LucideIcon;
  iconColor?: string;
}

export function StatCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  iconColor = 'text-indigo-600 bg-indigo-50',
}: StatCardProps) {
  return (
    <Card className="border-neutral-200">
      <CardContent className="flex items-start justify-between p-6">
        <div>
          <p className="text-sm text-neutral-600">{title}</p>
          <p className="mt-2 text-2xl font-bold text-neutral-900">{value}</p>
          {change && (
            <p
              className={cn(
                'mt-1 text-xs',
                changeType === 'up' && 'text-emerald-600',
                changeType === 'down' && 'text-red-500',
                changeType === 'neutral' && 'text-neutral-500'
              )}
            >
              {change}
            </p>
          )}
        </div>
        <div className={cn('rounded-lg p-3', iconColor)}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}



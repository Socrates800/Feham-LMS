import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, children, className }: PageHeaderProps) {
  return (
    <header className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-xl font-bold text-neutral-900 sm:text-2xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm text-neutral-600 sm:text-base">{description}</p> : null}
      </div>
      {children ? <div className="flex w-full flex-col gap-2 sm:w-auto sm:shrink-0 sm:flex-row sm:items-center">{children}</div> : null}
    </header>
  );
}

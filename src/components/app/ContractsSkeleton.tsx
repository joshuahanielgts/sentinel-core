import { Skeleton } from '@/components/ui/skeleton';

export function ContractsSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-52 bg-secondary/60" />
          <Skeleton className="h-5 w-10 bg-secondary/40" />
        </div>
        <Skeleton className="h-10 w-44 bg-secondary/50 rounded-md" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 bg-secondary/40 rounded-md" />
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-10 w-20 bg-secondary/30 rounded-md" />
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-lg p-4 flex items-center gap-4">
            <Skeleton className="w-10 h-10 rounded bg-secondary/50" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48 bg-secondary/50" />
              <Skeleton className="h-3 w-32 bg-secondary/30" />
            </div>
            <Skeleton className="h-5 w-20 rounded bg-secondary/40" />
          </div>
        ))}
      </div>
    </div>
  );
}

import { Skeleton } from '@/components/ui/skeleton';

export function ContractDetailSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Back + title */}
      <div className="space-y-2">
        <Skeleton className="h-4 w-32 bg-secondary/40" />
        <Skeleton className="h-8 w-64 bg-secondary/60" />
        <div className="flex gap-3">
          <Skeleton className="h-3 w-24 bg-secondary/30" />
          <Skeleton className="h-4 w-12 rounded bg-secondary/40" />
          <Skeleton className="h-3 w-16 bg-secondary/30" />
        </div>
      </div>

      {/* Top row: gauge + summary + intel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass rounded-lg p-5 flex items-center justify-center">
          <div className="w-[180px] h-[180px] rounded-full border-[16px] border-secondary/30 animate-pulse" />
        </div>
        <div className="glass rounded-lg p-5 space-y-3">
          <Skeleton className="h-4 w-40 bg-secondary/40" />
          <Skeleton className="h-3 w-full bg-secondary/30" />
          <Skeleton className="h-3 w-full bg-secondary/30" />
          <Skeleton className="h-3 w-3/4 bg-secondary/30" />
          <Skeleton className="h-3 w-5/6 bg-secondary/30" />
        </div>
        <div className="glass rounded-lg p-5 space-y-4">
          <Skeleton className="h-4 w-36 bg-secondary/40" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start gap-2">
              <Skeleton className="w-4 h-4 rounded-full bg-secondary/50 shrink-0" />
              <Skeleton className="h-3 w-full bg-secondary/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Clause list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36 bg-secondary/50" />
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-8 w-16 bg-secondary/30 rounded-md" />
            ))}
          </div>
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded bg-secondary/50" />
              <Skeleton className="h-4 w-56 bg-secondary/40" />
            </div>
            <Skeleton className="h-3 w-full bg-secondary/30" />
            <Skeleton className="h-3 w-2/3 bg-secondary/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

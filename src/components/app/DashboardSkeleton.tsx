import { Skeleton } from '@/components/ui/skeleton';

export function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-56 bg-secondary/60" />
        <Skeleton className="h-5 w-16 bg-secondary/40" />
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-lg p-5 space-y-3">
            <div className="flex items-center gap-3">
              <Skeleton className="w-8 h-8 rounded bg-secondary/50" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-28 bg-secondary/40" />
                <Skeleton className="h-8 w-16 bg-secondary/60" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass rounded-lg p-5 space-y-4">
          <Skeleton className="h-4 w-36 bg-secondary/40" />
          <div className="flex items-center justify-center h-[250px]">
            <div className="w-[180px] h-[180px] rounded-full border-[20px] border-secondary/30 animate-pulse" />
          </div>
          <div className="flex gap-4 justify-center">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-1.5">
                <Skeleton className="w-3 h-3 rounded-sm bg-secondary/50" />
                <Skeleton className="h-3 w-12 bg-secondary/40" />
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-lg p-5 space-y-4">
          <Skeleton className="h-4 w-48 bg-secondary/40" />
          <div className="flex items-end gap-6 h-[280px] pb-8 px-4">
            {[60, 40, 80, 30].map((h, i) => (
              <Skeleton
                key={i}
                className="flex-1 rounded-t bg-secondary/30"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Threat Feed */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="w-2 h-2 rounded-full bg-secondary/50" />
          <Skeleton className="h-4 w-40 bg-secondary/40" />
        </div>
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-16 rounded bg-secondary/50" />
              <Skeleton className="h-4 w-48 bg-secondary/40" />
            </div>
            <Skeleton className="h-3 w-full bg-secondary/30" />
            <Skeleton className="h-3 w-3/4 bg-secondary/30" />
          </div>
        ))}
      </div>
    </div>
  );
}

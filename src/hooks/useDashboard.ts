import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/api/dashboard';

export function useDashboard(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', workspaceId],
    queryFn: () => dashboardApi.getStats(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: 30000,
  });
}

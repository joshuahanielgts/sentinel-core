import { apiClient } from './client'
import type { DashboardStats } from '@/types/api'

export const dashboardApi = {
  getStats: (workspaceId: string) =>
    apiClient.get<DashboardStats>(`/dashboard/stats?workspace_id=${workspaceId}`),
}

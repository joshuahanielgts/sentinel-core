import { apiClient } from './client'
import type { Workspace, WorkspaceMember } from '@/types/api'

export const workspacesApi = {
  list: () => apiClient.get<Workspace[]>('/workspaces'),

  get: (id: string) => apiClient.get<Workspace>(`/workspaces/${id}`),

  create: (data: { name: string; slug: string }) =>
    apiClient.post<Workspace>('/workspaces', data),

  getMembers: (workspaceId: string) =>
    apiClient.get<WorkspaceMember[]>(`/workspaces/${workspaceId}/members`),

  addMember: (workspaceId: string, data: { email: string; role: 'admin' | 'member' }) =>
    apiClient.post<WorkspaceMember>(`/workspaces/${workspaceId}/members`, data),

  removeMember: (workspaceId: string, userId: string) =>
    apiClient.delete(`/workspaces/${workspaceId}/members`, { user_id: userId }),
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { workspacesApi } from '@/api/workspaces'

export function useWorkspaces() {
  return useQuery({
    queryKey: ['workspaces'],
    queryFn: () => workspacesApi.list(),
  })
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { name: string; slug: string }) => workspacesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
  })
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: () => workspacesApi.getMembers(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useAddMember(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: { email: string; role: 'admin' | 'member' }) =>
      workspacesApi.addMember(workspaceId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] })
    },
  })
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userId: string) => workspacesApi.removeMember(workspaceId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workspace-members', workspaceId] })
    },
  })
}

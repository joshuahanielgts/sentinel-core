import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { contractsApi } from '@/api/contracts'
import { supabase } from '@/lib/supabase'

export function useContracts(workspaceId: string) {
  return useQuery({
    queryKey: ['contracts', workspaceId],
    queryFn: () => contractsApi.list(workspaceId),
    enabled: !!workspaceId,
  })
}

export function useContract(contractId: string) {
  return useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractsApi.get(contractId),
    enabled: !!contractId,
  })
}

export function useUploadContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      file,
      name,
      workspaceId,
    }: {
      file: File
      name: string
      workspaceId: string
    }) => {
      const uploadData = await contractsApi.upload({
        name,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        workspace_id: workspaceId,
      })

      const { error: storageError } = await supabase.storage
        .from('contracts')
        .uploadToSignedUrl(uploadData.upload_path, uploadData.token, file)

      if (storageError) throw storageError

      await contractsApi.confirmUpload(uploadData.contract_id)

      return uploadData.contract_id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useAnalyzeContract() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contractId: string) => contractsApi.analyze(contractId),
    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] })
      queryClient.invalidateQueries({ queryKey: ['clauses', contractId] })
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

export function useClauses(contractId: string) {
  return useQuery({
    queryKey: ['clauses', contractId],
    queryFn: () => contractsApi.getClauses(contractId),
    enabled: !!contractId,
  })
}

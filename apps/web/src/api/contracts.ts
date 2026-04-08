import { apiClient } from './client'
import type { Contract, ContractClause, UploadContractResponse } from '@/types/api'

export const contractsApi = {
  list: (workspaceId: string) =>
    apiClient.get<Contract[]>(`/contracts?workspace_id=${workspaceId}`),

  get: (contractId: string) =>
    apiClient.get<Contract>(`/contracts/${contractId}`),

  upload: (data: {
    name: string
    file_name: string
    file_size: number
    mime_type: string
    workspace_id: string
  }) => apiClient.post<UploadContractResponse>('/contracts/upload', data),

  confirmUpload: (contractId: string) =>
    apiClient.patch<Contract>(`/contracts/${contractId}`, { status: 'uploaded' }),

  analyze: (contractId: string) =>
    apiClient.post<{
      contract_id: string
      risk_score: number
      overall_risk_level: string
      summary: string
      clauses_count: number
    }>(`/contracts/${contractId}/analyze`),

  getClauses: (contractId: string) =>
    apiClient.get<ContractClause[]>(`/contracts/${contractId}/clauses`),
}

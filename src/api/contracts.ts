import { apiClient } from './client';
import { supabase } from '@/lib/supabase';
import type { Contract, ContractClause, UploadContractResponse } from '@/types/api';

export const contractsApi = {
  list(workspaceId: string) {
    return apiClient.get<Contract[]>(`/contracts?workspace_id=${workspaceId}`);
  },

  get(contractId: string) {
    return apiClient.get<Contract>(`/contracts/${contractId}`);
  },

  getClauses(contractId: string) {
    return apiClient.get<ContractClause[]>(`/contracts/${contractId}/clauses`);
  },

  async upload(workspaceId: string, file: File, name: string): Promise<{ contract_id: string; upload_path: string; token: string }> {
    const result = await apiClient.post<UploadContractResponse>('/contracts/upload', {
      name,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type,
      workspace_id: workspaceId,
    });

    const { error } = await supabase.storage
      .from('contracts')
      .uploadToSignedUrl(result.upload_path, result.token, file);

    if (error) throw new Error(`Storage upload failed: ${error.message}`);

    await apiClient.patch<Contract>(`/contracts/${result.contract_id}`, { status: 'uploaded' });

    return result;
  },

  analyze(contractId: string) {
    return apiClient.post<{ status: string }>(`/contracts/${contractId}/analyze`);
  },
};

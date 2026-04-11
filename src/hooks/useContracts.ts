import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { contractsApi } from '@/api/contracts';
import type { Contract } from '@/types/api';

export function useContracts(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ['contracts', workspaceId],
    queryFn: () => contractsApi.list(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: (query) => {
      const data = query.state.data as Contract[] | undefined;
      if (data?.some((c) => c.status === 'analyzing' || c.status === 'pending')) return 5000;
      return false;
    },
  });
}

export function useContract(contractId: string | undefined) {
  const queryClient = useQueryClient();
  const prevStatus = useRef<string | undefined>();

  const query = useQuery({
    queryKey: ['contract', contractId],
    queryFn: () => contractsApi.get(contractId!),
    enabled: !!contractId,
    refetchInterval: (query) => {
      const data = query.state.data as Contract | undefined;
      if (data?.status === 'analyzing' || data?.status === 'pending') return 3000;
      return false;
    },
  });

  // When status transitions to 'complete', invalidate related queries
  useEffect(() => {
    const currentStatus = query.data?.status;
    if (prevStatus.current === 'analyzing' && currentStatus === 'complete') {
      queryClient.invalidateQueries({ queryKey: ['contract-clauses', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    }
    prevStatus.current = currentStatus;
  }, [query.data?.status, contractId, queryClient]);

  return query;
}

export function useContractClauses(contractId: string | undefined) {
  return useQuery({
    queryKey: ['contract-clauses', contractId],
    queryFn: () => contractsApi.getClauses(contractId!),
    enabled: !!contractId,
  });
}

export function useUploadContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ workspaceId, file, name }: { workspaceId: string; file: File; name: string }) =>
      contractsApi.upload(workspaceId, file, name),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['contracts', variables.workspaceId] });
    },
  });
}

export function useAnalyzeContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (contractId: string) => contractsApi.analyze(contractId),
    onSuccess: (_data, contractId) => {
      queryClient.invalidateQueries({ queryKey: ['contract', contractId] });
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

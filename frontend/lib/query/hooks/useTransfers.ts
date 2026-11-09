import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { transfersApiClient, AssetTransfer, CreateTransferInput } from '@/lib/api/transfers';
import { queryKeys } from '../keys';
import { toast, apiErrorMsg } from '@/lib/toast';

export function useTransfers() {
  return useQuery<AssetTransfer[]>({
    queryKey: queryKeys.transfers.list(),
    queryFn: () => transfersApiClient.getTransfers(),
  });
}

export function useTransfer(id?: string) {
  return useQuery<AssetTransfer>({
    queryKey: queryKeys.transfers.detail(id ?? ''),
    queryFn: () => transfersApiClient.getTransfer(id as string),
    enabled: !!id,
  });
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateTransferInput) => transfersApiClient.createTransfer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
      toast.success('Transfer request submitted');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to create transfer')),
  });
}

export function useApproveTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transfersApiClient.approveTransfer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
      toast.success('Transfer approved');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to approve transfer')),
  });
}

export function useRejectTransfer() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      transfersApiClient.rejectTransfer(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.transfers.all });
      toast.success('Transfer rejected');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to reject transfer')),
  });
}

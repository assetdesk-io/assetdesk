import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseOrdersApiClient, PurchaseOrder, CreatePurchaseOrderInput } from '@/lib/api/purchase-orders';
import { queryKeys } from '../keys';
import { toast, apiErrorMsg } from '@/lib/toast';

export function usePurchaseOrders() {
  return useQuery<PurchaseOrder[]>({
    queryKey: queryKeys.purchaseOrders.list(),
    queryFn: () => purchaseOrdersApiClient.getPurchaseOrders(),
  });
}

export function usePurchaseOrder(id?: string) {
  return useQuery<PurchaseOrder>({
    queryKey: queryKeys.purchaseOrders.detail(id ?? ''),
    queryFn: () => purchaseOrdersApiClient.getPurchaseOrder(id as string),
    enabled: !!id,
  });
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePurchaseOrderInput) => purchaseOrdersApiClient.createPurchaseOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      toast.success('Purchase order created');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to create purchase order')),
  });
}

export function useReceivePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApiClient.receive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      toast.success('Purchase order marked as received');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to receive purchase order')),
  });
}

export function useSubmitPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApiClient.submit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      toast.success('Purchase order submitted');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to submit purchase order')),
  });
}

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApiClient.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      toast.success('Purchase order approved');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to approve purchase order')),
  });
}

export function useCancelPurchaseOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseOrdersApiClient.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      toast.success('Purchase order cancelled');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to cancel purchase order')),
  });
}

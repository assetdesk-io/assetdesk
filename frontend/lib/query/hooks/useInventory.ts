import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  inventoryApiClient,
  InventoryItem,
  CreateInventoryItemInput,
  MovementType,
  StockMovementResult,
} from '@/lib/api/inventory';
import { queryKeys } from '../keys';
import { toast, apiErrorMsg } from '@/lib/toast';

export function useInventoryItems() {
  return useQuery<InventoryItem[]>({
    queryKey: queryKeys.inventory.list(),
    queryFn: () => inventoryApiClient.getItems(),
  });
}

export function useInventoryItem(id?: string) {
  return useQuery<InventoryItem>({
    queryKey: queryKeys.inventory.detail(id ?? ''),
    queryFn: () => inventoryApiClient.getItem(id as string),
    enabled: !!id,
  });
}

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateInventoryItemInput) => inventoryApiClient.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      toast.success('Inventory item added');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to create inventory item')),
  });
}

export function useRecordMovement() {
  const queryClient = useQueryClient();
  return useMutation<
    StockMovementResult,
    Error,
    { id: string; type: MovementType; quantity: number; reason?: string }
  >({
    mutationFn: ({ id, type, quantity, reason }) =>
      inventoryApiClient.recordMovement(id, type, quantity, reason),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.setQueryData(queryKeys.inventory.detail(result.item.id), result.item);
      toast.success('Stock movement recorded');
    },
    onError: (err) => toast.error(apiErrorMsg(err, 'Failed to record movement')),
  });
}

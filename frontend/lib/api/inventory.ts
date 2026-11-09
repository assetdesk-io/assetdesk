import { api } from '../api';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  categoryId?: string;
  unit: string;
  quantityOnHand: number;
  reorderLevel: number;
  unitCost: number;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateInventoryItemInput {
  sku: string;
  name: string;
  categoryId?: string;
  unit?: string;
  quantityOnHand?: number;
  reorderLevel?: number;
  unitCost?: number;
  locationId?: string;
}

export interface UpdateInventoryItemInput {
  name?: string;
  unit?: string;
  reorderLevel?: number;
  unitCost?: number;
  categoryId?: string;
  locationId?: string;
}

export type MovementType = 'IN' | 'OUT' | 'ADJUSTMENT';

export interface StockMovementResult {
  item: InventoryItem;
  movement: {
    id: string;
    itemId: string;
    type: MovementType;
    quantity: number;
    reason?: string;
    actorUserId: string;
    timestamp: string;
  };
}

export const inventoryApiClient = {
  getItems: (): Promise<InventoryItem[]> =>
    api.get<InventoryItem[]>('/inventory').then((r) => r.data),

  getItem: (id: string): Promise<InventoryItem> =>
    api.get<InventoryItem>(`/inventory/${id}`).then((r) => r.data),

  createItem: (data: CreateInventoryItemInput): Promise<InventoryItem> =>
    api.post<InventoryItem>('/inventory', data).then((r) => r.data),

  updateItem: (id: string, data: UpdateInventoryItemInput): Promise<InventoryItem> =>
    api.patch<InventoryItem>(`/inventory/${id}`, data).then((r) => r.data),

  recordMovement: (
    id: string,
    type: MovementType,
    quantity: number,
    reason?: string,
  ): Promise<StockMovementResult> =>
    api
      .post<StockMovementResult>(`/inventory/${id}/movements`, { type, quantity, reason })
      .then((r) => r.data),
};

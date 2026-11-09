import { api } from '../api';

export enum POStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  RECEIVED = 'RECEIVED',
  CANCELLED = 'CANCELLED',
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  vendorId?: string;
  status: POStatus;
  totalAmount: number;
  currency: string;
  createdByUserId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePurchaseOrderInput {
  vendorId?: string;
  totalAmount?: number;
  currency?: string;
  poNumber?: string;
}

export const purchaseOrdersApiClient = {
  getPurchaseOrders: (): Promise<PurchaseOrder[]> =>
    api.get<PurchaseOrder[]>('/purchase-orders').then((r) => r.data),

  getPurchaseOrder: (id: string): Promise<PurchaseOrder> =>
    api.get<PurchaseOrder>(`/purchase-orders/${id}`).then((r) => r.data),

  createPurchaseOrder: (data: CreatePurchaseOrderInput): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>('/purchase-orders', data).then((r) => r.data),

  receive: (id: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/receive`).then((r) => r.data),

  submit: (id: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/submit`).then((r) => r.data),

  approve: (id: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/approve`).then((r) => r.data),

  cancel: (id: string): Promise<PurchaseOrder> =>
    api.post<PurchaseOrder>(`/purchase-orders/${id}/cancel`).then((r) => r.data),
};

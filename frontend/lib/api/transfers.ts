import { api } from '../api';

export enum TransferStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface AssetTransfer {
  id: string;
  assetId: string;
  fromDepartmentId: string;
  toDepartmentId: string;
  requestedByUserId: string;
  approvedByUserId?: string;
  status: TransferStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTransferInput {
  assetId: string;
  fromDepartmentId: string;
  toDepartmentId: string;
}

export const transfersApiClient = {
  getTransfers: (): Promise<AssetTransfer[]> =>
    api.get<AssetTransfer[]>('/transfers').then((r) => r.data),

  getTransfer: (id: string): Promise<AssetTransfer> =>
    api.get<AssetTransfer>(`/transfers/${id}`).then((r) => r.data),

  createTransfer: (data: CreateTransferInput): Promise<AssetTransfer> =>
    api.post<AssetTransfer>('/transfers', data).then((r) => r.data),

  approveTransfer: (id: string): Promise<AssetTransfer> =>
    api.post<AssetTransfer>(`/transfers/${id}/approve`).then((r) => r.data),

  rejectTransfer: (id: string, reason?: string): Promise<AssetTransfer> =>
    api
      .post<AssetTransfer>(`/transfers/${id}/reject`, { reason: reason || '' })
      .then((r) => r.data),
};

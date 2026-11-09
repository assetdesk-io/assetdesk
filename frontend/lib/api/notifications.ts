import { api } from '../api';

export enum NotificationType {
  INFO = 'INFO',
  WARNING = 'WARNING',
  ALERT = 'ALERT',
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message?: string;
  type: NotificationType;
  isRead: boolean;
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export const notificationsApiClient = {
  getNotifications: (): Promise<Notification[]> =>
    api.get<Notification[]>('/notifications').then((r) => r.data),

  markAsRead: (id: string): Promise<Notification> =>
    api.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),

  markAllRead: (): Promise<void> =>
    api.patch('/notifications/read-all').then(() => undefined),
};

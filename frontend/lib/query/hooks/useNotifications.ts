import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notificationsApiClient, Notification } from '@/lib/api/notifications';
import { queryKeys } from '../keys';

export function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationsApiClient.getNotifications(),
    // Poll every 30 seconds for new notifications
    refetchInterval: 30_000,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApiClient.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApiClient.markAllRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.all });
    },
  });
}

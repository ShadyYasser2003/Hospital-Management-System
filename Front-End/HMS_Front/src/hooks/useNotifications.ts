import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import notificationService from '@/services/notificationService';

export const NOTIFICATIONS_KEY = 'notifications';

/** Paginated — used by badge dropdown */
export const useNotifications = (userId: number | string | undefined, page = 0, size = 20) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, userId, page],
    queryFn: () => notificationService.getAll(userId!, page, size),
    enabled: !!userId,
    refetchInterval: 10000,
    staleTime: 5000,
  });

/** Full non-paginated list — used by the Notifications page */
export const useAllNotifications = (userId: number | string | undefined) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'all-list', userId],
    queryFn: () => notificationService.getAllList(userId!),
    enabled: !!userId,
    refetchInterval: 10000,
    staleTime: 5000,
  });

export const useUnreadNotifications = (userId: number | string | undefined) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread', userId],
    queryFn: () => notificationService.getUnread(userId!),
    enabled: !!userId,
    refetchInterval: 10000,
    staleTime: 5000,
  });

export const useUnreadCount = (userId: number | string | undefined) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'count', userId],
    queryFn: () => notificationService.countUnread(userId!),
    enabled: !!userId,
    refetchInterval: 10000,
    staleTime: 5000,
  });

export const useMarkAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => notificationService.markAsRead(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
};

export const useMarkAllAsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: number | string) => notificationService.markAllAsRead(userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => notificationService.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY] }),
  });
};

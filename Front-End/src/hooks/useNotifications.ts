/**
 * Notification hooks.
 *
 * useWebSocketNotifications — manages the WebSocket connection and injects
 * incoming real-time notifications straight into the React Query cache so
 * every component re-renders immediately without polling.
 *
 * All other hooks (useAllNotifications, useUnreadNotifications, etc.) remain
 * unchanged — they fall back to REST fetching / 30-second polling as a safety net.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useCallback } from 'react';
import notificationService, { NotificationDto } from '@/services/notificationService';
import { wsService } from '@/services/websocketService';

export const NOTIFICATIONS_KEY = 'notifications';

// ── WebSocket hook ────────────────────────────────────────────────────────

/**
 * Call this ONCE at the top-level layout component.
 * It establishes a WebSocket connection and keeps the React Query cache
 * up-to-date whenever a notification is pushed from the server.
 */
export const useWebSocketNotifications = (
  userId: string | number | undefined,
  token: string | null | undefined,
) => {
  const qc = useQueryClient();
  const connectedRef = useRef(false);

  const onNotification = useCallback(
    (notification: NotificationDto) => {
      if (!userId) return;

      const uid = String(userId);

      // 1. Prepend to the "all list" cache
      qc.setQueryData<NotificationDto[]>(
        [NOTIFICATIONS_KEY, 'all-list', uid],
        (prev = []) => [notification, ...prev],
      );

      // 2. Prepend to the "unread" cache
      qc.setQueryData<NotificationDto[]>(
        [NOTIFICATIONS_KEY, 'unread', uid],
        (prev = []) => [notification, ...prev],
      );

      // 3. Invalidate count so badge re-renders
      qc.invalidateQueries({ queryKey: [NOTIFICATIONS_KEY, 'count', uid] });
    },
    [qc, userId],
  );

  useEffect(() => {
    if (!userId || !token) {
      wsService.disconnect();
      connectedRef.current = false;
      return;
    }

    if (!connectedRef.current) {
      wsService.connect(String(userId), token, onNotification);
      connectedRef.current = true;
    }

    return () => {
      wsService.disconnect();
      connectedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, token]);
};

// ── REST query hooks ───────────────────────────────────────────────────────

/** Paginated — kept for backward compatibility */
export const useNotifications = (
  userId: number | string | undefined,
  page = 0,
  size = 20,
) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, userId, page],
    queryFn: () => notificationService.getAll(userId!, page, size),
    enabled: !!userId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

/** Full non-paginated list — used by the Notifications page */
export const useAllNotifications = (userId: number | string | undefined) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'all-list', userId],
    queryFn: () => notificationService.getAllList(userId!),
    enabled: !!userId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

export const useUnreadNotifications = (userId: number | string | undefined) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'unread', userId],
    queryFn: () => notificationService.getUnread(userId!),
    enabled: !!userId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

export const useUnreadCount = (userId: number | string | undefined) =>
  useQuery({
    queryKey: [NOTIFICATIONS_KEY, 'count', userId],
    queryFn: () => notificationService.countUnread(userId!),
    enabled: !!userId,
    refetchInterval: 30_000,
    staleTime: 10_000,
  });

// ── Mutation hooks ─────────────────────────────────────────────────────────

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

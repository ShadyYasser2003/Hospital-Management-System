import api from '@/lib/api';

export interface NotificationDto {
  id: number;
  title: string;
  message: string;
  type: string;
  read: boolean;
  actionUrl?: string;
  createdAt: string;
  readAt?: string;
  recipientId: number;
}

const notificationService = {
  /** Paginated — used by badge dropdown */
  async getAll(userId: number | string, page = 0, size = 20): Promise<{ content: NotificationDto[]; totalElements: number }> {
    const { data } = await api.get(`/api/notifications/user/${userId}`, { params: { page, size } });
    return {
      content: data.content ?? [],
      totalElements: data.page?.totalElements ?? data.totalElements ?? 0,
    };
  },

  /** Non-paginated full list — used by the Notifications page */
  async getAllList(userId: number | string): Promise<NotificationDto[]> {
    const { data } = await api.get<NotificationDto[]>(`/api/notifications/user/${userId}/all`);
    return data;
  },

  async getUnread(userId: number | string): Promise<NotificationDto[]> {
    const { data } = await api.get<NotificationDto[]>(`/api/notifications/user/${userId}/unread`);
    return data;
  },

  async countUnread(userId: number | string): Promise<number> {
    const { data } = await api.get<{ count: number }>(`/api/notifications/user/${userId}/unread/count`);
    return data.count;
  },

  async markAsRead(notificationId: number | string): Promise<NotificationDto> {
    const { data } = await api.put<NotificationDto>(`/api/notifications/${notificationId}/read`);
    return data;
  },

  async markAllAsRead(userId: number | string): Promise<number> {
    const { data } = await api.put<{ updated: number }>(`/api/notifications/user/${userId}/read-all`);
    return data.updated;
  },

  async delete(notificationId: number | string): Promise<void> {
    await api.delete(`/api/notifications/${notificationId}`);
  },
};

export default notificationService;

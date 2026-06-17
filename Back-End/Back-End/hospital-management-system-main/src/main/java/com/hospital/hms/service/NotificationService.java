package com.hospital.hms.service;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.NotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {

    /** Create and persist a notification for a specific user */
    void sendNotification(Long recipientId, String title, String message,
                          NotificationType type, String actionUrl);

    /** Get all notifications for a user (paginated) */
    Page<NotificationDTO> getNotifications(Long recipientId, Pageable pageable);

    /** Get all notifications for a user (non-paginated, for full page view) */
    List<NotificationDTO> getAllNotifications(Long recipientId);

    /** Get only unread notifications */
    List<NotificationDTO> getUnreadNotifications(Long recipientId);

    /** Count unread notifications */
    long countUnread(Long recipientId);

    /** Mark a single notification as read */
    NotificationDTO markAsRead(Long notificationId);

    /** Mark all notifications as read for a user */
    int markAllAsRead(Long recipientId);

    /** Delete a notification */
    void deleteNotification(Long notificationId);
}

package com.hospital.hms.service;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.NotificationDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface NotificationService {
    void sendNotification(Long recipientId, String title, String message,
                          NotificationType type, String actionUrl);
    Page<NotificationDTO> getNotifications(Long recipientId, Pageable pageable);
    List<NotificationDTO> getAllNotifications(Long recipientId);
    List<NotificationDTO> getUnreadNotifications(Long recipientId);
    long countUnread(Long recipientId);
    NotificationDTO markAsRead(Long notificationId);
    int markAllAsRead(Long recipientId);
    void deleteNotification(Long notificationId);
}

package com.hospital.hms.service;

import com.hospital.hms.dto.NotificationDTO;

/**
 * Pushes notification DTOs to connected WebSocket clients in real-time.
 */
public interface WebSocketNotificationService {

    /**
     * Push a notification to a specific user via their personal STOMP queue.
     * If the user is not currently connected, the message is silently dropped
     * (they will receive it via email and/or on next REST fetch).
     *
     * @param userId  the target user's database ID
     * @param payload the notification to deliver
     */
    void pushToUser(Long userId, NotificationDTO payload);
}

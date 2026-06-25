package com.hospital.hms.service.implementation;

import com.hospital.hms.dto.NotificationDTO;
import com.hospital.hms.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * Delivers notifications to connected WebSocket clients via STOMP.
 *
 * Each user subscribes to:
 *   /user/{userId}/queue/notifications
 *
 * The SimpMessagingTemplate.convertAndSendToUser() call targets exactly
 * that destination for the given principal name (userId as String).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class WebSocketNotificationServiceImpl implements WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    /** Destination suffix — clients subscribe to /user/{id}/queue/notifications */
    private static final String NOTIFICATION_DESTINATION = "/queue/notifications";

    @Override
    public void pushToUser(Long userId, NotificationDTO payload) {
        try {
            // convertAndSendToUser prepends the userDestinationPrefix (/user)
            // and routes to /user/{userId}/queue/notifications
            messagingTemplate.convertAndSendToUser(
                    String.valueOf(userId),
                    NOTIFICATION_DESTINATION,
                    payload
            );
            log.debug("WebSocket push → user {} : {}", userId, payload.getTitle());
        } catch (Exception e) {
            // WebSocket failures must never break the main notification flow
            log.warn("WebSocket push failed for user {}: {}", userId, e.getMessage());
        }
    }
}

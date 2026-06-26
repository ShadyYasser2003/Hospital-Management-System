package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.config.UserSessionRegistry;
import com.hospital.hms.dto.NotificationDTO;
import com.hospital.hms.entity.Notification;
import com.hospital.hms.entity.User;
import com.hospital.hms.mapper.NotificationMapper;
import com.hospital.hms.repository.NotificationRepository;
import com.hospital.hms.repository.UserRepository;
import com.hospital.hms.service.EmailNotificationService;
import com.hospital.hms.service.NotificationService;
import com.hospital.hms.service.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Core notification service.
 *
 * Delivery strategy per sendNotification() call:
 *  1. Persist notification to DB (always)
 *  2. If user is ONLINE  → push via WebSocket (real-time)
 *  3. If user is OFFLINE → send email instead
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository      notificationRepository;
    private final UserRepository              userRepository;
    private final WebSocketNotificationService webSocketService;
    private final EmailNotificationService    emailService;
    private final UserSessionRegistry         sessionRegistry;

    // ── Core send ──────────────────────────────────────────────────────────

    @Override
    @Async("notificationExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(Long recipientId,
                                 String title,
                                 String message,
                                 NotificationType type,
                                 String actionUrl) {
        try {
            User recipient = userRepository.findById(recipientId).orElse(null);
            if (recipient == null) {
                log.warn("Notification skipped — recipient not found: {}", recipientId);
                return;
            }

            // 1. Persist
            Notification notification = Notification.builder()
                    .title(title)
                    .message(message)
                    .type(type)
                    .actionUrl(actionUrl)
                    .read(false)
                    .recipient(recipient)
                    .createdAt(LocalDateTime.now())
                    .build();
            Notification saved = notificationRepository.save(notification);
            NotificationDTO dto = NotificationMapper.mapToDto(saved);

            log.debug("Notification persisted — user={} type={} id={}", recipientId, type, saved.getId());

            boolean online = sessionRegistry.isOnline(recipientId);

            // Always push via WebSocket if user is connected
            if (online) {
                webSocketService.pushToUser(recipientId, dto);
                log.debug("Delivery: WebSocket push → user {} (online)", recipientId);
            }

            // Always send email regardless of online status
            if (recipient.getEmail() != null && !recipient.getEmail().isBlank()) {
                emailService.sendNotificationEmail(
                        recipient.getEmail(), title, message, actionUrl);
                log.debug("Delivery: Email sent → user {}", recipientId);
            }

        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", recipientId, e.getMessage(), e);
        }
    }

    // ── Query operations ───────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationDTO> getNotifications(Long recipientId, Pageable pageable) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId, pageable)
                .map(NotificationMapper::mapToDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getAllNotifications(Long recipientId) {
        return notificationRepository
                .findByRecipientIdOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(NotificationMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDTO> getUnreadNotifications(Long recipientId) {
        return notificationRepository
                .findByRecipientIdAndReadFalseOrderByCreatedAtDesc(recipientId)
                .stream()
                .map(NotificationMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(Long recipientId) {
        return notificationRepository.countByRecipientIdAndReadFalse(recipientId);
    }

    // ── Mutations ──────────────────────────────────────────────────────────

    @Override
    @Transactional
    public NotificationDTO markAsRead(Long notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + notificationId));
        n.setRead(true);
        n.setReadAt(LocalDateTime.now());
        return NotificationMapper.mapToDto(notificationRepository.save(n));
    }

    @Override
    @Transactional
    public int markAllAsRead(Long recipientId) {
        return notificationRepository.markAllAsReadByRecipient(recipientId);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        notificationRepository.deleteById(notificationId);
    }
}

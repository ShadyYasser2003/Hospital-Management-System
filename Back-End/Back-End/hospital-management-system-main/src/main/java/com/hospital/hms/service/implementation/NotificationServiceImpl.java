package com.hospital.hms.service.implementation;

import com.hospital.hms.Enum.NotificationType;
import com.hospital.hms.dto.NotificationDTO;
import com.hospital.hms.entity.Notification;
import com.hospital.hms.entity.User;
import com.hospital.hms.mapper.NotificationMapper;
import com.hospital.hms.repository.NotificationRepository;
import com.hospital.hms.repository.UserRepository;
import com.hospital.hms.service.NotificationService;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    /**
     * Sends a notification asynchronously.
     * Must return void for @Async to work correctly.
     * Uses REQUIRES_NEW so it runs in its own transaction independent of the caller.
     */
    @Override
    @Async("notificationExecutor")
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void sendNotification(Long recipientId, String title, String message,
                                 NotificationType type, String actionUrl) {
        try {
            User recipient = userRepository.findById(recipientId).orElse(null);
            if (recipient == null) {
                log.warn("Notification skipped — recipient not found: {}", recipientId);
                return;
            }
            Notification notification = Notification.builder()
                    .title(title)
                    .message(message)
                    .type(type)
                    .actionUrl(actionUrl)
                    .read(false)
                    .recipient(recipient)
                    .createdAt(LocalDateTime.now())
                    .build();
            notificationRepository.save(notification);
            log.info("Notification sent to user {} — type: {}", recipientId, type);
        } catch (Exception e) {
            log.error("Failed to send notification to user {}: {}", recipientId, e.getMessage());
        }
    }

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

package com.hospital.hms.mapper;

import com.hospital.hms.dto.NotificationDTO;
import com.hospital.hms.entity.Notification;

public class NotificationMapper {

    public static NotificationDTO mapToDto(Notification n) {
        return NotificationDTO.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .type(n.getType() != null ? n.getType().toString() : null)
                .read(n.isRead())
                .actionUrl(n.getActionUrl())
                .createdAt(n.getCreatedAt())
                .readAt(n.getReadAt())
                .recipientId(n.getRecipient() != null ? n.getRecipient().getId() : null)
                .build();
    }
}

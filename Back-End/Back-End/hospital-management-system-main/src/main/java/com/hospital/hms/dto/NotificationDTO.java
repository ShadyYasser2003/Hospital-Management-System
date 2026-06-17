package com.hospital.hms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDTO {
    private Long id;
    private String title;
    private String message;
    private String type;
    private boolean read;
    private String actionUrl;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private Long recipientId;
}

package com.hospital.hms.controller;

import com.hospital.hms.dto.NotificationDTO;
import com.hospital.hms.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/user/{userId}")
    public ResponseEntity<Page<NotificationDTO>> getAll(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(notificationService.getNotifications(
                userId, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/user/{userId}/all")
    public ResponseEntity<List<NotificationDTO>> getAllList(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getAllNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread")
    public ResponseEntity<List<NotificationDTO>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @GetMapping("/user/{userId}/unread/count")
    public ResponseEntity<Map<String, Long>> countUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("count", notificationService.countUnread(userId)));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<NotificationDTO> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PutMapping("/user/{userId}/read-all")
    public ResponseEntity<Map<String, Integer>> markAllAsRead(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("updated", notificationService.markAllAsRead(userId)));
    }

    /** Alternate path for frontend compatibility */
    @PutMapping("/read-all/{userId}")
    public ResponseEntity<Map<String, Integer>> markAllAsReadAlt(@PathVariable Long userId) {
        return ResponseEntity.ok(Map.of("updated", notificationService.markAllAsRead(userId)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.ok("Notification deleted");
    }
}

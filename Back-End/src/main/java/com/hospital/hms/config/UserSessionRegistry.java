package com.hospital.hms.config;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * In-memory registry of currently connected WebSocket users.
 *
 * A user is "online" when they have an active STOMP session.
 * Thread-safe via ConcurrentHashMap.
 */
@Component
public class UserSessionRegistry {

    private final Set<String> connectedUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void register(String userId) {
        connectedUsers.add(userId);
    }

    public void deregister(String userId) {
        connectedUsers.remove(userId);
    }

    public boolean isOnline(String userId) {
        return connectedUsers.contains(userId);
    }

    public boolean isOnline(Long userId) {
        return userId != null && connectedUsers.contains(String.valueOf(userId));
    }
}

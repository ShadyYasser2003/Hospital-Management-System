package com.hospital.hms.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

/**
 * Listens to STOMP connect/disconnect events and maintains
 * the online user registry accordingly.
 *
 * The frontend sends the userId as the STOMP "login" header on connect,
 * so we read it from there.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final UserSessionRegistry sessionRegistry;

    @EventListener
    public void handleConnect(SessionConnectedEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = accessor.getLogin();           // set by client as connectHeaders.login
        if (userId != null && !userId.isBlank()) {
            sessionRegistry.register(userId);
            log.debug("[WS] User {} connected — marked online", userId);
        }
    }

    @EventListener
    public void handleDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
        String userId = accessor.getLogin();
        if (userId != null && !userId.isBlank()) {
            sessionRegistry.deregister(userId);
            log.debug("[WS] User {} disconnected — marked offline", userId);
        }
    }
}

/**
 * WebSocket service using STOMP over SockJS.
 *
 * Manages a single connection per user session. When a notification arrives
 * via WebSocket, the provided callback is called immediately (real-time push).
 *
 * The server uses Spring's STOMP broker:
 *   - Connect endpoint : /ws  (SockJS)
 *   - User destination : /user/{userId}/queue/notifications
 */

import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { NotificationDto } from './notificationService';

const WS_URL = '/ws';

type NotificationCallback = (notification: NotificationDto) => void;

class WebSocketService {
  private client: Client | null = null;
  private subscription: StompSubscription | null = null;
  private userId: string | null = null;
  private reconnectDelay = 5000;
  private connected = false;

  /**
   * Connect to the WebSocket broker and subscribe to the user's notification queue.
   *
   * @param userId   the logged-in user's ID
   * @param token    JWT access token for the Authorization header
   * @param onNotification  callback invoked for every incoming notification
   */
  connect(userId: string, token: string, onNotification: NotificationCallback): void {
    // Avoid duplicate connections
    if (this.connected && this.userId === userId) return;

    this.userId = userId;
    this.disconnect(); // clean up any previous connection

    this.client = new Client({
      // SockJS factory — falls back when native WS is unavailable
      webSocketFactory: () => new SockJS(WS_URL) as WebSocket,

      connectHeaders: {
        Authorization: `Bearer ${token}`,
        login: userId,
      },

      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,

      onConnect: () => {
        this.connected = true;
        console.debug('[WS] Connected as user', userId);
        this.subscribe(userId, onNotification);
      },

      onDisconnect: () => {
        this.connected = false;
        console.debug('[WS] Disconnected');
      },

      onStompError: (frame) => {
        console.warn('[WS] STOMP error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  private subscribe(userId: string, callback: NotificationCallback): void {
    if (!this.client?.connected) return;

    // Unsubscribe from any previous subscription before re-subscribing
    this.subscription?.unsubscribe();

    // Subscribe to the user-specific notification queue
    // Spring pushes to /user/{userId}/queue/notifications
    this.subscription = this.client.subscribe(
      `/user/${userId}/queue/notifications`,
      (message: IMessage) => {
        try {
          const notification: NotificationDto = JSON.parse(message.body);
          callback(notification);
        } catch (err) {
          console.warn('[WS] Failed to parse notification:', err);
        }
      },
    );

    console.debug('[WS] Subscribed to notifications for user', userId);
  }

  disconnect(): void {
    this.subscription?.unsubscribe();
    this.subscription = null;

    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.connected = false;
    this.userId = null;
  }

  isConnected(): boolean {
    return this.connected;
  }
}

// Export a singleton — one connection for the whole app
export const wsService = new WebSocketService();

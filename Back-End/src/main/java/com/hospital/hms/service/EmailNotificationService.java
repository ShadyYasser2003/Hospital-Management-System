package com.hospital.hms.service;

/**
 * Dedicated service for sending notification emails to users.
 * Decoupled from the generic EmailService (which handles blood bank, transfer emails).
 */
public interface EmailNotificationService {

    /**
     * Send a notification email to a user.
     *
     * @param toEmail   recipient email address
     * @param title     notification title (used as email subject)
     * @param message   notification body
     * @param actionUrl optional link (may be null)
     */
    void sendNotificationEmail(String toEmail, String title, String message, String actionUrl);
}

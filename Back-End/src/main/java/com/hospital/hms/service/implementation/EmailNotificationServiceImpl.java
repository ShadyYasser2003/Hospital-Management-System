package com.hospital.hms.service.implementation;

import com.hospital.hms.service.EmailNotificationService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Sends notification emails to users (HTML-formatted).
 * Runs asynchronously so it never blocks the main request thread.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final JavaMailSender mailSender;

    @Value("${hospital.name:MediCore Hospital}")
    private String hospitalName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    @Async("notificationExecutor")
    public void sendNotificationEmail(String toEmail,
                                      String title,
                                      String message,
                                      String actionUrl) {
        try {
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, hospitalName);
            helper.setTo(toEmail);
            helper.setSubject("[" + hospitalName + "] " + title);
            helper.setText(buildHtmlBody(title, message, actionUrl), true);

            mailSender.send(mimeMessage);
            log.debug("Notification email sent to {} — subject: {}", toEmail, title);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            // Email failure should never break the main flow
            log.warn("Failed to send notification email to {}: {}", toEmail, e.getMessage());
        }
    }

    // ── HTML email template ────────────────────────────────────────────────

    private String buildHtmlBody(String title, String message, String actionUrl) {
        String actionButton = (actionUrl != null && !actionUrl.isBlank())
                ? """
                  <div style="margin-top:24px;text-align:center;">
                    <a href="%s"
                       style="background:#2563eb;color:#fff;padding:12px 28px;
                              border-radius:6px;text-decoration:none;font-weight:600;
                              font-size:14px;">
                      View Details
                    </a>
                  </div>
                  """.formatted("http://localhost:5173" + actionUrl)
                : "";

        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;">
                  <table width="100%%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td align="center" style="padding:40px 20px;">
                        <table width="560" cellpadding="0" cellspacing="0"
                               style="background:#fff;border-radius:10px;overflow:hidden;
                                      box-shadow:0 2px 8px rgba(0,0,0,.08);">
                          <!-- Header -->
                          <tr>
                            <td style="background:#2563eb;padding:24px 32px;">
                              <h1 style="margin:0;color:#fff;font-size:20px;">%s</h1>
                              <p style="margin:4px 0 0;color:rgba(255,255,255,.8);font-size:13px;">%s</p>
                            </td>
                          </tr>
                          <!-- Body -->
                          <tr>
                            <td style="padding:32px;">
                              <p style="margin:0;font-size:15px;color:#374151;line-height:1.6;">%s</p>
                              %s
                            </td>
                          </tr>
                          <!-- Footer -->
                          <tr>
                            <td style="background:#f8fafc;padding:16px 32px;border-top:1px solid #e5e7eb;">
                              <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
                                This notification was sent by %s • Do not reply to this email.
                              </p>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                """.formatted(title, hospitalName, message, actionButton, hospitalName);
    }
}

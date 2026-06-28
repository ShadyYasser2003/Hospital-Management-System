package com.hospital.hms.service.implementation;

import com.hospital.hms.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Value("${hospital.name:Our Hospital}")
    private String hospitalName;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendTransferEmail(String toEmail,
                                  String toHospitalName,
                                  String patientName,
                                  String requestedByName,
                                  byte[] pdfAttachment) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, hospitalName);
            helper.setTo(toEmail);
            helper.setSubject("Patient Transfer Record - " + patientName);
            helper.setText(buildEmailBody(toHospitalName, patientName, requestedByName), false);

            String fileName = "transfer-record-"
                    + patientName.replaceAll("\\s+", "-").toLowerCase()
                    + ".pdf";
            helper.addAttachment(fileName, () -> new java.io.ByteArrayInputStream(pdfAttachment), "application/pdf");

            mailSender.send(message);

        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send transfer email: " + e.getMessage(), e);
        }
    }


    // ── Blood Bank notifications ───────────────────────────────────────────

    @Override
    public void sendBloodRequestEmail(String toEmail,
                                      String patientName,
                                      String bloodType,
                                      Integer quantity,
                                      String urgency,
                                      String requestedByName) {
        String subject = "[" + urgency + "] Urgent Blood Request — " + bloodType;
        String body = """
                Dear Blood Bank Team,

                Insufficient stock! A blood request cannot be auto-fulfilled.

                Patient Name  : %s
                Blood Type    : %s
                Quantity      : %d units
                Urgency       : %s
                Requested By  : %s
                Hospital      : %s

                Please procure the required units as soon as possible.

                Best regards,
                %s
                """.formatted(patientName, bloodType, quantity,
                urgency, requestedByName, hospitalName, hospitalName);

        sendPlainText(toEmail, subject, body);
    }

    @Override
    public void sendBloodReservedEmail(String toEmail,
                                       String patientName,
                                       String bloodType,
                                       Integer quantity,
                                       String urgency,
                                       String reservedByName) {
        String subject = "[AUTO-RESERVED] Blood Units Reserved — " + bloodType;
        String body = """
                Dear Blood Bank Team,

                Blood units have been automatically reserved from inventory.

                Patient Name  : %s
                Blood Type    : %s
                Quantity      : %d units
                Urgency       : %s
                Reserved For  : Dr. %s
                Hospital      : %s

                Please ensure the units are ready for dispensing.

                Best regards,
                %s
                """.formatted(patientName, bloodType, quantity,
                urgency, reservedByName, hospitalName, hospitalName);

        sendPlainText(toEmail, subject, body);
    }

    @Override
    public void sendBloodCompletedEmail(String toEmail,
                                        String patientName,
                                        String bloodType,
                                        Integer quantity,
                                        String requestedByName) {
        String subject = "[COMPLETED] Blood Dispensed — " + patientName;
        String body = """
                Dear Dr. %s,

                Your blood request has been fulfilled and the units have been dispensed.

                Patient Name  : %s
                Blood Type    : %s
                Quantity      : %d units
                Hospital      : %s

                Best regards,
                %s Blood Bank
                """.formatted(requestedByName, patientName, bloodType,
                quantity, hospitalName, hospitalName);

        sendPlainText(toEmail, subject, body);
    }

    @Override
    public void sendLowStockAlertEmail(String toEmail,
                                       String bloodType,
                                       int remainingQuantity) {
        String subject = "[LOW STOCK ALERT] " + bloodType + " — Only " + remainingQuantity + " units left";
        String body = """
                Dear Blood Bank Team,

                ⚠️  Low stock alert for blood type %s.

                Remaining available units : %d
                Please arrange procurement immediately.

                Hospital : %s
                """.formatted(bloodType, remainingQuantity, hospitalName);

        sendPlainText(toEmail, subject, body);
    }

    @Override
    public void sendAppointmentReminder(String toEmail,
                                        String patientName,
                                        String doctorName,
                                        String appointmentDate,
                                        String appointmentTime,
                                        String department) {
        String subject = "⏰ Appointment Reminder — " + appointmentDate + " at " + appointmentTime;
        String body = """
                Dear %s,

                This is a friendly reminder about your upcoming appointment.

                ─────────────────────────────────────
                  Doctor      : Dr. %s
                  Department  : %s
                  Date        : %s
                  Time        : %s
                  Hospital    : %s
                ─────────────────────────────────────

                Please arrive 10 minutes early and bring any relevant medical documents.
                If you need to reschedule, please contact us as soon as possible.

                We look forward to seeing you!

                Best regards,
                %s
                """.formatted(
                patientName, doctorName, department != null ? department : "N/A",
                appointmentDate, appointmentTime, hospitalName, hospitalName);

        sendPlainText(toEmail, subject, body);
    }

    // ──────────────────────────────────────────────────────────────────────

    @Override
    public void sendPasswordResetEmail(String toEmail, String username, String temporaryPassword) {
        String subject = "Password Reset — " + hospitalName;
        String body = """
                Dear %s,

                We received a request to reset your password for your %s account.

                Your temporary password is:

                    %s

                Please log in with this temporary password and change it immediately
                in your Profile Settings.

                If you did not request a password reset, please contact your system
                administrator immediately.

                Best regards,
                %s
                """.formatted(username, hospitalName, temporaryPassword, hospitalName);

        sendPlainText(toEmail, subject, body);
    }

    private void sendPlainText(String toEmail, String subject, String body) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setFrom(fromEmail, hospitalName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(body, false);
            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Failed to send email: " + e.getMessage(), e);
        }
    }

    private String buildEmailBody(String toHospitalName,
                                  String patientName,
                                  String requestedByName) {
        return """
                Dear %s,

                We would like to inform you of the following patient transfer:

                Patient Name  : %s
                Requested By  : %s
                From Hospital : %s

                Please find the complete medical record attached as a PDF file.

                For any inquiries, please contact us directly.

                Best regards,
                %s
                """.formatted(
                toHospitalName,
                patientName,
                requestedByName,
                hospitalName,
                hospitalName
        );
    }
}
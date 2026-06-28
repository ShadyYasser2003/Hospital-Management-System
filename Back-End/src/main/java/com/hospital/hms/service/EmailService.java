package com.hospital.hms.service;

public interface EmailService {

    // ── Transfer notification ──────────────────────────────────────────────

    void sendTransferEmail(String toEmail,
                           String toHospitalName,
                           String patientName,
                           String requestedByName,
                           byte[] pdfAttachment);

    // ── Blood Bank notifications ───────────────────────────────────────────

    /**
     * Sent to blood-bank email when a request is created but stock is INSUFFICIENT.
     * Alerts staff to procure the required blood type urgently.
     */
    void sendBloodRequestEmail(String toEmail,
                               String patientName,
                               String bloodType,
                               Integer quantity,
                               String urgency,
                               String requestedByName);

    /**
     * Sent to blood-bank email when units are AUTO-RESERVED on request creation.
     * Informs staff that the stock has been allocated.
     */
    void sendBloodReservedEmail(String toEmail,
                                String patientName,
                                String bloodType,
                                Integer quantity,
                                String urgency,
                                String reservedByName);

    /**
     * Sent to the requesting doctor when a blood request is COMPLETED (units dispensed).
     */
    void sendBloodCompletedEmail(String toEmail,
                                 String patientName,
                                 String bloodType,
                                 Integer quantity,
                                 String requestedByName);

    /**
     * Sent to blood-bank email when available stock for a blood type drops below
     * the low-stock threshold after a reservation.
     */
    void sendLowStockAlertEmail(String toEmail,
                                String bloodType,
                                int remainingQuantity);

    /**
     * Appointment reminder sent to the patient 24 hours before their appointment.
     */
    void sendAppointmentReminder(String toEmail,
                                 String patientName,
                                 String doctorName,
                                 String appointmentDate,
                                 String appointmentTime,
                                 String department);

    /**
     * Sends a temporary password to the user's email as part of the forgot-password flow.
     */
    void sendPasswordResetEmail(String toEmail, String username, String temporaryPassword);
}

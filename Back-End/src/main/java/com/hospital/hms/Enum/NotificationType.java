package com.hospital.hms.Enum;

public enum NotificationType {
    // ── Appointments ────────────────────────────────────
    APPOINTMENT_REMINDER,
    APPOINTMENT_CONFIRMED,
    APPOINTMENT_CANCELLED,
    APPOINTMENT_COMPLETED,

    // ── Lab Tests / Test Requests ────────────────────────
    TEST_ASSIGNED,
    TEST_COMPLETED,

    // ── Prescriptions ────────────────────────────────────
    PRESCRIPTION_CREATED,
    PRESCRIPTION_DISPENSED,

    // ── Radiology Orders ─────────────────────────────────
    RADIOLOGY_ORDER_CREATED,
    RADIOLOGY_ORDER_COMPLETED,

    // ── Blood Bank ────────────────────────────────────────
    BLOOD_REQUEST_CREATED,
    BLOOD_REQUEST_RESERVED,
    BLOOD_REQUEST_COMPLETED,
    BLOOD_REQUEST_CANCELLED,

    // ── Transfer Requests ─────────────────────────────────
    TRANSFER_REQUEST_CREATED,
    TRANSFER_REQUEST_SENT,
    TRANSFER_REQUEST_FAILED,

    // ── Billing ───────────────────────────────────────────
    INVOICE_CREATED,
    CHARGE_ADDED,
    PAYMENT_RECEIVED,

    // ── System ────────────────────────────────────────────
    SYSTEM_ALERT,
    GENERAL
}

package com.hospital.hms.Enum;

public enum BloodRequestStatus {
    PENDING,    // Stock unavailable — waiting to be fulfilled
    RESERVED,   // Units auto-reserved from stock
    COMPLETED,  // Units physically dispensed / used
    CANCELLED   // Request cancelled
}

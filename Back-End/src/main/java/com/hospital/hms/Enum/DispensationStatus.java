package com.hospital.hms.Enum;

public enum DispensationStatus {
    PENDING,     // Initial state - doctor sends prescription to dispense
  //  PARTIAL,     // Partially given, more to come
    DISPENSED,   // patient gets medicine
    CANCELLED,   // doctor cancels it
 //   VERIFIED,    // Double-checked by second pharmacist
    RETURNED,    // Patient brought medicine back after dispensation
}

package com.hospital.hms.Enum;

public enum BloodUnitStatus {
    AVAILABLE,  // Ready for use
    RESERVED,   // Reserved for a patient's request
    USED,       // Fully consumed after fulfillment
    EXPIRED     // Past expiry date
}

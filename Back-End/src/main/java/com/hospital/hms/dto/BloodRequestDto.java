package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for BloodRequest — all enum/date fields carried as plain Strings.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodRequestDto {

    private Long id;

    /** ID of the patient who needs blood. */
    private Long patientId;
    /** Denormalized for display. */
    private String patientName;

    /** ID of the doctor placing the request. */
    private Long requestedById;
    /** Denormalized for display. */
    private String requestedByName;

    /** BloodType enum name: A_POSITIVE, O_NEGATIVE … */
    private String bloodType;

    /** Number of units requested (must be > 0). */
    private Integer quantity;

    /** BloodRequestUrgency: LOW | MEDIUM | HIGH */
    private String urgency;

    /** BloodRequestStatus: PENDING | RESERVED | COMPLETED | CANCELLED */
    private String status;

    private String notes;

    /** "yyyy-MM-dd HH:mm" — set when COMPLETED */
    private String fulfilledAt;
    /** "yyyy-MM-dd HH:mm" — set at creation */
    private String createdAt;
}

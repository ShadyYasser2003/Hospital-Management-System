package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for BloodUnit — all enum/date fields carried as plain Strings
 * to keep the API contract stable against Java enum refactors.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodUnitDto {

    private Long id;

    /** BloodType enum name: A_POSITIVE, O_NEGATIVE … */
    private String bloodType;

    /** Number of units in this batch (must be > 0). */
    private Integer quantity;

    /** ISO date string "yyyy-MM-dd" */
    private String expiryDate;

    /** BloodUnitStatus enum name: AVAILABLE, RESERVED, USED, EXPIRED */
    private String status;

    private String notes;
}

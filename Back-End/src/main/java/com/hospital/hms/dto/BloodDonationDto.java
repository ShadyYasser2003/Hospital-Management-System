package com.hospital.hms.dto;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BloodDonationDto {
    private Long   id;
    private String donorName;
    private String donorPhone;
    private String donorNationalId;
    private String bloodType;
    private Integer quantity;
    private String donationDate;   // yyyy-MM-dd
    private String expiryDate;     // yyyy-MM-dd
    private String notes;
    /** GENERAL | SPECIFIC_PATIENT */
    private String donationType;
    /** Only for SPECIFIC_PATIENT */
    private Long   targetPatientId;
    private String targetPatientName;
    /** The created BloodUnit id */
    private Long   bloodUnitId;
    private String createdAt;
}

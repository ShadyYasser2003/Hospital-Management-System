package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PrescriptionItemDTO {
    private Long id;
    private Long medicineId;
    private String medicineName;
    private String dosage;
    private String frequency;
    private Integer duration;
    private Integer quantity;
    private String instructions;
    private Boolean dispensed;
    private Integer dispensedQuantity;
}
package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;

@Setter
@Getter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineDispensationDto {
    private Long id;
    private int dispensedQuantity;
    private String dispensedDate;   // String — formatted in mapper
    private String status;
    private Double charges;

    // Foreign-key IDs — required for creation
    private Long prescriptionId;
    private Long medicineId;
    private Long patientId;
    private Long pharmacistId;

    // Read-only display fields (populated on response)
    private String patientName;
    private String pharmacistName;
    private String medicineName;
    private String prescriptionRef;
}

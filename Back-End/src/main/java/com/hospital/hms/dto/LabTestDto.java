package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LabTestDto {

    private Long id;
    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;

    private Long technicianId;
    private String technicianName;

    private String testType;

    private String testName;
    private String description;

    private String status;

    private String orderedAt;
    private String sampleCollectedAt;
    private String completedAt;


    private String result;
    private String notes;
    private String referenceRange;
    private Boolean isCritical;
}

package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RadiologyOrderDto {

    private Long id;

    private Long patientId;
    private String patientName;

    private Long doctorId;
    private String doctorName;

    private Long technicianId;
    private String technicianName;

    private String orderType;

    private String bodyPart;
    private String clinicalIndication;
    private String contrast;
    private String specialInstructions;

    private String status;

    private String orderedAt;
    private String scheduledAt;
    private String completedAt;

    private String reportFindings;
    private String impression;
    private String imageUrl;
    private Boolean isCritical;
    private String notes;
}

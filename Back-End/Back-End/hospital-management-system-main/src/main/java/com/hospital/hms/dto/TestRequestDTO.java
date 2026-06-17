package com.hospital.hms.dto;

import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestRequestDTO {
    private Long id;
    private String testType;
    private String description;
    private String priority;
    private String status;
    private String reportUrl;
    private String results;
    private Double charges;
    private LocalDateTime requestedAt;
    private LocalDateTime completedAt;

    private Long patientId;
    private String patientName;
    private Long doctorId;
    private String doctorName;
    private Long technicianId;
    private String technicianName;
}

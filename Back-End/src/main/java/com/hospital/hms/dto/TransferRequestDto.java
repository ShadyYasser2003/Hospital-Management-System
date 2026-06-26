package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequestDto {

    private Long id;


    private Long patientId;
    private Long requestedById;
    private Long toHospitalId;

    private String reason;

    private Boolean includeLabTests;
    private Boolean includeRadiology;
    private Boolean includeDiagnoses;


    private String patientName;
    private String requestedByName;
    private String toHospitalName;
    private String toHospitalEmail;

    private String status;

    private String transferredAt;
    private String createdAt;
}
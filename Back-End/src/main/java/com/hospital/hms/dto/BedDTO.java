package com.hospital.hms.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BedDTO {
    private Long id;
    private String bedNumber;
    private String wardName;
    private String status;
    private Long patientId;
    private String patientName;
}

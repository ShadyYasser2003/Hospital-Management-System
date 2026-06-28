package com.hospital.hms.mapper;

import com.hospital.hms.dto.BedDTO;
import com.hospital.hms.entity.Bed;

public class BedMapper {
    public static BedDTO mapToBedaDTO(Bed bed) {
        Long patientId = null;
        try {
            if (bed.getPatient() != null) {
                patientId = bed.getPatient().getId();
            }
        } catch (Exception ignored) {
            // Hibernate proxy failed to load — orphaned FK, treat as no patient
        }
        return BedDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .wardName(bed.getWardName())
                .status(bed.getStatus().toString())
                .patientId(patientId)
                .patientName(bed.getPatientName())
                .build();
    }
}

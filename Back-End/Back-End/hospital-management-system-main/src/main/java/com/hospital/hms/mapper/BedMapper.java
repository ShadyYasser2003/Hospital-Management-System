package com.hospital.hms.mapper;

import com.hospital.hms.dto.BedDTO;
import com.hospital.hms.entity.Bed;

public class BedMapper {
    public static BedDTO mapToBedaDTO(Bed bed ){
       return
               BedDTO.builder()
                .id(bed.getId())
                .bedNumber(bed.getBedNumber())
                .wardName(bed.getWardName())
                .status(bed.getStatus().toString())
                .patientId(bed.getPatient() != null ? bed.getPatient().getId() : null)
                .patientName(bed.getPatientName())
                .build();
    }
}

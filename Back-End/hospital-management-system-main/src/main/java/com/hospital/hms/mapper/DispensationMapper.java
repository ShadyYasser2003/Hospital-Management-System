package com.hospital.hms.mapper;

import com.hospital.hms.Enum.DispensationStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.MedicineDispensationDto;
import com.hospital.hms.entity.MedicineDispensation;

public class DispensationMapper {

    public static MedicineDispensationDto mapToDto(MedicineDispensation dispensation) {
        return MedicineDispensationDto.builder()
                .id(dispensation.getId())
                .dispensedDate(DateUtils.format(dispensation.getDispensedDate()))
                .dispensedQuantity(dispensation.getDispensedQuantity())
                .charges(dispensation.getCharges())
                .status(dispensation.getStatus() != null ? dispensation.getStatus().toString() : null)
                .build();
    }

    public static MedicineDispensation mapFromDto(MedicineDispensationDto dispensation) {
        return MedicineDispensation.builder()
                .id(dispensation.getId())
                .dispensedDate(DateUtils.parse(dispensation.getDispensedDate()))
                .dispensedQuantity(dispensation.getDispensedQuantity())
                .charges(dispensation.getCharges())
                .status(dispensation.getStatus() != null
                        ? DispensationStatus.valueOf(dispensation.getStatus().toUpperCase().trim())
                        : DispensationStatus.PENDING)
                .build();
    }
}

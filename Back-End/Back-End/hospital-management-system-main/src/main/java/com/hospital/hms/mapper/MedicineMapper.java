package com.hospital.hms.mapper;

import com.hospital.hms.Enum.MedicineStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.MedicineDto;
import com.hospital.hms.entity.Medicine;

public class MedicineMapper {

    public static MedicineDto mapToMedicineDto(Medicine medicine) {
        return MedicineDto.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .sideEffects(medicine.getSideEffects())
                .description(medicine.getDescription())
                .prescriptionRequired(medicine.getPrescriptionRequired())
                .status(medicine.getStatus() != null ? medicine.getStatus().toString() : "IN_STOCK")
                .createdAt(DateUtils.format(medicine.getCreatedAt()))
                .updatedAt(DateUtils.format(medicine.getUpdatedAt()))
                .build();
    }

    public static Medicine mapToMedicine(MedicineDto medicine) {
        return Medicine.builder()
                .id(medicine.getId())
                .name(medicine.getName())
                .genericName(medicine.getGenericName())
                .sideEffects(medicine.getSideEffects())
                .description(medicine.getDescription())
                .prescriptionRequired(medicine.getPrescriptionRequired())
                .status(medicine.getStatus() != null
                        ? MedicineStatus.valueOf(medicine.getStatus().trim().toUpperCase())
                        : MedicineStatus.IN_STOCK)
                .createdAt(DateUtils.parse(medicine.getCreatedAt()))
                .updatedAt(DateUtils.parse(medicine.getUpdatedAt()))
                .build();
    }
}

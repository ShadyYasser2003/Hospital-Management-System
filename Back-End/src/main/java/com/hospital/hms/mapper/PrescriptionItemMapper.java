package com.hospital.hms.mapper;

import com.hospital.hms.dto.PrescriptionItemDTO;
import com.hospital.hms.entity.PrescriptionItem;

public class PrescriptionItemMapper {
    public static PrescriptionItemDTO mapToPrescriptionItemDTO(PrescriptionItem item) {
        return PrescriptionItemDTO.builder()
                .id(item.getId())
                .medicineId(item.getMedicine().getId())
                .medicineName(item.getMedicineName())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .duration(item.getDuration())
                .quantity(item.getQuantity())
                .instructions(item.getInstructions())
                .dispensed(item.getDispensed())
                .dispensedQuantity(item.getDispensedQuantity())
                .build();
    }
    /*public static PrescriptionItem mapToPrescriptionItem(PrescriptionItemDTO item) {
        return PrescriptionItem.builder()
                .id(item.getId())
                .medicine(item.getMedicineId())
                .medicineName(item.getMedicineName())
                .dosage(item.getDosage())
                .frequency(item.getFrequency())
                .duration(item.getDurationInDays())
                .quantity(item.getQuantity())
                .instructions(item.getInstructions())
                .dispensed(item.getDispensed())
                .dispensedQuantity(item.getDispensedQuantity())
                .build();
    }*/
}
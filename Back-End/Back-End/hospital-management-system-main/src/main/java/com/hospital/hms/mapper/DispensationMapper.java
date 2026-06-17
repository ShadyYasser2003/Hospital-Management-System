package com.hospital.hms.mapper;

import com.hospital.hms.Enum.DispensationStatus;
import com.hospital.hms.config.DateUtils;
import com.hospital.hms.dto.MedicineDispensationDto;
import com.hospital.hms.entity.MedicineDispensation;
import com.hospital.hms.entity.Patient;
import com.hospital.hms.entity.Pharmacist;
import com.hospital.hms.entity.Prescription;

public class DispensationMapper {

    /** Map entity → DTO (includes all display fields). */
    public static MedicineDispensationDto mapToDto(MedicineDispensation dispensation) {
        MedicineDispensationDto.MedicineDispensationDtoBuilder<?, ?> builder =
                MedicineDispensationDto.builder()
                        .id(dispensation.getId())
                        .dispensedDate(DateUtils.format(dispensation.getDispensedDate()))
                        .dispensedQuantity(dispensation.getDispensedQuantity())
                        .charges(dispensation.getCharges())
                        .status(dispensation.getStatus() != null
                                ? dispensation.getStatus().toString() : null);

        if (dispensation.getPatient() != null) {
            builder.patientId(dispensation.getPatient().getId())
                   .patientName(dispensation.getPatient().getName());
        }
        if (dispensation.getPharmacist() != null) {
            builder.pharmacistId(dispensation.getPharmacist().getId())
                   .pharmacistName(dispensation.getPharmacist().getName());
        }
        if (dispensation.getPrescription() != null) {
            builder.prescriptionId(dispensation.getPrescription().getId())
                   .prescriptionRef("RX-" + dispensation.getPrescription().getId());
        }

        return builder.build();
    }

    /**
     * Map DTO → bare entity (no relationships resolved here).
     * Callers in the service layer are responsible for setting
     * patient, pharmacist, and prescription from the IDs in the DTO.
     */
    public static MedicineDispensation mapFromDto(MedicineDispensationDto dispensation) {
        return MedicineDispensation.builder()
                .id(dispensation.getId())
                .dispensedDate(dispensation.getDispensedDate() != null
                        ? DateUtils.parse(dispensation.getDispensedDate())
                        : java.time.LocalDate.now())
                .dispensedQuantity(dispensation.getDispensedQuantity())
                .charges(dispensation.getCharges() != null ? dispensation.getCharges() : 0.0)
                .status(dispensation.getStatus() != null
                        ? DispensationStatus.valueOf(dispensation.getStatus().toUpperCase().trim())
                        : DispensationStatus.PENDING)
                .build();
    }
}

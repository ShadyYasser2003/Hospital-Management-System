package com.hospital.hms.mapper;

import com.hospital.hms.dto.PrescriptionDTO;
import com.hospital.hms.entity.Prescription;

import java.util.List;

public class PrescriptionMapper {

    public static PrescriptionDTO mapToPrescriptionDTO(Prescription prescription) {
        return PrescriptionDTO.builder()
                .id(prescription.getId())
                .patientId(prescription.getPatient().getId())
                .patientName(prescription.getPatientName())
                .doctorId(prescription.getDoctor().getId())
                .doctorName(prescription.getDoctorName())
                .prescriptionDate(prescription.getPrescriptionDate())
                .notes(prescription.getNotes())
                .status(prescription.getStatus().toString())
                .items(prescription.getItems() != null ?
                        prescription.getItems().stream()
                                .map(PrescriptionItemMapper::mapToPrescriptionItemDTO)
                                .toList() :
                        List.of())
                .build();
    }
}
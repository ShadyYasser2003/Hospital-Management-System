package com.hospital.hms.mapper;

import com.hospital.hms.Enum.LabTestStatus;
import com.hospital.hms.Enum.LabTestType;
import com.hospital.hms.dto.LabTestDto;
import com.hospital.hms.entity.LabTest;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;

public class LabTestMapper {
    private static final DateTimeFormatter DT_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static LabTestDto mapToDto(LabTest labTest) {
        return LabTestDto.builder()
                .id(labTest.getId())
                // Patient
                .patientId(labTest.getPatient() != null ? labTest.getPatient().getId() : null)
                .patientName(labTest.getPatientName())
                // Doctor
                .doctorId(labTest.getDoctor() != null ? labTest.getDoctor().getId() : null)
                .doctorName(labTest.getDoctorName())
                // Technician
                .technicianId(labTest.getTechnician() != null ? labTest.getTechnician().getId() : null)
                .technicianName(labTest.getTechnicianName())
                // Test info
                .testType(labTest.getTestType() != null ? labTest.getTestType().toString() : null)
                .testName(labTest.getTestName())
                .description(labTest.getDescription())
                // Status & dates
                .status(labTest.getStatus() != null ? labTest.getStatus().toString() : null)
                .orderedAt(format(labTest.getOrderedAt()))
                .sampleCollectedAt(format(labTest.getSampleCollectedAt()))
                .completedAt(format(labTest.getCompletedAt()))
                // Results
                .result(labTest.getResult())
                .notes(labTest.getNotes())
                .referenceRange(labTest.getReferenceRange())
                .isCritical(labTest.getIsCritical())
                .build();
    }

    public static LabTest mapToEntity(LabTestDto dto) {
        return LabTest.builder()
                .id(dto.getId())
                .patientName(dto.getPatientName())
                .doctorName(dto.getDoctorName())
                .technicianName(dto.getTechnicianName())
                .testName(dto.getTestName())
                .description(dto.getDescription())
                .testType(parseTestType(dto.getTestType()))
                .status(parseStatus(dto.getStatus()))
                .orderedAt(parse(dto.getOrderedAt()))
                .sampleCollectedAt(parse(dto.getSampleCollectedAt()))
                .completedAt(parse(dto.getCompletedAt()))
                .result(dto.getResult())
                .notes(dto.getNotes())
                .referenceRange(dto.getReferenceRange())
                .isCritical(dto.getIsCritical() != null ? dto.getIsCritical() : false)
                .build();
    }


    private static String format(LocalDateTime dt) {
        return dt != null ? dt.format(DT_FORMAT) : null;
    }

    private static LocalDateTime parse(String value) {
        if (value == null || value.isBlank()) return null;
        try {
            return LocalDateTime.parse(value.trim(), DT_FORMAT);
        } catch (DateTimeParseException e1) {
            try {
                return LocalDateTime.parse(value.trim() + " 00:00", DT_FORMAT);
            } catch (DateTimeParseException e2) {
                throw new RuntimeException("Cannot parse datetime: '" + value
                        + "'. Use yyyy-MM-dd HH:mm or yyyy-MM-dd");
            }
        }
    }

    private static LabTestType parseTestType(String value) {
        if (value == null || value.isBlank()) return LabTestType.OTHER;
        try {
            return LabTestType.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid test type: " + value);
        }
    }

    private static LabTestStatus parseStatus(String value) {
        if (value == null || value.isBlank()) return LabTestStatus.ORDERED;
        try {
            return LabTestStatus.valueOf(value.toUpperCase().trim());
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid lab test status: " + value);
        }
    }
}

package com.hospital.hms.mapper;

import com.hospital.hms.dto.TestRequestDTO;
import com.hospital.hms.entity.TestRequest;

public class TestRequestMapper {

    public static TestRequestDTO mapToDto(TestRequest tr) {
        return TestRequestDTO.builder()
                .id(tr.getId())
                .testType(tr.getTestType())
                .description(tr.getDescription())
                .priority(tr.getPriority())
                .status(tr.getStatus() != null ? tr.getStatus().toString() : null)
                .reportUrl(tr.getReportUrl())
                .results(tr.getResults())
                .charges(tr.getCharges())
                .requestedAt(tr.getRequestedAt())
                .completedAt(tr.getCompletedAt())
                .patientId(tr.getPatient() != null ? tr.getPatient().getId() : null)
                .patientName(tr.getPatient() != null ? tr.getPatient().getName() : null)
                .doctorId(tr.getDoctor() != null ? tr.getDoctor().getId() : null)
                .doctorName(tr.getDoctor() != null ? tr.getDoctor().getName() : null)
                .technicianId(tr.getTechnician() != null ? tr.getTechnician().getId() : null)
                .technicianName(tr.getTechnician() != null ? tr.getTechnician().getName() : null)
                .build();
    }
}

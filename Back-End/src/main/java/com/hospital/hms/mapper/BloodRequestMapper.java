package com.hospital.hms.mapper;

import com.hospital.hms.dto.BloodRequestDto;
import com.hospital.hms.entity.BloodRequest;

import java.time.format.DateTimeFormatter;

/**
 * Static utility mapper for BloodRequest.
 * Only mapToDto is needed — entities are built manually inside BloodBankServiceImpl
 * using resolved Patient / Doctor objects (same pattern as LabTest / RadiologyOrder).
 */
public class BloodRequestMapper {

    private static final DateTimeFormatter DT_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    /** Entity → DTO */
    public static BloodRequestDto mapToDto(BloodRequest request) {
        return BloodRequestDto.builder()
                .id(request.getId())
                .patientId(request.getPatient() != null ? request.getPatient().getId() : null)
                .patientName(request.getPatientName())
                .requestedById(request.getRequestedBy() != null ? request.getRequestedBy().getId() : null)
                .requestedByName(request.getRequestedByName())
                .bloodType(request.getBloodType() != null ? request.getBloodType().name() : null)
                .quantity(request.getQuantity())
                .urgency(request.getUrgency() != null ? request.getUrgency().name() : null)
                .status(request.getStatus() != null ? request.getStatus().name() : null)
                .notes(request.getNotes())
                .fulfilledAt(request.getFulfilledAt() != null
                        ? request.getFulfilledAt().format(DT_FORMAT) : null)
                .createdAt(request.getCreatedAt() != null
                        ? request.getCreatedAt().format(DT_FORMAT) : null)
                .build();
    }
}

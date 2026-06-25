package com.hospital.hms.mapper;

import com.hospital.hms.dto.TransferRequestDto;
import com.hospital.hms.entity.TransferRequest;

import java.time.format.DateTimeFormatter;

public class TransferRequestMapper {

    private static final DateTimeFormatter DT_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    public static TransferRequestDto mapToDto(TransferRequest transfer) {
        return TransferRequestDto.builder()
                .id(transfer.getId())
                .patientId(transfer.getPatient() != null
                        ? transfer.getPatient().getId() : null)
                .requestedById(transfer.getRequestedBy() != null
                        ? transfer.getRequestedBy().getId() : null)
                .toHospitalId(transfer.getToHospital() != null
                        ? transfer.getToHospital().getId() : null)
                .patientName(transfer.getPatientName())
                .requestedByName(transfer.getRequestedByName())
                .toHospitalName(transfer.getToHospitalName())
                .toHospitalEmail(transfer.getToHospitalEmail())
                .reason(transfer.getReason())
                .status(transfer.getStatus() != null
                        ? transfer.getStatus().toString() : null)
                .includeLabTests(transfer.getIncludeLabTests())
                .includeRadiology(transfer.getIncludeRadiology())
                .includeDiagnoses(transfer.getIncludeDiagnoses())
                .transferredAt(transfer.getTransferredAt() != null
                        ? transfer.getTransferredAt().format(DT_FORMAT) : null)
                .createdAt(transfer.getCreatedAt() != null
                        ? transfer.getCreatedAt().format(DT_FORMAT) : null)
                .build();
    }
}
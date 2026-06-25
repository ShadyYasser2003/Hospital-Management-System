package com.hospital.hms.service;

import com.hospital.hms.dto.TransferRequestDto;

import java.util.List;

public interface TransferRequestService {

    List<TransferRequestDto> getAllTransfers();

    TransferRequestDto getTransferById(Long id);

    List<TransferRequestDto> getTransfersByPatient(Long patientId);

    TransferRequestDto createTransfer(TransferRequestDto dto);

    TransferRequestDto sendTransfer(Long id);
}
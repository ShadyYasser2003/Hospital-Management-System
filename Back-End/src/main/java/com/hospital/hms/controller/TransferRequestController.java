package com.hospital.hms.controller;

import com.hospital.hms.dto.TransferRequestDto;
import com.hospital.hms.service.TransferRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transfers")
@RequiredArgsConstructor
public class TransferRequestController {

    private final TransferRequestService transferRequestService;

    @GetMapping
    public ResponseEntity<List<TransferRequestDto>> getAllTransfers() {
        return ResponseEntity.ok(transferRequestService.getAllTransfers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferRequestDto> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(transferRequestService.getTransferById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<TransferRequestDto>> getTransfersByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(transferRequestService.getTransfersByPatient(patientId));
    }


    @PostMapping
    public ResponseEntity<TransferRequestDto> createTransfer(
            @RequestBody TransferRequestDto dto) {
        return new ResponseEntity<>(
                transferRequestService.createTransfer(dto), HttpStatus.CREATED);
    }

    @PatchMapping("/{id}/send")
    public ResponseEntity<TransferRequestDto> sendTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferRequestService.sendTransfer(id));
    }
}
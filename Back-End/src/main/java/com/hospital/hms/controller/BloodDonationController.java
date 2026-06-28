package com.hospital.hms.controller;

import com.hospital.hms.dto.BloodDonationDto;
import com.hospital.hms.service.BloodDonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/blood-bank/donations")
@RequiredArgsConstructor
public class BloodDonationController {

    private final BloodDonationService bloodDonationService;

    /** Record a new donation (GENERAL or SPECIFIC_PATIENT) */
    @PostMapping
    public ResponseEntity<BloodDonationDto> record(@RequestBody BloodDonationDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(bloodDonationService.recordDonation(dto));
    }

    /** All donations */
    @GetMapping
    public ResponseEntity<List<BloodDonationDto>> getAll() {
        return ResponseEntity.ok(bloodDonationService.getAll());
    }

    /** Donations directed at a specific patient */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<BloodDonationDto>> getByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(bloodDonationService.getByPatient(patientId));
    }
}

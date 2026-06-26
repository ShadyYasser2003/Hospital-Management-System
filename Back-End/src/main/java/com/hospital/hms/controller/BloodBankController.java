package com.hospital.hms.controller;

import com.hospital.hms.dto.BloodRequestDto;
import com.hospital.hms.dto.BloodUnitDto;
import com.hospital.hms.service.BloodBankService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for the Blood Bank module.
 *
 * Security (defined in SecurityConfig):
 *   - /api/blood-bank/units/**   → ADMIN, TECHNICIAN
 *   - /api/blood-bank/requests/** → ADMIN, DOCTOR, TECHNICIAN
 */
@RestController
@RequestMapping("/api/blood-bank")
@RequiredArgsConstructor
public class BloodBankController {

    private final BloodBankService bloodBankService;

    // ── Blood Unit endpoints ───────────────────────────────────────────────

    /** List all blood units in inventory. */
    @GetMapping("/units")
    public ResponseEntity<List<BloodUnitDto>> getAllBloodUnits() {
        return ResponseEntity.ok(bloodBankService.getAllBloodUnits());
    }

    /** Add a new blood unit to inventory. */
    @PostMapping("/units")
    public ResponseEntity<BloodUnitDto> addBloodUnit(@RequestBody BloodUnitDto dto) {
        return new ResponseEntity<>(bloodBankService.addBloodUnit(dto), HttpStatus.CREATED);
    }

    /** Update an existing blood unit (quantity, expiry, status, notes). */
    @PutMapping("/units/{id}")
    public ResponseEntity<BloodUnitDto> updateBloodUnit(
            @PathVariable Long id,
            @RequestBody BloodUnitDto dto) {
        return ResponseEntity.ok(bloodBankService.updateBloodUnit(id, dto));
    }

    // ── Blood Request endpoints ────────────────────────────────────────────

    /** List all blood requests. */
    @GetMapping("/requests")
    public ResponseEntity<List<BloodRequestDto>> getAllRequests() {
        return ResponseEntity.ok(bloodBankService.getAllRequests());
    }

    /** List only PENDING requests (stock unavailable at creation time). */
    @GetMapping("/requests/pending")
    public ResponseEntity<List<BloodRequestDto>> getPendingRequests() {
        return ResponseEntity.ok(bloodBankService.getPendingRequests());
    }

    /** List all requests for a specific patient. */
    @GetMapping("/requests/patient/{patientId}")
    public ResponseEntity<List<BloodRequestDto>> getRequestsByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(bloodBankService.getRequestsByPatient(patientId));
    }

    /**
     * Create a new blood request.
     * The service will attempt to auto-reserve matching units immediately.
     * Status will be RESERVED if enough stock exists, PENDING otherwise.
     */
    @PostMapping("/requests")
    public ResponseEntity<BloodRequestDto> requestBlood(@RequestBody BloodRequestDto dto) {
        return new ResponseEntity<>(bloodBankService.requestBlood(dto), HttpStatus.CREATED);
    }

    /**
     * Fulfill a RESERVED request — marks units as USED and request as COMPLETED.
     * Only valid when the request is in RESERVED status.
     */
    @PatchMapping("/requests/{id}/fulfill")
    public ResponseEntity<BloodRequestDto> fulfillRequest(@PathVariable Long id) {
        return ResponseEntity.ok(bloodBankService.fulfillRequest(id));
    }

    /**
     * Cancel a PENDING or RESERVED request.
     * If RESERVED, the allocated units are released back to AVAILABLE.
     */
    @PatchMapping("/requests/{id}/cancel")
    public ResponseEntity<BloodRequestDto> cancelRequest(@PathVariable Long id) {
        return ResponseEntity.ok(bloodBankService.cancelRequest(id));
    }
}

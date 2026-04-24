package com.hospital.hms.controller;

import com.hospital.hms.dto.PrescriptionDTO;
import com.hospital.hms.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/prescriptions")
public class PrescriptionController {
    private final PrescriptionService prescriptionService;

    @GetMapping
    public ResponseEntity<List<PrescriptionDTO>> getAllPrescriptions() {
        List<PrescriptionDTO> prescriptions = prescriptionService.getAllPrescriptions();
        return ResponseEntity.ok(prescriptions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> getPrescriptionById(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.getPrescriptionById(id);
        return ResponseEntity.ok(prescription);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByPatient(@PathVariable Long patientId) {
        List<PrescriptionDTO> prescriptions = prescriptionService.getPrescriptionsByPatient(patientId);
        return ResponseEntity.ok(prescriptions);
    }

    @PostMapping
    public ResponseEntity<PrescriptionDTO> createPrescription(@RequestBody PrescriptionDTO prescriptionDTO) {
        PrescriptionDTO createdPrescription = prescriptionService.createPrescription(prescriptionDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPrescription);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PrescriptionDTO> updatePrescription(
            @PathVariable Long id,
            @RequestBody PrescriptionDTO prescriptionDTO) {
        PrescriptionDTO updatedPrescription = prescriptionService.updatePrescription(id, prescriptionDTO);
        return ResponseEntity.ok(updatedPrescription);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePrescription(@PathVariable Long id) {
        prescriptionService.deletePrescription(id);
        return ResponseEntity.ok("Prescription deleted successfully");
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PrescriptionDTO>> getPrescriptionsByStatus(@PathVariable String status) {
        List<PrescriptionDTO> prescriptions = prescriptionService.getPrescriptionsByStatus(status);
        return ResponseEntity.ok(prescriptions);
    }

    @PutMapping("/{id}/dispense")
    public ResponseEntity<PrescriptionDTO> markAsDispensed(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.markAsDispensed(id);
        return ResponseEntity.ok(prescription);
    }

    @PutMapping("/{id}/partial-dispense")
    public ResponseEntity<PrescriptionDTO> markAsPartiallyDispensed(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.markAsPartiallyDispensed(id);
        return ResponseEntity.ok(prescription);
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<PrescriptionDTO> cancelPrescription(@PathVariable Long id) {
        PrescriptionDTO prescription = prescriptionService.cancelPrescription(id);
        return ResponseEntity.ok(prescription);
    }
}
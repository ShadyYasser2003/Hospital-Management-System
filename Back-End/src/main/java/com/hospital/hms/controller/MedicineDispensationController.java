package com.hospital.hms.controller;



import com.hospital.hms.dto.MedicineDispensationDto;
import com.hospital.hms.service.MedicineDispensationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/medicine-dispensations")
@RequiredArgsConstructor
public class MedicineDispensationController {
    private final MedicineDispensationService service;
    // Dispense medicine for a prescription
    @PostMapping()
    public ResponseEntity<MedicineDispensationDto> dispenseMedicine(@RequestBody MedicineDispensationDto request) {
        return ResponseEntity.ok(service.createNewMedicineDispensation(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicineDispensationDto> updateMedicineDispensation(@PathVariable Long id, @RequestBody MedicineDispensationDto dispensationDto){
        return ResponseEntity.ok(service.updateMedicineDispensation(id, dispensationDto));
    }
    @GetMapping("/{id}")
    public ResponseEntity<MedicineDispensationDto> getMedicineDispensationById(@PathVariable Long id){
        return ResponseEntity.ok(service.getMedicineDispensationById(id));
    }
    @GetMapping
    public ResponseEntity<List<MedicineDispensationDto>> getAllMedicineDispensations(){
        return ResponseEntity.ok(service.getAllMedicineDispensations());
    }
    @DeleteMapping("/{id}")
    public void deleteMedicineDispensation(@PathVariable Long id){
        service.deleteMedicineDispensation(id);
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<List<MedicineDispensationDto>> getDispensationsByPrescription(@PathVariable Long prescriptionId) {
        return ResponseEntity.ok(service.getDispensationByPrescription(prescriptionId));
    }
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<MedicineDispensationDto>> getDispensationsByPatient(@PathVariable Long patientId) {
        return ResponseEntity.ok(service.getDispensationByPatient(patientId));
    }

    @GetMapping("/pharmacist/{pharmacistId}")
    public ResponseEntity<List<MedicineDispensationDto>> getDispensationsByPharmacist(@PathVariable Long pharmacistId) {
        return ResponseEntity.ok(service.getDispensationByPharmacist(pharmacistId));
    }
    @PutMapping("/{id}/cancel")
    public ResponseEntity<MedicineDispensationDto> cancelDispensation(@PathVariable Long id) {
        return ResponseEntity.ok(service.cancelDispensation(id));
    }
    @GetMapping("/status/{status}")
    public ResponseEntity<List<MedicineDispensationDto>> getDispensationsByStatus(@PathVariable String status) {
        return ResponseEntity.ok(service.getDispensationByStatus(status));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MedicineDispensationDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        return ResponseEntity.ok(service.updateDispensationStatus(id, status));
    }

    @GetMapping("/date-range")
    public ResponseEntity<List<MedicineDispensationDto>> getDispensationsByDateRange(
            @RequestParam LocalDate startDate,
            @RequestParam LocalDate endDate) {
        return ResponseEntity.ok(service.getDispensationByDateRange(startDate, endDate));
    }
    @GetMapping("/pending")
    public ResponseEntity<List<MedicineDispensationDto>> getPendingDispensations() {
        return ResponseEntity.ok(service.getPendingDispensations());
    }

    @GetMapping("/today")
    public ResponseEntity<List<MedicineDispensationDto>> getTodayDispensations() {
        return ResponseEntity.ok(service.getTodayDispensations());
    }
    @GetMapping("/patient/{patientId}/charges")
    public ResponseEntity<Double> getTotalChargesByPatient(
            @PathVariable Long patientId,
            @RequestParam(required = false) LocalDate startDate,
            @RequestParam(required = false) LocalDate endDate) {
        return ResponseEntity.ok(service.getTotalChargesByPatient(patientId, startDate, endDate));
    }
}

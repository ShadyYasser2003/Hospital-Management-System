package com.hospital.hms.controller;

import com.hospital.hms.dto.BedDTO;
import com.hospital.hms.service.BedService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/beds")
public class BedController {
    private final BedService bedService;

    @GetMapping
    public ResponseEntity<List<BedDTO>> getAllBeds() {
        List<BedDTO> beds = bedService.getAllBeds();
        return ResponseEntity.ok(beds);
    }
    @GetMapping("/{id}")
    public ResponseEntity<BedDTO> getBedById(@PathVariable Long id) {
        BedDTO bed = bedService.getBedById(id);
        return ResponseEntity.ok(bed);
    }
    @GetMapping("/number/{bedNumber}")
    public ResponseEntity<BedDTO> getBedByNumber(@PathVariable String bedNumber) {
        BedDTO bed = bedService.getBedByNumber(bedNumber);
        return ResponseEntity.ok(bed);
    }
    @PostMapping
    public ResponseEntity<BedDTO> createBed(@RequestBody BedDTO bedDTO) {
        BedDTO createdBed = bedService.createBed(bedDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdBed);
    }
    @PutMapping("/{id}")
    public ResponseEntity<BedDTO> updateBed(
            @PathVariable Long id,
            @RequestBody BedDTO bedDTO) {
        BedDTO updatedBed = bedService.updateBed(id, bedDTO);
        return ResponseEntity.ok(updatedBed);
    }
    @PutMapping("/{bedId}/assign/{patientId}")
    public ResponseEntity<BedDTO> assignPatientToBed(
            @PathVariable Long bedId,
            @PathVariable Long patientId) {
        BedDTO updatedBed = bedService.assignPatientToBed(bedId, patientId);
        return ResponseEntity.ok(updatedBed);
    }
    @PutMapping("/{id}/release")
    public ResponseEntity<BedDTO> releasePatientFromBed(@PathVariable Long id) {
        BedDTO updatedBed = bedService.releasePatientFromBed(id);
        return ResponseEntity.ok(updatedBed);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBed(@PathVariable Long id) {
        bedService.deleteBed(id);
        return ResponseEntity.ok("Bed deleted successfully");
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BedDTO>> getBedsByStatus(@PathVariable String status) {
        List<BedDTO> beds = bedService.getBedsByStatus(status);
        return ResponseEntity.ok(beds);
    }
    @GetMapping("/ward/{wardName}")
    public ResponseEntity<List<BedDTO>> getBedsByWard(@PathVariable String wardName) {
        List<BedDTO> beds = bedService.getBedsByWard(wardName);
        return ResponseEntity.ok(beds);
    }
    @PutMapping("/{id}/maintenance")
    public ResponseEntity<BedDTO> setMaintenanceMode(@PathVariable Long id) {
        BedDTO updatedBed = bedService.setMaintenanceMode(id);
        return ResponseEntity.ok(updatedBed);
    }
}

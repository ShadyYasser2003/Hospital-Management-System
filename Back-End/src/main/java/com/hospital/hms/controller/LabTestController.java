package com.hospital.hms.controller;

import com.hospital.hms.dto.LabTestDto;
import com.hospital.hms.service.LabTestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/lab-tests")
@RequiredArgsConstructor
public class LabTestController {
    private final LabTestService labTestService;

    @GetMapping
    public ResponseEntity<List<LabTestDto>> getAllLabTests() {
        return ResponseEntity.ok(labTestService.getAllLabTests());
    }

    @GetMapping("/{id}")
    public ResponseEntity<LabTestDto> getLabTestById(@PathVariable Long id) {
        return ResponseEntity.ok(labTestService.getLabTestById(id));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<LabTestDto>> getLabTestsByPatient(
            @PathVariable Long patientId) {
        return ResponseEntity.ok(labTestService.getLabTestsByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<LabTestDto>> getLabTestsByDoctor(
            @PathVariable Long doctorId) {
        return ResponseEntity.ok(labTestService.getLabTestsByDoctor(doctorId));
    }

    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<List<LabTestDto>> getLabTestsByTechnician(
            @PathVariable Long technicianId) {
        return ResponseEntity.ok(labTestService.getLabTestsByTechnician(technicianId));
    }

    @GetMapping("/status")
    public ResponseEntity<List<LabTestDto>> getLabTestsByStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(labTestService.getLabTestsByStatus(status));
    }

    @GetMapping("/type")
    public ResponseEntity<List<LabTestDto>> getLabTestsByType(
            @RequestParam String testType) {
        return ResponseEntity.ok(labTestService.getLabTestsByType(testType));
    }

    @GetMapping("/critical")
    public ResponseEntity<List<LabTestDto>> getCriticalLabTests() {
        return ResponseEntity.ok(labTestService.getCriticalLabTests());
    }
    @GetMapping("/patient/{patientId}/status")
    public ResponseEntity<List<LabTestDto>> getLabTestsByPatientAndStatus(
            @PathVariable Long patientId,
            @RequestParam String status) {
        return ResponseEntity.ok(
                labTestService.getLabTestsByPatientAndStatus(patientId, status));
    }
    @PostMapping
    public ResponseEntity<LabTestDto> createLabTest(@RequestBody LabTestDto labTestDto) {
        return new ResponseEntity<>(
                labTestService.createLabTest(labTestDto), HttpStatus.CREATED);
    }
    @PutMapping("/{id}")
    public ResponseEntity<LabTestDto> updateLabTest(
            @PathVariable Long id,
            @RequestBody LabTestDto labTestDto) {
        return ResponseEntity.ok(labTestService.updateLabTest(id, labTestDto));
    }
    @PatchMapping("/{id}/assign-technician")
    public ResponseEntity<LabTestDto> assignTechnician(
            @PathVariable Long id,
            @RequestParam Long technicianId) {
        return ResponseEntity.ok(labTestService.assignTechnician(id, technicianId));
    }
    @PatchMapping("/{id}/result")
    public ResponseEntity<LabTestDto> enterResult(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {
        String result         = (String)  body.get("result");
        String notes          = (String)  body.get("notes");
        String referenceRange = (String)  body.get("referenceRange");
        Boolean isCritical    = body.get("isCritical") != null
                ? (Boolean) body.get("isCritical") : false;
        return ResponseEntity.ok(
                labTestService.enterResult(id, result, notes, referenceRange, isCritical));
    }
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteLabTest(@PathVariable Long id) {
        labTestService.deleteLabTest(id);
        return ResponseEntity.noContent().build();
    }

}

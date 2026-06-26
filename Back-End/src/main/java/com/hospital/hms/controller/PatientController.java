package com.hospital.hms.controller;

import com.hospital.hms.dto.PatientDTO;
import com.hospital.hms.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/patients")
@RequiredArgsConstructor
public class PatientController {
    private final PatientService patientService;


    @GetMapping
    public ResponseEntity<List<PatientDTO>> getAllPatients() {
        List<PatientDTO> patients = patientService.getAllPatients();
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }

    @GetMapping("/national-id/{nationalId}")
    public ResponseEntity<PatientDTO> getPatientByNationalId(@PathVariable String nationalId) {
        PatientDTO patient = patientService.getPatientByNationalId(nationalId);
        return ResponseEntity.ok(patient);
    }

    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(@RequestBody PatientDTO patientDTO) {
        PatientDTO createdPatient = patientService.createPatient(patientDTO);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdPatient);
    }

    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> updatePatient(
            @PathVariable Long id,
            @RequestBody PatientDTO patientDTO) {
        PatientDTO updatedPatient = patientService.updatePatient(id, patientDTO);
        return ResponseEntity.ok(updatedPatient);
    }

    @PutMapping("/{id}/vitals")
    public ResponseEntity<PatientDTO> updatePatientVitals(
            @PathVariable Long id,
            @RequestBody PatientDTO patientDTO) {
        PatientDTO updatedPatient = patientService.updatePatientVitals(id, patientDTO);
        return ResponseEntity.ok(updatedPatient);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        return ResponseEntity.ok("Patient deleted successfully");
    }

    @GetMapping("/search")
    public ResponseEntity<List<PatientDTO>> searchPatients(@RequestParam String query) {
        List<PatientDTO> patients = patientService.searchPatients(query);
        return ResponseEntity.ok(patients);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<PatientDTO>> getPatientsByStatus(@PathVariable String status) {
        List<PatientDTO> patients = patientService.getPatientsByStatus(status);
        return ResponseEntity.ok(patients);
    }

}

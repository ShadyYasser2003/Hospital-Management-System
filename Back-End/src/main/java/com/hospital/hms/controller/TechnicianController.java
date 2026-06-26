package com.hospital.hms.controller;

import com.hospital.hms.dto.TechnicianDto;
import com.hospital.hms.service.TechnicianService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/technicians")
@RequiredArgsConstructor
public class TechnicianController {
    private final TechnicianService technicianService;


    @GetMapping
    public ResponseEntity<List<TechnicianDto>> getAllTechnicians() {
        return ResponseEntity.ok(technicianService.getAllTechnicians());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TechnicianDto> getTechnicianById(@PathVariable Long id) {
        return ResponseEntity.ok(technicianService.getTechnicianById(id));
    }

    @GetMapping("/nationalId")
    public ResponseEntity<TechnicianDto> getTechnicianByNationalId(@RequestParam String nationalId) {
        return ResponseEntity.ok(technicianService.getTechnicianByNationalId(nationalId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<TechnicianDto>> getTechniciansByName(
            @RequestParam String name) {
        return ResponseEntity.ok(technicianService.getTechniciansByName(name));
    }

    @GetMapping("/specialization")
    public ResponseEntity<List<TechnicianDto>> getTechniciansBySpecialization(
            @RequestParam String specialization) {
        return ResponseEntity.ok(
                technicianService.getTechniciansBySpecialization(specialization));
    }

    @GetMapping("/employmentStatus")
    public ResponseEntity<List<TechnicianDto>> getTechniciansByEmploymentStatus(
            @RequestParam String status) {
        return ResponseEntity.ok(
                technicianService.getTechniciansByEmploymentStatus(status));
    }
    @GetMapping("/department/{departmentId}")
    public ResponseEntity<List<TechnicianDto>> getTechniciansByDepartment(
            @PathVariable Long departmentId) {
        return ResponseEntity.ok(
                technicianService.getTechniciansByDepartment(departmentId));
    }

    @PostMapping
    public ResponseEntity<TechnicianDto> createTechnician(
            @RequestBody TechnicianDto technicianDto) {
        return new ResponseEntity<>(
                technicianService.createTechnician(technicianDto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TechnicianDto> updateTechnician(
            @PathVariable Long id,
            @RequestBody TechnicianDto technicianDto) {
        return ResponseEntity.ok(technicianService.updateTechnician(id, technicianDto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTechnician(@PathVariable Long id) {
        technicianService.deleteTechnician(id);
        return ResponseEntity.noContent().build();
    }


}
